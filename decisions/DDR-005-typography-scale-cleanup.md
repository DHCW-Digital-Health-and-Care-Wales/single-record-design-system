# DDR-005 — Typography Scale Cleanup (4px Grid)

**Date:** 2026-06-04
**Status:** Accepted
**Supersedes:** DDR-004
**Decided by:** Design lead

---

## Context

A cross-check of the typography tokens after DDR-004 found three problems:

1. **DDR-004's Heading L desktop (28 / 32, ratio 1.14)** was tighter than Heading M (24 / 30, ratio 1.25) and tighter than mobile Heading L (27 / 33, ratio 1.22). Line-height ratios should decrease monotonically with size — DDR-004 inverted that step.
2. **The primitive scale carried off-grid line-heights** (27, 29, 30, 33, 38, 42, 54) inherited from GDS-style mobile sizes. They didn't align to the 4px base spacing grid (DDR-001), which hurt vertical rhythm in components.
3. **Letter-spacing values disagreed** between `typography.md` (`wide` = 0.7, `caption` = 0.24), `semantic/typography.json` (same), and the live Figma variables (`wide` = 0.3, `caption` = 0.2). Figma is what components actually consume.

---

## Decision

Adopt a single clean scale on the 4px grid for both desktop and mobile, and align letter-spacing to the Figma values.

### Heading scale

| Style | Desktop | Mobile | Weight |
|---|---|---|---|
| Heading XS | 16 / 24 | 16 / 24 | Bold |
| Heading S  | **20 / 28** | **18 / 24** | Bold |
| Heading M  | **24 / 32** | **20 / 28** | Bold |
| Heading L  | **28 / 36** | **24 / 32** | Bold |
| Heading XL | **36 / 44** | **28 / 36** | Bold |

Desktop ratios: 1.50, 1.40, 1.33, 1.29, 1.22 — monotonically decreasing.
Mobile ratios: 1.50, 1.33, 1.40, 1.33, 1.29 — small bump at M but all comfortably above WCAG 1.4.12.

### Primitive line-height scale

Reduced to multiples of 4 only: **16, 20, 24, 28, 32, 36, 44**.
Removed: 27, 29, 30, 33, 38, 42, 54, 72.

### Primitive size scale

Removed off-grid sizes (19, 22, 26, 27, 32, 48, 64). New set: **12, 14, 16, 18, 20, 24, 28, 36**.

### Letter spacing

Aligned to Figma:

| Token | Was (docs/JSON) | Now |
|---|---|---|
| `font.letter-spacing.wide` | 0.7px | **0.3px** |
| `font.letter-spacing.caption` | 0.24px | **0.2px** |
| `font.letter-spacing.default` | 0px | 0px (unchanged) |

### Body / Label / Caption

Unchanged in concept; `body-s` line height updated from 24 to **20** to sit on the 4px grid with size 14 (ratio 1.43). All other body/label/caption values already aligned.

---

## Rationale

- **4px grid alignment** makes typography composable with spacing tokens. A Heading L (28 / 36) inside a card padded to `Space/4` lines up cleanly; an off-grid line-height of 30 or 33 does not.
- **Monotonic line-height ratios** are standard practice (GDS, NHS England, Material). Headings get tighter as they get larger — never the other way around.
- **Single source of truth for letter-spacing**: the Figma values are what designers and engineers actually see in components, so the JSON should follow them rather than the other way around.
- **Smaller primitive scale** removes "which size do I pick" ambiguity. Eight sizes covers everything from caption to hero.

---

## Consequences

- **Breaking change** vs DDR-004 and vs the original scale: Heading S, M, L, XL all change pixel sizes and line heights. Heading XS, body, label, and caption are unchanged at the desktop breakpoint.
- **Mobile changes too** (this is the part DDR-004 left untouched): mobile S/M/L/XL move from 19/22/27/32 to 18/20/24/28.
- **Figma variable rename / value updates required** for: `Font/Size/19, 22, 26, 27, 32, 48` (remove or repoint); `Font/Line Height/27, 29, 30, 33, 38, 42, 54` (remove). Add `Font/Size/18, 20, 28`; add `Font/Line Height/28, 36, 44`.
- **Component audit required**: Button (Heading XS — unaffected), Input Field, Select, all heading usages on existing screens. Patient banner uses Heading M — needs visual check.
- **Letter-spacing values in Figma are already correct** — no Figma change needed for tracking.

---

## Alternatives considered

**Keep DDR-004 as is, only fix Heading L line-height to 36.**
Rejected: would have left off-grid line-heights elsewhere (30, 42) and the letter-spacing disagreement unresolved. Worth doing the full clean-up once.

**Match GDS / NHS mobile sizes exactly (19, 22, 27, 32).**
Rejected: these don't sit on the 4px grid. The aesthetic benefit of brand familiarity is smaller than the rhythm benefit of grid alignment, and DHCW Single Record is a clinical product, not a public-facing GDS service.
