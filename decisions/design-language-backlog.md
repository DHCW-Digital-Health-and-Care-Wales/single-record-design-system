# Design Language Updates — Backlog

Running log of design language changes to be applied in batches. Each item records what changed, what it affects, and current status.

Add new items to **Pending**. Move to **In Progress** when a batch is being applied. Move to **Done** with a date when confirmed in Figma and any relevant components are updated.

---

## Pending

| # | Change | Affects | Notes |
|---|---|---|---|
| DL-002 | Create semantic disabled tokens: `Interactive/Disabled`, `Text/Disabled` | All components with disabled state | Defer until 2–3 components share the same disabled pattern. Currently using primitives `Blue/400` (surfaces) and `Navy/300` (text). |
| DL-003 | Resolve Interactive Primary colour scale for hover/active/pressed | Button (Primary), any future interactive controls | Recommendation: shift scale — Blue/700 default · Blue/800 hover · Blue/900 active/pressed. Confirm with design lead before applying. |

---

## In Progress

| # | Change | Affects | Notes |
|---|---|---|---|
| DL-001 | Heading XS Desktop + Mobile font weight → Medium (500) | Button (Large), any component using Heading XS typography | Variable updated in Figma. Button Large labels updated 2026-05-29. Audit other components for Heading XS usage before closing. |

---

## Done

_Nothing yet._

---

## How to use this file

- **Batching:** group related changes into a single session. Update multiple components at once rather than one at a time.
- **DDR threshold:** if a change affects a core token, a pattern, or an architectural decision, write a full DDR in `/decisions/` before applying.
- **Component audit:** when closing an item, list every component that was checked (not just the ones that changed).
