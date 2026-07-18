const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createGeneratedPage, parseFrontmatter, transformMdrToMarkdown, routePattern,
} = require('../src/astro-integration');

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
    '1. 一つ\n2. 二つ\n\nこれは <dfn>重要</dfn>。\n\n```txt\n+ そのまま\n* そのまま\n```');
});

test('maps MDR pages to Astro routes', () => {
  assert.equal(routePattern('index.mdr'), '/');
  assert.equal(routePattern('math/index.mdr'), '/math');
  assert.equal(routePattern('math/logical-formula.mdr'), '/math/logical-formula');
});

test('generates an Astro page with rendered HTML instead of a Markdown import', () => {
  const page = createGeneratedPage({
    sourcePath: '/project/src/pages/index.mdr',
    generatedPath: '/project/.mdr-generated/index.astro',
    html: '<h2>目次</h2>',
    attributes: { layout: '../layouts/BaseLayout.astro', title: 'トップ' },
  });
  assert.match(page, /import Layout from "\.\.\/src\/layouts\/BaseLayout\.astro";/);
  assert.ok(page.includes('const content = "<h2>目次</h2>";'));
  assert.match(page, /<Fragment set:html=\{content\} \/>/);
  assert.doesNotMatch(page, /\.md"|Content/);
});

const tagDefinitions = { section: [{ name: 'label', attribute: 'data-label' }] };

test('converts generic tags while keeping the MDR source tag-free', () => {
  assert.equal(transformMdrToMarkdown(':::section.ex 命題\n本文\n:::', { tagDefinitions }),
    '<section class="ex" data-label="命題">\n<p>本文</p>\n</section>\n');
});

test('preserves code syntax while converting definitions', () => {
  assert.equal(transformMdrToMarkdown('これは `*code*` と *用語*。'),
    'これは `*code*` と <dfn>用語</dfn>。');
});

test('converts MDR math before Astro Markdown rendering', () => {
  assert.equal(transformMdrToMarkdown('これは $A <-> B$。\n\n```typ\n$A <-> B$\n```'),
    'これは \\\\(A \\leftrightarrow B\\\\)。\n\n```typ\n$A <-> B$\n```');
});

test('uses one MathJax delimiter slash inside raw tags', () => {
  assert.equal(transformMdrToMarkdown(':::section.ex 例\n$A <-> B$\n:::', { tagDefinitions }),
    '<section class="ex" data-label="例">\n<p>\\(A \\leftrightarrow B\\)</p>\n</section>\n');
});

test('preserves links and escaped markers in and outside tags', () => {
  assert.equal(transformMdrToMarkdown('[リンク](/reference.html) と \\*記号\\*'),
    '[リンク](/reference.html) と \\*記号\\*');
  assert.equal(transformMdrToMarkdown(':::section.ex 例\n[リンク](/reference.html) と \\*記号\\*\n:::', { tagDefinitions }),
    '<section class="ex" data-label="例">\n<p><a href="/reference.html">リンク</a> と *記号*</p>\n</section>\n');
});

test('converts inline tags without confusing Markdown links', () => {
  assert.equal(transformMdrToMarkdown(':span.note[説明] と [参照](/ref)'),
    '<span class="note">説明</span> と [参照](/ref)');
});
