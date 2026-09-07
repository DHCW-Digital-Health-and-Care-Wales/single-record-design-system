# DDR-027 — Icon sourcing tiers, and the rule against module icons

**Date:** 2026-09-04
**Status:** Accepted
**Decided by:** Design lead (icon catalogue remediation brief)
**Supersedes:** nothing. Extends DDR-003 (Lucide) and DDR-023 (1px stroke).

---

## Context

The icon catalogue was built early in the programme, before the forms, search
and mobile workstreams surfaced further requirements. A requirements review
produced a list of concepts wanting icons that mixed three quite different
things together:

- generic interface actions (play, send, expand)
- clinical concepts with agreed meaning (allergy, discharge, referral)
- **product module names** (Nursing, Patient Lists, Caseload Management,
  Clinic/Inpatient/Outpatient, Emergency)

Treating that list as one queue is how icon catalogues sprawl. Health board
systems accumulate hundreds of near-identical marks because every screen that
wants an identity gets a bespoke glyph, and no two teams pick the same one for
the same idea. There is no universal picture for a product's internal module
name, so any icon drawn for one is arbitrary — and arbitrary marks are the ones
that get redrawn per product.

---

## Decision

Icons fall into three tiers, with different sourcing rules.

| Tier | Definition | Sourcing rule |
|---|---|---|
| **A. UI and system** | Generic interface actions — play, send, expand | Direct Lucide, no modification |
| **B. Clinical semantic** | Domain concepts with agreed clinical meaning — allergy, discharge, referral | Lucide glyph with a Single Record semantic alias |
| **C. Feature and module identity** | Product screen or module names | **No bespoke icon.** Reuse a Tier A or B glyph, or use a text label. |

Tier C is the sprawl vector, and the rule exists to close it. A module that
structurally needs a nav icon reuses an existing one; a module that merely wants
an identity gets a text label.

### Tier C dispositions from this review

| Requirement | Disposition |
|---|---|
| Nursing | Text label, or reuse `people/clinician` for a role filter. Lucide has no nurse glyph, and `location/bed` means an inpatient bed, not a staff role. |
| Patient Lists | Text label, or `users-round` if a nav icon is required. A document-format glyph is not appropriate for a collection of people. |
| Caseload Management | Text label. |
| Clinic, Inpatient, Outpatient | Text label. These are setting types. If they appear as list filters needing icons, raise as a governed addition rather than assuming. |
| Emergency | Text label, or reuse `location/ambulance` where a visual marker is required. |
| Letters (DALs) | Reuse `comms/letter`. |
| Referrals (as a module) | Reuse `clinical/referral`. |
| Watchlist (as a destination) | Reuse `action/watchlist`. |

### The boundary between an icon and a component

Tier A/B/C answers *should this concept get a mark*. This answers *is the mark
an icon at all* — and it is the question that produced the `warnings/` confusion.

**An icon is a single-colour outline.** One `currentColor` path set, 24 × 24,
1px stroke, recolourable by the consumer, identical in light and dark mode. If
an artwork satisfies that, it belongs in the icon set.

**Anything that needs a second colour, a fill that carries meaning, or internal
structure the consumer must not recolour is a component**, not an icon. Three
reliable signals, any one of which is decisive:

| Signal | Why it forces a component |
|---|---|
| More than one colour in the mark | `currentColor` can express exactly one. A second colour must be a token the component owns, or it will not follow dark mode. |
| The fill *is* the meaning | A filled disc is not a heavier outline; recolouring it changes what it says. That is behaviour, and behaviour lives in a component. |
| It has variants | `success` / `error` / `warning` is a prop. An icon set expresses that as three unrelated files with no shared contract. |

This is why the four `warnings/*` badges are the `StatusIndicator` component
(DDR-013) and not `status/*-solid` icons. They are two-tone by construction — a
`currentColor` disc with a knocked-out glyph in a second colour — and flattening
them to a single colour renders a solid disc with an invisible glyph.

**Health board and other bespoke marks** — coloured, multi-shape, or otherwise
outside the outline contract — take the same route. They are **not** icons, and
they must not be pushed into the icon set "so they are all in one place". A
coloured mark in `foundations/iconography/svg/` would fail `check:icons` on the
first build, which is the correct answer: the check is the boundary.

Route them by what they are:

| Kind of mark | Where it belongs |
|---|---|
| A health board's identity mark or crest | Brand assets, alongside the NHS Wales and DHCW marks — not the icon set. Ownership and usage rules sit with the brand team. |
| A coloured, multi-shape mark with variants (a status badge, a category chip) | A component with a variant prop, like `StatusIndicator` |
| A one-off illustration or empty-state graphic | An illustration asset, versioned with the product that uses it |
| The same concept, but expressible as one outline | An icon — take it through the generator like any other |

The single-colour rule is what makes 141 icons work as one system across web,
Blazor, MAUI and Delphi from one source file. Admitting one coloured exception
costs that, so the exception becomes a component instead.

### Custom icons

Permitted under the ISC licence, but only where **no Lucide equivalent exists**.
A custom icon must:

- be built on the 24 × 24 grid,
- carry a **1px stroke — DDR-023, not Lucide's shipped 2px**,
- match Lucide's optical style,
- use `currentColor` with no baked fills (DDR-028),
- be logged in the catalogue as custom with a recorded justification.

> The remediation brief specified 2px for custom icons, describing Lucide's
> upstream stroke. DDR-023 overrides that globally for this design system and is
> mechanically enforced, so a 2px custom icon would fail the build and would
> also look wrong beside the other 146. 1px is the rule.

### Version pinning

Lucide is consumed from `lucide-static`, **pinned exactly** in the root
`package.json` and carried in the lock file.

Previously the generator fetched
`raw.githubusercontent.com/lucide-icons/lucide/main/icons/{name}.svg`, so the
catalogue was sourced from whatever `main` held on the day it ran. That is not a
version, and it is not reproducible. It also actively misleads: `trash-2`,
`history` and `circle-help` are all present in 1.41.0 and all 404 on `main`, so
checking a name against `main` reports working icons as missing. Bump the pin
deliberately and review the resulting SVG diff.

---

## Why not …

**Give every module its own icon.** Rejected: this is the failure mode being
remediated. It produces a catalogue nobody can hold in their head, in which two
teams pick different marks for the same concept.

**Ban reuse and force text labels everywhere for Tier C.** Rejected: some
navigation structures need a mark in the slot. Reuse is bounded — it points at
an existing agreed meaning rather than inventing a new one.

**Track Lucide `main` to get glyphs sooner.** Rejected: it makes the icon set
unreproducible and lets upstream silently redraw artwork under a shipped
product. Between the last `main` fetch and 1.41.0, twelve glyphs changed, one of
them materially (`barcode` lost its scanner frame).

---

## Consequences

- A new icon request must state its tier before it is accepted.
- Tier C requests are answered with a reuse or a label, not a new glyph.
- `npm run check:icons` enforces provenance: every SVG on disk must have a
  generator entry, so an icon cannot enter the set unrecorded.
- Upgrading Lucide is a deliberate, reviewable change rather than a side effect
  of the next build.
