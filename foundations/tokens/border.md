# Border & Radius Tokens

Token source: `foundations/tokens/border.json`  
Figma: `Primitives` collection (global), `Single Record` collection (semantic)

---

## Border colour

Four semantic tokens covering the full contrast range needed for clinical UI. Always reference these — never use raw hex for borders.

| Token | Light | Dark | Use |
|---|---|---|---|
| `sr.color.border.subtle`  | `#f0f4f5` | `#464c64` | Row dividers in data tables, internal separators on white/card surfaces. Use when Default would overpower the content. |
| `sr.color.border.default` | `#d8dde0` | `#707488` | Standard inputs, cards, panels, list separators. The baseline for most bordered elements. |
| `sr.color.border.strong`  | `#4c6272` | `#9ea1af` | Active/selected states, structural dividers, section headers that must read clearly. |
| `sr.color.border.focus`   | `#ffeb3b` | `#ffeb3b` | Focus rings only. Never use for decorative purposes. Always pair with an inner dark ring and `Border/Width/Strong`. |

**Notes:**
- Do not use `border.subtle` as the only visual indicator of a boundary — on low-contrast displays it may not be perceptible. Pair with background colour or spacing.
- `border.focus` alone fails WCAG SC 1.4.11 (non-text contrast) against white. The NHS/GDS pattern is: 3px `focus-yellow` outer ring + 2px `navy.900` inner ring, giving a 3:1 yellow-to-background and clear dark boundary.

---

## Border width

| Token | Value | Use |
|---|---|---|
| `sr.border.width.default` | 1px | All standard borders — inputs, cards, dividers. |
| `sr.border.width.strong`  | 2px | Active/selected states, focus ring inner stroke, error states on form inputs. |

Integer values only. No 0.5px. For subtler demarcation, use `border.subtle` colour with `width.default` rather than a fractional width.

---

## Corner radius

A five-step conservative scale. Clinical and administrative UI favours flat-to-slightly-rounded surfaces — this is consistent with GDS and NHS England design systems.

| Token | Value | Use |
|---|---|---|
| `sr.radius.none` | 0px   | Tables, data grids, full-bleed containers, elements abutting screen edges or adjacent cells. |
| `sr.radius.sm`   | 2px   | Form inputs, text areas, select controls, inline tags, chips, small badges. |
| `sr.radius.md`   | 4px   | Buttons, cards, panels, notification banners, tooltips. **Default for most interactive components.** |
| `sr.radius.lg`   | 8px   | Modals, side drawers, floating dropdown menus, large overlay surfaces. |
| `sr.radius.full` | 9999px | Status chips, avatar rings, toggle switches, search input end-caps. Not for rectangular content. |

### Guidance

- **Consistency within a component**: all four corners should use the same token unless there is a specific structural reason to differ (e.g. a button that sits flush against an adjacent element).
- **Dense data contexts** (`radius.none` or `radius.sm`): tables, grids, and multi-row lists should use flat or near-flat radii. Rounded corners in tight grids waste space and disrupt the alignment grid.
- **Layered UI**: modal (`radius.lg`) > card inside modal (`radius.md`) > input inside card (`radius.sm`). Radius should decrease as nesting depth increases.
- **Do not mix adjacent radii**: if two cards sit side-by-side they must use the same radius token.

### Radius by component (reference)

| Component | Radius token |
|---|---|
| Button (primary, secondary, ghost) | `radius.md` (4px) |
| Text input, select, textarea | `radius.sm` (2px) |
| Card, panel | `radius.md` (4px) |
| Data table | `radius.none` (0px) |
| Modal, drawer | `radius.lg` (8px) |
| Tooltip | `radius.md` (4px) |
| Badge, status chip | `radius.full` |
| Tag, inline label | `radius.sm` (2px) |
| Navigation sidebar | `radius.none` (0px) |
| Search input | `radius.sm` end-cap, or `radius.full` for pill style |

This table is a starting point — each component spec is the authoritative source.

---

## Platform implementation

### CSS (Blazor)

```css
:root {
  /* Border colours */
  --sr-color-border-subtle:  var(--sr-color-grey-100);
  --sr-color-border-default: var(--sr-color-grey-200);
  --sr-color-border-strong:  var(--sr-color-grey-600);
  --sr-color-border-focus:   var(--sr-color-focus-yellow);

  /* Border widths */
  --border-width-default: 1px;
  --border-width-strong:  2px;

  /* Radius */
  --radius-none:  0px;
  --radius-sm:    2px;
  --radius-md:    4px;
  --radius-lg:    8px;
  --radius-full:  9999px;
}

/* Example: standard input */
.sr-input {
  border: var(--border-width-default) solid var(--sr-color-border-default);
  border-radius: var(--radius-sm);
}

/* Example: focus state */
.sr-input:focus {
  outline: var(--border-width-strong) solid var(--sr-color-border-focus);
  outline-offset: 0;
  box-shadow: 0 0 0 4px var(--sr-color-navy-900); /* inner dark ring */
}
```

### XAML (MAUI)

```xml
<ResourceDictionary>
  <!-- Border widths -->
  <x:Double x:Key="BorderWidthDefault">1</x:Double>
  <x:Double x:Key="BorderWidthStrong">2</x:Double>

  <!-- Radius -->
  <x:Double x:Key="RadiusNone">0</x:Double>
  <x:Double x:Key="RadiusSm">2</x:Double>
  <x:Double x:Key="RadiusMd">4</x:Double>
  <x:Double x:Key="RadiusLg">8</x:Double>
  <x:Double x:Key="RadiusFull">9999</x:Double>
</ResourceDictionary>
```
