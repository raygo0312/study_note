const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { resolveDocument } = require('../src/tag-definitions');

test('imports positional tag argument definitions from another MDR file', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'mdr-tags-'));
  const definitionsPath = path.join(directory, 'src', 'mdr', 'definitions', 'tags.mdr');
  const pagePath = path.join(directory, 'src', 'pages', 'page.mdr');
  fs.mkdirSync(path.dirname(definitionsPath), { recursive: true });
  fs.mkdirSync(path.dirname(pagePath), { recursive: true });
  fs.writeFileSync(definitionsPath, '@tag section(label=data-label)\n');
  fs.writeFileSync(pagePath, '@import "definitions/tags.mdr"\n:::section.def 命題\n本文\n:::');
  const document = resolveDocument(pagePath);
  assert.deepEqual(document.definitions,
    { section: [{ name: 'label', attribute: 'data-label' }] });
  assert.equal(document.source, ':::section.def 命題\n本文\n:::');
});
