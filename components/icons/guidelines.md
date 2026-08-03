# Icons

> The icon set. Lucide, one weight, one size scale — and never a decoration
> standing in for a word.

| | |
|---|---|
| **Type** | Foundation |
| **Status** | In review |
| **Reference** | `foundations/iconography.md` · `packages/icons/` · `foundations/iconography/svg/` |
| **Figma** | Icons page (`103:760`), named `Icon/{group}/{name}` |
| **Last updated** | 2026-08 |

---

## Where icons come from

**Lucide, and only Lucide.** The set is 119 icons across nine groups
(`action`, `clinical`, `comms`, `data`, `file`, `location`, `nav`, `people`,
`schedule`, `status`). The source of truth is `foundations/iconography/svg/`;
`packages/icons/build/icons.js` is generated from it.

- **Use `<Icon name="group/name">`.** Never inline an SVG — an inline path
  cannot be restyled by tokens, cannot be swapped centrally, and is invisible to
  the icon audit.
- **If the icon you need does not exist, stop and ask.** Do not import a new
  Lucide icon, and do not substitute a lookalike. A wrong icon is worse than a
  missing one because it reads as deliberate. Report the exact Lucide name
  needed and get sign-off (CLAUDE.md).
- **Match the Figma design exactly.** `share-2` where the design draws `send` is
  a defect, not a near-enough.

> **Known gap:** Lucide `send` (paper plane) is used in Figma for SendIT and the
> In Transit stat card. It is not in the set. The prototype uses `action/share`
> as a stand-in and flags it in source, pending approval to import.

## Sizing

| Size | px | Use |
|---|---|---|
| `xs` | 16 | Inline with 14px text, nav items, buttons |
| `sm` | 20 | Field affordances, standalone controls |
| `md` | 24 | Header actions, prominent controls |
| `lg` | 32 | Empty states, feature moments |

Icons inherit `currentColor` by default. Pass `color="inherit"` inside a
coloured control so the icon follows its parent rather than fighting it.

## Meaningful vs decorative

This is the decision that matters most, and it is binary:

- **Decorative** — the icon sits beside text that already says the same thing.
  It must be hidden from assistive technology (`aria-hidden`, which is the
  default). Do not label it; a screen reader would read the word twice.
- **Meaningful** — the icon is the only carrier of its meaning, e.g. an
  icon-only button. Pass `label`, which renders `role="img"` and an accessible
  name. The name must say what the control *does* and to *what*: "Print label
  for JOHN, Elvet George", not "Print".

## Do and don't

- **Do** pair an icon with text wherever space allows. Icon-only is a cost paid
  for space, not a style.
- **Do** use the same icon for the same concept everywhere. If `nav/sort` means
  "casenotes" in one place it cannot mean "sort" in another.
- **Don't** use an icon as the sole carrier of status. Colour and shape both
  fail some users; the text has to say it.
- **Don't** rotate or recolour an icon to mean something new. That is a new
  icon, and it goes through Figma.
- **Don't** scale outside the four sizes. Lucide's 2px stroke is tuned to them.

## Accessibility

- Decorative icons: `aria-hidden="true"`, `focusable="false"`.
- Meaningful icons: `role="img"` and an accessible name via `label`.
- Icon-only controls need a 24px minimum target, promoted to 44px on touch
  (WCAG 2.2 SC 2.5.8). 32×32 is the documented dense-desktop exception.
- Never convey status by icon alone (SC 1.4.1).
