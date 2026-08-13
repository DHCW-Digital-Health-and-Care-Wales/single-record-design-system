# Radio

> A single choice from a short list, with every option visible at once.

| | |
|---|---|
| **Type** | Component |
| **Status** | In review |
| **Reference** | `components/radio/spec.md` · `packages/web/src/radio/radio.css` · `packages/react/src/radio/Radio.jsx` |
| **Figma** | Radios (`1419:14818`) — Radio (`915:30830`), Radio/Templates (`1429:14959`), Radio/Building blocks (`1603:20137`) |
| **Related standards** | `components/form-fields.md` · GDS "Radios" · NHS England "Radios" |
| **Last updated** | 2026-08 |

---

## When to use

- **Exactly one answer, from two to about seven options**, where seeing all the
  options is part of the decision.
- Where the options need comparing against one another — priority, pathway,
  reason for referral.
- Where an option needs a line of explanation. That is what the card types are
  for.

## When not to use

- **More than about seven options.** Use a [Select](../select/guidelines.md).
  Past seven, a radio group is a wall rather than a comparison.
- **Any number of answers, including none.** Use a
  [Checkbox group](../checkbox/guidelines.md).
- **A yes/no that takes effect immediately.** Use a
  [Switch](../toggles/guidelines.md).
- **Two named options that switch a view.** Use a
  [segmented control](../toggles/guidelines.md) — it reads as a control, not as
  a question waiting to be answered.
- Where the user must be able to *undo* their answer back to nothing. A radio
  group cannot be un-answered once a choice is made; if "no answer" is
  meaningful, make it an explicit option ("Not known") rather than relying on
  the empty state.

## Types

| Type | Left of the label | Selection shown by | Use for |
|---|---|---|---|
| `Simple` | 20px ring | The ring fills | The default. Any ordinary form question |
| `Card Radio` | 20px ring | The card border turns navy | Options that each need a description |
| `Card` | 20px ring | The whole card fills navy | The same, where the choice is the main thing on the screen |
| `Card Icon` | 24px icon | The whole card fills navy | Options with a recognisable icon — a pathway, a record type |

Do not mix types within one group. A group of cards next to a group of simple
radios on the same screen is fine; a group that is half each is not.

## How it works

- **20px ring, 28px label offset.** The same measurements as Checkbox, so a
  form mixing the two lines up. The ring is round and the checkbox is square —
  that shape difference is the only cue that one is single-select, so never
  restyle it.
- **Group anatomy.** `fieldset` → legend → hint → error → options. Options share
  a `name`; that shared name is what makes them one choice.
- **Vertical by default.** Horizontal is only for two or three short options,
  and it wraps rather than overflows.
- **No default selection unless there is a genuine default.** Pre-selecting the
  first option to avoid an empty state records an answer the user never gave.
- **Card types carry a description.** One line, sentence case, explaining the
  consequence of the choice — not a restatement of the label.
- **Selected cards invert.** On `Card` and `Card Icon` the label, description
  and dot all go white together, so the card reads as one selected object
  rather than a box with a highlight.
- **Error sits on the group.** One message above the options with a red rule
  down the left, never a message per option.

## Do & don't

| Do | Don't |
|---|---|
| Give every option a label that answers the legend's question | Rely on the legend to complete a half-written label |
| Offer "Not known" explicitly when it is a real answer | Leave the group unanswered as a way of meaning "not known" |
| Keep option order stable between visits | Re-order by recency, so the same answer moves |
| Use one type per group | Mix card and simple options in one group |
| Let a long label wrap | Truncate a label with an ellipsis |

## Accessibility

- Native `<input type="radio">`. Arrow-key roving focus, Space, and form
  participation are the browser's behaviour, not reimplemented — which is also
  why a radio group takes one Tab stop, not one per option.
- The legend is the group's accessible name. `hideLegend` hides it visually
  only; it stays in the markup.
- The card types keep the same input and label. The icon is decorative and
  hidden from assistive technology, because the label already carries the name.
- Focus on a card is drawn around the whole card, because the card is the
  target. On a simple radio it is drawn on the ring.
- Selection is never colour alone: the ring fills *and* takes a dot; a selected
  card inverts its whole surface.
- Disabled uses the native attribute, so the option leaves the tab order.

## Known gaps

- No Blazor implementation yet.
- Figma draws `Card Radio`'s ring at 16px and the other card types at 20px.
  Code uses 20px throughout, matching `Simple` and Checkbox. **The Figma set
  should be normalised to 20px** — the deviation is recorded in `radio.css`.
- `Card Icon` has no guidance yet on which icons are appropriate; the Figma
  variant uses `clinical/diagnosis` as a placeholder.
