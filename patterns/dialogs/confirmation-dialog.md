# Pattern: Confirmation Dialog

**Status:** Planned
**Last updated:** 2026-03

---

## Problem

Clinical and administrative actions are sometimes irreversible — deleting a record, overriding a clinical alert, discharging a patient. A single misclick must not cause harm.

---

## Solution

A modal confirmation dialog that interrupts the action, clearly states what will happen, and requires explicit confirmation before proceeding.

---

## When to Use

**Always use** a confirmation dialog before:
- Permanently deleting any record or data
- Overriding a clinical alert or safety check
- Discharging, transferring, or closing a patient episode
- Sending any external communication (referral, prescription)
- Any action described as irreversible in the system

**Do not use** for:
- Routine saves (save confirmation is shown via success state, not dialog)
- Navigation away from unsaved changes — use the exit warning pattern instead
- Low-stakes reversible actions

---

## Structure

```
┌──────────────────────────────────────────────────────────┐
│  Dialog heading                                          │
│                                                          │
│  Explanation paragraph — what will happen and why        │
│  it matters. One or two sentences maximum.               │
│                                                          │
│                   [ Cancel ] [ Confirm action label ]    │
└──────────────────────────────────────────────────────────┘
```

- **Heading**: States the action clearly. "Delete medication record" not "Are you sure?"
- **Body**: Explains consequence. "This will permanently delete the medication record for Aspirin 75mg. This cannot be undone."
- **Actions**: Grouped at bottom-right. Cancel and Confirm are both buttons of equal visual weight, Cancel left of the primary action (see DDR-018 for modal CTA placement rule).
- **Cancel** (secondary button): Always present. Equal-weight button, placed left of the primary.
- **Confirm** (warning or destructive button): Specific label matching the action. "Delete record" not "Yes" or "OK". Rightmost.

---

## Behaviour

- Dialog opens centred over the page with an overlay (`color.background.overlay`)
- Focus moves to the dialog on open
- Focus is trapped within the dialog — Tab cycles only between the Cancel and Confirm buttons
- Escape key triggers Cancel
- Clicking the overlay does **not** dismiss — clinical dialogs must be explicitly dismissed
- On Cancel: dialog closes, focus returns to the trigger element, no action taken
- On Confirm: dialog closes, action executes, appropriate success or error state shown

---

## Accessibility

- `role="dialog"` with `aria-modal="true"`
- `aria-labelledby` pointing to the dialog heading
- `aria-describedby` pointing to the explanation paragraph
- Focus is moved to the dialog heading or first interactive element on open
- Focus returns to the trigger element on close
- Screen reader announcement: "Dialog: [heading]" on open
- Do not use `alert` or `alertdialog` role unless the action is a genuine system alert — confirmation dialogs use `dialog`

---

## Destructive variant

For permanent data deletion, use the destructive button variant (red) for Confirm. Add a second confirmation step for irreversible clinical actions:

1. First dialog: explanation + cancel/confirm
2. Second dialog (if high-risk): "Type DELETE to confirm" text entry — only for truly critical actions, not routine use

---

## Related

- `/components/modal/spec.md`
- `/components/button/spec.md`
- `/patterns/forms/exit-warning.md`
