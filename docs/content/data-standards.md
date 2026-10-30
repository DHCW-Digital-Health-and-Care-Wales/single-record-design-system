# Content rules: data and copy

How Single Record designs, prototypes and demo data present patient information and write UI
copy. The content checker checks against this file, and the AI guide repeats its key rules.

| | |
|---|---|
| **Status** | Draft for review with WISB and the DHCW Data Standards Team |
| **Primary source** | NHS Wales Data Dictionary v4.25 (3 June 2025) and the DSCNs behind it, copied in `docs/reference/` |
| **Writing style source** | NHS digital service manual content guide, copied in `docs/reference/nhs-service-manual/` |
| **Demo data** | [`demo-patients.md`](./demo-patients.md): ten fictional patients that pass these rules, checked by `npm run check:demo-data` |
| **Last checked** | 2026-10-30. DSCNs up to 2026/23 checked: none since June 2025 changes an item in this file |
| **Owner** | Design lead |

## How to read this file

Every rule has a **status**:

| Status | Means |
|---|---|
| **Sourced** | Taken from the Data Dictionary or a DSCN. The source column names the file in `docs/reference/` |
| **Adapted** | A design system decision built on a source, where the source does not cover screens. The reason is given |
| **Unverified** | No source yet. Follow it, but do not quote it as a standard |
| **Conflict** | Two sources disagree, or our rule differs from a source. Listed under "Open questions" |

**Storage is not display.** Most dictionary entries define how a value is *stored or sent*
(`CCYYMMDD`, `F`). They say what values are valid, not how a screen shows them. Display rules
here are either from a standard that covers display, or are marked Adapted or Unverified.

---

## 1. Writing style

### Capitalisation: sentence case everywhere

Capitalise the first word and proper nouns only. This applies to every piece of UI text:
page titles, headings, card titles, tab labels, buttons, links, field labels, table column
headings, menu items, notifications and error messages.

**Status:** Sourced. The NHS digital service manual: "We do not use block capitals as they're
difficult for people to read. We always use sentence case, including for page titles. This
means we only capitalise the first word and any proper nouns"
(`reference/nhs-service-manual/punctuation.txt`). DHCW UI Standards v1.3 p.9 says the same, and
the design system adopted it (`DESIGN-SYSTEM.md`, Content rules).

Medicines and conditions follow the same manual: generic drug names and conditions are lower
case (`paracetamol`, `type 1 diabetes`); brand names take a capital (`Nurofen Plus`).

| Write | Not |
|---|---|
| View patient record | View Patient Record |
| Patient details | Patient Details |
| Date of birth | Date Of Birth, DATE OF BIRTH |
| NHS number | NHS Number |
| Save and continue | Save And Continue |
| Add allergy | ADD ALLERGY |

**Keep the capitals that belong to the word itself:**

| Kind | Examples |
|---|---|
| Acronyms and initialisms | NHS, GP, CRN, ED, MRI, WISB |
| Proper nouns: organisations, places, systems | Cardiff and Vale University Health Board, Welsh Clinical Portal, Wales |
| A patient's surname in an identity display | ADAMS, Ruby (see Patient name). This is identification, not emphasis |
| Codes | CF14 2AB, W97001 |

**Never** use title case, or capitals for emphasis or for a whole heading. Capitals are harder to
read, and they make a heading look like a surname.

**"NHS number", not "NHS Number".** The dictionary names the data item "NHS Number", because data
item names are written that way. In UI copy it is an ordinary noun: "NHS number", as the NHS
service manual writes it. **Status:** Sourced (`reference/nhs-service-manual/a-to-z-of-nhs-health-writing.txt`).

### Buttons and links

- Start with a verb and name the thing: "Save referral", "View patient record", "Add allergy".
- Never "OK", "Yes", "Submit" or "Click here".
- Sentence case, as above.

**Status:** Adapted (`DESIGN-SYSTEM.md`, Content rules; `patterns/dialogs/guidelines.md`).

---

## 2. Patient identity

### NHS number

| | |
|---|---|
| Display | Three groups of 3, 3 and 4 digits with spaces: `496 806 8271` |
| Valid value | 10 digits. The 10th is a check digit (modulus 11), see below |
| Label | "NHS number" |
| Source | `data-dictionary/nhsnumber.txt` (format, check digit). Display: NHS service manual, "NHS number" (`nhs-service-manual/a-to-z-of-nhs-health-writing.txt`): 3 3 4, a single space as the only separator, never dashes or dots, and do not let it break over two lines. Also `dscn/dscn-2018-09-...` (labels) and DHCW UI Standards p.8 |
| Status | Sourced |

**Check digit** (`nhsnumber.txt`): multiply digits 1 to 9 by 10, 9, 8, 7, 6, 5, 4, 3, 2; add the
results; divide by 11 and take the remainder; subtract it from 11. A result of 11 gives 0. A
result of 10 means the number is invalid. The 10th digit must equal the result.

