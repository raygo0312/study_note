const test = require('node:test');
const assert = require('node:assert/strict');
const { highlight } = require('../src/highlighter');

test('returns lexer tokens with editor scopes', () => {
  assert.deepEqual(highlight('# 見出し\n\nこれは *重要* です。').map(({ value, scope }) => ({ value, scope })), [
    { value: '#', scope: 'markup.heading' },
    { value: '見出し', scope: 'text' },
    { value: '\n', scope: 'newline' },
    { value: '\n', scope: 'newline' },
    { value: 'これは ', scope: 'text' },
    { value: '*', scope: 'markup.definition' },
    { value: '重要', scope: 'text' },
    { value: '*', scope: 'markup.definition' },
    { value: ' です。', scope: 'text' },
  ]);
});

test('highlights generic tag syntax', () => {
  assert.deepEqual(highlight(':::section.ex 命題\n:::').map(({ value, scope }) => ({ value, scope })), [
    { value: ':::section.ex 命題', scope: 'markup.tag.start' },
    { value: '\n', scope: 'newline' },
    { value: ':::', scope: 'markup.tag.end' },
  ]);
});

test('highlights inline and fenced code', () => {
  assert.deepEqual(highlight('`code`\n\n```js\n*raw*\n```').map(({ value, scope }) => ({ value, scope })), [
    { value: '`', scope: 'markup.inline.code' },
    { value: 'code', scope: 'markup.code' },
    { value: '`', scope: 'markup.inline.code' },
    { value: '\n', scope: 'newline' },
    { value: '\n', scope: 'newline' },
    { value: 'js', scope: 'markup.fence.start' },
    { value: '\n', scope: 'newline' },
    { value: '*raw*', scope: 'markup.code' },
    { value: '\n', scope: 'newline' },
    { value: '', scope: 'markup.fence.end' },
  ]);
});
