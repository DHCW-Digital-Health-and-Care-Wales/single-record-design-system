# DDR-029 — One glyph, one meaning

**Date:** 2026-09-04
**Status:** Accepted
**Decided by:** Design lead (icon catalogue remediation brief)
**Relates to:** DDR-003, DDR-027

---

## Context

A glyph that means two things teaches users nothing. In a clinical product it is
worse than nothing: a reader who has learned that a mark means *discharge* will
read it as discharge wherever it appears.

The catalogue had accumulated collisions of both kinds — one concept with no
clear glyph, and one glyph doing several jobs. The paper plane was assigned to
`clinical/referral` while Send is the near-universal meaning of that mark
everywhere else in software. `clinical/cross` had no assigned meaning at all.
Numeric names (`edit2`, `menu2`) gave an engineer no way to choose correctly.

---

## Decision

**Every glyph carries exactly one documented meaning, and every SR alias names
the glyph or its meaning.** Numeric suffixes are not names.

### Renames

| Was | Now | Glyph | Reason |
|---|---|---|---|
| `action/edit2` | `action/edit-note` | `file-pen` | Pencil on document, distinct from the plain pencil |
| `nav/menu2` | `nav/menu-kebab` | `ellipsis-vertical` | Explicit; pairs with `nav/menu` for the burger |
| `nav/more` | `nav/more-horizontal` | `ellipsis` | Disambiguates now both orientations exist |
| `clinical/lab-result` | `clinical/test` | `flask-conical` | The flask is an ordered test, not the returned finding |
| `schedule/urgent` | `schedule/appointment` | `calendar-clock` | Removes the collision with clinical urgency. Went via `schedule/priority`, which read as severity for the same reason `urgent` did |
| `clinical/cross` | `clinical/treatment` | `cross` | Assigns a previously unassigned glyph one explicit meaning |
| `schedule/bookmark` | `action/bookmark` | `bookmark` | Bookmarking is not a scheduling concept |

### Resolutions

**Send and referral.** The paper plane is **Send** — the universal convention;
departing from it would fail comprehension testing. `clinical/referral` moves to
`file-output` (a document with an outbound arrow): a referral is a letter sent
onward, so the metaphor is literal. The sort glyph is **not** reused for
referral — it is load-bearing for table column sorting.

**Star, bookmark, watchlist.** Three concepts, not collapsed.

| Concept | Glyph | Alias | Meaning |
|---|---|---|---|
| Star | `star` | `action/star` | Flag for personal attention |
| Bookmark | `bookmark` | `action/bookmark` | Save for later retrieval |
| Watchlist | `binoculars` | `action/watchlist` | Under active monitoring |

`binoculars` was verified present in the pinned Lucide version.

**Test, result, request.** The order is split from the finding, and the ask from
the sign-off: `clinical/test` (`flask-conical`), `clinical/result`
(`clipboard-list`), `clinical/request` (`file-plus`). `file/signed` is not reused
for requests — signed is a completed sign-off, a request is an outbound ask, and
these are near-opposite states.

**Assessment.** `clinical/assessment` (`clipboard-pen`) is added and is
deliberately **not** merged into `clinical/vitals`, which is a specific
measurement set rather than a broad judgement activity.

**Attendance and admission.** Distinct events, both given glyphs:
`clinical/attendance` (`door-open`, arrival in urgent and emergency care) and
`clinical/admission` (unchanged, taken onto a ward).

**Urgency.** `status/critical` is the highest severity on the status scale in a
patient-safety context, and is the only icon that carries urgency. Scheduling
has no urgency icon: `schedule/appointment` is simply a booked event.
Emergency is a module name and gets no icon (Tier C, DDR-027).

---

## Duplicates found, and how each was resolved

Enforcing this rule surfaced eight glyphs serving two aliases each. Seven were
resolved by the design lead on 2026-09-07; one is deliberate and stays.

