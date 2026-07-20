const { parse } = require('./parser');
const { PROTECTED_MATH_ASTERISK, PROTECTED_MATH_SLASH, transformMath } = require('./math');
const { renderLinkedText, resolveTermHref } = require('./term-dictionary');

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
        return allowTermLinks ? renderLinkedText(
          node.value,
          options.termDictionary,
          escapeHtml,
          (term, href) => `<a href="${escapeHtml(href)}">${escapeHtml(term)}</a>`,
        ) : escapeHtml(node.value);
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
        return `<a href="${escapeHtml(href)}">${renderInline(node.children, options, false)}</a>`;
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

function render(ast, options = {}) {
  if (ast.type !== 'document') throw new Error('Expected a document AST');

  return ast.children.map((node) => {
    switch (node.type) {
      case 'heading':
        if (node.level < 1 || node.level > 6) {
          throw new Error(`Invalid heading level: ${node.level}`);
        }
        return `<h${node.level}>${renderInline(node.children, options, false)}</h${node.level}>`;
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

function compile(source, options = {}) {
  return render(parse(transformMath(source, {
    protectDelimiters: true,
    protectMdr: true,
  })), options)
    .replaceAll(PROTECTED_MATH_SLASH, '\\')
    .replaceAll(PROTECTED_MATH_ASTERISK, '*');
}

module.exports = { compile, escapeHtml, render };
