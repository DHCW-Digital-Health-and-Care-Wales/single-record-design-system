# DDR-012 — Date & time entry: 3-field input by default, calendar picker for scheduling

**Date:** 2026-07-01
**Status:** Accepted
**Decided by:** Design lead

---

## Context

The Single Record programme captures dates in two very different situations:

1. **Dates the user already knows** — date of birth, date of admission, date symptoms started, date of an incident. The user can type these.
2. **Dates the user is choosing** — booking an appointment, selecting from availability, picking a date near "today" where day-of-week or surrounding context matters.

GDS and the NHS service manual both treat these differently, and our own working rule is to *align with GDS / NHS England patterns before inventing new ones*. There was also a question of whether the GDS "three separate fields" guidance applies to **internal** clinical tools, or only to public-facing services / birthdays.

---

## Decision

### Default: a three-field date input (day / month / year)

`DateInput` — three separate text fields — is the **default** date-entry control for any date the user is expected to know. This matches the GDS *Dates* pattern and the NHS *Date input* component.

It is **not** only for dates of birth. DOB is simply the clearest example of a *known* date; the pattern applies to any typed, known date (admission, onset, incident, etc.).

### Calendar picker: for choosing, not typing

`DatePicker` (a calendar popover) is used **only** where the user is selecting a date and the calendar context helps — appointment booking, availability, dates near today. It is never the default for known dates: scrolling a calendar to a DOB decades in the past is slow and error-prone, and many calendar widgets fail WCAG.

### Time: text field or select, not a spinner

Time is entered with a **single text field** (e.g. `09:30`) or a **`<select>` of constrained slots** where the options are fixed (e.g. clinic appointment times). We do **not** build a scroll/wheel time picker — it adds little over a text field and is harder to operate with a keyboard or screen reader.

| Situation | Control |
|---|---|
| Known date (DOB, admission, onset, incident) | `DateInput` — 3 fields (**default**) |
| Choosing a date (appointment, availability, near today) | `DatePicker` — calendar popover |
| Free time entry | Text field (`Input type="time"`, `HH:MM`) |
| Constrained time slots | `<select>` of slots (`TimeSelect`) |

---

## Compliance — does it apply to us?

Two separate things, often conflated:

1. **WCAG 2.2 AA is the hard, legal baseline** (DDR-002). The Public Sector Bodies (Websites and Mobile Applications) Accessibility Regulations 2018 cover public-sector digital services **including new internal / intranet tools** — the historical intranet exemption only covered systems published before 23 Sept 2019 and not significantly revised since. As NHS Wales building new internal clinical software, WCAG 2.2 AA applies to us. Many calendar-picker widgets fail AA (keyboard traps, weak SR support); the 3-field input avoids those failure modes.
2. **The 3-field pattern itself is a design *standard*, not a distinct legal clause.** WCAG does not literally mandate three fields. But it is one of the most established GDS/NHS patterns, and our own principle is to align with GDS/NHS. So for this project it is adopted as the default even though the *enforceable* line is WCAG.

**Conclusion:** adopt the 3-field input as the default (design-standard + WCAG-friendly), keep the calendar picker for scheduling. Internal-only status does **not** exempt new tools from WCAG.

---

## Behaviour & accessibility (mandatory)

### DateInput (3-field)

- Wrapped in a `<fieldset>` with a `<legend>` naming the date ("Date of birth").
- Three labelled `<input>`s — Day, Month, Year — each `inputmode="numeric"`, `autocomplete` where relevant (`bday-day` / `bday-month` / `bday-year` for DOB).
- Day/Month fields are 2 characters wide, Year 4 — width signals expected input.
- Hint and error are associated with the group via `aria-describedby` on the fieldset; error state also sets `aria-invalid` on the affected inputs.
- One error message per group; on error, move focus to the first field in error.
- Do **not** auto-advance between fields (breaks correction and SR flow).

### DatePicker (calendar popover)

- Triggered from a text field with a calendar icon; opens a `role="dialog"` grid.
- Grid is a `role="grid"`; day cells are buttons; the selected day is `aria-selected`, today is marked, out-of-range days disabled.
- Keyboard: arrow keys move by day, PageUp/Down by month, Enter selects, Escape closes and returns focus to the trigger.
- Month navigation uses `Icon/nav/chevron-left` / `Icon/nav/chevron-right`.
- The field remains directly typeable — the picker is an enhancement, never the only way in.

---

## Tokens & dependencies

- Reuses Input tokens (`Surface/Section Cards`, `Border/Default`, `Border/Focus`, `Status/Critical`, radius `sm`, spacing, type scale).
- Focus ring: SR accent cyan ring per DDR-006.
- **No third-party date library.** The calendar grid is built custom against SR tokens, keeping `@dhcw/sr-web` framework-agnostic and free of supply-chain risk. Any future move to a headless library (e.g. `react-day-picker`) would be React-package-only and needs its own DDR.

---

## Alternatives considered

**Calendar picker as the default for all dates.** Rejected: GDS/NHS explicitly advise against it for known dates; slow for distant dates and a common source of AA failures.

**Native `<input type="date">` everywhere.** Rejected as the sole solution: inconsistent cross-browser UI, weak styling control, and poor for distant known dates. Acceptable as a progressive-enhancement fallback only.

**Wheel/spinner time picker.** Rejected: no real benefit over a text field or select, and worse for keyboard/SR users.
