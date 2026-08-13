# Select

> One value from a list too long to show all at once.

| | |
|---|---|
| **Type** | Component |
| **Status** | In review |
| **Reference** | `components/select/spec.md` · `packages/web/src/select/select.css` · `packages/react/src/select/Select.jsx` |
| **Figma** | Select (`1395:15535`) — set `1517:14471`, building blocks `1517:14820`, options `1517:14856` |
| **Related standards** | `components/form-fields.md` · GDS "Select" · NHS England "Select" |
| **Last updated** | 2026-08 |

---

## When to use

- **One value from a known, fixed list** that is too long for radios — a ward, a
  clinician, a specialty, a reason code.
- Where the list is stable enough that the user does not need to search it, but
  long enough that showing every option would crowd the form.
- Roughly **seven to fifty options**. Below seven, radios are better; above
  fifty, the user is searching rather than choosing.

## When not to use

- **Fewer than about seven options.** Use a [Radio group](../radio/guidelines.md)
  — a select hides the options behind a click, and comparing them costs the user
  an extra step for no gain.
- **Two options.** Use radios or a [segmented control](../toggles/guidelines.md).
  A two-item select is the worst version of both.
- **A long or unbounded list** — every patient, every drug. Use
  [Autocomplete](../autocomplete/spec.md), which filters as you type.
- **More than one answer.** A select takes one value. For several, use a
  [Checkbox group](../checkbox/guidelines.md).
- **Dates and times.** Use the date and time fields, which accept typing. A
  select of 31 days is a wheel by another name, and `form-fields.md` rules that
  out.

## How it works

- **It is a button and a listbox, not a native `<select>`.** That is what makes
  the menu stylable, the options able to carry a trailing chevron for nested
  lists, and the open state consistent across browsers. The cost is that every
  keyboard behaviour is ours to get right, so do not fork it.
- **The trigger shows the current value**, in secondary text while it is still a
  placeholder. "Select a ward" is a placeholder, not a value — it must never be
  submittable.
- **Order the list the way the user thinks.** Frequency first where you know it,
  then alphabetical. Never by database ID.
- **Group long lists** rather than making the menu taller. The menu caps at
  280px and scrolls; past that, structure beats scrolling.
- **The menu closes on selection**, on Escape, and on click outside. It never
  closes on scroll — a menu that vanishes when the page moves under it reads as
  a bug.
- **Label, hint and error are the same stack as Input**, so a form mixing the
  two lines up. See `form-fields.md`.
- **Required** shows an asterisk after the label. Decorative only; the
  requirement is carried programmatically.

## Do & don't

| Do | Don't |
|---|---|
| Write the label as what is being chosen — "Ward" | Write it as an instruction — "Please choose a ward" |
| Keep the placeholder unselectable | Let "Select a ward" submit as a value |
| Put frequent options at the top | Order by internal code |
| Group a long list under headings | Let the menu grow past a screenful |
| Use Autocomplete once the list is searchable | Bolt a search box onto a select |

## Accessibility

- The trigger is a real `button` with `aria-haspopup` and `aria-expanded`; the
  menu is `role="listbox"` and each option `role="option"` with
  `aria-selected`.
- Full keyboard: Enter/Space/Down to open, Up/Down to move, Home/End to jump,
  typeahead to skip, Enter to choose, Escape to close and return focus to the
  trigger. Focus never escapes to the page behind an open menu.
- The label is programmatically associated with the trigger, and the hint and
  error are referenced from it, so all three are announced together.
- Focus ring is a 3px Cyan/700 outer stroke, drawn outside the control so it is
  never clipped by the field box.
- The open state is not colour alone — the chevron rotates.
- Error is exposed programmatically, not only as a red border, and the message
  says what to do rather than what went wrong.
- Disabled uses `aria-disabled` and leaves the control out of the tab order.

## Known gaps

- No Blazor implementation yet.
- No multi-select variant. Where one has been asked for, the answer so far has
  been a checkbox group; if that stops being enough it needs a decision record
  rather than an option flag.
- Very long lists are not virtualised. The menu caps at 280px and scrolls,
  which is fine to about fifty options and untested well past that.
