# Footer

> The bar pinned to the bottom of every screen: the version staff quote when
> reporting a problem, and the actions that commit or save their work.

| | |
|---|---|
| **Type** | Component |
| **Status** | In review |
| **Reference** | `packages/web/src/footer/footer.css` · `packages/react/src/footer/Footer.jsx` |
| **Figma** | Footer Nav (`665:16525`), Type=Desktop |
| **Last updated** | 2026-08 |

---

## When to use

- **On every screen of an application.** The footer is persistent chrome, not
  page content. A screen with no committing action still gets the bar, carrying
  the version alone — the version is what staff read out when reporting a
  fault, so it has to be reachable everywhere, and a bar that comes and goes
  between screens reads as a layout bug rather than a rule.
- Where a screen does have a committing action, it belongs here: pinned, so it
  stays reachable without scrolling to the end of a long table.

## When not to use

- Not for navigation. It holds actions on the current screen only.
- Not as an overflow area for actions that did not fit elsewhere — if the action belongs to one item in a list, it belongs in that row.

## How it works

- Version on the left, actions on the right. Pass `actions` to supply the
  screen's own buttons; pass none and the bar renders with the version alone.
- Actions follow DS Button hierarchy: the committing action is `primary`, everything beside it is `secondary`. Exactly one primary.
- Both actions use `small` — the footer is chrome, and full-size buttons here compete with the page's own actions.
- **Pinning is `position: sticky`, not `fixed`.** Fixed would position the bar
  against the viewport, so it would have to be told the width of any sidebar
  beside it — which the component cannot know. Sticky keeps it inside its own
  column, so it spans the content area and stops at the sidebar. The page must
  give the footer's column at least viewport height, and let the content above
  it grow, or on a short screen the bar floats up under the content instead of
  sitting at the bottom.

## Do and don't

- **Do** keep the version visible even when there are no actions.
- **Do** keep the action labels specific: "Mark as complete", not "Submit".
- **Don't** put destructive actions here. A `destructive` button in persistent chrome sits under the cursor all day.
- **Don't** hide the footer on scroll. If it is worth pinning, it is worth keeping still.

## Accessibility

- Renders a real `<footer>` landmark, once per page.
- The version string is plain text, selectable and copyable — staff read it aloud or paste it into a ticket.
- Actions are in DOM order matching visual order, so keyboard order matches what is seen.
- Focus ring is the SR cyan ring (DDR-006).

## Content

- Version format is whatever the build emits (`v 0.1.0.1112`); do not reformat it, because it has to match what support asks for.
