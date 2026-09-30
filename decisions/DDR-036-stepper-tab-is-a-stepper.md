# DDR-036 — The Stepper Tab is a stepper, not a Tabs variant

**Date:** 2026-09-29
**Author:** AI-assisted session, for the design lead
**Status:** Accepted — design lead, 2026-09-30
**Relates to:** DDR-030 (two-level tabs), `components/tabs/spec.md`, `components/progress-indicators/spec.md`

---

## Context

Figma's Progress indicators page has `Progress/Tab` (`1746:106`): a strip that
looks like tabs, with a green tick on stages that are done, a blue ring and 3px
underline on the current one, and a grey ring on the rest. The question raised
on 2026-09-29 was whether it belongs under Tabs as a variant, since it "checks
a tab page when completed".

The two look alike. They do different jobs:

| | Tabs (`817:7219`) | Progress/Tab (`1746:106`) |
|---|---|---|
| What choosing does | Switches which view is shown | Nothing, or goes back to a stage |
| Order | None — any tab, any time | Fixed; upcoming stages come later |
| State shown | Which one is selected | Done / current / upcoming (and errors) |
| Markup | `role="tablist"` › `role="tab"` › `role="tabpanel"` | `<ol>` › `<li aria-current="step">` |
| Height, padding | 40px, 0 16px | 44px, 12px |
| Track under the strip | None, by decision | 1px `Border/Default` under every stage |
| Icons | None — "a tab is a label, optionally with a count" | A 16px marker on every stage |

## Decision

**It stays in Progress indicators, as the compact layout of the Stepper.**
`Stepper layout="compact"` in React, `.sr-stepper--compact` in HTML. Tabs gains
no completion state and no marker.

## Why

1. **The semantics are a sequence, not a set of views.** A screen reader
   announces a tab as *"Triage, tab, 2 of 3, selected"*. That promises a panel
   and free movement between siblings. A stage that is not yet reachable cannot
   honestly be a tab; one that is disabled until earlier stages are done is the
   "disabled tab as a way of hiding content" the Tabs spec already rules out.
2. **"Done" is not a property of a view.** A ticked tab tells the user a
   *section* is finished — progress through a task. If the task is ordered,
   that is a stepper. If it is not, it is a task list (GDS). Neither is Tabs.
3. **Tabs has already refused decoration.** The spec keeps icons out and has
   no track line. Adding both for one case would make every tab strip ask
   "is this one tracking progress?".
4. **Nothing is lost.** The compact stepper renders at tab weight, so it can
   sit directly under a real tab bar without competing with it — which is the
   one thing the variant was for.

## If the product really does need tabs with a done state

That is a form split across tabs the user can visit in any order, with a
summary of which are complete. The honest answer is Tabs for navigation plus a
status beside the label (a tag, or visually hidden text in the tab's name).
Raise it as its own decision with a real screen; do not extend this one.

## Consequences

- `Progress/Tab` in Figma was renamed **`Progress/Stepper Compact`** on
  2026-09-30, with a description that says it is not Tabs.
- A tab never carries a tick. If one appears in a design, it is a stepper.
- The compact marker has no number (it would not fit at 16px), so the step
  number is not shown; the label and the visually hidden state carry it.

## References

- `components/tabs/spec.md` — Purpose, Anatomy, Do / Don't
- `components/progress-indicators/spec.md` — Stepper Tab
- WAI-ARIA Authoring Practices, Tabs pattern
- GDS Design System, Task list pattern
