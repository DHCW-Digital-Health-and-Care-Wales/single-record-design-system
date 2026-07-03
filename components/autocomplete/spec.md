# Autocomplete (searchable select)

**Status:** In development
**Last updated:** 2026-07

---

## Purpose

Type to filter a long but known option list, then pick one — clinical code lookup, ward/clinician pickers, coded diagnosis search. Choose Autocomplete over Select when the list is long enough that typing beats scrolling; over free-text Input when the value must resolve to a known item.

**Composition, not new visual language.** Autocomplete deliberately reuses the Input search field (`.sr-input__*`) and the Select listbox (`.sr-select__*`) so the two read as one system. It does not introduce new tokens. A dedicated Figma component is still to be designed — until then this reference is the contract.

Reference implementation: `packages/web/src/autocomplete/autocomplete.css` + `autocomplete.stories.js` (Storybook: **Components → Autocomplete**).

---

## Anatomy

```
Label
Hint text
┌──────────────────────────────┐
│ 🔍  query text            ✕   │  ← .sr-input__field (search icon + input + clear)
└──────────────────────────────┘
┌──────────────────────────────┐
│ Aneurin Ward                  │  ← .sr-select__menu (role="listbox")
│ **Tawe** Ward                 │     matched substring bolded (.sr-autocomplete__match)
│ No matches                    │     .sr-autocomplete__empty when nothing matches
└──────────────────────────────┘
```

- **Search field**: leading `nav/search` icon, text input, trailing `nav/close` clear button (shown once there's a query).
- **Results menu**: the Select popover, reused verbatim. Matched text is bolded.

---

## States

| State | Behaviour |
|---|---|
| Idle | Field only; menu closed |
| Typing | Menu opens, filters live on `input`; matched substring bolded |
| Option hover / active | `Interactive/Primary` fill (inherited from Select) |
| No matches | Single non-selectable "No matches" row |
| Focus | Field uses the Input focus ring; menu closes on blur |

---

## Accessibility

- Input is `role="combobox"` with `aria-autocomplete="list"`, `aria-expanded`, and `aria-controls` → the listbox.
- Results are `role="listbox"` / `role="option"`; the active option is tracked with `aria-activedescendant` (focus stays in the input).
- Keyboard: Down/Up move the active option, Enter selects, Esc closes. Options use `mousedown` + `preventDefault` so a click doesn't blur the input before selection.
- The "No matches" row is `role="presentation"` (not a selectable option).
- Clear button has an `aria-label`.

---

## Engineering Notes

- Imports `@dhcw/sr-web` `input.css` + `select.css`; only wrapper/clear/empty/match styles are new.
- Filtering here is a simple case-insensitive `includes`. Real lookups (clinical codes) should debounce and query a service; keep the same ARIA/keyboard contract.
- For very large result sets, cap and virtualise the menu (the Select menu caps at 280px with scroll).

---

## Related

- `/components/select/spec.md` — fixed-list single-select (the menu is shared)
- `/components/input/spec.md` — the search field
- `/components/search/spec.md` — free-text search (no resolve-to-item step)
