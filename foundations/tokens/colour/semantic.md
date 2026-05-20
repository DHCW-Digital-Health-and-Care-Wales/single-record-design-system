# Semantic Colour Tokens

Semantic tokens assign **meaning** to primitive colour values. Components and patterns reference semantic tokens only — never primitives directly.

Machine-readable source of truth: `/foundations/tokens/semantic/color.json` (light) and `semantic/color.dark.json` (dark mode overrides).

All semantic tokens use the `sr` prefix (Single Record). They are defined in Figma as **semantic colour variables** in the `Single Record` collection, with **Light** and **Dark** modes.

---

## Interactive

| Token | Light | Dark | Usage |
|---|---|---|---|
| `sr.color.interactive.primary` | `blue.800` | `cyan.700` | Primary buttons, active nav |
| `sr.color.interactive.primary-hover` | `blue.900` | `cyan.600` | Hover state for primary |
| `sr.color.interactive.secondary` | `navy.900` | `blue.300` | Secondary interactive elements |
| `sr.color.interactive.link` | `info-blue` | `cyan.400` | Inline links |
| `sr.color.interactive.destructive` | `red.600` | `red.600` | Destructive actions |

---

## Surface

| Token | Light | Dark | Usage |
|---|---|---|---|
| `sr.color.surface.background` | `grey.100` | `navy.900` | Default page/app background |
| `sr.color.surface.small-cards` | `white` | `cyan.900` | Cards, panels, modals |
| `sr.color.surface.accent` | `cyan.100` | `blue.900` | Accent/highlight backgrounds |
| `sr.color.surface.subtle` | `blue.50` | `navy.700` | Subtle section backgrounds |
| `sr.color.surface.section-cards` | `white` | `blue.900` | Primary background for card sections in modular layout |

---

## Text

| Token | Light | Dark | Usage |
|---|---|---|---|
| `sr.color.text.primary` | `grey.900` | `white` | Body text, headings |
| `sr.color.text.secondary` | `grey.600` | `grey.200` | Supporting text, captions |
| `sr.color.text.inverse` | `white` | `grey.900` | Text on dark/colour backgrounds |

---

## Border

| Token | Light | Dark | Usage |
|---|---|---|---|
| `sr.color.border.subtle`  | `grey.100` | `navy.700` | Row dividers and internal table separators. Use only where Default would be too prominent. |
| `sr.color.border.default` | `grey.200` | `navy.500` | Standard borders — inputs, cards, section dividers. |
| `sr.color.border.strong`  | `grey.600` | `navy.300` | High-contrast borders — active rows, structural dividers. |
| `sr.color.border.focus`   | `focus-yellow` | `focus-yellow` | Focus ring. Pair with `Border/Width/Strong` (2px) and an inner dark ring. |

---

## Status

Used in banners, badges, row highlights, and clinical alert states.

| Token | Light | Dark | Meaning |
|---|---|---|---|
| `sr.color.status.critical` | `red.600` | `red.100` | Failed, invalid, critical |
| `sr.color.status.critical-surface` | `red.100` | `blue.900` | Critical background |
| `sr.color.status.success` | `green.600` | `green.100` | Completed, confirmed |
| `sr.color.status.success-surface` | `green.100` | `navy.900` | Success background |
| `sr.color.status.warning` | `yellow.500` | `yellow.500` | Requires attention |
| `sr.color.status.warning-surface` | `yellow.100` | `navy.700` | Warning background |
| `sr.color.status.info` | `info-blue.700` | `info-blue.700` | Informational |
| `sr.color.status.info-surface` | `info-blue.100` | `navy.900` | Info background |

**Clinical alert note:** Do not rely on colour alone to communicate clinical status. Always pair with an icon and text label. See `/accessibility/colour-and-contrast.md`.

---

## Contrast Checks

| Pairing | Ratio | WCAG |
|---|---|---|
| `text.primary` (`#212B32`) on `surface.background` (`#F0F4F5`) | 13.8:1 | AAA |
| `text.primary` (`#212B32`) on `surface.small-cards` (`#FFFFFF`) | 15.6:1 | AAA |
| `text.secondary` (`#4C6272`) on `surface.small-cards` (`#FFFFFF`) | 6.1:1 | AA |
| `text.inverse` (`#FFFFFF`) on `interactive.primary` (`#325083`) | 7.5:1 | AAA |
| `text.primary` (`#212B32`) on `surface.header` (`#FFFFFF`) | 15.6:1 | AAA |
| `border.focus` (`#FFEB3B`) on `surface.small-cards` (`#FFFFFF`) | 1.1:1 | — (paired with inner ring) |
| `status.critical` (`#D5281B`) on `status.critical-surface` (`#FCDBD9`) | 4.7:1 | AA |
| `status.success` (`#007F3B`) on `status.success-surface` (`#D9EFE5`) | 4.5:1 | AA |

---

## Notes

- All semantic tokens alias primitives using `{path.to.token}` syntax in the JSON source.
- Component-level tokens (Tier 3) will be added per-component as specs are finalised.
- Machine-readable sources: `semantic/color.json` (light), `semantic/color.dark.json` (dark).