**For demo data:** use numbers starting 999 that pass the check digit. The NHS service manual:
"do not use a real NHS number as an example – use 999 123 4567 or another number that starts with
9 as these are test numbers and not given to real patients". **Status:** Sourced (NHS England).
Whether NHS Wales follows the same reservation is worth confirming (Open question 3).

### Case record number (CRN) and local patient identifier

| | |
|---|---|
| Display | Prefixed `CRN`: `CRN A000001A` |
| Valid value | Up to 10 alphanumeric characters, unique within a health board. Stored without spaces, leading zeros if needed |
| Label | "CRN" or "Case record number" |
| Source | `data-dictionary/caserecordnumber.txt`, `localpatientidentifier.txt`; display from `dscn/dscn-2018-09-...` (Label 5) |
| Status | Sourced |

### Patient name

| | |
|---|---|
| Display | `SURNAME, Forename`: surname in capitals, a comma, then forenames as written: `ADAMS, Ruby` |
| Title | In brackets after the name if shown: `ADAMS, Ruby (Miss)` |
| Valid value | The patient's preferred name; "the patient is the arbiter of their name". Surname and forename up to 35 characters each |
| Long names | Do not cut a name to fit a design. If space truly runs out, truncate the forenames, never the surname, and end with `…` |
| Source | `data-dictionary/patientsname.txt` (preferred name, 35 + 35). Surname in capitals: `dscn/dscn-2018-09-...` ("so as to easily distinguish this from the forename(s)") |
| Status | Value: Sourced. Display: Sourced for labels; Adapted for screens. Title in brackets: Adapted (`DESIGN-SYSTEM.md`) |

**Not** the storage rule. `patientsname.txt` says to store names in block capitals with
apostrophes removed and hyphens replaced by spaces. That is a data set coding rule. On screen,
show `O'BRIEN, Siân` and `JONES-DAVIES, Mari`, with the apostrophe, hyphen and accent intact.
**Status:** Adapted.

**For demo data:** use Welsh as well as English names, including names with accents, hyphens
and apostrophes, so the design is tested against them: `ap GRUFFUDD`, `O'BRIEN`, `Siân`,
`Llŷr`.

### Date of birth and age

| | |
|---|---|
| Display | `3 Oct 2014 (11 years)`. Day without a leading zero, three-letter month, four-digit year, age in brackets |
| Age | Whole years: someone aged 19 years 11 months is 19 (`data-dictionary/age.txt`) |
| Valid value | A real calendar date, not in the future. Unknown dates of birth are stored as `18111111`; never display that date. Show "Not known" |
| Source | `data-dictionary/birthdate.txt`, `age.txt`. Display: DHCW UI Standards p.11, p.24 |
| Status | Age: Sourced. Display: **Conflict**, see Open questions |

### Sex and gender identity

These are two separate items with separate value sets. Do not label one with the other.

| Item | Values to show | Source |
|---|---|---|
| Sex | Female, Male, Indeterminate (only for a baby whose sex is not yet known), Not disclosed or unknown | `data-dictionary/informationspecification65.txt` (Core Reference Data, Sex: F, M, U, Z) |
| Gender identity | Female, Male, Non-binary, Not disclosed or unknown | Same file (Gender Identity: F, M, N, Z) |

- The label must say which one it is: "Sex" or "Gender". Never "Gender" with a value list for
  sex, or the reverse. **Status:** Sourced.
- "By law, a person's previous sex or gender identity must not be disclosed without their
  explicit consent", and information that could disclose sex must be stored separately from
  gender. For design, this means **do not show sex and gender side by side in the demographic
  record** unless the service has confirmed it may. **Status:** Sourced; the design reading is
  Adapted.
- The addressograph standard prints `Sex not specified` when sex is not recorded
  (`dscn/dscn-2018-09-...`). **Status:** Sourced for labels.

### Marital status, ethnic group, language

Show the description, never the code. Use the descriptions exactly as written in
`data-dictionary/informationspecification65.txt` (Core Reference Data):

- **Marital status:** Single, Cohabiting, Married, Civil partner, Divorced, Person whose civil
  partnership has been dissolved, Widowed, Surviving civil partner, Separated, Not disclosed or
  unknown. Shown in sentence case on screen (Adapted); the source writes them in title case.
- **Ethnic group:** the 2017 categories, grouped under White, Mixed or multiple ethnic group,
  Asian or Asian British, Black or Black British, Other ethnic groups, Not stated
  (`dscn/dscn-2017-06-ethnic-group-v1-1.txt`).
- **Language:** a language name from ISO 639, or "Not known" or "None". Preferred spoken
  language and interpreter need are separate items; communication needs such as BSL, Braille and
  Makaton follow DSCN 2018/01 (`dscn/dscn-2018-01-sensory-loss-communication-needs-v1-0.txt`).

**Status:** Sourced.

---

## 3. Contact and address

### Address

