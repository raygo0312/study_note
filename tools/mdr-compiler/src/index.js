const { TokenType, lex } = require('./lexer');
const { parse } = require('./parser');
const { compile, escapeHtml, render } = require('./compiler');
const { compileProject, findMdrFiles, pageOutputPath } = require('./project-compiler');
const { mdr, transformInlineMdr } = require('./astro-integration');
const { format, formatAst } = require('./formatter');
const { highlight, scopes } = require('./highlighter');
const { transformMath, transformMathLine } = require('./math');
const { findImportRoot, parseDefinitions, resolveDocument, stripDirectives } = require('./tag-definitions');
const { parseArguments, parseBlockTagStart, parseDescriptor } = require('./tag-syntax');
const { parseFrontmatter } = require('./frontmatter');

module.exports = {
  TokenType, lex, parse, compile, escapeHtml, render,
  compileProject, findMdrFiles, pageOutputPath,
  mdr, transformInlineMdr, transformMath, transformMathLine,
  format, formatAst, highlight, scopes,
  findImportRoot, parseDefinitions, resolveDocument, stripDirectives,
  parseArguments, parseBlockTagStart, parseDescriptor, parseFrontmatter,
};
