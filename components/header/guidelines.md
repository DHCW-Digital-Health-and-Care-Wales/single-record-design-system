# Header

> The bar across the top of every screen: where staff search, switch language,
> see notifications, and confirm who they are signed in as.

| | |
|---|---|
| **Type** | Component |
| **Status** | In review |
| **Reference** | `packages/web/src/header/header.css` · `packages/react/src/header/Header.jsx` |
| **Figma** | Header bar set (`475:19980`) · Type=Desktop 2 (`815:20262`) |
| **Related standards** | [NHS England header](https://service-manual.nhs.uk/design-system/components/header) · [GDS header](https://design-system.service.gov.uk/components/header/) |
| **Last updated** | 2026-08 |

---

## When to use

- On every screen in an application. The header is persistent chrome, not page content.
- Use `desktop-2` (the single bar) whenever the sidebar `Navigation` is present — the sidebar carries the brand lockup, so the header must not repeat it.
- Use `desktop` (utility strip + main bar) only where there is no sidebar and the header carries the brand.

## When not to use

- Not for page-level actions. Those belong in the page, next to what they act on.
- Not as a place to put screen navigation — that is `Navigation`'s job.

## How it works

| Variant | Height | Contains |
|---|---|---|
| `desktop` | 40px utility + 64px main | Report an issue, language toggle, logo, search, notification, avatar |
| `desktop-2` | 64px | Search, org switcher, language toggle, notification, avatar. **No logo** |
| `mobile` | 56px | Optional hamburger, symbol logo, notification, avatar. No inline search |

- **`desktop-2` is 64px to match the sidebar's logo block**, so the two bottom rules form one continuous line across the top of the app. If either changes, both must.
- **Search sits with the utility cluster on the right**, not pushed to the far left — they read as one group of tools rather than two unrelated ones.
- **The org switcher renders only when there is an org to switch.** Passing an empty value must not leave a chevron that opens nothing.

## Do and don't

- **Do** keep the header on every screen of an application, including error and empty states.
- **Do** let the search field flex below 1024px rather than holding a fixed width.
- **Don't** add product-specific actions to the header. It is shared chrome; anything added here appears in every product that uses it.
- **Don't** rely on the avatar alone to convey who is signed in — it carries initials, not identity.

## Accessibility

- Renders a real `<header>` landmark. There is one per page.
- Notification and avatar controls are named by what they do, not what they look like.
- The language toggle keeps its globe icon at every breakpoint; only the word is dropped on small screens, because the icon is the recognisable part.
- Search is a labelled field. Where the design shows no visible label, use `hideLabel` — a placeholder is not an accessible name and disappears on typing.
- Focus ring is the SR cyan ring (DDR-006) on every control.

## Content

- "Cymraeg" is never translated — it is the label for switching to Welsh, and it stays in Welsh whichever language the interface is in.
- Keep the search placeholder to what can be searched, not an instruction ("Type here to begin search", not "Search").
