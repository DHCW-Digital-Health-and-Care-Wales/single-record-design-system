# Patient Search

> How staff find the right patient: by NHS number or case number first, by name
> and date of birth when the number is not known, and by scanning the wristband
> on a phone. Every route ends with the user confirming who the patient is.

| | |
|---|---|
| **Type** | Pattern |
| **Status** | In review |
| **Reference** | Components: Search, Segmented control, Input, Date input, Radios, Button, Patient card (mobile), Bottom sheet (mobile) |
| **Figma** | Patient search set (`2845:8596`, Quick search and Advanced) · mobile screens on the Adaptations Mobile page (`5443:23237`) |
| **Related standards** | UI Standards #3 (NHS number), #6 (names), #11 (date of birth), #25 (dates) |
| **Last updated** | 2026-10 |

---

## When to use

- Whenever a user has to choose a patient before they can view or act on a record.
- As the entry point to any patient-context screen that is not reached from a list the user already trusts (a ward list, a clinic list).

## When not to use

- To filter a list the user is already looking at. Use the list's own sort and filter.
- To search for anything other than a patient (documents, tests, staff). Use the Search component on its own.

## How it works

- **Quick search is the default.** One field takes an NHS number or a case number. NHS numbers are shown in groups of 3, 3 and 4 (`444 353 9875`) as the user types.
- **Advanced search** is a second option on the same control, for when the number is not known. Fields: NHS number or case number, surname, forename, date of birth, postcode. Surname and forename each have a match option: Containing, Exact match, Sounds like.
- **Scan** sits next to the field. On mobile it opens the camera straight away, reads the wristband barcode without a shutter button, and offers a torch. "Enter NHS number instead" is always one tap away.
- **Every result is confirmed.** A scan or a search can match more than one patient. Show each match as a patient card with name, date of birth and identifier, and ask the user to compare them with the wristband or the request before opening a record. Never open a record automatically.
- **On mobile, Advanced search collapses after it runs.** The results show a one-line summary of the criteria with a Change button, so the results start near the top of the screen.

## Options

| Option | Use when |
|---|---|
| Quick search | The user has the NHS number or case number. Most searches. |
| Advanced search | The number is not known. |
| Scan (mobile) | A wristband or label is available. Fastest and least error-prone. |
| Recent patients | The user is returning to a patient they opened recently. Show below the search field on mobile. |

## Do & don't

| Do | Don't |
|---|---|
| Format the NHS number as 3, 3, 4 with spaces | Show or accept two-digit years for date of birth |
| Say exactly what is wrong: "NHS number must be 10 digits. You have entered 9." | Clear what the user typed when the search fails |
| Show every match and ask the user to choose | Open a record straight from a scan, even when only one patient matches |
| Keep "Enter NHS number instead" visible on the camera screen | Put a "Tap to scan" page between the scan button and the camera |
| Show the criteria used above the results | Leave the full Advanced form pushing results off screen on mobile |

## Accessibility

- The search field has a visible label. The scan button is named "Scan wristband", not left as an icon.
- Errors are announced and tied to the field. The field keeps its value.
- The camera screen gives the same choices without the camera: the "Enter NHS number instead" link is a real control, reachable by keyboard and screen reader.
- The torch button states its state in words ("Torch on" / "Torch off"), not by colour.
- Tap targets are at least 44 by 44 px (WCAG 2.2 SC 2.5.8 asks for 24, mobile platforms ask for 44 to 48).

## Content

- Patient names: `SURNAME, Forename`. Date of birth with age: `15 Jun 1939 (86 years)`. Both rules are under review with WISB and DSCN; follow this page until they are settled.
- Match options read "Containing", "Exact match", "Sounds like". "Starts with" is being checked against the standard.
- Button labels say what happens: "Search", "Clear", "Open record", "Neither matches, scan again".

## Known gaps

- **The web Advanced variant in Figma has content errors.** The surname and forename placeholders are swapped, "Forename searching methods" lists See and treat, Rapid assessment and Triage (copied from another component), and date of birth shows `dd-mm-yy`. Fix before the design is shown to clinicians.
- **Local health board or All Wales.** The old app offered both. Where that choice lives is not yet decided.
- **No code.** This pattern is composed from existing components; there is no PatientSearch component in any framework yet.

## Frameworks

| Framework | Status | Where |
|---|---|---|
| Web (HTML/CSS) | Composed from components | `packages/web/src/search`, `segmented-control`, `input`, `date-input`, `radio` |
| React | Composed from components | `packages/react/src/…` (same set) |
| Blazor / .NET | Stylesheet only. Compose the markup with the same `sr-` classes | `@dhcw/sr-web` CSS |
| .NET MAUI | Design only | Mobile screens in Figma; native XAML on the token layer (DDR-021) |
| Legacy (.NET 4.8 / Delphi) | Tokens only | Token CSS custom properties |
