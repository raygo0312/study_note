# MDR Compiler Guide

## Purpose

This package implements the language core and Astro integration for MDR. The
project-level final goal is to make every `study_note` `.astro` page expressible
in MDR without literal HTML in MDR source.

## Module Boundaries

- `lexer.js`: source tokens and locations
- `parser.js`: tokens to MDR AST
- `compiler.js`: AST to escaped HTML
- `math.js`: Typst math conversion, excluding code
- `tag-syntax.js`: tag descriptors and positional argument parsing
- `tag-definitions.js`: `@tag`, `@import`, and `src/mdr` resolution
- `formatter.js`: AST-based source formatting
- `highlighter.js`: compiler-side token scope mapping
- `astro-integration.js`: frontmatter, Astro Markdown rendering, generated
  `.astro` routes
- `project-compiler.js`: standalone project output

Do not merge editor-specific behavior into the compiler. `tools/mdr-vscode`
consumes the public formatter and owns TextMate grammar and editing commands.

## Language Invariants

- MDR is Markdown-like but does not accept HTML tags as required authoring
  syntax.
- `*text*` is a term definition and renders as `<dfn>`, never italic.
- `-` is unordered and `+` is ordered; indentation represents nested lists.
- Code spans and fences suppress MDR interpretation.
- A backslash at the end of a paragraph source line renders a hard `<br>`.
- `$...$` contains Typst and is converted to MathJax-compatible TeX before the
  Astro Markdown renderer sees it.
- Block tags use `:::tag.class#id arguments` and closing `:::`.
- Known HTML void tags, including `input`, use the block-tag opening syntax
  without a closing `:::` and render without an HTML closing tag.
- Inline tags use `:tag.class#id[content]`.
- Inline-tag content can contain nested inline tags.
- `.class` and `#id` may occur in either order; duplicate ids are invalid.
- Parentheses group one positional argument containing spaces.
- `@tag name(attribute, other-attribute)` defines positional arguments by the
  output attribute names, in order.
- `@import` is always resolved relative to the project `src/mdr` directory,
  including imports made by imported definition files.
- Rendered names and values must be validated or HTML-escaped.
- TeX generated from Typst must protect MDR punctuation until parsing is
  complete; generated TeX backslashes must never become MDR hard breaks.

The durable user-facing syntax is documented in `docs/syntax.md`. Update tests
and that document when syntax changes.

## Formatter Invariants

- Do not add or remove blank lines.
- Indent generic tag content by one level (two spaces).
- Preserve relative indentation of nested lists inside tags.
- Preserve frontmatter and directives.
- Formatting an already formatted document should be idempotent.

## Astro Integration Invariants

- Existing Astro/Markdown pages remain usable during MDR migration.
- Generate only `.astro` modules under `.mdr-generated`, never intermediate
  `.md` files or files under Astro's own cache.
- Compile block-tag contents before embedding HTML in Markdown because Markdown
  does not parse lists or paragraphs inside raw HTML blocks.
- Keep MathJax delimiter escaping valid through both MDR and Markdown stages.
- Imports and tag definitions are resolved before page transformation.
- Frontmatter `scripts` entries are resolved relative to the MDR page and
  emitted into BaseLayout's `page-scripts` slot as local imports inside
  Astro-processed client script tags. This keeps script source outside the
  layout's default-slot content transforms. Do not
  use `?url`: it exposes raw TypeScript to the browser instead of transpiling
  and bundling it.
- Use Astro's configured Markdown processor, then write its elements directly
  into the generated `.astro` template. Do not use `set:html` or a content
  string. Protect braces in static HTML as entities, reserving actual Astro
  expression braces for future MDR TypeScript syntax. Generated local script
  tags are compiler output, not HTML authoring syntax exposed by MDR.

## Validation

Run after language or integration changes:

```sh
npm test
cd ../.. && npm run build
```

Tests should cover lexer/parser AST, HTML output, formatting, highlighting,
math conversion, imports, standalone project output, and Astro transformation.

## Development Direction

Use `src/pages/math/logical-formula.mdr` as the immediate acceptance page.
Longer-term `.astro` replacement will require explicit data/template features,
but those must be designed from concrete page migrations rather than inferred
in advance. Follow the user's one-issue-per-chat rule outside an explicit
refactoring request.

Keep VSIX version and packaging policy in the project-level `AGENTS.md`; the
editor implementation belongs to `tools/mdr-vscode`.
