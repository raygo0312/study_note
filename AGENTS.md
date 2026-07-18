# study_note / MDR Project Guide

## Final Goal

Create the MDR language so every page currently authored as `.astro` can
eventually be expressed in MDR without writing HTML tags in MDR source.
Astro remains the routing, layout, asset, Markdown-rendering, and deployment
runtime while MDR incrementally gains the authoring and template features
needed to replace page-level Astro source.

This is a long-term language-design goal. Do not convert dynamic Astro pages
until MDR has an explicit, tested feature for the data or templating behavior
they require.

## Current Acceptance Targets

- `src/pages/math/logical-formula.mdr` is the primary language-design target.
- `src/pages/competitive-programming/vector.mdr` verifies Markdown-compatible
  code authoring.
- `src/pages/index.mdr` is the migrated static home page and verifies that a
  page containing only layout frontmatter, paragraphs, headings, lists, and
  links needs no page-specific Astro source.
- `src/pages/competitive-programming/index.mdr`, `src/pages/reference.mdr`,
  and `src/pages/math/proof.mdr` are static pages migrated without adding MDR
  language features.
- `src/pages/search.mdr` verifies void form controls, standalone generic tags,
  and page-specific client TypeScript loaded through frontmatter `scripts`.
- Existing `.astro` and Markdown pages must continue to build during migration.
- After implementing an MDR feature, use it in `logical-formula.mdr` when it
  naturally applies.

## Current Architecture

- `tools/mdr-compiler`: private local compiler package
  - `lexer.js` / `parser.js`: shared MDR syntax and AST
  - `compiler.js`: AST to HTML
  - `math.js`: Typst math to MathJax-compatible TeX
  - `tag-syntax.js` / `tag-definitions.js`: generic tags and imports
  - `formatter.js`: source formatter
  - `highlighter.js`: compiler-side token scopes
  - `astro-integration.js`: Markdown rendering and generated `.astro` routes
- `tools/mdr-vscode`: `.mdr` language registration, TextMate grammar,
  formatter provider, and list-editing commands
- `src/mdr`: shared MDR definitions imported by pages
- `.mdr-generated`: temporary generated `.astro` output; ignored
- `dist`: generated build output; do not edit manually or commit as part of
  source work unless the user explicitly requests generated deployment output

## Implemented MDR Syntax

- Markdown headings: `#` through `######`
- Paragraphs separated by existing blank lines
- Term definitions: `*term*` compiles to `<dfn>`; MDR has no italic meaning
- Links: `[label](destination)`
- Escapes: `\*`, `\$`, and other MDR punctuation
- Inline and fenced code: backticks and triple backticks
- Lists: `-` unordered, `+` ordered; indentation preserves nesting
- Typst math: `$...$`, converted during MDR compilation rather than in Astro
- Generic block tags: `:::tag.class#id arguments` through closing `:::`
- HTML void tags such as `input` use the same opening syntax but need no
  closing `:::`
- Generic inline tags: `:tag.class#id[content]`
- Grouped tag arguments: `(argument containing spaces)`
- Definitions: `@tag section(label=data-label)`
- Imports: `@import "tags.mdr"`, always relative to project `src/mdr`
- Page scripts: a frontmatter `scripts` list is emitted as local Astro client
  script imports in BaseLayout's `page-scripts` slot so Astro/Vite transpiles
  and bundles TypeScript dependencies outside body-content transformations

MDR source should use these constructs instead of literal HTML tags.

## VSCode Rules

- `.mdr` files use language id `mdr` and formatter id
  `raygo0312.mdr-language-support`.
- The grammar delegates Markdown-compatible syntax to VSCode Markdown and uses
  a left-priority injection for MDR inline syntax.
- `-` and `+` continue on Enter. Enter/Backspace removes an empty item.
- Tab is intercepted only on an empty `-` or `+` item and indents by two spaces.
- Formatter behavior must preserve blank-line counts and relative nested-list
  indentation. Generic tag content has one outer indentation level.
- Keep VSIX version exactly `0.1.0`. Packaging must overwrite the single
  `mdr-language-support-0.1.0.vsix`; do not accumulate other versions.
- Because the version is fixed, run `Developer: Reload Window` after reinstall.
- The attempted exact color matching of one-asterisk markers was inconclusive.
  Do not revisit it unless the user explicitly asks again.

## Working Rules

- The user reports one MDR issue per chat. Change only that issue unless the
  user explicitly groups multiple changes or requests a refactor.
- When inspection finds that a page needs no new MDR capability, migrate that
  page to `.mdr` immediately and verify its route instead of stopping at a
  migration report.
- Preserve unrelated uncommitted user changes. Inspect before staging.
- The user authorizes `git add`, `commit`, and `push` when useful. Stage only
  reviewed source changes; exclude generated output and unrelated edits.
- Keep compiler core, Astro integration, formatter, and editor tooling separate.
- Add executable tests for syntax and compiler behavior.
- Update this file and `tools/mdr-compiler/AGENTS.md` when architecture,
  language rules, validation steps, or the next major direction changes.
- Keep durable syntax detail in `tools/mdr-compiler/docs/syntax.md`, not as a
  chronological log in AGENTS files.

## Required Validation

After compiler or integration changes:

```sh
cd tools/mdr-compiler && npm test
cd ../.. && npm run build
```

After VSCode changes:

```sh
cd tools/mdr-vscode && npm run package
```

Also run `git diff --check` and confirm only one `0.1.0` VSIX exists.

## Long-Term Missing Capabilities

To reach full `.astro` replacement, MDR will eventually need explicit designs
for page data, expressions, iteration/conditionals, component/layout
composition, and client-side scripts. Add these only from concrete migration
requirements, one user-selected problem at a time.

MDR's Astro integration renders Markdown-compatible MDR content with Astro's
Markdown processor and writes the resulting elements directly into generated
`.astro` templates. It does not use intermediate `.md` files, `set:html`, or a
content-string variable. Static braces are emitted as HTML entities so future
`:{ ... }` TypeScript regions can map to real Astro expressions.

## Current Astro Migration Blockers

- `math/index.astro`: imported page data, array transformations, generated
  Mermaid source, and iteration/lookup expressions
- `math/logical-formula-extension.astro`: `details`/`summary` structures whose
  phrasing content must not be wrapped in paragraphs
- `math/mathmatics-introduction.astro`: chat containers plus inline/void HTML
  semantics such as `br`, `ruby`, `rt`, `em`, and `s`
- `math/ZFC-axioms.astro`, `math/natural-deduction.astro`, and
  `math/order.astro`: `details`/`summary`, explicit heading ids, and, where
  present, arbitrary iframe attributes

Reassess these pages after implementing the relevant missing capability; do
not mechanically migrate them into structurally invalid HTML.
