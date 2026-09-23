# Pattern: Form Validation

**Status:** In review — the error summary now ships; see [error-summary](../error-summary/guidelines.md)
**Last updated:** 2026-09

---

## Problem

Users make errors in complex clinical forms. Validation must communicate which fields are invalid, why, and how to fix them — without causing confusion or distress to clinical staff under time pressure.

---

## Solution

Two-layer validation: an **error summary** at the top of the form, and **inline errors** next to each invalid field. Both are always shown together.

---

## Error Summary

Displayed at the top of the form, immediately after a failed submission attempt.

**Behaviour:**
- Appears above the form heading (not within the form body)
- Contains a heading: "There is a problem". **Not a count** — a number is wrong
  the moment one error is fixed
- Lists every error as a link — clicking jumps to the relevant field
- Focus moves to the error summary when it appears, and again on every
  subsequent failed submit where the set of errors has changed
- Errors are listed in the order the FIELDS appear, not the order validation
  found them

**What it is built from:** `.sr-error-summary` / `ErrorSummary`, plus a list of
real links. It is **not** a notification banner — see
[error-summary](../error-summary/guidelines.md) for the boundary and why the
surface is untinted.

```
┌─────────────────────────────────────────────────────────┐
│ (!)  There is a problem                                 │
│      Enter the patient's NHS number      ← a real link  │
│      Date of birth must be a real date   ← a real link  │
└─────────────────────────────────────────────────────────┘
```

> This document described the summary as an `alert-banner` and the inline
> message as an `inline-error` component. **Neither exists**, and the first is
> the confusion this pattern exists to prevent. Corrected 2026-09.

---

## Inline Error

Displayed between the label (and hint, if present) and the input field.

**Behaviour:**
- Rendered **after** the control, as the field's last element — this is what
  `Input`, `Select`, `Checkbox`, `Radio`, `Search` and `Date input` all do
- The field carries `.sr-input--error`, which sets a `status/error` border plus
  an inset 1px shadow. There is no red *left* border
- Error text is `.sr-input__error`, caption size, `status/error`
- Associated with the field via `aria-describedby`, with `aria-invalid` on the
  control

```
Label text
Hint text (optional)
Error: Date of birth must be in the past
[ Day  ] [ Month ] [ Year ]
```

**What renders it:** each field component's own `__error` element. There is no
separate inline-error component, and deliberately so — a standalone one could
render the message without attaching it to a field, and the attachment is the
part that matters (DDR-032).

---

## When to Validate

| Trigger | Approach |
|---|---|
| Form submission | Full validation — show error summary + all inline errors |
| Field blur (leaving a field) | Inline error for that field only — no error summary |
| Real-time / on keypress | Only for format feedback (e.g. character count) — not for required fields |

Do not validate empty required fields on blur — only on submission. This prevents premature errors while the user is still completing the form.

---

## Error Message Guidelines

- Be specific: "Enter a date of birth" not "This field is required"
- Tell the user what format is expected: "Enter the date as DD MM YYYY"
- Do not blame the user: avoid "You entered an invalid…" — use "The date must be…"
- Match the error in the summary to the error inline — same wording
- Sentence case, no trailing full stop

---

## Accessibility

- Error summary receives focus on submission failure (`tabindex="-1"`, focus set programmatically)
- Each error link in the summary must navigate to and focus the invalid field
- `aria-invalid="true"` on invalid inputs
- `aria-describedby` links input to its inline error message
- Error messages are announced by screen readers when the field is focused
- Do not use colour alone — the "Error:" prefix and field border style convey error state visually without colour

---

## Related

- [`patterns/error-summary/guidelines.md`](../error-summary/guidelines.md)
- [`components/form-fields.md`](../../components/form-fields.md)
- [`components/notification-banner/guidelines.md`](../../components/notification-banner/guidelines.md) — for an event, not a validation error
- GDS: [Error summary](https://design-system.service.gov.uk/components/error-summary/)
- GDS: [Error message](https://design-system.service.gov.uk/components/error-message/)
