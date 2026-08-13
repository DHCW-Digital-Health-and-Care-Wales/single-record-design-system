# Radio

**Status:** In development
**Last updated:** 2026-08

---

## Purpose

Lets a user choose **exactly one** option from a short, visible set. Use a radio
group when the options are mutually exclusive and comparing them is part of the
decision; use [Checkbox](../checkbox/spec.md) when any number may be chosen,
[Select](../select/spec.md) past about seven options, and
[Toggle switch](../toggles/guidelines.md) when the control applies immediately
rather than on submit.

A radio group has no "none" state once answered. Where "no answer" is
meaningful, add it as an explicit option rather than relying on the initial
empty state.

Reference implementation: `packages/web/src/radio/radio.css` +
`packages/react/src/radio/`. Figma: Radios page `1419:14818` — set `915:30830`,
templates `1429:14959`, building blocks `1603:20137`.

---

## Variants

| Type | Left of the label | Selection shown by | Usage |
|---|---|---|---|
| `Simple` | 20px ring | Ring fills, white dot | The default. Ordinary form questions |
| `Card Radio` | 20px ring | Border becomes `Interactive/Primary` | Options needing a description |
| `Card` | 20px ring | Whole card fills `Interactive/Primary` | As above, where the choice dominates the screen |
| `Card Icon` | 24px icon | Whole card fills `Interactive/Primary` | Options with a recognisable icon |

Group options: `Orientation` vertical/horizontal · `Legend` shown/hidden ·
`Hint` shown/hidden · `Error` true/false · `Required` true/false. Matches the
Figma templates set `1429:14959`.

Types are not mixable within one group.

---

## Anatomy

```
Legend *                       ← group name + required marker
Hint text                      ← optional helper (Caption)
(!) Error message              ← optional validation (Caption + status/error-circle)
 ○  Option label               ← ring (20px) + gap (8px) + label (Body S)

┌─────────────────────────────┐
│ ○  Option label             │  ← card types: ring/icon + title + description
│    Description              │
└─────────────────────────────┘
```

- **Legend**: `Label` 14/20 Medium, a real `<legend>`.
- **Required marker**: inline `*` in `Status/Critical`, on the legend only.
  Decorative; pair with `aria-required`.
- **Ring**: 20×20, 2px border, `radius-full`. Draws a 10px dot when selected.
- **Label**: `Body S` 14/20 Regular, `Text/Primary`. Clickable.
- **Card title / description**: `Body S` over `Caption` 12/16
  `Text/Secondary`, both inverting to `Text/Inverse` on a filled selected card.
- **Card box**: 1px `Border/Default`, `radius-md`, `space-2`/`space-3` padding.

---

## States

| State | Visual behaviour |
|---|---|
| Default | `Surface/Small Cards` fill, `Border/Default` 2px ring |
| Hover | Ring becomes `Border/Strong`; on cards, the card border does |
| Focus | 3px `Border/Focus` (Cyan/700) outside the ring — or around the whole card on card types, since the card is the target |
| Checked | `Interactive/Primary` ring and fill, white dot |
| Error | `Interactive/Destructive` ring or card border; group gains a 2px left rule and `space-3` inset |
| Disabled | `Border/Disabled` border, `Text/Disabled` label; checked fill becomes `Interactive/Disabled` |

There is no error + disabled variant — it is not reachable in the flows this
system supports.

---

## Sizing

| Part | Dimensions |
|---|---|
| Ring | 20 × 20 px |
| Card icon | 24 × 24 px |
| Row | 20 px min-height; card 56 px |
| Gap, ring to label | 8 px (`space-2`) — 28 px total label offset |
| Gap, card edge to ring | 12 px (`space-3`) — 40 px total label offset, 44 px on `Card Icon` |

### Known deviation from Figma

Figma draws `Card Radio`'s ring at **16px** and every other type at 20px. Code
uses **20px throughout**, matching `Simple` and Checkbox. One control size
across the form is worth more than the 4px, and the Figma set should be
normalised rather than the code forked to match it. Recorded in `radio.css` and
in `guidelines.md` → Known gaps.

### Target size — how this meets WCAG 2.2

The 20px ring is below the 24×24 px minimum in **SC 2.5.8 Target Size (Minimum,
AA)**, so compliance rests on the criterion's **spacing exception**, exactly as
for Checkbox:

- Vertical groups: centres 28px apart (20px row + 8px gap) — greater than 24px. **Passes.**
- Horizontal groups: centres at least 36px apart (20px ring + 16px gap). **Passes.**
- The clickable label extends the target horizontally well beyond the ring.
- Card types are 56px tall and pass outright.

