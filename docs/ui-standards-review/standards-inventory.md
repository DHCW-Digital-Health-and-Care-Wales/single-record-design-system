# UI Standards Guide v1.3 — Standards Inventory (triage worksheet)

Every standard in the guide, grouped by theme, with a source anchor and a
**Disposition** to be set during review. Page anchors point into
`../reference/dhcw-ui-standards-v1.3.md` (`[p.N]`).

**Disposition legend**

| Code | Meaning |
|---|---|
| `CARRY` | Carry forward as-is — clinical/content/interaction rule still valid |
| `ADAPT` | Carry the intent, but re-express for the token/multi-platform system |
| `TOKEN` | Superseded by design tokens — legacy value, do not import |
| `COMPONENT` | Belongs in a specific component/pattern spec |
| `CONTENT` | Belongs in content/writing guidelines |
| `REVIEW` | Needs a decision / clarification with the design authority |
| `DROP` | Desktop-eForm-specific or obsolete — not for the new system |

> Disposition column starts blank — fill in during the review sessions.

---

## Core concepts & ways of working

| # | Standard | Source | Disposition |
|---|---|---|---|
| 1 | One document = single event, single person, single author; don't merge processes into one form | [p.5](../reference/dhcw-ui-standards-v1.3.md#page-5) | |
| 2 | Consistency across concepts, data model, interactions, presentation, UI; benefits list | [p.7](../reference/dhcw-ui-standards-v1.3.md#page-7) | |

## Presentation of information

| # | Standard | Source | Disposition |
|---|---|---|---|
| 3 | **NHS number** formatted in 3-3-4 groups with spaces (`123 456 7890`) | [p.8](../reference/dhcw-ui-standards-v1.3.md#page-8) | |
| 4 | "Non NHS Wales" label (no hyphen) + hover text; GP treated as NHS Wales | [p.8](../reference/dhcw-ui-standards-v1.3.md#page-8) | |
| 5 | **Sentence case** for all text | [p.9](../reference/dhcw-ui-standards-v1.3.md#page-9) | |
| 6 | **Display of users' names**: `SURNAME, First M, Title (GMC:…), Role, Speciality`; never show nurse PIN | [p.9](../reference/dhcw-ui-standards-v1.3.md#page-9) | |
| 7 | Dropdown symbol must be an **arrow, never a triangle** | [p.10](../reference/dhcw-ui-standards-v1.3.md#page-10) | |
| 8 | **Abbreviations**: avoid; no full stops (ECG not E.C.G.); tooltip + dashed underline when unavoidable; micrograms in full | [p.10](../reference/dhcw-ui-standards-v1.3.md#page-10) | `ADAPT` — add a table-heading **exception**: allow `No.` for "Number" in column headings where width is tight. Land in the Tables guideline. |
| 9 | Apostrophes/contractions: avoid; Ampersand → "and"; Forward slash → "or" | [p.11](../reference/dhcw-ui-standards-v1.3.md#page-11) | |
| 10 | Use **default values** where possible; never blank | [p.11](../reference/dhcw-ui-standards-v1.3.md#page-11), [p.23](../reference/dhcw-ui-standards-v1.3.md#page-23) | |
| 11 | **Standard DHCW date of birth**: DoB followed by age in brackets | [p.11](../reference/dhcw-ui-standards-v1.3.md#page-11) | |
| 12 | **Chronology order** (oldest first, exceptions for docs/results lists; sortable) | [p.12](../reference/dhcw-ui-standards-v1.3.md#page-12) | |
| 13 | **Tooltips/explanatory text**: no info icon; show on hover/focus; don't obscure the question | [p.13](../reference/dhcw-ui-standards-v1.3.md#page-13) | |
| 14 | Medications — follow NPSA guidance | [p.13](../reference/dhcw-ui-standards-v1.3.md#page-13) | |
| 15 | Form design / fonts — relative sizes for zoom; line spacing legibility | [p.14](../reference/dhcw-ui-standards-v1.3.md#page-14) | |
| 16 | **Tables** option 1 (attributed, burger menu, reorder) vs option 2 (in-situ, multi-entry) | [p.15](../reference/dhcw-ui-standards-v1.3.md#page-15)–[16](../reference/dhcw-ui-standards-v1.3.md#page-16) | |
| 17 | **Status badges** (Draft, Highly sensitive, Countersignature required, Misfiled, etc.); placement, alphabetical order, red box (forms) / black box (PDFs) | [p.17](../reference/dhcw-ui-standards-v1.3.md#page-17)–[18](../reference/dhcw-ui-standards-v1.3.md#page-18) | |
| 18 | **Mutually exclusive options**: 2–5 radios, 6–15 dropdown, >15 dropdown + fuzzy | [p.19](../reference/dhcw-ui-standards-v1.3.md#page-19) | |
| 19 | **Viewing highly sensitive** — pale pink tile, blue on hover | [p.19](../reference/dhcw-ui-standards-v1.3.md#page-19) | |
| 20 | **Patient banner** — three sections (reactions/warnings, details, actions); Welsh-language icon; deceased; warning triangle | [p.20](../reference/dhcw-ui-standards-v1.3.md#page-20) | |
| 21 | **Radio buttons** — 1 choice; Yes/No/Unknown-or-not-recorded ordering; Other placement | [p.21](../reference/dhcw-ui-standards-v1.3.md#page-21) | |
| 22 | **Checkboxes** — multi-select; heading, left-aligned, right labels, single column, alphabetical; Other at end | [p.22](../reference/dhcw-ui-standards-v1.3.md#page-22) | |

## Functionality

| # | Standard | Source | Disposition |
|---|---|---|---|
| 23 | **Dropdown lists** — default "Unknown or not recorded"; split Unknown/Not recorded when needed; alphabetical | [p.23](../reference/dhcw-ui-standards-v1.3.md#page-23) | |
| 24 | Auto-learning users' favourites | [p.24](../reference/dhcw-ui-standards-v1.3.md#page-24) | |
| 25 | **Dates** format & display (leading 0, `dd-Mmm-yyyy`) | [p.24](../reference/dhcw-ui-standards-v1.3.md#page-24) | `ADAPT` (2026-07, design lead) — the *named month* is carried forward, the hyphens are not. Use `10 Mar 2026` in tables and space-constrained UI, `10 March 2026` in prose. Supersedes the earlier `CARRY` disposition. |
| 26 | **Date/time picker** — launch, manual entry, nudge, today=red / selected=blue / hover=orange; customisation options | [p.25](../reference/dhcw-ui-standards-v1.3.md#page-25)–[26](../reference/dhcw-ui-standards-v1.3.md#page-26) | |
| 27 | **Copy & paste** patient-safety rules — never across patient records; logging; future "copy link" | [p.27](../reference/dhcw-ui-standards-v1.3.md#page-27)–[28](../reference/dhcw-ui-standards-v1.3.md#page-28) | |
| 28 | **SNOMED search fields** — always allow free text; warning triangle (not coded) / green tick (coded) icons | [p.29](../reference/dhcw-ui-standards-v1.3.md#page-29) | |
| 29 | **Free text boxes** — single vs multi line; widths (≤75%), auto-resize, no scrollbar, optional countdown | [p.30](../reference/dhcw-ui-standards-v1.3.md#page-30) | |
| 30 | **Watermarks** — do not use (use status badges) | [p.30](../reference/dhcw-ui-standards-v1.3.md#page-30) | |
| 31 | **Mandatory fields** — red asterisk right of label; section count in orange → green tick when complete | [p.31](../reference/dhcw-ui-standards-v1.3.md#page-31) | |
| 32 | **Fuzzy matching** — recommended >15 options | [p.32](../reference/dhcw-ui-standards-v1.3.md#page-32) | |
| 33 | **Links** — blue underlined; navigation only, not data-changing actions; work with Back | [p.32](../reference/dhcw-ui-standards-v1.3.md#page-32) | |
| 34 | **Access to information** — not restricted beyond auth/break-glass; RBAC reviewed by DHCW | [p.33](../reference/dhcw-ui-standards-v1.3.md#page-33) | |
| 35 | **Editing** window until Final/Final-Send | [p.33](../reference/dhcw-ui-standards-v1.3.md#page-33) | |
| 36 | **No autosave** — ever (IG/data-security rationale) | [p.34](../reference/dhcw-ui-standards-v1.3.md#page-34) | |
| 37 | **Misfiling** — only for wrong-patient; Potentially misfiled → Misfile; permanence; metadata pink | [p.35](../reference/dhcw-ui-standards-v1.3.md#page-35)–[37](../reference/dhcw-ui-standards-v1.3.md#page-37) | |
| 38 | **Icons** — restricted set; orange triangle = warning (hover explains); no other icons | [p.38](../reference/dhcw-ui-standards-v1.3.md#page-38)–[41](../reference/dhcw-ui-standards-v1.3.md#page-41) | |
| 39 | **Re-use / carry forward** — attribution added; whole sections/rows; draft & highly-sensitive rules (warnings, break-glass) | [p.42](../reference/dhcw-ui-standards-v1.3.md#page-42)–[44](../reference/dhcw-ui-standards-v1.3.md#page-44) | |
| 40 | **Signature line / section** — checkboxes & buttons (Highly sensitive, Final/Final-Send, Countersignature, Save & close), NADEX field, cooling-off | [p.45](../reference/dhcw-ui-standards-v1.3.md#page-45)–[48](../reference/dhcw-ui-standards-v1.3.md#page-48) | |
| 41 | **Warning messages** — save/close scenarios; mandatory-data red warnings; cancel | [p.49](../reference/dhcw-ui-standards-v1.3.md#page-49)–[51](../reference/dhcw-ui-standards-v1.3.md#page-51) | |
| 42 | **Highly sensitive** mark/unmark — mandatory reason field, auto-scroll | [p.52](../reference/dhcw-ui-standards-v1.3.md#page-52)–[53](../reference/dhcw-ui-standards-v1.3.md#page-53) | |
| 43 | **Draft status** + **cooling-off / finalisation** (default 4h) | [p.54](../reference/dhcw-ui-standards-v1.3.md#page-54)–[55](../reference/dhcw-ui-standards-v1.3.md#page-55) | |

## PDFs

| # | Standard | Source | Disposition |
|---|---|---|---|
| 44 | **Addressograph label** — top-right every page; Arial 11 bold NHS number 3-3-4; barcode Code 39 | [p.56](../reference/dhcw-ui-standards-v1.3.md#page-56) | |
| 45 | **Header** rules — date label never just "Date"; sentence case; patient label | [p.57](../reference/dhcw-ui-standards-v1.3.md#page-57) | |
| 46 | **Footer** rules — surnames all-caps; no border; separator line; author/printed-by; page x of y | [p.58](../reference/dhcw-ui-standards-v1.3.md#page-58) | |
| 47 | Field layout / window-envelope; completed vs non-completed field display | [p.59](../reference/dhcw-ui-standards-v1.3.md#page-59)–[60](../reference/dhcw-ui-standards-v1.3.md#page-60) | |
| 48 | **Form sections** — shaded banner + black text; no gridlines/boxes; 5% indent; splitting / "continued" / intentionally-blank pages | [p.61](../reference/dhcw-ui-standards-v1.3.md#page-61)–[62](../reference/dhcw-ui-standards-v1.3.md#page-62) | |
| 49 | **Font** (PDF) — Roboto 1rem weight 300; question labels 0.8; answer indent/padding; spacing between Q&A | [p.63](../reference/dhcw-ui-standards-v1.3.md#page-63) | |

## Standard questions & eForms

| # | Standard | Source | Disposition |
|---|---|---|---|
| 50 | **Questions in bold**; standard responses (e.g. Urgency: Routine/Urgent/USC/Emergency); label "Urgency" only | [p.64](../reference/dhcw-ui-standards-v1.3.md#page-64) | |
| 51 | **Attribution statement** — "Last updated or confirmed 'date' @ 'time' by 'name'", italics; Confirm-section checkbox | [p.65](../reference/dhcw-ui-standards-v1.3.md#page-65) | |
| 52 | **eForm heading / patient label** alignment, NHS-number-absent handling | [p.66](../reference/dhcw-ui-standards-v1.3.md#page-66) | |

## Terminology

| # | Standard | Source | Disposition |
|---|---|---|---|
| 53 | **Preferred terms table** (correct/incorrect/notes) — e.g. Adverse reactions not Allergies; Countersign vs Sign off; Test not Order; Speciality; Result notifications; etc. | [p.67](../reference/dhcw-ui-standards-v1.3.md#page-67)–[69](../reference/dhcw-ui-standards-v1.3.md#page-69) | |

## Appendix — legacy design values (treat as historical)

| # | Standard | Source | Disposition |
|---|---|---|---|
| 54 | **Colours** — legacy WCP hex (`#1B6EC2`, `#8CD2E7`, `#FEE715`, `#FD8A10`, `#D50000`, …) | [p.70](../reference/dhcw-ui-standards-v1.3.md#page-70) | `TOKEN` |
| 55 | **Fonts** — Roboto 1rem/300, Arial patient label 11pt, letter-spacing/line-height | [p.71](../reference/dhcw-ui-standards-v1.3.md#page-71) | `TOKEN` |
| 56 | **Other specific-element CSS** — margins, borders, radii, transitions, buttons, inputs, tables | [p.72](../reference/dhcw-ui-standards-v1.3.md#page-72)–[76](../reference/dhcw-ui-standards-v1.3.md#page-76) | `TOKEN` |
| 57 | **Glossary** — WCP, WNCR, WCRS | [p.76](../reference/dhcw-ui-standards-v1.3.md#page-76) | |

---

## First-pass observations (for the review sessions)

- **High-value content standards to promote into guidelines early:** NHS number
  format (#3), name display (#6), sentence case (#5), abbreviations (#8), and the
  terminology table (#53). These are the clearest, most reusable wins and map onto
  a future **content / writing** guideline.
- **Component/pattern owners already exist** for several: radios, checkboxes,
  dropdowns/select, date picker, tables, patient banner, status badges/tags,
  mandatory-field marker — reconcile the guide's rules against those specs.
- **Patient-safety interaction rules** (copy/paste #27, no autosave #36, misfiling
  #37, cooling-off #43) are the most important and least design-y — likely `CARRY`
  into pattern guidelines, re-expressed platform-agnostically.
- **Desktop-only assumptions** (hover tooltips, window envelopes, PDF print layout)
  need `ADAPT`/`REVIEW` for web/mobile/React contexts.
</content>
