# Single Record Design System

The Single Record Design System provides the shared design language, component library, and interaction patterns for all products under the Single Record programme at Digital Health and Care Wales (DHCW).

This document is the primary reference for everyone working on Single Record — designers, engineers, and delivery leads.

**Last reviewed:** 2026-08-03. Update this file whenever a component ships, a
token is added, or a system-wide rule changes — not on a schedule. If it
disagrees with `/foundations/tokens/` or `/components/`, those win and this file
is out of date.

---

## Purpose

The design system exists to ensure that every Single Record product — across EPR, patient administration, and future areas — is visually consistent, clinically safe, and accessible to all users.

It achieves this by:

- Defining a single set of design tokens (colour, typography, spacing, elevation) used across all products and platforms
- Providing a library of tested, accessible components and interaction patterns
- Maintaining a permanent record of design decisions so that the team can understand why, not just what

This is a healthcare system. Design decisions affect clinical staff, administrative staff, and ultimately patients. Accuracy, accessibility, and consistency are non-negotiable.

---

## Who This Is For

| Role | Primary use |
|---|---|
| Designers | Figma library, tokens, component specs, pattern guidance |
| Engineers | Token consumption, component implementation, platform integration |
| Delivery leads | Understanding system scope, product boundaries, decision history |
| New team members | Orientation to standards, structure, and contribution workflow |

---

## Standards

All Single Record products must comply with the following standards.

| Standard | Role | Mandatory? |
|---|---|---|
| WCAG 2.2 AA | Accessibility baseline | Yes — all components and products |
| WCAG 2.2 AAA | Extended accessibility target | Where feasible |
| GDS Design System | Primary reference for patterns and interaction design | Yes — follow unless documented otherwise |
| NHS England Design System | Reference for clinical UI conventions | Yes — follow unless documented otherwise |
| CDPS Wales | Welsh-language and public sector guidance | Yes |

Departures from GDS or NHS England patterns must be recorded in a Design Decision Record (DDR) before implementation.

---

## Foundations

Foundations are the base layer of the system — the raw materials that components and patterns are built from. Everything in the system traces back to a foundation token.

| Foundation | Location | Description |
|---|---|---|
| Colour | `/foundations/tokens/colour/` | Global palette and semantic colour system |
| Typography | `/foundations/tokens/typography.md` | Typeface, scale, line height, letter spacing |
| Spacing | `/foundations/tokens/spacing.md` | 4px base grid, component and layout spacing |
| Elevation | `/foundations/tokens/elevation.json` · [`.md`](foundations/tokens/elevation.md) | Two functional shadow steps: `raised`, `overlay` |
| Motion | `/foundations/tokens/motion.md` | Duration, easing, animation principles |
| Border | `/foundations/tokens/border.md` | Border widths and radius scale |
| Iconography | `/foundations/iconography.md` | Icon library, sizing, usage |
| Grid and layout | `/foundations/grid-and-layout.md` | Breakpoints, columns, gutters |

### Token Structure

Design tokens follow a three-tier structure:

```
Tier 1 — Global (primitives)
  Raw palette values: colour hex codes, px sizes, raw font values.
  Stored in: /foundations/tokens/primitives/
  Never referenced directly in components.

Tier 2 — Semantic
  Meaningful aliases: "primary button colour", "body text size".
  Stored in: /foundations/tokens/semantic/
  Used by components and patterns.

Tier 3 — Component (per component)
  Component-specific overrides that reference semantic tokens.
  Stored within each component spec.
  Added only when a component genuinely diverges from semantic defaults.
```

Token names follow the pattern: `{tier}.{category}.{variant}` — for example `sr.color.interactive.primary` or `sr.typography.body-m`.

### Colour System

The colour system is built from four brand palettes (Blue, Cyan, Navy, Grey) and four status palettes (Red, Green, Yellow, Info Blue). The `Single Record` collection in Figma exposes semantic aliases with Light and Dark mode variants.

| Palette | Primary role |
|---|---|
| Blue | NHS Wales brand primary — buttons, links, interactive states |
| Cyan | DHCW brand secondary — accents, highlights, focus ring (Cyan/700 per DDR-006) |
| Navy | Deep brand navy — headers, structure |
| Grey | Neutral UI — text, borders, surfaces |
| Red | Error / critical status |
| Green | Success status |
| Yellow | Warning status |
| Info Blue | Informational status |

See `/foundations/tokens/colour/global.md` for the full primitive palette and `/foundations/tokens/colour/semantic.md` for semantic token definitions and contrast ratios.

### Typography System

The system uses **Roboto** as its primary typeface across all platforms.

The semantic type scale provides named styles for use in Figma and component specs:

