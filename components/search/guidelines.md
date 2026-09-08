# Search — usage guidelines

Source for both the Figma "Guidelines / Usage notes" panel and the design
system website page. Do not fork this content between the two.

**Figma:** `Search` (`1715:375`), `Search Suggestions` (`1716:238`) on page `1701:17851`
**Code:** `packages/web/src/search/search.css`, `@dhcw/sr-react` → `Search`

---

## When to use

Use Search when the user finds content **by typing**, and the result is a list
or view that changes because of what they typed.

| You want | Use |
|---|---|
| Filter a table, list or panel as the user types | Search, `Type=Basic` |
| A query sent to a service — patient lookup, document search | Search, `Type=With Button` |
| The same, where horizontal space is tight (mobile, toolbars) | Search, `Type=With Icon Button` |
| Type to look up a person, place or coded term, then pick a result | Search, `Type=Typeahead` |
| Pick one value from a known set, typing to narrow it | **Autocomplete** |
| Pick one value from a short fixed set | **Select** |
| Free text that is not a query | **Input** |
| Perform an action | **Button** |

**Search is the only search field in the system.** The Input set's
`Type=Search` variants were removed on 2026-06-04. To put a search inside a
labelled form field, turn on `Label` / `Hint` / `Required` on a Search
instance — do not wrap an Input around it.

---

## Choosing a type

- **Basic** fires live. Only use it where results are cheap enough to update on
  every keystroke, and where the user can see the effect of typing without
  scrolling.
- **With Button** is for a query that costs something — a backend call, a
  cross-organisation lookup. The button is disabled until there is a query, so
  an empty search cannot be sent.
- **With Icon Button** is the same control at 40×40. Use it where a text button
  will not fit, not as a general preference: an icon-only button is harder to
  read at a glance than the word "Search".
- **Typeahead** pairs the field with the suggestions popover. Use it when the
  user is looking for a *thing* — a clinician, a ward, a coded term — rather
  than filtering something already on screen.

---

## Content

- The placeholder says **what the field searches**, not how to use it.
  "Search patients", not "Type here".
- For With Button / With Icon Button, name the accepted input:
  "Enter NHS number or name…".
- "No results" quotes the query back — `No matches for "cardew"` — so the user
  can see what was actually tried. It is usually a typo they spot instantly.
- Suggestion sub-text disambiguates (specialty, location, code system). Never
  put information the user needs to make a safe choice there alone.
- Every field has a real label, even standalone search bars. `hideLabel` moves
  it off-screen; it does not remove it.

---

## Accessibility

- **Typeahead follows the WAI-ARIA combobox pattern.** The input is
  `role="combobox"` with `aria-expanded`, `aria-controls` and
  `aria-activedescendant`; the popover is `role="listbox"` with
  `role="option"` rows.
- **Keyboard:** ↓ ↑ move the active row, Home / End jump to the first and last,
  Enter selects, Esc closes the popover and leaves focus in the input.
- **Esc does not clear the query.** Losing a long query to a stray Esc is worse
  than the list staying open.
- **Clear returns focus to the input.** Clearing is a step in searching, not the
  end of it.
- The clear button's accessible name is `Clear search`; the icon button's is
  `Search`.
- **Loading is announced,** not only shown: `Searching…` in a live region
  alongside the spinner.
- **Error is carried by an icon and a message,** not the red border alone. The
  message is linked with `aria-describedby` and the input gets `aria-invalid`.
- The matched run in a suggestion is **bold and** carries the option's
  semantics — the highlight is never the only cue.
- Focus is a 3px `Border/Focus` ring drawn outside the 1px border, so nothing in
  the row moves when focus lands (DDR-006).
- The icon button is 40×40, above the 24×24 minimum of WCAG 2.2 SC 2.5.8 (AA).

---

## Engineering

- Debounce typeahead queries at 150–250ms and cancel in-flight requests on a new
  keystroke, or results arrive out of order and the user sees the answer to a
  query they have already moved past.
- Enforce minimum query length at the API boundary and surface it as the Error
  state: "Enter at least 2 characters".
- Pass `filter={false}` in React when the server has already filtered — the
  default filters locally, which would filter the results twice.
- `@dhcw/sr-react` → `Search` implements the whole keyboard model. If you
  hand-roll the markup, port it too; it is the half people leave out.

---

## Do / Don't

- **Do** keep the placeholder describing the scope of the search.
- **Do** use Typeahead where the user knows roughly what they want but not how
  it is spelled.
- **Don't** use Basic against an expensive backend — that is With Button.
- **Don't** use Search to pick from a short known list; that is Select.
- **Don't** rely on the suggestion sub-text to carry clinical meaning.
- **Don't** clear the query on Esc.

---

## Known gaps

- **Radius.** Figma draws 4px; `--radius-sm` is 2px. The code follows the token,
  as Input and Select already do. This is a system-wide mismatch, not a Search
  one.
- **Suggestion row padding** is 8/12 in code against Figma's 10/14 — 10 and 14
  are off the 4px spacing grid, and 12 matches the Select option's left inset so
  the two lists align in the same form.
- The MAUI implementation does not exist yet. There is no native combobox;
  composing `Entry` + `CollectionView` and hand-wiring the semantics is the
  route, and it needs a decision before it is built.
