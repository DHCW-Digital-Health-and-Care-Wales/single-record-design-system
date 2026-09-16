# Inset text

**Status:** In Figma (component `3613:17859` on the Inset text page `3613:17760`), shipping in `packages/web` and `packages/react`
**Last updated:** 2026-09-16

> **Narrowed 2026-09-16.** The Figma component was drawn in informational blue
> with `Status/Info` on the bar, and the frame beside it (`3613:17851`) added a
> heading and two buttons — at which point it was indistinguishable from
> `Notification Banner/Variants → Call to action`. The component has been rebound
> to `Surface/Subtle` and `Border/Strong`, and that duplicating frame renamed so
> nobody builds from it. Classification and reasoning: DDR-032.

---

## Purpose

A block of prose held apart from the prose around it, to give it weight without
taking it out of the page.

The boundary against Notification banner, which is the only thing this is ever
confused with:

> **Inset text is part of the page. A banner is an event.**

Inset text was typed by whoever wrote the page and is there every time it loads.
A banner appears *because something happened* — a save succeeded, a record is
locked, the system goes down at 2am.

---

## Variants

**None.** One block, one appearance.

There is no severity axis, and that is the design rather than a gap. A coloured
bar reports that something has a status; nothing has happened, so there is
nothing to report. If the content needs a severity, it is a
[Notification banner](../../decisions/DDR-032-five-figma-pages-component-pattern-or-style.md).

---

## Anatomy

```
▌ Body text, at whatever size the surrounding copy is set in.
▌ More than one paragraph is fine.
└ 4px Border/Strong bar
```

| Part | Required | Notes |
|---|---|---|
| Left bar | Yes | 4px, `Border/Strong`. Neutral — it sets the block apart, it does not flag it. |
| Surface | Yes | `Surface/Subtle`. |
| Body text | Yes | Type is **inherited**, not fixed. |
| Icon | **Never** | An icon reads as a status change. |
| Heading | **Never** | A heading makes it a section rather than an aside. |
| Buttons / links out | **Never** | An action makes it a call to action, which is a banner. |

A link *inside* the prose is fine — that is prose. A button row beneath it is not.

---

## Sizing & Typography

| Property | Value |
|---|---|
| Padding | `Space/3` (12px) top and bottom, `Space/4` (16px) left and right |
| Left bar | 4px |
| Corner radius | `Radius/2` (4px) |
| Type | **Inherited** from the surrounding copy |

Type is inherited for the same reason it is on Link: inset text sits inside body
copy and has to read at whatever size that copy is set in. Fixing 16px here
would render a note inside a 14px table at the wrong size.

The first child's top margin and the last child's bottom margin are collapsed,
so the block's own padding sets the space above the first line and below the
last. Without that the paragraph margins add to the padding and the text floats.

---

## Accessibility

- **Not colour alone (SC 1.4.1).** The indentation, the surface and the bar are
  three independent signals, and none of them carries meaning by itself — the
  block is set apart, and the words say what it says. It survives greyscale.
- **Contrast (SC 1.4.11).** `Border/Strong` is 3.44:1 on the page background and
  3.75:1 on white, clearing 3:1. Asserted in `scripts/check-contrast.mjs`.
- **Text contrast (SC 1.4.3).** `Text/Primary` on `Surface/Subtle` is asserted in
  the same place.
- **Not a live region.** It is present on load. Marking it `role="status"` or
  `aria-live` would announce page furniture on every screen entry — that is the
  banner's job, not this one.
- **Element choice.** `<div>` by default. Use `<aside>` only where the content is
  genuinely tangential, because that is what the role tells a screen reader. Do
  not use `<blockquote>`: this is not a quotation.
- **Reflow (SC 1.4.10).** No fixed width; it takes the measure of its container.

---

## Content Guidelines

- One idea. If it needs a heading to be followed, it is too long to be inset.
- Two or three sentences is the useful range. Past a short paragraph the
  emphasis stops working — everything on the page is emphasised, so nothing is.
- Do not use it for a warning or an error. Those have a status, and a status is
  a banner or a field-level message.
- Never put two inset blocks next to each other.

---

## Engineering Notes

- Web: `.sr-inset-text` in `packages/web/src/inset-text/inset-text.css`.
- React: `InsetText` in `packages/react`, with an `as` prop for the element.
  There is deliberately no `severity`, `icon`, `heading` or `actions` prop.
- Blazor: `<div class="sr-inset-text">` — `@dhcw/sr-blazor` ships stylesheets,
  not components.
- MAUI: a `Border` with a left-edge stroke over `SrColorSurfaceSubtle`. MAUI has
  no single-edge stroke, so draw the bar as a 4px `BoxView` in a two-column
  `Grid` beside the text.

---

## Open Work

- **No MAUI style yet.** The `Grid` + `BoxView` shape above is the intended
  construction but is not in `Styles.xaml`. Add it when a mobile screen needs one
  rather than before.
- **The Figma page title layer read "NOTIFICATION BANNERS".** Fixed 2026-09-16;
  noted here because it is how the two got conflated in the first place.

---

## Related

- `/decisions/DDR-032-five-figma-pages-component-pattern-or-style.md` — why this is a component, and why it was narrowed
- Notification banner — for anything that happened
- `/components/form-fields.md` — for a message about one field
- GDS [Inset text](https://design-system.service.gov.uk/components/inset-text/), NHS England [Inset text](https://service-manual.nhs.uk/design-system/components/inset-text)
