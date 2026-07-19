# MDR compiler

MDR は Markdown をベースにした Web 向け言語です。`mdr-compiler` は、
Node.js プロジェクト内の `.mdr` ページを HTML へ変換します。

## プロジェクト構成

```text
my-site/
├── package.json
├── src/
│   ├── pages/
│   │   ├── tags.mdrdef
│   │   ├── index.mdr
│   │   └── about.mdr
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
各ページでは、`src/pages`からそのページのディレクトリまでにあるすべての
`tags.mdrdef`がルート側から順に自動読込され、下位の定義が優先されます。
`public/` のファイルはそのまま `dist/` へコピーされます。
ページfrontmatterはメタデータとして読み取られ、スタンドアロンHTMLの本文には
出力されません。

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
MDRをAstroのMarkdown processorでHTML化し、`.mdr-generated`内の生成
`.astro`テンプレートへ要素として直接書き込みます。中間`.md`ファイルや
`set:html`は使用しません。

## 開発

```sh
npm test
npm run compile -- .
```
