# Input

> A field for typing a single value: a name, an NHS number, a phone number, a
> date, or a longer note.

| | |
|---|---|
| **Type** | Component |
| **Status** | Live |
| **Reference** | `packages/web/src/input/input.css` · `packages/react/src/input/Input.jsx` |
| **Figma** | Input (`1363:22921`), component set (`840:14593`) |
| **Related standards** | NHS England Text input, GOV.UK Text input, WCAG 2.2 AA |
| **Last updated** | 2026-08 |

---

## When to use

- Asking for one piece of information that the person types or picks.
- Anywhere the answer is open-ended and short: a name, an identifier, a
  reference number, a phone number.
- For a date or a time, where a single field is enough.
- For a longer free-text answer, using the multi-line type.

## When not to use

- **Choosing from a fixed list.** Use Select for many options, Radio for a few
  visible ones, or Autocomplete where the list is long but known.
- **A yes or no answer.** Use Checkbox for one, Radio for a choice between two
  named alternatives.
- **Searching.** Use Search, which carries its own submit and results behaviour.
- **A date that people know in parts.** Where someone would say "the third of
  June, nineteen eighty" rather than reading a date off a card, three separate
  fields are easier to complete and easier to correct. See Date entry guidance.
- **Long-form clinical narrative.** A single multi-line field is not a
  note-taking surface. Anything past roughly 500 characters belongs in a
  dedicated pattern with its own saving and history.

## How it works

The field is a vertical stack: label, optional hint, the field itself, and an
error message when there is one. That order does not change, so a person reading
down the form always meets the question before the answer, and the correction
before the input they need to fix.

**The label is not optional.** It can be visually hidden where the surrounding
design already makes the question obvious, but it always exists for screen
readers. A placeholder is not a label: it disappears the moment someone starts
typing, which is exactly when they may need to check what was being asked.

**Hint before, error after.** A hint explains what a good answer looks like and
belongs above the field, where it is read before the person commits. An error
explains what went wrong and belongs below, next to what needs changing. They do
not appear together — once there is an error, it replaces the hint.

**States are real, not decorative.** Focus is the browser's own focus, disabled
is the native disabled attribute, and an invalid field is marked as such
programmatically rather than only turning red.

### Types

| Type | For | Notes |
|---|---|---|
| Text | Names, identifiers, free text | The default |
| Password | Credentials | Masked, with a show and hide control that says which it does |
| Phone number | Telephone numbers | Brings up the phone keypad on mobile. The placeholder shows the shape of a valid number; it does not enforce it |
| Date | A single calendar date | Opens a date picker |
| Time | A time of day | Offers time slots |
| Multi-line | Longer answers | Grows vertically only, never horizontally |

Date and Time are the same field on the outside and a different control on the
inside: they share the label, hint and error behaviour above, and open a picker
rather than accepting free typing.

## Do and don't

| Do | Don't |
|---|---|
| Give every field a label, even a hidden one | Use a placeholder as the label |
| Say what a good answer looks like in the hint | Repeat the label in the hint |
| Mark required fields, and say what the mark means | Mark every field required when most are |
| Size a field to the answer where the length is known | Make every field full width regardless of content |
| Say what is wrong and how to fix it | Say "invalid input" |
| Let people type a value however they know it | Reject spaces or punctuation the person cannot see are wrong |

## Accessibility

- Every field has a real label, associated with the control. Hiding a label
  visually does not remove it.
- Hint and error text are announced with the field, not separately from it.
- An invalid field is marked programmatically, so it reaches someone who cannot
  see the red border.
- The required marker is decorative; the field also announces that it is
  required.
- Disabled fields are skipped by the keyboard and left out of the submission,
  not merely greyed.
- The password show and hide control names the action it performs, not the icon
  it shows.
- Focus is visible on the field itself, as a ring that does not move the layout.

## Research and notes

**Not built yet: the character counter.** The multi-line type is designed with a
remaining-character count beneath it. The component does not have one, so nothing
here shows a control that does not exist. Worth building when a form genuinely
enforces a limit; on a field with no limit, a counter is noise.
