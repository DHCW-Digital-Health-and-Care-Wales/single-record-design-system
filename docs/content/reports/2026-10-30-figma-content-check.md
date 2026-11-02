# Figma content check: 30 Oct 2026

Pages: **Single Record App** (`5:3226`), **Adoption Mobile** (`5443:23237`), **Adoption UEC**
(`1363:23684`). Rules: [`../data-standards.md`](../data-standards.md). Run with
`scripts/figma/build-check-in-figma.mjs`, then read by a person.

| Page | Text layers | Findings | After review |
|---|---|---|---|
| Single Record App | 103 | 5 | 4 to fix |
| Adoption Mobile | 651 | 63 | about 50 to fix |
| Adoption UEC | 1,433 | 269 | about 200 to fix; the rest are proper names or table values |

Ids are Figma node ids. Paste one into the Figma search, or ask Claude to select it. Ids starting
`I` are layers inside a component instance; fix those in the main component where the text is
the component's default.

## Fixed on 30 Oct 2026

All of section 1, and the patient banner button labels, are fixed in Figma. A re-check of the
three pages and the Patient banner page finds none of the old values.

| Where | Changes |
|---|---|
| Main components: Patterns/Patient Banner, Products/Mobile/Patient card, Bottom sheet, Patient context header | 31 |
| Screens and instance overrides: Single Record App 47, Adoption Mobile 37, Adoption UEC 41 | 125 |

