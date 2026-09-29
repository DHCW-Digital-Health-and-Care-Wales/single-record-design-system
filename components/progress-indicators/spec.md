# Progress Indicators

**Status:** Built (web, React) 2026-09-29. Figma — 5 component sets on page `1736:12775`; composed samples in section `5529:44147`.
**Last updated:** 2026-09-29
**Guidelines:** [guidelines.md](guidelines.md)

| Component | Node | Purpose |
|---|---|---|
| Progress Bar | `1746:37`   | Single-process completion |
| Stepper Step | `1746:92`   | Atomic step for horizontal numbered stepper |
| Stepper Tab  | `1746:106`  | Compact stepper for a flow under a tab bar — **not a Tabs variant** (DDR-036) |
| Vertical Step | `1747:76`  | Atomic step for vertical stepper |
| Timeline Item | `1747:149` | Chronological clinical event |

---

## Choosing between them

| If you need to show… | Use |
|---|---|
| A single process finishing (form completion, upload, save) | **Progress Bar** |
| A user moving through a fixed sequence of stages | **Stepper Step** (horizontal) or **Vertical Step** |
| A stepper that has to coexist with a tab bar | **Stepper Tab** |
| What has happened over time (clinical events, audit trail) | **Timeline Item** |

Steppers describe a journey the user is on — they're navigable, with a fixed sequence. Timelines describe history — they're read-only, anchored to timestamps.

---

## Progress Bar

Variants: **Determinate · Segmented · Indeterminate**

| Variant | Use |
|---|---|
| Determinate | Known progress, shown as labelled % (e.g. form completion) |
| Segmented | N of M discrete sections done (e.g. 3 of 5 form sections). Each segment is `Status/Success`, the current one is `Interactive/Primary`, remaining are `Border/Default`. |
| Indeterminate | Duration unknown — show with an animated fill in implementation. The Figma representation is a static snapshot of the moving fill. |

Track: 8px tall, `Border/Default`, `Radius/4`. Fill: `Interactive/Primary`. Optional leading caption (`Body S`, `Text/Secondary`) and trailing label (`Label`, `Text/Primary`).

---

## Stepper Step (horizontal)

Variants: `State` × `Last`.

| State | Marker | Connector |
|---|---|---|
| Done | Filled `Status/Success` circle, white `Icon/action/check` (16px) | `Status/Success` line to next step |
| Current | Filled `Interactive/Primary` circle, white number, soft outer halo (`spread: 4`, 20% Primary) | `Border/Default` line |
| Error | Filled `Status/Error` circle, white `Icon/status/warning` (16px). Optional sub-text in `Status/Error` (e.g. "2 fields missing"). | `Border/Default` line |
| Upcoming | White circle, 2px `Border/Default` ring, grey number | `Border/Default` line |

`Last=True` hides the trailing connector — use for the final step.

Label is `Caption`. `Current` and `Error` use Medium weight + matching colour.

### Composition example

Place 6 instances side-by-side in a horizontal autolayout with equal `layoutGrow=1`. The connector inside each step bridges to the next; setting `Last=True` on the final instance suppresses its connector.

---

## Stepper Tab

Variants: **Done · Current · Upcoming**

**It is a stepper, not a tab (DDR-036).** It looks like a tab strip and is built
as an `<ol>` with `aria-current="step"`, never as `role="tablist"`. A tab
switches views and carries no completion state; a stepper reports position in
a sequence. In code it is `Stepper layout="compact"` / `.sr-stepper--compact`.

Compact: padding 12 / 18, 1px bottom border `Border/Default`. Current adds a 3px bottom border in `Interactive/Primary`. Marker is 16px — green filled check for Done, ringed number for Current/Upcoming.

Use when the stepper has to sit inside or alongside a tab bar — keeps visual weight low.

---

## Vertical Step

Variants: `State` (Done · Current · Upcoming) × `Last` (True/False).

Same marker visuals as the horizontal stepper. Connector is a 2px vertical line below each marker. Body has Medium-weight title + Caption description.

Use for narrow side panels, long-form wizards, or when more descriptive text per step is needed than a horizontal layout allows.

---

## Timeline Item

Variants: `State` (Complete · Current · Alert · Pending) × `Last` (True/False).

| State | Dot |
|---|---|
| Complete | Filled `Status/Success` |
| Current | Filled `Interactive/Primary` |
| Alert | Filled `Status/Error`, title also coloured |
| Pending | White fill, 1.5px `Border/Default` ring |

Each item: leading 56px time column (`Caption`, `Text/Secondary`), 2px connector line, dot, then body with title + description + optional rounded tag.

Tag surfaces:
- Complete → `Status/Success Surface` / `Status/Success`
- Current → `Surface/Subtle` / `Interactive/Primary`
- Alert → `Status/Error Surface` / `Status/Error`

---

## Icons used

| Where | Icon | Node |
|---|---|---|
| Done step / tab tick | `Status indicator/success` (disc + `Icon/action/check`) | `2000:4287` |
| Error step | `Status indicator/error` (disc + exclamation) | via `Progress/Indicators` `2000:4687` |

