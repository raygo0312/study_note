const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { findMdrFiles } = require('./project-compiler');
const { compile, escapeHtml } = require('./compiler');
const { transformMathLine } = require('./math');
const { resolveDocument } = require('./tag-definitions');
const { parseBlockTagStart, parseDescriptor } = require('./tag-syntax');

const CODE_FENCE_PATTERN = /^\s*```/;
const TAG_END_PATTERN = /^:::[ \t]*$/;

function unquote(value) {
  return value.trim().replace(/^("|')(.*)\1$/, '$2');
}

function parseFrontmatter(source) {
  const match = /^(?:\uFEFF)?---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source);
  if (!match) return { attributes: {}, body: source };

  const attributes = {};
  const breadcrumbs = [];
  let currentBreadcrumb;
  for (const line of match[1].split(/\r?\n/)) {
    const property = /^([\w-]+):\s*(.*)$/.exec(line);
    if (property) {
      const [, key, value] = property;
      if (key === 'title' || key === 'layout') attributes[key] = unquote(value);
      continue;
    }
    const breadcrumbValue = /^\s*-\s+(href|label):\s*(.*)$/.exec(line);
    if (breadcrumbValue) {
      const [, key, value] = breadcrumbValue;
      currentBreadcrumb ??= {};
      currentBreadcrumb[key] = unquote(value);
      if (currentBreadcrumb.href && currentBreadcrumb.label) {
        breadcrumbs.push(currentBreadcrumb);
        currentBreadcrumb = undefined;
      }
      continue;
    }
    const breadcrumbProperty = /^\s+(href|label):\s*(.*)$/.exec(line);
    if (breadcrumbProperty && currentBreadcrumb) {
      const [, key, value] = breadcrumbProperty;
      currentBreadcrumb[key] = unquote(value);
      if (currentBreadcrumb.href && currentBreadcrumb.label) {
        breadcrumbs.push(currentBreadcrumb);
        currentBreadcrumb = undefined;
      }
    }
  }
  if (breadcrumbs.length > 0) attributes.breadcrumbs = breadcrumbs;
  return { attributes, body: source.slice(match[0].length) };
}

function transformInlineMdr(line) {
  const parts = [];
  let cursor = 0;
  const codePattern = /`[^`\n]+`/g;
  let match;
  while ((match = codePattern.exec(line)) !== null) {
    parts.push(line.slice(cursor, match.index)
      .replace(/(?<![\\*])\*([^*\n]+?)(?<!\\)\*(?!\*)/g, '<dfn>$1</dfn>'));
    parts.push(match[0]);
    cursor = match.index + match[0].length;
  }
  parts.push(line.slice(cursor)
    .replace(/(?<![\\*])\*([^*\n]+?)(?<!\\)\*(?!\*)/g, '<dfn>$1</dfn>'));
  return parts.join('').replace(/:([a-z][a-z0-9-]*(?:[.#][a-zA-Z_][\w-]*)*)\[([^\]\n]*)\]/g,
    (_, descriptorSource, content) => {
      const descriptor = parseDescriptor(descriptorSource);
      const attributes = [
        descriptor.classes.length ? ` class="${escapeHtml(descriptor.classes.join(' '))}"` : '',
        descriptor.id ? ` id="${escapeHtml(descriptor.id)}"` : '',
      ].join('');
      return `<${descriptor.name}${attributes}>${transformInlineMdr(content)}</${descriptor.name}>`;
    });
}

function findBlockTagEnd(lines, start) {
  let depth = 1;
  let inFence = false;
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (CODE_FENCE_PATTERN.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const tag = parseBlockTagStart(line);
    if (tag && !tag.void) depth += 1;
    else if (TAG_END_PATTERN.test(line)) depth -= 1;
    if (depth === 0) return index;
  }
  return -1;
}

function transformMarkdownLine(line, state) {
  if (CODE_FENCE_PATTERN.test(line)) {
    state.inFence = !state.inFence;
    state.orderedNumber = 0;
    return line;
  }
  if (state.inFence) return line;

  const orderedItem = /^([ \t]*)\+\s+(.*)$/.exec(line);
  if (orderedItem) {
    state.orderedNumber += 1;
    return `${orderedItem[1]}${state.orderedNumber}. ${orderedItem[2]}`;
  }
  if (line.trim() === '') state.orderedNumber = 0;
  return transformInlineMdr(transformMathLine(line, { markdown: true }));
}

function transformMdrToMarkdown(source, options = {}) {
  const { body } = parseFrontmatter(source);
  const lines = body.split(/\r?\n/);
  const output = [];
  const state = { inFence: false, orderedNumber: 0 };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const tag = parseBlockTagStart(line);
    if (tag) {
      if (tag.void) {
        output.push(compile(line, options));
        continue;
      }
      const end = findBlockTagEnd(lines, index);
      if (end === -1) throw new Error(`Unclosed tag: ${tag.descriptor.name}`);
      output.push(compile(lines.slice(index, end + 1).join('\n'), options));
      output.push('');
      index = end;
      continue;
    }

    output.push(transformMarkdownLine(line, state));
  }

  return output.join('\n');
}

function routePattern(relativePage) {
  const normalized = relativePage.replaceAll(path.sep, '/').replace(/\.mdr$/, '');
  if (normalized === 'index') return '/';
  if (normalized.endsWith('/index')) return `/${normalized.slice(0, -6)}`;
  return `/${normalized}`;
}

function jsonAttribute(value, fallback) {
  return JSON.stringify(value ?? fallback);
}

function escapeAstroStaticHtml(html) {
  return html.replaceAll('{', '&#123;').replaceAll('}', '&#125;');
}

function createGeneratedPage({ sourcePath, generatedPath, html, attributes }) {
  const imports = [];
  const staticHtml = escapeAstroStaticHtml(html);
  let pageTemplate = staticHtml;
  if (attributes.layout) {
    const layoutPath = path.resolve(path.dirname(sourcePath), attributes.layout);
    let relativeLayout = path.relative(path.dirname(generatedPath), layoutPath)
      .replaceAll(path.sep, '/');
    if (!relativeLayout.startsWith('.')) relativeLayout = `./${relativeLayout}`;
    imports.push(`import Layout from ${JSON.stringify(relativeLayout)};`);
    pageTemplate = `<Layout title={${jsonAttribute(attributes.title, '')}} breadcrumbs={${jsonAttribute(attributes.breadcrumbs, [])}}>\n${staticHtml}\n</Layout>`;
  }
  return `---\n${imports.join('\n')}\n---\n${pageTemplate}\n`;
}

async function generatePages(root, pagesDirectory, markdownProcessor) {
  const pagesRoot = path.resolve(root, pagesDirectory);
  if (!fs.existsSync(pagesRoot)) return [];
  // Keep generated modules outside Astro's own .astro directory. Astro may
  // recreate that directory during startup after the integration hook runs.
  const generatedRoot = path.join(root, '.mdr-generated');
  fs.rmSync(generatedRoot, { recursive: true, force: true });
  const generated = [];
  for (const relativePage of findMdrFiles(pagesRoot)) {
    const sourcePath = path.join(pagesRoot, relativePage);
    const generatedRelative = relativePage.replace(/\.mdr$/, '');
    const generatedPath = path.join(generatedRoot, `${generatedRelative}.astro`);
    const document = resolveDocument(sourcePath);
    const { attributes, body } = parseFrontmatter(document.source);
    const markdown = transformMdrToMarkdown(body, {
      tagDefinitions: document.definitions,
    });
    const rendered = await markdownProcessor.render(markdown, {
      fileURL: pathToFileURL(sourcePath),
      frontmatter: attributes,
    });
    fs.mkdirSync(path.dirname(generatedPath), { recursive: true });
    fs.writeFileSync(generatedPath, createGeneratedPage({
      sourcePath, generatedPath, html: rendered.code, attributes,
    }));
    generated.push({ pattern: routePattern(relativePage), entrypoint: generatedPath });
  }
  return generated;
}

function mdr(options = {}) {
  const pagesDirectory = options.pagesDirectory || 'src/pages';
  return {
    name: 'mdr-astro',
    hooks: {
      'astro:config:setup': async ({ config, injectRoute, updateConfig, logger }) => {
        const root = new URL(config.root).pathname;
        const { createMarkdownProcessor } = await import('@astrojs/markdown-remark');
        const markdownProcessor = await createMarkdownProcessor(config.markdown);
        const registerPages = () => generatePages(root, pagesDirectory, markdownProcessor);
        for (const page of await registerPages()) injectRoute(page);
        updateConfig({
          vite: {
            plugins: [{
              name: 'mdr-astro-hmr',
              async handleHotUpdate(context) {
                if (!context.file.endsWith('.mdr')) return;
                await registerPages();
                context.server.ws.send({ type: 'full-reload', path: '*' });
                return [];
              },
            }],
          },
        });
        logger?.info('mdr-astro', `registered pages from ${pagesDirectory}`);
      },
    },
  };
}

module.exports = {
  mdr,
  default: mdr,
  parseFrontmatter,
  transformMdrToMarkdown,
  routePattern,
  createGeneratedPage,
  escapeAstroStaticHtml,
};
