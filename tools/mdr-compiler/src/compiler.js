const { parse } = require('./parser');

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[character]));
}

function renderInline(nodes) {
  return nodes.map((node) => {
    switch (node.type) {
      case 'text':
        return escapeHtml(node.value);
      case 'strong':
        return `<strong>${renderInline(node.children)}</strong>`;
      default:
        throw new Error(`Unknown inline node: ${node.type}`);
    }
  }).join('');
}

function renderList(node, tag) {
  const items = node.items.map((item) =>
    `  <li>${renderInline(item.children)}</li>`).join('\n');
  return `<${tag}>\n${items}\n</${tag}>`;
}

function render(ast) {
  if (ast.type !== 'document') throw new Error('Expected a document AST');

  return ast.children.map((node) => {
    switch (node.type) {
      case 'heading':
        if (node.level < 1 || node.level > 6) {
          throw new Error(`Invalid heading level: ${node.level}`);
        }
        return `<h${node.level}>${renderInline(node.children)}</h${node.level}>`;
      case 'paragraph':
        return `<p>${renderInline(node.children)}</p>`;
      case 'ordered-list':
        return renderList(node, 'ol');
      case 'unordered-list':
        return renderList(node, 'ul');
      default:
        throw new Error(`Unknown block node: ${node.type}`);
    }
  }).join('\n');
}

function compile(source) {
  return render(parse(source));
}

module.exports = { compile, escapeHtml, render };