| Glyph | Was shared by | Resolution |
|---|---|---|
| `log-out` | `clinical/discharge` + `nav/log-out` | **nav/log-out keeps it.** `clinical/discharge` moves to `arrow-right-from-line` — a departure across a boundary rather than a session metaphor. The repo had already drifted this way: four call sites were using `clinical/discharge` for a "Log Out" nav item. |
| `pause` | `action/hold` + `action/pause` | **action/hold keeps it.** Hold is the label used across SR apps and there is no media-pause case. `action/pause` retired. |
| `clipboard-list` | `clinical/diagnosis` + `clinical/result` | **clinical/result keeps it.** Result is the concept products actually surface; no Diagnosis label case was observed. `clinical/diagnosis` retired. |
| `file-pen` | `clinical/consent` + `action/edit-note` | **action/edit-note keeps it.** No consent use case. `clinical/consent` retired — it had only ever been a substitution for the vanished `file-check-2`. |
| `calendar` | `schedule/appointment` + `schedule/calendar` | **schedule/calendar keeps it** as the calendar surface. `schedule/appointment` becomes `calendar-clock` — a booked event is a calendar carrying a time. This also retires `schedule/priority` (briefly renamed from `schedule/urgent`): both read as severity, which is what collided with clinical urgency in the first place. |
| `triangle-alert` | `status/alert` + `status/warning` | **status/warning keeps it.** `status/alert` retired as an undifferentiated duplicate; `comms/alert` (`bell-ring`) already covers "needs attention". |
| `door-open` | `location/room` + `clinical/attendance` | **clinical/attendance keeps it** — an opening door is an arrival. `location/room` moves to `door-closed`; a closed door is a room you can enter. Both stay in the door family. |
| `file-text` | `clinical/record` + `file/pdf` | **Accepted, not a defect.** Both readings are the same object — a document — seen from two domains, and the domain prefix disambiguates at the call site. This is what separates it from the seven above. |

Five of these were introduced by implementing the remediation brief exactly as
written; two (`triangle-alert`, and the `log-out` drift) pre-dated it and had
never been reported. That is the argument for the check: the brief's own
principle could not be held by reading the brief.

The catalogue is **141 icons across 11 domains** after the retirements.

---

## Carry into comprehension testing

| Risk | Icons | Fallback if comprehension fails |
|---|---|---|
| Clipboard family similarity | `clinical/result`, `clinical/assessment` | Stronger modifier, or a text label for the weakest performer. `clinical/diagnosis` was retired, so this is now two icons rather than three |
| Cross vs plus at small sizes | `clinical/treatment`, `action/add` | Text label for Treatment — **not** a substitute glyph |
| Watchlist glyph choice | `action/watchlist` (binoculars) vs `action/bookmark` | Adopt whichever tests higher; retire the other as a watchlist marker |

Alongside the priority patient-safety icons already identified: `status/critical`,
`clinical/allergy`, `status/warning`, `clinical/discharge`, `clinical/admission`.

`clinical/discharge` and `clinical/admission` are no longer a matched visual pair
(`arrow-right-from-line` and `log-in`), which is worth testing explicitly.

---

## Why not …

**Let a glyph carry two meanings where the domain prefix disambiguates.**
Accepted only for `file-text`, where both readings are the same object (a
document) seen from two domains. Rejected generally: the user sees the picture,
not the alias. `log-out` for both discharge and sign-out is the clearest case of
why.

**Resolve the six open duplicates now, by picking replacement glyphs.**
Rejected: which concept keeps the glyph is a clinical and editorial judgement,
and the brief is explicit that these decisions are not open to reinterpretation
during implementation. Recording them with an owner is the honest outcome.

---

## Consequences

- **Prevented by:** `npm run check:icons`. A Lucide glyph mapped to two SR
  aliases fails the build unless it is listed in `ACCEPTED_DUPLICATES` with a
  status and a reason. The check also fails on a stale entry — a recorded
  duplicate that no longer exists — so the list cannot rot. Verified by planting
  a new duplicate and a stale entry and confirming each fails.
- The six open entries are a visible, finite work list rather than latent
  ambiguity.
- Renames are breaking. They ship as one coordinated version bump, with every
  in-repo consumer updated in the same change.
