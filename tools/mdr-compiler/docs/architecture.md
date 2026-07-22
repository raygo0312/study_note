# 構成方針

このプロジェクトの目的は、独自の Markdown 系言語を実装することです。
特定の Web サイトを作ること自体は目的にしません。言語を利用するサイトや
文書は、コンパイラの動作確認用の入力として扱います。

開発動機と Astro との段階的な連携方針は `docs/motivation.md` に記録する。
当面は `study_note` を実際の検証プロジェクトとし、Astro の既存機能を活用
しながら MDR 固有の記述体験を改善する。

## プロジェクト構成

Astro に近い、ページを中心とした Node プロジェクト構成を採用する。

```text
project/
├── package.json
├── src/
│   ├── pages/                 # .mdr ページ。ファイルパスが URL になる
│   │   ├── tags.mdrdef        # 全ページ共通のタグ引数定義
│   │   ├── index.mdr          # /
│   │   └── about.mdr          # /about/
│   ├── components/            # 将来の再利用部品
│   └── layouts/               # 将来の共通レイアウト
├── public/                    # そのまま配布する静的ファイル
└── dist/                      # コンパイル結果
```

`src/pages` の `index.mdr` は `dist/index.html` に、`about.mdr` は
`dist/about/index.html` に変換する。`public` 以下のファイルは相対パスを
維持して `dist` にコピーする。ページ出力と同じパスに静的ファイルがある
場合は、ページ出力を優先する。

タグ引数定義は、設定されたpagesディレクトリから各ページのディレクトリまでに
存在するすべての`tags.mdrdef`を上位から順に読み込む。同名定義はページに近い
下位ディレクトリのものを優先する。

## 共有パイプライン

```text
source
  ↓
source boundaries ──→ frontmatter / directives / protected code fences
  ↓
lexer ───────────────┬─→ syntax highlighter
  ↓                  └─→ parser
AST / IR ────────────┬─→ compiler backend
                     └─→ formatter
```

- Lexer はトークンとソース位置を生成する。
- source boundaries は改行形式とコードフェンスを共通認識し、コード内の
  MDR構文を他の処理系が誤解釈しないようにする。
- Parser はトークン列から AST または共通 IR を生成する。
- Compiler は共通 IR から対象となる出力を生成する。出力形式は実装時に
  決定する。
- Highlighter はトークンと構文情報を使い、エディタ向けの色付け情報を
  生成する。
- Formatter は AST / IR を正規化されたソースへ戻す。

Astro連携は通常のMarkdown互換行をAstroのMarkdown processorへ渡す一方、
MDR固有のインライン構文は共有lexer/parserで変換する。2文字インデントを使うMDRの
リストと汎用タグは、CommonMarkとの差を避けるため共有parser/compilerで
HTML化してからMarkdown processorへ渡す。

プロジェクトbuildは全ページを先に走査して用語辞書を作り、その辞書を使って
各ページを描画する2段階で行う。辞書は用語ごとにページファイルと`defineN`の
fragmentを保持し、Astro連携では`.mdr-generated/definitions.json`へ出力する。
辞書にはpagesルート基準の出力ファイル名を保存し、描画時には現在のページからの
相対URLへ変換する。これによりAstroの`base`設定に依存せずリンクできる。

コンパイラ、ハイライト、フォーマット処理で構文の解釈が分裂しないよう、
言語仕様と lexer/parser を共有する。各機能固有の出力処理は別モジュールに
分離する。

## 実装順

1. 最小トークン定義と lexer
2. 見出し、段落、太字、2 種類のリストを扱う parser
3. AST / IR の検証テスト
4. HTML compiler backend とプロジェクトコンパイラ
5. AST / IR を使う formatter
6. トークンとノード範囲を使う syntax highlighter

各段階で `examples/basic.mdr` を入力にした小さな実行例を追加する。

## 現在の使い方

Node プロジェクト内の `.mdr` ファイルをまとめて HTML に変換するには、
プロジェクトのルートで次を実行する。

```sh
npm run compile -- .
```

`src/pages/` 内の `.mdr` を URL に対応する HTML として `dist/` に出力し、
`public/` の静的ファイルもコピーする。
出力先を変更する場合は次のように指定する。

```sh
npm run compile -- . --out-dir public
```

ページの入力ディレクトリを変更する場合：

```sh
npm run compile -- . --pages-dir content/pages
```

プログラムから単一文書を変換する場合は `compile(source)`、プロジェクトを
変換する場合は `compileProject(projectDirectory)` を利用する。
