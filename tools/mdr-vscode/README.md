# MDR Language Support for VSCode

この拡張は`.mdr`ファイルに次を提供します。

- シンタックスハイライト
- Format Document（`Shift+Alt+F` / `⇧⌥F`）
- `-`/`+`リスト行でのTabインデント

VSCode標準のMarkdownにはドキュメントフォーマッタが含まれていないため、
フォーマッタはMDRコンパイラのMarkdown互換formatterを使用します。MDRの
`+`リストや`:::section.ex`を含む汎用タグなどを壊さずに整形できます。
`$...$`の内側はTinymistのTypst数式grammarを利用してハイライトします。
数式とコードフェンスでは埋め込み言語のformatterを一切起動せず、
各言語のgrammarによるハイライトだけを適用します。

## 開発版の使い方

1. VSCodeでプロジェクトルートを開く。
2. `tools/mdr-vscode`で`npm install`を実行する。
3. `npm run bundle`を実行する。
4. VSCodeで`Run MDR Extension`を実行するか、拡張機能開発ホストでプロジェクトを開く。

## VSIXの作成とインストール

```sh
npm install
npm run package
```

生成された`mdr-language-support-0.1.0.vsix`を、通常のVSCodeの
「Extensions: Install from VSIX...」からインストールします。

フォーマッタは`tools/mdr-compiler`のformatterを共有します。`.mdr`を保存後、
Format Documentを実行するとMDRの標準形式へ整形されます。
