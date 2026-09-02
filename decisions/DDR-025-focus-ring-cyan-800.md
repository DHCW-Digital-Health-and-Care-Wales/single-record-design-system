# DDR-025 — Focus Ring: Cyan/800 (both modes)

**Date:** 2026-09-02
**Status:** Accepted
**Decided by:** Design lead
**Amends:** DDR-006 (Focus Ring: Cyan/700, both modes)
**Related:** DDR-002 (WCAG 2.2 AA mandatory), DDR-011 (dark mode as a token axis)

---

## Context

DDR-006 moved the focus ring from `Focus Yellow` `#FFEB3B` to `Cyan/700`
`#12A3C9` in both modes. Its reasoning still holds: the yellow clashed with the
warning yellow, jarred against the cool palette, and looked wrong on navy in
dark mode. Nothing here revisits that.

What DDR-006 did not do was compute the ring against the surfaces it is drawn
on. That was checked for the first time when `scripts/check-contrast.mjs` was
added, and Cyan/700 falls short:

| Ring on | Ratio | SC 1.4.11 needs |
|---|---|---|
| White card | 2.95:1 | 3:1 |
| Page background `Blue/50` `#F4F5F8` | 2.71:1 | 3:1 |

A focus indicator is covered by SC 1.4.11 Non-text Contrast. The card case
misses by 0.05 and the page case by more.

This is a **different pair** from the `#12A3C9` finding already on file, which
is white text *on* a cyan fill in the MAUI app at 2.95:1. Same hex, coincidentally
near-identical ratio, opposite direction. Both are real; only this one is a
focus ring.

## Decision

**`Border/Focus` becomes `Cyan/800` `#0D8BAD` in both light and dark modes.**

| Token | DDR-006 | This DDR |
|---|---|---|
| `Border/Focus` (light) | `Cyan/700` `#12A3C9` | **`Cyan/800` `#0D8BAD`** |
| `Border/Focus` (dark) | `Cyan/700` `#12A3C9` | **`Cyan/800` `#0D8BAD`** |

The application pattern from DDR-006 is unchanged: a 3px ring outside the
element's stroke, 2px clearance, on the interactive element itself rather than
a wrapper that includes a label.

### Why 800 and not a darker stop

The obvious move is to darken until light mode clears, and in light mode
800, 850 and 900 all pass. **Dark mode inverts the problem** — its surfaces are
navy, so a darker ring loses contrast rather than gaining it:

| Stop | Light: white / page | Dark: `navy.900` / `blue.900` | Verdict |
|---|---|---|---|
| `Cyan/700` (was) | 2.95 / 2.71 | 4.86 / 4.46 | fails light |
| **`Cyan/800`** | **3.95 / 3.63** | **3.63 / 3.33** | **passes both** |
| `Cyan/850` | 4.87 / 4.47 | 2.95 / 2.70 | fails dark |
| `Cyan/900` | 6.16 / 5.65 | 2.29 / 2.10 | fails dark |

Cyan/800 is the only stop clearing 3:1 in both. Cyan/850 was proposed first,
on light-mode numbers alone, and would have moved the same failure into dark
mode at 2.95:1 — the exact ratio it was meant to fix.

Cyan/800 is also the smallest visual change available, being the adjacent stop
to the current value, so the ring stays recognisably the same colour.

### Why not record an exception instead

An exception was considered, since the light-card case misses by only 0.05.
It was rejected:

- **A focus ring has no backstop.** The accepted warning-role exception holds
  because the warning colour is a fill that always sits beside a text label, so
  nothing rests on colour alone. A focus ring is the only thing telling a
  keyboard user where they are.
- **DDR-002 makes AA mandatory**, and clinical staff at shared workstations
  operate these interfaces by keyboard routinely.
- **The fix costs a token value.** Exceptions are defensible when the fix costs
  something real.

## Consequences

- **Thirteen hardcoded rings had to be repointed first.** Eight components
  (`button`, `header`, `navigation`, `breadcrumbs`, `segmented-control`,
  `table`, `tags`, `bottom-nav`) wrote `var(--color-cyan-700)` — the raw
  primitive — rather than `var(--sr-color-border-focus)`. Changing the token
  alone would have moved some rings and not others, leaving the system with two
  focus colours. All now consume the semantic token, so the next change to this
  value is genuinely one line.
- **`color.border.focus` in `border.json` moves with it.** That token duplicates
  `sr.color.border.focus` and is kept in step by hand, pending the
  token-structure decision recorded in the 2026-08-06 checkpoint.
- **The Blazor CSS mirror needed refreshing**, and now has a gate
  (`npm run check:blazor-mirror`) because it is a manual copy that had already
  drifted.
- **`Cyan/700` remains in the palette.** It is still `brand.accent`, and it is
  still correct there — an accent stroke is not a focus indicator.
- **Figma needs the same change.** The `Border/Focus` variable in the Single
  Record collection still resolves to Cyan/700. Until it is updated, Figma and
  code disagree.

## Verification

`npm run check:contrast` asserts the ring against page background and section
cards **in both modes**, and fails the build if either drops below 3:1. The
gate was proven by planting the old value and confirming it was caught.
