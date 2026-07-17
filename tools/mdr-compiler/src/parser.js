const { TokenType, lex } = require('./lexer');

function textNode(value) {
  return { type: 'text', value };
}

function parseInline(tokens) {
  const children = [];
  let text = '';
  const flush = () => {
    if (text) children.push(textNode(text));
    text = '';
  };

  for (let index = 0; index < tokens.length; index += 1) {
    const current = tokens[index];
    if (current.type === TokenType.BoldMarker && tokens[index + 2]?.type === TokenType.BoldMarker) {
      flush();
      children.push({ type: 'strong', children: [textNode(tokens[index + 1].value)] });
      index += 2;
    } else {
      text += current.value;
    }
  }
  flush();
  return children;
}

function parse(source) {
  const tokens = lex(source);
  const blocks = [];
  let index = 0;

  const lineEnd = (start) => {
    let end = start;
    while (end < tokens.length && tokens[end].type !== TokenType.Newline) end += 1;
    return end;
  };
  const skipNewlines = () => {
    while (tokens[index]?.type === TokenType.Newline) index += 1;
  };

  while (index < tokens.length) {
    if (tokens[index].type === TokenType.Newline) {
      skipNewlines();
      continue;
    }

    const current = tokens[index];
    if (current.type === TokenType.HeadingMarker) {
      const end = lineEnd(index);
      blocks.push({ type: 'heading', level: current.value.length,
        children: parseInline(tokens.slice(index + 1, end)) });
      index = end;
      continue;
    }

    if (current.type === TokenType.OrderedMarker || current.type === TokenType.UnorderedMarker) {
      const ordered = current.type === TokenType.OrderedMarker;
      const items = [];
      while (index < tokens.length && tokens[index].type === current.type) {
        const end = lineEnd(index);
        items.push({ type: 'list-item', children: parseInline(tokens.slice(index + 1, end)) });
        index = end;
        if (tokens[index]?.type === TokenType.Newline) index += 1;
      }
      blocks.push({ type: ordered ? 'ordered-list' : 'unordered-list', items });
      continue;
    }

    const end = lineEnd(index);
    blocks.push({ type: 'paragraph', children: parseInline(tokens.slice(index, end)) });
    index = end;
  }

  return { type: 'document', children: blocks };
}

module.exports = { parse };
