# Dialogs

> Two jobs, one component. A confirmation dialog stops the user before an
> action that matters. A result dialog tells them how an action went and what
> to do next. Both are built on Modal.

| | |
|---|---|
| **Type** | Pattern |
| **Status** | In review |
| **Reference** | [Modal](../../components/modal/guidelines.md) · [`confirmation-dialog.md`](./confirmation-dialog.md) · [`result-dialog.md`](./result-dialog.md) · DDR-008, DDR-018, DDR-034 |
| **Figma** | Confirmation patterns (`5373:138`) · Result patterns (`5373:411`) |
| **Related standards** | [NHS England: confirmation page](https://service-manual.nhs.uk/design-system/patterns) · GDS: check answers |
| **Last updated** | 2026-10 |

---

## When to use

- **Confirmation:** before an action that cannot be undone, changes what others see, or carries clinical risk. Deleting a record, locking an assessment, overriding a clinical alert, leaving with unsaved changes.
- **Result:** after an action finishes and the user needs the outcome before moving on. A referral sent, an attendance created, a submission that failed.

## When not to use

- For routine saves. Show success in the page.
- For information the user can act on later. Use a notification banner.
- To ask a question with more than two answers. Use a page or a form.

## How it works

- **Heading states the action as a question or a fact.** "Delete this record?", "Referral submitted". Never "Are you sure?" or "Success".
- **Body gives the consequence in one or two sentences.** "This permanently deletes the attendance record and cannot be undone."
- **Buttons name the action.** "Delete record", not "Yes" or "OK". Cancel sits to the left of the main action (DDR-018).
- **Focus goes into the dialog when it opens** and back to the control that opened it when it closes. Escape closes a confirmation dialog as Cancel.

## Options

| Option | Use when |
|---|---|
| Confirmation: Standard | A significant but recoverable step. "Mark assessment complete?" |
| Confirmation: Destructive | Permanent loss. Main button uses the destructive style. "Delete record" |
| Confirmation: Unsaved changes | Leaving a form with changes. "Stay on page" / "Leave anyway" |
| Confirmation: Session expiring | Sign-out for inactivity is close. "Stay signed in" |
| Confirmation: High stakes | Clinical risk. The main button stays disabled until the user ticks a statement taking responsibility. "Override alert" |
| Confirmation: Processing | After confirming, while the action runs. The button shows "Deleting…" and the dialog cannot be dismissed |
| Result: Success | The action worked. One button, "Done", or a next step such as "View referral" |
| Result: Summary | The action worked and the user needs the details: patient, who did it, when |
| Result: Error | The action failed. Say what happened, that their data is kept, and offer "Try again" |

## Do & don't

| Do | Don't |
|---|---|
| Name the exact thing affected: "the attendance record" | Use a dialog to confirm every save |
| Say the data is kept when something fails | Close a failed result dialog on its own |
| Record who confirmed a high-stakes override | Stack one dialog on top of another |
| Use the destructive button only for permanent loss | Put the destructive action on the left |

## Accessibility

- The dialog has `role="dialog"` (or `alertdialog` for destructive and high-stakes confirmations) and is labelled by its heading.
- Focus is trapped inside while it is open and returns to the trigger on close.
- The processing state is announced ("Deleting…") through a live region.
- The high-stakes checkbox has a visible label; the disabled button explains why it is disabled in the hint text.

## Content

- Sentence case. No exclamation marks in result headings.
- Times in 24-hour form (`11:42`). Dates follow the system date format (`10 Mar 2026`).
- Avoid contractions in clinical wording. "Could not be sent" reads more clearly than "couldn't be sent".

## Known gaps

- The Figma result error copy still uses contractions ("couldn't", "they'll"). Change to full forms when next edited.
- `confirmation-dialog.md` and `result-dialog.md` predate the Figma build and are marked Planned; this page reflects what is in Figma now.

## Frameworks

| Framework | Status | Where |
|---|---|---|
| Web (HTML/CSS) | Modal shipped; dialogs composed from it | `packages/web/src/modal` |
| React | Modal shipped; dialogs composed from it | `packages/react/src/modal` |
| Blazor / .NET | Stylesheet only. Compose the markup with the `sr-modal` classes | `@dhcw/sr-web` CSS |
| .NET MAUI | Design only | Native XAML on the token layer (DDR-021) |
| Legacy (.NET 4.8 / Delphi) | Tokens only | Token CSS custom properties |
