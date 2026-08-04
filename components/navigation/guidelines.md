# Navigation (Sidebar)

> The persistent list down the left of an application: where staff are, and
> everywhere else they can go.

| | |
|---|---|
| **Type** | Component |
| **Status** | In review |
| **Reference** | `packages/web/src/navigation/navigation.css` · `packages/react/src/navigation/Navigation.jsx` |
| **Figma** | Navigation/Sidebar/Desktop (`725:8903`) · Case Note Tracking adaptation (`125:5362`) |
| **Last updated** | 2026-08 |

---

## When to use

- As the primary navigation for any application with more than a handful of destinations.
- Choose the **type** by the shape of the destinations, not by how many there are:
  - **Sectioned** — destinations fall into named groups a user would recognise (Patients, Clinical, Nursing). The labels do real work.
  - **Linear** — a flat set with no meaningful grouping. Do not invent section labels to justify Sectioned.

## When not to use

- Not for navigation inside a single record — use tabs or a section nav inside the page.
- Not on mobile at full height. Below 768px it must stop being a sticky 100vh rail; a full-height sidebar on a phone is the whole screen.

## How it works

| State | Width | Behaviour |
|---|---|---|
| Expanded | 220px | Icon + label, section labels shown (Sectioned only) |
| Collapsed — rail | 108px | Icon **above** a permanently visible centred label, 12px |
| Collapsed — icon only | 48px | Icon alone; label revealed on hover **and** focus |

- **The rail is not a truncated expanded row.** Icon above label, both centred. Labels drop to 12px so the longest fits without truncating.
- **Products need not adopt every state.** Case Note Tracking (`125:5362`) ships Expanded and rail only, and deliberately has no icon-only variant.
- Sectioned packs items flush inside a group (the section labels separate them). Linear gives items a 16px gap, because nothing else does.
- The sidebar is full height and sticky — Figma draws it at full frame height in every variant, so that is component behaviour, not a layout choice for the consumer.

## Do and don't

- **Do** mark the current destination with `aria-current="page"`, not a bespoke active class.
- **Do** keep the collapse state where the user put it.
- **Don't** use a badge for anything that is not a count of things to act on.
- **Don't** put actions in the nav. It navigates; it does not do.
- **Don't** nest more than one level. If you need a third, the information architecture is wrong.

## Accessibility

- **Icon-only collapse must reveal its label on `:hover` AND `:focus-visible`.** Hover alone fails WCAG 2.2 SC 1.4.13 and effectively SC 2.1.1 — a keyboard user can tab to an item but can never trigger `:hover`. This is only about sighted keyboard users; `aria-label` names every item regardless.
- Renders a real `<nav>` with an accessible name.
- Parents with children are `<button>` with `aria-expanded`; leaves are links.
- The collapse toggle says what it will do ("Expand navigation" / "Collapse navigation").
- Focus ring is the SR cyan ring (DDR-006), inset so it is never clipped by the rail edge.

## Open questions

- The sidebar is 220px, but `foundations/grid-and-layout.md` specifies a 248px sidebar for the EPR content-zone calculations. The two must be reconciled; do not change one alone.
