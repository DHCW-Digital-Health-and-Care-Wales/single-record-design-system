# DDR-026 — Dark mode is a token-semantics problem, not a palette problem

**Date:** 2026-09-03
**Status:** Accepted
**Decided by:** Design lead
**Related:** DDR-011 (dark mode as a token axis), DDR-025 (focus ring), DDR-002 (WCAG 2.2 AA)

---

## Context

Dark mode has been "provisional, on purpose" since the 2026-08-04c checkpoint:
the tokens built, but had never been reconciled against how components actually
use them. This is that reconciliation.

It was done by extracting the `(color, background-color)` pairs that component
stylesheets really produce — 15 of them — and computing every one in both modes,
rather than by looking at screens and judging. Six failed in dark mode:

| Pair | Light | Dark |
|---|---|---|
| `text-primary` on `info-blue-50` | 13.12 | **1.10** |
| `text-secondary` on `info-blue-50` | 5.79 | **1.25** |
| `interactive-primary-hover` on `surface-accent` | 11.90 | **1.35** |
| `interactive-primary` on `surface-accent` | 7.27 | **2.07** |
| `text-inverse` on `interactive-primary` | 8.04 | **2.26** |
| `text-inverse` on `interactive-destructive` | 5.06 | **2.85** |

None of these is a bad colour. Every value is defensible on its own. They fail
because of **which token a component reaches for**, and that is what this DDR
settles.

## The three causes

### 1. A token whose meaning flips, used where the surface does not

`text/inverse` means "text on a surface whose lightness is the opposite of the
current mode". It is white in light mode and near-black in dark, by design, and
that design is right for what it names.

A primary button is not that. It is a **saturated fill in both modes** —
Blue/800 in light, Info-Blue/600 in dark. Its label should be white in both. The
button asked for `text/inverse`, got near-black in dark mode, and rendered
near-black on mid-blue.

**The general shape:** a token defined *relative to the mode* cannot be used by a
component whose surface is *absolute*.

### 2. Interactive colour used as text on a tinted surface

`interactive/primary` is a **fill** colour. In dark mode it stays saturated
(Info-Blue/600) — correct for a button. But the current nav item and the table
row action use it as *text on `surface/accent`*, and in dark mode that surface is
also dark (Blue/900). Dark on dark: 2.07:1.

Light mode never exposed this, because there the accent surface is a pale tint
and any dark blue reads on it.

### 3. Three components reaching past the semantic layer

`select`, `table` and `segmented-control` used the raw primitive
`--color-info-blue-50` for a hover or header tint. A primitive has no dark value
— it is the same near-white in both modes — so in dark mode these became white
text on a near-white tint at 1.10:1.

This is the same failure as the thirteen hardcoded focus rings in DDR-025. A
component that bypasses the semantic layer opts out of dark mode without
saying so.

## Decision

**Three new semantic tokens, and three components repointed at the semantic
layer.** No primitive changes, and no change to any light-mode value that a user
would notice.

| Token | Light | Dark | For |
|---|---|---|---|
| `text/on-fill` | White | **White** | Text on a saturated interactive or status fill. Deliberately does not flip. |
| `interactive/on-accent` | Blue/800 | **Info-Blue/300** | Interactive text or icon sitting on `surface/accent`. |
| `interactive/on-accent-hover` | Blue/900 | **Info-Blue/200** | Its hover step — darker in light, lighter in dark. |

`text/on-fill` and `interactive/on-accent` take the same light-mode values the
components already had, so **light mode does not move**. They exist because dark
mode needs a different answer, and the old tokens had no way to give one.

`surface/small-cards` in dark mode changes from **Cyan/850 to Blue/900**. Cyan/850
cleared white text at 4.88:1, which is why it survived review, but it turned every
stat card saturated teal beneath a navy section card, and left the focus ring at
1.23:1 — a cyan ring on a cyan surface. Blue/900 gives white 13.18:1 and the ring
3.33:1.

Its 1.09:1 against the page background is deliberate: in light mode a white card
on Blue/50 is 1.05:1. **A card has never been delineated by its fill** — it is
delineated by border and elevation — so dark mode now matches light mode's own
logic rather than inventing a new one.

### Hover moves in opposite directions in the two modes

Worth stating because it looks like an inconsistency and is not.
`interactive/on-accent-hover` is *darker* than its rest state in light mode and
*lighter* in dark. Hover always moves **away from the surface**; which direction
that is depends on the mode.

## Consequences

- **Light mode is visually unchanged.** The only light-mode movement anywhere is
  the accent tint under three components shifting from `info-blue-50` `#eef5fc`
  to `surface/accent` `#ebf5fa`, which moves their contrast by 0.09 and 0.04.
- **Dark mode has no failing pair.** `npm run check:contrast` asserts 36 pairs
  across both modes; all pass, with one documented exception (the warning role,
  a fill that always carries a label).
- **`text/inverse` keeps its job** and its description now says what that job is,
  and what it is not for.
- **MAUI and Blazor inherit all of it.** Both are generated from these tokens,
  so `SrColorTextOnFill` and the rest appear in `Colors.xaml` and the Blazor
  mirror without separate work.
- **Figma needs the three new variables** and the `surface/small-cards` dark
  change. Figma and code disagree until that is done — the same outstanding sync
  as DDR-025's focus ring.

## Verification

Every pair above is asserted in `scripts/check-contrast.mjs` in **both** modes,
so the specific failures this DDR fixes cannot return silently. Confirmed in a
browser at both settings: dark-mode cards render navy rather than teal, button
labels are white, and the current nav item is legible on the accent surface.
