const fs = require('node:fs');
const path = require('node:path');
const { fileURLToPath, pathToFileURL } = require('node:url');
const { findMdrFiles } = require('./project-compiler');
const { compile, escapeHtml, parseSource, render, restoreMath } = require('./compiler');
const { highlightCodeBlocks } = require('./code-highlight');
const {
  PROTECTED_MATH_ASTERISK, PROTECTED_MATH_CLOSE_BRACKET,
  PROTECTED_MATH_OPEN_BRACKET, transformMathLine,
} = require('./math');
const { resolveDocument } = require('./tag-definitions');
const { parseBlockTagStart } = require('./tag-syntax');
const { lexInline } = require('./lexer');
const { parseInline } = require('./parser');
const { parseFrontmatter } = require('./frontmatter');
const { matchCodeFence, splitSourceLines } = require('./source-syntax');
const {
  buildTermDictionary, relativizeTermDictionary, resolveTermHref,
} = require('./term-dictionary');

const TAG_END_PATTERN = /^\s*:::[ \t]*$/;
const LIST_ITEM_PATTERN = /^[ \t]*[+-][ \t]+/;
const isMdrSourceFile = (file) => file.endsWith('.mdr') || file.endsWith('.mdrdef');

function transformInlineNodes(nodes, insideHtml = false, options = {}, allowTermLinks = true) {
  const output = [];
  for (const node of nodes) {
    if (node.type === 'text') {
      output.push(insideHtml ? escapeHtml(node.value) : node.value);
    } else if (node.type === 'escape') {
      output.push(insideHtml ? escapeHtml(node.value) : `\\${node.value}`);
    } else if (node.type === 'strong') {
      output.push(`<dfn id="define${options.termIdState.next++}">${
        transformInlineNodes(node.children, true, options, false)
      }</dfn>`);
    } else if (node.type === 'code') {
      const value = node.children.map((child) => child.value).join('');
      output.push(insideHtml ? `<code>${escapeHtml(value)}</code>` : `\`${value}\``);
    } else if (node.type === 'line-break') {
      output.push('<br>');
    } else if (node.type === 'link') {
      let label = transformInlineNodes(node.children, insideHtml, options, false);
      const destination = resolveTermHref(node.destination, options.termDictionary);
      // ラベルを省いたリンクは、宛先ページのタイトルで補う。手で書いた見出しが
      // ページ側の変更に置いていかれるのを防ぐ。
      if (label === '') {
        const title = options.pageTitles?.[destination];
        if (title === undefined) {
          throw new Error(`Link with no label must point at a known page: ${node.destination}`);
        }
        label = insideHtml ? escapeHtml(title) : title;
      }
      output.push(insideHtml
        ? `<a href="${escapeHtml(destination)}">${label}</a>`
        : `[${label}](${destination})`);
    } else if (node.type === 'inline-tag') {
      const attributes = [
        node.classes.length ? ` class="${escapeHtml(node.classes.join(' '))}"` : '',
        node.id ? ` id="${escapeHtml(node.id)}"` : '',
      ].join('');
      output.push(`<${node.name}${attributes}>${
        transformInlineNodes(node.children, true, options, allowTermLinks)
      }</${node.name}>`);
    } else {
      throw new Error(`Unknown inline node: ${node.type}`);
    }
  }
  return output.join('');
}


function routePattern(relativePage) {
  const normalized = relativePage.replaceAll(path.sep, '/').replace(/\.mdr$/, '');
  if (normalized === 'index') return '/';
  if (normalized.endsWith('/index')) return `/${normalized.slice(0, -6)}`;
  return `/${normalized}`;
}

