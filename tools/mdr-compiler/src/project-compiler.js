const fs = require('node:fs');
const path = require('node:path');
const { compile } = require('./compiler');

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
  const files = [];
  const assets = [];

  if (fs.existsSync(path.join(root, 'public'))) {
    assets.push(...copyPublicDirectory(path.join(root, 'public'), outputRoot));
  }

  for (const relativePage of pageFiles) {
    const outputRelativePath = pageOutputPath(relativePage);
    const outputPath = path.join(outputRoot, outputRelativePath);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    const source = fs.readFileSync(path.join(pagesRoot, relativePage), 'utf8');
    fs.writeFileSync(outputPath, `${compile(source)}\n`);
    files.push(outputRelativePath);
  }

  return { root, pagesRoot, outputRoot, files, assets };
}

module.exports = { compileProject, findMdrFiles, pageOutputPath };
