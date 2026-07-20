const { parse } = require('./parser');
const { transformMath } = require('./math');

function walkInline(nodes, visit) {
  for (const node of nodes || []) {
    visit(node);
    if (node.children) walkInline(node.children, visit);
  }
}

function walkBlocks(nodes, visit) {
  for (const node of nodes || []) {
    if (node.type === 'tag') walkBlocks(node.children, visit);
    else if (node.children) walkInline(node.children, visit);
    for (const item of node.items || []) {
      walkInline(item.children, visit);
      if (item.blocks) walkBlocks(item.blocks, visit);
    }
  }
}

function extractTerms(source) {
  const ast = parse(transformMath(source, { protectDelimiters: true, protectMdr: true }));
  const terms = [];
  walkBlocks(ast.children, (node) => {
    if (node.type !== 'strong') return;
    const name = node.children.map((child) => child.value || '').join('');
    if (name) terms.push(name);
  });
  return terms;
}

function buildTermDictionary(pages) {
  const entries = {};
  for (const page of pages) {
    extractTerms(page.source).forEach((term, index) => {
      if (entries[term]) {
        throw new Error(`Duplicate MDR definition "${term}": ${entries[term].sourcePath} and ${page.sourcePath}`);
      }
      entries[term] = {
        href: `${page.href}#define${index}`,
        sourcePath: page.sourcePath,
      };
    });
  }
  return {
    entries,
    terms: Object.keys(entries).sort((left, right) =>
      right.length - left.length || left.localeCompare(right)),
  };
}

function renderLinkedText(value, dictionary, renderText, renderLink, { skipMath = false } = {}) {
  if (!dictionary?.terms?.length || !value) return renderText(value);
  const mathPattern = /\\\\\([\s\S]*?\\\\\)|\\\\\[[\s\S]*?\\\\\]/g;
  let output = '';
  let cursor = 0;
  const renderPlain = (text) => {
    let result = '';
    let offset = 0;
    while (offset < text.length) {
      const term = dictionary.terms.find((candidate) => text.startsWith(candidate, offset));
      if (!term) {
        let end = offset + 1;
        while (end < text.length
          && !dictionary.terms.some((candidate) => text.startsWith(candidate, end))) end += 1;
        result += renderText(text.slice(offset, end));
        offset = end;
        continue;
      }
      result += renderLink(term, dictionary.entries[term].href);
      offset += term.length;
    }
    return result;
  };
  if (!skipMath) return renderPlain(value);
  for (const match of value.matchAll(mathPattern)) {
    output += renderPlain(value.slice(cursor, match.index));
    output += renderText(match[0]);
    cursor = match.index + match[0].length;
  }
  return output + renderPlain(value.slice(cursor));
}

function resolveTermHref(destination, dictionary) {
  if (!destination.startsWith('*')) return destination;
  const term = destination.slice(1);
  const entry = dictionary?.entries?.[term];
  if (!entry) throw new Error(`Unknown MDR definition reference: ${term}`);
  return entry.href;
}

module.exports = { buildTermDictionary, extractTerms, renderLinkedText, resolveTermHref };
