# 開発動機と最短方針

## 背景

このコンパイラは、一般的な Web サイト生成器をゼロから作ることが目的では
ない。`../study_note` で Astro を使って学習ノートを公開しており、そこで
感じている記述上・構成上の不便を解消するために、自分の言語とツールを作る。

`study_note` の現在の構成では、次のものが混在している。

- `src/pages` 内の `.astro` ページ
- frontmatter と `BaseLayout.astro` を使う Markdown ページ
- レイアウト内での見出し ID、目次、用語一覧、数式などの後処理
- Astro が提供するルーティング、静的ファイル、コードハイライト、ビルド

このうち最後の項目まで最初から自作すると、解決したい「書きにくさ」より
先に、開発サーバー、アセット処理、コードハイライト、数式、デプロイなどを
再実装することになる。

## 最短ルート

最初は Astro を実行基盤として残し、MDR を Astro の入力へ変換する層を作る。

```text
src/pages/**/*.mdr
        ↓
      mdr-core
  (lexer / parser / AST)
        ↓
  Astro 用の入力または integration
        ↓
 Astro の layout / highlight / build / deploy
```

これにより、MDR 独自の構文に集中しながら、`study_note` を実際の検証環境に
できる。MDRのMarkdown互換部分はAstroのMarkdown processorでHTML化し、
integrationが生成する`.astro`へ埋め込む。中間`.md`ファイルは作らない。
最終出力を`.astro`に統一することで、将来のTypeScript式やcomponent構文を
同じ生成モジュールへ展開できるようにする。

## 段階

1. `.mdr` の frontmatter、見出し、段落、太字、リスト、コードフェンスを
   `study_note` の一ページで扱う。
2. `.mdr` から既存の `BaseLayout.astro` を利用できるようにする。
3. 実際に不便だったレイアウト指定、目次、用語、数式などを MDR の構文へ
   移す。
4. `:{ ... }`などのTypeScript領域を生成`.astro`の式やfrontmatterへ展開する。
5. Astroとの結合が制約になった時点で、共通ASTを使った独自backendを検討する。

当面の非目標は、Astro の機能を複製することと、独立したデプロイ基盤を作る
ことである。

## 現時点での判断

- `mdr-core` は lexer、parser、AST を担当する。
- Astro 連携は別の adapter として実装する。
- 現在の単体 HTML compiler は AST の検証用 backend として残す。
- `study_note` の具体的な不便を一つずつ、MDR の構文要件に変換する。
