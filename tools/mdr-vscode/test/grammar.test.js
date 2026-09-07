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

test('highlights bare definition links but not escaped brackets', () => {
  const definitionLink = inlineGrammar.patterns.find(({ name }) =>
    name === 'meta.link.definition.mdr');
  const pattern = new RegExp(definitionLink.match);
  assert.ok(pattern.test('[論理体系]'));
  assert.equal(pattern.test('\\[論理体系\\]'), false);
  assert.equal(pattern.test('[表示](target.html)'), false);
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

test('lets block tags nest inside one another', () => {
  const blockRules = ['section', 'div-shorthand', 'tag'];
  for (const rule of blockRules) {
    const includes = grammar.repository[rule].patterns.map(({ include }) => include);
    for (const nested of ['#void-tag', '#section', '#div-shorthand', '#tag']) {
      assert.ok(
        includes.includes(nested),
        `${rule} must allow ${nested} so a nested ::: keeps its own scope`,
      );
    }
  }
});

test('defines MDR syntax on its own instead of delegating to Markdown', () => {
  const json = JSON.stringify(grammar) + JSON.stringify(inlineGrammar);
  assert.equal(json.includes('text.html.markdown'), false,
    'MDR is its own language; including the Markdown grammar lets its multi-line '
    + 'paragraph and indented-code rules swallow the ::: lines that follow');

  for (const rule of ['heading', 'list', 'fenced-code']) {
    assert.ok(grammar.repository[rule], `${rule} must be covered by MDR itself`);
  }
  for (const scope of ['section', 'div-shorthand', 'tag']) {
    const includes = grammar.repository[scope].patterns.map(({ include }) => include);
    for (const rule of ['#heading', '#list', '#fenced-code']) {
      assert.ok(includes.includes(rule), `${scope} must also allow ${rule}`);
    }
  }
});

test('keeps the closing ] available to an inline tag', () => {
  const stealsBrackets = inlineGrammar.patterns.some(({ name, match }) =>
    name === 'text.plain.mdr' && match && match.includes(']'));
  assert.equal(stealsBrackets, false,
    'a top level rule matching ] wins over the inline tag end pattern, '
    + 'so the tag never closes and swallows the following lines');
});

test('leaves bracket contents and heading text unstyled', () => {
  const named = (rule, group) => (rule.captures || {})[group]?.name;

  const heading = grammar.repository.heading;
  assert.equal(named(heading, '3'), undefined, 'heading text must take no colour');
  assert.equal(heading.name.startsWith('markup.heading'), false,
    'markup.heading is styled by themes, so the whole line would take a colour');

  const links = inlineGrammar.patterns.filter(({ match }) => match && match.includes('(\\['));
  assert.ok(links.length > 0);
  for (const link of links) {
    assert.equal(named(link, '2'), undefined, 'the label inside [] must take no colour');
    assert.equal(named(link, '5'), undefined, 'the target inside () must take no colour');
  }

  assert.equal(JSON.stringify(inlineGrammar).includes('underline'), false,
    'link scopes that themes underline must not be used');
});

test('colours what sits between identical delimiters', () => {
  const code = inlineGrammar.patterns.find(({ match }) => match && match.startsWith('(?<![\\\\`])(`)'));
  assert.equal(code.captures['2'].name, 'markup.inline.raw.string.markdown',
    'a pair of identical delimiters shows its extent only through the content, '
    + 'and this scope also keeps the injection out of inline code');

  const term = inlineGrammar.patterns.find(({ match }) => match && match.startsWith('(?<![\\\\*])(\\*)'));
  assert.equal(term.captures['2'].name, 'markup.bold.markdown');

  assert.ok(inlineGrammar.injectionSelector.includes('-markup.inline.raw'),
    'inline code must stay free of MDR syntax');
});
