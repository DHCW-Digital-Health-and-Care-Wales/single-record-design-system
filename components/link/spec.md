# Link

**Status:** In Figma (component set `1633:320` on page `1318:14904`)
**Last updated:** 2026-06-04

---

## Purpose

Navigates the user to another location — a page, anchor, document, or external resource. Use a link for navigation; use a Button for actions that change state.

---

## Variants

The component set is **Type × Size × State** = 36 variants, mirroring the Button structure.

| Property | Values |
|---|---|
| Type | Default, Destructive, Inverse |
| Size | Large, Default, Small |
| State | Default, Hover, Focus, Disabled |

| Type | Usage |
|---|---|
| Default | Standard hyperlink, inline or standalone. The most common case. |
| Destructive | Link that leads to a destructive flow (e.g. "Remove patient"). Pair with confirmation. |
| Inverse | Link sitting on a dark or coloured surface — banners, dark mode, image overlays. |

A boolean component property **Leading icon** exposes an optional 16/20px icon slot for cases like "Download file" or "Open in new tab". No trailing icon variant — keep links visually simple.

> **Visited** state is intentionally omitted. There is no semantic colour token for visited links yet — see open work item below. Browsers will still apply their own visited styling on the web until a token is added.

---

## Anatomy

```
[ Icon? ]  Link text
└────────────────────┘
        Hit area (padded)
```

- **Label**: Required. Sentence case. Describe the destination, not the action ("Patient summary", not "Click here").
- **Leading icon**: Optional. Same colour as the label. 16px for Small, 20px for Default/Large.
- **Underline**: Always on, except Focus state (which uses the GDS yellow focus pattern).

---

## States

| State | Visual behaviour |
|---|---|
| Default | Underlined, `Interactive/Link` colour (Destructive: `Interactive/Destructive`, Inverse: `Text/Inverse`) |
| Hover | Colour shifts one step (Default → `Interactive/Primary Hover`; Destructive → `Status/Critical`; Inverse → `Surface/Background`). Underline retained. |
| Focus | GDS pattern: `Border/Focus` yellow background, `Text/Primary` text, underline removed. |
| Disabled | `Text/Disabled`, underline retained, `aria-disabled="true"`. Use sparingly — a disabled link is usually the wrong pattern. |

---

## Sizing & Typography

| Size | Typography token | Use |
|---|---|---|
| Large | `SR Typography/Desktop/Heading XS` (16/24 Medium) | Standalone links in section headers, card titles |
| Default | `SR Typography/Desktop/Label` (14/20 Medium) | Body copy, lists, table cells |
| Small | `SR Typography/Desktop/Caption` (12/16 Regular) | Footnotes, metadata, captions |

Padding: `Space/1` (4px) on all sides; `Space/1` gap between icon and label. Corner radius `Radius/2` — only visible behind the Focus state's yellow background.

Minimum touch target: 44×44px. Apply invisible hit-area padding around standalone links on touch surfaces; do not enlarge the visible underline.

---

## Accessibility

- Link text must describe the destination on its own. Avoid "click here", "more", "read more".
- External links: signal externality in text ("opens in a new tab") and pair with an icon if appropriate. Do not rely on icon alone.
- Focus indicator follows GDS: 3px yellow background block sitting behind the text, with the underline removed. This is the same `Border/Focus` token used across the system.
- Disabled links: prefer hiding or replacing with non-interactive text. If kept, use `aria-disabled="true"` and remove `href`.
- Contrast: `Interactive/Link` (`Info-Blue/default`) on `Surface/Background` meets WCAG 2.2 AA. Verify against any custom surface before use.

---

## Content Guidelines

- Describe what the user gets. "Patient demographics" not "View".
- Sentence case. No trailing punctuation unless the link ends a sentence.
- Do not stack three or more links in a row — use a list or navigation pattern instead.

---

## Engineering Notes

- Blazor / web: render as `<a href="…">`. Never use a link for an action that does not navigate — use Button.
- "Opens in a new tab": include `target="_blank"` and `rel="noopener noreferrer"`, and surface the behaviour in the visible text.
- MAUI: map to `Label` with `GestureRecognizers` + accessible name, or `HyperlinkSpan`. Apply tokens; do not hardcode colours.
- Underline thickness is browser-default; do not override unless the design system explicitly specifies a value.

---

## Open Work

- **Visited state token**: no semantic token exists. Decision needed before adding a `Visited` variant. Tracked alongside DL-006 in `/decisions/handoff.md`.
- **Inline-with-body-text** variant: current set treats links as standalone elements. An inline variant inheriting parent line-height may be needed once body-text patterns are formalised.

---

## Related

- `/components/button/spec.md` — for actions, not navigation
- `/foundations/tokens/semantic/` — `Interactive/Link`, `Interactive/Destructive`, `Text/Inverse`, `Border/Focus`, `Text/Disabled`
