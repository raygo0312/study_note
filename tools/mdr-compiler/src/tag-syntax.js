const VOID_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta',
  'param', 'source', 'track', 'wbr',
]);

function isVoidTag(name) {
  return VOID_TAGS.has(name);
}

function parseDescriptor(value, defaultName) {
  const match = /^([a-z][a-z0-9-]*)?((?:[.#][a-zA-Z_][\w-]*)*)$/.exec(value);
  if (!match) return null;
  const name = match[1] || defaultName;
  if (!name || (!match[1] && match[2] === '' && defaultName !== 'span')) return null;
  const classes = [];
  let id;
  for (const modifier of match[2].match(/[.#][a-zA-Z_][\w-]*/g) || []) {
    if (modifier[0] === '.') classes.push(modifier.slice(1));
    else {
      if (id) throw new Error(`Duplicate tag id: ${value}`);
      id = modifier.slice(1);
    }
  }
  return { name, classes, id, source: value };
}

function parseArguments(value = '') {
  const argumentsList = [];
  let cursor = 0;
  while (cursor < value.length) {
    while (/\s/.test(value[cursor])) cursor += 1;
    if (cursor >= value.length) break;
    if (value[cursor] === '(') {
      let depth = 1;
      let end = cursor + 1;
      for (; end < value.length && depth > 0; end += 1) {
        if (value[end] === '\\') end += 1;
        else if (value[end] === '(') depth += 1;
        else if (value[end] === ')') depth -= 1;
      }
      if (depth !== 0) throw new Error(`Unclosed tag argument: ${value}`);
      argumentsList.push(value.slice(cursor + 1, end - 1));
      cursor = end;
      continue;
    }
    let end = cursor;
    while (end < value.length && !/\s/.test(value[end])) end += 1;
    argumentsList.push(value.slice(cursor, end));
    cursor = end;
  }
  return argumentsList;
}

function parseBlockTagStart(line) {
  const match = /^([ \t]*):::([^\s]+)(?:[ \t]+(.*?))?[ \t]*$/.exec(line);
  if (!match || match[2] === '') return null;
  const descriptor = parseDescriptor(match[2], 'div');
  if (!descriptor) return null;
  return {
    indent: match[1],
    descriptor,
    arguments: parseArguments(match[3] || ''),
    void: isVoidTag(descriptor.name),
  };
}

function formatDescriptor(node) {
  const classes = (node.classes || []).map((value) => `.${value}`).join('');
  const omittedName = node.source === '' || /^[.#]/.test(node.source || '');
  return `${omittedName ? '' : node.name}${classes}${node.id ? `#${node.id}` : ''}`;
}

module.exports = {
  formatDescriptor, isVoidTag, parseArguments, parseBlockTagStart, parseDescriptor,
};
