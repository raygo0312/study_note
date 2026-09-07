const { parse } = require('./parser');
const {
  PROTECTED_MATH_ASTERISK, PROTECTED_MATH_CLOSE_BRACKET,
  PROTECTED_MATH_OPEN_BRACKET, PROTECTED_MATH_SLASH, transformMath,
} = require('./math');
const { resolveTermHref } = require('./term-dictionary');

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[character]));
}

function renderAttributes(node, options, includeArguments = true) {
  const attributes = [];
  if (node.classes?.length) attributes.push(['class', node.classes.join(' ')]);
  if (node.id) attributes.push(['id', node.id]);
  if (includeArguments && node.arguments?.length) {
    const bindings = options.tagDefinitions?.[node.name];
    if (!bindings) throw new Error(`No argument definition for tag: ${node.name}`);
    if (node.arguments.length > bindings.length) {
      throw new Error(`Too many arguments for tag: ${node.name}`);
    }
    node.arguments.forEach((argument, index) => {
      attributes.push([bindings[index].attribute, renderPlainInline(argument)]);
    });
  }
  return attributes.map(([name, value]) => ` ${name}="${escapeHtml(value)}"`).join('');
}

function renderInline(nodes, options = {}, allowTermLinks = true) {
  return nodes.map((node) => {
    switch (node.type) {
      case 'text':
        return escapeHtml(node.value);
      case 'strong': {
        const state = options.termIdState || (options.termIdState = { next: 0 });
        return `<dfn id="define${state.next++}">${renderInline(node.children, options, false)}</dfn>`;
      }
      case 'code':
        return `<code>${renderInline(node.children, options, false)}</code>`;
      case 'escape':
        return escapeHtml(node.value);
      case 'line-break':
        return '<br>';
      case 'link': {
        const href = resolveTermHref(node.destination, options.termDictionary);
        let label = renderInline(node.children, options, false);
        // ラベルを省いたリンクは、宛先ページのタイトルで補う。手で書いた見出しが
        // ページ側の変更に置いていかれるのを防ぐ。
        if (label === '') {
          const title = options.pageTitles?.[href];
          if (title === undefined) {
            throw new Error(`Link with no label must point at a known page: ${node.destination}`);
          }
          label = escapeHtml(title);
        }
        return `<a href="${escapeHtml(href)}">${label}</a>`;
      }
      case 'inline-tag':
        return `<${node.name}${renderAttributes(node, options, false)}>${renderInline(node.children, options, allowTermLinks)}</${node.name}>`;
      default:
        throw new Error(`Unknown inline node: ${node.type}`);
    }
  }).join('');
}

function renderList(node, tag, options) {
  const items = node.items.map((item) =>
    `  <li>${renderInline(item.children, options)}${item.blocks
      ? `\n${renderChildren(item.blocks, options)}` : ''}</li>`).join('\n');
  return `<${tag}>\n${items}\n</${tag}>`;
}

function renderChildren(children, options) {
  return children.map((child) => render({ type: 'document', children: [child] }, options))
    .join('\n');
}

function renderPlainInline(nodes) {
  return nodes.map((node) => {
    if (node.type === 'text' || node.type === 'escape') return node.value;
    return renderPlainInline(node.children);
  }).join('');
}

// Astro が使っていた github-slugger と同じ結果になるよう、記号を落として
// 空白をハイフンに変え、小文字へ揃える。日本語はそのまま残る。
function headingId(html) {
  return html
    .replace(/<[^>]+>/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\u2000-\u206f\u2e00-\u2e7f\u3001\u3002\u30fb'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g, '')
    .replace(/\s+/g, '-');
}

function uniqueHeadingId(base, options) {
  if (!base) return base;
  const used = options.usedHeadingIds ?? (options.usedHeadingIds = new Map());
  const seen = used.get(base) ?? 0;
  used.set(base, seen + 1);
  return seen === 0 ? base : `${base}-${seen}`;
}

function render(ast, options = {}) {
  if (ast.type !== 'document') throw new Error('Expected a document AST');

  return ast.children.map((node) => {
    switch (node.type) {
      case 'heading': {
        if (node.level < 1 || node.level > 6) {
          throw new Error(`Invalid heading level: ${node.level}`);
        }
        const inner = renderInline(node.children, options, false);
        // 見出しの id は本文から作る。目次とページ内リンクがこれを指す。
        // 同じ見出しが二度出たら連番を足し、リンク先が一意になるようにする。
        // 目次が拾うのは h2 と h3 なので、id もそこだけに振る。
        const id = node.level === 2 || node.level === 3
          ? uniqueHeadingId(headingId(inner), options)
          : '';
        return `<h${node.level}${id ? ` id="${escapeHtml(id)}"` : ''}>${inner}</h${node.level}>`;
      }
      case 'paragraph':
        {
          const meaningful = node.children.filter((child) =>
            child.type !== 'text' || child.value.trim() !== '');
          if (meaningful.length === 1 && meaningful[0].type === 'inline-tag') {
            return renderInline(meaningful, options);
          }
        }
        return `<p>${renderInline(node.children, options)}</p>`;
      case 'code-block': {
        // 着色済みの HTML があればそれを使う。highlightCodeBlocks を通していない
        // 場合（同期呼び出し）は、素の pre/code へ落とす。
        const highlighted = options.highlightedCode?.get(node);
        if (highlighted) return highlighted;
        const className = node.info ? ` class="language-${escapeHtml(node.info)}"` : '';
        return `<pre><code${className}>${escapeHtml(node.value)}</code></pre>`;
      }
      case 'ordered-list':
        return renderList(node, 'ol', options);
      case 'unordered-list':
        return renderList(node, 'ul', options);
      case 'tag': {
        if (node.void) return `<${node.name}${renderAttributes(node, options)}>`;
        const content = renderChildren(node.children, options);
        return `<${node.name}${renderAttributes(node, options)}>\n${content}\n</${node.name}>`;
      }
      default:
        throw new Error(`Unknown block node: ${node.type}`);
    }
  }).join('\n');
}

function parseSource(source) {
  return parse(transformMath(source, { protectDelimiters: true, protectMdr: true }));
}

function restoreMath(html) {
  return html
    .replaceAll(PROTECTED_MATH_SLASH, '\\')
    .replaceAll(PROTECTED_MATH_ASTERISK, '*')
    .replaceAll(PROTECTED_MATH_OPEN_BRACKET, '[')
    .replaceAll(PROTECTED_MATH_CLOSE_BRACKET, ']');
}

function compile(source, options = {}) {
  return restoreMath(render(parseSource(source), options));
}

module.exports = { compile, escapeHtml, parseSource, render, restoreMath };
