#!/usr/bin/env node

const path = require('node:path');
const { compileProject } = require('./project-compiler');

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log('Usage: mdr [project-dir] [--pages-dir <directory>] [--out-dir <directory>]');
  process.exit(0);
}
const projectPath = args.find((argument) => !argument.startsWith('--')) || '.';
const outputFlag = args.indexOf('--out-dir');
const outputPath = outputFlag >= 0 ? args[outputFlag + 1] : 'dist';
const pagesFlag = args.indexOf('--pages-dir');
const pagesPath = pagesFlag >= 0 ? args[pagesFlag + 1] : 'src/pages';

if ((outputFlag >= 0 && !outputPath) || (pagesFlag >= 0 && !pagesPath)) {
  console.error('Usage: npm run compile -- [project-dir] [--pages-dir <directory>] [--out-dir <directory>]');
  process.exitCode = 1;
} else {
  const result = compileProject(path.resolve(projectPath), {
    pagesDirectory: pagesPath,
    outputDirectory: outputPath,
  });
  console.log(`Compiled ${result.files.length} page(s) and copied ${result.assets.length} asset(s) to ${result.outputRoot}`);
  result.files.forEach((file) => console.log(`  ${file}`));
}
