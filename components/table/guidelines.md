# Tables

> Show clinical or administrative data in rows and columns so staff can scan,
> compare and act on it — patient lists, results, appointments, audit logs.

| | |
|---|---|
| **Type** | Component |
| **Status** | In review |
| **Reference** | [`spec.md`](./spec.md) (full contract) · `packages/web/src/table/table.css` |
| **Figma** | Table component (`1363:22598`) |
| **Related standards** | UI Standards #16 (tables), #8 (abbreviations), #25 (dates) · [GDS Table](https://design-system.service.gov.uk/components/table/) · [NHS England Table](https://service-manual.nhs.uk/design-system/components/table) |
| **Last updated** | 2026-07 |

---

## When to use

- The data is genuinely tabular — rows are comparable across a shared set of columns (patient lists, results, appointments, audit logs).
- Staff need to scan down a column, sort, or compare rows.

## When not to use

- For a single record's fields (one entity, many attributes), use a description list or the summary pattern, not a table.
- For 2–5 mutually exclusive choices, use radios; for a long selectable list, use [Select](../select/spec.md). See UI Standards #18.
- For general table markup and layout guidance, follow [GDS](https://design-system.service.gov.uk/components/table/) / [NHS England](https://service-manual.nhs.uk/design-system/components/table) — this page covers only Single Record specifics.

## How it works

- **Row states are token-bound** — see the table below; never hardcode row backgrounds.
- **Compact clinical density** — body cells are `Body S` (14/20) at 8px padding, 40px tall. This is the DDR-015 primary-content minimum, justified for data-dense clinical views.
- **Square corners** — data grids are full-bleed (`radius.none`).
- **Row actions read as interactive** — icon-only actions render in `Interactive/Primary` (blue), destructive in `Interactive/Destructive` (red). See [`spec.md`](./spec.md#row-action-icon-colour).
- **Horizontal scroll, never page-break** — wide tables scroll inside `.sr-table-wrap`.

### Row states

| State | Token | Light | Dark |
|---|---|---|---|
| Default | `sr.color.surface.section-cards` | white | `blue.900` |
| Hover | `sr.color.surface.subtle` | `blue.50` | `navy.700` |
| Selected (`--selected`) | `sr.color.surface.accent` | `cyan.100` | `blue.900` |

Row dividers use `sr.color.border.subtle`. A selected row must also carry a non-colour signal (e.g. a persistent selection control or a left accent border) — colour is never the only indicator (WCAG 1.4.1).

## Options

| Option | Use when |
|---|---|
| Default | A plain data table with column headers only. |
| Selectable rows (`--selected`) | One row is the active/selected entity — e.g. the current patient. |
| `kebab-left` | A row has many actions or space is tight — the menu holds them. |
| `icons-left` | One or two frequent actions worth surfacing directly. |
| `row-headers` | Each row names an entity the columns describe (observation × time). |

Full layout matrix: [`spec.md`](./spec.md#layouts-sr-table-layout--storybook-layout-toggle).

## Do & don't

| Do | Don't |
|---|---|
| Use the row-state tokens above | Hardcode a hover or selected background |
| Keep cells compact (`Body S`, 8px padding) | Pad clinical tables so loosely they need scrolling |
| Give every icon-only action an `aria-label` naming action + subject | Rely on colour alone to mark a selected row |
| Use `No.` for "Number" in a tight column heading | Introduce other abbreviations with full stops (write `ECG`, not `E.C.G.`) |
| Show dates as `d Mmm yyyy` (e.g. `10 Mar 2026`) | Use ambiguous all-numeric formats (`06/12/21`) in tables |

## Accessibility

- Semantic `<table>`, `<thead>`, `<tbody>`, `<th scope="col">`; `<th scope="row">` for the `row-headers` layout.
- The actions-column header carries a visually-hidden "Actions" label.
- Every icon-only row action **must** have an `aria-label` naming the action and its subject (e.g. "Edit Jones, Alis"). Icons themselves are `aria-hidden`.
- Row action targets are 32×32px — a documented dense-desktop exception; promote to full-size controls on touch/mobile.
- Focus uses `Border/Focus` (Cyan/700, DDR-006), outside the element.

## Content

- **Abbreviations (UI Standards #8):** avoid abbreviations and never use full stops (`ECG`, not `E.C.G.`). **Table-heading exception:** `No.` is allowed for "Number" in a column heading where width is genuinely tight. This is the only sanctioned abbreviation-with-full-stop, and only in headings.
- **Dates (UI Standards #25, adapted):** use the short form `d Mmm yyyy` (e.g. `10 Mar 2026`) in tables and anywhere else width is constrained; use the long form `10 March 2026` in prose and where there is room. An abbreviated or full month name (never a digit) is what resolves day/month ambiguity for clinical safety. This **adapts** the legacy `dd-Mmm-yyyy` format, which used hyphens; the ambiguity protection is unchanged.
- **Names (UI Standards #6):** `SURNAME, First M` in list/table columns.
- Sentence case for all cell content and headings (UI Standards #5). Follow the [DHCW terminology table](../../docs/reference/dhcw-ui-standards-v1.3.md#page-67).

## Frameworks

| Framework | Status | Where |
|---|---|---|
| Web (HTML/CSS) | Reference baseline | `packages/web/src/table/table.css`, `.sr-table__*` classes |
| React | Current | mirrors the `sr-table__*` markup |
| Blazor / .NET | Current | mirrors the `sr-table__*` markup via the RCL |
| .NET MAUI | Current | Blazor component via Blazor Hybrid (DDR-011) |
| Legacy (.NET 4.8 / Delphi) | Tokens only / best-effort | token CSS custom properties |

> Sorting, filtering and pagination are planned and not yet part of the reference — see [`/components/README.md`](../README.md).

## Clinical / DHCW notes

The legacy DHCW UI Standards define two table modes ([p.15–16](../../docs/reference/dhcw-ui-standards-v1.3.md#page-15)): option 1 (attributed rows, burger menu, reorder) and option 2 (in-situ, multi-entry). These map onto the `kebab-left` layout and the selectable-row / editable patterns respectively — carried forward, re-expressed against the token system. Chronology defaults to oldest-first with sortable columns (UI Standards #12).

## Related

- [`spec.md`](./spec.md) — full component contract and anatomy
- [Select](../select/spec.md) · [Tags](../tags/spec.md) (status badges in cells) · [Button](../button/spec.md) (row actions)
- [DDR-015](../../decisions/DDR-015-primary-content-min-14px.md) — 14px primary-content minimum · [DDR-006](../../decisions/DDR-006-focus-ring-cyan.md) — focus ring
- [GDS Table](https://design-system.service.gov.uk/components/table/) · [NHS England Table](https://service-manual.nhs.uk/design-system/components/table)
