const test = require('node:test');
const assert = require('node:assert/strict');
const { transformMath, transformMathLine } = require('../src/math');

test('converts Typst math to MathJax TeX', () => {
  assert.equal(transformMathLine('$A <-> B$'), '\\(A \\leftrightarrow B\\)');
  assert.equal(transformMathLine('$ A <-> B $'), '\\[A \\leftrightarrow B\\]');
});

test('does not convert math-like text in code', () => {
  assert.equal(transformMath('`$A <-> B$`\n\n```typ\n$A <-> B$\n```'),
    '`$A <-> B$`\n\n```typ\n$A <-> B$\n```');
});

test('does not convert escaped math delimiters', () => {
  assert.equal(transformMathLine('料金は \\$5 で，式は \\$A\\$。'),
    '料金は \\$5 で，式は \\$A\\$。');
});
