# Content evidence for the UI standards review

The UI Standards Guide v1.3 was written without citing its sources, and parts of it have been
copied from older guidance. This file lists the standards in `standards-inventory.md` that now
have **primary evidence**: the NHS Wales Data Dictionary, its DSCNs and the NHS digital service
manual. It also records what checking real designs against them found.

Use it when setting a disposition: a standard with evidence can be decided; one without needs a
source or a WISB/DSCN decision.

| | |
|---|---|
| **Rules built from this evidence** | [`../content/data-standards.md`](../content/data-standards.md) (each rule marked Sourced, Adapted or Unverified) |
| **Sources (copies)** | [`../reference/data-dictionary/`](../reference/data-dictionary/) (v4.25), [`../reference/dscn/`](../reference/dscn/), [`../reference/nhs-service-manual/`](../reference/nhs-service-manual/) |
| **Checks** | `npm run check:content` (website, prototypes), the content-checker agent (Figma), `npm run check:demo-data` |
| **Design findings** | [`../content/reports/2026-10-30-figma-content-check.md`](../content/reports/2026-10-30-figma-content-check.md) |
| **Last updated** | 2 Nov 2026 |

## Standards with evidence

| # | UI Standard (v1.3) | Evidence | Agrees? | Suggested disposition |
|---|---|---|---|---|
| 3 | NHS number 3-3-4 with spaces [p.8] | NHS service manual, "NHS number": 3 3 4, a single space as the only separator, never dashes or dots, do not break across lines (`nhs-service-manual/a-to-z-of-nhs-health-writing.txt`). Format and modulus 11 check digit: `data-dictionary/nhsnumber.txt`. Operational standard: DSCN 2015/06 | Yes | `CARRY`, add: test numbers start 999 and pass the check digit |
| 5 | Sentence case for all text [p.9] | NHS service manual: "We always use sentence case, including for page titles" and no block capitals (`nhs-service-manual/punctuation.txt`) | Yes | `CARRY`. Add the exceptions list: acronyms, proper names, the patient's surname |
| 6 | Users' names `SURNAME, First M, Title…` [p.9] | Patient name: `data-dictionary/patientsname.txt` (preferred name, 35 + 35 characters); surname in capitals to tell it from forenames: DSCN 2018/09. No source found for **staff** names | Partly | `REVIEW`. Patient names are sourced. Staff names in designs are written `Rhys Fidler`, not `FIDLER, Rhys`; decide whether #6 applies on screen |
| 8, 9 | Abbreviations; ampersand → "and" [p.10–11] | No primary source found. Designs use `Accident & Emergency` and `Dept`, confirmed as names by the design lead | Conflict | `REVIEW`: does #9 apply inside a department's own name? |
| 10, 23 | Never blank; "Unknown or not recorded" [p.11, p.23] | Core Reference Data values use "Not known" and "Not disclosed or unknown" (`data-dictionary/informationspecification65.txt`) | Partly | `ADAPT`: "Not recorded" (nothing entered), "Not known" (recorded as unknown), "Not disclosed" (declined) |
| 11 | Date of birth with age in brackets [p.11] | Age in whole years: `data-dictionary/age.txt` | Yes | `CARRY`. Write `(33 years)`, not `(33y)`; ages typed into designs go stale (found in 11 places) |
| 25 | Dates `dd-Mmm-yyyy` with leading zero [p.24] | Addressograph standard uses `13-Feb-1986`, but its scope is printed labels inside case notes only (DSCN 2018/09, Scope). NHS service manual: `6 August 2018`, full month names where possible, because screen readers read shortened months inconsistently (`nhs-service-manual/numbers-measurements-dates-time.txt`) | **Conflict** | `REVIEW` with WISB. The design system uses `10 Mar 2026` |
| 44 | Addressograph label [p.56] | DSCN 2018/05 and 2018/09: NHS number 3-3-4, `SURNAME, Forename`, date of birth right-aligned, sex shown (`Sex not specified` when not recorded), CRN top right | Yes | `CARRY` for printed labels. Not a screen standard |
| 46 | Surnames in capitals (footer) [p.58] | DSCN 2018/09 | Yes | `CARRY` |
| new | Sex and gender identity | Two separate items with different values. Sex: F, M, U (only for a baby), Z. Gender identity: F, M, N (non-binary), Z. Previous sex or gender identity must not be disclosed without consent, and sex is stored separately from gender (`data-dictionary/informationspecification65.txt`) | Not in v1.3 | New standard. Designs mixed the two |
| new | Postcode | Capitals, one space; no fixed abode `ZZ99 3VZ` (`data-dictionary/postcode.txt`, `informationspecification65.txt`) | Not in v1.3 | New standard |
| new | Demo and test data | NHS numbers starting 9 are test numbers never issued (NHS service manual) | Not in v1.3 | New standard: use `docs/content/demo-patients.md` |

## What checking real designs found

From the content checks of 30 Oct and 2 Nov 2026 (website, Case Note Tracking prototype, Figma
pages Single Record App, Adoption Mobile and Adoption UEC). These show which standards were not
being followed, and so where the guide needs to be clearer.

| Finding | Where | How many | Standard |
|---|---|---|---|
| NHS numbers that fail the check digit (`000 111 2222`, `123 456 7890`, unspaced numbers) | Website, prototype, UEC | 47 | #3 |
| Valid NHS numbers outside the test range: could be real people | Mobile, UEC | 9 | #3 (new: test data) |
| Several patients sharing one NHS number | Prototype | 5 | #3 |
| Ages that no longer match the date of birth | Mobile | 12 | #11 |
| Ages abbreviated `(33y)` | Website, prototype, UEC | 13 | #11 |
| Title case in headings, buttons and labels | All | about 300 | #5 |
| Hyphenated dates `24-Apr-2026` | Mobile, UEC, Timeline component | 31 | #25 (conflict) |
| Stored dates on screen `2026-08-18` | UEC, website | 13 | #25 |
| Patient names not `SURNAME, Forename` | UEC tracking grid | 8 | #6 |
| "NHS Number" / "NHS No" as labels | UEC | 5 | #3, #8 |

All but the hyphenated dates are now fixed, in code and in Figma.

## How the open questions were settled

By research, not by asking a board: see **DDR-037** (published sources supersede v1.3) and the
"Decided" table in [`../content/data-standards.md`](../content/data-standards.md). In short:
dates `10 Mar 2026` (no hyphens), 24-hour time, "Accident and Emergency", 999 demo NHS numbers,
staff names as v1.3 #6 until a newer source exists, and sex and gender identity as separate items.
