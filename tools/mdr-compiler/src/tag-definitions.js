const fs = require('node:fs');
const path = require('node:path');

function parseDefinitions(source) {
  const definitions = {};
  for (const line of source.split(/\r?\n/)) {
    const match = /^\s*@tag\s+([a-z][a-z0-9-]*)\s*\(([^)]*)\)\s*$/.exec(line);
    if (!match) continue;
    definitions[match[1]] = match[2].split(',').map((entry) => entry.trim()).filter(Boolean)
      .map((entry) => {
        const binding = /^([a-zA-Z_][\w-]*)\s*=\s*([a-zA-Z_:][\w:.-]*)$/.exec(entry);
        if (!binding) throw new Error(`Invalid tag argument definition: ${entry}`);
        return { name: binding[1], attribute: binding[2] };
      });
  }
  return definitions;
}

function stripDirectives(source) {
  return source.split(/\r?\n/)
    .filter((line) => !/^\s*@(import|tag)\b/.test(line))
    .join('\n');
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
  for (const line of documentSource.split(/\r?\n/)) {
    const match = /^\s*@import\s+(?:"([^"]+)"|'([^']+)')\s*$/.exec(line);
    if (!match) continue;
    const importedPath = path.resolve(importRoot, match[1] || match[2]);
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