| Style | Desktop | Usage |
|---|---|---|
| `heading-xl` | 36px bold | Page-level titles |
| `heading-l` | 28px bold | Section headings |
| `heading-m` | 24px bold | Sub-section headings, card headers |
| `heading-s` | 20px bold | Panel headings, modal titles |
| `heading-xs` | 16px medium | Inline labels, compact contexts |
| `body-m` | 16px regular | **Default body text.** Minimum for clinical content. |
| `body-s` | 14px regular | Supporting text, secondary content |
| `label` | 14px medium, wide tracking | Form labels, column headers, button text |
| `caption` | 12px regular, caption tracking | Timestamps, metadata, annotations |

16px (`body-m`) is the minimum for any primary clinical content — consistent with WCAG 2.2 and NHS guidance.

See `/foundations/tokens/typography.md` for the full specification.

---

## Components

Components are discrete UI elements defined at the design level. Each component has a spec in `/components/{component-name}/spec.md` covering:

- Purpose and when to use it
- Anatomy
- States and variants
- Usage guidance
- Accessibility requirements
- Known limitations

**Status key.** *Spec* is the design contract in `/components/`. *Web* is the
reference HTML/CSS in `packages/web/src/` — the layer Blazor and MAUI also consume.
*React* is the wrapper in `packages/react/src/`.

| Component | Spec | Web | React |
|---|---|---|---|
| Autocomplete | ✅ | ✅ | ✅ |
| Bottom nav | — | ✅ | ✅ |
| Breadcrumbs | — | ✅ | ✅ |
| Button | ✅ | ✅ | ✅ |
| Checkbox | ✅ | ✅ | ✅ |
| Date input | — | ✅ | ✅ |
| Date picker | — | ✅ | ✅ |
| Footer | — | ✅ | ✅ |
| Header | — | ✅ | ✅ |
| Input | — | ✅ | ✅ |
| Link | ✅ | — | — |
| Modal dialog | ✅ | ✅ | ✅ |
| Navigation | — | ✅ | ✅ |
| Patient banner | ✅ | ✅ | ✅ |
| Progress indicators | ✅ | — | — |
| Search | ✅ | — | — |
| Segmented control | — | ✅ | ✅ |
| Select | ✅ | ✅ | ✅ |
| Status indicator | — | ✅ | ✅ |
| Switch | — | ✅ | ✅ |
| Table | ✅ | ✅ | ✅ |
| Tags | ✅ | ✅ | ✅ |
| Time select | — | ✅ | ✅ |

**Known gaps, stated plainly:** eleven components ship code without a spec, and
three specs (Link, Progress indicators, Search) have no code. Neither is
satisfactory — a component without a spec has no agreed contract, and a spec
without code cannot be consumed. Both lists are worked down as components are
touched.

See `/components/README.md` for the full catalogue and contribution guidance, and
the live catalogue in Storybook for every variant.

---

## Patterns

Patterns are composed interactions and page-level solutions built from components. They address common clinical and administrative workflows.

Patterns live in `/patterns/`. Each pattern follows the template in `/docs/templates/pattern-template.md`.

| Pattern | Guidelines | DS website page | Notes |
|---|---|---|---|
| Patient banner | ✅ `components/patient-banner/guidelines.md` | ✅ `patterns/patient-banner.html` | Two types (`Fill`, `Border`) and two states (`Expanded`, `Collapsed`) — **all four are live**. Fill vs Border has not been user-tested; keeping both is provisional. |

**Known gap:** forms, search and sign-off flows are named in the pattern
intro but have no guidelines file and no website page. Only the patient
banner is documented.

---

## Prototypes

Working product prototypes, authored by design and built entirely from this system. They exist to show the design intent running, to give engineering a readable starting template for the UI layer, and to test the system against a real product before it reaches production. Nothing in a prototype restyles a design-system component — if a prototype looks wrong, the design system is wrong.

They live under `/products/{product}/prototype/` and consume the design-system packages as npm workspace siblings, so they always render the current version of every component with no sync step.

| Prototype | Location | State |
|---|---|---|
| Case Note Tracking | `products/case-note-tracking/prototype/` | Patient casenote view built. Search, SendIT batch, My Requests and the side panels are not. |

**Prototypes are not shippable.** Mock data only, no API integration, no authentication, no error or loading handling, no tests, no security review.

They are published on the design-system website under **Prototypes**, which embeds each one live via Sandpack (DDR-019) — a plain preview/code toggle, generated from the actual source at every site build. No repository visibility is required to view them; the embed doesn't clone a repo at all, it's handed the files directly. To run one locally instead, install from the **repository root** (not the prototype folder, whose design-system dependencies are unpublished workspace members) and run `npm run dev:prototype`.

---

## Content rules

System-wide rules that apply to every product, not just one component.

