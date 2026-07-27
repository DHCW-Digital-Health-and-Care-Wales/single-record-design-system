# Button

**Status:** Planned
**Last updated:** 2026-03

---

## Purpose

Triggers an action. The most fundamental interactive component in the system.

---

## Variants

| Variant | Usage |
|---|---|
| Primary | Single dominant action per view — form submit, confirm |
| Secondary | Alternative or supporting action alongside primary |
| Ghost | Low-emphasis action — cancel, back, tertiary |
| Warning | Destructive or irreversible action — delete, override |
| Destructive | Permanent data deletion — requires confirmation pattern |
| Icon + label | Action with supporting icon for faster recognition |
| Icon only | Toolbar or space-constrained actions — must have accessible name |

---

## Anatomy

```
[ Icon? ]  Label text  [ Icon? ]
└─────────────────────────────┘
         Button container
```

- **Label**: Required on all variants except icon-only. Sentence case. Verb-first ("Save record", "Add medication").
- **Icon**: Optional. Leads the label. Never follows.
- **Container**: Defined padding, border-radius, and minimum width.

---

## States

| State | Visual behaviour |
|---|---|
| Default | Standard appearance |
| Hover | Background lightens / border strengthens |
| Focus | 3px amber focus ring + 2px dark inner shadow (GDS pattern) |
| Active (pressed) | Background darkens |
| Loading | Spinner replaces or precedes label; button disabled |
| Disabled | Muted colours; `aria-disabled="true"`; not `disabled` attribute (preserves focus) |

---

## Sizing

| Size | Height | Padding H | Font | Usage |
|---|---|---|---|---|
| Small | 32px | 12px | `type.size.sm` | Inline, table actions |
| Medium | 40px | 16px | `type.size.base` | Default |
| Large | 48px | 24px | `type.size.lg` | Primary CTAs, mobile |

Minimum touch target: 44×44px (apply padding or invisible hit area for small variant).

---

## Spacing

- Minimum gap between adjacent buttons: `space.3` (12px)
- **Button group alignment** (see DDR-018):
  - **Forms and page-level sections:** left-aligned. Primary action leftmost, secondary/cancel as a text link after it.
  - **Modals and dialogs:** right-aligned, grouped at bottom-right. Primary rightmost, secondary/cancel as an equal-weight button to its left.

---

## Accessibility

- All buttons must have an accessible name.
- Icon-only buttons: `aria-label` is required on the element.
- Loading state: update `aria-label` to describe in-progress state (e.g. "Saving record…").
- Do not use `disabled` attribute for buttons that should remain focusable — use `aria-disabled="true"` with event suppression.
- Warning/Destructive: pair with a confirmation dialog. Do not perform irreversible actions on a single click.
- Focus indicator: 3px solid `color.interactive.focus`, offset 2px, with `color.interactive.focus-inner` inner shadow.

---

## Content Guidelines

- Label: imperative verb + object. "Save", "Add medication", "Cancel appointment".
- Avoid vague labels: "OK", "Yes", "Submit" — use specific action names.
- Do not use exclamation marks.
- Do not use all caps in labels — use CSS `text-transform` only where the design system specifies it.

---

## Engineering Notes

- Blazor: render as `<button type="button">` (not `<input type="button">`).
- Always specify `type="button"` or `type="submit"` — do not rely on default behaviour.
- Loading state: `aria-busy="true"` on the button, live region for status announcements.
- MAUI: map to `Button` control; apply custom style from design tokens.

---

## Related

- `/patterns/forms/form-actions.md` — button placement in forms
- `/patterns/dialogs/confirmation-dialog.md` — required pattern for destructive actions
- `/components/icon-button/spec.md` — icon-only variant with full spec
