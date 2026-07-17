const test = require('node:test');
const assert = require('node:assert/strict');
const { TokenType, lex } = require('../src/lexer');

test('emits token source locations', () => {
  const tokens = lex('## 見出し');
  assert.deepEqual(tokens.map(({ type, value, line, column, start, end }) =>
    ({ type, value, line, column, start, end })), [
    { type: TokenType.HeadingMarker, value: '##', line: 1, column: 1, start: 0, end: 2 },
    { type: TokenType.Text, value: '見出し', line: 1, column: 4, start: 3, end: 6 },
  ]);
});

test('does not tokenize a lone asterisk as bold', () => {
  assert.deepEqual(lex('a * b').map((item) => item.type), [TokenType.Text]);
});
