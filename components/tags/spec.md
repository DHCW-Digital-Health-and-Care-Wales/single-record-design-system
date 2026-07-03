# Tag

**Status:** In development
**Last updated:** 2026-07

---

## Purpose

A small pill-shaped label that classifies or annotates an item — status, category, or state (e.g. "Active", "Pending", "Critical"). Use inline within lists, table cells, cards, and headers. Not interactive; for a clickable filter use a different control.

Reference implementation: `packages/web/src/tags/tags.css` + `tags.stories.js` (Storybook: **Components → Tag**). Figma: Tags set (399:7984).

---

## Variants

Two variants (Figma **Tags/status** `399:7984`, **Tags/filter** `3229:71674`):

### `status` — filled label (non-interactive)

| Type | Fill | Border / Text |
|---|---|---|
| Blue | `Status/Info Surface` | `Status/Info` |
| Green | `Status/Success Surface` | `Status/Success` (Green/700) |
| Red | `Status/Critical Surface` | `Status/Critical` (Red/700) |
| Yellow | `Status/Warning Surface` | `Yellow/700` |
| Grey | `Surface/Background` | `Text/Secondary` |
| Outline | transparent | `Border/Strong` border, `Text/Primary` text |

### `filter` — outline + close (dismissible)

Transparent fill, coloured border + text, and a 16px `nav/close` button.

| Type | Border / Text |
|---|---|
| Blue | `Status/Info` |
| Green | `Status/Success` |
| Red | `Status/Critical` |
| Yellow | `Yellow/700` |
| Black | `Border/Strong` border, `Text/Primary` text |

| Size | Height | Padding (status / filter) |
|---|---|---|
| Default | 24px | 16px / 12px left · 8px right |
| Small | 16px | 8px / 8px left · 4px right |

The close button inherits the tag's text colour, carries an `aria-label`
("Remove {label}"), and sits alongside the label `<span>` inside the tag.

---

## Anatomy

```
( Label )
└───────┘  pill, 0.5px border, radius.full
```

- **Label**: `Caption` type (Roboto Regular 12/16, letter-spacing 0.2px). Short — one or two words. Sentence case.
- **Container**: Pill (`radius.full`), 0.5px solid border, soft surface fill.

---

## Accessibility

- **Colour is a secondary signal only.** The label text always carries the meaning (WCAG 1.4.1 Use of Colour). Never rely on the tag colour alone to convey status.
- All type/border/text pairings meet WCAG 2.2 AA contrast on their surface fill.
- Tags are not interactive — render as a `<span>`, not a button or link. If a tag needs an action, that is a different component.
- Do not encode meaning in the tag that is not also available as text to assistive technology.

---

## Content Guidelines

- One or two words. "Active", "Discharged", "Awaiting results".
- Sentence case; no trailing punctuation.
- Keep the type↔meaning mapping consistent across a product (e.g. Green always = active).

---

## Engineering Notes

- Consumes `@dhcw/sr-tokens` CSS custom properties. Yellow uses `--color-yellow-700` for border/text per the expanded yellow scale.
- Class contract: `.sr-tag .sr-tag--{type} .sr-tag--{size}`.
- Blazor / React wrappers should mirror this markup and class contract.

---

## Related

- `/components/status-indicator/` — filled status marks (icon, not a labelled pill)
- `/foundations/tokens/` — `Status/*` semantic colour tokens
