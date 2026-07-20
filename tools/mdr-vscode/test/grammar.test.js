const test = require('node:test');
const assert = require('node:assert/strict');
const packageManifest = require('../package.json');
const grammar = require('../syntaxes/mdr.tmLanguage.json');
const inlineGrammar = require('../syntaxes/mdr-inline-injection.tmLanguage.json');
const { isVoidTag } = require('../../mdr-compiler/src/tag-syntax');

test('registers the MDR image as the light and dark language icon', () => {
  const [language] = packageManifest.contributes.languages;
  assert.deepEqual(language.icon, { light: './icon.png', dark: './icon.png' });
  assert.deepEqual(language.extensions, ['.mdr', '.mdrdef']);
});

test('matches inline tags with any number of class and id modifiers', () => {
  const inlineTag = inlineGrammar.patterns.find(({ name }) => name === 'meta.inline.tag.mdr');
  const match = new RegExp(inlineTag.begin).exec(':span.a.b.c#main[text]');
  assert.ok(match);
  assert.equal(match[0], ':span.a.b.c#main[');
  assert.equal(new RegExp(inlineTag.begin).exec(':.note[text]')[0], ':.note[');
  assert.equal(new RegExp(inlineTag.begin).exec(':[text]')[0], ':[');
});

test('matches block tags with an omitted div name', () => {
  const shorthand = grammar.repository['div-shorthand'];
  assert.ok(new RegExp(shorthand.begin).test(':::.panel#main'));
  assert.ok(new RegExp(shorthand.begin).test(':::#main'));
  assert.equal(new RegExp(shorthand.begin).test(':::'), false);
  assert.equal(shorthand.beginCaptures['2'].name, 'entity.name.tag.html');
  assert.equal(shorthand.beginCaptures['3'].name,
    'entity.other.attribute-name.class.css');
});

test('separates tag and class colors for generic and section tags', () => {
  const tag = grammar.repository.tag;
  assert.ok(new RegExp(tag.begin).test(':::div.you'));
  assert.equal(tag.beginCaptures['2'].name, 'entity.name.tag.html');
  assert.equal(tag.beginCaptures['3'].name, 'entity.name.tag.html');
  assert.equal(tag.beginCaptures['4'].name, 'entity.other.attribute-name.class.css');

  const section = grammar.repository.section;
  assert.ok(new RegExp(section.begin).test(':::section.ex'));
  assert.equal(section.beginCaptures['2'].name, 'entity.name.tag.html');
  assert.equal(section.beginCaptures['3'].name, 'entity.name.tag.html');
  assert.equal(section.beginCaptures['4'].name,
    'entity.other.attribute-name.class.css');
});

test('keeps the TextMate void-tag list aligned with the compiler', () => {
  const voidTag = grammar.repository['void-tag'];
  const pattern = new RegExp(voidTag.match);
  for (const name of [
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta',
    'param', 'source', 'track', 'wbr',
  ]) {
    assert.equal(isVoidTag(name), true);
    assert.ok(pattern.test(`:::${name}`), `TextMate grammar is missing ${name}`);
  }
});
