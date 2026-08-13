# Buttons

> A button makes something happen. If it navigates somewhere instead, it is a
> link.

| | |
|---|---|
| **Type** | Component |
| **Status** | In review |
| **Reference** | `components/button/spec.md` · `packages/web/src/button/button.css` · `packages/react/src/button/Button.jsx` |
| **Figma** | Buttons (`1318:14904`) |
| **Related standards** | GDS "Button" · NHS England "Buttons" |
| **Last updated** | 2026-08 |

---

## When to use

- To **perform an action**: submit a form, confirm a patient, add a medication,
  open a dialog.
- One **Primary** action per view. If two things look equally important, the
  screen has not decided what it is for.
- **Secondary** for a supporting action that sits alongside the primary one.
- **Ghost** for low-emphasis actions — cancel, back, a tertiary option.
- **Destructive** only for permanent deletion, and always behind a confirmation.

## When not to use

- **To go somewhere.** Use a link. A button that navigates breaks the back
  button, middle-click and "open in new tab", and it lies to a screen-reader
  user about what will happen.
- **To toggle a setting that takes effect immediately.** Use a
  [Switch](../toggles/guidelines.md).
- **To switch between views of the same screen.** Use a
  [segmented control](../toggles/guidelines.md).
- **As a tag or a status.** If the user cannot act on it, it is not a button —
  use a [Tag](../tags/guidelines.md).

## Variants

| Variant | Use for | Per view |
|---|---|---|
| Primary | The one action the screen exists for | Exactly one |
| Secondary | A supporting action alongside it | As needed |
| Ghost | Cancel, back, tertiary | As needed |
| Destructive | Permanent deletion | Rare, always confirmed |

## How it works

- **Sizes.** Small (32px) for inline and table-row actions, Default (40px), and
  Large (48px) for primary calls to action and touch-first layouts.
- **Labels are verb-first and name their object** — "Confirm patient", not
  "OK"; "Delete record", not "Yes". A label that only makes sense next to the
  sentence above it does not make sense in a screen reader's list of buttons.
- **Sentence case**, never title case or all caps.
- **Icons lead the label, never follow it**, and come from the icon set rather
  than being drawn inline.
- **Icon-only buttons need an accessible name.** They are for toolbars and
  genuinely constrained space, not for saving a few pixels on a form.
- **Placement.** Forms and page sections align actions left, primary first,
  with cancel as a text link after it. Modals and dialogs group actions at the
  bottom right, primary last, with cancel as an equal-weight button to its
  left.
- **Minimum 12px between adjacent buttons**, so neither is hit by accident.
- **Disabled is a last resort.** A button that cannot be pressed and does not
  say why is a dead end. Prefer leaving it active and explaining what is
  missing on submit.

## Do & don't

| Do | Don't |
|---|---|
| "Confirm patient" | "OK", "Submit", "Yes" |
| One primary action per view | Two primary buttons competing |
| Put cancel after the primary action in a form | Put cancel first, where it is hit by muscle memory |
| Pair destructive actions with a confirmation | Delete on a single click |
| Use a link for navigation | Style a link to look like a button and call it done |
| Explain why an action is unavailable | Disable a button silently |

## Accessibility

- A real `<button>` element, so Space, Enter, form submission and assistive
  technology support come from the browser.
- Every button has an accessible name. For icon-only buttons that name is an
  `aria-label`, and it says the action, not the icon.
- The focus ring is a 3px Cyan/700 outer stroke, drawn outside the element so
  it is never clipped, and paired with a border so it reads on every surface.
- Loading state updates the accessible name to describe what is in progress
  ("Saving record…"), so the change is not visual only.
- Destructive intent is never carried by red alone — the label says what will
  be deleted, and a confirmation step follows.
- Default height is 40px; Small relies on spacing to meet target size, and
  touch layouts use 44px.

## Known gaps

- `components/button/spec.md` is stale: it is marked Planned, dated 2026-03,
  lists a `Warning` variant that is not built, and describes an amber focus
  ring. The focus ring is Cyan/700 and has been since the focus-ring decision
  record. Treat this page and the code as current, and the spec as needing a
  rewrite.
- No loading-state implementation in `packages/web` or `packages/react`; the
  guidance above describes the intended behaviour, not shipped code.
