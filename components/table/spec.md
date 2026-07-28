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
| Selection column | Leading checkbox column for bulk actions (`.sr-table__select`) |
| Sortable columns | Header carries `aria-sort`; the label becomes a button (`.sr-table__sort`) |
| Sticky header | Opt-in `.sr-table--sticky-head` for long scrolling lists |

### Layouts (`.sr-table--{layout}` — Storybook "layout" toggle)

| Layout | Usage |
|---|---|
| `plain` | Column headers only, no row actions |
| `kebab-left` | Leading column of kebab (`nav/menu2`) row-menu buttons — matches the Figma default (1363:22598) |
| `icons-left` | Leading column of direct row-action icon buttons (view / edit) |
| `row-headers` | Column headers on top **and** a `<th scope="row">` header cell down the left edge |

Pick `kebab-left` when a row has many actions or space is tight (the menu holds
them); `icons-left` when there are one or two frequent actions worth surfacing
directly. `row-headers` suits matrices where each row names an entity that the
columns describe (e.g. observation type × time).

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
- **`.sr-table__head`**: Column headers — `Label` type (Roboto Medium 14/20, letter-spacing wide 0.3px), `Info Blue/50` fill, `Text/Primary`, `<th scope="col">`, 36px tall.
- **`.sr-table__row` / `.sr-table__cell`**: Body rows and cells — `Body S` (Roboto Regular 14/20), `Text/Secondary`, 8px padding, 40px tall. Row dividers use `Border/Subtle`.
- **`.sr-table__rowhead`**: Left row-header cell (`row-headers` layout) — styled like a header (`Info Blue/50`, Label type).
- **`.sr-table__actions` / `.sr-table__action`**: Leading (or trailing, via `--trailing`) cell holding row-level icon-only buttons / the kebab menu.

---

## Selection and sorting

Both are built from the Figma building blocks (`1122:14469`): `Row - Check` for
the selection cell and `Sortable header` for the sort affordance.

### Selection column

- 36px wide (`space-2` padding either side of a 20px box), matching `Row - Check`.
- Uses the [Checkbox](../checkbox/spec.md) component with the `--bare` modifier so
  the box carries no visible label.
- **Every selection checkbox must be named** with `aria-label` on the input —
  "Select General notes vol 2 at Cleddau Ward-GGH", not "Select row 3". Where a
  column value repeats across rows, include a second value to keep names unique.
- The header checkbox is a select-all. It shows `indeterminate` when some but not
  all rows are selected; the browser exposes that as `aria-checked="mixed"`.

### Sortable columns

- The `<th>` carries `aria-sort` (`ascending` / `descending` / `none`); the label
  becomes a `<button>` so the control is reachable and named without making the
  whole cell interactive.
- Indicator icons come from the existing set: `nav/sort` when unsorted,
  `nav/chevron-up` / `nav/chevron-down` when applied. **The Figma designs only the
  neutral two-triangle state** — the directional states are an extension, since
  `aria-sort` announces a direction that must also be visible. Flagged for review.
- Sorting is **controlled**: the component reports intent and renders state, it
  never reorders rows itself. This keeps it usable for server-side sorting and
  paging where the full dataset is not in the component.

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
| Header row | 36px, 8px padding | `Label` type, `Info Blue/50` fill |
| Body cell | 40px, 8px padding | `Body S`, compact clinical density |
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
- React wrapper: `packages/react/src/table/Table.jsx`. Declarative `columns` / `rows`
  API; selection and sorting are controlled by the caller. Row actions default to a
  **leading** column (`rowActionsPosition="leading"`), matching the Figma `kebab-left`
  default; pass `"trailing"` for a trailing column.
- A `<caption>` is styled (left-aligned, Label type) rather than left at the browser
  default. Where the surrounding page already names the table, keep the caption and
  hide it with `.sr-visually-hidden` rather than omitting it.
- Filtering and pagination remain planned and are not part of this reference.

---

## Related

- `/components/button/spec.md` — row actions are icon-only buttons
- `/foundations/iconography/` — icon set and colour tokens
- `/components/pagination/` (planned) — list/table pagination
