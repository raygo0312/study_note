const test = require('node:test');
const assert = require('node:assert/strict');
const { compile } = require('../src/compiler');
const {
  buildTermDictionary, extractTerms,
} = require('../src/term-dictionary');

test('extracts MDR definitions while ignoring code and math asterisks', () => {
  assert.deepEqual(extractTerms('*論理体系* と `*code*` と $F^*$'), ['論理体系']);
});

test('builds file and id links and rejects duplicate definitions', () => {
  const dictionary = buildTermDictionary([
    { source: '*論理* と *論理体系*', href: '/logic.html', sourcePath: 'logic.mdr' },
  ]);
  assert.equal(dictionary.entries['論理体系'].href, '/logic.html#define1');
  assert.deepEqual(dictionary.terms, ['論理体系', '論理']);
  assert.throws(() => buildTermDictionary([
    { source: '*論理*', href: '/a.html', sourcePath: 'a.mdr' },
    { source: '*論理*', href: '/b.html', sourcePath: 'b.mdr' },
  ]), /Duplicate MDR definition "論理".*a\.mdr.*b\.mdr/);
});

test('auto-links longest terms and resolves explicit definition links', () => {
  const termDictionary = buildTermDictionary([
    { source: '*論理* と *論理体系*', href: '/logic.html', sourcePath: 'logic.mdr' },
  ]);
  assert.equal(compile('論理体系と論理。[こちら](/plain) [別名](*論理)', {
    termDictionary,
  }), [
    '<p><a href="/logic.html#define1">論理体系</a>と<a href="/logic.html#define0">論理</a>。',
    '<a href="/plain">こちら</a> ',
    '<a href="/logic.html#define0">別名</a></p>',
  ].join(''));
});

test('does not auto-link inside definitions, links, code, or headings', () => {
  const termDictionary = buildTermDictionary([
    { source: '*論理*', href: '/logic.html', sourcePath: 'logic.mdr' },
  ]);
  assert.equal(compile('# 論理\n*論理* `[論理]` [論理](/other)', { termDictionary }), [
    '<h1>論理</h1>',
    '<p><dfn id="define0">論理</dfn> <code>[論理]</code> <a href="/other">論理</a></p>',
  ].join('\n'));
});

test('rejects an explicit reference to an unknown definition', () => {
  assert.throws(() => compile('[用語](*未定義)', {
    termDictionary: { entries: {}, terms: [] },
  }), /Unknown MDR definition reference: 未定義/);
});
