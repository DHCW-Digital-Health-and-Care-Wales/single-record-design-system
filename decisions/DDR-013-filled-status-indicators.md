# DDR-013 — Filled status indicators (Figma "warnings/*") as a component, not outline icons

**Date:** 2026-07-01
**Status:** Accepted
**Decided by:** Design lead

---

## Context

The updated Figma icon set added a `warnings/*` group — `check`, `error`,
`warning` (and `determinate`, whose purpose is undocumented and is deferred).
Unlike the rest of the icon set, these render as **filled, two-tone status
badges**: a solid coloured disc/triangle with a knocked-out glyph, where the
colour itself carries meaning (green = success, red = error, amber = warning).

This conflicts with the icon-system contract (DDR-003): Lucide **outline**
glyphs, 2px stroke, a single `currentColor`, recolourable anywhere. Forcing the
filled badges into that pipeline would either lose their fill/colour semantics
or bake multiple colours into a set that is supposed to be single-colour. They
also duplicate existing outline icons by shape (`status/alert` ≈ warning,
`status/error-circle` ≈ error).

There was also a stated concern about **legal exposure** from importing the
badge artwork.

---

## Decision

Ship the filled badges as a **separate `StatusIndicator` component**, not as
entries in the outline icon set.

- Variants: `success`, `error`, `warning`. (`determinate` is excluded until its
  purpose is confirmed — see DDR-012 note / backlog.)
- Colour is **semantic and token-driven**: the disc/triangle is `currentColor`,
  set by `Status/Success`, `Status/Critical`, `Status/Warning`. Recolouring the
  status token recolours the badge.
- The glyph is knocked out: **white on the darker success/error discs**; a
  **dark glyph (`Text/Primary`) on the amber warning triangle** for legibility
  (the universal yellow-sign convention — white on `#f8ca4d` is too low
  contrast).
- Decorative by default (`aria-hidden`); pass a `label` to expose it as a
  meaningful `role="img"`.

### Provenance — no legal exposure

The badge **geometry is derived from Lucide (ISC-licensed)** primitives
(`circle`, `circle-check`, `circle-alert`, `triangle-alert`) that the project
already licenses, **not traced or copied from the Figma raster export** or any
third-party (possibly differently-licensed) icon set. ISC permits modification
and commercial use, and the project already tracks Lucide provenance
(DDR-003 / third-party licences index). Building filled variants from open
geometry we already license means there is nothing to attribute or clear.

---

## Why not …

**Add them to the outline icon set.** Rejected: two-tone filled marks break the
single-`currentColor` outline contract (DDR-003) and duplicate existing outline
status icons by shape.

**Import the Figma vectors directly.** Rejected: unknown provenance of the
source artwork is the exact legal risk raised; deriving from Lucide removes it.

**Skip them.** Rejected: filled status badges are needed for validation and
result states; only `determinate` (unclear purpose) is deferred.

---

## Accessibility note

`Status/Warning` (`#f8ca4d`) is a light amber. The warning badge therefore uses
a **dark** glyph, and consumers must ensure the badge shape meets WCAG 2.2
non-text contrast (1.4.11) against its background — on very light surfaces the
amber may need an outline or a darker amber token. Flagged for the token owner;
not blocking the component.
