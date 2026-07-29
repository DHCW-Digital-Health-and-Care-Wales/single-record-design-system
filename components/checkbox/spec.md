# Checkbox

**Status:** In development
**Last updated:** 2026-07

---

## Purpose

Lets a user select one or more options from a set, or toggle a single independent
option on and off. Use a checkbox when options are not mutually exclusive; use
[Radio](../../components/form-fields.md) when exactly one option may be chosen, and
[Toggle switch](../../packages/web/src/switch/) when the control applies a setting
immediately rather than as part of a form submission.

The indeterminate state exists for the "some but not all" parent control in a
table's row-selection pattern. It is a visual state only — never a value the user
can set directly.

---

## Variants

| Variant | Usage |
|---|---|
| Single checkbox | One independent option, no group legend |
| Group (vertical) | Related options stacked; the default for forms |
| Group (horizontal) | Related options in a row; only where options are short and the row fits without wrapping awkwardly |

Group options: `Legend` shown/hidden · `Hint` shown/hidden · `Error` true/false ·
`Required` true/false. Matches the Figma set `1517:13764`.

---

## Anatomy

```
Legend *                       ← group name + required marker
Hint text                      ← optional helper (Caption)
(!) Error message              ← optional validation (Caption + status/error-circle)
┌──┐
│✓ │ Option label              ← box (20px) + gap (8px) + label (Body S)
└──┘
```

- **Legend**: the group name. `Label` 14/20 Medium. Rendered as a real `<legend>`.
- **Required marker**: inline `*` in `Status/Critical`, on the legend only — never
  on individual options. Decorative; pair with `aria-required`.
- **Hint**: `Caption` 12/16, `Text/Secondary`.
- **Error message**: `Caption` 12/16, `Status/Critical`, preceded by a 16px
  `Icon/status/error-circle`.
- **Box**: 20×20, 2px border, `radius-sm`. Draws the tick or the indeterminate dash.
- **Label**: `Body S` 14/20 Regular, `Text/Primary`. Clickable — it extends the target.

Group gap `space-1`. Options gap `space-3` vertical, `space-6` horizontal, with
`space-1` padding above the list.

---

## States

| State | Visual behaviour |
|---|---|
| Default | `Surface/Small Cards` fill, `Border/Default` 2px border |
| Hover | Border becomes `Border/Strong` |
| Focus | 3px `Border/Focus` (Cyan/700) ring outside the box only, not the label — DDR-006 |
| Checked | `Interactive/Primary` fill and border, white tick |
| Indeterminate | `Interactive/Primary` fill and border, white dash. Takes precedence over checked, matching native behaviour |
| Disabled | `Border/Disabled` border, `Text/Disabled` label; checked/indeterminate fill becomes `Border/Disabled` |
| Error | `Interactive/Destructive` border; checked fill also `Interactive/Destructive`. The group gains a 2px left rule and `space-3` inset |

There is deliberately **no error + indeterminate** variant and no
**disabled + error** variant — neither is a reachable combination in the flows
this system supports.

---

## Sizing

| Part | Dimensions |
|---|---|
| Box | 20 × 20 px |
| Row | 20 px min-height |
| Gap, box to label | 8 px (`space-2`) |

### Target size — how this meets WCAG 2.2

The 20px box is below the 24×24 px minimum in **SC 2.5.8 Target Size (Minimum, AA)**,
so compliance rests on the criterion's **spacing exception**: an undersized target
passes if a 24px-diameter circle centred on it does not intersect the circle of any
other target.

- Vertical groups: centres are 32px apart (20px row + 12px gap) — greater than 24px, so the circles do not intersect. **Passes.**
- Horizontal groups: centres are at least 44px apart (20px box + 24px gap). **Passes.**
- The clickable label extends the target horizontally well beyond the box.

**This holds only while the documented spacing is used.** Tightening the options
gap below 12px would break the exception and fail AA. Do not reduce it.

