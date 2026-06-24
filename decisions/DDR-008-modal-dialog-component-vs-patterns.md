# DDR-008 — Modal Dialog: one base component, confirmation & result as patterns

**Date:** 2026-06-23
**Status:** Accepted
**Decided by:** Design lead

---

## Context

The Single Record programme needs blocking dialogs for two distinct jobs:

1. **Confirming an action before it proceeds** (delete, discharge, override a clinical alert, leave without saving).
2. **Reporting the outcome of an action after it completes** (success, failure, with optional result summary).

Both are overlays with a backdrop and a surface. The question was how to structure them in Figma and in the design system: a single multi-variant component, or a base component plus composed patterns. We also needed to decide the terminology, since GDS has no modal pattern to inherit from.

---

## Decision

### Terminology

- **Modal dialog** = the reusable *component* (backdrop + surface + header/body/footer regions + optional close). Name aligns with NHS England (GDS deliberately omits modals).
- **Confirmation dialog** and **Result dialog** = *patterns* built from the Modal dialog component.

### Structure

- **One base `Modal dialog` component** is the reusable primitive and single token source (surface, radius, `Elevation/Overlay` shadow, padding regions, backdrop).
- **Confirmation and Result are documented patterns**, not separate components. They are composed from the Modal dialog shell plus existing `Button`, `Icon`, and `Checkbox` components.

Rationale: the two patterns are structurally different layouts (confirmation = icon-left header + right-aligned footer actions; result = centered badge + centered actions) and their content varies too much to encode as rigid variants. A single variant matrix covering intent × layout × action-count × states would explode combinatorially and still not fit real content. A base component + composed patterns is the GDS/NHS/MOD convention and keeps the variant surface honest.

### Pattern inventory (built on `2561:22206`)

| Pattern | Variants |
|---|---|
| Confirmation | Standard, Destructive, Warning, Acknowledgement, High-stakes (checkbox gate), Processing (busy) |
| Result | Success (simple), Success (next-step actions), Success (result summary), Error |

---

## Behaviour & accessibility (mandatory)

- `role="alertdialog"` for confirmations; `role="dialog"` for general modals.
- `aria-labelledby` → title; `aria-describedby` → body.
- Focus trap while open; background content inert.
- **Initial focus**: destructive/warning → the SAFE option (Cancel); standard/acknowledgement → primary is acceptable. Never auto-focus the destructive action.
- Escape closes (= Cancel) **except** acknowledgement dialogs that must be actioned.
- Backdrop click closes low-stakes modals; for destructive confirmations require explicit Cancel.
- Return focus to the triggering element on close.
- Busy state on confirm disables both buttons (prevents double-submission).
- Focus ring: SR accent double-ring (white inner gap + `Cyan/700` outer, per DDR-006) via `:focus-visible`.

---

## Content rules

- Title is the question, phrased as a question ("Delete this record?").
- Action button NAMES the action ("Delete record"), never "OK"/"Yes".
- Body states consequences plainly, including irreversibility.

---

## Tokens & dependencies

- **Surface**: `Surface/Small Cards` (modal), `Surface/Background` (footer). Backdrop: `Navy/900` @ 35%.
- **Elevation**: `Elevation/Overlay` effect style.
- **Status**: `Status/Info|Warning|Critical|Success` (icon fg) + matching `* Surface` tints (badge bg).
- **Buttons**: `Button` component — Secondary (Cancel), Primary (confirm), Warning (recoverable).
- **Icons**: `Icon/status/info`, `Icon/warnings/warning`, `Icon/action/check`, `Icon/nav/close`.
- **Checkbox**: `Checkbox/Boxes` — high-stakes confirm step.

---

## Destructive button type — RESOLVED (2026-06-24)

The `Button` component set (`1346:500`) had a fourth type named **Warning** that was already styled **red** (`Interactive/Destructive`), not amber. So functionally it was the destructive button under a misleading name — "warning" elsewhere in the system means **amber** (`Status/Warning`, warning banners, pills, the yellow scale).

**Decision: rename the red type `Warning` → `Destructive`. Do not add an amber button.**

Rationale:
- GDS has exactly three button styles — Primary, Secondary, and a red "Warning" button for destructive actions. **There is no amber button in GDS or NHS England.** Our red type matches that convention; only the name was wrong for our context.
- GDS can name its red button "Warning" because it has no wider amber warning language to collide with. Single Record does (banners, status tokens, pills), so `Destructive` is the unambiguous name here.
- There is no established pattern or real need for a "medium-severity" amber action button. Actions are safe or dangerous; severity nuance belongs in the confirmation dialog copy, not a third button colour.

**Applied:** the type is renamed `Destructive` in the Figma component set and in the coded reference (`packages/web/src/button/`, `.sr-button--destructive`), bound to `Interactive/Destructive` with `Red/700` hover and `Status/Critical Surface` disabled. Modal patterns instance this type directly — the earlier Primary-with-fill-override workaround is retired.

---

## Alternatives considered

**Single multi-variant Modal component.** Rejected: intent × layout × action-count × state is combinatorial and breaks on real content length. Maintenance burden outweighs the discoverability benefit.

**Separate Confirmation and Result components (no shared base).** Rejected: duplicates the surface/elevation/backdrop definition, risking drift between the two and with future modal types (forms, pickers).
