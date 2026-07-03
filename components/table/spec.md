# Table

**Status:** In development
**Last updated:** 2026-07

---

## Purpose

Presents structured clinical or administrative data in rows and columns — patient lists, results, appointments, audit logs. Use a table when the data is genuinely tabular and rows are comparable across a shared set of columns. For a single record's fields, use a description list or summary pattern, not a table.

Reference implementation: `packages/web/src/table/table.css` + `table.stories.js` (Storybook: **Components → Table**).

---

## Variants

| Variant | Usage |
|---|---|
| Default | Standard data table with header row and body rows |
| Selectable rows | A row can be marked selected (`--selected`) — e.g. the active patient |
| With row actions | Trailing actions column of icon-only buttons (view / edit / delete) |

---

## Anatomy

```
┌───────────────────────────────────────────────────────────┐
│ Header cell   Header cell   Header cell        (Actions)   │  ← .sr-table__head
├───────────────────────────────────────────────────────────┤
│ Cell          Cell          Cell            [👁] [✎] [🗑]  │  ← .sr-table__row
│ Cell          Cell          Cell            [👁] [✎] [🗑]  │
└───────────────────────────────────────────────────────────┘
   scrolls horizontally inside .sr-table-wrap on narrow viewports
```

- **`.sr-table-wrap`**: Scroll container. Tables scroll horizontally here rather than breaking the page layout.
- **`.sr-table__head`**: Column headers — medium weight (500), `Surface/Subtle` fill, `<th scope="col">`.
- **`.sr-table__row` / `.sr-table__cell`**: Body rows and cells. Compact padding (8px 16px) for dense clinical density. Row dividers use `Border/Subtle`.
- **`.sr-table__actions` / `.sr-table__action`**: Trailing cell holding row-level icon-only buttons.

---

## Row action icon colour

Row-action icons render in **`Interactive/Primary`** (brand blue), **not** the default black icon colour. A row action is an interactive affordance and must read as one. The icon inherits `currentColor` from `.sr-table__action`, which is set to `--sr-color-interactive-primary`.

Destructive row actions (delete / remove) are the exception: `.sr-table__action--destructive` renders them in `Interactive/Destructive` (red). This is the only row action that is not blue.

---

## States

| State | Visual behaviour |
|---|---|
| Row default | `Surface/Section cards` background |
| Row hover | `Surface/Subtle` background |
| Row selected | `Surface/Accent` background (`--selected`) |
| Action hover | `Surface/Accent` background, icon → `Interactive/Primary Hover` |
| Action focus | `Border/Focus` (Cyan/700) ring, outside the element — DDR-006 |
| Action disabled | `Text/Disabled` icon; `aria-disabled="true"` |

---

## Sizing

| Element | Dimensions | Notes |
|---|---|---|
| Header cell padding | 12px 16px | Medium weight labels |
| Body cell padding | 8px 16px | `spacing.component.sm` — compact clinical density |
| Row action button | 32×32px | `sr.touch.compact` — secondary action in a dense context |
| Row action icon | 20px | `sr.icon.size.sm` |

Corners are square (`radius.none`) — data grids are full-bleed.

Minimum touch target: the 32px compact action target is a documented exception for dense desktop data views (SINGLE-RECORD-DS-REFERENCE §Touch targets). On touch/mobile layouts, promote row actions to a full-size control or an overflow menu.

---

## Responsive behaviour

- **Form factor:** Responsive — one component; the `.sr-table-wrap` scroll container handles narrow viewports.

| Breakpoint | Behaviour |
|---|---|
| Mobile (≤767px) | Table scrolls horizontally inside `.sr-table-wrap`. Consider a card/stacked pattern for very wide tables. |
| Tablet (768–1023px) | Full table; horizontal scroll only if columns exceed width. |
| Desktop (≥1024px) | Full table, no scroll expected. |

---

## Accessibility

- Use semantic `<table>`, `<thead>`, `<tbody>`, `<th scope="col">`.
- The actions column header carries a visually-hidden "Actions" label (`.sr-visually-hidden`).
- Every icon-only row action **must** have an `aria-label` naming the action and its subject (e.g. "Edit Jones, Alis").
- Row-action icons are decorative (`aria-hidden`) — the accessible name comes from the button's `aria-label`.
- Colour is not the only signal: actions are distinguished by icon shape as well as colour.

---

## Engineering Notes

- Consumes `@dhcw/sr-tokens` CSS custom properties and `@dhcw/sr-icons` for glyphs.
- Icons use `stroke="currentColor"`, so setting the button's `color` colours the icon — this is how row actions become blue.
- Blazor / React wrappers should mirror this markup and the `sr-table__*` class contract.
- Sorting, filtering, and pagination are planned and not yet part of this reference (`/components/README.md`).

---

## Related

- `/components/button/spec.md` — row actions are icon-only buttons
- `/foundations/iconography/` — icon set and colour tokens
- `/components/pagination/` (planned) — list/table pagination
