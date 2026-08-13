# DDR-023 — Icon stroke weight is 1px, not Lucide's 2px

**Date:** 2026-08-13
**Status:** Accepted
**Decided by:** Design lead
**Supersedes:** DDR-003, stroke weight only (the library choice, licence and 24px grid all stand)
**Related:** DDR-006 (focus ring — a different 2px, unaffected), DDR-002 (WCAG 2.2 AA)

---

## Context

DDR-003 adopted Lucide and took its shipped defaults wholesale: 24×24 grid,
`currentColor`, round caps and joins, and **2px stroke**. The 2px was never
evaluated on its own — it came with the library.

In use it reads too heavy. On the design-system website, where icons appear
next to Roboto at 16–19px, a 2px stroke is visually bolder than the text it
sits beside, and a row of icons reads as a row of dark marks rather than as
labels. The Figma library had already moved: an audit on 2026-08-13 found
**121 of 125 icon components drawn at 1px**, all on the 24×24 grid. The
divergence had existed for some time and nothing recorded it, so Figma and
code had been drifting apart silently.

Four Figma components sit outside that count, at 1.8, 1.5046, 1.5 and 0.75.
They were initially assumed to be artefacts to normalise. They are not: all four
are in `Icon/warnings/*`, and inspecting them shows a different species of
artwork — **filled state badges**, not stroke outlines. `warnings/error` is a
solid red disc with a white exclamation mark; `warnings/determinate` is a solid
disc with a dash, the indeterminate state of a selection control. Their stroke
weights are incidental to artwork whose meaning is carried by fill.

Normalising them would have damaged four deliberate designs to satisfy a rule
that does not apply to them. Confirmed with the design lead before any change
was made.

## Decision

**Icon stroke weight is `1` on the 24×24 grid, everywhere.**

This is a single global value. It applies to the source SVGs in
`foundations/iconography/svg/`, the generated `icons.js` and `sprite.svg`, the
MAUI `Icons.xaml` geometry and its documented `StrokeThickness`, the hand-inlined
chrome icons on the design-system website, and the Figma library.

**This rule covers stroke-drawn outline icons only.** Filled artwork —
`Icon/warnings/*` in Figma today — is a different species and is not governed
by it.

**Do not vary the stroke per icon size.** The previous catalogue note
("override to 1.75 at xs/sm via CSS") is withdrawn. A per-size stroke means two
icons of different sizes on one screen are drawn in different weights, which is
the inconsistency the icon set exists to prevent.

### What this deliberately does not change

- **The focus ring stays 2px** (DDR-006). It is not an icon, it is a
  visibility affordance with its own contrast requirement.
- **Border and divider thicknesses in `Styles.xaml` stay as they are.** They
  share the token name shape but are unrelated.
- **Lucide remains the source library** under ISC. Overriding a presentation
  attribute is not a fork: the geometry is untouched, and `fetch-icons.js` now
  emits `stroke-width="1"` so a future re-fetch cannot silently restore 2.

## Consequences

- **Every icon in every product changes weight** the next time a release is
  taken. This is a visual change with no API change: no markup, class name,
  token name or component prop moves. Nothing breaks; things look lighter.
- **16px icons go noticeably lighter.** A 1px stroke on a 24-unit viewBox
  rendered at 16px resolves to ~0.67 device pixels, which a standard-density
  screen antialiases into a pale line. It is legible beside a text label and a
  poor choice for an icon-only control. `components/icons/guidelines.md` now
  says to prefer 20px or 24px for any icon carrying meaning alone.

  This is the real cost of the decision and it is accepted knowingly. If a
  16px icon-only control turns out to fail WCAG 2.2 1.4.11 (3:1 non-text
  contrast) in testing, the fix is to **size the control up**, not to
  reintroduce a per-size stroke.
- **MAUI needs confirming on a device.** In MAUI, `StrokeThickness` on a
  `Path` is a device-independent unit and does not necessarily scale with
  `Aspect="Uniform"` the way SVG `stroke-width` scales inside a viewBox. The
  documented example now says `StrokeThickness="1"`, which is right at a 24px
  render; whether a 16px `HeightRequest` needs a proportionally smaller value
  has not been verified here, because MAUI cannot be run in this environment.
  Flagged in `docs/engineering/known-issues.md` for the first engineer with a
  device.
- **`Icon/warnings/*` is explicitly out of scope** and stays as drawn. It is a
  filled-badge group, not an outline group, and the 1px rule does not reach it.
  It also has **no counterpart in code** — the source SVGs have a `status` group
  of 9 outline icons and nothing filled — so any product needing a filled state
  badge today has no supported asset. Naming that gap is not the same as fixing
  it; it needs its own decision about whether filled badges belong in the icon
  set at all, or are a component concern.

## Alternatives considered

- **Keep 2px and change Figma back.** Rejected: the objection is aesthetic and
  the design lead's call to make, the Figma library had already moved, and 2px
  is what looked wrong on the website.
- **1.5px as a compromise.** Rejected: it lands on a half-pixel at 24px, which
  antialiases at every size rather than only at small ones — the worst of both.
- **Per-size stroke (1px at md/lg, 1.5px at xs/sm).** Rejected above: it breaks
  the visual consistency that is the point of a single icon set, and it cannot
  be expressed in the MAUI or sprite consumption paths without duplicating
  every icon.
