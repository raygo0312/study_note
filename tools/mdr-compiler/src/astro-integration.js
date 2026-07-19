const fs = require('node:fs');
const path = require('node:path');
const { fileURLToPath, pathToFileURL } = require('node:url');
const { findMdrFiles } = require('./project-compiler');
const { compile, escapeHtml } = require('./compiler');
const { PROTECTED_MATH_ASTERISK, transformMathLine } = require('./math');
const { resolveDocument } = require('./tag-definitions');
const { parseBlockTagStart } = require('./tag-syntax');
const { lexInline } = require('./lexer');
const { parseInline } = require('./parser');
const { parseFrontmatter } = require('./frontmatter');
const { matchCodeFence, splitSourceLines } = require('./source-syntax');

const TAG_END_PATTERN = /^\s*:::[ \t]*$/;
const LIST_ITEM_PATTERN = /^[ \t]*[+-][ \t]+/;
const isMdrSourceFile = (file) => file.endsWith('.mdr') || file.endsWith('.mdrdef');

function transformInlineNodes(nodes, insideHtml = false) {
  const output = [];
  for (const node of nodes) {
    if (node.type === 'text') {
      output.push(insideHtml ? escapeHtml(node.value) : node.value);
    } else if (node.type === 'escape') {
      output.push(insideHtml ? escapeHtml(node.value) : `\\${node.value}`);
    } else if (node.type === 'strong') {
      output.push(`<dfn>${transformInlineNodes(node.children, true)}</dfn>`);
    } else if (node.type === 'code') {
      const value = node.children.map((child) => child.value).join('');
      output.push(insideHtml ? `<code>${escapeHtml(value)}</code>` : `\`${value}\``);
    } else if (node.type === 'line-break') {
      output.push('<br>');
    } else if (node.type === 'link') {
      const label = transformInlineNodes(node.children, insideHtml);
      output.push(insideHtml
        ? `<a href="${escapeHtml(node.destination)}">${label}</a>`
        : `[${label}](${node.destination})`);
    } else if (node.type === 'inline-tag') {
      const attributes = [
        node.classes.length ? ` class="${escapeHtml(node.classes.join(' '))}"` : '',
        node.id ? ` id="${escapeHtml(node.id)}"` : '',
      ].join('');
      output.push(`<${node.name}${attributes}>${
        transformInlineNodes(node.children, true)
      }</${node.name}>`);
    } else {
      throw new Error(`Unknown inline node: ${node.type}`);
    }
  }
  return output.join('');
}

function transformInlineMdr(line) {
  return transformInlineNodes(parseInline(lexInline(line, 0, 1, 1)));
}

function findBlockTagEnd(lines, start) {
  let depth = 1;
  let inFence = false;
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index];
    const fence = matchCodeFence(line, inFence);
    if (fence) {
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
  const fence = matchCodeFence(line, state.inFence);
  if (fence) {
    state.inFence = !state.inFence;
    return line;
  }
  if (state.inFence) return line;
  return transformInlineMdr(transformMathLine(line, { markdown: true, protectMdr: true }));
}

