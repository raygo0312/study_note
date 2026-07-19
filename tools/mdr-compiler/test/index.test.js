const test = require('node:test');
const assert = require('node:assert/strict');
const api = require('../src');

test('exports every declared public transformation function', () => {
  assert.equal(typeof api.transformInlineMdr, 'function');
  assert.equal(api.transformInlineMdr(':ruby[H:rt[x]]'), '<ruby>H<rt>x</rt></ruby>');
});