This does **not** meet SC 2.5.5 Target Size (Enhanced, AAA, 44×44). For touch-first
contexts — MAUI on tablets, or gloved use in a clinical setting — increase the row
target to 44px. Flagged for the design lead: the Figma set specifies 20px rows, so
a touch variant would be a design decision, not a local override.

---

## Responsive behaviour

**Form-factor class: Responsive** (DDR-011) — tokens only, no separate variant.

| Breakpoint | Behaviour |
|---|---|
| Mobile | Horizontal groups wrap; consider switching to vertical below 480px |
| Tablet / Desktop | As specified |

Horizontal groups use `flex-wrap`, so they degrade by wrapping rather than
overflowing. Long option labels wrap under the label, not under the box, because
the label is `inline-block` with left padding rather than a flex sibling.

---

## Spacing

| Gap | Token |
|---|---|
| Legend → hint → error | `space-1` (4px) |
| Above the options list | `space-1` (4px) |
| Between vertical options | `space-3` (12px) |
| Between horizontal options | `space-6` (24px) |
| Error group left inset | `space-3` (12px), after a 2px rule |

---

## Accessibility

- Renders a **real `<input type="checkbox">`**, kept in the accessibility tree and
  the tab order. It is made transparent and laid over the drawn box — never
  `display:none` or `visibility:hidden`, which would remove it from both.
- Groups use `<fieldset>` / `<legend>` so the group name is announced with each option.
- `indeterminate` is set as a DOM property (not an attribute) and is exposed to
  assistive technology as `aria-checked="mixed"` by the browser.
- Hint and error are linked with `aria-describedby`; the group carries
  `aria-invalid` and `aria-required` where applicable.
- Focus ring is applied to the box alone, so it is never stretched around the label.
- Error is never signalled by colour alone — the red box is always accompanied by
  the error message and its icon (SC 1.4.1).
- Keyboard: Tab moves between options, Space toggles. No custom key handling, so
  native behaviour is preserved exactly.
- Target size: see the analysis above.

---

## Content Guidelines

- Option labels are sentence case, and describe what selecting the option does.
- Do not repeat the legend in each option label.
- Legends name the decision, for example "Case note type", not "Please select a type".
- Error messages say what to do, not what went wrong: "Select at least one option".

---

## Engineering Notes

| Framework | Where |
|---|---|
| Web (HTML/CSS) | `packages/web/src/checkbox/checkbox.css` |
| React | `packages/react/src/checkbox/Checkbox.jsx`, `CheckboxGroup.jsx` |
| Blazor / MAUI | Consumes the same CSS via the RCL |

The tick and the indeterminate dash are drawn with CSS borders and a rotated
element — no icon asset, no background image — so they inherit token colours and
scale cleanly. The React `Checkbox` applies `indeterminate` through a ref because
React does not support it as a JSX attribute.

```html
<div class="sr-checkbox">
  <input class="sr-checkbox__input" type="checkbox" id="note-1">
  <label class="sr-checkbox__label" for="note-1">General notes vol 1</label>
</div>
```

---

## Do / Don't

| Do | Don't |
|---|---|
| Use a group with a legend for related options | Leave a set of related options without a group name |
| Put the required asterisk on the legend | Put an asterisk on every option |
| Use indeterminate for a partial select-all | Let a user set indeterminate directly |
| Keep the documented 12px option gap | Tighten the gap — it breaks the SC 2.5.8 spacing exception |
| Use a checkbox for non-exclusive options | Use a checkbox where only one choice is valid — use Radio |

---

## Related

- [`components/form-fields.md`](../form-fields.md) — the cross-cutting form-field type scale and required-marker rule
- [`components/table/spec.md`](../table/spec.md) — row selection uses this component
- Figma: `Checkbox` `1517:13764` · `Checkbox/Building blocks` `843:14568` · `Checkbox/Boxes` `2533:17492`
- GDS checkboxes · NHS England checkboxes (pattern references)
