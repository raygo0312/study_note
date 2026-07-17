const test = require('node:test');
const assert = require('node:assert/strict');
const { parseFrontmatter, transformMdrToMarkdown, routePattern } = require('../src/astro-integration');

test('reads MDR frontmatter and keeps the page body', () => {
  const document = parseFrontmatter(`---\ntitle: "論理式"\nlayout: ../../layouts/BaseLayout.astro\nbreadcrumbs:\n  - href: /index.html\n    label: ホーム\n---\n本文`);
  assert.deepEqual(document.attributes, {
    title: '論理式',
    layout: '../../layouts/BaseLayout.astro',
    breadcrumbs: [{ href: '/index.html', label: 'ホーム' }],
  });
  assert.equal(document.body, '本文');
});

test('converts MDR-only syntax while preserving code fences', () => {
  assert.equal(transformMdrToMarkdown('+ 一つ\n+ 二つ\n\nこれは *重要*。\n\n```txt\n+ そのまま\n* そのまま\n```'),
    '1. 一つ\n2. 二つ\n\nこれは **重要**。\n\n```txt\n+ そのまま\n* そのまま\n```');
});

test('maps MDR pages to Astro routes', () => {
  assert.equal(routePattern('index.mdr'), '/');
  assert.equal(routePattern('math/index.mdr'), '/math');
  assert.equal(routePattern('math/logical-formula.mdr'), '/math/logical-formula');
});