NHS numbers now come from the 999 test range: Ruby ADAMS `999 000 0018` (her demo-patient
number); the patient banner example `999 000 0204`; the rest `999 000 0212` to `999 000 0328`,
one per patient. Ages are corrected and written in full. The tracking-grid names are now
`SURNAME, Forename`. The patient banner buttons are sentence case ("Change patient", "Show
details"). No text now wraps where it did not before.

**Not changed yet:** hyphenated dates. Settled 2 Nov 2026 (DDR-037): screens use spaces, so these are now errors to fix.

**2 Nov 2026:** all of section 2 fixed in Figma: 197 changes across 50 distinct texts (headings,
buttons, form labels). Section 3 confirmed by the design lead as proper names; left as written
and added to the checker's known names (`scripts/content-rules.mjs`).

## 1. Patient data (fix first)

These are the findings a clinician spots in a demo.

| Page | Found | Problem | Fix | Count | Example ids |
|---|---|---|---|---|---|
| UEC | `000 111 2222` | Fails the NHS number check digit | A demo patient's number, e.g. `999 000 0204` | 14 | `I1753:14110;462:6196;1865:9008;1711:15612` |
| UEC | `1357924680`, `0987654321`, `1122334455`, `5678901234`, `5566778899`, `2468013579`, `9753124680`, `8642097531` | Not grouped 3 3 4, and all but one fail the check digit. `8642097531` passes, so it could be a real person's number | Demo patient numbers, grouped `999 000 0018` | 23 | `I2366:23711;462:6196;2366:23830;1122:14447` |
| Mobile | `496 806 8271`, `444 353 9875`, `484 233 3057` | Valid numbers outside the test range: could belong to real people | `999 000 0018` (Ruby ADAMS) and other demo patients | 8 | `5958:12370`, `5769:1371`, `5777:2034` |
| Mobile | `3 Oct 2014 (11y)`, `3 Oct 2014 (11 years)` | Ruby is 12 | `3 Oct 2014 (12 years)` | 11 | `5842:46139`, `5962:489` |
| Mobile | `15 Jun 1939 (86 years)` | Is 87 | `(87 years)`, in the Patient card component `5769:1365` | 1 | `5769:1370` |
| UEC | `15 Dec 1992 (33y)` | Age abbreviated | `(33 years)` | 10 | `I1753:14110;462:6196;1865:9008;1770:10716` |
| UEC | `2026-08-18` | Stored date format on screen | `18 Aug 2026` | 3 | `4562:25633` |
| All | `24-Jan-2024`, `24-Apr-2026`, `04-Jun-2026`, `25-Jun-2026`, `8-Jun-2026`, `25-Nov-2025` | Hyphenated label-style dates; screens use spaces | `24 Jan 2024` (DDR-037) | 31 | `5801:42045`, `3555:15308` |
| UEC | `Noah Davis`, `Ava Martinez`, `Ethan Wilson`, `Sophia Garcia` (tracking grid) | Patient names not as `SURNAME, Forename`, and not demo patients | `DAVIS, Noah`, or demo patients | 8 | `I2366:23711;462:6196;2366:23780;1122:14447` |
| UEC | `NHS Number` (labels), `NHS No` (column) | Should be `NHS number` | `NHS number` | 5 | `I1753:14110;462:6196;1786:10984;840:14313` |

## 2. Capitalisation

### Headings and buttons (errors)

| Found | Fix | Page | Count |
|---|---|---|---|
| Discharge Advice Letter | Discharge advice letter | Mobile | 12 |
| Assessment: Nursing Assessment Tool | Assessment: nursing assessment tool | Mobile | 6 |
| Attendance History | Attendance history | UEC | 10 |
| Change Patient, View Patient record, Print Patient label | Change patient, View patient record, Print patient label | UEC | 15 |
| Show Details, Hide Details | Show details, Hide details | UEC | 10 |
| Quick Actions | Quick actions | Mobile | 4 |
| Current Admission Details | Current admission details | Mobile | 2 |
| My Patient Tasks | My patient tasks | Mobile | 1 |
| Test Request, PBIC [Request], GTT [Request] | Test request, PBIC [request] | Mobile | 4 |
| Add Investigation, Add Treatment | Add investigation, Add treatment | SR App, UEC | 6 |
| Urgent and Emergency Department Tracking Grid | Urgent and emergency department tracking grid | UEC | 2 |
| Tracking Grid, Filter Grid, Manage Columns | Tracking grid, Filter grid, Manage columns | UEC | 4 |
| Telephone Consultation | Telephone consultation | UEC | 1 |
| Paediatric Safeguarding Screening | Paediatric safeguarding screening | UEC | 2 |
| Patient Group Directives (PGD) — Administration Re… | Patient group directives (PGD) — administration… | UEC | 6 |
| Data Capture only - Not an e-prescribing… | Data capture only - not an e-prescribing… | UEC | 6 |
| TOTAL SCORE | Total score | UEC | 1 |

### Field labels (warnings)

UEC forms: Temporary Address, Marital Status, Ethnic Group, GP Practice, Presenting Complaint,
Right Eye, Left Eye, Injury Intent, Attendance Registered, Initial Discriminator, Triage
Category, Pregnancy Status, GCS Eye Opening, GCS Verbal Response, GCS Motor Response, PGD
Comments, Peak Flow, Pupil Reactions, Visual Acuity, Treatment Plan, Social History, Family
History, Collateral History, Assessment Started Date, Assessment Started Time, Chief Complaint.
All become sentence case: `Marital status`, `GCS eye opening`, `Peak flow`.

`Last Updated on 04-Jun-2026 10:33hrs by Rhys Fidler` → `Last updated 4 Jun 2026 at 10:33 by
Rhys FIDLER` (check the staff-name format with the UI standards; `hrs` after a 24-hour time is
not needed).

## 3. Flagged, but probably correct: your call

| Found | Why it may be right | Decide |
|---|---|---|
| NHS All Wales Record | Product name | If yes, I add it to the known names |
| Minor Injury Unit, RGH Accident & Emergency, Major Emergency Care Dept | Department and site names (the old role guess treated table cells as tabs; fixed) | Names of real units keep their capitals. `Dept` should be `Department` |
| Open Manchester Triage | Manchester Triage System is a product name | Keep `Manchester Triage`; `Open` stays |
| Glasgow Coma Score | Named clinical scale | Usually `Glasgow Coma Scale`; check with clinical leads |
| Patient detained under the Mental Health Act? | Act names keep capitals | Correct as is |
| News 2 Key, SpO2 Scale 1, ACVPU | NEWS2 is an acronym; ACVPU is an acronym | Write `NEWS2 key`, `SpO2 scale 1`; `ACVPU` is correct |
| Injury of Wrist, Abdominal Pain (grid) | Conditions are lower case after the first word (NHS service manual) | `Injury of wrist`, `Abdominal pain` |
| Hello Chukwunonso, Chukwunonso Nweke, Logout Chukwunonso.nweke@… | Staff names are proper nouns | Names are fine. `Logout` as a button is `Log out` |

## 4. Not checked

- Text inside images and screenshots on these pages.
- Hidden layers and hidden component variants.
- The "IGNORE THIS SECTION" and "ARCHIVED (IGNORE)" areas on Adoption Mobile are labels on the
  canvas, not containers, so their frames were checked too. Skip findings there.
- Whether the content is the right content (that needs the screen's purpose).
