const LANGUAGE_ALIASES = {
  js: 'javascript',
  jsx: 'javascriptreact',
  ts: 'typescript',
  tsx: 'typescriptreact',
  typ: 'typst',
  typc: 'typst-code',
};

async function replaceAsync(value, pattern, replacer) {
  const matches = [...value.matchAll(pattern)];
  if (matches.length === 0) return value;
  let output = '';
  let cursor = 0;
  for (const match of matches) {
    output += value.slice(cursor, match.index) + await replacer(match);
    cursor = match.index + match[0].length;
  }
  return output + value.slice(cursor);
}

async function formatMath(line, formatLanguage) {
  return replaceAsync(line, /(?<![\\$])\$([^$\n]+?)(?<!\\)\$/g, async (match) => {
    const wrapped = `$${match[1]}$`;
    const formatted = await formatLanguage('typst', wrapped);
    if (!formatted) return match[0];
    const trimmed = formatted.trim();
    if (!trimmed.startsWith('$') || !trimmed.endsWith('$')) return match[0];
    return trimmed;
  });
}

async function formatEmbedded(source, formatLanguage) {
  const lines = source.split('\n');
  const output = [];
  for (let index = 0; index < lines.length; index += 1) {
    const fence = /^(\s*)```\s*([^\s`]*)[^`]*$/.exec(lines[index]);
    if (!fence) {
      output.push(await formatMath(lines[index], formatLanguage));
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
    const formatted = language ? await formatLanguage(language, content) : undefined;
    output.push(lines[index]);
    output.push(...(formatted === undefined ? content : formatted.replace(/\n$/, '')).split('\n'));
    output.push(lines[end]);
    index = end;
  }
  return output.join('\n');
}

module.exports = { formatEmbedded };
