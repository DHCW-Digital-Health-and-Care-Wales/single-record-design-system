# DDR-035: A dark-safe error red, and the error summary is a component

**Date:** 2026-09-24
**Author:** Design lead (with AI-assisted session)
**Status:** Accepted
**Amends:** DDR-032 (error summary classification), DDR-034 (`status.error` naming)

---

## Context

Three separate pieces of work hit the same wall: the destructive link, the
notification banner, and the error summary's border. Each was recorded as its
own workaround or open finding. They were one missing token.

**The problem is bigger than those three.** `status.error` is Red/700 in both
modes, which is correct on `status.error-surface` — that surface stays light in
dark mode, so the dark red is what reads on it. But it was also being used for
**field error text and invalid control borders**, which sit on the app's own
surfaces, and those flip with the mode.

Measured against the dark page (`#1b294a`) and a dark card (`#1e3050`):

| | Dark page | Dark card |
|---|---|---|
| `status.error` (Red/700) | **2.14:1** | **1.97:1** |

Every inline field error in the system — Input, Select, Search, Date input,
Date picker, Time select, Checkbox — was failing in dark mode, along with every
invalid control border. No gate caught it because no pair asserted it.

---

## Decision

### 1. Add `status.error-on-page`

| | Light | Dark |
|---|---|---|
| `status.error` | Red/700 | Red/700 | for use **on `status.error-surface`** — a banner, a tag, a pill |
| **`status.error-on-page`** | **Red/700** | **Red/300** | for use **on the app's own surfaces** — the page, a card, a control |

The whole red ramp was measured rather than picked:

| Stop | Dark page | Dark card | Light page | Light card |
|---|---|---|---|---|
| Red/200 | 8.39 | 7.70 | 1.57 | 1.71 |
| **Red/300** | **6.07** | **5.57** | 2.17 | 2.37 |
| Red/400 | 4.31 | 3.95 | 3.06 | 3.33 |
| Red/700 | 2.14 | 1.97 | **6.15** | **6.70** |

**Red/400 is the one to be careful about.** It looks like the obvious answer and
it misses AA text on both dark surfaces — 4.31 and 3.95 against the 4.5 needed.
Red/300 clears both comfortably. An earlier hand-rolled
`[data-theme="dark"]` override in `error-summary.css` had used Red/400 for a
3:1 border, which was fine for a border and would have been wrong the moment
anyone reused it for text.

**Why not make `status.error` itself mode-aware?** Because it would break the
symmetry of the status family — `status.info`, `status.success` and
`status.warning` are all "the colour for use with the matching `-surface`", and
all mode-stable for the same reason. Splitting the role is honest; making one of
four behave differently is a trap.

### 2. The destructive link moves onto it

`interactive/destructive` is a **fill** colour — white sits on it — and was
2.84:1 as text on the dark page. That open finding is closed: a destructive
*link* is red text on the app's surface, which is what the new token is for.

`check:contrast` now has **zero open findings**.

### 3. The error summary is a component, not a pattern

DDR-032 called it a pattern because it composes Link, the field-message anatomy
and focus management. By that test the modal (Button + Icon) and the
notification banner (Icon + Button) are patterns, and both are components.

What actually separates them: **it has one fixed anatomy, it is instantiated on
its own, and its behaviour must be identical everywhere or it is wrong.** A
component guarantees that. A pattern is a shape you reassemble, and a
reassembled error summary is one that quietly drops the focus management — the
part that makes it work at all.

It moves to `components/error-summary/` and onto the Components nav. The
*usage* guidance — when to validate, how the two layers work together — stays a
pattern, in `patterns/forms/form-validation.md`.

---

## Consequences

- **34 declarations across 11 stylesheets** moved from `status.error` to
  `status.error-on-page`: the six field components' error text and invalid
  borders, the error summary, the patient banner's alert marks, the stat card's
  critical accent, and the status indicator.
- Tint-backed uses stay on `status.error`: the notification banner, tags, and
  the pills that sit on `status.error-surface`.
- `error-summary.css` loses its hand-rolled `[data-theme="dark"]` override.
- Four new assertions in `check:contrast` — error text and control borders, on
  the page and on a card — in **both** modes. Verified by re-pointing the dark
  value at Red/700 and confirming all four fail at 2.14:1 / 1.97:1.

## References

- DDR-032 — the original classification
- DDR-034 — `status.critical` → `status.error`
- `components/error-summary/guidelines.md`
