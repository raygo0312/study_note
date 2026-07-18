const { parse } = require('./parser');
const { formatDescriptor, parseBlockTagStart } = require('./tag-syntax');

function formatInline(nodes) {
  return nodes.map((node) => {
    if (node.type === 'text') return node.value;
    if (node.type === 'strong') return `*${formatInline(node.children)}*`;
    if (node.type === 'code') return `\`${formatInline(node.children)}\``;
    if (node.type === 'escape') return `\\${node.value}`;
    if (node.type === 'link') return `[${formatInline(node.children)}](${node.destination})`;
    if (node.type === 'inline-tag') return `:${formatDescriptor(node)}[${formatInline(node.children)}]`;
    throw new Error(`Unknown inline node: ${node.type}`);
  }).join('');
}

function formatAst(ast) {
  if (ast.type !== 'document') throw new Error('Expected a document AST');

  return formatBlocks(ast.children);
}

function formatArguments(argumentsList) {
  return argumentsList.map((argument) => {
    const value = formatInline(argument);
    return /\s/.test(value) ? `(${value})` : value;
  }).join(' ');
}

function formatBlocks(nodes) {
  const formatted = nodes.map((node, index) => {
    const separator = index === 0
      ? '\n'.repeat(node.leadingBlankLines || 0)
      : '\n'.repeat(1 + (node.leadingBlankLines || 0));
    const content = formatBlock(node);
    return `${separator}${content}`;
  }).join('');
  return `${formatted}${'\n'.repeat(nodes.trailingBlankLines ? nodes.trailingBlankLines + 1 : 0)}`;
}

function formatBlock(node) {
  switch (node.type) {
    case 'heading':
      return `${'#'.repeat(node.level)} ${formatInline(node.children)}`;
    case 'paragraph':
      return formatInline(node.children).trim();
    case 'code-block':
      return `\`\`\`${node.info}\n${node.value}\n\`\`\``;
    case 'ordered-list':
      return formatList(node, '+');
    case 'unordered-list':
      return formatList(node, '-');
    case 'tag': {
      const argumentsText = formatArguments(node.arguments);
      const content = formatBlocks(node.children).replace(/^(?!$)/gm, '  ');
      return `:::${formatDescriptor(node)}${argumentsText ? ` ${argumentsText}` : ''}\n${content}\n:::`;
    }
    default:
      throw new Error(`Unknown block node: ${node.type}`);
  }
}

function formatList(node, marker) {
  return node.items.map((item) => {
    const line = `${marker} ${formatInline(item.children).trim()}`;
    if (!item.blocks) return line;
    const nested = item.blocks.map((block) => formatBlocks([block])
      .replace(/^(?!$)/gm, '  ')).join('\n');
    return `${line}\n${nested}`;
  }).join('\n');
}

function dedentTags(value) {
  const lines = value.split('\n');
  const ranges = [];
  const stack = [];
  let inFence = false;
  lines.forEach((line, index) => {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      return;
    }
    if (inFence) return;
    if (parseBlockTagStart(line)) {
      stack.push(index);
    } else if (/^:::[ \t]*$/.test(line) && stack.length > 0) {
      const start = stack.pop();
      if (stack.length === 0) ranges.push({ start, end: index });
    }
  });

  for (const range of ranges) {
    const body = lines.slice(range.start + 1, range.end)
      .filter((line) => line.trim() !== '');
    const baseIndent = body.length === 0 ? 0 : Math.min(...body.map((line) =>
      (line.match(/^[ \t]*/) || [''])[0].length));
    if (baseIndent === 0) continue;
    for (let index = range.start + 1; index < range.end; index += 1) {
      if (lines[index].trim() !== '') lines[index] = lines[index].slice(baseIndent);
    }
  }
  return lines.join('\n');
}

function format(source) {
  const match = /^(?:\uFEFF)?---\r?\n[\s\S]*?\r?\n---(?=\r?\n|$)/.exec(source);
  if (!match) return formatAst(parse(dedentTags(source)));
  const body = source.slice(match[0].length);
  const leadingNewlines = /^(?:\r?\n)*/.exec(body)[0];
  const content = body.slice(leadingNewlines.length);
  return `${match[0]}${leadingNewlines}${formatAst(parse(dedentTags(content)))}`;
}

module.exports = { format, formatAst };
