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

A two-column grid: content on the left, the icon pinned to the top of the right.

```
┌─────────────────────────────┐
│  Referrals           (icon) │  row 1   .sr-stat-card__label
│  240                        │  row 2   .sr-stat-card__value
│  -5% on last month          │  row 3   .sr-stat-card__support (+ __delta)
└─────────────────────────────┘
 ▲ optional 4px accent bar
```

| Part | Class | Required | Notes |
|---|---|---|---|
| Card | `.sr-stat-card` | yes | Section-card surface, `--radius-md`, `--elevation-raised`, 16px inset |
| Accent bar | `--accent-primary` \| `--accent-warning` \| `--accent-critical` | no | 4px left border, **opt-in**. Always in the box, transparent when absent, and the left padding is short by its width, so an accented and a plain card are the same size and inset their text alike |
| Label | `.sr-stat-card__label` | yes | Label style, `Text/Primary`. Column 1, row 1 |
| Value | `.sr-stat-card__value` | yes | Heading M, `Text/Primary`, tabular figures. Column 1, row 2 |
| Supporting line | `.sr-stat-card__support` | no | Caption, `Text/Secondary`. One line only. Column 1, row 3 |
| Delta | `.sr-stat-card__delta--up` \| `--down` \| `--neutral` | no | Sits inside the supporting line, as a tinted chip |
| Icon | `.sr-stat-card__icon` | no | 20×20, `Text/Secondary`, decorative and `aria-hidden`. Column 2, row 1, `align-self: start` |

**The icon is a child of the card, not of the label.** It was briefly inside a
`__head` row with the label, which meant the value-first layout carried it down
the card. Rows are explicit for the same reason: a layout modifier moves the
text without moving the icon.

## Layouts

Three, replacing the five `Type` values the Figma set enumerates. DDR-031 has
the mapping and the reasoning.

| Layout | Class | Figma `Type` | Use when |
|---|---|---|---|
| Stacked | *(default)* | `Title Top`, `Title_Hint`, `Trend` | The default. Label, value, optional supporting line |
| Value first | `.sr-stat-card--value-first` | `Count Top` | A row scanned as numbers rather than read as sentences |
| Inline | `.sr-stat-card--inline` | `Single line` | Tight space: a strip above a table, a toolbar, a phone screen |

`Title Top`, `Title_Hint` and `Trend` are one layout with nothing, a supporting
line, and a supporting line carrying a delta. They are not three types.

**Inline is the short card by contract**, roughly 40px against the stacked
card's hundred: Heading S, 8/12 padding, value first, no icon. It carries
`align-self: start` so a grid row cannot stretch it to a stacked neighbour's
height — short in its own markup but not on the page is not short.

## Row

`.sr-stat-cards` is an `auto-fit` grid, `minmax(180px, 1fr)`, `--space-4` gap.
`.sr-stat-cards--inline` is the wrapping flex strip the inline layout wants,
where cards size to their content instead of sharing the width equally. Both
ship with the component because every use so far has been a row of them, and a
grid re-written per screen is a grid that drifts.

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
| `accent` | `'none'` \| `'primary'` \| `'warning'` \| `'critical'` | `'none'` | Opt-in. A row where every card is emphasised has emphasised nothing |

`StatCards` wraps a row; `StatCards inline` wraps a strip of inline cards.

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
| Reading order | Label, value, support — in the DOM in that order in every layout. `value-first` and `inline` reposition with explicit grid rows and columns, so a screen reader still hears what the number is before it hears the number |
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
