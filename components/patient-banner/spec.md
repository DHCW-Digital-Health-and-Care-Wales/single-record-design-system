# Patient Banner

**Status:** In development
**Last updated:** 2026-07

> **This spec was rewritten in 2026-07.** The previous version (2026-03, status
> *Planned*) described a full-width navy strip with inverse text. The component
> that was actually designed and is now built is a white card with alert panels,
> a two-column demographics block and an action stack — Figma `1711:15585`,
> already instanced 7 times. The layout, colour and states sections below now
> describe what exists. The data-field rules and clinical safety notes carried
> over unchanged, because those were still correct.

---

## Purpose

Persistent strip at the top of every patient-contextual screen. Ensures clinical
staff always know which patient they are viewing, reducing the risk of
wrong-patient errors.

**This is a safety-critical component.** Changes require clinical safety review
in addition to standard design sign-off.

---

## Variants

| Property | Options | Usage |
|---|---|---|
| `Type` | `Fill` · `Border` | `Fill` tints the alert cards (Red/50, Yellow/100). `Border` keeps them white with a coloured rule. Fill is the default — the tint carries more peripheral signal on a dense screen. |
| `State` | `Expanded` · `Collapsed` | Expanded shows alerts, full demographics and labelled actions. Collapsed reduces to a single row: alert counts, identity, and icon-only actions. |

---

## Required data fields

| Field | Display format | Shown when collapsed |
|---|---|---|
| Full name | `SURNAME, Forename(s) (Title)` | **Yes** |
| NHS number | `XXX XXX XXXX`, with a copy button | **Yes** |
| Date of birth | `d Mmm yyyy (NNy)` | **Yes** |
| CRN | As recorded, with a copy button | No |
| Address / Postcode | As recorded | No |
| Date of death | `d Mmm yyyy`, in `Status/Critical` | No |
| Sex | As recorded, not abbreviated | No |
| Adverse reactions | Substance: reaction, reaction in `Status/Critical` | As a count pill |
| Warnings | "N warnings recorded" | As a count pill |

**Name, NHS number and DOB are never hidden.** Collapsing removes secondary
detail only — a collapsed banner must still answer "which patient is this?".

Deceased patients carry a `Deceased` flag beside the name **and** a date of death
in the demographics. Two independent signals, neither of them colour alone.

---

## Anatomy

```
┌────────────────────────────────────────────────────────────────────────────┐
│ ┌──────────────┐ ┌──────────┐   NAME, Forename (Mr) [Deceased]  Hide ⌃  ┌─┐│
│ │Adverse React.│ │Warnings  │   NHS: … [copy]   CRN: … [copy]           │ ││
│ │• Peanut:     │ │3 warnings│   Address: …      DOB: …                  │ ││
│ │  Anaphylaxis │ │ recorded │   Postcode: …     DOD: …                  └─┘│
│ └──────────────┘ └──────────┘                   Sex: …                     │
└────────────────────────────────────────────────────────────────────────────┘
  .__alerts                        .__identity                     .__actions
```

Collapsed:

```
┌────────────────────────────────────────────────────────────────────────────┐
│ (2 reactions) (3 warnings)  NAME (Mr) [Deceased]  NHS: … DOB: …  Show ⌄ [·]│
└────────────────────────────────────────────────────────────────────────────┘
```

- **`.sr-patient-banner`**: white card, `radius-lg`, `sr.elevation.raised`.
- **`.sr-patient-banner__alert`**: reactions (Red/50) and warnings (Yellow/100) cards, each with an edit button.
- **`.sr-patient-banner__identity`**: name row, flag, toggle, and a two-column demographics list.
- **`.sr-patient-banner__actions`**: Change patient (primary), Open WCP record, Print patient label.

Demographics are **two independent columns**, not row-paired, so a field never
jumps column when an optional one (date of death) is absent.

---

## States

| State | Behaviour |
|---|---|
| Expanded | Full alerts, demographics and labelled actions |
| Collapsed | Single row; identifiers and icon-only actions retained |
| Loading | Skeleton placeholders — never show partial data |
| No patient context | Banner not shown |
| Data error | Show name and NHS number if available; mark other fields unavailable |
| No alerts | "No known adverse reactions" / "No warnings recorded" — state it explicitly, never leave the card empty |

---

## Accessibility

- Rendered as a `<section>` with `aria-label="Patient: {name}"`, so the landmark
  names the patient rather than just the region. Does not conflict with the page
  `<header>`.
- The expand/collapse control is a real button with `aria-expanded`.
- Copy buttons are named for what they copy ("Copy NHS number"), not "Copy".
- Alert cards pair colour with a text heading, so severity is never colour alone (SC 1.4.1).
- The date of death is red **and** labelled `DOD:` — again, not colour alone.
- Icon-only actions in the collapsed state each carry an `aria-label`.
- The banner stacks rather than scrolling horizontally below 1024px, so patient
  identity can never be pushed off screen at high zoom (SC 1.4.10).
- Verified with axe-core across all four variants: 0 violations.

**Open item:** the NHS number is currently read digit-group by digit-group as
written. The previous spec asked for `aria-label="NHS number: 485 777 3456"` to
force grouped reading. Confirm with a screen-reader pass whether the plain text
is announced acceptably before adding a redundant label.

---

## Content Guidelines

- Dates use the short form `10 Mar 2026` here, because the banner is space
  constrained. The long form `10 March 2026` is for prose and anywhere without a
  width constraint. This supersedes the legacy `dd-Mmm-yyyy` rule — see DL-022.
- Names are `SURNAME, Forename(s)` with the title in brackets.
- Say "No known adverse reactions" rather than leaving a blank card — absence of
  data and absence of reactions are clinically different.

---

## Clinical Safety Notes

- Must never display data from a different patient session.
- Session timeout must clear the patient context and the banner simultaneously.
- Any modification to displayed fields must be reviewed by clinical informatics.
- Do not cache patient data in local storage.

---

## Engineering Notes

| Framework | Where |
|---|---|
| Web (HTML/CSS) | `packages/web/src/patient-banner/patient-banner.css` |
| React | `packages/react/src/patient-banner/PatientBanner.jsx` |
| Blazor / MAUI | Same CSS via the RCL |

- Expanded/collapsed is **controlled** — pass `expanded` and `onToggle`. Persisting
  that choice per user is a product decision, not a component one.
- Patient context comes from a shared service/state container in the app shell.
- Blazor: a cascading parameter or persistent layout component. MAUI: a shared
  shell view, not repeated per page.

---

## Related

- Figma: `Patient Banner` `1711:15585`
- [`components/tags/spec.md`](../tags/spec.md) — the `Deceased` flag and count pills
- [`components/button/spec.md`](../button/spec.md) — banner actions
- `/accessibility/colour-and-contrast.md`
