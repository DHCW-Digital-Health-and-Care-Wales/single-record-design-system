# SR Icon Catalogue

Single Record Design System — Iconography
Source: [Lucide Icons](https://lucide.dev) — ISC Licence

---

## Library

**Lucide Icons** — ISC licence (fully permissive, suitable for NHS/public sector internal use)
Version sourced: `main` branch, March 2026
Grid: 24 × 24 px, 2px stroke
Total SR aliases: 119 across 10 domains

### Why Lucide and not NHS App icons

The NHS App icon set contains only 21 consumer-facing navigation icons. These are designed for a public-facing mobile health app and do not cover the breadth of clinical UI concepts required for the Single Record programme — EPR, EMR, patient administration, scheduling, ward management, and related products across 7+ workstreams. Lucide provides 1,500+ icons under a fully permissive licence with a consistent 24px grid and 2px stroke visual language that aligns with NHS design principles, and has published NuGet packages for both Blazor and .NET MAUI.

---

## SVG Visual Spec

All processed icons in `foundations/iconography/svg/` conform to:

| Attribute       | Value              | Reason |
|---|---|---|
| `width`         | `1em`              | Scales with `font-size`, maps cleanly to size tokens |
| `height`        | `1em`              | Scales with `font-size` |
| `fill`          | `none`             | Outline variant only at this stage |
| `stroke`        | `currentColor`     | Inherits from CSS colour context |
| `stroke-width`  | `2`                | Lucide default; override to 1.75 at xs/sm via CSS |
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

1. Add an entry to the `ICONS` array in `foundations/iconography/fetch-icons.js` with `domain`, `name`, and `lucide` filename.
2. Add a row to the relevant domain table in this catalogue.
3. Run: `node foundations/iconography/fetch-icons.js` from the repo root.
4. The processed SVG will be written to `foundations/iconography/svg/{domain}/{name}.svg`.

---

## Platform Notes

| Platform | Implementation |
|---|---|
| Web (Blazor) | Inline `currentColor` SVG; size via CSS `font-size` or explicit `width`/`height` |
| Mobile (.NET MAUI) | Embedded SVG resource; `TintColor` for colour roles |
| Desktop (Delphi) | Rasterised PNG export required; export at 16, 20, 24, 32px from the SVGs |

---

## Catalogue

### Navigation & UI chrome (17)

| SR alias | Lucide filename | Component name | Filled variant | Notes |
|---|---|---|---|---|
| nav/home | house | NavHome | pending | |
| nav/menu | menu | NavMenu | pending | |
| nav/back | arrow-left | NavBack | pending | |
| nav/forward | arrow-right | NavForward | pending | |
| nav/chevron-right | chevron-right | NavChevronRight | pending | |
| nav/chevron-left | chevron-left | NavChevronLeft | pending | |
| nav/chevron-down | chevron-down | NavChevronDown | pending | |
| nav/chevron-up | chevron-up | NavChevronUp | pending | |
| nav/close | x | NavClose | pending | |
| nav/search | search | NavSearch | pending | |
| nav/settings | settings | NavSettings | pending | |
| nav/filter | list-filter | NavFilter | pending | Original Lucide name `filter` no longer exists; `list-filter` is the current equivalent |
| nav/sort | arrow-up-down | NavSort | pending | |
| nav/more | ellipsis | NavMore | pending | |
| nav/clear | circle-x | NavClear | pending | Added to match the updated Figma icon components. Previously published as `status/error` |
| nav/dashboard | layout-grid | NavDashboard | pending | Added to match the updated Figma icon components |
| nav/menu2 | ellipsis-vertical | NavMenu2 | pending | Added to match the updated Figma icon components |

### Actions & editing (20)

| SR alias | Lucide filename | Component name | Filled variant | Notes |
|---|---|---|---|---|
| action/add | plus | ActionAdd | pending | |
| action/remove | minus | ActionRemove | pending | |
| action/edit | pencil | ActionEdit | pending | |
| action/delete | trash-2 | ActionDelete | pending | |
| action/save | save | ActionSave | pending | |
| action/download | download | ActionDownload | pending | |
| action/upload | upload | ActionUpload | pending | |
| action/copy | copy | ActionCopy | pending | |
| action/print | printer | ActionPrint | pending | |
| action/share | share-2 | ActionShare | pending | |
| action/link | link | ActionLink | pending | |
| action/refresh | refresh-cw | ActionRefresh | pending | |
| action/undo | undo-2 | ActionUndo | pending | |
| action/lock | lock | ActionLock | pending | |
| action/check | check | ActionCheck | pending | Added to match the updated Figma icon components |
| action/edit2 | square-pen | ActionEdit2 | pending | Added to match the updated Figma icon components |
| action/eye | eye | ActionEye | pending | Added to match the updated Figma icon components |
| action/eye-off | eye-off | ActionEyeOff | pending | Added to match the updated Figma icon components |
| action/hold | pause | ActionHold | pending | Added to match the updated Figma icon components |
| action/scan | barcode | ActionScan | pending | Added to match the updated Figma icon components |

### Status & feedback (9)

| SR alias | Lucide filename | Component name | Filled variant | Notes |
|---|---|---|---|---|
| status/success | circle-check | StatusSuccess | pending | |
| status/error-circle | circle-alert | StatusErrorCircle | pending | Replaces the former `status/error` alias, whose circle-x glyph moved to `nav/clear` |
| status/warning | triangle-alert | StatusWarning | pending | |
| status/info | info | StatusInfo | pending | |
| status/critical | siren | StatusCritical | pending | |
| status/pending | clock | StatusPending | pending | |
| status/loading | loader-circle | StatusLoading | pending | Animated spin via CSS for loading state |
| status/flagged | flag | StatusFlagged | pending | |
| status/alert | triangle-alert | StatusAlert | pending | Added to match the updated Figma icon components |

### Patient & people (10)

| SR alias | Lucide filename | Component name | Filled variant | Notes |
|---|---|---|---|---|
| people/patient | user | PeoplePatient | pending | |
| people/clinician | user-round-check | PeopleClinician | pending | |
| people/team | users | PeopleTeam | pending | |
| people/contact | contact | PeopleContact | pending | |
| people/carer | heart-handshake | PeopleCarer | pending | |
| people/next-of-kin | users-round | PeopleNextOfKin | pending | |
| people/gp | stethoscope | PeopleGp | pending | |
| people/specialist | microscope | PeopleSpecialist | pending | |
| people/admin-staff | user-cog | PeopleAdminStaff | pending | |
| people/anonymous | user-x | PeopleAnonymous | pending | |

### Clinical records & data (18)

| SR alias | Lucide filename | Component name | Filled variant | Notes |
|---|---|---|---|---|
| clinical/record | file-text | ClinicalRecord | pending | Same Lucide source as file/pdf; distinct SR alias for clinical context |
| clinical/observation | activity | ClinicalObservation | pending | |
| clinical/vitals | heart-pulse | ClinicalVitals | pending | |
| clinical/medication | pill | ClinicalMedication | pending | |
| clinical/allergy | shield-alert | ClinicalAllergy | pending | |
| clinical/diagnosis | clipboard-list | ClinicalDiagnosis | pending | |
| clinical/lab-result | flask-conical | ClinicalLabResult | pending | |
| clinical/imaging | scan | ClinicalImaging | pending | |
| clinical/procedure | syringe | ClinicalProcedure | pending | |
| clinical/note | notebook-pen | ClinicalNote | pending | |
| clinical/history | history | ClinicalHistory | pending | |
| clinical/consent | file-pen | ClinicalConsent | pending | Original `file-check-2` not found in current Lucide; `file-pen` used (signed/annotated document) |
| clinical/referral | send | ClinicalReferral | pending | |
| clinical/discharge | log-out | ClinicalDischarge | pending | |
| clinical/admission | log-in | ClinicalAdmission | pending | |
| clinical/blood | droplet | ClinicalBlood | pending | |
| clinical/cross | cross | ClinicalCross | pending | Verified present in current Lucide |
| clinical/dna | dna | ClinicalDna | pending | Verified present in current Lucide |

### Scheduling & appointments (10)

| SR alias | Lucide filename | Component name | Filled variant | Notes |
|---|---|---|---|---|
| schedule/appointment | calendar | ScheduleAppointment | pending | |
| schedule/add-appointment | calendar-plus | ScheduleAddAppointment | pending | |
| schedule/cancel-appointment | calendar-x | ScheduleCancelAppointment | pending | |
| schedule/time | clock-3 | ScheduleTime | pending | |
| schedule/recurring | repeat | ScheduleRecurring | pending | |
| schedule/ward-round | route | ScheduleWardRound | pending | |
| schedule/waiting-list | list-ordered | ScheduleWaitingList | pending | |
| schedule/duration | timer | ScheduleDuration | pending | |
| schedule/overnight | moon | ScheduleOvernight | pending | |
| schedule/urgent | calendar-clock | ScheduleUrgent | pending | |

### Location & organisation (11)

| SR alias | Lucide filename | Component name | Filled variant | Notes |
|---|---|---|---|---|
| location/ward | building-2 | LocationWard | pending | |
| location/hospital | hospital | LocationHospital | pending | |
| location/gp-practice | house-plus | LocationGpPractice | pending | |
| location/bed | bed | LocationBed | pending | |
| location/room | door-open | LocationRoom | pending | |
| location/map-pin | map-pin | LocationMapPin | pending | |
| location/department | landmark | LocationDepartment | pending | |
| location/organisation | network | LocationOrganisation | pending | |
| location/region | map | LocationRegion | pending | |
| location/ambulance | ambulance | LocationAmbulance | pending | |
| location/language | globe | LocationLanguage | pending | Added to match the updated Figma icon components. Used on the Cymraeg language toggle |

### Communication & messaging (8)

| SR alias | Lucide filename | Component name | Filled variant | Notes |
|---|---|---|---|---|
| comms/message | message-square | CommsMessage | pending | |
| comms/notification | bell | CommsNotification | pending | |
| comms/alert | bell-ring | CommsAlert | pending | |
| comms/email | mail | CommsEmail | pending | |
| comms/phone | phone | CommsPhone | pending | |
| comms/letter | mail-open | CommsLetter | pending | |
| comms/unread | message-square-dot | CommsUnread | pending | |
| comms/task | square-check | CommsTask | pending | |

### Documents & files (8)

| SR alias | Lucide filename | Component name | Filled variant | Notes |
|---|---|---|---|---|
| file/document | file | FileDocument | pending | |
| file/pdf | file-text | FilePdf | pending | Same Lucide source as clinical/record; distinct SR alias |
| file/image | image | FileImage | pending | |
| file/attachment | paperclip | FileAttachment | pending | |
| file/folder | folder | FileFolder | pending | |
| file/archive | archive | FileArchive | pending | |
| file/form | clipboard | FileForm | pending | |
| file/signed | file-check | FileSigned | pending | |

### Data & analytics (8)

| SR alias | Lucide filename | Component name | Filled variant | Notes |
|---|---|---|---|---|
| data/chart | chart-line | DataChart | pending | |
| data/table | table-2 | DataTable | pending | |
| data/trend-up | trending-up | DataTrendUp | pending | |
| data/trend-down | trending-down | DataTrendDown | pending | |
| data/export | file-down | DataExport | pending | |
| data/audit | shield-check | DataAudit | pending | |
| data/grid-2x2 | grid-2x2 | DataGrid2x2 | pending | Added to match the updated Figma icon components |
| data/grid-3x3 | grid-3x3 | DataGrid3x3 | pending | Added to match the updated Figma icon components |
