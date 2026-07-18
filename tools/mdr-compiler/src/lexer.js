const TokenType = Object.freeze({
  HeadingMarker: 'heading-marker',
  TagStart: 'tag-start',
  TagEnd: 'tag-end',
  CodeFenceStart: 'code-fence-start',
  CodeFenceEnd: 'code-fence-end',
  CodeText: 'code-text',
  OrderedMarker: 'ordered-marker',
  UnorderedMarker: 'unordered-marker',
  Text: 'text',
  Escape: 'escape',
  Link: 'link',
  InlineTag: 'inline-tag',
  BoldMarker: 'bold-marker',
  CodeMarker: 'code-marker',
  Newline: 'newline',
});

const { parseBlockTagStart, parseDescriptor } = require('./tag-syntax');

function token(type, value, start, end, line, column, metadata = {}) {
  return { type, value, start, end, line, column, ...metadata };
}

function lexInline(text, offset, line, column) {
  const tokens = [];
  const inlinePattern = /\\([\\`*{}\[\]()#+\-.!_$:>\/])|:([a-z][a-z0-9-]*(?:[.#][a-zA-Z_][\w-]*)*)\[([^\[\]\n]*(?:\[[^\[\]\n]*\][^\[\]\n]*)*)\]|\[([^\]\n]+)\]\(([^)\s\n]+)\)|\*([^*\n]+)\*|`([^`\n]+)`/g;
  let cursor = 0;
  let match;

  while ((match = inlinePattern.exec(text)) !== null) {
    if (match.index > cursor) {
      tokens.push(token(TokenType.Text, text.slice(cursor, match.index),
        offset + cursor, offset + match.index, line, column + cursor));
    }

    const open = match.index;
    const close = match.index + match[0].length - 1;
    if (match[1] !== undefined) {
      tokens.push(token(TokenType.Escape, match[1], offset + open,
        offset + close + 1, line, column + open));
      cursor = close + 1;
      continue;
    }
    if (match[2] !== undefined) {
      tokens.push(token(TokenType.InlineTag, match[0], offset + open,
        offset + close + 1, line, column + open, {
          descriptor: parseDescriptor(match[2]),
          children: lexInline(match[3], offset + open + match[0].indexOf('[') + 1,
            line, column + open + match[0].indexOf('[') + 1),
        }));
      cursor = close + 1;
      continue;
    }
    if (match[4] !== undefined) {
      const labelOffset = offset + open + 1;
      tokens.push(token(TokenType.Link, match[0], offset + open,
        offset + close + 1, line, column + open, {
          destination: match[5],
          children: lexInline(match[4], labelOffset, line, column + open + 1),
        }));
      cursor = close + 1;
      continue;
    }
    const code = match[7] !== undefined;
    const marker = code ? '`' : '*';
    const markerType = code ? TokenType.CodeMarker : TokenType.BoldMarker;
    tokens.push(token(markerType, marker, offset + open, offset + open + 1,
      line, column + open));
    tokens.push(token(code ? TokenType.CodeText : TokenType.Text,
      code ? match[7] : match[6], offset + open + 1, offset + close,
      line, column + open + 1));
    tokens.push(token(markerType, marker, offset + close, offset + close + 1,
      line, column + close));
    cursor = close + 1;
  }

  if (cursor < text.length) {
    tokens.push(token(TokenType.Text, text.slice(cursor), offset + cursor,
      offset + text.length, line, column + cursor));
  }
  return tokens;
}

function lex(source) {
  const tokens = [];
  let offset = 0;
  const lines = source.split('\n');
  let inFence = false;

  lines.forEach((lineText, lineIndex) => {
    const line = lineIndex + 1;
    let content = lineText;
    let column = 1;

    const fence = /^\s*```(.*)$/.exec(content);
    if (fence) {
      tokens.push(token(inFence ? TokenType.CodeFenceEnd : TokenType.CodeFenceStart,
        fence[1].trim(), offset, offset + lineText.length, line, column));
      inFence = !inFence;
    } else if (inFence) {
      tokens.push(token(TokenType.CodeText, lineText, offset, offset + lineText.length,
        line, column));
    }

    const heading = /^([ \t]*)(#{1,6})(?:[ \t]+)(.*)$/.exec(content);
    const tagStart = parseBlockTagStart(content);
    const tagEnd = /^([ \t]*):::[ \t]*$/.exec(content);
    const list = /^([ \t]*)([+-])[ \t]+(.*)$/.exec(content);

    if (fence || inFence) {
      // Fence contents are emitted above without inline interpretation.
    } else if (tagStart) {
      tokens.push(token(TokenType.TagStart, lineText.trim(), offset,
        offset + lineText.length, line, column, tagStart));
    } else if (tagEnd) {
      const markerOffset = offset + tagEnd[1].length;
      tokens.push(token(TokenType.TagEnd, ':::', markerOffset, markerOffset + 3,
        line, tagEnd[1].length + 1));
    } else if (heading) {
      const markerOffset = offset + heading[1].length;
      tokens.push(token(TokenType.HeadingMarker, heading[2], markerOffset,
        markerOffset + heading[2].length, line, markerOffset - offset + 1));
      const textOffset = offset + heading[0].length - heading[3].length;
      tokens.push(...lexInline(heading[3], textOffset, line, textOffset - offset + 1));
    } else if (list) {
      const markerType = list[2] === '+' ? TokenType.OrderedMarker : TokenType.UnorderedMarker;
      const markerOffset = offset + list[1].length;
      tokens.push(token(markerType, list[2], markerOffset, markerOffset + 1, line,
        list[1].length + 1, { indent: list[1].length }));
      const textOffset = offset + lineText.length - list[3].length;
      tokens.push(...lexInline(list[3], textOffset, line, textOffset - offset + 1));
    } else if (content.length > 0) {
      tokens.push(...lexInline(content, offset, line, column));
    }

    if (lineIndex < lines.length - 1) {
      tokens.push(token(TokenType.Newline, '\n', offset + lineText.length,
        offset + lineText.length + 1, line, lineText.length + 1));
    }
    offset += lineText.length + 1;
  });

  return tokens;
}

module.exports = { TokenType, lex };
