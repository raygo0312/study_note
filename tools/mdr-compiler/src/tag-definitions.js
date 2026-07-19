const fs = require('node:fs');
const path = require('node:path');
const { matchCodeFence, splitSourceLines } = require('./source-syntax');

function scanDirectives(source) {
  const directives = [];
  let inFence = false;
  splitSourceLines(source).forEach(({ text }, index) => {
    const fence = matchCodeFence(text, inFence);
    if (fence) {
      inFence = !inFence;
      return;
    }
    if (inFence) return;

    if (/^\s*@tag\b/.test(text)) {
      const match = /^\s*@tag\s+([a-z][a-z0-9-]*)\s*\(([^)]*)\)\s*$/.exec(text);
      if (!match) throw new Error(`Invalid @tag directive at line ${index + 1}: ${text.trim()}`);
      directives.push({ type: 'tag', line: index + 1, name: match[1], value: match[2] });
      return;
    }
    if (/^\s*@import\b/.test(text)) {
      const match = /^\s*@import\s+(?:"([^"]+)"|'([^']+)')\s*$/.exec(text);
      if (!match) {
        throw new Error(`Invalid @import directive at line ${index + 1}: ${text.trim()}`);
      }
      directives.push({ type: 'import', line: index + 1, value: match[1] || match[2] });
    }
  });
  return directives;
}

function parseDefinitions(source) {
  const definitions = {};
  for (const directive of scanDirectives(source)) {
    if (directive.type !== 'tag') continue;
    definitions[directive.name] = directive.value.split(',')
      .map((entry) => entry.trim()).filter(Boolean)
      .map((entry) => {
        if (!/^[a-zA-Z_:][\w:.-]*$/.test(entry)) {
          throw new Error(`Invalid tag attribute definition at line ${directive.line}: ${entry}`);
        }
        return { attribute: entry };
      });
  }
  return definitions;
}

function stripDirectives(source) {
  const directiveLines = new Set(scanDirectives(source).map(({ line }) => line));
  return splitSourceLines(source)
    .filter((_line, index) => !directiveLines.has(index + 1))
    .map(({ text, newline }) => `${text}${newline}`)
    .join('');
}

function findImportRoot(sourcePath) {
  let directory = path.dirname(path.resolve(sourcePath));
  while (true) {
    if (path.basename(directory) === 'src') return path.join(directory, 'mdr');
    const parent = path.dirname(directory);
    if (parent === directory) break;
    directory = parent;
  }
  throw new Error(`Cannot find src/mdr import root for: ${sourcePath}`);
}

function resolveDocumentInternal(sourcePath, source, seen, importRoot) {
  const resolvedPath = path.resolve(sourcePath);
  const documentSource = source ?? fs.readFileSync(resolvedPath, 'utf8');
  if (seen.has(resolvedPath)) throw new Error(`Circular MDR import: ${resolvedPath}`);
  seen.add(resolvedPath);
  const definitions = parseDefinitions(documentSource);
  for (const directive of scanDirectives(documentSource)) {
    if (directive.type !== 'import') continue;
    const importedPath = path.resolve(importRoot, directive.value);
    const relativeImport = path.relative(importRoot, importedPath);
    if (relativeImport.startsWith('..') || path.isAbsolute(relativeImport)) {
      throw new Error(`MDR import escapes src/mdr at line ${directive.line}: ${directive.value}`);
    }
    const imported = resolveDocumentInternal(importedPath, undefined, seen, importRoot);
    Object.assign(definitions, imported.definitions);
  }
  seen.delete(resolvedPath);
  return { source: stripDirectives(documentSource), definitions };
}

function resolveDocument(sourcePath, source = fs.readFileSync(sourcePath, 'utf8')) {
  return resolveDocumentInternal(sourcePath, source, new Set(), findImportRoot(sourcePath));
}

module.exports = { findImportRoot, parseDefinitions, resolveDocument, stripDirectives };
