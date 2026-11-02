# DDR-037 — Published sources supersede the UI Standards Guide for content and data rules

**Date:** 2026-11-02
**Author:** AI-assisted session, for the design lead
**Status:** Accepted — design lead, 2026-11-02
**Relates to:** `docs/content/data-standards.md`, `docs/ui-standards-review/content-evidence.md`, DDR-020

---

## Context

The DHCW UI Standards Guide v1.3 (2022) set many content and data rules (NHS number, names,
dates, empty values), but it cites no sources, and parts of it were copied from older guidance.
Demo content built on it went wrong in front of clinicians.

The rules have now been researched against primary published sources: the NHS Wales Data
Dictionary v4.25 and its DSCNs (approved by the Welsh Information Standards Board), and the NHS
digital service manual. Copies are in `docs/reference/`.

A first draft listed "open questions for WISB and the DSCN team". There is no team the design lead
can put questions to: WISB and DHCW publish their standards online, and that is the channel.

## Decision

**Content and data rules follow published sources, in this order. A higher source supersedes a
lower one.**

| Order | Source | Covers |
|---|---|---|
| 1 | NHS Wales Data Dictionary and DSCNs (DHCW, WISB-approved) | What a data item is and which values are valid |
| 2 | NHS digital service manual, then the GOV.UK style guide | How words, dates and numbers are written on screen |
| 3 | DHCW UI Standards Guide v1.3 | Only where 1 and 2 say nothing |
| 4 | A design lead decision, recorded in `data-standards.md` | Only where no published source covers it |

Questions are settled by **researching published sources**, not by asking a board. Where no
source exists, the design lead decides, marks the rule **Adapted**, and it is revisited when a
source is published. New DSCNs are picked up by refreshing `docs/reference/` (see
`scripts/fetch-data-dictionary.mjs`) and checking the DSCN lists by year.

## What this settles now

| Question | Outcome | Basis |
|---|---|---|
| Date format on screens | Spaces and a named month: `10 Mar 2026` in tables, `10 March 2026` in prose. No hyphens | The hyphenated form (`13-Feb-1986`) is from the addressograph standard, which covers printed labels only (DSCN 2018/09, Scope). The NHS service manual uses spaces and full months. v1.3's `dd-Mmm-yyyy` is superseded |
| Time format | 24-hour, `14:05` | Design lead decision (order 4). The NHS service manual's `5pm` is for public health content |
| "Accident and Emergency" | Write "and", not "&" | The Data Dictionary writes "Accident and Emergency" in all 19 data items that name it. A site whose official name uses "&" may keep it |
| NHS numbers in demo data | Numbers starting 999 that pass the check digit | NHS service manual (order 2); no Welsh source found |
| Staff names on screen | v1.3 #6 stands (`SURNAME, First`) until a newer source is found | Order 3: no higher source covers it |
| Sex and gender identity | Separate items, values as the dictionary lists; previous sex or gender not disclosed without consent | Data Dictionary, Core Reference Data (order 1). Which one the demographics screen shows is a design decision |

## Consequences

- `docs/content/data-standards.md` drops "Open questions for WISB" in favour of "Decided" and
  "Watch for" lists.
- The UI standards review can set dispositions from `content-evidence.md` without waiting on
  anyone: a standard with a higher source takes that source's rule.
- Figma designs that follow superseded v1.3 rules (hyphenated dates, staff names) are fixed to
  the outcomes above.
- A rule that rests only on a design lead decision says so, so it is easy to find when a source
  appears.
