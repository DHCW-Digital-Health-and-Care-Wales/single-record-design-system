# Modal dialog

> Stops everything to get a decision, or to show something that must be dealt
> with before the user can carry on.

| | |
|---|---|
| **Type** | Component |
| **Status** | In review |
| **Reference** | [spec.md](spec.md) · `packages/web/src/modal/modal.css` · `packages/react/src/modal/Modal.jsx` |
| **Figma** | Modal (`3807:36855`) on page `3807:36489` |
| **Related standards** | NHS England "Modal" · WCAG 2.2 AA · WAI-ARIA `dialog` / `alertdialog` |
| **Last updated** | 2026-09 |

---

## When to use

- **The task genuinely cannot proceed** until the user answers. Confirming a
  deletion, overriding a clinical alert, discharging a patient.
- **An irreversible action needs an explicit second step.** A single misclick
  must not cause harm.
- **A short focused sub-task** that would lose the user's place if it took over
  the page — picking from a list, correcting one field before a submit.

## When not to use

- **Anything the user can act on later.** That is a
  [notification banner](../notification-banner/guidelines.md) inline, or a
  toast. A modal steals focus and stops work, and that cost has to be earned.
- **Routine confirmation of a save.** A record that now shows as saved has
  already said so. Do not make people dismiss good news.
- **A long form.** If it needs scrolling and several sections, it is a page.
  Modals trap focus, and a trapped focus over a long form is a bad place to be.
- **Reporting an outcome nobody has to acknowledge.** See the
  [result dialog](../../patterns/dialogs/result-dialog.md) — most successes are
  an inline banner, not a dialog.
- **A second modal on top of the first.** Never stack. Resolve one before
  opening another.

## How it works

- **One base component, two composed patterns.** The Modal is the shell —
  backdrop, surface, header, body, footer. **Confirmation** and **Result** are
  patterns built from it, not variants of it (DDR-008).

  > A `Dialog` component set that encoded those patterns as ten variants was
  > deleted in 2026-09 with zero instances to its name. If you are reaching for
  > a new variant here, what you want is a pattern.

- **Three sizes.** Small 380 for a single question, Medium 480 as the default,
  Large 840 for tabular or side-by-side content.
- **The body scrolls, the header and footer do not**, so the title and the
  actions stay reachable however tall the content gets.
- **Actions are right-grouped, primary last** (DDR-018). Cancel is always
  present on a confirmation and is never the visually heavier button.

## Accessibility

- **`role="alertdialog"` for confirmations, `role="dialog"` for everything
  else.** The first interrupts; the second does not.
- **Focus moves into the dialog on open and is trapped there**, with the
  background content `inert`. On close it returns to the element that opened it.
- **Initial focus goes to the SAFE option** on a destructive or warning
  confirmation — Cancel, not Delete. Never auto-focus the destructive action.
- **Escape closes, and means Cancel** — except an acknowledgement dialog that
  must be actioned.
- **Backdrop click closes low-stakes modals only.** A destructive confirmation
  requires an explicit Cancel; a stray click is not a decision.
- **The confirm button disables both buttons while busy**, so the action cannot
  be submitted twice.
- The title names the dialog via `aria-labelledby`; the body describes it via
  `aria-describedby`.

## Content

- **The title is the question.** "Delete this record?" — not "Are you sure?".
- **The action button names the action.** "Delete record", never "OK" or "Yes".
  A button that says Yes is unreadable out of context, which is exactly how a
  screen-reader user meets it.
- **The body states the consequence, including irreversibility.** "This
  permanently deletes the attendance record. This cannot be undone."
- Keep it to one or two sentences. A modal that needs a paragraph is asking the
  user to read carefully at the exact moment they are trying to get past it.

## Related

- [Confirmation dialog](../../patterns/dialogs/confirmation-dialog.md) — before the action
- [Result dialog](../../patterns/dialogs/result-dialog.md) — after the action
- [Notification banner](../notification-banner/guidelines.md) — when nothing must be decided

## Engineering

```html
<dialog class="sr-modal sr-modal--md" aria-labelledby="t" aria-describedby="b">
  <div class="sr-modal__header">
    <h2 class="sr-modal__title" id="t">Delete this record?</h2>
    <button class="sr-modal__close" aria-label="Close"></button>
  </div>
  <div class="sr-modal__body" id="b">
    <p>This permanently deletes the attendance record. This cannot be undone.</p>
  </div>
  <div class="sr-modal__footer">
    <button class="sr-button sr-button--secondary">Cancel</button>
    <button class="sr-button sr-button--destructive">Delete record</button>
  </div>
</dialog>
```

```jsx
<Modal size="md" title="Delete this record?" onClose={close}>
  <p>This permanently deletes the attendance record. This cannot be undone.</p>
</Modal>
```
