const { parse } = require('./parser');
const { PROTECTED_MATH_SLASH, transformMath } = require('./math');

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

function renderInline(nodes, options = {}) {
  return nodes.map((node) => {
    switch (node.type) {
      case 'text':
        return escapeHtml(node.value);
      case 'strong':
        return `<dfn>${renderInline(node.children, options)}</dfn>`;
      case 'code':
        return `<code>${renderInline(node.children, options)}</code>`;
      case 'escape':
        return escapeHtml(node.value);
      case 'link':
        return `<a href="${escapeHtml(node.destination)}">${renderInline(node.children, options)}</a>`;
      case 'inline-tag':
        return `<${node.name}${renderAttributes(node, options, false)}>${renderInline(node.children, options)}</${node.name}>`;
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
        return `<h${node.level}>${renderInline(node.children, options)}</h${node.level}>`;
      case 'paragraph':
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
        const content = renderChildren(node.children, options);
        return `<${node.name}${renderAttributes(node, options)}>\n${content}\n</${node.name}>`;
      }
      default:
        throw new Error(`Unknown block node: ${node.type}`);
    }
  }).join('\n');
}

function compile(source, options = {}) {
  return render(parse(transformMath(source, { protectDelimiters: true })), options)
    .replaceAll(PROTECTED_MATH_SLASH, '\\');
}

module.exports = { compile, escapeHtml, render };
