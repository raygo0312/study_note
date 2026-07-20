const fs = require('node:fs');
const path = require('node:path');
const { compile } = require('./compiler');
const { parseFrontmatter } = require('./frontmatter');
const { resolveDocument } = require('./tag-definitions');
const { buildTermDictionary } = require('./term-dictionary');

const IGNORED_DIRECTORIES = new Set(['.git', 'node_modules', 'dist']);

function findMdrFiles(directory, root = directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && !IGNORED_DIRECTORIES.has(entry.name)) {
      files.push(...findMdrFiles(path.join(directory, entry.name), root));
    } else if (entry.isFile() && entry.name.endsWith('.mdr')) {
      files.push(path.relative(root, path.join(directory, entry.name)));
    }
  }
  return files.sort();
}

function pageOutputPath(relativePage) {
  const withoutExtension = relativePage.replace(/\.mdr$/, '');
  const parsed = path.posix.parse(withoutExtension.replaceAll(path.sep, '/'));
  const directory = parsed.name === 'index'
    ? parsed.dir
    : path.posix.join(parsed.dir, parsed.name);
  return path.posix.join(directory, 'index.html');
}

function copyPublicDirectory(source, destination, root = source) {
  const copied = [];
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);
    if (entry.isDirectory()) {
      copied.push(...copyPublicDirectory(sourcePath, destinationPath, root));
    } else if (entry.isFile()) {
      fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
      fs.copyFileSync(sourcePath, destinationPath);
      copied.push(path.relative(root, sourcePath));
    }
  }
  return copied.sort();
}

function compileProject(projectDirectory, options = {}) {
  const root = path.resolve(projectDirectory);
  const pagesDirectory = options.pagesDirectory || 'src/pages';
  const outputDirectory = options.outputDirectory || 'dist';
  const pagesRoot = path.resolve(root, pagesDirectory);
  const outputRoot = path.resolve(root, outputDirectory);
  const pageFiles = fs.existsSync(pagesRoot) ? findMdrFiles(pagesRoot) : [];
  const pageOutputs = pageFiles.map((relativePage) => ({
    relativePage,
    outputRelativePath: pageOutputPath(relativePage),
  }));
  const files = [];
  const assets = [];
  const outputSources = new Map();

  for (const { relativePage, outputRelativePath } of pageOutputs) {
    if (outputSources.has(outputRelativePath)) {
      throw new Error(`MDR route collision: ${outputSources.get(outputRelativePath)} and ${relativePage}`);
    }
    outputSources.set(outputRelativePath, relativePage);
  }

  if (fs.existsSync(path.join(root, 'public'))) {
    assets.push(...copyPublicDirectory(path.join(root, 'public'), outputRoot));
  }

  const documents = pageOutputs.map(({ relativePage, outputRelativePath }) => {
    const sourcePath = path.join(pagesRoot, relativePage);
    const document = resolveDocument(sourcePath, undefined, { pagesRoot });
    const { body } = parseFrontmatter(document.source);
    return { relativePage, outputRelativePath, sourcePath, document, body };
  });
  const termDictionary = buildTermDictionary(documents.map(({ body, outputRelativePath, sourcePath }) => ({
    source: body,
    href: `/${outputRelativePath.replaceAll(path.sep, '/')}`,
    sourcePath,
  })));
  fs.mkdirSync(outputRoot, { recursive: true });
  fs.writeFileSync(path.join(outputRoot, 'definitions.json'), `${JSON.stringify(
    Object.fromEntries(termDictionary.terms.map((term) => [term, termDictionary.entries[term].href])),
    null,
    2,
  )}\n`);

  for (const { outputRelativePath, document, body } of documents) {
    const outputPath = path.join(outputRoot, outputRelativePath);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, `${compile(body, {
      tagDefinitions: document.definitions,
      termDictionary,
      termIdState: { next: 0 },
    })}\n`);
    files.push(outputRelativePath);
  }

  return { root, pagesRoot, outputRoot, files, assets };
}

module.exports = { compileProject, findMdrFiles, pageOutputPath };
