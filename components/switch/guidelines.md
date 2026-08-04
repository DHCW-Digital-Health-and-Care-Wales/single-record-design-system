# Toggle switch

> A control that turns one setting on or off, taking effect immediately.

| | |
|---|---|
| **Type** | Component |
| **Status** | In review |
| **Reference** | `packages/web/src/switch/switch.css` · `packages/react/src/switch/Switch.jsx` |
| **Figma** | Toggle/Switch (`958:10576`), State=Default/Hover/Focus/Disabled × Checked=On/Off |
| **Last updated** | 2026-08 |

---

## When to use

- For a setting that takes effect **the moment it is changed**, with no Save
  step — a display preference, a notification, showing or hiding a panel.
- Where the two states are genuinely on and off, and the label can say what
  "on" means.

## When not to use

- **In a form that is submitted.** Use a Checkbox. A switch promises immediate
  effect; inside a form, nothing happens until Save, and the control has lied.
- For choosing between two named options ("Metric" / "Imperial"). Use the
  Segmented control — a switch cannot label its off state.
- For anything clinically consequential — an alert override, a consent flag.
  Those need an explicit confirmation, not a control the user can nudge.
- For more than two states. There is no indeterminate switch.

## How it works

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

## Do and don't

- **Do** label the thing being switched, not the action: "Show archived
  requests", not "Show/Hide".
- **Do** apply the change immediately, and show its effect on the same screen.
- **Don't** pair a switch with a Save button. That combination is the single
  most common misuse.
- **Don't** write the label as a question ("Show archived requests?"). A
  question implies an answer is being collected for later.
- **Don't** rely on colour alone to signal state — the thumb position and the
  label are what carry it in greyscale.

## Accessibility

- Rendered as `<button role="switch" aria-checked>`. The visible label is the
  accessible name; where there is no visible label, `aria-label` is required.
- Screen readers announce the label plus "on"/"off", and re-announce on change
  because `aria-checked` updates in place.
- Keyboard: `Tab` to reach, `Space` or `Enter` to toggle.
- The focus ring sits around the track, outside it, so it is never clipped
  (DDR-006).
- Target size: the track is 24px tall, below the 44px touch minimum on its own,
  so on touch layouts the whole label-and-track control must occupy a 44px
  high row.

## Content

- Sentence case, no terminal punctuation.
- The label states what happens when the switch is on.