| | |
|---|---|
| Display | One line per address line, postcode on its own last line: `7 Pearse Close` / `Bullion Drive` / `Cardiff` / `CF14 2AB` |
| Valid value | Up to 5 lines of 35 characters, laid out as written, not reflowed |
| No fixed abode | Postcode `ZZ99 3VZ`; display "No fixed abode" |
| Source | `data-dictionary/patientsusualaddress.txt`, `postcodeofusualaddress.txt` |
| Status | Value: Sourced. Postcode on its own line: Unverified (the addressograph puts it on the last line after the county) |

### Postcode

| | |
|---|---|
| Display | Capitals, one space between the outward and inward parts: `CF14 2AB`, `NP4 0AA` |
| Valid value | 2 to 4 character outward code, a space, 3 character inward code (number, letter, letter) |
| Pseudo postcodes | `ZZ99 3VZ` no fixed abode; `ZZ99 3GZ` Wales, not otherwise specified; overseas `ZZ99 …Z` |
| Source | `data-dictionary/postcode.txt`, `informationspecification65.txt` |
| Status | Sourced |

**For demo data:** real postcodes point at real homes. Using a real street with a made-up house
number is common, but whether a reserved fictional range should be used instead is
**Unverified**. The addressograph standard's own example uses `XX12 3XX`, which is not a valid
postcode and will fail validation in a working prototype.

### Telephone and email

No telephone or email item was found in the dictionary pages checked.

| | |
|---|---|
| Display | UK format with a space after the area code: `029 2018 0000`, `07700 900123`. Phone numbers are links that start a call |
| Demo data | Ofcom reserves numbers for drama, including `07700 900000` to `07700 900999` and `029 2018 0000` to `029 2018 0999` |
| Status | Unverified. The Ofcom ranges are well known but not sourced in this repo yet |

---

## 4. GP

| Item | Display | Valid value | Source |
|---|---|---|---|
| GP practice code | `W97001` | 6 alphanumeric characters; Welsh practices start with `W` | `data-dictionary/codeofregisteredgppractice.txt` (format). `W` prefix: Unverified |
| GP code (the GP) | Not shown to clinical users unless asked for | `G` plus 7 digits, the last a check digit | `data-dictionary/gpcode.txt` |
| GP name | `Dr Sian JONES` (title, forename, SURNAME, matching patient names) | | **Unverified**. No source in the dictionary pages checked |

---

## 5. Empty and unknown values

| Situation | Show | Status |
|---|---|---|
| Nothing recorded | "Not recorded" | Adapted (`DESIGN-SYSTEM.md`, Empty states) |
| Recorded as unknown | "Not known" (dictionary value descriptions use "Not known" / "Not disclosed or unknown") | Sourced |
| Patient declined to say | "Not disclosed" | Sourced (Core Reference Data `Z`) |
| No finding, for example no allergies | Say so: "No known allergies" | Adapted (`DESIGN-SYSTEM.md`) |

Never a blank, a dash or `N/A`. A blank cannot be told apart from a loading error.

---

## Open questions for WISB and the Data Standards Team

| # | Question | Why it matters |
|---|---|---|
| 1 | **Date format on screen.** UI Standards v1.3 and the addressograph standard use `13-Feb-1986`. The design system uses `13 Feb 1986`. The NHS service manual uses `6 August 2018` and asks for full month names where possible, because "screen readers read out shortened months (Jan, Feb and so on) in inconsistent and sometimes confusing ways" (`nhs-service-manual/numbers-measurements-dates-time.txt`). The addressograph standard covers printed labels only. Is there a standard for screens? | Every date in every design, and screen reader users |
| 1a | **Time format.** The design system uses 24-hour time (`14:05`). The NHS service manual, written for the public, uses `5pm` and `5:30pm`. Clinical systems commonly use 24-hour. Confirm 24-hour for Single Record | Every timestamp |
| 2 | **NHS number display on screen.** The NHS England Common User Interface standard (ISB 1504) covered input and display. Has Wales adopted it, or the NHS Number Operational Standard's display section (DSCN 2015/06), whose full text is not in the dictionary? | We follow 3 3 4 everywhere; the source for screens is unconfirmed |
| 3 | **Test data ranges.** NHS England reserves NHS numbers starting 9 for test use. Does NHS Wales follow this, and is there a sanctioned range of CRNs, GP practice codes and postcodes for demo data? | Demo data must not identify a real person |
| 4 | **Name display.** Confirm `SURNAME, Forename (Title)` for screens, and how to show a preferred name that differs from the legal name | Patient identification |
| 5 | **Sex and gender on the demographics screen.** Which one Single Record shows, and whether both may appear | Legal requirement on disclosure |
| 6 | **New Data Dictionary platform.** v4.25 is the last version on the current site. When does the new platform launch, and at what address? | This file must follow it |

---

## Changing this file

- A new rule needs a source in `docs/reference/` or a status of Adapted or Unverified with the
  reason.
- Refresh the sources with `node scripts/fetch-data-dictionary.mjs` and review the diff.
- Update `docs/ai/ai-guide-intro.md` in the same change when a rule affects what an AI tool
  writes.