Figma instances the shared Status indicator for both — the earlier note naming
`Icon/status/warning` for the error step is out of date. Code does the same:
`StatusIndicator` in React, `.sr-status-indicator` in HTML, sized by the
marker.

---

## Accessibility

- **Steppers**: render as `<ol>` with each step as `<li>`. Current step carries `aria-current="step"`. Error step pairs the alert icon with a text description ("2 fields missing") — never colour alone.
- **Progress Bar**: `role="progressbar"` with `aria-valuemin`, `aria-valuemax`, `aria-valuenow`. Indeterminate omits `aria-valuenow` and sets `aria-busy="true"`.
- **Segmented**: announce as "Section 3 of 5 complete" via `aria-label` on the wrapping element.
- **Timeline**: `<ol>` with timestamps as `<time datetime="…">`. Alert items: pair the red dot with `Icon/status/warning` text and a descriptive `aria-label`.
- All status colours used here meet WCAG 1.4.11 against `Surface/Small Cards` (white): `Status/Success` 4.7:1, `Status/Error` 4.9:1, `Interactive/Primary` 7.5:1.

---

## Code

| | |
|---|---|
| CSS | `packages/web/src/progress-indicators/progress-indicators.css` — `.sr-progress`, `.sr-stepper` (`--vertical`, `--compact`), `.sr-timeline` |
| React | `ProgressBar`, `Stepper`, `Timeline` from `@dhcw/sr-react` |
| Blazor | Stylesheet only — write the markup with the classes |
| MAUI | **Not built.** No XAML styles yet |
| Website | `components/progress-indicators.html` |

### Where code departs from Figma, and why

| Figma | Code | Why |
|---|---|---|
| Current marker number is `Text/Inverse` | `Text/On Fill` | Inverse is near-black in dark mode on a fill that stays blue (known-issues) |
| Error hint is 10px | `Caption` (12/16) | 10px is below the type scale |
| Timeline tag is a bespoke 10px pill | The shared `Tag` (status, small) | Reuse; 10px is below the type scale |
| Pending timeline ring is `Border/Default` (1.37:1) | `Border/Strong` (3.75:1) | It is the only mark on that row's line — SC 1.4.11. Figma should follow |
| Error disc is `Status/Error` | Held on `Status/Error` in both modes | The shared indicator uses `error-on-page`, which is pink in dark mode and fails under a white glyph |
| `Last=True` / `Position` property | none | The first and last steps drop their connector half by position (`:first-child` / `:last-child`) |

### Known gaps

- **Dark mode, current step label:** `Interactive/Primary` on a dark card is
  **2.07:1**. Same finding as the selected primary tab; waiting on one token
  decision. Tracked as an open finding by `check:contrast`.
- **Dark mode, bar fill against track:** **1.38:1**. The number beside the bar
  carries the value, but the bar barely reads. Same decision.
- **Done vs current segment:** 1.13:1 in both modes — hue only. By design the
  "3/5" text carries it, which is why the value is not optional.
- **Figma variant names (`1746:92`):** the set is now `State` × `Position`
  (First / Middle / Last), not `State` × `Last` as described above, and it has
  a `State=Progress` value that means Done at `Position=First` (`1746:38`,
  green tick) and Upcoming at `Middle` (`4634:70963`, grey ring). There is no
  `Done, First` or `Upcoming, Middle`. Rename before anyone builds from the
  property names.
- **Figma samples (`5529:44147`):** the horizontal stepper numbers its second
  step "3" and repeats "3" on the third; the vertical sample repeats "Patient
  identified"; the two horizontal samples are identical. The page's usage-notes
  frame (`1736:12850`) is a stale Menu Item panel.

## Engineering Notes

- Indeterminate progress bar: CSS animation in implementation; the Figma component is a single static frame showing the moving fill at one moment.
- Stepper "current" halo is implemented as a drop-shadow with `spread: 4` and 20% Primary — re-create with `box-shadow: 0 0 0 4px rgba(<primary>, 0.2)` in CSS.
- Stepper Tab underline uses individual side stroke weights (`strokeBottomWeight: 3`, others 0). Code draws it as an inset `box-shadow`, as Tabs does, so the 44px height does not change.
- Connector halves: each horizontal step draws the line to its left (`::before`, the step's own colour) and to its right (`::after`, green only when done). That is what makes Done → Current read green then blue.
- Timeline times: pass through `<time>` with ISO `datetime` for assistive tech, even when display value is "Now" or "—".

---

## Related

- `/decisions/DDR-036-stepper-tab-is-a-stepper.md` — why the Stepper Tab is not a Tabs variant
- `/components/tabs/spec.md` — the component it resembles
- `/decisions/DDR-025-focus-ring-cyan-800.md` — focus colour
- `/components/button/spec.md` — for actions inside a stepped form (Next / Back / Submit)
- `/foundations/tokens/semantic/color.json` — `Status/Success`, `Status/Error`, `Interactive/Primary` consumed across all variants
