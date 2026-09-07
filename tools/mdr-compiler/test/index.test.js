const test = require('node:test');
const assert = require('node:assert/strict');
const api = require('../src');

test('exports every declared public transformation function', () => {
  for (const name of ['compile', 'mdr', 'transformMath', 'transformMathLine', 'format']) {
    assert.equal(typeof api[name], 'function', `${name} must stay part of the public API`);
  }
  assert.equal(api.compile('# 見出し\n'), '<h1>見出し</h1>');
});
