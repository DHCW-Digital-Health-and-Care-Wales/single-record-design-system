# Select

**Status:** In development
**Last updated:** 2026-07

---

## Purpose

Choose a single value from a fixed list of options that is too long or too structured for radio buttons but known in advance (e.g. ward, clinician, category). For free-text-filtered lookups use `autocomplete`; for 2–4 mutually exclusive views use the segmented control; for on/off use the toggle switch.

Reference implementation: `packages/web/src/select/select.css` + `select.stories.js` (Storybook: **Components → Select**). Figma: Select set (`1517:14471`, building blocks `1517:14820`, options `1517:14856`).

---

## Anatomy

```
Label *              ← .sr-select__label (+ .sr-select__required)
Hint text            ← .sr-select__hint
┌──────────────────────────┐
│ Value            ⌄        │  ← .sr-select__trigger (button, aria-haspopup)
└──────────────────────────┘
┌──────────────────────────┐
│ Option 1                  │  ← .sr-select__menu (role="listbox")
│ Option 2            ✓/blue │     .sr-select__option (role="option")
│ Option 3            ›      │     trailing › = nested child menu
└──────────────────────────┘
⚠ Error message      ← .sr-select__error (Error state only)
```

---

## States

| State | Visual behaviour |
|---|---|
| Default | White fill, 1px `Border/Default`, chevron-down in `Text/Secondary` |
| Placeholder | Value text in `Text/Secondary` until a choice is made |
| Focus / Open | 3px `Border/Focus` (Cyan/700) outer ring; chevron rotates 180° when open |
| Option hover / active / selected | `Interactive/Primary` fill, `Text/Inverse` text |
| Error | `Status/Critical` border + `.sr-select--error`; message with `status/error-circle` icon |
| Disabled | `Surface/Background` fill, `Border/Disabled`, `Text/Disabled`, `aria-disabled` |

---

## Sizing

| Element | Dimensions |
|---|---|
| Trigger / option | 40px min height, 12px left / 8px right padding, `radius.sm` (4px) |
| Chevron / option chevron | 20px |
| Error icon | 16px |

Minimum touch target: 40px meets the compact-control baseline; the full 44×44 target is satisfied on mobile layouts.

---

## Accessibility

- Trigger is a real `<button aria-haspopup="listbox" aria-expanded>`; the menu is `role="listbox"` with `role="option"` children and `aria-selected`.
- Keyboard: Enter / Space / Arrow opens; Up/Down moves the active option (`aria-activedescendant`); Enter selects; Esc closes and returns focus to the trigger.
- `aria-labelledby` ties the trigger and menu to the label; `aria-describedby` links hint and error; `aria-invalid` in the error state.
- Colour is not the only selected-state signal — `aria-selected` carries it for assistive tech.
- Disabled options carry `aria-disabled="true"` and are not selectable.

---

## Engineering Notes

- Consumes `@dhcw/sr-tokens` and `@dhcw/sr-icons` (`nav/chevron-down`, `nav/chevron-right`, `status/error-circle`).
- Shares the label/hint/error wrapper conventions with Input for a consistent form-field stack.
- Blazor / React wrappers should mirror the `sr-select__*` class contract and the listbox interaction/ARIA.
- For very long option lists, virtualise the menu; the reference caps the menu at 280px with scroll.

---

## Related

- `/components/form-fields.md` — shared form-field conventions
- `/components/input/spec.md` — label/hint/error stack
- `/components/autocomplete/` (planned) — searchable select for clinical code lookup