function routeFilePath(pattern) {
  return pattern === '/' ? 'index.html' : `${pattern.replace(/^\//, '')}.html`;
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

// リンクは現在ページからの相対パスで書かれるので、辞書の側を合わせる。
function relativizePageTitles(pageTitles, fromFile) {
  const fromDirectory = path.posix.dirname(fromFile.replaceAll(path.sep, '/'));
  const entries = {};
  for (const [href, title] of pageTitles) {
    let relative = path.posix.relative(fromDirectory, href.replace(/^\//, ''));
    if (!relative.startsWith('.')) relative = `./${relative}`;
    entries[relative] = title;
    entries[href] = title;
  }
  return entries;
}

async function generatePages(root, pagesDirectory, codeTheme) {
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
  fs.mkdirSync(generatedRoot, { recursive: true });
  const documents = pages.map(({ relativePage, pattern }) => {
    const sourcePath = path.join(pagesRoot, relativePage);
    const document = resolveDocument(sourcePath, undefined, { pagesRoot });
    const parsed = parseFrontmatter(document.source);
    return { relativePage, pattern, sourcePath, document, ...parsed };
  });
  const termDictionary = buildTermDictionary(documents.map(({ body, pattern, sourcePath }) => ({
    source: body,
    href: routeFilePath(pattern),
    sourcePath,
  })));
  fs.writeFileSync(path.join(generatedRoot, 'definitions.json'), `${JSON.stringify(
    Object.fromEntries(termDictionary.terms.map((term) => [term, termDictionary.entries[term].href])),
    null,
    2,
  )}\n`);
  // 宛先からタイトルを引く辞書。用語辞書と同じく全ページを見てから各ページを描く。
  const pageTitles = new Map(documents
    .filter(({ attributes }) => typeof attributes?.title === 'string' && attributes.title !== '')
    .map(({ pattern, attributes }) => [routeFilePath(pattern), attributes.title]));
  const generated = [];
  for (const { relativePage, pattern, sourcePath, attributes, body, document } of documents) {
    const generatedRelative = relativePage.replace(/\.mdr$/, '');
    const generatedPath = path.join(generatedRoot, `${generatedRelative}.astro`);
    const pageTermDictionary = relativizeTermDictionary(termDictionary, routeFilePath(pattern));
    // MDR だけで HTML まで組み立てる。見出し・リスト・段落はタグへの置き換えで
    // 足り、コードフェンスは Shiki を直接呼ぶので、Markdown 処理系は要らない。
    const renderOptions = {
      tagDefinitions: document.definitions,
      termDictionary: pageTermDictionary,
      pageTitles: relativizePageTitles(pageTitles, routeFilePath(pattern)),
    };
    const ast = parseSource(body);
    renderOptions.highlightedCode = await highlightCodeBlocks(ast, { theme: codeTheme });
    const html = restoreMath(render(ast, renderOptions));
    fs.mkdirSync(path.dirname(generatedPath), { recursive: true });
    fs.writeFileSync(generatedPath, createGeneratedPage({
      sourcePath, generatedPath, html, attributes,
    }));
    generated.push({ pattern, entrypoint: generatedPath });
  }
  // ページの一覧はクライアント script でも使うので、タイトルを添えて返す。
  const catalog = documents.map(({ relativePage, attributes }) => ({
    path: relativePage.split(path.sep).join('/'),
    title: typeof attributes?.title === 'string' ? attributes.title : '',
  }));
  return { routes: generated, catalog };
}

function mdr(options = {}) {
  const pagesDirectory = options.pagesDirectory || 'src/pages';
  return {
    name: 'mdr-astro',
    hooks: {
      'astro:config:setup': async ({ config, injectRoute, updateConfig, logger }) => {
        const root = fileURLToPath(config.root);
        const codeTheme = config.markdown?.shikiConfig?.theme || 'one-dark-pro';
        const { routes, catalog } = await generatePages(root, pagesDirectory, codeTheme);
        for (const route of routes) injectRoute(route);
        updateConfig({
          vite: {
            define: {
              // ページの一覧をクライアント script へ渡す。パスとタイトルだけなので、
              // `.mdr` の中身がバンドルへ持ち込まれることはない。
              __MDR_PAGES__: JSON.stringify(catalog),
            },
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
  routePattern,
  routeFilePath,
  createGeneratedPage,
  escapeAstroStaticHtml,
  isMdrSourceFile,
};
