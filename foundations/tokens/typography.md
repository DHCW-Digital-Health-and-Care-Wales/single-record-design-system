# Typography Tokens

All type decisions for the Single Record design system are defined here. Components reference these tokens — font values must not be hardcoded in component files.

Machine-readable source of truth: `/foundations/tokens/primitives/typography.json` (primitive scale) and `/foundations/tokens/semantic/typography.json` (semantic styles).

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

| Token | Value | Usage context |
|---|---|---|
| `font.size.12` | 12px | Caption |
| `font.size.14` | 14px | Label, Body S |
| `font.size.16` | 16px | Body M, Heading XS |
| `font.size.19` | 19px | Heading S mobile |
| `font.size.22` | 22px | Heading M mobile, Heading S desktop |
| `font.size.26` | 26px | Heading M desktop |
| `font.size.27` | 27px | Heading L mobile |
| `font.size.32` | 32px | Heading XL mobile |
| `font.size.36` | 36px | Heading L desktop |
| `font.size.48` | 48px | Heading XL desktop |
| `font.size.64` | 64px | Reserved — display use only |

---

## Line Height Scale

Paired with font sizes via semantic tokens.

| Token | Value |
|---|---|
| `font.line-height.16` | 16px |
| `font.line-height.20` | 20px |
| `font.line-height.24` | 24px |
| `font.line-height.27` | 27px |
| `font.line-height.28` | 28px |
| `font.line-height.29` | 29px |
| `font.line-height.30` | 30px |
| `font.line-height.32` | 32px |
| `font.line-height.33` | 33px |
| `font.line-height.38` | 38px |
| `font.line-height.42` | 42px |
| `font.line-height.54` | 54px |
| `font.line-height.72` | 72px |

---

## Letter Spacing

Values in px, matching Figma variable definitions.

| Token | Value | Usage |
|---|---|---|
| `font.letter-spacing.default` | `0px`    | Body text, headings |
| `font.letter-spacing.wide`    | `0.7px`  | Labels and UI controls |
| `font.letter-spacing.caption` | `0.24px` | Caption text |

---

## Semantic Text Styles

These are the named styles used in Figma and referenced in all component specs. They combine primitive tokens into ready-to-use definitions. The JSON source is in `/foundations/tokens/semantic/typography.json`.

### Headings

| Style token | Desktop | Mobile | Weight |
|---|---|---|---|
| `sr.typography.heading-xl` | 48px / 54px lh | 32px / 38px lh | Bold |
| `sr.typography.heading-l`  | 36px / 42px lh | 27px / 33px lh | Bold |
| `sr.typography.heading-m`  | 26px / 32px lh | 22px / 29px lh | Bold |
| `sr.typography.heading-s`  | 22px / 30px lh | 19px / 27px lh | Bold |
| `sr.typography.heading-xs` | 16px / 24px lh | 16px / 24px lh | Bold |

### Body

| Style token | Desktop | Mobile | Weight | Notes |
|---|---|---|---|---|
| `sr.typography.body-m` | 16px / 24px lh | 16px / 24px lh | Regular | Default body text. Minimum size for clinical content. |
| `sr.typography.body-s` | 14px / 24px lh | 14px / 24px lh | Regular | Supporting text, secondary content. Do not use for primary clinical content. |

### UI Text

| Style token | Desktop | Mobile | Weight | Tracking |
|---|---|---|---|---|
| `sr.typography.label`   | 14px / 20px lh | 14px / 20px lh | Medium | Wide (0.7px) |
| `sr.typography.caption` | 12px / 16px lh | 12px / 16px lh | Regular | Caption (0.24px) |

---

## Accessibility Notes

- `body-m` (16px) is the **minimum** font size for primary clinical content — consistent with WCAG 2.2 and NHS guidance.
- `body-s` (14px) may be used for supporting text only. Do not use for essential clinical information.
- Do not use `caption` (12px) for any text that conveys essential meaning without a visible alternative.
- Do not use colour alone to distinguish text styles — use weight or size differences as well.
- Ensure text can be resized to 200% without loss of content or functionality (WCAG 1.4.4).
- Line length (measure) for body text: 60–80 characters. Enforce via layout constraints, not type tokens.
- Minimum line height for body text is met by all tokens in this scale (all ≥ 1.5 ratio).
