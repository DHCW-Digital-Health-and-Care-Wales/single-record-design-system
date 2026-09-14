# Link

**Status:** In Figma (component set `1636:21236` on the Link page `1636:21000`)
**Last updated:** 2026-09-14

> **Corrected 2026-09-14.** This file described 36 variants across three types
> and cited node `1633:320` on the Buttons page. That node no longer exists, and
> the real set has **24** variants and **no `Inverse` type**. A spec naming a
> node that is gone is worse than no spec, because it reads as checked.
> Classification and build order: DDR-032.

---

## Purpose

Navigates the user to another location — a page, anchor, document, or external resource. Use a link for navigation; use a Button for actions that change state.

---

## Variants

The component set is **Type × Size × State** = 24 variants, mirroring the Button structure.

| Property | Values |
|---|---|
| Type | Default, Destructive |
| Size | Large, Default, Small |
| State | Default, Hover, Focus, Disabled |

| Type | Usage |
|---|---|
| Default | Standard hyperlink, inline or standalone. The most common case. |
| Destructive | Link that leads to a destructive flow (e.g. "Remove patient"). Pair with confirmation. |

**There is no `Inverse` type.** An earlier version of this spec listed one, for
links on a dark or coloured surface. Dark mode is handled by the token layer
rather than by a variant (DDR-026): `interactive/link` has its own dark value,
so a link on a dark surface is the same link. A link on a *saturated* fill —
inside a filled banner, over an image — has no token and no variant today; that
is an open question, not an omission to restore.

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
- **Underline**: Always on, in every state including Focus.

---

## States

| State | Visual behaviour |
|---|---|
| Default | Underlined, `Interactive/Link` colour (Destructive: `Interactive/Destructive`) |
| Hover | Underline thickens 1px → 3px. **Colour does not change.** Figma shifts to `Interactive/Primary Hover`, which is 12.09:1 in light and 1.47:1 in dark — a dark navy on a dark page. No token darkens in light and lightens in dark, so hover cannot be a colour change until `interactive/link-hover` exists. Thickening is the GDS treatment and holds in both modes. |
| Focus | A 2px `Border/Focus` ring at a 2px offset, drawn outside the text. The underline stays. **Not** the GDS yellow background: this file described one, but the Figma set draws a `Border/Focus` stroke and the rest of the system uses an outer ring (DDR-006, DDR-025). |
| Disabled | `Text/Disabled`, underline retained, `aria-disabled="true"`. Use sparingly — a disabled link is usually the wrong pattern. |

---

## Sizing & Typography

| Size | Typography token | Target height | Use |
|---|---|---|---|
| Inherit *(base)* | none — takes the surrounding text | n/a | A link inside a sentence. The common case |
| Large | `SR Typography/Desktop/Body M` (16/24) | 32px | A standalone link at body-copy size |
| Default | `SR Typography/Desktop/Body S` (14/20) | 28px | Dense areas: table cells, card footers |
| Small | `SR Typography/Desktop/Caption` (12/16) | 24px | Footnotes, metadata |

> **Corrected 2026-09-14.** This table previously said Heading XS and Label. The
> Figma set uses Body M / Body S / Caption.

**Padding.** The base link has none — vertical padding on an inline link would
disturb the line box of the paragraph it sits in, and the focus ring is drawn
with `outline-offset` instead. The three size modifiers carry `Space/1` (4px)
top and bottom, which grows the hit area without moving the line: the line boxes
alone are 24 / 20 / 16px, two of them under the 24px SC 2.5.8 minimum. With the
padding the targets are 32 / 28 / 24px — the same heights the Figma chips draw.

`Space/1` gap between icon and label. Corner radius `Radius/2`.

**Target size.** A link inside a block of text is exempt from SC 2.5.8. A
standalone link is not; every size clears 24px as above. Touch layouts should
give more than the minimum.

---

## Accessibility

- Link text must describe the destination on its own. Avoid "click here", "more", "read more".
- External links: signal externality in text ("opens in a new tab") and pair with an icon if appropriate. Do not rely on icon alone.
- Focus is a 2px `Border/Focus` ring at a 2px offset, drawn outside the text so it is never clipped and never moves the line. The underline is retained — removing it would leave the link identified by the ring alone.
- Disabled links: prefer hiding or replacing with non-interactive text. If kept, use `aria-disabled="true"` and remove `href`.
- Contrast: `Interactive/Link` is 6.36:1 on `Surface/Background` and 6.94:1 on `Surface/Section Cards` in light, 9.14:1 and 8.39:1 in dark. All four are asserted in `scripts/check-contrast.mjs`. Verify against any custom surface before use.

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
- Underline is 1px at a 2px offset, thickening to 3px on hover. `text-decoration-thickness` does not reflow the line; changing `border-bottom` or `font-weight` on hover would.

---

## Open Work

- **Visited state token**: no semantic token exists. Decision needed before adding a `Visited` variant. Tracked alongside DL-006 in `/decisions/handoff.md`.
- **Destructive is light-mode only.** `Interactive/Destructive` is a fill colour — the sort white text sits on — and is unchanged across modes, so as red text on the dark page it is 2.84:1 against the 4.5:1 it needs. No red in the ramp is dark-safe as text (`Status/Critical` is 2.14:1 there). Recorded as an open finding in `scripts/check-contrast.mjs` with two options: a new `interactive/destructive-on-dark`, or dropping the type and requiring a Button for destructive flows, which is what GDS and NHS England do.
- **No `interactive/link-hover`.** See the Hover row above.
- **The Figma set is inconsistent at Large.** `Type=Destructive, Size=Large` is drawn in Heading XS while `Type=Default, Size=Large` is Body M — same size, different weight, for no stated reason. Code uses Body M for both. Normalise the set.
- **The Figma set has no inline variant.** Every variant is drawn as a padded standalone chip. Code ships the inline form as the base — it is the common case — so the set is behind the code here rather than the other way round.

---

## Related

- `/components/button/spec.md` — for actions, not navigation
- `/foundations/tokens/semantic/` — `Interactive/Link`, `Interactive/Destructive`, `Border/Focus`, `Text/Disabled`
