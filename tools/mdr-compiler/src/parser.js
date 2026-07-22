const { TokenType, lex } = require('./lexer');

function textNode(value) {
  return { type: 'text', value };
}

function parseInline(tokens, hardBreakAtEnd = false) {
  const children = [];
  let text = '';
  const flush = () => {
    if (text) children.push(textNode(text));
    text = '';
  };

  for (let index = 0; index < tokens.length; index += 1) {
    const current = tokens[index];
    if (current.type === TokenType.Newline && text.endsWith('\\')) {
      text = text.slice(0, -1);
      flush();
      children.push({ type: 'line-break' });
    } else if (current.type === TokenType.BoldMarker && tokens[index + 2]?.type === TokenType.BoldMarker) {
      flush();
      children.push({ type: 'strong', children: [textNode(tokens[index + 1].value)] });
      index += 2;
    } else if (current.type === TokenType.CodeMarker && tokens[index + 2]?.type === TokenType.CodeMarker) {
      flush();
      children.push({ type: 'code', children: [textNode(tokens[index + 1].value)] });
      index += 2;
    } else if (current.type === TokenType.Escape) {
      flush();
      children.push({ type: 'escape', value: current.value });
    } else if (current.type === TokenType.Link) {
      flush();
      const link = {
        type: 'link',
        destination: current.destination,
        children: parseInline(current.children),
      };
      if (current.definitionReference) link.definitionReference = true;
      children.push(link);
    } else if (current.type === TokenType.InlineTag) {
      flush();
      children.push({
        type: 'inline-tag',
        ...current.descriptor,
        children: parseInline(current.children),
      });
    } else {
      text += current.value;
    }
  }
  if (hardBreakAtEnd && text.endsWith('\\')) {
    text = text.slice(0, -1);
    flush();
    children.push({ type: 'line-break' });
  }
  flush();
  return children;
}

function parse(source) {
  const tokens = lex(source);
  let index = 0;

  const lineEnd = (start) => {
    let end = start;
    while (end < tokens.length && tokens[end].type !== TokenType.Newline) end += 1;
    return end;
  };
  const skipNewlines = () => {
    while (tokens[index]?.type === TokenType.Newline) index += 1;
  };

  function parseBlocks(stopAtTagEnd = false) {
    const blocks = [];
    let pendingBlankLines = 0;
    const pushBlock = (block) => {
      if (pendingBlankLines > 0) {
        Object.defineProperty(block, 'leadingBlankLines', {
          value: pendingBlankLines,
          enumerable: false,
        });
        pendingBlankLines = 0;
      }
      blocks.push(block);
    };
    while (index < tokens.length) {
      if (stopAtTagEnd && tokens[index].type === TokenType.TagEnd) break;
    if (tokens[index].type === TokenType.Newline) {
      let newlineCount = 0;
      while (tokens[index]?.type === TokenType.Newline) {
        newlineCount += 1;
        index += 1;
      }
      if (newlineCount > 1) pendingBlankLines += newlineCount - 1;
      continue;
    }

    const current = tokens[index];
    if (current.type === TokenType.TagStart) {
      index += 1;
      if (current.void) {
        pushBlock({
          type: 'tag',
          ...current.descriptor,
          arguments: current.arguments.map((value) => parseInline(lex(value))),
          children: [],
          void: true,
        });
        continue;
      }
      if (tokens[index]?.type === TokenType.Newline) index += 1;
      const children = parseBlocks(true);
      if (tokens[index]?.type !== TokenType.TagEnd) {
        throw new Error(`Unclosed tag ${current.descriptor.name} at ${current.line}:${current.column}`);
      }
      index += 1;
      pushBlock({
        type: 'tag',
        ...current.descriptor,
        arguments: current.arguments.map((value) => parseInline(lex(value))),
        children,
      });
      continue;
    }
    if (current.type === TokenType.CodeFenceStart) {
      const info = current.value;
      const fenceStart = current;
      index += 1;
      if (tokens[index]?.type === TokenType.Newline) index += 1;
      let value = '';
      while (index < tokens.length && tokens[index].type !== TokenType.CodeFenceEnd) {
        if (tokens[index].type === TokenType.CodeText) value += tokens[index].value;
        if (tokens[index].type === TokenType.Newline) value += '\n';
        index += 1;
      }
      value = value.replace(/\r?\n$/, '');
      if (tokens[index]?.type !== TokenType.CodeFenceEnd) {
        throw new Error(`Unclosed code fence at ${fenceStart.line}:${fenceStart.column}`);
      }
      index += 1;
      pushBlock({ type: 'code-block', info, value });
      continue;
    }
    if (current.type === TokenType.TagEnd) {
      if (stopAtTagEnd) break;
      throw new Error(`Unexpected tag end at ${current.line}:${current.column}`);
    }
    if (current.type === TokenType.HeadingMarker) {
      const end = lineEnd(index);
      pushBlock({ type: 'heading', level: current.value.length,
        children: parseInline(tokens.slice(index + 1, end)) });
      index = end;
      continue;
    }

    if (current.type === TokenType.OrderedMarker || current.type === TokenType.UnorderedMarker) {
      const parseList = (indent, markerType) => {
        const items = [];
        while (index < tokens.length && tokens[index].type === markerType
          && tokens[index].indent === indent) {
          const end = lineEnd(index);
          const item = { type: 'list-item', children: parseInline(tokens.slice(index + 1, end)) };
          index = end;
          const next = tokens[index]?.type === TokenType.Newline ? tokens[index + 1] : undefined;
          if (next?.type === TokenType.OrderedMarker
            || next?.type === TokenType.UnorderedMarker) index += 1;
          if (tokens[index]?.type === TokenType.OrderedMarker
            || tokens[index]?.type === TokenType.UnorderedMarker) {
            if (tokens[index].indent > indent) {
              item.blocks = [parseList(tokens[index].indent, tokens[index].type)];
            }
          }
          items.push(item);
        }
        return {
          type: markerType === TokenType.OrderedMarker ? 'ordered-list' : 'unordered-list',
          items,
        };
      };
      pushBlock(parseList(current.indent, current.type));
      continue;
    }

    // A paragraph continues across ordinary non-empty lines. A blank line or
    // another block marker starts the next block, as in Markdown.
    const start = index;
    let end = lineEnd(index);
    while (tokens[end]?.type === TokenType.Newline) {
      const next = end + 1;
      if (!tokens[next] || tokens[next].type === TokenType.Newline
        || tokens[next].type === TokenType.HeadingMarker
        || tokens[next].type === TokenType.OrderedMarker
        || tokens[next].type === TokenType.UnorderedMarker
        || tokens[next].type === TokenType.CodeFenceStart
        || tokens[next].type === TokenType.TagStart
        || tokens[next].type === TokenType.TagEnd) {
        break;
      }
      end = lineEnd(next);
    }
    pushBlock({
      type: 'paragraph',
      children: parseInline(tokens.slice(start, end), true),
    });
    index = end;
    }
    Object.defineProperty(blocks, 'trailingBlankLines', {
      value: pendingBlankLines,
      enumerable: false,
    });
    return blocks;
  }

  return { type: 'document', children: parseBlocks() };
}

module.exports = { parse, parseInline };
