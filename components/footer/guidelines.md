# Footer

> The bar pinned to the bottom of a working screen: the version staff quote when
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

- On screens where staff complete or save a unit of work, and the commit action should stay reachable without scrolling.
- Wherever a version string needs to be visible — it is what staff read out when reporting a fault, and getting it from them quickly matters more than it looks like it should.

## When not to use

- Not on read-only or list screens. A footer with no actions is a bar of empty chrome.
- Not for navigation. It holds actions on the current screen only.
- Not as an overflow area for actions that did not fit elsewhere — if the action belongs to one item in a list, it belongs in that row.

## How it works

- Version on the left, actions on the right.
- Actions follow DS Button hierarchy: the committing action is `primary`, everything beside it is `secondary`. Exactly one primary.
- Both actions use `small` — the footer is chrome, and full-size buttons here compete with the page's own actions.

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