| Rule | Detail |
|---|---|
| **Dates** | `10 Mar 2026` in tables and space-constrained UI. `10 March 2026` in prose and anywhere without a width constraint. **Never all-numeric** (`06/12/21`) — a named month is what removes day/month ambiguity, which is a clinical-safety requirement, not a style preference. Adapts UI Standards p.24; set 2026-07-28. |
| **Casing** | Sentence case everywhere, including headings, labels and buttons. |
| **Names** | `SURNAME, Forename(s)` with any title in brackets. |
| **Buttons** | Name the action and its subject — "Confirm patient", never "OK" or "Yes". |
| **Abbreviations** | Avoid them. `No.` for "Number" in a tight table heading is a documented exception. |
| **Empty states** | Say what is absent — "No known adverse reactions", not a blank panel. Absence of data and absence of a finding are clinically different. |

---

## Accessibility

WCAG 2.2 AA is the mandatory baseline for all components and products. The `/accessibility/` directory contains:

| File | Contents |
|---|---|
| `/accessibility/README.md` | Overview, testing approach, role assignments |
| `/accessibility/colour-and-contrast.md` | Contrast ratios, colour-only communication guidance |
| `/accessibility/focus-management.md` | Focus ring standards, keyboard navigation |

Every component spec must include an accessibility section. New components are not approved without it.

---

## Design Decisions

Design decisions that affect the system — token choices, pattern departures, structural changes — are recorded as Design Decision Records (DDRs) in `/decisions/`.

| Decision | Summary |
|---|---|
| DDR-001 | 4px base spacing unit |
| DDR-002 | WCAG 2.2 AA as mandatory baseline |
| DDR-003 | Lucide icon library |

Use `DDR-000-template.md` as the starting point for new records. A DDR is required before any non-trivial structural change is made.

---

## Figma Library

The Figma file is the **source of truth** for visual design. All component specs and token definitions in this repository must match Figma. If they conflict, raise it with the design lead — do not resolve it silently.

| Collection | Contents | Visibility |
|---|---|---|
| `Primitives` | Raw palette and scale variables | Internal — not published to library |
| `Single Record` | Semantic aliases — colour, typography, spacing, border, radius | Published to library |

The `Single Record` collection has two modes: **Light** and **Dark**.

See `/figma/README.md` for tooling guidance and `/figma/variable-mapping.md` for the full token-to-variable mapping.

---

## Technology

The design system is **implementation-agnostic at the design level**. Tokens are defined in W3C Design Token JSON format and mapped to platform-specific outputs by engineers.

| Platform | Technology | Status |
|---|---|---|
| Web (reference baseline) | Standard HTML / CSS | Current |
| Web applications | Blazor / .NET | Current |
| Web applications | React | Current |
| Desktop / Mobile | .NET MAUI | Current |
| Legacy web | .NET Framework 4.8 | Limited — tokens via CSS only |
| Legacy desktop | Delphi | Maintained, not extended |

Code implementation guidance lives in `/docs/for-engineers.md`.

---

## Repository Structure

```
/foundations       Design tokens: colour, typography, spacing, elevation, motion, iconography
/components        Individual UI components — one folder per component
/patterns          Composed interactions and page-level patterns
/accessibility     WCAG 2.2 guidance, focus management, contrast, assistive technology notes
/decisions         Design Decision Records — permanent log of significant choices
/docs              Guides for designers and engineers; templates for specs and DDRs
/figma             Figma variable mapping, library structure, handoff conventions
/products          Product-specific extensions (EPR, patient admin, etc.)
```

---

## Contributing

### Designers
See `/docs/for-designers.md` for the full guide. In brief:

1. All new components and patterns must be designed and approved in Figma before any spec is written.
2. Use existing semantic tokens — do not introduce new values without a DDR.
3. Accessibility annotation is required before handoff.

### Engineers
See `/docs/for-engineers.md` for the full guide. In brief:

1. Reference semantic tokens only — never hardcode values.
2. Component specs define the required behaviour; implementation is in the relevant platform repo.
3. Any token or component change that affects published code requires a DDR.

### Everyone
- Check `/decisions/` before proposing a structural change — it may already have been decided.
- Follow commit conventions in `CLAUDE.md`.
- Raise accessibility concerns early — retrofitting is expensive.

---

## Product Scope

The core system is shared across all Single Record products. Products may extend — but must not contradict — the core.

| Area | Location |
|---|---|
| Core system | `/foundations`, `/components`, `/patterns` |
| EPR-specific | `/products/epr/` |
| Patient admin-specific | `/products/patient-admin/` |

---

## Contacts

| Role | Responsible for |
|---|---|
| Design lead | Figma library, component decisions, design tokens |
| Engineering lead | Code implementation, token consumption, build pipeline |
| Accessibility lead | WCAG compliance, testing, assistive technology review |
