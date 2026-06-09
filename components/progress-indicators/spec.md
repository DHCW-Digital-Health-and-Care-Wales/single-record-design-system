# Progress Indicators

**Status:** In Figma — 5 component sets on page `1736:12775`
**Last updated:** 2026-06-04

| Component | Node | Purpose |
|---|---|---|
| Progress Bar | `1746:37`   | Single-process completion |
| Stepper Step | `1746:92`   | Atomic step for horizontal numbered stepper |
| Stepper Tab  | `1746:106`  | Compact tab variant for stepper-in-tabbar |
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
| Error | Filled `Status/Critical` circle, white `Icon/status/alert` (16px). Optional sub-text in `Status/Critical` (e.g. "2 fields missing"). | `Border/Default` line |
| Upcoming | White circle, 2px `Border/Default` ring, grey number | `Border/Default` line |

`Last=True` hides the trailing connector — use for the final step.

Label is `Caption`. `Current` and `Error` use Medium weight + matching colour.

### Composition example

Place 6 instances side-by-side in a horizontal autolayout with equal `layoutGrow=1`. The connector inside each step bridges to the next; setting `Last=True` on the final instance suppresses its connector.

---

## Stepper Tab

Variants: **Done · Current · Upcoming**

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
| Alert | Filled `Status/Critical`, title also coloured |
| Pending | White fill, 1.5px `Border/Default` ring |

Each item: leading 56px time column (`Caption`, `Text/Secondary`), 2px connector line, dot, then body with title + description + optional rounded tag.

Tag surfaces:
- Complete → `Status/Success Surface` / `Status/Success`
- Current → `Surface/Subtle` / `Interactive/Primary`
- Alert → `Status/Critical Surface` / `Status/Critical`

---

## Icons used

| Where | Icon | Node |
|---|---|---|
| Done step / tab tick | `Icon/action/check` | `1745:24` (imported this commit) |
| Error step | `Icon/status/alert` | `1745:29` (imported this commit) |

Both new icons are Lucide-derived, 24×24, stroke 2, bound to `Text/Primary`. Recoloured per use via semantic variables (`Text/Inverse` inside coloured circles, etc.).

---

## Accessibility

- **Steppers**: render as `<ol>` with each step as `<li>`. Current step carries `aria-current="step"`. Error step pairs the alert icon with a text description ("2 fields missing") — never colour alone.
- **Progress Bar**: `role="progressbar"` with `aria-valuemin`, `aria-valuemax`, `aria-valuenow`. Indeterminate omits `aria-valuenow` and sets `aria-busy="true"`.
- **Segmented**: announce as "Section 3 of 5 complete" via `aria-label` on the wrapping element.
- **Timeline**: `<ol>` with timestamps as `<time datetime="…">`. Alert items: pair the red dot with `Icon/status/alert` text and a descriptive `aria-label`.
- All status colours used here meet WCAG 1.4.11 against `Surface/Small Cards` (white): `Status/Success` 4.7:1, `Status/Critical` 4.9:1, `Interactive/Primary` 7.5:1.

---

## Engineering Notes

- Indeterminate progress bar: CSS animation in implementation; the Figma component is a single static frame showing the moving fill at one moment.
- Stepper "current" halo is implemented as a drop-shadow with `spread: 4` and 20% Primary — re-create with `box-shadow: 0 0 0 4px rgba(<primary>, 0.2)` in CSS.
- Stepper Tab underline uses individual side stroke weights (`strokeBottomWeight: 3`, others 0) — CSS `border-bottom: 3px solid` equivalent.
- Timeline times: pass through `<time>` with ISO `datetime` for assistive tech, even when display value is "Now" or "—".

---

## Related

- `/decisions/DDR-006-focus-ring-cyan.md` — focus colour
- `/components/button/spec.md` — for actions inside a stepped form (Next / Back / Submit)
- `/foundations/tokens/semantic/color.json` — `Status/Success`, `Status/Critical`, `Interactive/Primary` consumed across all variants
