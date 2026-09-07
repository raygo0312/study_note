'use strict';

// コードフェンスの着色。Shiki を直接呼ぶので、Markdown 処理系を通さずに済む。
// クラス名は astro-code のままにしてある。既存の CSS と、コピーボタンを付ける
// レイアウト側の判定がこの名前を見ているため。

const { parse } = require('./parser');
const { escapeHtml } = require('./compiler');

const DEFAULT_THEME = 'one-dark-pro';

let highlighterPromise;

async function getHighlighter(theme) {
  if (!highlighterPromise) {
    const { createHighlighter, bundledLanguages } = require('shiki');
    highlighterPromise = createHighlighter({
      themes: [theme],
      langs: Object.keys(bundledLanguages),
    });
  }
  return highlighterPromise;
}

function collectCodeBlocks(nodes, found = []) {
  for (const node of nodes) {
    if (node.type === 'code-block') found.push(node);
    else if (node.children) collectCodeBlocks(node.children, found);
    else if (node.items) for (const item of node.items) collectCodeBlocks(item.blocks || [], found);
  }
  return found;
}

// 言語の指定がないフェンスは着色できないので、素の pre/code に落とす。
function plainBlock(node) {
  const className = node.info ? ` class="language-${escapeHtml(node.info)}"` : '';
  return `<pre><code${className}>${escapeHtml(node.value)}</code></pre>`;
}

async function highlightCodeBlocks(ast, options = {}) {
  const theme = options.theme || DEFAULT_THEME;
  const blocks = collectCodeBlocks(ast.children);
  const highlighted = new Map();
  if (blocks.length === 0) return highlighted;

  const highlighter = await getHighlighter(theme);
  const languages = new Set(highlighter.getLoadedLanguages());

  for (const node of blocks) {
    const language = (node.info || '').trim().split(/\s+/)[0];
    if (!language || !languages.has(language)) {
      highlighted.set(node, plainBlock(node));
      continue;
    }
    const html = highlighter.codeToHtml(node.value, { lang: language, theme });
    // Astro が付けていた属性に合わせる。既存の CSS とコピーボタンの判定、
    // それに横スクロールがこの形に依存している。
    highlighted.set(node, html
      .replace(/^<pre class="shiki /, '<pre class="astro-code ')
      .replace(/^(<pre [^>]*style="[^"]*)"/, '$1; overflow-x: auto;"')
      .replace(/^(<pre [^>]*?)>/, `$1 data-language="${escapeHtml(language)}">`));
  }

  return highlighted;
}

module.exports = { highlightCodeBlocks, collectCodeBlocks, parse };
