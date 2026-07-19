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

test('compiles a trailing backslash as a hard line break', () => {
  assert.equal(compile('一行目\\\n二行目'), '<p>一行目<br>二行目</p>');
  assert.equal(compile('最終行\\'), '<p>最終行<br></p>');
});

test('compiles generic tags with classes, ids, and defined arguments', () => {
  const definitions = { section: [{ attribute: 'data-label' }] };
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
      { attribute: 'type' },
      { attribute: 'placeholder' },
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

test('compiles nested inline tags', () => {
  assert.equal(compile(':ruby[Hilbert:rt[ヒルベルト]]'),
    '<ruby>Hilbert<rt>ヒルベルト</rt></ruby>');
});

test('compiles omitted div and span tag names', () => {
  assert.equal(compile(':::.panel#main\n本文 :[補足] と :.note[注記]\n:::'), [
    '<div class="panel" id="main">',
    '<p>本文 <span>補足</span> と <span class="note">注記</span></p>',
    '</div>',
  ].join('\n'));
});

test('does not wrap a standalone inline tag in a paragraph', () => {
  assert.equal(compile(':summary[証明]'), '<summary>証明</summary>');
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

test('does not interpret a Typst superscript asterisk as an MDR definition', () => {
  assert.equal(compile('$F^*$'), '<p>\\(F^*\\)</p>');
});

test('does not interpret TeX backslashes as MDR escapes or hard breaks', () => {
  const html = compile('$ & a \\ b $');
  assert.doesNotMatch(html, /<br>/);
  assert.match(html, /\\begin\{aligned\}|\\\\/);
});

test('compiles Markdown-style links and escaped MDR markers', () => {
  assert.equal(compile('これは [*リンク*](/reference.html) と \\*記号\\* と \\$。'),
    '<p>これは <a href="/reference.html"><dfn>リンク</dfn></a> と *記号* と $。</p>');
});

test('compiles CRLF documents without leaking carriage returns into syntax', () => {
  assert.equal(compile('# Heading\r\nBody'), '<h1>Heading</h1>\n<p>Body</p>');
  assert.equal(compile(':::div\r\nBody\r\n:::'), '<div>\n<p>Body</p>\n</div>');
  assert.equal(compile('- one\r\n- two'), [
    '<ul>',
    '  <li>one</li>',
    '  <li>two</li>',
    '</ul>',
  ].join('\n'));
});

test('rejects an unclosed code fence', () => {
  assert.throws(() => compile('```js\nconst value = 1;'), /Unclosed code fence at 1:1/);
});

test('does not validate tag-like text inside a code fence', () => {
  assert.equal(compile('```mdr\n:::div#first#second\n```'),
    '<pre><code class="language-mdr">:::div#first#second</code></pre>');
});

test('compiles inline tags nested more than one level', () => {
  assert.equal(compile(':ruby[:span[Hilbert:rt[ヒルベルト]]]'),
    '<ruby><span>Hilbert<rt>ヒルベルト</rt></span></ruby>');
});
