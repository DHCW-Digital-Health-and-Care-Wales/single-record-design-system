# Figma — Known Issues & Workarounds

Living reference of gotchas, limitations, and confirmed workarounds encountered while building and maintaining this design system. Add entries as new issues are discovered or resolved.

Each entry records: what the problem is, why it happens, and the fix.

---

## Typography

### Font weight variable binding does not change the rendered font variant

**Symptom:** You update a font weight variable (e.g. Heading XS → 500 Medium) but text using that style still renders as Bold. New text added with the style also renders Bold.

**Why:** In Figma, `fontName` (a `{family, style}` object where `style` is a string like `"Bold"` or `"Medium"`) is the authoritative property for selecting the font variant. Variable bindings for `fontWeight` write a numeric value but do not update `fontName.style`. Figma resolves the font using `fontName.style` first, so the variable has no visible effect.

**Fix:** Update the Text Style's `fontName` directly — either in the Figma UI (Edit Style → change the font dropdown) or via the Plugin API:

```js
await figma.loadFontAsync({ family: "Roboto", style: "Medium" });
const style = figma.getLocalTextStyles().find(s => s.name === "SR Typography/Desktop/Heading XS");
style.fontName = { family: "Roboto", style: "Medium" };
```

Any text using the style — existing and new — will immediately reflect the change without manual updates per instance.

**Status:** Resolved 2026-05-29. Applied to SR Typography/Desktop/Heading XS and SR Typography/Mobile/Heading XS.

---

## Variables & Tokens

### `setBoundVariableForPaint` must receive the resolved colour as the static base — not black

**Symptom:** After binding a colour variable to a fill via `setBoundVariableForPaint`, the node renders as solid black in the Figma canvas even though the variable's Light-mode value is white or another colour.

**Why:** Figma stores the `paint.color` property as the rendered value and only re-resolves the variable when the mode is explicitly switched in the canvas. If you pass `{type:'SOLID', color:{r:0,g:0,b:0}}` as the base paint, Figma keeps black as `paint.color` — the variable binding alone does not trigger an immediate re-render to the resolved value.

**Fix:** Resolve the variable's value (following alias chains if needed) before constructing the base paint, and pass the resolved colour as the static value:

```js
function cp(varName) {
  const v = varByName[varName];
  const resolved = resolveColor(varName); // follow alias chain to concrete {r,g,b,a}
  const base = resolved || { r: 0, g: 0, b: 0, a: 1 };
  return figma.variables.setBoundVariableForPaint(
    { type: 'SOLID', color: { r: base.r, g: base.g, b: base.b } },
    'color',
    v
  );
}
```

The `paint.color` will then hold the correct Light-mode value, and the variable binding will still update it correctly when the mode is switched.

**Status:** Resolved 2026-06-01. Applied to input field component fills after initial binding used black fallback.

---



### Variable alias chains must be resolved manually in Plugin API code

**Symptom:** Reading a variable value via `variable.valuesByMode[modeId]` returns an object `{ type: "VARIABLE_ALIAS", id: "..." }` instead of a number or colour.

**Why:** Semantic tokens (e.g. `Typography/Label/Desktop/Font Size` in Single Record) alias to primitive tokens (e.g. `Font/Size/14` in Primitives). The Plugin API returns the raw alias object, not the resolved value.

**Fix:** Follow the alias chain until a concrete value is found:

```js
function resolveVal(varName) {
  let v = varByName[varName];
  const seen = new Set();
  while (v) {
    if (seen.has(v.id)) break;
    seen.add(v.id);
    const col = figma.variables.getVariableCollectionById(v.variableCollectionId);
    const val = v.valuesByMode[col.defaultModeId];
    if (val && typeof val === 'object' && val.type === 'VARIABLE_ALIAS') {
      v = figma.variables.getVariableById(val.id);
    } else {
      return val;
    }
  }
  return null;
}
```

**Status:** Resolved 2026-05-29. Used in all `use_figma` scripts that read typography or colour variable values.

---

## Components & Variants

### `figma.currentPage` cannot be set with direct assignment

**Symptom:** `figma.currentPage = somePage` throws: `Setting figma.currentPage is not supported`.

**Fix:** Use the async method instead:

```js
await figma.setCurrentPageAsync(somePage);
```

**Status:** Resolved 2026-05-29.

---

### `primaryAxisSizingMode = 'HUG'` throws a validation error

**Symptom:** Setting `frame.primaryAxisSizingMode = 'HUG'` throws: `Invalid enum value. Expected 'FIXED' | 'AUTO'`.

