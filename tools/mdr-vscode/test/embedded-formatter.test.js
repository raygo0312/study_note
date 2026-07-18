const test = require('node:test');
const assert = require('node:assert/strict');
const { formatEmbedded } = require('../embedded-formatter');

test('formats Typst math through the Typst document formatter', async () => {
  const calls = [];
  const result = await formatEmbedded('前 $a+b$ 後', async (language, value) => {
    calls.push({ language, value });
    return '$ a + b $';
  });
  assert.equal(result, '前 $ a + b $ 後');
  assert.deepEqual(calls, [{ language: 'typst', value: '$a+b$' }]);
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

test('does not interpret math delimiters inside fenced code', async () => {
  const source = '```rust\nlet value = "$raw$";\n```';
  const calls = [];
  await formatEmbedded(source, async (language, value) => {
    calls.push({ language, value });
    return value;
  });
  assert.deepEqual(calls, [{ language: 'rust', value: 'let value = "$raw$";' }]);
});
