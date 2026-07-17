const TokenType = Object.freeze({
  HeadingMarker: 'heading-marker',
  OrderedMarker: 'ordered-marker',
  UnorderedMarker: 'unordered-marker',
  Text: 'text',
  BoldMarker: 'bold-marker',
  Newline: 'newline',
});

function token(type, value, start, end, line, column) {
  return { type, value, start, end, line, column };
}

function lexInline(text, offset, line, column) {
  const tokens = [];
  const boldPattern = /\*([^*\n]+)\*/g;
  let cursor = 0;
  let match;

  while ((match = boldPattern.exec(text)) !== null) {
    if (match.index > cursor) {
      tokens.push(token(TokenType.Text, text.slice(cursor, match.index),
        offset + cursor, offset + match.index, line, column + cursor));
    }

    const open = match.index;
    const close = match.index + match[0].length - 1;
    tokens.push(token(TokenType.BoldMarker, '*', offset + open, offset + open + 1,
      line, column + open));
    tokens.push(token(TokenType.Text, match[1], offset + open + 1, offset + close,
      line, column + open + 1));
    tokens.push(token(TokenType.BoldMarker, '*', offset + close, offset + close + 1,
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

  lines.forEach((lineText, lineIndex) => {
    const line = lineIndex + 1;
    let content = lineText;
    let column = 1;

    const heading = /^(#{1,6})(?:[ \t]+)(.*)$/.exec(content);
    const list = /^([+-])[ \t]+(.*)$/.exec(content);

    if (heading) {
      tokens.push(token(TokenType.HeadingMarker, heading[1], offset, offset + heading[1].length,
        line, column));
      const textOffset = offset + heading[1].length + (heading[0].length - heading[2].length - heading[1].length);
      tokens.push(...lexInline(heading[2], textOffset, line, textOffset - offset + 1));
    } else if (list) {
      const markerType = list[1] === '+' ? TokenType.OrderedMarker : TokenType.UnorderedMarker;
      tokens.push(token(markerType, list[1], offset, offset + 1, line, column));
      const textOffset = offset + lineText.length - list[2].length;
      tokens.push(...lexInline(list[2], textOffset, line, textOffset - offset + 1));
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
