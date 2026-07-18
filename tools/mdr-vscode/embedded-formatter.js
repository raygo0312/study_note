const LANGUAGE_ALIASES = {
  js: 'javascript',
  jsx: 'javascriptreact',
  ts: 'typescript',
  tsx: 'typescriptreact',
  typ: 'typst',
  typc: 'typst-code',
};
const HIGHLIGHT_ONLY_LANGUAGES = new Set(['typst', 'typst-code', 'rust']);

async function formatEmbedded(source, formatLanguage) {
  const lines = source.split('\n');
  const output = [];
  for (let index = 0; index < lines.length; index += 1) {
    const fence = /^(\s*)```\s*([^\s`]*)[^`]*$/.exec(lines[index]);
    if (!fence) {
      output.push(lines[index]);
      continue;
    }

    const end = lines.findIndex((line, candidate) => candidate > index
      && line.startsWith(fence[1]) && /^```\s*$/.test(line.slice(fence[1].length)));
    if (end === -1) {
      output.push(lines[index]);
      continue;
    }

    const language = LANGUAGE_ALIASES[fence[2]] || fence[2];
    const content = lines.slice(index + 1, end).join('\n');
    const formatted = language && !HIGHLIGHT_ONLY_LANGUAGES.has(language)
      ? await formatLanguage(language, content) : undefined;
    output.push(lines[index]);
    output.push(...(formatted === undefined ? content : formatted.replace(/\n$/, '')).split('\n'));
    output.push(lines[end]);
    index = end;
  }
  return output.join('\n');
}

module.exports = { formatEmbedded };
