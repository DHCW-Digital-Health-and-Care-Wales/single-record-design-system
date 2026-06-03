# DDR-004 — Desktop Heading Scale Revision

**Date:** 2026-06-01  
**Status:** Accepted  
**Decided by:** Design lead

---

## Context

The desktop heading scale had a structural gap: Heading XS sits at 16px (Medium weight) and Heading S jumped directly to 24px (Bold) — an 8px step with no intermediate size. The mobile scale already had a 20px step at Heading S, making mobile more graduated than desktop. The primitive `Font/Size/20` existed but was unused in desktop text styles.

In clinical UI, complex panels, nested sections, and dense forms require an intermediate heading level between component labels (16px) and section titles. Without a 20px step, designers were forced to choose between overusing 24px or stretching Heading XS beyond its intended role.

GDS and NHS England both have a heading step at approximately 19–20px in their scales.

---

## Decision

Shift the desktop heading scale down by one step, inserting 20px as the new Heading S and compressing the upper range:

| Style | Previous | New | Line Height |
|---|---|---|---|
| Heading XS | 16px Medium | 16px Medium | 24px (unchanged) |
| Heading S | 24px Bold | **20px Bold** | 27px |
| Heading M | 28px Bold | **24px Bold** | 30px |
| Heading L | 36px Bold | **28px Bold** | 32px |
| Heading XL | 48px Bold | **36px Bold** | 42px |

The 48px size is retained as a primitive (`Font/Size/48`) for future display or marketing use but removed from the named heading scale. A new level can be introduced if a use case requires it.

The mobile scale is unchanged.

---

## Rationale

- Desktop and mobile now share the same heading concepts at each level (XS, S, M, L, XL) even if the sizes differ — mobile is always smaller at each step, which is correct.
- The 16→20→24 progression at the bottom of the scale gives designers a usable intermediate heading without introducing new naming.
- Line heights are carried forward from existing styles at each shifted level, maintaining tested proportions.
- No new text style names are introduced — all existing component references to Heading S/M/L/XL continue to work, but the rendered sizes change. A component audit is required after applying.

---

## Consequences

- **Breaking change:** any component or screen using Desktop Heading S, M, L, or XL will render at a smaller size after this change. Visually less impactful than it sounds — the shift is 4–12px per level, not a wholesale redesign.
- **Component audit required:** Button, Input Field, Select, and any future components using these styles must be visually checked after applying.
- **48px not in the named scale:** if a use case for 48px+ headings emerges (e.g. patient-facing display boards), introduce a Heading 2XL or Display style via a new DDR at that time.
- **Mobile unchanged:** no mobile component references are affected.

---

## Alternatives considered

**Option B — Add 20px as Heading XXS, keep all existing styles unchanged.**  
Rejected: creates awkward naming ("XXS"), adds a sixth heading level, and doesn't fix the conceptual misalignment between desktop and mobile heading levels.
