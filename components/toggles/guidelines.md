# Toggles

> Two controls with one job between them: change what is on, or change which
> one. The Figma set groups them, so this page does too.

| | |
|---|---|
| **Type** | Component family (two components) |
| **Status** | In review |
| **Reference** | `packages/web/src/switch/switch.css` · `packages/react/src/switch/Switch.jsx` · `packages/web/src/segmented-control/segmented-control.css` · `packages/react/src/segmented-control/SegmentedControl.jsx` |
| **Figma** | Toggles (`1414:16858`) — Toggle/Switch (`958:10576`), Toggle/Segmented Control (`2752:40`, `2770:55996`) |
| **Last updated** | 2026-08 |

---

## Which one

| | Switch | Segmented control |
|---|---|---|
| **Answers** | Is this on? | Which of these? |
| **Options** | Two, and one of them has no label | Two to four, every one labelled |
| **Off state** | Implied by the label being off | Named, like every other option |
| **Use for** | A preference, a filter, showing or hiding | A mode or a view — Quick search / Advanced |

Both take effect immediately. Neither belongs in a form that is submitted —
there, use a Checkbox or a Radio group, which wait for Save.

---

## Type: Switch

### When to use

- For a setting that takes effect **the moment it is changed**, with no Save
  step — a display preference, a notification, showing or hiding a panel.
- Where the two states are genuinely on and off, and the label can say what
  "on" means.

### When not to use

- **In a form that is submitted.** Use a Checkbox. A switch promises immediate
  effect; inside a form nothing happens until Save, and the control has lied.
- For choosing between two named options ("Metric" / "Imperial"). Use the
  segmented control below — a switch cannot label its off state.
- For anything clinically consequential — an alert override, a consent flag.
  Those need an explicit confirmation, not a control the user can nudge.
- For more than two states. There is no indeterminate switch.

### How it works

- 44×24 track, 20px thumb with a 2px inset, so the thumb travels 20px between
  the two ends.
- Off is `Border/Default`; on is `Interactive/Primary`. The thumb stays white
  in both, so the position of the thumb — not just the colour — carries the
  state.
- Controlled (`checked` + `onChange`) or uncontrolled (`defaultChecked`).
- The visible label sits to the right of the track and is part of the control:
  clicking the label toggles it.
- Disabled dims the track and the label together. A disabled switch still
  announces its state, because "off and unavailable" is different from "off".

---

## Type: Segmented control

### When to use

- To switch between two to four mutually exclusive **views or modes** of the
  same screen — Quick search / Advanced, All / Sent / Received.
- Where all the options fit on one line without truncating, and the user
  benefits from seeing every option at once.

### When not to use

- For more than four options, or options whose labels do not fit. Use a Select.
- To *submit* a choice. It changes the view; it does not collect an answer.
- As tabs for genuinely separate pages. Tabs and a segmented control look
  similar and mean different things: the segments re-filter one screen.

### How it works

- A 4px-padded track (`Surface/Subtle`, 8px radius, 1px border) holding
  segments with a 4px radius.
- The selected segment is a filled `Interactive/Primary` with inverse text; the
  rest are transparent with `Text/Secondary`.
- Hovering an unselected segment gives it an `Info Blue/50` wash and brand-blue
  text — a preview of selection, not selection itself.
- Disabled selected is a muted outline, not a faded blue fill: a greyed blue
  still reads as "on and available".
- Exactly one segment is selected at all times. There is no empty state.

---

## Do and don't

- **Do** label a switch with the thing being switched, not the action: "Show
  archived requests", not "Show/Hide".
- **Do** keep segmented-control labels to one or two words, parallel in form —
  all nouns or all verbs.
- **Do** apply the change immediately, in both, and show its effect on the same
  screen.
- **Don't** pair either with a Save button. That combination is the single most
  common misuse.
- **Don't** write a switch label as a question ("Show archived requests?"). A
  question implies an answer is being collected for later.
- **Don't** rely on colour alone — the thumb position, and the segment's fill
  plus its position in the track, are what carry state in greyscale.

## Accessibility

- **Switch** is `<button role="switch" aria-checked>`. The visible label is the
  accessible name; where none is shown, `aria-label` is required.
- **Segmented control** is a set of buttons with `aria-pressed` inside a
  `role="group"`. Where the options are views of one screen, `role="tablist"`
  with arrow-key navigation is also correct — pick one and be consistent
  within a product.
- Both announce their state on change, because the ARIA attribute updates in
  place rather than the element being replaced.
- Keyboard: `Tab` to reach, `Space` or `Enter` to activate. A tablist
  implementation adds arrow keys between segments.
- Focus rings are the SR cyan ring, outside the control so they are never
  clipped (DDR-006).
- Target size: the switch track is 24px tall and a segment is 36px, both below
  the 44px touch minimum on their own — touch layouts give the whole control a
  44px row.

## Content

- Sentence case, no terminal punctuation, in both.
- A switch label states what happens when it is on.
- Segment labels name the view they show, not the act of showing it.
