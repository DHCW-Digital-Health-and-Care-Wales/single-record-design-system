# DDR-031: Stat card is a component, and its five `Type` variants are three layouts

**Date:** 2026-09-11
**Author:** Design lead (with AI-assisted session)
**Status:** Accepted
**Supersedes:** N/A

---

## Context

The Stat Card set (`431:11996`) was drawn from product use rather than designed
as a system component, and it was never added to the DS website. Before adding
it, two questions had to be answered: is it a component or a pattern, and is its
variant set the right shape for a library other people will build from?

The set ships **10 variants**: `Type` × `Border`.

| `Type` | What it draws |
|---|---|
| `Title Top` | label, value |
| `Title_Hint` | label, value, hint line |
| `Trend` | label, value, delta + period |
| `Count Top` | value, label |
| `Single line` | value and label on one row, no icon |

`Border` is `Shown` / `Hidden`, and it does not draw a border: it draws a 4px
navy bar down the left edge.

There is also a shipped implementation that the Figma set does not know about.
`products/case-note-tracking/prototype` has a `.stat-card` with
`--warning` and `--critical` modifiers that recolour both the left bar and the
value. So the bar is decoration in Figma and a status signal in the product.

---

## Decision

**1. Stat card is a component.** A dashboard built from a row of them is a
pattern, and belongs under `/patterns` when it is written. The card has a fixed
anatomy, no composition, and one job.

**2. The card is not interactive.** No role, no handler, no hover, no focus. A
number that opens something takes a Link beneath it or is rebuilt as a Button
tile.

**3. Five `Type` values become three layouts.**

| Layout | Absorbs |
|---|---|
| Stacked *(default)* | `Title Top`, `Title_Hint`, `Trend` |
| Value first | `Count Top` |
| Inline | `Single line` |

`Title Top`, `Title_Hint` and `Trend` are **one layout with nothing, with a
supporting line, and with a supporting line carrying a delta**. Whether there is
a third line is a content decision, not a type of card.

**4. `Border` is renamed `Accent`,** and gains meaning: `None` / `Primary` /
`Warning` / `Critical`. It is a left bar, not a border; calling it `Border`
collides with the `Border/*` colour tokens and with every other component in the
system, where "border" means a 1px outline.

**5. The accent bar is emphasis, and may only reinforce something the supporting
line already says in words.** An amber bar and an amber number, with no text
saying what is wrong, is meaning carried in colour alone — WCAG 2.2 SC 1.4.1.
The prototype passes this today because its notes read "Pending Receipt" and
"Requires attention"; the rule makes that a requirement rather than a
coincidence.

---

## Options Considered

### Option A: Ship the 10 variants as drawn
- **Pros:** No migration. Matches what the designer already uses.
- **Cons:** Three different naming axes inside one property — `Title Top` and
  `Count Top` name which element is on top, `Trend` names the content, `Single
  line` names the density. A person reading the picker cannot predict what a
  fifth value would be called. The set is also incomplete in a way nobody can
  see: there is no value-first card with a trend and no value-first card with a
  hint, and nothing says whether those are forbidden or just undrawn.

### Option B: Fully orthogonal properties
`Layout` × `Order` × `Supporting` × `Accent` × `Show icon`.
- **Pros:** Every combination expressible, nothing implied.
- **Cons:** 48 variants in a Figma set that currently has 10, most of them never
  used. Figma variant sets do not survive that, and neither does the picker.

### Option C (chosen): three layouts, supporting line as content
- **Pros:** Covers all 10 existing variants, plus the value-first-with-a-trend
  case the set is missing, with three values instead of five. The naming is on
  one axis — how the card is arranged. The supporting line stops being a variant
  and becomes what it is: text you either pass or do not.
- **Cons:** Renaming `Type` and `Border` detaches live instances in the
  designer's own files.

---

## Rationale

The test for a variant is whether a designer can predict what the next value
would be called. On `Type` as drawn they cannot, because the five names answer
three different questions. Reducing to *how is this card arranged* leaves one
question and three answers, and moves the other two questions to where they
belong: the supporting line is content, and the icon is a boolean.

Option B is correct and unusable. The combinatorial set is the right mental
model and the wrong artefact — it is why the code takes orthogonal props while
the Figma set takes three enumerated layouts. That asymmetry is deliberate:
code composes cheaply and Figma does not.

On the accent bar, the two surfaces genuinely disagreed and the disagreement had
to be resolved rather than averaged. Making it *emphasis that may reinforce
words* keeps the product's existing screens valid, keeps the Figma set's single
navy bar valid as the default, and gives a rule that does not depend on which
file someone opened first.

---

## Consequences

- `components/stat-card/{spec,guidelines}.md`, `packages/web/src/stat-card/`,
  `packages/react/src/stat-card/` and a DS website page ship with this decision.
- **The Figma set is not restructured by this DDR.** Renaming `Type` and
  `Border` detaches every instance already placed in product files, so it needs
  a deliberate pass with the designs open, not a drive-by rename. Until then the
  set and the code differ, and `spec.md` says so under Known gaps — a documented
  difference is workable; an undocumented one is not.
- The prototype's `.stat-card` is now a local fork of a system component. It
  should move to `.sr-stat-card` when that prototype is next touched.
- A "Dashboard summary" pattern, when written, composes this component and does
  not redefine it.
- No new tokens. The component uses `Surface/Section Cards`, `Interactive/
  Primary`, `Text/Primary`, `Text/Secondary`, `status/success`,
  `status/warning`, `status/critical`, `--radius-md` and `--elevation-raised`.

---

## References

- WCAG 2.2 SC 1.4.1 Use of Colour; SC 1.4.3 Contrast (Minimum)
- DDR-005 (type scale) — why the delta is not bolded
- DDR-021 (MAUI ships tokens and styles, not a parallel component library)
- Figma: Stat Card `431:11996`, page `1517:15118`
- `products/case-note-tracking/prototype/src/app.css` — the shipped fork
