const test = require('node:test');
const assert = require('node:assert/strict');
const { compile } = require('../src/compiler');

test('compiles the language into HTML', () => {
  assert.equal(compile([
    '# タイトル',
    '',
    'これは *重要* です。',
    '',
    '+ 一つ',
    '+ 二つ',
    '',
    '- A',
    '- B',
  ].join('\n')), [
    '<h1>タイトル</h1>',
    '<p>これは <strong>重要</strong> です。</p>',
    '<ol>',
    '  <li>一つ</li>',
    '  <li>二つ</li>',
    '</ol>',
    '<ul>',
    '  <li>A</li>',
    '  <li>B</li>',
    '</ul>',
  ].join('\n'));
});

test('escapes text before emitting HTML', () => {
  assert.equal(compile('安全な <文字> & "文字"'),
    '<p>安全な &lt;文字&gt; &amp; &quot;文字&quot;</p>');
});