**Why:** The Figma Plugin API renamed `HUG` to `AUTO` for frame-level sizing modes.

**Fix:** Use `'AUTO'` for `primaryAxisSizingMode` and `counterAxisSizingMode` on frames/components. The values `'HUG'`, `'FILL'`, and `'FIXED'` still apply to **child** nodes via `layoutSizingHorizontal` / `layoutSizingVertical`.

```js
// Frame/component sizing
comp.primaryAxisSizingMode = 'AUTO';   // was 'HUG'
comp.counterAxisSizingMode = 'FIXED';

// Child node sizing (inside an auto-layout frame)
child.layoutSizingHorizontal = 'HUG';
child.layoutSizingVertical = 'FIXED';
```

**Status:** Resolved 2026-05-29.

---

### DROP_SHADOW on nodes inside a component set is always clipped — use OUTSIDE stroke for focus rings on components

**Symptom:** A `DROP_SHADOW` effect (spread: 3, radius: 0, offset: 0) applied to a node inside a component variant is invisible in the Figma canvas, even after setting `clipsContent = false` on both the variant and the component set.

**Why:** Figma component sets enforce overflow clipping on their child variants at the canvas rendering level, regardless of the `clipsContent` property. Effects that need to render outside a variant's bounding box (such as a spread-only shadow used as a focus ring) are silently clipped. This applies even when the shadow is on a filled child node (e.g. `Inner Frame`) rather than the variant itself.

**Fix:** Use an `OUTSIDE` stroke on the component variant node for focus rings. A stroke with `strokeAlign: 'OUTSIDE'` on the variant renders correctly. Apply only to focus state variants — do not add a hidden stroke to non-focus states.

```js
// Focus variant only — no stroke on default/hover/disabled
variant.strokes = [focusStrokePaint];
variant.strokeWeight = 3;
variant.strokeAlign = 'OUTSIDE';

// Non-focus variants — no stroke at all
variant.strokes = [];
```

**Code equivalence:** In CSS/Blazor this still maps to `outline: 3px solid var(--color-border-focus)`. The Figma mechanism differs but the design intent is the same — a ring that does not affect layout.

**Note:** DROP_SHADOW works correctly on non-component frames (e.g. input field rows inside a component variant have enough internal space for the shadow to remain within the variant bounds). The limitation only applies when the shadow must overflow the variant's outer edge.

**Status:** Resolved 2026-06-01. Button component uses OUTSIDE stroke. Input field uses DROP_SHADOW (ring stays within variant bounds).

---

### `combineAsVariants` must target a page or frame — not a text or shape node

**Symptom:** `figma.combineAsVariants(components, targetNode)` silently does nothing or creates the component set in the wrong place.

**Why:** The target node must be a `PAGE` or a `FRAME`. If a node ID from a Figma URL resolves to a text label or section heading rather than a container frame, the call fails silently or falls back to the current page.

**Fix:** Always verify the node type before using it as a parent:

```js
const node = figma.getNodeById('1318:14904');
// Note: a page ID from a Figma URL resolves to a PageNode, which IS valid
// but a text/shape node is not — check before calling
const parent = (node && (node.type === 'PAGE' || node.type === 'FRAME')) ? node : figma.currentPage;
```

**Status:** Resolved 2026-05-29. The Buttons page (ID `1318:14904`) is a `PageNode` — pass it directly to `combineAsVariants`.

---

### Icon fill overrides inside instances cannot be reset with `resetOverrides()` after `combineAsVariants`

**Symptom:** After calling `combineAsVariants`, calling `instance.resetOverrides()` or `child.fills = figma.mixed` on nested icon instances reports 0 nodes reset — fills remain overridden.

**Why:** Fill overrides baked into component children during creation are stored as part of the component definition, not as instance overrides. `resetOverrides()` only clears overrides on instances, not values set on the component node itself.

**Fix:** Do not apply fill overrides during creation. If icons should render as-is from their source component, create the instance and leave all children untouched:

```js
function createIcon() {
  const inst = homeIconComp.createInstance();
  inst.resize(16, 16);
  // Do NOT touch inst.findAll() or set any fills — let the component speak for itself
  return inst;
}
```

If you need colour-adaptive icons, handle it at the icon component level (e.g. via a colour variable or component property on the icon itself) rather than overriding fills in the consuming component.

**Status:** Resolved 2026-05-29.

---

## Auto Layout

