const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  parseDefinitions, resolveDocument, stripDirectives,
} = require('../src/tag-definitions');

test('imports positional tag argument definitions from another MDR file', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'mdr-tags-'));
  const definitionsPath = path.join(directory, 'src', 'mdr', 'definitions', 'tags.mdr');
  const pagePath = path.join(directory, 'src', 'pages', 'page.mdr');
  fs.mkdirSync(path.dirname(definitionsPath), { recursive: true });
  fs.mkdirSync(path.dirname(pagePath), { recursive: true });
  fs.writeFileSync(definitionsPath, '@tag section(data-label)\n');
  fs.writeFileSync(pagePath, '@import "definitions/tags.mdr"\n:::section.def 命題\n本文\n:::');
  const document = resolveDocument(pagePath);
  assert.deepEqual(document.definitions,
    { section: [{ attribute: 'data-label' }] });
  assert.equal(document.source, ':::section.def 命題\n本文\n:::');
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

test('rejects imports that escape the project src/mdr directory', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'mdr-import-root-'));
  const pagePath = path.join(directory, 'src', 'pages', 'page.mdr');
  fs.mkdirSync(path.dirname(pagePath), { recursive: true });
  fs.writeFileSync(pagePath, '@import "../outside.mdr"');

  assert.throws(() => resolveDocument(pagePath), /MDR import escapes src\/mdr/);
  fs.rmSync(directory, { recursive: true, force: true });
});
