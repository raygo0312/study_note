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
    '<p>これは <dfn>重要</dfn> です。</p>',
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

test('groups consecutive text lines into one paragraph', () => {
  assert.equal(compile([
    '# 見出し',
    '一行目',
    '二行目',
    '',
    '三行目',
    '',
    '## 次の見出し',
  ].join('\n')), [
    '<h1>見出し</h1>',
    '<p>一行目\n二行目</p>',
    '<p>三行目</p>',
    '<h2>次の見出し</h2>',
  ].join('\n'));
});

test('compiles generic tags with classes, ids, and defined arguments', () => {
  const definitions = { section: [{ name: 'label', attribute: 'data-label' }] };
  assert.equal(compile(':::section#main.ex (重要な 命題)\n本文です。\n:::', {
    tagDefinitions: definitions,
  }), [
    '<section class="ex" id="main" data-label="重要な 命題">',
    '<p>本文です。</p>',
    '</section>',
  ].join('\n'));
});

test('compiles HTML void tags without a closing MDR marker', () => {
  const definitions = {
    input: [
      { name: 'type', attribute: 'type' },
      { name: 'placeholder', attribute: 'placeholder' },
    ],
  };
  assert.equal(compile(':::input#searchInput text (検索したい用語を入力)', {
    tagDefinitions: definitions,
  }), '<input id="searchInput" type="text" placeholder="検索したい用語を入力">');
});

test('compiles inline tags without consuming Markdown links', () => {
  assert.equal(compile(':span.term[*項*] と [リンク](/reference)'),
    '<p><span class="term"><dfn>項</dfn></span> と <a href="/reference">リンク</a></p>');
});

test('compiles nested arbitrary block tags', () => {
  assert.equal(compile(':::aside.note\n:::div#details\n本文\n:::\n:::'), [
    '<aside class="note">',
    '<div id="details">',
    '<p>本文</p>',
    '</div>',
    '</aside>',
  ].join('\n'));
});

test('compiles indented nested lists', () => {
  assert.equal(compile('- 親\n  - 子\n  - 子2\n- 親2'), [
    '<ul>',
    '  <li>親',
    '<ul>',
    '  <li>子</li>',
    '  <li>子2</li>',
    '</ul></li>',
    '  <li>親2</li>',
    '</ul>',
  ].join('\n'));
});

test('compiles inline code and fenced code blocks', () => {
  assert.equal(compile('これは `*code*` です。\n\n```js\nconst value = 1;\n```'), [
    '<p>これは <code>*code*</code> です。</p>',
    '<pre><code class="language-js">const value = 1;</code></pre>',
  ].join('\n'));
});

test('converts Typst math before HTML compilation', () => {
  assert.equal(compile('$A <-> B$'), '<p>\\(A \\leftrightarrow B\\)</p>');
});

test('compiles Markdown-style links and escaped MDR markers', () => {
  assert.equal(compile('これは [*リンク*](/reference.html) と \\*記号\\* と \\$。'),
    '<p>これは <a href="/reference.html"><dfn>リンク</dfn></a> と *記号* と $。</p>');
});
