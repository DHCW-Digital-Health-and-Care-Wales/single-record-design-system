# Modal dialog

**Status:** In development
**Last updated:** 2026-07

---

## Purpose

Interrupts the user to get a decision or show something that must be dealt with
before continuing. Use a modal when the task genuinely cannot proceed until the
user responds — confirming a destructive action, approving a batch, resolving a
conflict.

Per **DDR-008** this is the **single base component**. Confirmation and Result
dialogs are *composed patterns* built on it, not separate components.

Do not use a modal for information the user can act on later — use a
[notification banner](../../packages/web/src/) inline, or a toast. Modals steal
focus and stop work; that cost has to be earned.

---

## Variants

| Size | Width | Usage |
|---|---|---|
| Small | 380px | A single confirmation question, one or two sentences |
| Medium | 480px | Default. Short forms, summaries |
| Large | 840px | Tabular content, batch summaries, side-by-side detail |

Composed patterns (DDR-008): **Confirmation** (standard, destructive, warning,
acknowledgement, high-stakes, processing) and **Result** (success, error).

---

## Anatomy

```
┌─────────────────────────────────────────┐
│ Modal Title                         [×] │  ← .sr-modal__header
│ ─────────────────────────────────────── │
│                                         │
│ Content                                 │  ← .sr-modal__body (scrolls)
│                                         │
│ ─────────────────────────────────────── │
│              [ Secondary ] [ Primary ]  │  ← .sr-modal__footer
└─────────────────────────────────────────┘
             backdrop dims the page
```

- **`.sr-modal`**: the `<dialog>` itself. 24px padding, `radius-lg`, `Surface/Section cards`.
- **`.sr-modal__title`**: `Heading XS` (Roboto Medium 16/24). Names the dialog via `aria-labelledby`.
- **`.sr-modal__close`**: 16px `Icon/nav/close` in a 24px target.
- **`.sr-modal__body`**: rules above and below; scrolls when tall, so header and footer stay put.
- **`.sr-modal__footer`**: right-grouped, primary last (**DDR-018**).

---

## Built on native `<dialog>`

Opened with `showModal()`. The platform provides, with no dependency:

| Behaviour | Provided by |
|---|---|
| Top-layer rendering (never clipped by `overflow` or `z-index`) | `<dialog>` |
| Backdrop | `::backdrop` |
| Focus containment — content outside is inert | `showModal()` |
| Escape to dismiss (fires `cancel`) | `<dialog>` |
| Focus returned to the invoking element on close | `<dialog>` |

**Verified in Chromium**, not assumed: focusing an element outside an open dialog
leaves focus unmoved, and closing restores focus to the invoker.

Only three things are added on top, and they are the only reasons the React
wrapper exists:

1. **Background scroll lock** — `<dialog>` does not lock page scroll. The wrapper
   adds `.sr-modal-open` to `<body>`.
2. **Backdrop-click dismissal** — optional. The backdrop is painted by the dialog,
   so a click on it reports the dialog as `event.target`.
3. **Routing every close path through one `onClose`**, so the caller's `open` state
   stays the single source of truth. The `cancel` event is prevented for this reason.

Because this lives in the CSS/HTML layer rather than a React library, Blazor and
MAUI get identical behaviour from the shared stylesheet. This is why no headless
library was adopted — see the no-library decision recorded with this work and the
precedent in DDR-012.

---

## States

| State | Visual behaviour |
|---|---|
| Closed | `display: none` via the UA. The flex layout is scoped to `[open]` so a closed dialog never renders |
| Open | Centred, top layer, backdrop at Navy/900 48% |
| Close hover | `Surface/Subtle` background |
| Close focus | 3px `Border/Focus` ring — DDR-006 |
| Body overflowing | Body scrolls; header and footer remain fixed |

---

## Sizing

