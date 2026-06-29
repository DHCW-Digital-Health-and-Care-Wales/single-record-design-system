# Figma Capture Workflow

This guide covers how to write design system content into the Figma file.

> **Updated 2026-06-29:** the legacy HTML-capture workflow has been retired along with the
> self-contained guide HTML files under `figma/`. All design content is now written to the
> canvas directly via `use_figma`. If you need a historical reference to the HTML approach,
> see the git history for `figma/*/*.html` and `figma/colour-guide/generate.js`.

---

## Writing to Figma: `use_figma`

The `use_figma` MCP tool runs JavaScript directly in the Figma file via the Plugin API. It can
create frames, text, shapes, components, guide pages and variables — no HTML file or live server
required.

**See [`figma/mcp-write-guide.md`](../figma/mcp-write-guide.md) for the full workflow**, including:
- The page-switching pattern that works (`return promise.then(...)`)
- Text and font constraints
- Variables: create, update, delete, alias
- Components from SVG
- Guide page layout patterns

---

## The three Figma write paths

| Method | When to use |
|---|---|
| `use_figma` (MCP Plugin API) | Default — frames, components, guide pages, variables, anything new |
| REST API — Variables only | Token pushes via `scripts/push-variables.js` (the only REST write endpoint) |
| Figma plugins (`figma/plugins/`) | One-run generators kept for reference (colour palette / colour guide) |

---

## Target Figma file

| Item | Value |
|---|---|
| File | `SINGLE-RECORD-DS-FIGMA--WIP-` |
| File key | `<FILE_KEY>` — see `.mcp.json` (gitignored) |
| Colours page | node `12:3270` |