function transformMdrToMarkdown(source, options = {}) {
  const { body } = parseFrontmatter(source);
  const lines = splitSourceLines(body).map(({ text }) => text);
  const output = [];
  const state = { inFence: false };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const fence = matchCodeFence(line, state.inFence);
    if (state.inFence || fence) {
      output.push(transformMarkdownLine(line, state));
      continue;
    }
    const tag = parseBlockTagStart(line);
    if (tag) {
      if (tag.void) {
        output.push(compile(line, options));
        continue;
      }
      const end = findBlockTagEnd(lines, index);
      if (end === -1) {
        throw new Error(`Unclosed tag ${tag.descriptor.name} at ${index + 1}:1`);
      }
      output.push(compile(lines.slice(index, end + 1).join('\n'), options));
      output.push('');
      index = end;
      continue;
    }

    if (LIST_ITEM_PATTERN.test(line)) {
      let end = index + 1;
      while (end < lines.length && LIST_ITEM_PATTERN.test(lines[end])) end += 1;
      output.push(compile(lines.slice(index, end).join('\n'), options));
      if (end < lines.length && lines[end].trim() !== '') output.push('');
      index = end - 1;
      continue;
    }

    output.push(transformMarkdownLine(line, state));
  }

  if (state.inFence) throw new Error('Unclosed code fence');

  return output.join('\n').replaceAll(PROTECTED_MATH_ASTERISK, '*');
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
    const pageScripts = (attributes.scripts || []).map((scriptPath) => {
      const absoluteScript = path.resolve(path.dirname(sourcePath), scriptPath);
      let relativeScript = path.relative(path.dirname(generatedPath), absoluteScript)
        .replaceAll(path.sep, '/');
      if (!relativeScript.startsWith('.')) relativeScript = `./${relativeScript}`;
      return `<script>import ${JSON.stringify(relativeScript)};</script>`;
    }).join('\n');
    const scriptSlot = pageScripts
      ? `\n<Fragment slot="page-scripts">\n${pageScripts}\n</Fragment>` : '';
    pageTemplate = `<Layout title={${jsonAttribute(attributes.title, '')}} breadcrumbs={${jsonAttribute(attributes.breadcrumbs, [])}}>\n${staticHtml}${scriptSlot}\n</Layout>`;
  }
  return `---\n${imports.join('\n')}\n---\n${pageTemplate}\n`;
}

async function generatePages(root, pagesDirectory, markdownProcessor) {
  const pagesRoot = path.resolve(root, pagesDirectory);
  if (!fs.existsSync(pagesRoot)) return [];
  const pages = findMdrFiles(pagesRoot).map((relativePage) => ({
    relativePage,
    pattern: routePattern(relativePage),
  }));
  const routeSources = new Map();
  for (const { relativePage, pattern } of pages) {
    if (routeSources.has(pattern)) {
      throw new Error(`MDR route collision: ${routeSources.get(pattern)} and ${relativePage}`);
    }
    routeSources.set(pattern, relativePage);
  }
  // Keep generated modules outside Astro's own .astro directory. Astro may
  // recreate that directory during startup after the integration hook runs.
  const generatedRoot = path.join(root, '.mdr-generated');
  fs.rmSync(generatedRoot, { recursive: true, force: true });
  const generated = [];
  for (const { relativePage, pattern } of pages) {
    const sourcePath = path.join(pagesRoot, relativePage);
    const generatedRelative = relativePage.replace(/\.mdr$/, '');
    const generatedPath = path.join(generatedRoot, `${generatedRelative}.astro`);
    const document = resolveDocument(sourcePath, undefined, { pagesRoot });
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
    generated.push({ pattern, entrypoint: generatedPath });
  }
  return generated;
}

function mdr(options = {}) {
  const pagesDirectory = options.pagesDirectory || 'src/pages';
  return {
    name: 'mdr-astro',
    hooks: {
      'astro:config:setup': async ({ config, injectRoute, updateConfig, logger }) => {
        const root = fileURLToPath(config.root);
        const { createMarkdownProcessor } = await import('@astrojs/markdown-remark');
        const markdownProcessor = await createMarkdownProcessor(config.markdown);
        const registerPages = () => generatePages(root, pagesDirectory, markdownProcessor);
        for (const page of await registerPages()) injectRoute(page);
        updateConfig({
          vite: {
            plugins: [{
              name: 'mdr-astro-hmr',
              async handleHotUpdate(context) {
                if (!isMdrSourceFile(context.file)) return;
                await context.server.restart();
                return [];
              },
            }],
          },
        });
        logger?.info(`registered pages from ${pagesDirectory}`);
      },
    },
  };
}

module.exports = {
  mdr,
  default: mdr,
  parseFrontmatter,
  transformInlineMdr,
  transformMdrToMarkdown,
  routePattern,
  createGeneratedPage,
  escapeAstroStaticHtml,
  isMdrSourceFile,
};
