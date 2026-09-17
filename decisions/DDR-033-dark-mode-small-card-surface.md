# DDR-033 — The dark-mode small-card surface returns to Cyan/850, and becomes text-only

**Status:** Accepted
**Date:** 2026-09-16
**Supersedes:** the `surface/small-cards` paragraph of DDR-026 (the rest of DDR-026 stands)
**Affects:** `foundations/tokens/semantic/color.dark.json`, `packages/web/src/stat-card/`, and the four stylesheets that had drifted onto this token

---

## Context

`Surface/Small Cards` is bound in Figma to every one of the ten Stat Card
variants, and in Dark mode it resolves to **Cyan/850 `#0C7B99`**. That teal is a
deliberate design choice: it gives a stat tile its own plane against the navy
section card behind it, so a row of numbers reads as a set of cards rather than
as text printed on the section.

DDR-026 re-pointed the dark value to **Blue/900 `#1e3050`** and gave two reasons.
Only one of them was a reason.

| DDR-026's reason | Verdict now |
|---|---|
| "turned every stat card saturated teal under a navy section card" | **Not a defect.** That is the design, and it is what the Figma file has always said. An aesthetic preference was written down as though it were a finding, and it overrode the design lead. |
| The focus ring is 1.23:1 on it — a cyan ring on a cyan surface | **Real.** SC 1.4.11 wants 3:1, and a focus ring is the one thing a keyboard user cannot do without. |

Blue/900 is the same value as `surface/section-cards`, so the re-point took the
small card's contrast against the section behind it from 2.70:1 to **1.00:1** —
the distinction was not softened, it was deleted.

Two further things were true and unrecorded:

- **The web stat card never consumed this token.** `stat-card.css` was written
  against `surface/section-cards`. Because the two tokens held the same value,
  nothing looked wrong, and the Figma binding had no effect in code either way.
- **Four stylesheets had drifted onto `surface/small-cards`** — the checkbox and
  radio card variants, the search suggestions menu, and the footer. Figma binds
  the unchecked radio and checkbox cards to *no fill at all*; that usage was a
  code-side invention nobody decided on.

## The constraint that actually governs this

Cyan/850 sits in the middle of the luminance range, which means almost nothing
reads on it. Measured against the dark token set:

| On Cyan/850 | Ratio | Needs | |
|---|---|---|---|
| `text/primary` (white) | 4.87:1 | 4.5 | ok, with no headroom |
| `text/secondary` `#d8dde0` | 3.56:1 | 4.5 | fails |
| `text/disabled` | 1.90:1 | 4.5 | fails |
| `border/focus` | 1.23:1 | 3 | fails |
| `border/strong` (control outlines) | 1.90:1 | 3 | fails |
| `border/default` | 1.05:1 | 3 | fails |
| `interactive/primary` (checked control fill) | 1.31:1 | 3 | fails |
| `interactive/link` | 3.10:1 | 4.5 | fails |

None of these can be fixed by choosing a different cyan stop. Darker stops lose
the distinction from the section card; lighter ones lose white text. There is
also nothing dimmer than white that clears 4.5:1 — `#f0f4f5` is already 4.40:1 —
so a secondary line cannot stay secondary *by colour* on this surface.

## Decision

**`surface/small-cards` returns to Cyan/850 in dark mode, and is redefined as a
text-only surface.**

- A component may use it if it puts plain text on it and nothing else.
- A component with controls, borders, links or buttons uses
  `surface/section-cards`.

Consequences in code:

1. **The stat card consumes `surface/small-cards`**, matching its Figma binding.
   This is the only visible change in the whole pass.
2. **Its secondary lines go white in dark mode**, via `text/on-fill` — which
   already exists from DDR-026 and is white in both modes precisely for
   saturated fills. Hierarchy is carried by size instead: 24px value, 14px
   label, 12px support. That was always the stronger signal.
3. **Checkbox cards, radio cards, the search menu and the footer move to
   `surface/section-cards`.** At the moment of the change both tokens held the
   same value, so this moved nothing on screen — it only stops them inheriting
   the teal.

### What was considered and not done

- **A `border/focus-on-fill` token** (white ring, 4.87:1 on the teal). It would
  work, but nothing focusable is on this surface any more, and the repo does not
  create tokens ahead of a documented need. If a focusable element ever belongs
  on a saturated surface, this is the shape of the answer.
- **Requiring 3:1 between the small card and the section card.** Tempting and
  wrong: SC 1.4.11 covers non-text content that carries *meaning*, and a card
  surface does not — the card is delineated by its border and its elevation.
  Light mode has always been a white card on a white card. The teal exists to
  give dark mode the figure/ground reading that light mode gets free from the
  page tint, not to satisfy a ratio.
- **Leaving Blue/900 and updating Figma to match.** That is the tidy option and
  it throws away a real design intent to avoid a solvable problem.

## Enforcement

`npm run check:contrast` now fails if any stylesheet outside the allowed set
references `--sr-color-surface-small-cards`. The rule here is a usage rule
rather than a ratio, so a pair-check cannot express it.

A paragraph would not have held this. The token was re-pointed once already on
aesthetic grounds, and four stylesheets drifted onto it without anyone deciding
they should. Verified by planting the defect — pointing the footer back at
`surface/small-cards` — and confirming a non-zero exit.

Three pair assertions were added alongside it: the label and value on the
surface, the supporting line on it in dark, and the existing focus-ring pair
scoped to light (in dark it is 1.23:1, which is exactly the situation the usage
gate now makes impossible rather than merely unpleasant).

## Consequences

- **Light mode does not move.** Both tokens are White there.
- **Dark mode:** stat cards are teal with white text. Nothing else changes.
- **Figma and code agree again** on `Surface/Small Cards` for the first time
  since DDR-026.
- **MAUI and Blazor inherit it,** both being generated from these tokens. The
  MAUI notes that flagged `#0c7b99` as "almost certainly not intended" are
  wrong and should be corrected when that package is next touched.
- **`text/on-fill` earns a second consumer,** which is the first evidence that
  DDR-026 was right to introduce it.

## Related

- DDR-026 — dark-mode token semantics; this supersedes its `surface/small-cards` paragraph only
- DDR-025 — the focus ring; the 1.23:1 figure originates there
- DDR-031 — the Stat Card component
