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

test('parses generic tags and grouped arguments', () => {
  assert.deepEqual(parse(':::section#main.def (重要な 定義)\n本文\n:::'), {
    type: 'document',
    children: [{
      type: 'tag',
      name: 'section',
      classes: ['def'],
      id: 'main',
      source: 'section#main.def',
      arguments: [[{ type: 'text', value: '重要な 定義' }]],
      children: [{ type: 'paragraph', children: [{ type: 'text', value: '本文' }] }],
    }],
  });
});

test('parses inline tags separately from links', () => {
  assert.deepEqual(parse(':span.note[説明] [参照](/ref)').children[0].children, [
    { type: 'inline-tag', name: 'span', classes: ['note'], id: undefined,
      source: 'span.note', children: [{ type: 'text', value: '説明' }] },
    { type: 'text', value: ' ' },
    { type: 'link', destination: '/ref', children: [{ type: 'text', value: '参照' }] },
  ]);
});

test('parses indented nested lists', () => {
  assert.deepEqual(parse('- 親\n  + 子'), {
    type: 'document',
    children: [{
      type: 'unordered-list',
      items: [{
        type: 'list-item',
        children: [{ type: 'text', value: '親' }],
        blocks: [{
          type: 'ordered-list',
          items: [{ type: 'list-item', children: [{ type: 'text', value: '子' }] }],
        }],
      }],
    }],
  });
});

test('parses inline and fenced code without interpreting its contents', () => {
  assert.deepEqual(parse('`*code*`\n\n```txt\n*raw*\n```'), {
    type: 'document',
    children: [
      { type: 'paragraph', children: [{ type: 'code', children: [{ type: 'text', value: '*code*' }] }] },
      { type: 'code-block', info: 'txt', value: '*raw*' },
    ],
  });
});
