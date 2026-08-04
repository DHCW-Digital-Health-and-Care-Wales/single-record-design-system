# Breadcrumbs

> The trail showing where the current screen sits in the product's hierarchy,
> and the way back up it.

| | |
|---|---|
| **Type** | Component |
| **Status** | In review |
| **Reference** | `packages/web/src/breadcrumbs/breadcrumbs.css` · `packages/react/src/breadcrumbs/Breadcrumbs.jsx` |
| **Figma** | Breadcrumbs (`1307:19303`), Type=Multilevel/Back, Levels=One–Four |
| **Last updated** | 2026-08 |

---

## When to use

- On screens more than one level below a section's landing screen, where the
  user needs to know what they are inside of — a case note within a patient
  within a search result.
- Where the route in matters to the task. A breadcrumb answers "what is this
  screen part of?", which is a different question from "how do I get back?".

## When not to use

- On the top level of a section. A one-item trail states the obvious.
- As a substitute for the primary navigation. Breadcrumbs describe position;
  they do not offer the full set of destinations.
- Inside a modal or a step-by-step flow. Neither has a hierarchy to describe —
  a flow needs a progress indicator, and a modal needs a close.

## How it works

- **Two types, both live.** `multilevel` renders the full trail, separated by
  `/`, with the current page as plain text. `back` renders one chevron-left
  link to the item immediately above the current page.
- **Both take the same `items` array.** A product can switch type by
  breakpoint without restructuring the data behind it.
- **Four levels is the practical maximum** (the Figma set stops there). Deeper
  than that, use the `back` type — a trail that wraps to two lines is harder to
  read than the single step that actually matters.
- The current page is the last item and is never a link.
- Caption type (12/16) throughout — a breadcrumb is orientation, not content,
  and it must not compete with the page heading directly beneath it.

## Do and don't

- **Do** name the destination in the `back` type: "Back to Patient search",
  never "Back". A bare "Back" describes browser history, which the component
  does not control and cannot promise.
- **Do** use the same label a destination uses as its own page heading, so the
  trail matches what the user sees on arrival.
- **Don't** include the current page as a link.
- **Don't** truncate a patient's name to fit a trail. Switch to the `back`
  type instead.

## Accessibility

- Renders a `<nav aria-label="Breadcrumb">` wrapping an ordered list, so the
  trail is reachable as a landmark and its order is conveyed.
- The current page carries `aria-current="page"`.
- Separators (`/`) and the back chevron are `aria-hidden` — they are visual
  punctuation, and read aloud they turn the trail into noise.
- Links carry the standard SR cyan focus ring (DDR-006).

## Content

- Sentence case, matching the destination's own heading.
- No trailing separator after the current page.
