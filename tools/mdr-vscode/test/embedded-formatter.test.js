const test = require('node:test');
const assert = require('node:assert/strict');
const { formatEmbedded } = require('../embedded-formatter');

test('leaves Typst math unchanged without starting its formatter', async () => {
  const calls = [];
  const result = await formatEmbedded('前 $a+b$ 後', async (language, value) => {
    calls.push({ language, value });
    return '$ a + b $';
  });
  assert.equal(result, '前 $a+b$ 後');
  assert.deepEqual(calls, []);
});

test('leaves Typst fences unchanged without starting their formatter', async () => {
  for (const language of ['typst', 'typ', 'typc']) {
    const source = `\`\`\`${language}\na+b\n\`\`\``;
    let called = false;
    assert.equal(await formatEmbedded(source, async () => {
      called = true;
      return 'a + b';
    }), source);
    assert.equal(called, false);
  }
});

test('formats fenced code with language aliases and preserves its markers', async () => {
  const source = '```ts\nconst x:number=1\n```';
  const result = await formatEmbedded(source, async (language, value) => {
    assert.equal(language, 'typescript');
    assert.equal(value, 'const x:number=1');
    return 'const x: number = 1;\n';
  });
  assert.equal(result, '```ts\nconst x: number = 1;\n```');
});

test('leaves embedded content unchanged when no formatter is available', async () => {
  const source = '$a+b$\n\n```unknown\na+b\n```';
  assert.equal(await formatEmbedded(source, async () => undefined), source);
});

test('leaves Rust fences unchanged without starting their formatter', async () => {
  const source = '```rust\nlet value = "$raw$";\n```';
  const calls = [];
  const result = await formatEmbedded(source, async (language, value) => {
    calls.push({ language, value });
    return value;
  });
  assert.equal(result, source);
  assert.deepEqual(calls, []);
});
