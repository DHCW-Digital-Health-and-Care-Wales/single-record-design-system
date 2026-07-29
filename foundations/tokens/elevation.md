# Elevation Tokens

Elevation communicates layer hierarchy through shadow. SR uses a minimal, functional set — two tokens, each with a named job. Shadow colour derives from `navy-900` (#1B294A) rather than pure black, keeping it on-brand and subdued on clinical displays.

---

## Philosophy

Neither GDS nor NHS England define an elevation system. Both use shadow in exactly one place: a directional bottom-shadow on the primary button as a press affordance — not a depth metaphor.

SR is narrower still. **Single Record uses no button shadow at all** (dropped 2026-07-29): buttons communicate affordance through fill, border and colour, and the press step was never implemented in either code or Figma. That leaves shadow doing exactly one job here — separating surfaces that sit above the page.

- Borders and `sr.color.surface.*` tokens handle structural hierarchy on flat surfaces.
- Shadow is reserved for elements that genuinely float above the page, or for a card that a border alone cannot separate from its background.
- Do not use shadow decoratively. If in doubt, use a border instead.

---

## Tokens

Source of truth: [`elevation.json`](./elevation.json). The CSS custom properties
and the MAUI XAML keys below are **generated** by `npm run build:tokens` — never
hand-write a shadow value in a component.

| Token | CSS variable | `box-shadow` | Used for |
|---|---|---|---|
| `sr.elevation.raised` | `--elevation-raised` | `0 1px 4px rgba(27,41,74,0.12)` | Cards, panels, patient banner, navigation — gentle lift from page |
| `sr.elevation.overlay` | `--elevation-overlay` | `0 4px 16px rgba(27,41,74,0.18)` | Modals, drawers, dropdowns, tooltips |

```css
.sr-modal { box-shadow: var(--elevation-overlay); }
```

No `elevation.0` token is needed — the absence of shadow is expressed by not applying any shadow, or by `box-shadow: none` explicitly in a reset context.

### Platform output

| Platform | Output |
|---|---|
| CSS / SCSS | `--elevation-raised`, `--elevation-overlay` — ready-to-use `box-shadow` values |
| MAUI (XAML) | A real `<Shadow>` resource with `Brush`, `Offset`, `Radius` and `Opacity`, not a CSS string |

```xml
<Shadow x:Key="ElevationOverlay" Brush="#1B294A" Offset="0,4" Radius="16" Opacity="0.18" />
```

A shadow the build cannot parse is emitted as an XML comment rather than a
guessed value, so it surfaces in review instead of shipping something wrong.

---

## Usage Rules

- Use `sr.elevation.raised` only when a border alone is insufficient to separate a surface — for example, a card on a similarly-coloured background.
- Use `sr.elevation.overlay` for all floating layers: modals, side drawers, dropdown menus, and tooltips.
- Do not stack multiple elevations. An element should use one token or none.
- Do not rely on shadow alone to indicate interactivity — pair with a border or background colour change.
- Focus rings are not managed through elevation. See `sr.color.border.focus` and `/accessibility/focus-management.md`.

---

## What is not in scope

A numeric elevation scale (`elevation.1` through `elevation.4`) has been intentionally removed. A decorative scale creates pressure to apply shadows for visual interest rather than function. The two functional tokens cover all current SR use cases. If a new use case arises, add a token with a named role via DDR.

---

## Change History

| Date | Change | Changed by |
|---|---|---|
| Jul 2026 | **Button step dropped, MAUI output fixed.** `sr.elevation.button` removed from the token JSON, this document and the Figma effect styles — it was specified in three places but implemented in none, and the design lead confirmed it is not wanted. The XAML formatter now emits a real MAUI `<Shadow>` object instead of an unusable CSS string. The switch thumb and segmented-control shadows were removed from code to match their removal in design. | SR DS |
| Jul 2026 | **Tokenised.** The three steps existed only as prose here; nothing generated them, so every component hardcoded its own shadow and several had drifted. Added `elevation.json`, wired into the token build, and replaced the hardcoded values in modal, patient banner, navigation, date picker and select. Two drifts corrected in the process: the date-picker popover was `0.16` opacity where the documented overlay is `0.18`, and the select listbox used **pure black** at `0 4px 12px`, breaking the navy-not-black rule. | SR DS |
| Mar 2026 | Replaced generic numeric scale with three-token functional system. Shadow colour shifted from pure black to navy-900 for brand alignment. | SR DS |
