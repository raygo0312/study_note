const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  parseDefinitions, resolveDocument, stripDirectives,
} = require('../src/tag-definitions');

test('loads every tags.mdrdef from pages root to the page directory', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'mdr-hierarchical-tags-'));
  const pagesRoot = path.join(directory, 'src', 'pages');
  const pageDirectory = path.join(pagesRoot, 'math', 'logic');
  const pagePath = path.join(pageDirectory, 'proof.mdr');
  fs.mkdirSync(pageDirectory, { recursive: true });
  fs.writeFileSync(path.join(pagesRoot, 'tags.mdrdef'), [
    '@tag section(data-root)',
    '@tag iframe(data-src)',
  ].join('\n'));
  fs.writeFileSync(path.join(pagesRoot, 'math', 'tags.mdrdef'),
    '@tag section(data-math)\n');
  fs.writeFileSync(path.join(pageDirectory, 'tags.mdrdef'),
    '@tag section(data-local)\n');
  fs.writeFileSync(pagePath, ':::section.def value\nbody\n:::');

  const document = resolveDocument(pagePath);
  assert.deepEqual(document.definitions, {
    section: [{ attribute: 'data-local' }],
    iframe: [{ attribute: 'data-src' }],
  });
  fs.rmSync(directory, { recursive: true, force: true });
});

test('stops automatic definition discovery at the pages directory', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'mdr-tags-boundary-'));
  const pagesRoot = path.join(directory, 'src', 'pages');
  const pagePath = path.join(pagesRoot, 'page.mdr');
  fs.mkdirSync(pagesRoot, { recursive: true });
  fs.writeFileSync(path.join(directory, 'src', 'tags.mdrdef'), '@tag outside(data-value)\n');
  fs.writeFileSync(pagePath, 'body');

  assert.deepEqual(resolveDocument(pagePath).definitions, {});
  fs.rmSync(directory, { recursive: true, force: true });
});

test('ignores directive-like text inside code fences', () => {
  const source = '```mdr\n@tag section(data-label)\n@import "tags.mdr"\n```';
  assert.deepEqual(parseDefinitions(source), {});
  assert.equal(stripDirectives(source), source);
});

test('rejects malformed directives instead of silently stripping them', () => {
  assert.throws(() => parseDefinitions('@tag section data-label'),
    /Invalid @tag directive at line 1/);
});
