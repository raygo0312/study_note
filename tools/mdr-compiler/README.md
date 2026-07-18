# MDR compiler

MDR は Markdown をベースにした Web 向け言語です。`mdr-compiler` は、
Node.js プロジェクト内の `.mdr` ページを HTML へ変換します。

## プロジェクト構成

```text
my-site/
├── package.json
├── src/
│   ├── pages/
│   │   ├── index.mdr
│   │   └── about.mdr
│   ├── mdr/
│   │   └── tags.mdr
│   ├── components/
│   └── layouts/
└── public/
    └── favicon.svg
```

## インストールとビルド

このリポジトリではworkspace内のローカル依存として使用します。

```sh
npm install --save-dev ./tools/mdr-compiler
npx mdr .
```

npmへ公開せず、ローカルのNodeプロジェクトから利用する想定です。

Astro から利用する場合は `astro.config.mjs` に Integration を追加する。

```js
import { mdr } from 'mdr-compiler';

export default {
  integrations: [mdr()],
};
```

`src/pages/index.mdr` は `dist/index.html` に、
`src/pages/about.mdr` は `dist/about/index.html` に変換されます。
`public/` のファイルはそのまま `dist/` へコピーされます。

プロジェクトの `package.json` にスクリプトを追加することもできます。

```json
{
  "scripts": {
    "build": "mdr ."
  }
}
```

入力・出力ディレクトリを変更する場合：

```sh
npx mdr . --pages-dir content/pages --out-dir public-build
```

## API

```js
const { compile, compileProject, format, highlight } = require('mdr-compiler');

const html = compile('# Hello');
compileProject(process.cwd());
const formatted = format('## Hello\n\n本文');
const tokens = highlight('# Hello');
```

`format` はMDRの基本構文を正規化したソースを返します。`highlight` は共有
lexerのトークンにエディタ向けのscope名を付けて返します。

言語構文は[`docs/syntax.md`](docs/syntax.md)を参照してください。Astro連携は
`.mdr`ページを`.mdr-generated`内のMarkdownとAstroルートへ変換します。

## 開発

```sh
npm test
npm run compile -- .
```
