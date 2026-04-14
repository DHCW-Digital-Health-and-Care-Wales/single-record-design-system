# Semantic Colour Tokens

Semantic tokens assign **meaning** to primitive colour values. Components and patterns reference semantic tokens only — never primitives directly.

Machine-readable source of truth: `/foundations/tokens/semantic/color.json` (W3C Design Token format).

All semantic tokens use the `sr` prefix (Single Record).

Defined in Figma as **semantic colour variables**, aliased to primitive variables.

---

## Interactive

| Token | Maps to | Usage |
|---|---|---|
| `sr.color.interactive.primary` | `blue.800` | Primary buttons, active nav |
| `sr.color.interactive.primary-hover` | `blue.900` | Hover state for primary |
| `sr.color.interactive.secondary` | `navy.900` | Secondary interactive elements |
| `sr.color.interactive.link` | `info-blue` | Inline links |
| `sr.color.interactive.destructive` | `red.600` | Destructive actions |

---

## Surface

| Token | Maps to | Usage |
|---|---|---|
| `sr.color.surface.default` | `grey.100` | Default page background |
| `sr.color.surface.card` | `white` | Cards, panels, modals |
| `sr.color.surface.accent` | `cyan.100` | Accent/highlight backgrounds |
| `sr.color.surface.subtle` | `blue.50` | Subtle section backgrounds |
| `sr.color.surface.header` | `navy.900` | Header bars, navigation |

---

## Text

| Token | Maps to | Usage |
|---|---|---|
| `sr.color.text.primary` | `grey.900` | Body text, headings |
| `sr.color.text.secondary` | `grey.600` | Supporting text, captions |
| `sr.color.text.inverse` | `white` | Text on dark backgrounds |

---

## Border

| Token | Light | Dark | Usage |
|---|---|---|---|
| `sr.color.border.subtle`  | `grey.100` (#f0f4f5) | `navy.700` (#464c64) | Row dividers and internal table separators. Use only where Default would be too prominent. |
| `sr.color.border.default` | `grey.200` (#d8dde0) | `navy.500` (#707488) | Standard borders — inputs, cards, section dividers. |
| `sr.color.border.strong`  | `grey.600` (#4c6272) | `navy.300` (#9ea1af) | High-contrast borders — active rows, structural dividers. |
| `sr.color.border.focus`   | `focus-yellow` (#ffeb3b) | same | Focus ring. Pair with `Border/Width/Strong` (2px) and an inner dark ring. |

---

## Status

Used in banners, badges, row highlights, and clinical alert states.

| Token | Maps to | Meaning |
|---|---|---|
| `sr.color.status.critical` | `red.600` | Failed, invalid, critical |
| `sr.color.status.critical-surface` | `red.100` | Critical background |
| `sr.color.status.success` | `green.600` | Completed, confirmed |
| `sr.color.status.success-surface` | `green.100` | Success background |
| `sr.color.status.warning` | `yellow.500` | Requires attention |
| `sr.color.status.warning-surface` | `yellow.100` | Warning background |
| `sr.color.status.info` | `info-blue` | Informational |
| `sr.color.status.info-surface` | `info-blue.100` | Info background |

**Clinical alert note:** Do not rely on colour alone to communicate clinical status. Always pair with an icon and text label. See `/accessibility/colour-and-contrast.md`.

---

## Contrast Checks

| Pairing | Ratio | WCAG |
|---|---|---|
| `text.primary` (`#212B32`) on `surface.default` (`#F0F4F5`) | 13.8:1 | AAA |
| `text.primary` (`#212B32`) on `surface.card` (`#FFFFFF`) | 15.6:1 | AAA |
| `text.secondary` (`#4C6272`) on `surface.card` (`#FFFFFF`) | 6.1:1 | AA |
| `text.inverse` (`#FFFFFF`) on `interactive.primary` (`#325083`) | 7.5:1 | AAA |
| `text.inverse` (`#FFFFFF`) on `surface.header` (`#1B294A`) | 13.2:1 | AAA |
| `border.focus` (`#FFEB3B`) on `surface.card` (`#FFFFFF`) | 1.1:1 | — (paired with inner ring) |
| `status.critical` (`#D5281B`) on `status.critical-surface` (`#FCDBD9`) | 4.7:1 | AA |
| `status.success` (`#007F3B`) on `status.success-surface` (`#D9EFE5`) | 4.5:1 | AA |

---

## Notes

- All semantic tokens alias primitives using `{path.to.token}` syntax in the JSON source.
- The `dhcw` prefix is provisional and can be renamed across both JSON and Figma in one pass.
- Component-level tokens (Tier 3) will be added per-component as specs are finalised.
- Machine-readable source: `/foundations/tokens/semantic/color.json`.
