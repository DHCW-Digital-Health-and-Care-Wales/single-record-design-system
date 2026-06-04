# Typography Tokens

All type decisions for the Single Record design system are defined here. Components reference these tokens — font values must not be hardcoded in component files.

Machine-readable source of truth: `/foundations/tokens/primitives/typography.json` (primitive scale) and `/foundations/tokens/semantic/typography.json` (semantic styles).

Scale governed by **DDR-005** (supersedes DDR-004).

---

## Typeface

| Role | Family | Notes |
|---|---|---|
| Primary (UI) | `Roboto` | Primary typeface across all Single Record products |
| Fallback | `Arial, sans-serif` | System fallback |

Typeface is defined as `font.family.primary` in the primitive token file and as a Figma variable (`Font/Family/Primary`) in the `Primitives` collection.

---

## Font Weight Scale

| Token | Value | Usage |
|---|---|---|
| `font.weight.regular` | `400` | Body text, captions |
| `font.weight.medium`  | `500` | Labels, table column headers |
| `font.weight.bold`    | `700` | Headings |

---

## Font Size Scale

All sizes are in px. Referenced via semantic tokens — do not use primitive size tokens in components.

| Token | Value | Used by |
|---|---|---|
| `font.size.12` | 12px | Caption |
| `font.size.14` | 14px | Label, Body S |
| `font.size.16` | 16px | Body M, Heading XS, Mobile Heading XS |
| `font.size.18` | 18px | Mobile Heading S |
| `font.size.20` | 20px | Mobile Heading M, Desktop Heading S |
| `font.size.24` | 24px | Mobile Heading L, Desktop Heading M |
| `font.size.28` | 28px | Mobile Heading XL, Desktop Heading L |
| `font.size.36` | 36px | Desktop Heading XL |

Heading sizes follow a 4-step modular progression (16 → 20 → 24 → 28 → 36). Mobile is the same scale shifted down by one step at the top — no 36px on mobile.

---

## Line Height Scale

All line heights are multiples of 4 — aligned to the 4px base spacing grid (DDR-001). This keeps vertical rhythm consistent across body text, headings, and components.

| Token | Value | Used by |
|---|---|---|
| `font.line-height.16` | 16px | Caption |
| `font.line-height.20` | 20px | Label, Body S |
| `font.line-height.24` | 24px | Body M, Heading XS, Mobile Heading S |
| `font.line-height.28` | 28px | Heading S, Mobile Heading M |
| `font.line-height.32` | 32px | Heading M, Mobile Heading L |
| `font.line-height.36` | 36px | Heading L, Mobile Heading XL |
| `font.line-height.44` | 44px | Heading XL |

---

## Letter Spacing

Values match the live Figma variables (`Font/Letter Spacing/*`) — the implementation source of truth.

| Token | Value | Usage |
|---|---|---|
| `font.letter-spacing.default` | `0px`   | Body text, headings |
| `font.letter-spacing.wide`    | `0.3px` | Labels and UI controls |
| `font.letter-spacing.caption` | `0.2px` | Caption text |

---

## Semantic Text Styles

These are the named styles used in Figma and referenced in all component specs. They combine primitive tokens into ready-to-use definitions. The JSON source is in `/foundations/tokens/semantic/typography.json`.

### Headings

| Style token | Desktop (size / line height) | Mobile (size / line height) | Weight |
|---|---|---|---|
| `sr.typography.heading-xl` | 36 / 44 | 28 / 36 | Bold |
| `sr.typography.heading-l`  | 28 / 36 | 24 / 32 | Bold |
| `sr.typography.heading-m`  | 24 / 32 | 20 / 28 | Bold |
| `sr.typography.heading-s`  | 20 / 28 | 18 / 24 | Bold |
| `sr.typography.heading-xs` | 16 / 24 | 16 / 24 | Bold |

Line-height ratios decrease monotonically as size grows (desktop: 1.50 → 1.40 → 1.33 → 1.29 → 1.22), following industry practice for type scales (GDS, NHS England, Material).

### Body

| Style token | Desktop | Mobile | Weight | Notes |
|---|---|---|---|---|
| `sr.typography.body-m` | 16 / 24 | 16 / 24 | Regular | Default body text. Minimum size for clinical content. |
| `sr.typography.body-s` | 14 / 20 | 14 / 20 | Regular | Supporting text, secondary content. Do not use for primary clinical content. |

### UI Text

| Style token | Desktop | Mobile | Weight | Tracking |
|---|---|---|---|---|
| `sr.typography.label`   | 14 / 20 | 14 / 20 | Medium  | Wide (0.3px) |
| `sr.typography.caption` | 12 / 16 | 12 / 16 | Regular | Caption (0.2px) |

---

## Accessibility Notes

- `body-m` (16px) is the **minimum** font size for primary clinical content — consistent with WCAG 2.2 and NHS guidance.
- `body-s` (14px) may be used for supporting text only. Do not use for essential clinical information.
- Do not use `caption` (12px) for any text that conveys essential meaning without a visible alternative.
- Do not use colour alone to distinguish text styles — use weight or size differences as well.
- Ensure text can be resized to 200% without loss of content or functionality (WCAG 1.4.4).
- Line length (measure) for body text: 60–80 characters. Enforce via layout constraints, not type tokens.
- All body-text line-height ratios are ≥ 1.5; the largest heading sits at 1.22, comfortably within WCAG 1.4.12 text-spacing tolerances.
