# Badge

**Status:** Shipped in code — `.sr-badge` in `@dhcw/sr-web`, `Badge` in `@dhcw/sr-react`. **No Figma component yet** (see Known gaps)
**Last updated:** 2026-09-25

---

## Purpose

Shows a **count** as a small pill beside a label: "Referrals 20", a tab with
"3" results. One badge, used by every component that shows a count.

It replaces two copies of the same mark — `.sr-nav__item-badge` and
`.sr-tabs__badge` — which matched in every value except the text token.

A badge is a **quantity**. A status is a [tag](../tags/spec.md) or a status
indicator; an alert is a [notification banner](../notification-banner/spec.md).

---

## Anatomy

```
  ┌──────┐
  │  20  │   ← .sr-badge — pill, the count as text
  └──────┘
```

| Part | Class | Notes |
|---|---|---|
| Pill | `.sr-badge` | `radius-full`, `interactive/primary` fill |
| Count | text content | `text/on-fill`, Caption 12/16 Regular |

---

## Variants

One. There are no sizes, colours or states on the badge itself.

| Host state | Behaviour | Where it lives |
|---|---|---|
| Tab disabled | Fill becomes `interactive/disabled` | `tabs.css` |
| Navigation rail / icon-only | Badge hidden | `navigation.css` |

The host owns where the badge sits and when it is hidden or greyed. The badge
owns how it looks.

---

## Sizing and spacing

| Property | Value | Token |
|---|---|---|
| Height | 20px | — |
| Minimum width | 32px | — |
| Padding | 0 8px | `space-2` |
| Radius | full | `radius-full` |
| Type | 12/16 Regular | `type-caption` |

Not interactive, so no touch target of its own — the host carries it.

---

## The contrast correction

The navigation badge used `text/inverse`. That token flips with the mode — white
in light, `#212b32` in dark — while the badge fill stays saturated
(`#0d62a3` in dark). Dark-mode navigation counts were **2.26:1**, against
the 4.5:1 SC 1.4.3 requires. The tab badge already used `text/on-fill`, which
is white in both modes; the shared badge does too.

The same mistake was in six more places, all fixed in the same change (each
2.26:1 in dark): the selected date-picker day, the search submit button, the
pressed segmented-control option, the selected select option, the selected
secondary tab, and the dark-blue count tag.

**Prevented by:** `check:on-fill` fails any CSS rule that pairs a saturated fill
(`interactive/primary`, `interactive/destructive`, a status fill) with
`text/inverse`. Verified by planting `text/inverse` back into `badge.css` and
confirming a non-zero exit. `check:contrast` asserts the `text/on-fill` on
`interactive/primary` pair itself — but it checks token pairs, not which token
the CSS uses, which is why it never saw this.

---

## Accessibility

- **The badge is always `aria-hidden`.** The count goes into the **host's**
  accessible name instead: "Referrals, 20 items". A badge nothing names is a
  number a screen reader never hears.
- **Fixed 2026-09-25:** the navigation item carries an `aria-label` (so the
  icon-only rail is named), and an `aria-label` replaces the element's content
  as its name — so the count had never been announced. The label now includes
  it, in React, the stories and the website.
- **Never colour alone.** The badge is always a number; it does not change
  colour to signal urgency.
- **Forced colours:** the fill is dropped, so the pill draws a `CanvasText`
  border.

---

## Engineering Notes

- Web: `packages/web/src/badge/badge.css`, included in `single-record.css`.
- React: `import { Badge } from '@dhcw/sr-react'` → `<Badge>20</Badge>`.
  `Navigation` (`badge`) and `Tabs` (`count`) render it for you and put the
  count in the accessible name.
- Blazor: stylesheet only — `<span class="sr-badge" aria-hidden="true">20</span>`,
  and put the count in the host's accessible name yourself.
- MAUI: no badge style ships yet.
- Tokens: `interactive/primary`, `text/on-fill`, `interactive/disabled`,
  `space-2`, `radius-full`, `type-caption`.

---

## Known gaps

- **No Figma component.** Figma draws the badge inside the navigation item
  building block (`665:21099`) and the tab set (`817:7219`), not as a component
  of its own. A `Badge` component should be created and both hosts pointed at
  it.
- **No MAUI style.**
- **The header notification bell has no count, by decision** (2026-09-25).

---

## Related

- [Navigation](../navigation/guidelines.md) — counts on menu items
- [Tabs](../tabs/spec.md) — counts on tabs
- [Tags](../tags/spec.md) — for a status, which a badge never carries
- `guidelines.md` — when to use one, and when not to
