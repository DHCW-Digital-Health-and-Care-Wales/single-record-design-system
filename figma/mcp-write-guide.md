# Figma MCP Write Guide

How to write directly into the Figma file using the `use_figma` tool (Figma Plugin API via MCP). Covers the patterns that work, the constraints to know upfront, and a reference for variables, components, and page content.

---

## Overview

The `use_figma` tool runs arbitrary JavaScript inside the Figma file using the Plugin API. It replaces the old HTML-capture workflow for most design system content — no live preview server needed, no HTML file to maintain.

| Task | Tool |
|---|---|
| Write frames, text, shapes to a page | `use_figma` |
| Create / update / delete Figma variables | `use_figma` |
| Create components and variants | `use_figma` |
| Read design context, inspect nodes | `get_design_context` |
| Push tokens via REST (legacy) | `figma/scripts/push-variables.js` |

---

## Critical: page switching

**The MCP plugin always starts on the Cover Page.** Writing to any other page requires an explicit page switch, and it must use a specific pattern.

### The only pattern that works

Return a `Promise` from the plugin code. The MCP runtime awaits it, so `setCurrentPageAsync` completes before any node creation runs:

```javascript
const targetPage = figma.root.children.find(p => p.name.includes('Typography'));

return figma.setCurrentPageAsync(targetPage).then(() => {
  // All node creation happens here — on the correct page
  const frame = figma.createFrame();
  frame.name = 'My Guide';
  // ...
  return JSON.stringify({ done: true });
});
```

### Patterns that do NOT work

```javascript
// ✗ Synchronous assignment — throws an error
figma.currentPage = targetPage;

// ✗ Async function without return — plugin closes before async resolves
async function run() {
  await figma.setCurrentPageAsync(targetPage);
  figma.createFrame(); // node never persists
}
run();

// ✗ IIFE async — same problem
(async () => {
  await figma.setCurrentPageAsync(targetPage);
})();

// ✗ figma.waitForTask — not available in this runtime
figma.waitForTask(somePromise);

// ✗ Page.appendChild from a different page — works within script but does NOT persist
const otherPage = figma.root.children.find(p => p.id === '12:3378');
const f = figma.createFrame(); // created on Cover Page
otherPage.appendChild(f);      // appears to work, but reverts after script ends
```

### Page IDs (SINGLE-RECORD-DS-FIGMA--WIP-)

| Page | Node ID |
|---|---|
| Cover Page | `48:1925` |
| Getting Started | `46:1684` |
| Branding | `12:3227` |
| Typography | `12:3378` |
| Colours | `12:3270` |
| Spacing & Elevation | `103:2340` |
| Iconography | `103:760` |

---

## Writing text nodes

### What works without async

