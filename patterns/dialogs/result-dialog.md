# Pattern: Result Dialog

**Status:** Documented — Figma frames on the Dialogs page (`2612:2745`)
**Last updated:** 2026-09-21

---

## Problem

An action has finished. Sometimes the user needs to see that it finished, what
it produced, or what to do next — and occasionally that it failed and their work
is safe.

Most of the time they do not. A result dialog costs a dismissal, so it has to
earn one.

---

## Solution

A modal shown **after** an action completes, built from the Modal dialog
component (DDR-008). Centred badge, title, short body, one or two actions.

It is the counterpart to the Confirmation dialog: confirmation asks *before*,
result reports *after*.

---

## When to use

**Use a result dialog when** one of these is true:

- The outcome needs acknowledgement before the user moves on — a clinical action
  recorded against their name.
- There is a real "what now", and the next step is not obvious from the screen
  behind the dialog.
- The details matter and should be confirmed back — what was recorded, for whom,
  at what time.
- The action **failed** and the user needs to know their data is not lost.

**Do not use one when:**

- The success is self-evident from the screen behind it. A saved record that now
  shows as saved does not need a dialog — the screen already said so.
- The message is informational and the user can carry on. Use an **inline
  notification banner** (`Severity=Success`) or a toast.
- It would be the second dialog in a row. Never stack — a confirmation followed
  by a result dialog is two dismissals for one action. Prefer confirmation →
  inline banner.

> A confirmation dialog interrupts because the user must decide.
> A result dialog interrupts because the user must know.
> If they need neither, do not open one.

---

## Variants

| Variant | Actions | Use when |
|---|---|---|
| **Success — simple** | One acknowledge button | The outcome just needs confirming and the user stays where they are |
| **Success — next-step** | Two CTAs | There is a meaningful choice of what to do next (continue vs review) |
| **Success — result summary** | One button, plus a summary block | A clinical action where the recorded details should be read back |
| **Error** | Cancel + retry | The action failed. Say what is safe, and offer the retry |

---

## Structure

```
┌──────────────────────────────────────────┐
│                  ( ✓ )                   │  ← status badge, centred
│                                          │
│           Referral submitted             │  ← title
│   Your referral has been sent to the     │  ← body
│            receiving team.               │
│                                          │
│     [ Back to dashboard ] [ View ]       │  ← centred actions
└──────────────────────────────────────────┘
```

- **Badge** — the filled status mark (`Icon/warnings/*`), on its status surface.
  Success uses `Status/Success`, error uses `Status/Error`.
- **Title** — states the outcome in the past tense. "Referral submitted", not
  "Success".
- **Body** — one or two sentences. On error, **say what happened to the data**.
- **Actions** — centred, unlike the Confirmation dialog's right-aligned footer.
  A result offers next steps rather than a decision, so the layout differs.

---

## Content rules

- **Title names what happened**, in the past tense, to the thing it happened to.
  "Attendance created" beats "Success".
- **An error result reassures before it explains.** "Your data has been kept" is
  the first thing the user needs; the cause is second, and the retry is the
  action.
- **Never blame the user** for a system failure. "The referral couldn't be sent
  due to a connection problem" — not "You failed to submit".
- **Do not put a close [×] on an error result** where the retry is the only safe
  path. Make them choose.

---

## Behaviour and accessibility

- `role="alertdialog"` — a result interrupts, and its message must be announced.
- `aria-labelledby` → title; `aria-describedby` → body.
- **Initial focus goes to the primary action** — unlike a destructive
  confirmation, where focus goes to the safe option. A result has no destructive
  choice to guard against.
- Focus trap while open; background content `inert`.
- Escape closes a success result. On an **error** result, Escape is equivalent to
  Cancel — never to the retry.
- Return focus to a sensible element on close: the triggering control if it still
  exists, otherwise the heading of whatever the dialog navigated to.
- The status badge is **decorative**. The outcome must be in the text — colour
  and icon never carry it alone (SC 1.4.1).

---

## Tokens

| Part | Token |
|---|---|
| Badge foreground | `status.success` / `status.error` |
| Badge surface | `status.success-surface` / `status.error-surface` |
| Surface, radius, elevation | Inherited from the Modal dialog component |

> `status.error` was named `status.critical` until 2026-09-21 (DDR-034).
> `--sr-color-status-critical` still resolves as a deprecated alias.

---

## References

- DDR-008 — one base Modal component, confirmation and result as patterns
- DDR-034 — why the `Dialog` component set was deleted
- `components/modal/spec.md` — the base component
- `patterns/dialogs/confirmation-dialog.md` — the before-the-action counterpart
