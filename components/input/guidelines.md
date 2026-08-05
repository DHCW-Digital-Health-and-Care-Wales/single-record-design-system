# Input

Figma: Input set (`1363:22921`, node `840:14593` for the underlying properties).

A single-line or multi-line text field: label, optional hint, the field itself,
and an optional error message. Six types share one anatomy and one state
machine — Text, Password, Phone number, Date, Time and Textarea.

## Anatomy

Vertical stack, `space-1` gap:

1. **Label** — required. Carries the asterisk (`*`, `Status/Critical`) when
   the field is required. Can be visually hidden (`hideLabel`) where the
   design shows none, but the label always exists for assistive technology —
   a placeholder is not an accessible name and disappears on typing.
2. **Hint** — optional, sits between the label and the field.
3. **Field** — the bordered row: optional leading icon, the control, optional
   trailing content (a password reveal toggle, or a `trailingAction` slot for
   a scan trigger or similar).
4. **Error message** — only in the error state, replaces the hint's position
   below the field.

## Types

| Type | Notes |
|---|---|
| Text | Default single-line field. |
| Password | Trailing show/hide toggle. Masked by default. |
| Phone number | `type="tel"`; the placeholder shows the expected format (`e.g. 07700 900000`), it does not enforce it. |
| Date | Delegates to `DatePicker` (calendar popover). |
| Time | Delegates to `TimeSelect` (slot select). |
| Textarea | Multi-line, `resize: vertical` only, 72px minimum height. |

Date and Time are Input in name only from a design standpoint — in code they
render a different control behind the same label/hint/error scaffold, so a
consumer writes `<Input type="calendar" />` and gets the calendar popover
without composing it by hand. See DDR-012 for when the 3-field `DateInput`
is the better fit instead of the single calendar field.

## States

| State | Trigger |
|---|---|
| Default | — |
| Focus | `:focus-within` on the field — real browser focus, not a class. |
| Error | `error` prop set. Border and message turn `Status/Critical`; `aria-invalid="true"`. |
| Disabled | `disabled` prop. Muted border, background and text; native `disabled` attribute, not a visual-only style. |

## Usage

- Always pass a real `label`. Use `hideLabel` rather than omitting it when
  the design shows no visible label.
- Use `hint` for guidance needed before the person types (format, an example
  value). Use `error` for what went wrong after they did — the two never show
  at once.
- Prefer `type="phone"` over free text for a phone number field so the
  keyboard and validation intent are correct on mobile, even though the mask
  itself is not enforced here.
- Don't use Textarea for long-form clinical content (500+ characters) — that
  belongs in a dedicated note-taking pattern, not a single multi-line field.

## Accessibility

- Label is a real `<label for>`, not a placeholder — required, never optional.
- `aria-describedby` links the control to its hint and/or error text.
- `aria-invalid="true"` on the error state.
- Disabled uses the native `disabled` attribute, so it is excluded from the
  tab order and from form submission, not just styled to look inactive.
- Password reveal toggle carries an accessible name that states the action
  ("Show password" / "Hide password"), not just an icon.
