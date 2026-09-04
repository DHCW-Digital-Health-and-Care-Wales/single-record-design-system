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
| `schedule/urgent` | `schedule/priority` | unchanged | Removes the collision with clinical urgency |
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
patient-safety context. `schedule/priority` is time-based priority on
appointments. Emergency is a module name and gets no icon (Tier C, DDR-027).

---

## Recorded duplicates

Enforcing this rule surfaced eight glyphs serving two aliases. Two are
deliberate; **six are open defects**, recorded rather than hidden.

| Glyph | Aliases | Status |
|---|---|---|
| `file-text` | `clinical/record` + `file/pdf` | **Accepted** — the same document mark in two domains, disambiguated by the domain prefix at the call site |
| `triangle-alert` | `status/alert` + `status/warning` | **Open** — pre-existing; two names, no documented difference |
| `clipboard-list` | `clinical/diagnosis` + `clinical/result` | **Open** — the brief assigns `clipboard-list` to `clinical/result` while `clinical/diagnosis` already held it, and does not say what diagnosis becomes. Needs a clinical decision. |
| `pause` | `action/hold` + `action/pause` | **Open** — a clinical hold and a media transport control are different concepts |
| `door-open` | `location/room` + `clinical/attendance` | **Open** — a room and an arrival event are different things |
| `log-out` | `clinical/discharge` + `nav/log-out` | **Open** — discharging a patient and signing out must not share a mark in a clinical product |
| `calendar` | `schedule/appointment` + `schedule/calendar` | **Open** — the brief distinguishes the calendar surface from a booked event but gives both the same glyph |
| `file-pen` | `clinical/consent` + `action/edit-note` | **Open** — consent is a signed document, not an edit affordance |

Six of these were introduced by implementing the remediation brief exactly as
written. They are listed here, and in `scripts/check-icons.mjs`, so they are
visible and resolvable rather than discovered by a user. Resolving them needs
clinical input on which concept keeps the glyph — that is not an implementation
decision.

---

## Carry into comprehension testing

| Risk | Icons | Fallback if comprehension fails |
|---|---|---|
| Clipboard family similarity | `clinical/diagnosis`, `clinical/result`, `clinical/assessment` | Stronger modifier, or a text label for the weakest performer |
| Cross vs plus at small sizes | `clinical/treatment`, `action/add` | Text label for Treatment — **not** a substitute glyph |
| Watchlist glyph choice | `action/watchlist` (binoculars) vs `action/bookmark` | Adopt whichever tests higher; retire the other as a watchlist marker |

Alongside the priority patient-safety icons already identified: `status/critical`,
`clinical/allergy`, `schedule/priority`, `status/warning`, `clinical/discharge`,
`clinical/admission`.

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
