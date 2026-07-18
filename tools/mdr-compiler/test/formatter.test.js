const test = require('node:test');
const assert = require('node:assert/strict');
const { format } = require('../src/formatter');

test('formats supported MDR blocks canonically', () => {
  assert.equal(format([
    '# 見出し',
    '本文の一行目',
    '本文の二行目',
    '',
    '+ *項目*',
    '+ 次の項目',
    '',
    '- 箇条書き',
  ].join('\n')), [
    '# 見出し',
    '本文の一行目\n本文の二行目',
    '',
    '+ *項目*',
    '+ 次の項目',
    '- 箇条書き',
  ].join('\n'));
});

test('formats already canonical source without changing it', () => {
  const source = '# 見出し\n本文です。';
  assert.equal(format(source), source);
});

test('formats generic tags and grouped arguments', () => {
  assert.equal(format(':::section#main.def (重要な 定義)\n本文\n:::'),
    ':::section.def#main (重要な 定義)\n  本文\n:::');
});

test('keeps void tags on one line without adding a closing marker', () => {
  const source = ':::input#searchInput text 検索したい用語を入力';
  assert.equal(format(source), source);
});

test('preserves relative list indentation inside block tags', () => {
  const source = [
    ':::section.ex 命題',
    '- 親',
    '  - 子',
    '    - 孫',
    ':::',
  ].join('\n');
  assert.equal(format(source), [
    ':::section.ex 命題',
    '  - 親',
    '    - 子',
    '      - 孫',
    ':::',
  ].join('\n'));
});

test('formats inline and fenced code', () => {
  const source = 'これは `code`。\n\n```js\nconst value = 1;\n```';
  assert.equal(format(source), source);
});

test('preserves frontmatter while formatting the body', () => {
  const source = '---\ntitle: Example\n---\n\n# 見出し\n\n本文';
  assert.equal(format(source), source);
});

test('preserves links and escaped MDR markers', () => {
  const source = '[*リンク*](/reference.html) と \\*記号\\* と \\$';
  assert.equal(format(source), source);
});
