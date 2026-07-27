# DDR-018 — CTA button placement: forms/sections vs. modals

**Date:** 2026-07-23
**Status:** Accepted
**Decided by:** Design lead

---

## Context

Primary-action (CTA) placement is inconsistent across the system — some contexts put the
CTA lower-right, others lower-left, with no documented rule. `components/button/spec.md`
carries a one-line hint ("left-aligned on forms (GDS), right-aligned in modals and
toolbars") but it isn't stated as a decision, isn't precise about the secondary action, and
isn't referenced by the component/pattern docs that need it. We need one system-wide rule,
covering both contexts, that everything else points to.

---

## Decision

**Two interaction shapes, two distinct rules — not one universal alignment.**

### 1. Forms and page-level sections → left-aligned

- Primary action **leftmost**.
- The secondary/cancel action is a **text link placed after the primary**, not a second
  button of equal visual weight.
- Buttons align to the **same left edge** as the labels/inputs above them in the form, so the
  CTA stays anchored to the vertical reading flow of the form content.

### 2. Modals and dialogs → right-aligned

- Primary action **rightmost**.
- The secondary/cancel action is a **button of equal visual weight, placed to its left**
  (both are buttons here, unlike the form context). Actions are **grouped together at the
  bottom-right**, not split to opposite edges of the footer.
- With more than two actions, the whole cluster stays right-aligned with the primary
  rightmost (e.g. `[Cancel] [Acknowledge warnings] [Send batch]`).

---

## Why two rules, not one

- **Forms and modals are different interaction shapes.** A form is part of a longer page
  flow — left-alignment keeps the CTA visually anchored to the content above it, consistent
  with the form's vertical reading flow.
- **A modal is a self-contained, bounded decision point** layered over the page.
  Right-alignment mirrors the OS-level dialog convention (Windows, macOS, and most web modal
  patterns) users already carry from every other piece of software — reducing cognitive load
  at the exact confirm/cancel moment where ambiguity is costliest.
- Forcing one alignment onto both means **fighting a learned convention** in at least one of
  them.
- **Touch/thumb reach:** the right-aligned modal primary also sits closer to the natural
  reach zone on MAUI/tablet and trolley use.

---

## Reference basis

- **Forms/sections:** GDS convention — left-aligned button, cancel as a **link** rather than
  a second button.
- **Modals:** general OS dialog convention (Windows/macOS) + NHS.UK's own modal patterns —
  right-aligned, primary rightmost, cancel as an equal-weight button to its left.

---

## Consequences

- **This rule is documented once and referenced, not restated per component.** Canonical
  home: the CTA/placement section of the Button guideline (and the dialog pattern for the
  modal case); every component/pattern doc with a CTA links to it rather than repeating it.
- **Forms/sections audit:** every form and page-level section CTA moves to left-alignment
  (primary leftmost, cancel as a link after it) if not already.
- **Modals audit:** every modal footer moves to right-alignment, actions grouped bottom-right,
  cancel/secondary an **equal-weight button to the left of the primary** (not a link).
  - `patterns/dialogs/confirmation-dialog.md` — the structure diagram shows Cancel/Confirm
    split; update to a right-grouped cluster (the "Cancel always on the left" wording already
    matches — it means to the left *of the primary*, not the left edge of the footer).
  - The batch review-before-send modal mockup splits `[Cancel]` to the far left with a ghost
    weight — regroup to `[Cancel] [Acknowledge warnings] [Send batch]` bottom-right, Cancel as
    an equal-weight secondary button.
- `components/button/spec.md` "Button group alignment" line is superseded by this DDR — expand
  it (forms = link secondary; modals = equal-weight grouped right) and cite DDR-018.
- Tracked as a design-language audit item (DL-008) so the sweep isn't lost.

---

## References

- `components/button/spec.md` — existing alignment hint (to be expanded + cite this DDR)
- `patterns/dialogs/confirmation-dialog.md` — modal footer (right-grouped cluster)
- GDS button / form patterns; NHS.UK modal patterns
- DDR-008 — Destructive vs Warning button naming (related button-system decision)
