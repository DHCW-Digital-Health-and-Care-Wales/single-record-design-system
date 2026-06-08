# Search

**Status:** In Figma (component sets `1715:375` and `1716:238` on page `1701:17851`)
**Last updated:** 2026-06-04

---

## Purpose

Lets a user find content by typing. Covers inline filtering, submitted queries (with both text and icon-only buttons), and lookup with suggested completions.

For "what's an action vs what's a search" — if the result is a navigation/list change driven by the input value, use Search. If the user is choosing from a known set, use Select. If they're triggering an action, use Button.

---

## Icons used

All icons are instances of existing icon components on the Icons page (`103:760`):

| Slot | Icon component | Node |
|---|---|---|
| Leading search glyph | `Icon/nav/search` | `190:114` |
| Clear (×) trailing affordance | `Icon/nav/clear` | `190:264` |
| Loading indicator | `Icon/status/loading` | `190:275` |

Stroke colour is recoloured per state via semantic variables (`Text/Secondary`, `Text/Disabled`, `Text/Inverse`, `Interactive/Primary`) — never hardcoded.

---

## Variants

Two related components.

### `Search` (`1705:363`) — 4 types × 6 states = 24 variants

| Property | Values |
|---|---|
| Type | Basic, With Button, With Icon Button, Typeahead |
| State | Default, Focus, Filled, Loading, Disabled, Error |

| Type | Use |
|---|---|
| Basic | Inline filter for tables, lists, dropdowns. Fires live as the user types. No submit step. |
| With Button | Search is a submitted action hitting the backend — patient search, document lookup. The button is `Interactive/Disabled` until input is valid. |
| With Icon Button | Same as With Button, but the trailing control is a 44×44 icon-only button. Use on mobile or any layout where horizontal space is tight. |
| Typeahead | Looks like Basic but pairs with the `Search Suggestions` popover. Used for clinician lookup, coded terms, location search, reference data. |

### `Search Suggestions` (`1707:160`) — 3 states

| State | Use |
|---|---|
| With Matches | Up to N suggestion rows. Active row is highlighted with `Surface/Accent`. Matched substring is bolded inline. |
| Loading | Spinner + "Searching…" while results are fetching. |
| No Results | Empty-state message with the failed query in quotes. |

Dock it directly under a Typeahead Search instance. Width defaults to 360 — resize horizontally to match the input above it.

---

## Anatomy

```
┌─────────────────────────────────────────┐  ┌────────┐
│ 🔍   Value / placeholder text     [×]   │  │ Search │
└─────────────────────────────────────────┘  └────────┘
   ↑                ↑                  ↑        ↑
   icon           text                clear   button
                  (filled / placeholder)     (text or icon)
```

- **Container**: 44px height (`Touch/Default`), `Radius/4`, 1px border (2px on focus).
- **Leading icon**: 18×18 magnifying glass, stroke = `Text/Secondary` (or `Text/Disabled`).
- **Value**: `SR Typography/Desktop/Body M`. `Text/Primary` when filled, `Text/Secondary` when showing placeholder.
- **Trailing**: clear (×) when filled, spinner when loading, otherwise empty.
- **Button**: only on With Button / With Icon Button variants. Text button uses 24px horizontal padding; icon button is 44×44 square.

---

## States

| State | Visual |
|---|---|
| Default | Border `Border/Default`. Placeholder visible. |
| Focus | Border/Default kept (1px inside). 3px **outer** focus ring in `Border/Focus` (Cyan/700) sits outside the field — does not displace layout. Matches the system focus pattern (DDR-006). |
| Filled | Value shown in `Text/Primary`, clear (×) trailing affordance present. |
| Loading | Spinner replaces clear. Border unchanged from prior state. |
| Disabled | Background `Surface/Background`, border `Border/Disabled`, text `Text/Disabled`. `aria-disabled="true"`. |
| Error | Border `Status/Critical`. Inline message below using `Caption` style in `Status/Critical`. |

For With Button / With Icon Button: the adjacent button uses `Interactive/Disabled` until input is valid (matches the Default state in the component) and switches to `Interactive/Primary` thereafter.

---

## Accessibility

- Combo with suggestions follows the WAI-ARIA combobox pattern: input has `role="combobox"`, `aria-expanded`, `aria-controls` pointing to the listbox, and `aria-activedescendant` for the highlighted row.
- Suggestions list: `role="listbox"`, each row `role="option"` with `aria-selected` on the active row.
- Keyboard:
  - **↓ / ↑** move active row
  - **Enter** selects the active row (or submits, for With Button variants)
  - **Esc** closes the popover and returns focus to the input
  - **Home / End** jump to first / last row
- Highlighted-match text is bolded **and** carries the underlying option semantics — not a colour-only cue.
- Clear (×) button has accessible name `Clear search`. Spinner state surfaces `aria-busy="true"` and a `Searching…` live-region announcement.
- Error message is linked to the input via `aria-describedby`. Border colour alone is not the only cue (icon + text both convey error).

---

## Content Guidelines

- Placeholder describes what the field searches, not how to use it. "Search patients" not "Type here".
- For With Button / With Icon Button: keep input scope explicit ("Enter NHS number or name…").
- "No results" message includes the query in quotes so users can confirm what was tried.
- Suggestion sub-text is for disambiguation (specialty, location, code system) — never put critical information there alone.

---

## Engineering Notes

- Blazor: render as `<input role="combobox">` inside a wrapper that owns ARIA state. The popover is a sibling `<ul role="listbox">`.
- Debounce typeahead queries at ~150–250ms. Cancel in-flight requests on new keystroke to avoid out-of-order results.
- Minimum query length: enforce at the API boundary, surface as the Error state in the UI ("Enter at least 2 characters").
- Clear button: clicking returns focus to the input.
- MAUI: there is no native combobox — compose with `Entry` + `CollectionView` and handle ARIA-equivalent semantics manually.

---

## Related

- `/components/button/spec.md` — the buttons inside With Button / With Icon Button consume the Button component visually (custom sized to match the input).
- `/components/input-field/spec.md` — Search shares anatomy with the standard text input.
- `/decisions/DDR-006-focus-ring-cyan.md` — focus colour.