Inter (Figma's default font) is pre-loaded. You can create text and set `fontSize` immediately:

```javascript
const t = figma.createText();
t.characters = 'Patient Overview';
t.fontSize = 48;
t.fills = [{ type: 'SOLID', color: { r: 0.129, g: 0.169, b: 0.196 } }];
t.textAutoResize = 'WIDTH_AND_HEIGHT'; // single line
```

For multi-line (fixed width, height grows):

```javascript
t.textAutoResize = 'HEIGHT';
t.resize(720, 20); // set width first, height auto-adjusts
```

For letter spacing:

```javascript
t.letterSpacing = { unit: 'PERCENT', value: 12 }; // 0.12em equivalent
```

### What requires async (and therefore doesn't work standalone)

Changing `fontName` to anything other than Inter Regular requires `loadFontAsync`, which is async. **This means Roboto, Bold, Medium etc. cannot be set directly.**

```javascript
// ✗ Throws: "Cannot use unloaded font"
t.fontName = { family: 'Roboto', style: 'Bold' };
```

**Workaround:** Use `fontSize` variation for visual hierarchy. Roboto weights are specified in the token values themselves (the guide shows the correct values even if the specimen renders in Inter).

If font loading is genuinely required, it must be chained after `setCurrentPageAsync`:

```javascript
return figma.setCurrentPageAsync(page)
  .then(() => figma.loadFontAsync({ family: 'Roboto', style: 'Bold' }))
  .then(() => figma.loadFontAsync({ family: 'Roboto', style: 'Regular' }))
  .then(() => {
    const t = figma.createText();
    t.fontName = { family: 'Roboto', style: 'Bold' };
    t.characters = 'Now works';
    return JSON.stringify({ done: true });
  });
```

---

## Variables

All variable operations are fully synchronous — no async needed.

### Read existing collections

```javascript
const collections = figma.variables.getLocalVariableCollections();
const primitives = collections.find(c => c.name === 'Primitives');
const semantic   = collections.find(c => c.name === 'Single Record');
```

### Create a collection

```javascript
const col = figma.variables.createVariableCollection('My Collection');
col.renameMode(col.modes[0].modeId, 'Default');
// col.hiddenFromPublishing = true; // NOT available in MCP runtime
```

### Add a variable

```javascript
// Types: 'COLOR' | 'FLOAT' | 'STRING' | 'BOOLEAN'
const v = figma.variables.createVariable('Blue/500', col, 'COLOR');
v.scopes = ['ALL_SCOPES']; // or ['FILL_COLOR'], ['STROKE_COLOR'], etc.
v.setValueForMode(col.modes[0].modeId, { r: 0.22, g: 0.49, b: 0.87, a: 1 });
```

### Create an alias (semantic → primitive)

```javascript
const primVar = figma.variables.getVariableById('VariableID:112:1400');
const alias   = figma.variables.createVariableAlias(primVar);
semanticVar.setValueForMode(lightModeId, alias);
```

### Delete a collection (and all its variables)

```javascript
collection.remove(); // removes collection + all variables it contains
```

### Full delete-and-recreate pattern

Used when rebuilding the token set from scratch. Key: capture all data first, then delete, then recreate. Build an `oldId → newVariable` map to resolve aliases:

```javascript
// 1. Capture
const primData = primCol.variableIds.map(id => {
  const v = figma.variables.getVariableById(id);
  return { id, name: v.name, type: v.resolvedType, scopes: v.scopes,
           value: v.valuesByMode[primModeId] };
});

// 2. Delete
semCol.remove();
primCol.remove();

// 3. Recreate primitives, build id map
const oldIdToNew = {};
for (const d of primData) {
  const v = figma.variables.createVariable(d.name, newPrimCol, d.type);
  v.scopes = d.scopes;
  v.setValueForMode(newPrimModeId, d.value);
  oldIdToNew[d.id] = v;
}

// 4. Recreate semantics, resolve aliases
for (const d of semData) {
  const v = figma.variables.createVariable(d.name, newSemCol, d.type);
  const raw = d.lightValue;
  const val = raw?.type === 'VARIABLE_ALIAS'
    ? figma.variables.createVariableAlias(oldIdToNew[raw.id])
    : raw;
  v.setValueForMode(lightModeId, val);
}
```

### Known limitation

`hiddenFromPublishing` cannot be read or set via the MCP plugin runtime — it throws a node-not-found error. Set this manually in Figma's variable panel if needed.

---

## Components

### Create a component (e.g. from SVG)

```javascript
const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
  viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" stroke-width="2"
  stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 5v14M5 12l7 7 7-7"/>
</svg>`;

const tmp = figma.createNodeFromSvg(svgString); // FrameNode with VectorNode children
const comp = figma.createComponent();
comp.name = 'Icon/action/download';  // slash notation = nested groups in Assets panel
comp.resize(24, 24);
for (const child of [...tmp.children]) comp.appendChild(child);
tmp.remove();
```

### Naming convention for nested organisation

Use `/` separators — Figma auto-groups components in the Assets panel:

```
Icon/action/add
Icon/action/delete
Icon/clinical/allergy
Icon/nav/search
```

### Positioning on a non-current page

Build the component completely on the current page, then move it as the final step:

```javascript
iconPage.appendChild(comp); // always last — do not append children after this
```

---

## Building guide pages

### Recommended structure

```javascript
return figma.setCurrentPageAsync(targetPage).then(() => {
  // 1. Colour palette
  const C = {
    navy: { r: .106, g: .161, b: .290 },
    g900: { r: .129, g: .169, b: .196 },
    g600: { r: .298, g: .384, b: .447 },
    g200: { r: .847, g: .867, b: .878 },
    g100: { r: .941, g: .957, b: .961 },
    b800: { r: .196, g: .314, b: .514 },
    b50:  { r: .957, g: .961, b: .973 },
    w:    { r: 1,    g: 1,    b: 1    },
  };

  // 2. Helpers
  function tx(text, size, color, fixedWidth) {
    const n = figma.createText();
    n.characters = String(text);
    n.fontSize = size || 14;
    n.fills = [{ type: 'SOLID', color: color || C.g900 }];
    if (fixedWidth) { n.textAutoResize = 'HEIGHT'; n.resize(fixedWidth, 20); }
    else n.textAutoResize = 'WIDTH_AND_HEIGHT';
    return n;
  }
  function fr(name, bg, w, h) {
    const f = figma.createFrame();
    f.name = name;
    f.fills = bg ? [{ type: 'SOLID', color: bg }] : [];
    f.clipsContent = false;
    if (w && h) f.resize(w, h);
    return f;
  }
  function rc(w, h, color, radius) {
    const n = figma.createRectangle();
    n.resize(w, h);
    n.fills = [{ type: 'SOLID', color }];
    if (radius) n.cornerRadius = radius;
    return n;
  }

  // 3. Main container + y tracker
  const W = 1440, PX = 80, CW = 1280;
  const main = fr('Guide Name', C.w, W, 100);
  let y = 0;
  function sec(el, h) { el.x = 0; el.y = y; main.appendChild(el); y += h; main.resize(W, y); }

  // 4. Build sections, each appended via sec()
  // ...

  return JSON.stringify({ done: true, height: y });
});
```

### Split across multiple calls

When a guide is too large for one script, subsequent calls find the existing main frame and continue from the last y value:

```javascript
return figma.setCurrentPageAsync(targetPage).then(() => {
  const main = figma.currentPage.children.find(c => c.name === 'Guide Name');
  let y = 1954; // known height from previous call's return value
  function sec(el, h) { el.x = 0; el.y = y; main.appendChild(el); y += h; main.resize(1440, y); }
  // add new sections...
  return JSON.stringify({ done: true, height: y });
});
```

---

## Debugging tips

- **Always return a JSON string** — return values appear in the tool response, making it easy to verify state mid-script.
- **Verify in-script with `figma.currentPage.children`** — check node counts and names before the script ends.
- **Stray nodes on Cover Page** — if you create nodes without moving them to the target page, they land on Cover Page. Find and remove with `figma.currentPage.children.find(c => c.name === 'X').remove()`.
- **Test a small operation first** — before running a 300-line build script, test the core mechanism (page switch, variable creation, font loading) with a 10-line script.
- **Script size limit** — the `code` parameter has a 50 000-character limit. Split large guides into two calls: Tier 1 primitives first, Tier 2 semantics second.

---

## Quick reference: what works vs. what doesn't

| Operation | Works | Notes |
|---|---|---|
| Create frame / rect / text on current page | ✓ | Synchronous, persists |
| `figma.createText()` with Inter at any size | ✓ | Default font, no loading needed |
| Change `fontSize`, `letterSpacing`, `fills` | ✓ | Synchronous properties |
| Change `fontName` to Roboto/Bold etc. | ✗ | Requires `loadFontAsync` (async) |
| Create / update / delete variables | ✓ | Fully synchronous |
| `collection.remove()` | ✓ | Removes collection and all its variables |
| `figma.variables.createVariableAlias()` | ✓ | Synchronous |
| Create components, set name and size | ✓ | |
| `figma.createNodeFromSvg(svgString)` | ✓ | Returns FrameNode with VectorNode children |
| Page switch with `return promise.then(...)` | ✓ | Only working pattern |
| `figma.currentPage = page` | ✗ | Throws — not supported |
| `async function run() { await ... } run()` | ✗ | Plugin closes before async resolves |
| `figma.waitForTask(promise)` | ✗ | Not available in MCP runtime |
| `page.appendChild(node)` cross-page | ✗ | Appears to work in-script, does not persist |
| `collection.hiddenFromPublishing` | ✗ | Throws node-not-found in MCP runtime |
