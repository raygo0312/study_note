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
const { matchCodeFence, splitSourceLines } = require('./source-syntax');

function token(type, value, start, end, line, column, metadata = {}) {
  return { type, value, start, end, line, column, ...metadata };
}

function lexInline(text, offset, line, column) {
  const tokens = [];
  let cursor = 0;
  let textStart = 0;
  const escapable = new Set('\\`*{}[]()#+-.!_$:>/');
  const flushText = (end) => {
    if (end > textStart) {
      tokens.push(token(TokenType.Text, text.slice(textStart, end),
        offset + textStart, offset + end, line, column + textStart));
    }
  };
  const findClosing = (open, opening, closing) => {
    let depth = 1;
    let inCode = false;
    for (let index = open + 1; index < text.length; index += 1) {
      if (text[index] === '\\') {
        index += 1;
        continue;
      }
      if (text[index] === '`') {
        inCode = !inCode;
        continue;
      }
      if (inCode) continue;
      if (text[index] === opening) depth += 1;
      else if (text[index] === closing) depth -= 1;
      if (depth === 0) return index;
    }
    return -1;
  };
  const findMarker = (marker, start) => {
    for (let index = start; index < text.length; index += 1) {
      if (text[index] === '\\') {
        index += 1;
        continue;
      }
      if (text[index] === marker) return index;
    }
    return -1;
  };

  while (cursor < text.length) {
    if (text[cursor] === '\\' && escapable.has(text[cursor + 1])) {
      flushText(cursor);
      tokens.push(token(TokenType.Escape, text[cursor + 1], offset + cursor,
        offset + cursor + 2, line, column + cursor));
      cursor += 2;
      textStart = cursor;
      continue;
    }

    if (text[cursor] === ':') {
      const descriptorMatch = /^:((?:[a-z][a-z0-9-]*)?(?:[.#][a-zA-Z_][\w-]*)*)\[/.exec(
        text.slice(cursor),
      );
      if (descriptorMatch) {
        const bracket = cursor + descriptorMatch[0].length - 1;
        const close = findClosing(bracket, '[', ']');
        if (close >= 0) {
          flushText(cursor);
          tokens.push(token(TokenType.InlineTag, text.slice(cursor, close + 1),
            offset + cursor, offset + close + 1, line, column + cursor, {
              descriptor: parseDescriptor(descriptorMatch[1], 'span'),
              children: lexInline(text.slice(bracket + 1, close), offset + bracket + 1,
                line, column + bracket + 1),
            }));
          cursor = close + 1;
          textStart = cursor;
          continue;
        }
      }
    }

    if (text[cursor] === '[' && text[cursor - 1] !== '\\' && text[cursor - 1] !== '\uE000') {
      const labelEnd = findClosing(cursor, '[', ']');
      if (labelEnd >= 0 && text[labelEnd + 1] === '(') {
        const destinationEnd = findClosing(labelEnd + 1, '(', ')');
        const destination = destinationEnd >= 0
          ? text.slice(labelEnd + 2, destinationEnd) : '';
        if (destinationEnd >= 0 && destination !== '' && !/\s/.test(destination)) {
          flushText(cursor);
          tokens.push(token(TokenType.Link, text.slice(cursor, destinationEnd + 1),
            offset + cursor, offset + destinationEnd + 1, line, column + cursor, {
              destination,
              children: lexInline(text.slice(cursor + 1, labelEnd), offset + cursor + 1,
                line, column + cursor + 1),
            }));
          cursor = destinationEnd + 1;
          textStart = cursor;
          continue;
        }
      }
      if (labelEnd > cursor + 1) {
        flushText(cursor);
        const label = text.slice(cursor + 1, labelEnd);
        tokens.push(token(TokenType.Link, text.slice(cursor, labelEnd + 1),
          offset + cursor, offset + labelEnd + 1, line, column + cursor, {
            destination: `*${label}`,
            definitionReference: true,
            children: lexInline(label, offset + cursor + 1, line, column + cursor + 1),
          }));
        cursor = labelEnd + 1;
        textStart = cursor;
        continue;
      }
    }

    if (text[cursor] === '*' || text[cursor] === '`') {
      const marker = text[cursor];
      const close = findMarker(marker, cursor + 1);
      if (close > cursor + 1) {
        flushText(cursor);
        const code = marker === '`';
        const markerType = code ? TokenType.CodeMarker : TokenType.BoldMarker;
        tokens.push(token(markerType, marker, offset + cursor, offset + cursor + 1,
          line, column + cursor));
        tokens.push(token(code ? TokenType.CodeText : TokenType.Text,
          text.slice(cursor + 1, close), offset + cursor + 1, offset + close,
          line, column + cursor + 1));
        tokens.push(token(markerType, marker, offset + close, offset + close + 1,
          line, column + close));
        cursor = close + 1;
        textStart = cursor;
        continue;
      }
    }
    cursor += 1;
  }

  flushText(text.length);
  return tokens;
}

function lex(source) {
  const tokens = [];
  const lines = splitSourceLines(source);
  let inFence = false;

  lines.forEach(({ text: lineText, newline, offset }, lineIndex) => {
    const line = lineIndex + 1;
    let content = lineText;
    let column = 1;

    const fence = matchCodeFence(content, inFence);
    if (fence) {
      tokens.push(token(inFence ? TokenType.CodeFenceEnd : TokenType.CodeFenceStart,
        fence.info, offset, offset + lineText.length, line, column));
      inFence = !inFence;
    } else if (inFence) {
      tokens.push(token(TokenType.CodeText, lineText, offset, offset + lineText.length,
        line, column));
    }

    if (fence || inFence) {
      // Fence contents are emitted above without inline interpretation.
    } else {
      const heading = /^([ \t]*)(#{1,6})(?:[ \t]+)(.*)$/.exec(content);
      const tagStart = parseBlockTagStart(content);
      const tagEnd = /^([ \t]*):::[ \t]*$/.exec(content);
      const list = /^([ \t]*)([+-])[ \t]+(.*)$/.exec(content);

      if (tagStart) {
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
        const markerType = list[2] === '+'
          ? TokenType.OrderedMarker : TokenType.UnorderedMarker;
        const markerOffset = offset + list[1].length;
        tokens.push(token(markerType, list[2], markerOffset, markerOffset + 1, line,
          list[1].length + 1, { indent: list[1].length }));
        const textOffset = offset + lineText.length - list[3].length;
        tokens.push(...lexInline(list[3], textOffset, line, textOffset - offset + 1));
      } else if (content.length > 0) {
        tokens.push(...lexInline(content, offset, line, column));
      }
    }

    if (newline) {
      tokens.push(token(TokenType.Newline, newline, offset + lineText.length,
        offset + lineText.length + newline.length, line, lineText.length + 1));
    }
  });

  return tokens;
}

module.exports = { TokenType, lex, lexInline };
