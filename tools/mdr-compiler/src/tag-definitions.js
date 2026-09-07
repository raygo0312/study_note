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

function findPagesRoot(sourcePath) {
  let directory = path.dirname(path.resolve(sourcePath));
  while (true) {
    if (path.basename(directory) === 'pages') return directory;
    const parent = path.dirname(directory);
    if (parent === directory) return null;
    directory = parent;
  }
}

function findHierarchicalDefinitionFiles(sourcePath, configuredPagesRoot) {
  const pagesRoot = configuredPagesRoot
    ? path.resolve(configuredPagesRoot) : findPagesRoot(sourcePath);
  if (!pagesRoot) return [];
  const relativePage = path.relative(pagesRoot, path.resolve(sourcePath));
  if (relativePage.startsWith('..') || path.isAbsolute(relativePage)) return [];
  const directories = [];
  let directory = path.dirname(path.resolve(sourcePath));
  while (true) {
    directories.push(directory);
    if (directory === pagesRoot) break;
    directory = path.dirname(directory);
  }
  return directories.reverse()
    .map((entry) => path.join(entry, 'tags.mdrdef'))
    .filter((entry) => fs.existsSync(entry));
}

function readDefinitions(sourcePath, source) {
  const documentSource = source ?? fs.readFileSync(path.resolve(sourcePath), 'utf8');
  return { source: stripDirectives(documentSource), definitions: parseDefinitions(documentSource) };
}

// タグ定義は pages ルートから各ページのディレクトリまでの tags.mdrdef を辿って
// 集める。下位ディレクトリの定義があとから上書きする。
function resolveDocument(sourcePath, source = fs.readFileSync(sourcePath, 'utf8'), options = {}) {
  const definitions = {};
  for (const definitionPath of findHierarchicalDefinitionFiles(sourcePath, options.pagesRoot)) {
    Object.assign(definitions, readDefinitions(definitionPath).definitions);
  }
  const document = readDefinitions(sourcePath, source);
  Object.assign(definitions, document.definitions);
  return { source: document.source, definitions };
}

module.exports = {
  findHierarchicalDefinitionFiles,
  parseDefinitions,
  resolveDocument,
  stripDirectives,
};