**This holds only while the documented spacing is used.** Tightening the
vertical options gap below 8px would break the exception and fail AA.

This does not meet SC 2.5.5 (Enhanced, AAA, 44×44). For touch-first contexts,
raise the row target to 44px or use a card type, which already clears it.

---

## Responsive behaviour

**Form-factor class: Responsive** (DDR-011) — tokens only, no separate variant.

| Breakpoint | Behaviour |
|---|---|
| Mobile | Horizontal groups wrap; switch to vertical below 480px. Cards go full-width |
| Tablet / Desktop | As specified |

Horizontal groups use `flex-wrap`, so they degrade by wrapping rather than
overflowing. Long option labels wrap under the label, not under the ring,
because the label is `inline-block` with left padding rather than a flex
sibling.

---

## Spacing

| Gap | Token |
|---|---|
| Legend → hint → error | `space-2` (8px) |
| Between vertical options | `space-2` (8px) |
| Between horizontal options | `space-4` (16px) |
| Error group left inset | `space-3` (12px), after a 2px rule |
| Card padding | `space-2` (8px) vertical, `space-3` (12px) horizontal |

---

## Accessibility

- Renders a **real `<input type="radio">`**, kept in the accessibility tree and
  the tab order. It is made transparent and laid over the drawn ring — never
  `display:none`, which would remove it from both.
- Options sharing a `name` are one group to the browser: **one Tab stop**, arrow
  keys to move between options. No custom key handling, so this is exactly
  native behaviour.
- Groups use `<fieldset>` / `<legend>` so the group name is announced with each
  option. `hideLegend` hides it visually only.
- Hint and error are linked with `aria-describedby`; the group carries
  `aria-invalid` and `aria-required` where applicable.
- The card icon is `aria-hidden` — the label already carries the name.
- Selection is never colour alone: the ring gains a dot, and a filled card
  inverts its whole surface.
- Error is never signalled by colour alone — the red border is always
  accompanied by the message and its icon (SC 1.4.1).

---

## Content Guidelines

- Option labels are sentence case and answer the legend's question.
- Do not repeat the legend in each option label.
- Legends name the decision — "Priority", not "Please select a priority".
- Card descriptions explain the **consequence** of the choice, not a restatement
  of the label.
- Error messages say what to do: "Select a priority".

---

## Engineering Notes

| Framework | Where |
|---|---|
| Web (HTML/CSS) | `packages/web/src/radio/radio.css` |
| React | `packages/react/src/radio/Radio.jsx`, `RadioGroup.jsx` |
| Blazor / MAUI | Not implemented yet |

The dot is drawn with CSS, not an icon asset, so it inherits token colours. The
card box is styled on the **label**, not the wrapper, so `input:checked +` still
reaches it with a sibling selector — which is also why nothing may be inserted
between the input and the label in the markup.

```html
<div class="sr-radio">
  <input class="sr-radio__input" type="radio" name="priority" id="p-routine">
  <label class="sr-radio__label" for="p-routine">Routine</label>
</div>

<div class="sr-radio sr-radio--card sr-radio--card-outline">
  <input class="sr-radio__input" type="radio" name="pathway" id="pw-2ww">
  <label class="sr-radio__label" for="pw-2ww">
    <span class="sr-radio__title">Two-week wait</span>
    <span class="sr-radio__description">Seen within 14 days of referral</span>
  </label>
</div>
```

---

## Do / Don't

| Do | Don't |
|---|---|
| Use a group with a legend for related options | Leave a set of related options without a group name |
| Add "Not known" as an explicit option where it is a real answer | Leave the group unanswered to mean "not known" |
| Put the required asterisk on the legend | Put an asterisk on every option |
| Keep the documented 8px vertical gap | Tighten it — it breaks the SC 2.5.8 spacing exception |
| Use one type per group | Mix card and simple options in one group |
| Use radios for a single choice from a short set | Use radios past about seven options — use Select |

---

## Related

- [`components/radio/guidelines.md`](./guidelines.md) — usage guidance
- [`components/form-fields.md`](../form-fields.md) — the cross-cutting form-field type scale and required-marker rule
- [`components/checkbox/spec.md`](../checkbox/spec.md) — structurally the twin of this component
- Figma: Radios `1419:14818` · Radio `915:30830` · Templates `1429:14959` · Building blocks `1603:20137`
