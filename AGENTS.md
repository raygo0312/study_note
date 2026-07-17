# Project Context

This is the `study_note` Astro project and the primary workspace for the MDR
language and its Astro integration.

## Goal

Replace the parts of Astro authoring that are inconvenient for this site with
the MDR language, while continuing to use Astro for routing, layouts, Markdown
rendering, syntax highlighting, assets, and deployment.

## Current State

- `mdr-compiler` lives at `tools/mdr-compiler` as a private local package.
- `src/pages/math/logical-formula.mdr` is the first migrated page.
- `astro.config.mjs` enables the local `mdr()` integration.
- The integration converts `.mdr` to Astro-rendered Markdown and supports MDR
  frontmatter, one-asterisk bold, and `+` ordered-list items.
- Existing Astro pages and unmodified content should remain usable during the
  migration.

## Working Principles

- Keep Astro as the build and deployment runtime until MDR-specific needs make
  that a real limitation.
- Add language features based on actual `study_note` migration needs.
- Preserve existing uncommitted user changes and do not mix generated `dist/`
  output into source changes unless explicitly requested.
- Keep compiler core, Astro integration, formatter, and highlighter separate.
- Run `npm test` in `tools/mdr-compiler` and `npm run build` in this project
  after changes affecting the integration.

## Important Locations

- `tools/mdr-compiler/src`: lexer, parser, compiler, and Astro integration
- `tools/mdr-compiler/test`: compiler and integration tests
- `src/pages`: Astro and MDR pages being migrated
- `src/layouts`: shared Astro layouts
- `public`: static assets
- `dist`: generated output; do not edit manually

## Next Steps

Migrate the remaining static mathematics pages to `.mdr`. Pages that generate
content with JavaScript, such as `math/index.astro`, can remain Astro pages until
MDR has an explicit data/template feature.
