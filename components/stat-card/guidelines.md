# Stat card

> One number with its name on it — how many patients, how many casenotes, how
> many are late — so staff can see the size of something before opening it.

| | |
|---|---|
| **Type** | Component |
| **Status** | In review |
| **Reference** | [spec.md](spec.md) · `packages/web/src/stat-card/stat-card.css` |
| **Figma** | Stat Card (`431:11996`) on page `1517:15118` |
| **Related standards** | GOV.UK "Big number" · NHS England card patterns · WCAG 2.2 AA |
| **Last updated** | 2026-09 |

---

## When to use

- At the top of a dashboard or a worklist, summarising what is below it. Four
  cards in a row is the shape every product has reached for so far.
- Where a number answers a question staff ask before they start work: how many
  are waiting, how many are overdue, how many came in today.
- Where the number is worth seeing even when nobody acts on it. A stat card is a
  reading, not a task.

## When not to use

- **As a button.** The card has no role, no focus and no hover, and it is not
  going to get them. If tapping the number should open the list behind it, put a
  Link under the card, or build the whole tile as a Button — then it is a
  button, with a button's focus ring and a button's accessible name.
- **For a value inside a record.** A patient's weight or a result value is a
  field in the record, not a dashboard tile. Use a Table row or a description
  list.
- **For a status.** A stat card counts; it does not say what state something is
  in. Use a Tag, or the Status indicator.
- **For more than one number.** Two figures in one card means neither is the
  subject. Use two cards.
- **For a trend over time.** A single delta against one previous period is the
  most this carries. A series needs a chart.

## How it works

- **Label, value, and at most one supporting line.** The supporting line is the
  period ("This month"), a qualifier ("In all sites"), or a change against the
  previous period. Never two of them.
- **The number is the subject.** The value is Heading M and the label is Label
  style above it, so the card is scanned by its number and read by its label.
- **The icon is decoration.** It repeats what the label already says, so it is
  hidden from assistive technology. A card with no obvious icon is better than a
  card with a vague one.
- **The accent bar is emphasis, not status on its own.** A 4px bar that turns
  amber is a meaning carried in colour alone, which SC 1.4.1 rules out. Use the
  accent to reinforce something the supporting line already says in words —
  "Pending receipt", "Requires attention" — and the card still reads correctly
  in greyscale, on a projector, and to someone who cannot separate the two.
- **Figures are tabular.** A column of cards lines up on the digits.

## Options

| Layout | Use when |
|---|---|
| Stacked (default) | The normal card. Label, value, optional supporting line |
| Value first | A row read as numbers rather than as sentences |
| Inline | A compact strip above a table, where a full card would crowd it |

### Accent

| Accent | Use when |
|---|---|
| Primary | The default. The row reads as one group |
| None | The card sits among other cards that are not stats |
| Warning · Critical | The supporting line already names the problem in words |

## Do & don't

| Do | Don't |
|---|---|
| Name what the number counts — "Casenotes in transit" | Label it with a system term — "CN_TRANSIT" |
| Keep the supporting line to one line | Wrap a sentence under the number |
| Put the sign in the delta — "-5%" | Rely on red and green to say which way it moved |
| Use one accent per meaning across a screen | Give every card a different colour because the row looks flat |
| Round to what staff can act on — "1,240" | Show a precision nobody uses — "1,240.00" |
| Say what the number is of, when it is not obvious — "In all sites" | Leave the period unstated and let people assume today |

## Accessibility

- The card is a plain region with no role. Nothing in it is focusable, so
  nothing in it can be a keyboard trap or a focus stop that leads nowhere.
- Reading order is label, value, supporting line — in the DOM in that order.
  The value-first layout reorders visually only, so a screen reader still hears
  what the number is before it hears the number.
- The icon is `aria-hidden`. The label carries the name.
- The delta's sign is part of its text, so the direction survives greyscale and
  survives a screen reader that announces no colour.
- Every text colour clears 4.5:1 on the card surface in **both** light and dark.
  The delta is a small tinted chip rather than coloured text because the status
  colours are pinned to their light-mode step — as bare text on the dark card
  surface they fall to around 2:1, and on their own status surface they pass.
- Nothing has a fixed height, so the card grows at 200% zoom and the row wraps
  rather than clipping.

## Content

- Sentence case. No full stop on the label or the supporting line.
- Use the word staff use for the thing being counted, not the table it lives in.
- A delta needs its period: "-5% on last month", not "-5%".
- Zero is a real answer and should render as `0`, not as an empty card or a dash.

## Clinical / DHCW notes

- A count on a dashboard is a prompt to look, never the record. Nothing
  clinically safety-critical should rest on a figure staff cannot click through
  to the list behind it.
- Where a card counts something overdue, the supporting line should say what
  "overdue" means for that service — the threshold differs between sites, and
  a number without its rule invites the wrong comparison.

## Related

- [Tags](../tags/guidelines.md) — for state, which a stat card does not carry
- [Table](../table/guidelines.md) — the list a stat card usually summarises
- DDR-031 — component or pattern, and why five `Type` variants became three layouts
