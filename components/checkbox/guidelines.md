# Checkbox

> A box you tick. Use it when each option is independent — "any of these,
> including none".

| | |
|---|---|
| **Type** | Component |
| **Status** | In review |
| **Reference** | `components/checkbox/spec.md` · `packages/web/src/checkbox/checkbox.css` · `packages/react/src/checkbox/Checkbox.jsx` |
| **Figma** | Checkbox (`1438:17158`) — set `1517:13764` |
| **Related standards** | `components/form-fields.md` · GDS "Checkboxes" · NHS England "Checkboxes" |
| **Last updated** | 2026-08 |

---

## When to use

- Options that are **independent of one another**. Ticking one says nothing
  about the others, and ticking none is a valid answer.
- A single yes/no that is part of a form and takes effect on **Save** —
  "I confirm the details are correct".
- Selecting rows in a table, with a "Select all" checkbox above them.

## When not to use

- **Exactly one answer required.** Use a [Radio group](../radio/guidelines.md) —
  a radio group cannot be un-answered by accident, a checkbox list can.
- **Immediate effect, no Save.** Use a [Switch](../toggles/guidelines.md). A
  checkbox in a form promises "nothing happens until you save"; a switch
  promises the opposite.
- **More than about ten options.** Use a
  [multi-select](../select/guidelines.md) — past ten, a list stops being
  scannable and becomes a wall.
- As a way to show status. A checkbox is an input. If the user cannot change
  it, use a [Tag](../tags/guidelines.md) or plain text.

## How it works

- **20px box, 28px label offset.** The same measurements as Radio, so a form
  mixing the two lines up.
- **Group anatomy.** `fieldset` → legend → hint → error → options. The legend
  names the question; each label names one answer. Both are needed — a legend
  of "Options" and labels of "Yes"/"No" tells a screen-reader user nothing.
- **Vertical by default.** Horizontal is only for two or three short options,
  and it wraps rather than overflows.
- **Long labels wrap under the label, not under the box.** The label is
  `inline-block` with left padding, not a flex sibling, so the second line
  aligns with the first rather than sliding under the tick. Do not "fix" this
  by switching the label to flex.
- **Indeterminate is a parent state, not a third answer.** A "Select all"
  checkbox is indeterminate when some but not all children are ticked. Never
  offer indeterminate as something the user can choose.
- **Error sits on the group, not on each option.** One message above the
  options, with a red rule down the left of the whole group.
- **Required** shows an asterisk after the legend. The asterisk is decorative;
  the requirement is carried programmatically. See `form-fields.md`.

## Do & don't

| Do | Don't |
|---|---|
| Write labels as the answer — "Include discharged patients" | Write labels as the question — "Discharged?" |
| Put the most common option first | Order options alphabetically when frequency is known |
| Use one group per question | Put two questions in one fieldset |
| Let a long label wrap | Truncate a label with an ellipsis |
| Keep "Select all" adjacent to the list it selects | Use indeterminate as a user-selectable state |

## Accessibility

- Native `<input type="checkbox">`. Nothing here is a `div` with a click
  handler, so Space, form submission and assistive-technology support are the
  browser's, not ours.
- The legend is the group's accessible name. Hidden legends stay in the markup
  — `hideLegend` hides them visually only.
- The tick is not the only signal: the box fills and the border darkens, so the
  state survives greyscale.
- Hint and error are referenced from the group, so they are announced with it
  rather than as loose text nearby.
- Target size: the label is part of the target, so a 20px box still gives a row
  comfortably over 24px. Touch layouts should give each option a 44px row.
- Disabled uses the native attribute, so the option leaves the tab order and is
  omitted from submission — not merely greyed.

## Known gaps

- No Blazor implementation yet; the CSS contract is stable enough to wrap.
- Touch-target sizing is guidance rather than a token — there is no
  `control.row.touch` height in `/foundations/tokens/`.
