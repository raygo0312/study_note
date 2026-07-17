const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { compileProject, findMdrFiles, pageOutputPath } = require('../src/project-compiler');

test('maps page files to Astro-style routes', () => {
  assert.equal(pageOutputPath('index.mdr'), 'index.html');
  assert.equal(pageOutputPath('about.mdr'), path.join('about', 'index.html'));
  assert.equal(pageOutputPath(path.join('blog', 'index.mdr')), path.join('blog', 'index.html'));
  assert.equal(pageOutputPath(path.join('blog', 'first-post.mdr')),
    path.join('blog', 'first-post', 'index.html'));
});

test('compiles src/pages and copies public assets', () => {
  const project = fs.mkdtempSync(path.join(os.tmpdir(), 'mdr-project-'));
  fs.mkdirSync(path.join(project, 'src', 'pages', 'blog'), { recursive: true });
  fs.mkdirSync(path.join(project, 'src', 'components'), { recursive: true });
  fs.mkdirSync(path.join(project, 'public', 'images'), { recursive: true });
  fs.mkdirSync(path.join(project, 'node_modules', 'ignored'), { recursive: true });
  fs.writeFileSync(path.join(project, 'src', 'pages', 'index.mdr'), '# Home');
  fs.writeFileSync(path.join(project, 'src', 'pages', 'about.mdr'), 'About');
  fs.writeFileSync(path.join(project, 'src', 'pages', 'blog', 'first-post.mdr'), '+ One');
  fs.writeFileSync(path.join(project, 'src', 'pages', 'not-a-page.txt'), 'Ignored');
  fs.writeFileSync(path.join(project, 'public', 'robots.txt'), 'User-agent: *');
  fs.writeFileSync(path.join(project, 'public', 'images', 'logo.svg'), '<svg/>');
  fs.writeFileSync(path.join(project, 'node_modules', 'ignored', 'bad.mdr'), 'Ignored');

  assert.deepEqual(findMdrFiles(path.join(project, 'src', 'pages')), [
    path.join('about.mdr'),
    path.join('blog', 'first-post.mdr'),
    path.join('index.mdr'),
  ]);

  const result = compileProject(project);
  assert.deepEqual(result.files, [
    path.join('about', 'index.html'),
    path.join('blog', 'first-post', 'index.html'),
    'index.html',
  ]);
  assert.deepEqual(result.assets, ['images/logo.svg', 'robots.txt']);
  assert.equal(fs.readFileSync(path.join(project, 'dist', 'index.html'), 'utf8'), '<h1>Home</h1>\n');
  assert.equal(fs.readFileSync(path.join(project, 'dist', 'about', 'index.html'), 'utf8'), '<p>About</p>\n');
  assert.equal(fs.readFileSync(path.join(project, 'dist', 'robots.txt'), 'utf8'), 'User-agent: *');
  assert.equal(fs.existsSync(path.join(project, 'dist', 'bad.mdr')), false);

  fs.rmSync(project, { recursive: true, force: true });
});
