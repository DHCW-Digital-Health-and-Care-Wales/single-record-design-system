# Tabs

> Switch between views of the same record, without leaving the page.

| | |
|---|---|
| **Type** | Component |
| **Status** | In review |
| **Reference** | `components/tabs/spec.md` · `packages/web/src/tabs/tabs.css` · `packages/react/src/tabs/Tabs.jsx` |
| **Figma** | Menu Tab (`817:7219`) on page `1753:21420` |
| **Related standards** | GDS "Tabs" · NHS England "Tabs" · WAI-ARIA Authoring Practices, Tabs pattern |
| **Last updated** | 2026-09 |

---

## When to use

- **Sections of one record** — a patient's Summary, Results, Medication and
  Documents, where the identity of the record does not change as you move
  between them.
- **Content that is genuinely alternative**, where a member of staff needs one
  view at a time and can afford to lose sight of the others.
- **Four to six views.** Fewer than three rarely earns a tablist; many more and
  the strip stops being scannable.

## When not to use

- **Moving between areas of the product.** That is navigation and needs a URL,
  so it can be linked, bookmarked and returned to. Tabs that change the page
  without changing the address break the back button.
- **Filtering or setting an option** within a view that is already on screen —
  that is the **Segmented control**. Tabs change *what is rendered*; the
  segmented control changes *how*.
- **Content that must be compared.** If staff need two views side by side,
  hiding one behind a tab makes the comparison impossible.
- **Steps in a sequence.** Tabs imply the views are peers and can be taken in
  any order. A sequence needs a progress pattern.
- **Anything safety-critical that must not be missed.** Content behind an
  unselected tab is content nobody has read.

## How it works

One tablist, one panel region, exactly one selected tab. Selecting a tab shows
its panel and hides the rest.

The selected tab is marked by **colour, weight and a 3px indicator** on its
leading edge — under the label when horizontal, beside it when vertical. Three
signals rather than one, so selection does not rest on colour alone.

**Horizontal** is the default. **Vertical** suits a side rail against a long
record, and reads better when labels are long.

## Options

| Option | What it does |
|---|---|
| Orientation | `horizontal` (default) or `vertical` |
| Count badge | A small pill showing a quantity — 20 results, 3 tasks |
| Disabled | Renders a tab unavailable. Prefer omitting it |

A tab is a label, optionally with a count. There are no icon slots.

## Do & don't

- **Do** use one or two words per tab. A tab strip is scanned, not read.
- **Do** name views with nouns. Tabs do not perform actions.
- **Do** let the strip wrap onto another row when it does not fit, rather than
  scroll. A scrolling strip gives no sign that anything is off-screen, which is
  the same objection as the bullet below: it hides tabs from the people who need
  to see them.
- **Don't** hide anything a member of staff must see behind a tab.
- **Don't** disable a tab to hide content. Omit it, or show the panel and
  explain why it is empty — a disabled tab tells the reader something exists
  and refuses to show it.
- **Don't** use a count badge to convey urgency. It is a quantity, not a status.

## Accessibility

- Implements the **WAI-ARIA tabs pattern**: `role="tablist"` → `role="tab"` →
  `role="tabpanel"`, wired together with `aria-controls` and `aria-labelledby`.
- **The tablist is one tab stop.** Once inside, arrow keys move between tabs and
  wrap at the ends — Left/Right when horizontal, Up/Down when vertical. Home and
  End jump to the first and last available tab.
- **Disabled tabs are stepped over**, never focused.
- The panel itself is focusable, so tabbing off the tablist lands in the content
  the tab controls rather than skipping past it.
- **The count is in the tab's name, not only in the badge.** The badge is
  hidden from assistive technology and the name reads "Results, 20 items" —
  otherwise a screen reader announces the tab and never mentions the number.
- Focus is a 2px ring that clears 3:1 in both light and dark (DDR-025). A
  focused tab that is also selected shows both the ring and the indicator.

## Content

- Nouns: "Results", not "View results".
- Keep labels parallel — all singular or all plural, not a mix.
- Avoid abbreviations that only some staff know; the strip has room for a word.

## Frameworks

| Framework | How |
|---|---|
| HTML / CSS | `.sr-tabs` with `role="tablist"`. **Port the keyboard behaviour** — see the Storybook reference |
| React | `<Tabs tabs={[{ id, label, count, disabled, panel }]} />` from `@dhcw/sr-react`. Keyboard handling included |
| Blazor | Use the shipped CSS classes; mirror the ARIA wiring and keyboard handling |
| .NET MAUI | No tab strip is provided by the design system layer. Use MAUI's own tabbed shell with the SR tokens |

The keyboard behaviour is the part that gets left out. A tablist that only
responds to clicks is not a tablist — it is a row of buttons that a keyboard
user cannot reach.

## Clinical / DHCW notes

- Tabs keep the patient banner in view while the content beneath it changes,
  which is usually the reason to reach for them in a record.
- Do not put results a clinician is expected to act on behind a tab that is not
  selected by default. If it matters on arrival, it belongs in the first view.

## Related

- **Segmented control** — picking a value within the current view
- `components/navigation` — moving between areas of the product
- `decisions/DDR-011-desktop-mobile-form-factor-model.md` — Tabs are Adaptive
- `decisions/DDR-025-focus-ring-cyan-800.md` — the focus ring
