# Patient Banner

> The strip at the top of a patient screen that tells staff, at a glance, which
> patient they are looking at — and what they must know before acting.

| | |
|---|---|
| **Type** | Pattern |
| **Status** | In review |
| **Reference** | [`spec.md`](./spec.md) (full contract) · `packages/web/src/patient-banner/patient-banner.css` |
| **Figma** | Patient Banner set (`1711:15585`) |
| **Related standards** | UI Standards #25 (dates), #8 (abbreviations) · [NHS England patient banner guidance](https://service-manual.nhs.uk/design-system/patterns) |
| **Last updated** | 2026-08 |

---

## When to use

- On **every** screen that shows or acts on a single patient's data — records, casenote tracking, requests, results, appointments.
- Whenever a task could be performed against the wrong patient if the user lost track of context.

## When not to use

- On list or search screens covering many patients — the banner names one patient and would be actively misleading. Identify patients in the row instead.
- As a page heading. The banner answers "who is this?", not "what screen am I on?" — both are needed, and the banner does not replace an `h1`.
- To carry task actions. The action stack is for patient-level actions only (change patient, open record, print label). Screen-level actions belong in the screen.

## How it works

- **Two types, both live.** `Fill` tints the alert cards; `Border` keeps them white with a coloured rule. Both are supported until a decision retires one — do not assume either is going away, and do not mix them within a product.
- **Two states.** `Expanded` shows alerts, full demographics and labelled actions. `Collapsed` reduces to one row: alert counts as pills, identity, and icon-only actions.
- **Name, NHS number and DOB survive collapse.** A collapsed banner must still answer "which patient is this?". Everything else is secondary detail and may be hidden.
- **Alerts come first in the reading order**, before demographics, because they change what is safe to do.
- **Deceased patients carry two independent signals** — a `Deceased` flag beside the name and a date of death in the demographics. Never colour alone.
- **The banner is persistent, not dismissible.** Users may collapse it; they may not remove it.

## Choosing between Fill and Border

| | Use `Fill` when | Use `Border` when |
|---|---|---|
| Screen density | The screen is busy and the banner competes for attention — the tint carries further in peripheral vision. | The screen is already colour-heavy (status tags, charts) and another tinted block would add noise. |
| Print / export | — | The view may be printed; large tints waste toner and can drop out. |

Pick one per product and stay with it. Switching type between screens makes the
alert cards look like they mean different things.

## Do and don't

- **Do** keep the banner at the top of the scroll container so it is the first thing read.
- **Do** let staff collapse it on data-dense screens where vertical space is scarce.
- **Don't** truncate the patient name. If space is tight, collapse the banner instead.
- **Don't** put a count in an alert card without the underlying detail being reachable — "3 warnings recorded" must lead somewhere.
- **Don't** re-order the demographic fields per product. Staff learn the position.

## Accessibility

- Alert cards are **not** live regions. They are present on load, not announced changes; making them live would interrupt every screen entry.
- The collapse toggle is a real `button` with `aria-expanded`, and its name says what it does ("Hide details" / "Show details"), not just "toggle".
- Icon-only actions in the collapsed state name the action **and** its subject, e.g. "Print label for JOHN, Elvet George".
- Copy buttons announce what was copied, not just "copied".
- Reaction and warning severity is never signalled by colour alone — the text states it.

## Research and open questions

- Fill vs Border has not been tested with clinical staff. The two types exist because both were drawn; the decision to keep both is provisional and should be settled by testing, not preference.
