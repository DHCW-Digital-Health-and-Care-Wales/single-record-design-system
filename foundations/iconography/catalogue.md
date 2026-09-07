# SR Icon Catalogue

Single Record Design System — Iconography
Source: [Lucide Icons](https://lucide.dev) — ISC Licence

---

## Library

**Lucide Icons** — ISC licence (fully permissive, suitable for NHS/public sector internal use)
Version sourced: **`lucide-static@1.41.0`**, pinned exactly in the root `package.json` and carried in the lock file.
Grid: 24 × 24 px, 1px stroke (DDR-023; Lucide ships 2px)

The generator used to fetch Lucide's `main` branch over the network, so the icon set was whatever `main` held on the day it ran. It is now read from the pinned package: the same input produces the same SVGs on every machine and in CI. To take a newer Lucide, bump the version deliberately and review the diff — `main` is *not* a preview of the next release, and several names present in 1.41.0 (`trash-2`, `history`, `circle-help`) have already been removed from it.

**Outline icons only.** Figma also carries an `Icon/warnings/*` group of four filled state badges (`error`, `warning`, `check`, `determinate`). They are deliberately not 1px outlines, are not part of this catalogue, and have no counterpart in `foundations/iconography/svg/`. They ship as the **`StatusIndicator` component** instead (DDR-013) — the fill and the second colour carry the meaning, so they cannot be flattened into a single-`currentColor` outline icon without erasing the knocked-out glyph. Do not "normalise" their stroke weights, and do not fold them into `status/`.

Counts are generated. See the catalogue section below for the current totals — do not type a total into this file.

### Why Lucide and not NHS App icons

The NHS App icon set contains only 21 consumer-facing navigation icons. These are designed for a public-facing mobile health app and do not cover the breadth of clinical UI concepts required for the Single Record programme — EPR, EMR, patient administration, scheduling, ward management, and related products across 7+ workstreams. Lucide provides 1,500+ icons under a fully permissive licence with a consistent 24px grid and stroke-based visual language that aligns with NHS design principles, and has published NuGet packages for both Blazor and .NET MAUI.

---

## SVG Visual Spec

All processed icons in `foundations/iconography/svg/` conform to:

| Attribute       | Value              | Reason |
|---|---|---|
| `width`         | `1em`              | Scales with `font-size`, maps cleanly to size tokens |
| `height`        | `1em`              | Scales with `font-size` |
| `fill`          | `none`             | Outline variant only at this stage |
| `stroke`        | `currentColor`     | Inherits from CSS colour context |
| `stroke-width`  | `1`                | DDR-023. Lucide ships `2`; Single Record overrides it globally. Do not override per size. |
| `stroke-linecap`| `round`            | Lucide visual language |
| `stroke-linejoin`| `round`           | Lucide visual language |
| `aria-hidden`   | `true`             | Decorative by default; label via parent element |
| `focusable`     | `false`            | Prevents IE/Edge SVG focus bug |

---

## Filled Variant Policy

The filled variant is deliberately deferred to the navigation component phase.

Filled variants are only assigned to specific icons when a navigation component explicitly requires them, not speculatively. Until then, all icons are outline only.

**All icons in this catalogue: filled variant — pending (to be assigned during navigation component phase)**

---

## How to Add New Icons

1. Check the glyph is not already in the catalogue under another name. **One glyph, one meaning** (DDR-029) — `npm run check:icons` fails on a Lucide glyph mapped to two SR aliases unless the duplicate is recorded with a reason.
2. Decide the tier (DDR-027). Tier C — a product screen or module name — does **not** get a bespoke icon; reuse a Tier A or B glyph, or use a text label.
3. Add an entry to the `ICONS` array in `foundations/iconography/fetch-icons.mjs` with `domain`, `name`, `lucide`, and a `note` if the choice needs explaining.
4. Run `node foundations/iconography/fetch-icons.mjs` from the repo root. The SVG is written to `foundations/iconography/svg/{domain}/{name}.svg`.
5. Run `npm run sync:icons` to regenerate the tables below. **Do not add the row by hand** — it is generated, and a hand-added row is overwritten.
6. Run `npm run check:icons`.

Adding an SVG straight into `svg/` without a generator entry is what produced four unmanaged icons with no recorded provenance. `check:icons` now fails on it.

---

## Platform Notes

| Platform | Implementation |
|---|---|
| Web (Blazor) | Inline `currentColor` SVG; size via CSS `font-size` or explicit `width`/`height` |
| Mobile (.NET MAUI) | Embedded SVG resource; `TintColor` for colour roles |
| Desktop (Delphi) | Rasterised PNG export required; export at 16, 20, 24, 32px from the SVGs |

---

## Catalogue

<!-- BEGIN GENERATED CATALOGUE — edit fetch-icons.mjs, then run npm run sync:icons -->

**142 SR aliases across 11 domains.**

Every row below is generated from the `ICONS` array in `fetch-icons.mjs`. Do not edit this section by hand — add the icon to the generator, run `npm run sync:icons`, and the table follows.

### Navigation & UI chrome (21)

| SR alias | Lucide glyph | Component name | Notes |
|---|---|---|---|
| nav/home | house | NavHome |  |
| nav/menu | menu | NavMenu |  |
| nav/back | arrow-left | NavBack |  |
| nav/forward | arrow-right | NavForward |  |
| nav/chevron-right | chevron-right | NavChevronRight |  |
| nav/chevron-left | chevron-left | NavChevronLeft |  |
| nav/chevron-down | chevron-down | NavChevronDown |  |
| nav/chevron-up | chevron-up | NavChevronUp |  |
| nav/close | x | NavClose |  |
| nav/search | search | NavSearch |  |
| nav/settings | settings | NavSettings |  |
| nav/filter | list-filter | NavFilter | filter renamed to list-filter in current Lucide |
| nav/sort | arrow-up-down | NavSort |  |
| nav/more-horizontal | ellipsis | NavMoreHorizontal | renamed from nav/more — disambiguates now both orientations exist |
| nav/clear | circle-x | NavClear | Added to match the updated Figma icon components. Previously published as `status/error` |
| nav/dashboard | layout-grid | NavDashboard | Added to match the updated Figma icon components |
| nav/menu-kebab | ellipsis-vertical | NavMenuKebab | renamed from nav/menu2 — pairs with nav/menu (burger) |
| nav/log-out | log-out | NavLogOut |  |
| nav/account | circle-user | NavAccount |  |
| nav/support | circle-help | NavSupport |  |
| nav/feedback | message-square-text | NavFeedback |  |

### Actions & editing (29)

| SR alias | Lucide glyph | Component name | Notes |
|---|---|---|---|
| action/add | plus | ActionAdd |  |
| action/remove | minus | ActionRemove |  |
| action/edit | pencil | ActionEdit |  |
| action/delete | trash-2 | ActionDelete |  |
| action/save | save | ActionSave |  |
| action/download | download | ActionDownload |  |
| action/upload | upload | ActionUpload |  |
| action/copy | copy | ActionCopy |  |
| action/print | printer | ActionPrint |  |
| action/share | share-2 | ActionShare |  |
| action/link | link | ActionLink |  |
| action/refresh | refresh-cw | ActionRefresh |  |
| action/undo | undo-2 | ActionUndo |  |
| action/lock | lock | ActionLock |  |
| action/check | check | ActionCheck | Added to match the updated Figma icon components |
| action/edit-note | file-pen | ActionEditNote | renamed from action/edit2; glyph moved square-pen -> file-pen (pencil on document) |
| action/eye | eye | ActionEye | Added to match the updated Figma icon components |
| action/eye-off | eye-off | ActionEyeOff | Added to match the updated Figma icon components |
| action/hold | pause | ActionHold | Hold is the label used across SR apps; there is no media-pause use case, so this glyph carries one meaning (DDR-029) |
| action/scan | scan-barcode | ActionScan | scan-barcode (framed scanner), NOT barcode. The entry said barcode for months but never took effect because the generator could not run; the committed artwork was always scan-barcode. Fixing the generator briefly "corrected" the icon to the wrong glyph. |
| action/send | send | ActionSend |  |
| action/star | star | ActionStar |  |
| action/bookmark | bookmark | ActionBookmark | moved from schedule/ — bookmarking is not a scheduling concept |
| action/bookmark-off | bookmark-off | ActionBookmarkOff | the removal/unsaved state of action/bookmark, in the eye/eye-off and lock/unlock pattern |
| action/play | play | ActionPlay |  |
| action/expand | maximize-2 | ActionExpand |  |
| action/collapse | minimize-2 | ActionCollapse |  |
| action/unlock | lock-open | ActionUnlock | pairs with action/lock; a lock state with no unlock counterpart is incomplete |
| action/watchlist | binoculars | ActionWatchlist | under active monitoring; distinct from bookmark (save) and star (personal attention) |

### Status & feedback (8)

| SR alias | Lucide glyph | Component name | Notes |
|---|---|---|---|
| status/success | circle-check | StatusSuccess |  |
| status/error-circle | circle-alert | StatusErrorCircle | Replaces the former `status/error` alias, whose circle-x glyph moved to `nav/clear` |
| status/warning | triangle-alert | StatusWarning | Sole owner of the triangle. status/alert was retired as an undifferentiated duplicate; comms/alert (bell-ring) covers "needs attention" (DDR-029) |
| status/info | info | StatusInfo |  |
| status/critical | siren | StatusCritical |  |
| status/pending | clock | StatusPending |  |
| status/loading | loader-circle | StatusLoading | Animated spin via CSS for loading state |
| status/flagged | flag | StatusFlagged |  |

### Patients & people (12)

| SR alias | Lucide glyph | Component name | Notes |
|---|---|---|---|
| people/patient | user | PeoplePatient |  |
| people/clinician | user-round-check | PeopleClinician |  |
| people/team | users | PeopleTeam |  |
| people/contact | contact | PeopleContact |  |
| people/carer | heart-handshake | PeopleCarer |  |
| people/next-of-kin | users-round | PeopleNextOfKin |  |
| people/gp | stethoscope | PeopleGp |  |
| people/specialist | microscope | PeopleSpecialist |  |
| people/admin-staff | user-cog | PeopleAdminStaff |  |
| people/anonymous | user-x | PeopleAnonymous |  |
| people/demographics | id-card | PeopleDemographics |  |
| people/patient-search | user-round-search | PeoplePatientSearch |  |

### Clinical records & data (20)

| SR alias | Lucide glyph | Component name | Notes |
|---|---|---|---|
| clinical/record | file-text | ClinicalRecord | Same Lucide source as file/pdf; distinct SR alias for clinical context |
| clinical/observation | activity | ClinicalObservation |  |
| clinical/vitals | heart-pulse | ClinicalVitals |  |
| clinical/medication | pill | ClinicalMedication |  |
| clinical/allergy | shield-alert | ClinicalAllergy |  |
| clinical/test | flask-conical | ClinicalTest | renamed from clinical/lab-result — the flask is an ordered test, not the returned finding |
| clinical/imaging | scan | ClinicalImaging |  |
| clinical/procedure | syringe | ClinicalProcedure |  |
| clinical/note | notebook-pen | ClinicalNote |  |
| clinical/history | history | ClinicalHistory |  |
| clinical/referral | file-output | ClinicalReferral | reassigned from send — the paper plane belongs to action/send (DDR-029); a referral is a letter sent onward |
| clinical/discharge | arrow-right-from-line | ClinicalDischarge | Was log-out, which now belongs to nav/log-out. A departure across a boundary, rather than a session metaphor (DDR-029) |
| clinical/admission | log-in | ClinicalAdmission |  |
| clinical/blood | droplet | ClinicalBlood |  |
| clinical/treatment | cross | ClinicalTreatment | renamed from clinical/cross — the glyph was previously unassigned; now means care delivered |
| clinical/dna | dna | ClinicalDna | Verified present in current Lucide |
| clinical/result | clipboard-list | ClinicalResult | Replaces clinical/diagnosis, which had no observed label use — result is the concept products actually surface (DDR-029) |
| clinical/request | file-plus | ClinicalRequest | not file/signed — a request is an outbound ask, signed is a completed sign-off |
| clinical/assessment | clipboard-pen | ClinicalAssessment | broad clinical judgement; deliberately not merged into clinical/vitals |
| clinical/attendance | door-open | ClinicalAttendance | urgent and emergency care arrival; distinct from clinical/admission (taken onto a ward) |

### Scheduling & appointments (11)

| SR alias | Lucide glyph | Component name | Notes |
|---|---|---|---|
| schedule/add-appointment | calendar-plus | ScheduleAddAppointment |  |
| schedule/cancel-appointment | calendar-x | ScheduleCancelAppointment |  |
| schedule/time | clock-3 | ScheduleTime |  |
| schedule/recurring | repeat | ScheduleRecurring |  |
| schedule/ward-round | route | ScheduleWardRound |  |
| schedule/waiting-list | list-ordered | ScheduleWaitingList |  |
| schedule/duration | timer | ScheduleDuration |  |
| schedule/overnight | moon | ScheduleOvernight |  |
| schedule/appointment | calendar-clock | ScheduleAppointment | A booked event: a calendar carrying a time. Was schedule/urgent, briefly schedule/priority — both read as severity, which collides with clinical urgency (status/critical) |
| schedule/calendar | calendar | ScheduleCalendar | the calendar surface itself; schedule/appointment is a booked event |
| schedule/events | calendar-days | ScheduleEvents |  |

### Location & organisation (11)

| SR alias | Lucide glyph | Component name | Notes |
|---|---|---|---|
| location/ward | building-2 | LocationWard |  |
| location/hospital | hospital | LocationHospital |  |
| location/gp-practice | house-plus | LocationGpPractice |  |
| location/bed | bed | LocationBed |  |
| location/room | door-closed | LocationRoom | Was door-open, which now means arrival (clinical/attendance). A closed door is a room; an opening door is someone arriving |
| location/map-pin | map-pin | LocationMapPin |  |
| location/department | landmark | LocationDepartment |  |
| location/organisation | network | LocationOrganisation |  |
| location/region | map | LocationRegion |  |
| location/ambulance | ambulance | LocationAmbulance |  |
| location/language | globe | LocationLanguage | Added to match the updated Figma icon components. Used on the Cymraeg language toggle |

### Communication & messaging (8)

| SR alias | Lucide glyph | Component name | Notes |
|---|---|---|---|
| comms/message | message-square | CommsMessage |  |
| comms/notification | bell | CommsNotification |  |
| comms/alert | bell-ring | CommsAlert |  |
| comms/email | mail | CommsEmail |  |
| comms/phone | phone | CommsPhone |  |
| comms/letter | mail-open | CommsLetter |  |
| comms/unread | message-square-dot | CommsUnread |  |
| comms/task | square-check | CommsTask |  |

### Documents & files (9)

| SR alias | Lucide glyph | Component name | Notes |
|---|---|---|---|
| file/document | file | FileDocument |  |
| file/pdf | file-text | FilePdf | Same Lucide source as clinical/record; distinct SR alias |
| file/image | image | FileImage |  |
| file/attachment | paperclip | FileAttachment |  |
| file/folder | folder | FileFolder |  |
| file/archive | archive | FileArchive |  |
| file/form | clipboard | FileForm |  |
| file/signed | file-check | FileSigned |  |
| file/pin | pin | FilePin | adopted — was an SVG file with no generator entry |

### Data & analytics (8)

| SR alias | Lucide glyph | Component name | Notes |
|---|---|---|---|
| data/chart | chart-line | DataChart |  |
| data/table | table-2 | DataTable |  |
| data/trend-up | trending-up | DataTrendUp |  |
| data/trend-down | trending-down | DataTrendDown |  |
| data/export | file-down | DataExport |  |
| data/audit | shield-check | DataAudit |  |
| data/grid-2x2 | grid-2x2 | DataGrid2x2 | Added to match the updated Figma icon components |
| data/grid-3x3 | grid-3x3 | DataGrid3x3 | Added to match the updated Figma icon components |

### Device & hardware (5)

| SR alias | Lucide glyph | Component name | Notes |
|---|---|---|---|
| device/camera | camera | DeviceCamera |  |
| device/camera-swap | switch-camera | DeviceCameraSwap |  |
| device/video | video | DeviceVideo |  |
| device/torch-on | flashlight | DeviceTorchOn |  |
| device/torch-off | flashlight-off | DeviceTorchOff |  |

<!-- END GENERATED CATALOGUE -->
