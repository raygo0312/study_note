const test = require('node:test');
const assert = require('node:assert/strict');
const { parse } = require('../src/parser');

test('parses one asterisk as bold and never as italic', () => {
  assert.deepEqual(parse('これは *重要* です。'), {
    type: 'document',
    children: [{ type: 'paragraph', children: [
      { type: 'text', value: 'これは ' },
      { type: 'strong', children: [{ type: 'text', value: '重要' }] },
      { type: 'text', value: ' です。' },
    ] }],
  });
});

test('parses consecutive plus lines as an ordered list', () => {
  assert.deepEqual(parse('+ 一つ\n+ 二つ\n+ 三つ'), {
    type: 'document',
    children: [{ type: 'ordered-list', items: [
      { type: 'list-item', children: [{ type: 'text', value: '一つ' }] },
      { type: 'list-item', children: [{ type: 'text', value: '二つ' }] },
      { type: 'list-item', children: [{ type: 'text', value: '三つ' }] },
    ] }],
  });
});

test('keeps unordered lists separate from ordered lists', () => {
  assert.deepEqual(parse('+ 番号\n- 箇条書き'), {
    type: 'document',
    children: [
      { type: 'ordered-list', items: [{ type: 'list-item', children: [{ type: 'text', value: '番号' }] }] },
      { type: 'unordered-list', items: [{ type: 'list-item', children: [{ type: 'text', value: '箇条書き' }] }] },
    ],
  });
});

test('parses headings and preserves source locations in lexer tokens', () => {
  assert.deepEqual(parse('## 見出し'), {
    type: 'document',
    children: [{ type: 'heading', level: 2, children: [{ type: 'text', value: '見出し' }] }],
  });
});
