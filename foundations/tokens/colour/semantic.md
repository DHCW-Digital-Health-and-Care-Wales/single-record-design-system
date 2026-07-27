# Semantic Colour Tokens

Semantic tokens assign **meaning** to primitive colour values. Components and patterns reference semantic tokens only — never primitives directly.

Machine-readable source of truth: `/foundations/tokens/semantic/color.json` (light) and `semantic/color.dark.json` (dark mode overrides).

All semantic tokens use the `sr` prefix (Single Record). They are defined in Figma as **semantic colour variables** in the `Single Record` collection, with **Light** and **Dark** modes. The Figma collection is the canonical source — JSON and docs follow it.

---

## Interactive

| Token | Light | Dark | Usage |
|---|---|---|---|
| `sr.color.interactive.primary`       | `blue.800`     | `info-blue.600` | Primary buttons, active nav |
| `sr.color.interactive.primary-hover` | `blue.900`     | `info-blue.800` | Hover step for primary |
| `sr.color.interactive.secondary`     | `navy.900`     | `blue.300`      | Secondary interactive elements |
| `sr.color.interactive.link`          | `info-blue.700`| `cyan.400`      | Inline links |
| `sr.color.interactive.destructive`   | `red.600`      | `red.600`       | Destructive actions |
| `sr.color.interactive.disabled`      | `blue.400`     | `blue.400`      | Disabled fills |

---

## Surface

| Token | Light | Dark | Usage |
|---|---|---|---|
| `sr.color.surface.background`     | `blue.50`  | `navy.900`  | Default page/app background |
| `sr.color.surface.small-cards`    | `white`    | `cyan.850`  | Cards, panels, modals |
| `sr.color.surface.section-cards`  | `white`    | `blue.900`  | Primary background for card sections in modular layout |
| `sr.color.surface.accent`         | `cyan.100` | `blue.900`  | Accent / highlight backgrounds |
| `sr.color.surface.subtle`         | `blue.50`  | `navy.700`  | Subtle section backgrounds — table rows, inactive tabs |

---

## Text

| Token | Light | Dark | Usage |
|---|---|---|---|
| `sr.color.text.primary`   | `grey.900` | `white`    | Body text, headings |
| `sr.color.text.secondary` | `grey.600` | `grey.200` | Supporting text, captions |
| `sr.color.text.inverse`   | `white`    | `grey.900` | Text on dark / colour backgrounds |
| `sr.color.text.disabled`  | `navy.500` | `navy.300` | Disabled text |

---

## Border

| Token | Light | Dark | Usage |
|---|---|---|---|
| `sr.color.border.subtle`   | `grey.100` | `navy.700` | Row dividers and internal table separators |
| `sr.color.border.default`  | `grey.200` | `navy.500` | Standard borders — inputs, cards, section dividers |
| `sr.color.border.strong`   | `grey.600` | `navy.300` | High-contrast borders — active rows, structural dividers |
| `sr.color.border.focus`    | `cyan.700` | `cyan.700` | Focus ring (**DDR-006**, supersedes focus-yellow). Pair with `Border/Width/Strong` (2px) and an inner dark ring on saturated backgrounds. |
| `sr.color.border.disabled` | `navy.300` | `navy.300` | Disabled borders |

---

## Brand

| Token | Light | Dark | Usage |
|---|---|---|---|
| `sr.color.brand.accent` | `cyan.700` | `cyan.700` | Decorative accent only — borders, icon strokes, chart accents, active-tab underlines. **Never use as a filled surface requiring white text.** |

Cyan-700 (#12A3C9) does not meet AA contrast with white text (2.6:1). Use `sr.color.interactive.primary` for filled surfaces that need white text.

---

## Status

Used in banners, badges, row highlights, and clinical alert states. Dark mode keeps the light status surfaces — banners switch to light fills so the bright status colour reads clearly against them.

| Token | Light | Dark | Meaning |
|---|---|---|---|
| `sr.color.status.critical`         | `red.700`       | `red.700`       | Failed, invalid, critical |
| `sr.color.status.critical-surface` | `red.100`       | `red.100`       | Critical background |
| `sr.color.status.success`          | `green.700`     | `green.700`     | Completed, confirmed |
| `sr.color.status.success-surface`  | `green.100`     | `green.100`     | Success background |
| `sr.color.status.warning`          | `yellow.500`    | `yellow.500`    | Requires attention |
| `sr.color.status.warning-surface`  | `yellow.100`    | `yellow.100`    | Warning background |
| `sr.color.status.info`             | `info-blue.700` | `info-blue.700` | Informational |
| `sr.color.status.info-surface`     | `info-blue.100` | `info-blue.100` | Info background |

**Clinical alert note:** Do not rely on colour alone to communicate clinical status. Always pair with an icon and text label. See `/accessibility/colour-and-contrast.md`.

---

## Contrast Checks

| Pairing | Ratio | WCAG |
|---|---|---|
| `text.primary` (`#212B32`) on `surface.background` light (`#F4F5F8`) | 15.4:1 | AAA |
| `text.primary` (`#212B32`) on `surface.small-cards` light (`#FFFFFF`) | 15.6:1 | AAA |
| `text.secondary` (`#4C6272`) on `surface.small-cards` light (`#FFFFFF`) | 6.1:1 | AA |
| `text.inverse` (`#FFFFFF`) on `interactive.primary` light (`#325083`) | 7.5:1 | AAA |
| `text.inverse` (`#FFFFFF`) on `interactive.primary` dark (`#0D62A3`) | 5.1:1 | AA |
| `text.primary` dark (`#FFFFFF`) on `surface.background` dark (`#1B294A`) | 13.8:1 | AAA |
| `text.inverse` light (`#FFFFFF`) on `surface.small-cards` dark (`#0C7B99`) | 4.9:1 | AA |
| `border.focus` (`#12A3C9`) on `surface.background` light (`#F4F5F8`) | 3.4:1 | AA (1.4.11 non-text) |
| `border.focus` (`#12A3C9`) on `surface.background` dark (`#1B294A`) | 4.6:1 | AA (1.4.11 non-text) |
| `status.critical` (`#D5281B`) on `status.critical-surface` (`#FCDBD9`) | 4.7:1 | AA |
| `status.success` (`#007F3B`) on `status.success-surface` (`#D9EFE5`) | 4.5:1 | AA |

---

## Notes

- All semantic tokens alias primitives using `{path.to.token}` syntax in the JSON source.
- The `focus-yellow` primitive was removed once DDR-006 made `cyan.700` the focus colour in both modes. There is no separate focus primitive.
- Component-level tokens (Tier 3) will be added per-component as specs are finalised.
