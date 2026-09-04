# DDR-028 — Icons carry no colour; `currentColor` only

**Date:** 2026-09-04
**Status:** Accepted
**Decided by:** Design lead (icon catalogue remediation brief)
**Relates to:** DDR-003 (Lucide), DDR-011 (dark mode), DDR-013 (filled status indicators), DDR-026 (dark-mode token semantics)

---

## Context

Colour in this design system is applied at the point of use, from
`color.*` semantic tokens. An asset that carries its own fill or stroke value
opts out of that: it cannot be recoloured for a status context, and — the part
that bites hardest — it cannot follow a dark-mode token swap. It will keep its
light-mode colour on a dark surface and quietly fail contrast.

The icon catalogue was audited for this as part of the remediation. The result
is worth recording, because it is the opposite of what the brief expected:

**All 146 SVGs in `foundations/iconography/svg/` already use `currentColor`
with `fill="none"`. Zero carry baked colour.** The remediation brief called for
stripping fill colours from four icons in a `warnings/` domain; that domain does
not exist in this repository and never has. See DDR-013 for where those four
went.

So this DDR is not a migration. It records an existing property of the set and
makes it enforceable, so it stays true.

---

## Decision

Every icon in `foundations/iconography/svg/` must:

| Attribute | Value |
|---|---|
| `fill` | `none` (or `currentColor` where the glyph is genuinely solid) |
| `stroke` | `currentColor` |
| `stroke-width` | `1` (DDR-023) |

Prohibited anywhere in an icon SVG:

- a hex, `rgb()`, `hsl()` or named colour on `fill`, `stroke`, `stop-color`,
  `flood-color` or `lighting-color`
- colour inside a `style="…"` attribute
- gradients or filters that introduce colour

Permitted values are exactly: `none`, `currentColor`, `inherit`, `transparent`.

### This does not apply to `StatusIndicator`

The filled status badges are **not icons** and are out of scope. They are
two-tone by design: a `currentColor` disc or triangle with a knocked-out glyph
in a second colour (white on the darker success/error discs, `Text/Primary` on
the amber warning triangle, because white on `#f8ca4d` is illegible). That
second colour is load-bearing.

Flattening them to a single `currentColor` — as the remediation brief proposed —
would render a solid disc with an invisible glyph. The knockout *is* the mark.
They stay a component, per DDR-013.

---

## Why not …

**Allow a hardcoded white for knockouts inside icons.** Rejected: it is the thin
end of the wedge, and it is exactly the case that breaks in dark mode. Anything
needing two colours is a component, not an icon.

**Rely on the documented SVG spec in the catalogue.** Rejected on this
repository's own evidence. The spec table has been in `catalogue.md` since the
set was created, and four icons still entered `svg/` by hand without going
through the generator that applies it. A paragraph does not hold a rule; a
failing build does.

---

## Consequences

- **Prevented by:** `npm run check:icons` (`scripts/check-icons.mjs`), in
  `npm run check`. It reads every SVG on disk and fails on any colour literal,
  on colour smuggled into a `style` attribute, and on any `stroke-width` other
  than `1`. Verified by planting each defect and confirming a failure before
  trusting the pass.
- Icons remain recolourable by CSS `color` on any surface, in either mode, with
  no per-mode icon assets.
- A design that genuinely needs two colours is a signal to build a component,
  and that conversation happens before the asset lands.
