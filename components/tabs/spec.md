# Tabs

**Status:** Built (web, React). Figma component set `817:7219` on page `1753:21420`.
**Last updated:** 2026-09-07

---

## Purpose

Switches the view. One tablist controls one panel region, and exactly one tab is
selected at a time — patient record sections, a case split across Summary /
Results / Documents.

**Tabs vs Segmented control.** If choosing changes *what is rendered below it*,
use Tabs. If it filters, sorts, or sets an option within a view that is already
on screen, use the Segmented control. The two look different on purpose and are
not interchangeable: Tabs are `role="tab"` bound to panels; the Segmented
control is a group of buttons with `aria-pressed`.

**Tabs vs Navigation.** Tabs move between views of *the same record*. Moving
between areas of the product is Navigation, and must change the URL.

---

## Variants

| Property | Values | Default |
|---|---|---|
| `Orientation` | `Horizontal`, `Vertical` | Horizontal |
| `Count Badge` | boolean | off |

There are no leading or trailing icon properties. A tab is a label, optionally
with a count.

---

## Anatomy

| Part | Class | Notes |
|---|---|---|
| Tablist | `.sr-tabs` (`.sr-tabs--vertical`) | `role="tablist"`; `aria-orientation="vertical"` when vertical |
| Tab | `.sr-tabs__tab` | `role="tab"`, `aria-selected`, `aria-controls` |
| Count badge | `.sr-tabs__badge` | Pill, decorative (`aria-hidden`) |
| Panel | `.sr-tabs__panel` | `role="tabpanel"`, `aria-labelledby`, `tabIndex={0}` |

The strip carries **no track line**. The Figma component does not draw one; if a
rule under the tabs is wanted, it is a Figma change first.

---

## States

| State | Label | Indicator | Surface |
|---|---|---|---|
| Default | `Text/Primary`, 14/20 Regular | — | transparent |
| Hover | `Interactive/Primary`, Regular | — | `Surface/Background` |
| Focus | unchanged | — | 2px `Border/Focus` ring outside (DDR-025) |
| Selected | `Interactive/Primary`, 14/20 **Medium** | 3px `Interactive/Primary` — bottom edge (horizontal), left edge (vertical) | transparent |
| Disabled | `Text/Disabled`, Regular | — | transparent |

Hover applies to unselected tabs only. Focus and Selected can occur together
and both are shown — the ring is where you are, the indicator is what is
showing.

---

## Sizing

40px tall. 16px padding, 8px gap between label and badge. Badge is 20px tall
with a 32px minimum width and full radius.

**The selected label is heavier and wider than the unselected one** (Medium with
0.3px tracking against Regular with none — 92px against 89px in the Figma set).
Left alone that shifts the whole strip every time someone changes tab. The
implementation reserves the selected width on every tab using a hidden
pseudo-element, which needs `data-label` on the button to match the visible
text. `@dhcw/sr-react` sets it; a tab without it loses the reservation but still
renders.

> Worth revisiting in design: a weight change that alters width is the cause of
> that workaround. Keeping one weight and distinguishing selection by colour and
> indicator alone would remove it.

---

## Responsive behaviour

**Class: Adaptive.** Same component, same purpose; the arrangement changes.

| Breakpoint | Behaviour |
|---|---|
| Mobile ≤767 | Horizontal strip scrolls sideways rather than wrapping. A wrapped tablist reads as two rows of unrelated controls. Consider Vertical where the labels are long. |
| Tablet 768–1023 | As desktop. |
| Desktop ≥1024 | Horizontal by default; Vertical for a side rail beside a long record. |

---

## Spacing

16px padding inside each tab, no gap between tabs (they meet edge to edge, and
the hover wash shows the boundary). 24px between a vertical tablist and its
panel.

---

## Accessibility

- WAI-ARIA tabs pattern in full. `role="tablist"` → `role="tab"` →
  `role="tabpanel"`, wired with `aria-controls` and `aria-labelledby`.
- **Roving tabindex.** The tablist is one tab stop. The selected tab has
  `tabindex="0"`, the rest `-1`.
- **Arrow keys** move between tabs and wrap at the ends — Left/Right when
  horizontal, Up/Down when vertical. Home and End jump to the first and last
  enabled tab.
- **Disabled tabs are stepped over**, not focused. A disabled tab that eats the
  keypress strands the user.
- The panel is focusable so a keyboard user tabbing off the tablist lands in the
  content it controls.
- The count badge is `aria-hidden`; the count is folded into the tab's
  accessible name instead (`"Results, 20 items"`). Without that a screen reader
  announces the tab and never mentions the number.
- Focus ring is 2px `Border/Focus`, which clears 3:1 in both modes (DDR-025).

---

## Content Guidelines

- One or two words. A tab strip is scanned, not read.
- Nouns, not verbs — tabs name a view, they do not perform an action.
- Never rely on the count badge alone to convey urgency; it is a quantity, not a
  status.

---

## Engineering Notes

- Canonical CSS: `packages/web/src/tabs/tabs.css`. React: `@dhcw/sr-react` → `Tabs`.
- The indicator is an inset `box-shadow`, not a border, so it cannot change the
  40px height or nudge the label.
- Keyboard behaviour lives in the React wrapper and the Storybook reference
  implementation. If you hand-roll the markup, port the keyboard handling too —
  it is the half people leave out.
- No new tokens. Everything is `--sr-color-*`, `--sr-type-*` and `--space-*`.

---

## Do / Don't

- **Do** keep the tablist to what fits comfortably; a strip that always scrolls
  is a sign the content wants a different structure.
- **Do** put the selected tab's content in the panel it controls, not elsewhere.
- **Don't** use Tabs for navigation between product areas — that needs a URL.
- **Don't** use Tabs where the options are a filter; that is the Segmented control.
- **Don't** disable a tab as a way of hiding content. Omit it, or show the panel
  with an explanation of why it is empty.

---

## Related

- `components/navigation` — moving between product areas
- Segmented control — picking a value within the current view
- `decisions/DDR-011-desktop-mobile-form-factor-model.md` — the Adaptive class
- `decisions/DDR-025-focus-ring-cyan-800.md` — the focus ring
