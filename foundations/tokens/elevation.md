# Elevation Tokens

Elevation communicates layer hierarchy through shadow. SR uses a minimal, functional set — three tokens, each with a named job. Shadow colour derives from `navy-900` (#1B294A) rather than pure black, keeping it on-brand and subdued on clinical displays.

---

## Philosophy

Neither GDS nor NHS England define an elevation system. Both use shadow in exactly one place: a directional bottom-shadow on the primary button as a press affordance — not a depth metaphor.

SR extends this deliberately and sparingly:

- Borders and `sr.color.surface.*` tokens handle structural hierarchy on flat surfaces.
- Shadow is reserved for elements that genuinely float above the page (overlays, drawers, dropdowns) and for the standard NHS button affordance.
- Do not use shadow decoratively. If in doubt, use a border instead.

---

## Tokens

| Token | CSS `box-shadow` | Used for |
|---|---|---|
| `sr.elevation.button` | `0 2px 0 #1B294A` | Primary and outline button press affordance |
| `sr.elevation.raised` | `0 1px 4px rgba(27,41,74,0.12)` | Cards, panels — gentle lift from page |
| `sr.elevation.overlay` | `0 4px 16px rgba(27,41,74,0.18)` | Modals, drawers, dropdowns, tooltips |

No `elevation.0` token is needed — the absence of shadow is expressed by not applying any shadow, or by `box-shadow: none` explicitly in a reset context.

### Button shadow by variant

| Button variant | Shadow |
|---|---|
| Primary | `sr.elevation.button` — `0 2px 0 #1B294A` |
| Outline / secondary | `sr.elevation.button` — `0 2px 0 #1B294A` |
| Ghost | `none` — ghost buttons communicate affordance through border and colour only. Shadow would compete with the low-weight intent. |
| Warning / destructive | `sr.elevation.button` — `0 2px 0 #1B294A` |
| Disabled (any variant) | `none` — disabled state removes shadow to reinforce unavailability. |

---

## Usage Rules

- Use `sr.elevation.raised` only when a border alone is insufficient to separate a surface — for example, a card on a similarly-coloured background.
- Use `sr.elevation.overlay` for all floating layers: modals, side drawers, dropdown menus, and tooltips.
- Do not stack multiple elevations. An element should use one token or none.
- Do not rely on shadow alone to indicate interactivity — pair with a border or background colour change.
- Focus rings are not managed through elevation. See `sr.color.border.focus` and `/accessibility/focus-management.md`.

---

## What is not in scope

A numeric elevation scale (`elevation.1` through `elevation.4`) has been intentionally removed. A decorative scale creates pressure to apply shadows for visual interest rather than function. The three functional tokens cover all current SR use cases. If a new use case arises, add a token with a named role via DDR.

---

## Change History

| Date | Change | Changed by |
|---|---|---|
| Mar 2026 | Replaced generic numeric scale with three-token functional system. Shadow colour shifted from pure black to navy-900 for brand alignment. | SR DS |