### A wrapping text block keeps its creation height when `layoutSizingHorizontal = 'FILL'` is set after `textAutoResize = 'HEIGHT'`

**Symptom:** You build a stack of text blocks in a vertical auto-layout frame. Each block is set to `textAutoResize = 'HEIGHT'` so it grows with its content, and `layoutSizingHorizontal = 'FILL'` so it spans the frame. On canvas every block renders at its original height — 20px — so the text overflows and each section overlaps the one below it. The parent frame's height is far short of what the content needs (579px instead of 1099px for the same content).

**Why:** `textAutoResize = 'HEIGHT'` computes the height once, against the node's width *at that moment*. A freshly created text node is around 20px wide, so the computed height is one line. Setting `FILL` afterwards widens the node but does **not** re-run the height calculation — the stale one-line height sticks. The node is not "auto-height" in a live sense; the mode only recomputes when the text or the width is next set directly.

**Fix:** Establish the final width first, then set `textAutoResize` last so the height is computed against the real width:

```js
body.appendChild(b);
b.layoutSizingHorizontal = 'FILL';        // width is now the real, final width
b.textAutoResize = 'NONE';
b.resize(575, 20);                        // nudge width so the next line recomputes
b.textAutoResize = 'HEIGHT';              // height computed against 575, not 20
```

The `NONE` → `resize` → `HEIGHT` round trip is what forces the recalculation; setting `HEIGHT` alone on an already-filled node does not always re-measure. Verify with `node.height` in the returned payload — a stack of multi-line blocks all reporting exactly 20 is the tell.

**Prevented by:** nothing mechanical — this is a Figma-authoring gotcha with no repo-side build to gate it. The cheap check is to `return` the heights from the `use_figma` script and take a `screenshot()` in the same call; both catch it immediately, and neither costs an extra round trip.

**Status:** Resolved 2026-08-11. Hit while building the five `Guidelines/*` frames (Icons, Logos, Navigation, Header, Footer); the first attempt shipped a fully overlapping frame that looked plausible in the returned node IDs and only showed up in the screenshot.

---

## Assets & Export

### `figma.com` egress is blocked, but vector artwork can still be lifted via `fillGeometry`

**Symptom:** You need a real asset out of Figma and into the repo. `get_screenshot` / `download_assets` hand back a `figma.com` URL, and fetching it fails with `CONNECT tunnel failed, 403` — the environment network policy denies `www.figma.com`. It looks like nothing can be exported from a coding session, so the asset gets stubbed with a placeholder and the gap is written up as blocked-on-a-human.

**Why:** Only the *asset download* is blocked. The MCP channel itself is fine, and a `VECTOR` node carries its full outline on `node.fillGeometry` — an array of `{ data, windingRule }` in SVG path syntax, in the node's own coordinate space. Returning that from a `use_figma` script is a normal MCP response, not an HTTP fetch to Figma, so the policy never applies.

**Fix:** For pure-vector artwork, read the geometry and write the SVG yourself:

```js
const vec = variant.children.find(c => c.type === 'VECTOR');
return {
  width: vec.width, height: vec.height,
  windingRule: vec.fillGeometry[0].windingRule,   // NONZERO → fill-rule="nonzero"
  paths: vec.fillGeometry.map(g => g.data),
  fill: vec.fills[0].color                        // 0–1 floats; ×255 and hex it
};
```

Wrap the paths in `<svg viewBox="0 0 {width} {height}">` with the fill and `fill-rule` copied across. Copy the path data verbatim — do not round the coordinates or re-draw the shape. This is how `figma/assets/dhcw-symbol-{blue,white}.svg` reached the repo.

Limits worth knowing before reaching for it: it only covers vector fills. Raster fills, live text, strokes, blend modes, masks and effects are not in `fillGeometry`, so a lockup with an embedded image or unoutlined text still needs a real export. Check `node.type` and the fill types first — a `FRAME` full of `RECTANGLE`s with `IMAGE` fills will silently yield nothing useful.

**Prevented by:** nothing mechanical. The gate here is knowing to check whether the artwork is vector before recording an export as blocked.

**Status:** Resolved 2026-08-12. The DHCW icon-only mark sat as a placeholder for a full session because "figma.com is 403" was read as "no assets can leave Figma".

---

## How to add an entry

Copy this template and add it under the relevant section:

```
### Short description of the issue

**Symptom:** What you saw.

**Why:** Root cause.

**Fix:** What resolved it. Include code snippets where useful.

**Status:** Resolved / Ongoing / Workaround only. Date if resolved.
```
