# Stat card — specification

> One number, named. The unit a dashboard summary row is built from.

| | |
|---|---|
| **Type** | Component |
| **Status** | In review |
| **Reference** | `packages/web/src/stat-card/stat-card.css` · `packages/react/src/stat-card/StatCard.jsx` |
| **Figma** | Stat Card (`431:11996`) on page `1517:15118` |
| **Decision** | DDR-031 |
| **Last updated** | 2026-09 |

---

## Anatomy

```
┌─────────────────────────────┐
│▌ Referrals            (icon)│  .sr-stat-card__head
│▌                            │    .sr-stat-card__label
│▌ 240                        │  .sr-stat-card__value
│▌ -5% on last month          │  .sr-stat-card__support (+ __delta)
└─────────────────────────────┘
 ▲ .sr-stat-card, border-left 4px
```

| Part | Class | Required | Notes |
|---|---|---|---|
| Card | `.sr-stat-card` | yes | Section-card surface, `--radius-md`, `--elevation-raised`, 16px padding |
| Accent bar | `--accent` \| `--accent-warning` \| `--accent-critical` | no | 4px left border. **Always in the box**, transparent when absent, so cards in a row align |
| Head | `.sr-stat-card__head` | yes | Label and icon, `space-between` |
| Label | `.sr-stat-card__label` | yes | Label style, `Interactive/Primary` |
| Icon | `.sr-stat-card__icon` | no | 20×20, `Text/Secondary`, decorative and `aria-hidden` |
| Value | `.sr-stat-card__value` | yes | Heading M, `Text/Primary`, tabular figures |
| Supporting line | `.sr-stat-card__support` | no | Caption, `Text/Secondary`. One line only |
| Delta | `.sr-stat-card__delta--up` \| `--down` \| `--neutral` | no | Sits inside the supporting line |

## Layouts

Three, replacing the five `Type` values the Figma set enumerates. DDR-031 has
the mapping and the reasoning.

| Layout | Class | Figma `Type` | Use when |
|---|---|---|---|
| Stacked | *(default)* | `Title Top`, `Title_Hint`, `Trend` | The default. Label, value, optional supporting line |
| Value first | `.sr-stat-card--value-first` | `Count Top` | A row scanned as numbers rather than read as sentences |
| Inline | `.sr-stat-card--inline` | `Single line` | A compact strip above a table. Heading S, no icon |

`Title Top`, `Title_Hint` and `Trend` are one layout with nothing, a supporting
line, and a supporting line carrying a delta. They are not three types.

## Row

`.sr-stat-cards` is an `auto-fit` grid, `minmax(180px, 1fr)`, `--space-4` gap.
Shipped with the component because every use so far has been a row of them, and
a grid re-written per screen is a grid that drifts.

## React API

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | string | — | Required |
| `value` | string \| number | — | Required |
| `icon` | string | — | Icon name. Ignored when `layout="inline"` |
| `support` | node | — | The supporting line |
| `delta` | string | — | A signed change, `"+10%"` / `"-5%"` |
| `deltaTone` | `'up'` \| `'down'` \| `'neutral'` | sign of `delta` | Override for a fall that is good news, or a rise that is not |
| `layout` | `'stacked'` \| `'value-first'` \| `'inline'` | `'stacked'` | |
| `accent` | `'none'` \| `'primary'` \| `'warning'` \| `'critical'` | `'primary'` | |

`StatCards` wraps a row.

## States

**None.** The card is not interactive: no role, no handler, no hover, no focus.
A number that opens something takes a Link beneath it or becomes a Button tile —
a `div` with a click handler is neither, and this component will not grow into
one.

## Accessibility

| Requirement | How it is met |
|---|---|
| SC 1.4.1 Use of Colour | The accent and the delta colour are both second signals. The delta carries its sign in the text; a warning or critical card must also say so in the supporting line |
| SC 1.4.3 Contrast | Label `Interactive/Primary` 8.04:1, value `Text/Primary`, support `Text/Secondary` — all on `Surface/Section Cards`. Delta uses `status/success` and `status/critical`, both raised to the 700 step for AA on light |
| SC 1.4.11 Non-text Contrast | Nothing here is a control boundary. The accent bar is decoration and is exempt |
| SC 1.4.4 Resize | No fixed heights. The card grows with its text; the row wraps |
| Reading order | Label, value, support — in the DOM in that order. `value-first` reorders visually with `order`, so a screen reader still hears the label first |
| Icon | `aria-hidden`. The label already names the number |

## Known gaps

- **No Blazor implementation.** The CSS contract is stable enough to wrap.
- **No MAUI implementation.** MAUI ships a token and style layer, not a parallel
  component library (DDR-021); a stat card there is a `Border` + `Grid` built on
  `Styles.xaml`.
- **The Figma set has not been restructured.** DDR-031 records the target shape;
  `Type` still enumerates five values and `Border` still means the accent bar.
  Renaming a property detaches live instances, so it needs a deliberate pass
  rather than a drive-by rename.
- **No `neutral` delta in Figma.** Code has it; the set draws up and down only.
