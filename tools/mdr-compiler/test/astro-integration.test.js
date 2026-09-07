const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createGeneratedPage, isMdrSourceFile, parseFrontmatter, routePattern,
} = require('../src/astro-integration');

test('recognizes MDR pages and hierarchical definition files as source files', () => {
  assert.equal(isMdrSourceFile('/project/src/pages/index.mdr'), true);
  assert.equal(isMdrSourceFile('/project/src/pages/tags.mdrdef'), true);
  assert.equal(isMdrSourceFile('/project/src/pages/data.json'), false);
});

test('reads MDR frontmatter and keeps the page body', () => {
  const document = parseFrontmatter(`---\ntitle: "論理式"\nlayout: ../../layouts/BaseLayout.astro\nbreadcrumbs:\n  - href: /index.html\n    label: ホーム\nscripts:\n  - ../../scripts/search.ts\n---\n本文`);
  assert.deepEqual(document.attributes, {
    title: '論理式',
    layout: '../../layouts/BaseLayout.astro',
    breadcrumbs: [{ href: '/index.html', label: 'ホーム' }],
    scripts: ['../../scripts/search.ts'],
  });
  assert.equal(document.body, '本文');
});

test('reads frontmatter with CR-only line endings', () => {
  const document = parseFrontmatter('---\rtitle: Test\rlayout: ../Layout.astro\r---\rBody');
  assert.deepEqual(document.attributes, { title: 'Test', layout: '../Layout.astro' });
  assert.equal(document.body, 'Body');
});

test('maps MDR pages to Astro routes', () => {
  assert.equal(routePattern('index.mdr'), '/');
  assert.equal(routePattern('math/index.mdr'), '/math');
  assert.equal(routePattern('math/logical-formula.mdr'), '/math/logical-formula');
});

test('generates Astro template markup instead of a content string', () => {
  const page = createGeneratedPage({
    sourcePath: '/project/src/pages/index.mdr',
    generatedPath: '/project/.mdr-generated/index.astro',
    html: '<h2>目次</h2><code>const value = { key: 1 };</code>',
    attributes: { layout: '../layouts/BaseLayout.astro', title: 'トップ' },
  });
  assert.match(page, /import Layout from "\.\.\/src\/layouts\/BaseLayout\.astro";/);
  assert.ok(page.includes('<h2>目次</h2>'));
  assert.ok(page.includes('<code>const value = &#123; key: 1 &#125;;</code>'));
  assert.doesNotMatch(page, /set:html|const content|\.md"|Content/);
});

test('emits frontmatter scripts through Astro client bundling', () => {
  const page = createGeneratedPage({
    sourcePath: '/project/src/pages/search.mdr',
    generatedPath: '/project/.mdr-generated/search.astro',
    html: '<input id="searchInput">',
    attributes: {
      layout: '../layouts/BaseLayout.astro',
      title: '用語検索',
      scripts: ['../scripts/search.ts'],
    },
  });
  assert.match(page, /<Fragment slot="page-scripts">/);
  assert.match(page, /<script>import "\.\.\/src\/scripts\/search\.ts";<\/script>/);
  assert.doesNotMatch(page, /extraScripts|\?url|\?worker/);
});

const tagDefinitions = { section: [{ attribute: 'data-label' }] };
