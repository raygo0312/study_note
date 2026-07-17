const fs = require('node:fs');
const path = require('node:path');
const { findMdrFiles } = require('./project-compiler');

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

function transformMdrToMarkdown(source) {
  const { body } = parseFrontmatter(source);
  const lines = body.split(/\r?\n/);
  let inFence = false;
  let orderedNumber = 0;

  return lines.map((line) => {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      orderedNumber = 0;
      return line;
    }
    if (inFence) return line;

    const orderedItem = /^([ \t]*)\+\s+(.*)$/.exec(line);
    if (orderedItem) {
      orderedNumber += 1;
      return `${orderedItem[1]}${orderedNumber}. ${orderedItem[2]}`;
    }
    if (line.trim() === '') orderedNumber = 0;

    // MDR uses one pair of asterisks for bold; Markdown uses two.
    return line.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1**$2**');
  }).join('\n');
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

function createGeneratedPage({ sourcePath, generatedPath, markdownPath, attributes }) {
  const imports = [];
  let layoutElement = '<Content />';
  if (attributes.layout) {
    const layoutPath = path.resolve(path.dirname(sourcePath), attributes.layout);
    let relativeLayout = path.relative(path.dirname(generatedPath), layoutPath)
      .replaceAll(path.sep, '/');
    if (!relativeLayout.startsWith('.')) relativeLayout = `./${relativeLayout}`;
    imports.push(`import Layout from ${JSON.stringify(relativeLayout)};`);
    layoutElement = `<Layout title={${jsonAttribute(attributes.title, '')}} breadcrumbs={${jsonAttribute(attributes.breadcrumbs, [])}}><Content /></Layout>`;
  }
  imports.push(`import { Content } from ${JSON.stringify(`./${path.basename(markdownPath)}`)};`);
  return `---\n${imports.join('\n')}\n---\n${layoutElement}\n`;
}

function generatePages(root, pagesDirectory) {
  const pagesRoot = path.resolve(root, pagesDirectory);
  if (!fs.existsSync(pagesRoot)) return [];
  // Keep generated modules outside Astro's own .astro directory. Astro may
  // recreate that directory during startup after the integration hook runs.
  const generatedRoot = path.join(root, '.mdr-generated');
  const generated = [];
  for (const relativePage of findMdrFiles(pagesRoot)) {
    const sourcePath = path.join(pagesRoot, relativePage);
    const generatedRelative = relativePage.replace(/\.mdr$/, '');
    const generatedPath = path.join(generatedRoot, `${generatedRelative}.astro`);
    const markdownPath = path.join(generatedRoot, `${generatedRelative}.md`);
    const { attributes } = parseFrontmatter(fs.readFileSync(sourcePath, 'utf8'));
    fs.mkdirSync(path.dirname(generatedPath), { recursive: true });
    fs.writeFileSync(markdownPath, transformMdrToMarkdown(fs.readFileSync(sourcePath, 'utf8')));
    fs.writeFileSync(generatedPath, createGeneratedPage({
      sourcePath, generatedPath, markdownPath, attributes,
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
      'astro:config:setup': ({ config, injectRoute, updateConfig, logger }) => {
        const root = new URL(config.root).pathname;
        const registerPages = () => generatePages(root, pagesDirectory);
        for (const page of registerPages()) injectRoute(page);
        updateConfig({
          vite: {
            plugins: [{
              name: 'mdr-astro-hmr',
              handleHotUpdate(context) {
                if (!context.file.endsWith('.mdr')) return;
                registerPages();
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
};
