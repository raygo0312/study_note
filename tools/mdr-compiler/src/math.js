const { typst2tex } = require('tex2typst');
const PROTECTED_MATH_SLASH = '\uE000';
const PROTECTED_MATH_ASTERISK = '\uE001';

function transformMathLine(line, {
  markdown = false, protectDelimiters = false, protectMdr = false,
} = {}) {
  const parts = [];
  let cursor = 0;
  const codePattern = /`[^`\n]+`/g;
  let match;

  const convert = (text) => text.replace(/(?<!\\)\$(.+?)(?<!\\)\$/g, (_match, inner) => {
    const blockMathMode = /^\s.*\s$/.test(inner);
    let converted = typst2tex(inner.trim(), { blockMathMode });
    if (markdown) converted = converted.replace(/\r?\n/g, ' ');
    if (protectMdr) converted = converted.replaceAll('*', PROTECTED_MATH_ASTERISK);
    if (protectDelimiters) converted = converted.replaceAll('\\', PROTECTED_MATH_SLASH);
    const slash = protectDelimiters ? PROTECTED_MATH_SLASH : '\\';
    const open = blockMathMode ? (markdown ? `\\\\[` : `${slash}[`) : (markdown ? `\\\\(` : `${slash}(`);
    const close = blockMathMode ? (markdown ? `\\\\]` : `${slash}]`) : (markdown ? `\\\\)` : `${slash})`);
    return `${open}${converted}${close}`;
  });

  while ((match = codePattern.exec(line)) !== null) {
    parts.push(convert(line.slice(cursor, match.index)));
    parts.push(match[0]);
    cursor = match.index + match[0].length;
  }
  parts.push(convert(line.slice(cursor)));
  return parts.join('');
}

function transformMath(source, options = {}) {
  let inFence = false;
  return source.split('\n').map((line) => {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      return line;
    }
    return inFence ? line : transformMathLine(line, options);
  }).join('\n');
}

module.exports = {
  PROTECTED_MATH_ASTERISK, PROTECTED_MATH_SLASH, transformMath, transformMathLine,
};
