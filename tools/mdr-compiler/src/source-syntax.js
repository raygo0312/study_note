const CODE_FENCE_OPEN_PATTERN = /^[ \t]*```(.*)$/;
const CODE_FENCE_CLOSE_PATTERN = /^[ \t]*```[ \t]*$/;

function matchCodeFence(line, inFence = false) {
  if (inFence) {
    return CODE_FENCE_CLOSE_PATTERN.test(line)
      ? { closing: true, info: '' }
      : null;
  }
  const match = CODE_FENCE_OPEN_PATTERN.exec(line);
  return match ? { closing: false, info: match[1].trim() } : null;
}

function splitSourceLines(source) {
  const lines = [];
  let offset = 0;
  for (const match of source.matchAll(/([^\r\n]*)(\r\n|\n|\r|$)/g)) {
    const [, text, newline] = match;
    if (text === '' && newline === '' && offset === source.length) break;
    lines.push({ text, newline, offset });
    offset += text.length + newline.length;
    if (newline === '') break;
  }
  if (source === '') lines.push({ text: '', newline: '', offset: 0 });
  return lines;
}

module.exports = { matchCodeFence, splitSourceLines };
