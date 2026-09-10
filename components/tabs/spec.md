# Tabs

**Status:** Built (web, React). Figma component set `817:7219` on page `1753:21420`.
**Last updated:** 2026-09-08 (Level=Secondary added)

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
| `Level` | `Primary`, `Secondary` | Primary |
| `Orientation` | `Horizontal`, `Vertical` | Horizontal |
| `Count Badge` | boolean | off |

`Level=Secondary` is the sub-tab pill — the second level of a two-level tab
structure. See **Two levels** below and DDR-030.

There are no leading or trailing icon properties. A tab is a label, optionally
with a count.

---

## Two levels

A tab with sub-views does **not** get a chevron. `role="tablist"` may contain
only `role="tab"`, and a `tab` controls exactly one `tabpanel` — there is no
tab-with-children. A control announced as *"Results, tab, 2 of 4, selected"*
promises a panel; producing a menu instead fails SC 4.1.2.

Instead the outer tab's **panel contains a second, complete tablist**:

```
role="tablist"   Summary | Results | Medication | Documents
  └─ role="tabpanel" (Results)
       role="tablist"   Bloods | Imaging | Microbiology     ← Level=Secondary
         └─ role="tabpanel" (Bloods)
```

Both levels get the full keyboard model, independently. This is a composition a
consumer assembles, not a separate component. **Two levels is the limit** — a
third means the information architecture is wrong.

**Sub-tabs vs the Segmented control.** Both are single-select and both fill the
chosen option in brand blue. One line separates them:

> **Track = filter. No track = navigate.**

The Segmented control sits in a grey track and sets an option *within* the view
you are already looking at (`aria-pressed`). A sub-tab pill has no track and
changes *which* view you see (`role="tab"` bound to a panel).

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

**Overflow wraps, it does not scroll.** A horizontally scrolling strip gives no
indication that anything is off-screen. Every tab stays visible.

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

## Sizing — Level=Secondary

32px tall, 12px horizontal padding, full radius, 8px between pills, wrapping.
Deliberately smaller and lighter than the 40px parent: a child that outweighs
its parent inverts the hierarchy.

| State | Fill | Border | Label |
|---|---|---|---|
| Default | transparent | 1px `Border/Strong` | `Text/Secondary` |
| Hover | `Surface/Accent` | **unchanged** | `Interactive/Primary` |
| Selected | `Interactive/Primary` | `Interactive/Primary` | `Text/Inverse` |
| Focus | — | — | 2px surface halo, then 2px `Border/Focus` |
| Disabled | transparent | `Border/Disabled` | `Text/Disabled` |

**The unselected pill's border is the affordance**, so it is a UI component
boundary under SC 1.4.11 and needs 3:1 — hence `Border/Strong` (3.75:1) and not
`Border/Default` (1.37:1).

**Hover leaves the border alone.** Taking it to `Interactive/Primary` — the
treatment Checkbox and Radio use — would make a hovered pill identical to
`Button/Secondary`, also a transparent blue-outlined blue-labelled control. Only
the corner radius would separate "switch view" from "do this thing".

> Figma draws the secondary Focus ring as a single 2px outside stroke, the same
> simplification the primary variants make. A Figma node cannot carry two
> strokes, so the surface halo between the border and the ring exists only in
> code.

---

## Sizing — Level=Primary

40px tall. 16px padding **left and right only**, 8px gap between label and
badge. A tab is exactly as wide as its label plus 32px. Badge is 20px tall with
a 32px minimum width and full radius.

**The selected label is heavier and wider than the unselected one** (Medium with
0.3px tracking against Regular with none — 92px against 89px in the Figma set),
so selecting a tab nudges the tabs to its right by about 2–3px. That is
accepted, and nothing in the CSS tries to absorb it.

> The first implementation did try, by rendering the label again at the selected
> weight in a `::after` collapsed to zero height. Because the tab is a flex
> container the pseudo-element became a flex *item* and sat beside the label
> rather than behind it, making every tab roughly twice as wide as its own text.
> It was removed on 2026-09-08. Doing it properly needs the label in its own
> element so the two copies can share a grid cell — not worth it for 3px.

> Worth revisiting in design: a weight change that alters width is the cause of
> all of this. Keeping one weight and distinguishing selection by colour and the
> 3px indicator alone would remove the reflow entirely.

---

## Responsive behaviour

**Class: Adaptive.** Same component, same purpose; the arrangement changes.

| Breakpoint | Behaviour |
|---|---|
| Mobile ≤767 | Horizontal strip wraps onto further rows. Consider Vertical where the labels are long. |
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

- **Do** keep the tablist to what fits comfortably; a strip that always wraps to
  three rows is a sign the content wants a different structure.
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
- `decisions/DDR-030-two-level-tabs-and-sub-tab-pills.md` — two levels, and the pill / segmented boundary
