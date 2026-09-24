# Error summary

> The box at the top of a form listing every error, each one a link that moves
> focus into the field it names.

| | |
|---|---|
| **Type** | Component |
| **Status** | In review — reclassified from Pattern to Component, DDR-035 |
| **Reference** | `packages/web/src/error-summary/error-summary.css` · `packages/react/src/error-summary/ErrorSummary.jsx` |
| **Figma** | Errors page (`1438:2087`) |
| **Related standards** | GDS "Error summary" · NHS England "Error summary" · WCAG 2.2 AA (SC 3.3.1, 2.4.3, 1.4.11) |
| **Last updated** | 2026-09 |

---

## Why this is a component

DDR-032 first called it a pattern, because it composes Link, the form-field
message anatomy and focus management. By that test the
[modal](../modal/guidelines.md) is a pattern too — it composes Button and Icon
— and so is the [notification banner](../notification-banner/guidelines.md).
Both are components.

What actually separates the two here: **it has one fixed anatomy, it is
instantiated on its own, and its behaviour has to be identical everywhere or it
is wrong.** A component guarantees that; a pattern is a shape you reassemble,
and a reassembled error summary is one that quietly drops the focus management.
Reclassified in DDR-035.

The *usage* guidance — when to validate, how the two layers work together —
stays a pattern, in
[form validation](../../patterns/forms/form-validation.md).

## When to use

- **Any form with more than one or two fields**, as soon as a submission fails.
  GDS and NHS England both treat it as required at that size.
- **Always alongside the inline messages**, never instead of them. Two layers:
  the summary says what is wrong across the form, the inline message says what
  is wrong with this field, at the field.

## When not to use

- **Before the user has submitted.** Validating on blur and showing a summary
  mid-form tells someone they have failed at something they have not finished.
  Inline on blur, summary on submit.
- **For a single field on a short form**, where the inline message is already in
  view — a summary above it is just a second copy.
- **For anything that is not a validation error.** A save that failed because
  the connection dropped is an event, and events are a
  [notification banner](../notification-banner/guidelines.md).

## It is not a notification banner

Both are a box with a status colour near the top of the page, and they get
confused constantly.

> **A banner reports an event. The summary reports the state of the form in
> front of you — and it is interactive.**

| | Error summary | Notification banner |
|---|---|---|
| Reports | The state of this form | Something that happened |
| Interactive | Yes — every item is a link | No |
| Takes focus | Yes, when it appears | No |
| Surface | The page's own surface, with a heavy status border | A status tint |

**The untinted surface is deliberate**, and not only so the two look different.
Status surfaces stay light in dark mode, which is why banner text has to take
the severity colour. The summary sits on the page surface, which flips with the
mode — so its heading and links use ordinary text and link colours and are
correct in both. Tinting it would import the banner's problem for no gain.

## How it works

The behaviour is the pattern. A hand-rolled version always renders the right
box and then misses one of these:

- **It takes focus when it appears**, so a screen-reader user hears the problem
  rather than being left at the submit button they just pressed.
- **Each item is a real link to the field's id**, and activating it moves focus
  *into* the field — not merely scrolls to it.
- **The text matches the inline message exactly.** Two wordings for one problem
  is two problems.
- **Errors are listed in the order the fields appear**, not the order validation
  found them. A list that jumps around the form is a list you have to re-read.
- **It appears once, at the top, above the form's heading.** Never beside a
  field — that is the inline message's job.

## Accessibility

- `role="alert"` and `tabindex="-1"`, focused programmatically on appearance.
  The focus is what makes it work; the box alone is decoration.
- **Focus again on every failed submit**, not only the first. A second attempt
  with different errors is a new problem to announce — the shipped component
  re-focuses when the set of errors changes.
- **The link target is the field, not its error text.** `href="#nhs-number"`,
  where the inline message is `#nhs-number-error` and reaches the field through
  `aria-describedby`.
- **A programmatic focus needs a visible ring.** A sighted keyboard user who is
  moved somewhere with no indicator has been lost, not helped.
- **A field that cannot itself take focus** — a fieldset of radios, a date input
  of three boxes — takes focus on its first focusable control.
- The heading level fits the page outline. Do not pick one for its size.

## Content

- **The heading names the situation, not the count**: "There is a problem".
  Counting them ("There are 3 problems") means maintaining a number that is
  wrong the moment one is fixed.
- **Each item is the fix, not the fault.** "Enter the patient's NHS number" —
  not "NHS number is required", and never "Invalid input".
- **Say which field**, because the item is read out of context: "Date of birth
  must be a real date" beats "Must be a real date".
- No apology and no blame. The user is mid-task under time pressure.

## Related

- [Form validation](../../patterns/forms/form-validation.md) — the two-layer rule this sits in
- [Form fields](../form-fields.md) — the inline message anatomy
- [Notification banner](../notification-banner/guidelines.md) — for an event
- [Link](../link/guidelines.md) — what each item is

## Engineering

```html
<div class="sr-error-summary" role="alert" tabindex="-1">
  <div class="sr-error-summary__header">
    <span class="sr-error-summary__icon" aria-hidden="true"><!-- status/error-circle --></span>
    <h2 class="sr-error-summary__title">There is a problem</h2>
  </div>
  <ul class="sr-error-summary__body">
    <li class="sr-error-summary__item">
      <a class="sr-error-summary__link" href="#nhs-number">Enter the patient's NHS number</a>
    </li>
    <li class="sr-error-summary__item">
      <a class="sr-error-summary__link" href="#dob">Date of birth must be a real date</a>
    </li>
  </ul>
</div>
```

```jsx
{/* Renders nothing when errors is empty, so mount it unconditionally.
    errors must be in FIELD order, and each id is the FIELD's id. */}
<ErrorSummary
  errors={[
    { id: 'nhs-number', message: "Enter the patient's NHS number" },
    { id: 'dob', message: 'Date of birth must be a real date' },
  ]}
/>
```
