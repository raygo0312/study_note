const { TokenType, lex } = require('./lexer');

const scopes = Object.freeze({
  [TokenType.HeadingMarker]: 'markup.heading',
  [TokenType.TagStart]: 'markup.tag.start',
  [TokenType.TagEnd]: 'markup.tag.end',
  [TokenType.CodeFenceStart]: 'markup.fence.start',
  [TokenType.CodeFenceEnd]: 'markup.fence.end',
  [TokenType.CodeMarker]: 'markup.inline.code',
  [TokenType.CodeText]: 'markup.code',
  [TokenType.OrderedMarker]: 'markup.list.ordered',
  [TokenType.UnorderedMarker]: 'markup.list.unordered',
  [TokenType.BoldMarker]: 'markup.definition',
  [TokenType.Text]: 'text',
  [TokenType.Escape]: 'constant.character.escape',
  [TokenType.Link]: 'markup.link',
  [TokenType.InlineTag]: 'markup.tag.inline',
  [TokenType.Newline]: 'newline',
});

function highlight(source) {
  return lex(source).map((token) => ({
    ...token,
    scope: scopes[token.type] || 'text',
  }));
}

module.exports = { highlight, scopes };
