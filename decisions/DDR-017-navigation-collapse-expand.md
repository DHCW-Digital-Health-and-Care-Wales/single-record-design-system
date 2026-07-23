# DDR-017 — Navigation sidebar: collapse/expand behaviour

**Date:** 2026-07-23
**Status:** Accepted (one open question — see below)
**Decided by:** Design lead

---

## Context

`Navigation/Sidebar` (`packages/web/src/navigation/navigation.css`) already implements an
expanded and a `.sr-nav--collapsed` state via an explicit toggle button
(`.sr-nav__collapse`). What hadn't been decided was the **behaviour** around that
state: what a screen defaults to, whether a user's choice sticks as they move around,
and whether the toggle should ever trigger on anything other than a deliberate click.

---

## Decision

### 1. Default state is per screen type, not global

| Screen type | Default | Why |
|---|---|---|
| Data-heavy views (Casenotes list, UEC dashboard, WCP PAS record tables) | Collapsed | User has already navigated here and needs grid width over wayfinding. |
| Landing / orientation screens (app home, first entry into a module) | Expanded | User is still deciding where to go; nav is primary content. |
| Task-in-progress screens (mid-form, mid-referral, modal-heavy flows) | Collapsed | Same logic as data-heavy — user is committed to a task, nav is secondary. |

This lookup lives at the **routing/screen level** (screen declares its type →
default state), not hardcoded into the sidebar component — a new screen sets its
type without the `Navigation` component needing to know about it.

### 2. A manual toggle persists for the session

If a user clicks the pin/unpin toggle, that choice is respected as they move between
screens in the same session, rather than resetting to the per-screen default on every
navigation.

**Open question — not yet decided:** should the pinned state persist per-user across
sessions (`localStorage` / profile setting), or reset to the screen-type default on
each new login? This needs a decision before build. Flagging for stakeholder or a
quick user check — do not implement session-only persistence as if it were final.

### 3. Mechanism is an explicit pin/unpin click — never hover-to-expand

Hover-to-expand was considered and rejected:

- **No keyboard equivalent.** Hover-triggered UI gives keyboard/switch users nothing;
  making focus trigger the same behaviour causes unpredictable expansion as focus moves
  through nearby content, risking overlap with other elements (WCAG 2.4.11, focus not
  obscured).
- **Unreliable on shared clinical devices.** Mouse-proximity triggers depend on
  incidental cursor position on shared terminal/trolley hardware; touch input has no
  true hover state at all.
- **Undermines the collapsed-by-default decision.** Hovering near the edge would keep
  popping the sidebar open, losing the screen real estate the collapse was meant to
  preserve.

The sidebar's existing `.sr-nav__collapse` button is the correct mechanism: a
deliberate, keyboard-accessible click toggles expanded/collapsed. **No hover-expand or
hover-peek behaviour should be implemented at all** — this decision is the reference if
that idea resurfaces.

---

## Why not …

**Hover-to-expand (or hover-peek over a collapsed rail).** Rejected — see point 3 above.
No keyboard equivalent, unreliable on shared devices, and self-defeating against the
collapsed default.

**A single global default regardless of screen type.** Rejected — collapsing on landing
screens would remove the wayfinding the user still needs; expanding on data-heavy or
task screens would cost grid width the collapse decision exists to protect.

---

## Reference basis

GDS has no directly comparable pattern — GDS is single-column, linear journeys, no
collapsible sidebar. NHS.UK service navigation and general enterprise data-product
convention (a closer match to Single Record's data density) converge on click-to-pin
over hover-triggered expansion; cited here instead of GDS for this component.

---

## Consequences

- The sidebar needs persistent pin/unpin state per user, session minimum, pending the
  open question below.
- Per-screen default logic belongs at the routing/screen level (screen type → default
  state lookup), not inside the `Navigation` component — new screens declare their type
  without touching the component.
- No hover-expand or hover-peek behaviour should be implemented — treat this DDR as the
  answer if that idea resurfaces later.

---

## Still open

- **Persistence scope:** session vs. per-user profile setting. Needs a decision before
  build.
- **Screens outside the three categories** (e.g. print/handoff views) may need a
  distinct default — not yet assessed.

---

## References

- `packages/web/src/navigation/navigation.css` — existing `.sr-nav--collapsed` +
  `.sr-nav__collapse` toggle implementation
- Tracked for follow-up: a `components/navigation/guidelines.md` single-source page
  (When to use / collapse defaults / accessibility) once the open question above is
  resolved
