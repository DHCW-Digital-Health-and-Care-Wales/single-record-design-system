# Badge

> A count, as a small pill beside a label — how many referrals, how many
> results.

| | |
|---|---|
| **Type** | Component |
| **Status** | In review |
| **Reference** | [spec.md](spec.md) · `packages/web/src/badge/badge.css` · `packages/react/src/badge/Badge.jsx` |
| **Figma** | No component yet — drawn inside the navigation item (`665:21099`) and the tab set (`817:7219`) |
| **Related standards** | WCAG 2.2 AA |
| **Last updated** | 2026-09 |

---

## When to use

- **A count of things to act on**, beside the place you go to act on them —
  "Referrals 20" in the navigation.
- **A count of what a tab holds** — "Results 3".

## When not to use

- **For a status.** "Urgent", "Overdue", "Awaiting review" are
  [tags](../tags/guidelines.md). A badge only ever holds a number.
- **For urgency.** A bigger number is not a warning. If something needs
  attention now, that is a [notification banner](../notification-banner/guidelines.md).
- **On the header notification bell.** Decided 2026-09-25: the bell has no count.
- **On its own**, away from a label. A number with nothing beside it means
  nothing.

## How it works

- **One look everywhere.** Navigation and tabs use the same badge; do not
  restyle it for a new host.
- **The host decides placement.** It sits after the label. The collapsed
  navigation hides it; a disabled tab greys it.
- **The count is text**, not an image or icon.

## Do & don't

| Do | Don't |
|---|---|
| Show a count of things the user can act on | Show a status word in a badge |
| Put the count in the host's accessible name | Leave the badge as the only place the number exists |
| Keep the one fill colour | Colour it red to mean "urgent" |

## Accessibility

- **The badge is hidden from screen readers; the number is not.** The tab or
  menu item says "Referrals, 20 items". The React components do this for you.
  In plain HTML or Blazor, add it to the host's `aria-label` yourself.
- **White on the brand blue in both modes.** The navigation badge used a token
  that turns dark in dark mode — 2.26:1, a fail. It is fixed.
- **Never colour alone.** The number carries the meaning.

## Content

- A number only. Write "20", not "20 new".

## Related

- [Navigation](../navigation/guidelines.md)
- [Tabs](../tabs/guidelines.md)
- [Tags](../tags/guidelines.md) — for a status

## Engineering

```html
<button type="button" class="sr-tabs__tab" role="tab" aria-label="Results, 3 items">
  Results<span class="sr-badge" aria-hidden="true">3</span>
</button>
```
