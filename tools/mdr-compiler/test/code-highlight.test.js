const test = require('node:test');
const assert = require('node:assert/strict');
const { parse } = require('../src/parser');
const { render } = require('../src/compiler');
const { highlightCodeBlocks } = require('../src/code-highlight');

test('highlights a fenced block with the classes the layout expects', async () => {
  const ast = parse('```rust\nlet x = 1;\n```\n');
  const highlightedCode = await highlightCodeBlocks(ast);
  const html = render(ast, { highlightedCode });

  // BaseLayout がコピーボタンを付ける判定と、main.css の pre.astro-code が
  // このクラス名を見ている。
  assert.match(html, /^<pre class="astro-code one-dark-pro"/);
  assert.match(html, /overflow-x: auto;/);
  assert.match(html, /data-language="rust"/);
  assert.match(html, /<span class="line">/);
});

test('falls back to plain markup for a fence with no known language', async () => {
  const ast = parse('```\nplain text\n```\n');
  const highlightedCode = await highlightCodeBlocks(ast);
  assert.equal(render(ast, { highlightedCode }), '<pre><code>plain text</code></pre>');
});

test('renders a fence without highlighting when the pass is skipped', () => {
  assert.equal(
    render(parse('```txt\nvalue\n```\n')),
    '<pre><code class="language-txt">value</code></pre>',
  );
});
