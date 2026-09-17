# Inset text

> A short block of text set apart from the text around it, so it is harder to
> skim past.

| | |
|---|---|
| **Type** | Component |
| **Status** | In review |
| **Reference** | [spec.md](spec.md) · `packages/web/src/inset-text/inset-text.css` · `packages/react/src/inset-text/InsetText.jsx` |
| **Figma** | Inset Text (`3613:17859`) on page `3613:17760` |
| **Related standards** | GDS "Inset text" · NHS England "Inset text" · WCAG 2.2 AA |
| **Last updated** | 2026-09 |

---

## When to use

- A caveat the reader has to carry into the rest of the page — "this list does
  not include medication stopped before admission".
- A short rule or condition that governs the section it sits in.
- A note the page author wrote and that is there every time the page loads.

## When not to use

- **Anything that happened.** A save succeeded, a record is locked, the system
  goes down at 2am. That is a notification banner. The line to hold is:

  > **Inset text is part of the page. A banner is an event.**

- **Anything with a status.** A warning, an error, a success. Those need a
  severity, and inset text has none — deliberately.
- **Anything with an action.** The moment it needs a button, it is a call to
  action, which is a banner variant.
- **A message about one form field.** That is the field's own error or hint —
  see [form fields](../form-fields.md).
- **Emphasis on a phrase.** Use `<strong>`. Inset text is for a block.

## How it works

- **No icon, no heading, no buttons, no colour.** Each one would turn it into a
  banner, and two components that render the same thing get used interchangeably
  and then drift apart. This is the narrowing recorded in DDR-032.
- **The bar is neutral, not a status.** A coloured bar reports that something has
  a status. Nothing has happened, so there is nothing to report.
- **The type is inherited.** Inset text sits inside body copy and reads at
  whatever size that copy is set in — 14px inside a table, 16px in a record view.
- **Keep it to a short paragraph.** Two or three sentences. Past that the
  emphasis stops working.
- **One per section.** Two inset blocks next to each other emphasise nothing.

## Options

None. One block, one appearance — see [spec.md](spec.md) for why there is no
severity axis.

## Do & don't

| Do | Don't |
|---|---|
| Use it for a caveat the author wrote | Use it to announce something that just happened |
| Keep it to two or three sentences | Let it grow until it needs a heading |
| Let it inherit the surrounding text size | Fix a font size on it |
| Put a link inside the prose if the prose needs one | Put a button row underneath it |
| Use a notification banner when there is a severity | Tint the bar red to mean "important" |

## Accessibility

- The indentation, the surface and the bar are three signals and none of them
  carries the meaning — the words do. It survives greyscale (SC 1.4.1).
- `Border/Strong` is 3.44:1 on the page background, clearing the 3:1 of
  SC 1.4.11. Asserted in `scripts/check-contrast.mjs`.
- **It is not a live region.** It is present on load, so `role="status"` or
  `aria-live` would announce page furniture on every screen entry.
- `<div>` by default. `<aside>` only where the content is genuinely tangential,
  because that is what the role tells a screen reader. Never `<blockquote>` —
  this is not a quotation.
- No fixed width, so it reflows with its container (SC 1.4.10).

## Content

- Sentence case, full sentences, ending in a full stop.
- Say the thing, not that it is important. "Results from before 2019 are held in
  the legacy system" — not "Please note: important information".
- Do not open with "Note:" or "Important:". The block already says that.

## Known gaps

- **No MAUI style.** The intended construction is a 4px `BoxView` beside the
  text in a two-column `Grid`, because MAUI has no single-edge stroke. Add it
  when a mobile screen needs one.
- **The Figma component had no description until 2026-09-16**, which is part of
  why it was being used as a banner.

## Related

- Notification banner — for anything that happened
- [Form fields](../form-fields.md) — for a message about one field
- [Link](../link/guidelines.md) — for a link inside the prose
