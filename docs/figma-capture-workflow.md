# Figma Capture Workflow

This guide covers how to write design system content into the Figma file. Two methods are available; the direct MCP write method is now preferred for most tasks.

---

## Preferred method: direct Figma write via `use_figma`

The `use_figma` MCP tool runs JavaScript directly in the Figma file via the Plugin API. It can create frames, text, shapes, components, and variables without any HTML file or live server.

**See [`figma/mcp-write-guide.md`](../figma/mcp-write-guide.md) for the full workflow**, including:
- The page-switching pattern that works (`return promise.then(...)`)
- Text and font constraints
- Variables: create, update, delete, alias
- Components from SVG
- Guide page layout patterns

---

## Legacy method: HTML capture via VS Code + Figma MCP

The HTML-to-design workflow is retained for cases where an HTML guide already exists and needs to be re-captured, or where a rich rendered layout is easier to author in HTML first.

The Figma REST API and Figma MCP server are both **read-only** for design canvas content outside of `use_figma`. The only write paths are:

| Method | When to use |
|---|---|
| `use_figma` (MCP Plugin API) | Preferred — variables, components, guide pages, anything new |
| VS Code Figma MCP (`generate_figma_design`) | Re-capturing existing HTML guides |
| REST API — Variables only | Legacy token pushes via `scripts/push-variables.js` |

---

## Prerequisites

- VS Code with the **Figma MCP extension** installed and authenticated
- The repo cloned locally
- A live preview server running (VS Code Live Preview or any static server)

---

## How it works

Every HTML guide includes this script tag in the `<head>`:

```html
<script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async></script>
```

This exposes the page to the VS Code Figma MCP tool `generate_figma_design`, which captures the rendered layout and recreates it as native Figma design nodes (frames, text, rectangles) on the target canvas.

---

## Step-by-step

### 1. Open the HTML file in VS Code Live Preview

```
figma/{guide-name}/{guide-name}.html
```

Right-click the file → **Open with Live Preview** (or use the VS Code Live Preview extension).

### 2. Note the local URL

It will be something like:

```
http://127.0.0.1:3000/figma/colour-guide/colour-guide.html
```

### 3. Run `generate_figma_design` via VS Code Figma MCP

In the VS Code Figma MCP panel, invoke:

```
generate_figma_design
  source: http://127.0.0.1:3000/figma/{guide-name}/{guide-name}.html
  target: https://www.figma.com/design/<FILE_KEY>/...
  page:   {target-page-node-id}
```

The tool captures the live rendered page and places the design on the specified Figma page.

### 4. Position on canvas

After capture, move or rename the frame as needed. Place it on the correct page (e.g. `🌈 Colours`, `Aa Typography`).

---

## HTML guide file locations

All HTML guides live under `figma/`. One subfolder per guide, file name matches folder name:

```
figma/
├── colour-guide/
│   └── colour-guide.html       ← Colour Tokens guide
├── typography-guide/
│   └── typography-guide.html   ← Typography Tokens guide
├── {next-guide}/
│   └── {next-guide}.html
```

### Rules for HTML guides

| Rule | Reason |
|---|---|
| Self-contained — all CSS inline, no build step | Works with VS Code Live Preview immediately |
| Include `capture.js` script in `<head>` | Required for Figma MCP capture |
| Use the same site header / hero / tier structure | Consistency across documentation pages in Figma |
| Source data from the JSON token files | Single source of truth — HTML is generated output |
| No external JS dependencies | Keeps load fast and capture reliable |

---

## Re-generating after token changes

When tokens change in `foundations/tokens/`:

1. Update (or regenerate) the relevant HTML guide
2. Commit and push
3. Re-run the VS Code capture workflow above

For colour guide, a generator script exists:

```bash
node figma/colour-guide/generate.js
```

Typography and future guides may also get generator scripts as the token set grows.

---

## Target Figma file

| Item | Value |
|---|---|
| File | `SINGLE-RECORD-DS-FIGMA--WIP-` |
| File key | `<FILE_KEY>` — see `.mcp.json` (gitignored) |
| Colours page | node `12:3270` |
| Typography page | TBD — create page in Figma when capturing first typography guide |

---

## Future: automated capture

Once Node.js is available in CI, the plugin at `figma/plugins/colour-guide/` can be adapted to run headlessly via Figma's Plugin API, removing the need for the VS Code manual step entirely.
