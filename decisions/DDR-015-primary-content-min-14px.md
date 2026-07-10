# DDR-015 — Primary-content minimum type size: Body S (14px)

**Date:** 2026-07-09
**Status:** Accepted
**Decided by:** Design lead
**Supersedes:** N/A (refines the DDR-005 scale usage; scale values unchanged)

---

## Context

The Single Record system is a clinical, **table and data-heavy** product. Screens
routinely present dense tabular data, patient lists, and multi-column records where
vertical space is scarce. Earlier guidance (inherited from public-facing NHS/GDS
practice) set **Body M (16px)** as the minimum for primary content and restricted
**Body S (14px)** to supporting text only.

In practice this forced either oversized table text or off-scale one-off sizes, and it
conflicted with how clinical staff actually work with dense data. The question raised:
can primary content sit at 14px without breaking accessibility?

---

## Decision

**The minimum type size for primary content is `Body S` (14px).** `Body S` is now an
allowed size for primary content, including tables and data-dense views. `Body M` (16px)
remains **preferred** for long-form reading and clinical notes. `Caption` (12px) stays
non-essential-only.

The **scale itself is unchanged** (DDR-005). This decision changes *usage guidance*, not
token values.

| Style | Role after this DDR |
|---|---|
| `body-m` (16/24) | Preferred for long-form reading, prose, clinical notes |
| `body-s` (14/20) | **Minimum for primary content** in tables and data-dense views; also supporting text, form values/placeholders |
| `caption` (12/16) | Non-essential text only; never the sole carrier of meaning |

---

## Options Considered

### Option A — Keep 16px minimum (status quo)
- **Pros:** Matches NHS/GDS defaults; maximum legibility.
- **Cons:** Impractical for dense clinical tables; drives off-scale overrides; ignores the product's real context.

### Option B — Body S (14px) minimum for primary content (chosen)
- **Pros:** Fits data-dense clinical UIs; stays on-scale; still WCAG 2.2 AA; 16px stays available and preferred for reading.
- **Cons:** A deliberate divergence from public-sector 16px convention; must be documented so it is not read as an oversight.

### Option C — Allow 12px for dense data
- **Pros:** Maximum density.
- **Cons:** Rejected. 12px is too small for primary clinical content and risks legibility/contrast issues.

---

## Rationale

**This does not break WCAG 2.2 AA.** There is no minimum font-size success criterion in
WCAG. The binding requirements are all still met:

- **1.4.4 Resize text** — text resizes to 200% without loss (relative units; no zoom suppression).
- **1.4.10 Reflow** — content reflows at 400%.
- **1.4.3 Contrast (Minimum)** — every text style meets 4.5:1 (3:1 for large text).
- **1.4.12 Text spacing** — the scale tolerates user spacing overrides.

The divergence from the NHS/GDS 16px default is intentional and justified by the clinical,
data-dense context. Body M remains the default for reading-oriented content, so density
does not cost legibility where it matters.

---

## Consequences

- Guideline and reference docs updated: `foundations/tokens/typography.guidelines.md`,
  `foundations/tokens/typography.md`, and the Figma Typography page (`89:3074`) + guidelines
  panel (`3460:20`).
- Component specs that assumed a 16px floor for primary content (e.g. tables) may now use
  Body S for primary cells — check on next component audit.
- Any future public-facing (non-clinical) surface should re-evaluate; this decision is
  scoped to the clinical product context.

---

## References

- DDR-005 — typography scale cleanup (the scale this refines)
- WCAG 2.2 SC 1.4.3, 1.4.4, 1.4.10, 1.4.12
- `foundations/tokens/typography.guidelines.md`
</content>