| Element | Value |
|---|---|
| Padding | 24px (`space-6`) |
| Gap between sections | 16px (`space-4`) |
| Footer action gap | 12px (`space-3`) |
| Corner radius | 8px (`radius-lg`) |
| Elevation | `sr.elevation.overlay` — `0 4px 16px rgba(27,41,74,0.18)` |
| Max size | `100vw/100vh − 32px` |

**Elevation note.** `foundations/tokens/elevation.md` reserves
`sr.elevation.overlay` for "modals, drawers, dropdown menus and tooltips". The
Figma component is bound to `Elevation/Raised` (the card step) instead. The
documented system wins here — a modal with a card-level shadow reads flat against
its own backdrop. Logged as **DL-019**. There is no elevation token in the token
JSON yet (**DL-020**), so the value is currently inline, as it is in
`navigation.css` and `date-picker.css`.

---

## Responsive behaviour

**Form-factor class: Responsive** (DDR-011).

| Breakpoint | Behaviour |
|---|---|
| ≤480px | Width becomes `100vw − 16px`; footer actions stack, primary at the bottom (nearest the thumb) |
| >480px | Fixed width by size variant |

---

## Accessibility

- A modal **must always have an accessible name**. `title` wires `aria-labelledby`
  automatically; if a design has no visible heading, pass `aria-label` explicitly.
- `role="dialog"` and `aria-modal` are implicit on `<dialog>` opened with
  `showModal()` — do not add them by hand.
- Initial focus goes to the first focusable element, which is the close button.
  This is deliberate for confirmations: the safe control is focused, never the
  destructive one. To focus something else, put `autofocus` on it.
- Escape must always dismiss. Do not suppress `cancel` without providing another
  obvious way out.
- Focus is contained by the platform; do not add a JavaScript focus trap on top,
  as the two will fight.
- The close button is 24px (SC 2.5.8 floor) even though its glyph is 16px, because
  unlike a checkbox it has no adjacent label to extend the target.

---

## Content Guidelines

- The title states the decision, ideally as a question: "Send 3 case notes?"
- Buttons name the action, never "OK"/"Yes": "Send notes", "Remove note".
- Destructive confirmations say what is lost and whether it can be undone.
- Keep the body to what is needed to decide. If it needs scrolling to decide, it
  probably should not be a modal.

---

## Engineering Notes

| Framework | Where |
|---|---|
| Web (HTML/CSS) | `packages/web/src/modal/modal.css` |
| React | `packages/react/src/modal/Modal.jsx` |
| Blazor / MAUI | Same CSS via the RCL; drive `showModal()` / `close()` through interop |

```html
<dialog class="sr-modal sr-modal--small" aria-labelledby="t">
  <div class="sr-modal__header">
    <h2 class="sr-modal__title" id="t">Send 3 case notes?</h2>
    <button class="sr-modal__close" aria-label="Close">…</button>
  </div>
  <div class="sr-modal__body">…</div>
  <div class="sr-modal__footer">…</div>
</dialog>
```

**Gotcha:** never set `display` on `.sr-modal` unconditionally. The UA hides a
closed dialog with `display: none`; an unscoped `display: flex` would make it
render when closed. The layout is scoped to `.sr-modal[open]`.

---

## Do / Don't

| Do | Don't |
|---|---|
| Use for decisions that genuinely block progress | Use for information that can wait |
| Name the action on the button | Use "OK" / "Yes" / "No" |
| Let Escape and the backdrop dismiss | Trap the user with no way out |
| Let the platform manage focus | Add a JavaScript focus trap on top of `<dialog>` |
| Group actions right, primary last (DDR-018) | Left-align modal actions like a form |

---

## Related

- [DDR-008](../../decisions/DDR-008-modal-dialog-component-vs-patterns.md) — base component vs composed patterns
- [DDR-018](../../decisions/DDR-018-cta-placement-forms-vs-modals.md) — CTA placement in modals
- [`components/button/spec.md`](../button/spec.md) — footer actions
- Figma: `Modal` `3807:36855` · `Dialog` (composed patterns) `2612:3330`
