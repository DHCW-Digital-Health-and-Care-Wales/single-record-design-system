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

## How to add an entry

Copy this template and add it under the relevant section:

```
### Short description of the issue

**Symptom:** What you saw.

**Why:** Root cause.

**Fix:** What resolved it. Include code snippets where useful.

**Status:** Resolved / Ongoing / Workaround only. Date if resolved.
```
