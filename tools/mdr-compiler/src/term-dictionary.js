const path = require('node:path');
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

function resolveTermHref(destination, dictionary) {
  if (!destination.startsWith('*')) return destination;
  const term = destination.slice(1);
  const entry = dictionary?.entries?.[term];
  if (!entry) throw new Error(`Unknown MDR definition reference: ${term}`);
  return entry.href;
}

function relativizeTermDictionary(dictionary, fromFile) {
  const entries = {};
  const fromDirectory = path.posix.dirname(fromFile.replaceAll(path.sep, '/'));
  for (const term of dictionary.terms) {
    const entry = dictionary.entries[term];
    const [targetFile, fragment] = entry.href.split('#', 2);
    let relative = path.posix.relative(fromDirectory, targetFile.replace(/^\//, ''));
    if (!relative.startsWith('.')) relative = `./${relative}`;
    entries[term] = {
      ...entry,
      href: `${relative}${fragment === undefined ? '' : `#${fragment}`}`,
    };
  }
  return { entries, terms: dictionary.terms };
}

module.exports = {
  buildTermDictionary,
  extractTerms,
  relativizeTermDictionary,
  resolveTermHref,
};
