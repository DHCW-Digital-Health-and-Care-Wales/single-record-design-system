# Single Record Design System — Complete Reference

**Organisation:** Digital Health and Care Wales (DHCW)  
**Programme:** Single Record  
**Status:** Live — v1 foundations and first components  
**Maintained by:** SR Design System team

This file is a single self-contained reference for the entire design system. It is intended to be used standalone — with any AI tool, in onboarding, or for offline reference — without needing to open any other file.

---

## Contents

1. [Purpose and Standards](#1-purpose-and-standards)
2. [Technology Context](#2-technology-context)
3. [Token Architecture](#3-token-architecture)
4. [Colour — Primitive Palette](#4-colour--primitive-palette)
5. [Colour — Semantic Tokens](#5-colour--semantic-tokens)
6. [Typography](#6-typography)
7. [Spacing](#7-spacing)
8. [Elevation](#8-elevation)
9. [Motion](#9-motion)
10. [Border and Radius](#10-border-and-radius)
11. [Touch Targets](#11-touch-targets)
12. [Grid and Layout](#12-grid-and-layout)
13. [Iconography](#13-iconography)
14. [Accessibility — Colour and Contrast](#14-accessibility--colour-and-contrast)
15. [Accessibility — Focus Management](#15-accessibility--focus-management)
16. [Component: Button](#16-component-button)
17. [Component: Patient Banner](#17-component-patient-banner)
18. [Pattern: Form Validation](#18-pattern-form-validation)
19. [Pattern: Confirmation Dialog](#19-pattern-confirmation-dialog)
20. [Design Decisions](#20-design-decisions)
21. [Figma Variable Mapping](#21-figma-variable-mapping)
22. [For Designers](#22-for-designers)
23. [For Engineers](#23-for-engineers)
24. [Contribution Rules](#24-contribution-rules)

---

## 1. Purpose and Standards

The Single Record Design System is the shared design language for all products under the Single Record programme at DHCW. It serves EPR, patient administration, and related clinical and administrative products across web, mobile, and desktop.

**This is a healthcare system. Decisions affect real clinical staff and patients. Accuracy, accessibility, and consistency are non-negotiable.**

### Mandatory Standards

| Standard | Role | Mandatory |
|---|---|---|
| WCAG 2.2 AA | Accessibility baseline | Yes — all components and products |
| WCAG 2.2 AAA | Extended target | Where feasible |
| GDS Design System | Primary reference for patterns and interaction design | Yes — follow unless a DDR records a departure |
| NHS England Design System | Reference for clinical UI conventions | Yes — follow unless a DDR records a departure |
| CDPS Wales | Welsh-language and public sector guidance | Yes |

Departures from GDS or NHS England patterns must be recorded in a Design Decision Record (DDR) before implementation.

### Who This Is For

| Role | Primary use |
|---|---|
| Designers | Figma library, tokens, component specs, pattern guidance |
| Engineers | Token consumption, component implementation, platform integration |
| Delivery leads | System scope, product boundaries, decision history |
| New team members | Orientation to standards and structure |

---

## 2. Technology Context

The design system is implementation-agnostic at the design level. Tokens are defined in W3C Design Token JSON format.

| Platform | Technology | Status |
|---|---|---|
| Web applications | Blazor / .NET | Current |
| Desktop / Mobile | .NET MAUI | Current |
| Legacy systems | Delphi | Maintained |
| Future platforms | TBD | Expected |

---

## 3. Token Architecture

Design tokens follow a three-tier structure:

```
Tier 1 — Global (primitives)
  Raw palette values: colour hex codes, px sizes, raw font values.
  Never referenced directly in components.
  Naming: {category}.{variant}  e.g. color.blue.800

Tier 2 — Semantic
  Meaningful aliases: "primary button colour", "body text size".
  Used by components and patterns.
  Naming: sr.{category}.{name}  e.g. sr.color.interactive.primary

Tier 3 — Component
  Component-specific overrides referencing semantic tokens.
  Added only when a component genuinely diverges from semantic defaults.
```

Token naming pattern: `{tier}.{category}.{variant}` — for example `sr.color.interactive.primary` or `sr.typography.body-m`.

In CSS: `--sr-color-{category}-{name}` — for example `--sr-color-interactive-primary`.  
In MAUI: `SrColor{Category}{Name}` — for example `SrColorInteractivePrimary`.

---

## 4. Colour — Primitive Palette

Primitive tokens define the raw palette. **Never reference these directly in components** — use semantic tokens.

### Blue (NHS Wales Blue — primary brand)

| Token | Value |
|---|---|
| `color.blue.900` | `#1E3050` |
| `color.blue.800` | `#325083` |
| `color.blue.700` | `#3D6199` |
| `color.blue.600` | `#4C72AE` |
| `color.blue.500` | `#5C6991` |
| `color.blue.400` | `#828DAC` |
| `color.blue.300` | `#AAB1C6` |
| `color.blue.200` | `#D4D8E2` |
| `color.blue.100` | `#ECEEF3` |
| `color.blue.50`  | `#F4F5F8` |

### Cyan (DHCW Blue — secondary/accent)

| Token | Value |
|---|---|
| `color.cyan.900` | `#0A6A84` |
| `color.cyan.800` | `#0D8BAD` |
| `color.cyan.700` | `#12A3C9` |
| `color.cyan.600` | `#71ACCD` |
| `color.cyan.500` | `#8DC0DA` |
| `color.cyan.400` | `#AFD4E5` |
| `color.cyan.300` | `#D6EAF2` |
| `color.cyan.100` | `#EBF5FA` |
| `color.cyan.50`  | `#F4FAFC` |

### Navy (DHCW Navy)

| Token | Value |
|---|---|
| `color.navy.900` | `#1B294A` |
| `color.navy.700` | `#464C64` |
| `color.navy.500` | `#707488` |
| `color.navy.300` | `#9EA1AF` |
| `color.navy.100` | `#CDCFD6` |

### Red (Status — error/critical)

| Token | Value |
|---|---|
| `color.red.900` | `#5F110A` |
| `color.red.800` | `#8B190F` |
| `color.red.700` | `#B32014` |
| `color.red.600` | `#D5281B` |
| `color.red.500` | `#E03A31` |
| `color.red.400` | `#EC5E56` |
| `color.red.300` | `#F48B85` |
| `color.red.200` | `#F9B5B1` |
| `color.red.100` | `#FCDBD9` |
| `color.red.50`  | `#FEF3F2` |

### Green (Status — success)

| Token | Value | Notes |
|---|---|---|
| `color.green.600` | `#007F3B` | NHS green |
| `color.green.100` | `#D9EFE5` | Success surface |

### Yellow (Status — warning)

| Token | Value |
|---|---|
| `color.yellow.500` | `#F8CA4D` |
| `color.yellow.100` | `#FDF6DC` |

### Focus

| Token | Value |
|---|---|
| `color.focus-yellow` | `#FFEB3B` |

### Grey / Neutral

| Token | Value |
|---|---|
| `color.grey.900` | `#212B32` |
| `color.grey.600` | `#4C6272` |
| `color.grey.200` | `#D8DDE0` |
| `color.grey.100` | `#F0F4F5` |
| `color.white`    | `#FFFFFF` |

### Info Blue (Status — informational)

| Token | Value |
|---|---|
| `color.info-blue.900` | `#002E5C` |
| `color.info-blue.800` | `#004483` |
| `color.info-blue.700` | `#005AA8` |
| `color.info-blue.600` | `#0D62A3` |
| `color.info-blue.500` | `#267AB8` |
| `color.info-blue.400` | `#4E95CA` |
| `color.info-blue.300` | `#7EB0D9` |
| `color.info-blue.200` | `#AECCE8` |
| `color.info-blue.100` | `#D6E8F5` |
| `color.info-blue.50`  | `#EEF5FC` |

---

## 5. Colour — Semantic Tokens

Semantic tokens assign meaning to primitives. **All components and patterns use these exclusively.**

The `Single Record` Figma collection exposes these with **Light** and **Dark** modes.

### Interactive

| Token | Light | Light hex | Dark | Dark hex | Usage |
|---|---|---|---|---|---|
| `sr.color.interactive.primary` | `color.blue.800` | `#325083` | `color.cyan.900` | `#0A6A84` | Primary buttons, active nav. Dark uses cyan-900 — 5.8:1 white contrast (AA). |
| `sr.color.interactive.primary-hover` | `color.blue.900` | `#1E3050` | `color.cyan.800` | `#0D8BAD` | Hover on primary. Dark: pair with inner border. White on cyan-800 = 4.2:1 (AA large/bold). |
| `sr.color.interactive.secondary` | `color.navy.900` | `#1B294A` | `color.blue.300` | `#AAB1C6` | Secondary interactive elements |
| `sr.color.interactive.link` | `color.info-blue.700` | `#005AA8` | `color.cyan.400` | `#AFD4E5` | Inline links |
| `sr.color.interactive.destructive` | `color.red.600` | `#D5281B` | `color.red.600` | `#D5281B` | Destructive actions |

### Surface

| Token | Light | Light hex | Dark | Dark hex | Usage |
|---|---|---|---|---|---|
| `sr.color.surface.background` | `color.grey.100` | `#F0F4F5` | `color.navy.900` | `#1B294A` | Default page/app background |
| `sr.color.surface.small-cards` | `color.white` | `#FFFFFF` | `color.cyan.900` | `#0A6A84` | Cards, panels, modals |
| `sr.color.surface.accent` | `color.cyan.100` | `#EBF5FA` | `color.blue.900` | `#1E3050` | Accent/highlight backgrounds |
| `sr.color.surface.subtle` | `color.blue.50` | `#F4F5F8` | `color.navy.700` | `#464C64` | Subtle section backgrounds |
| `sr.color.surface.section-cards` | `color.white` | `#FFFFFF` | `color.blue.900` | `#1E3050` | Primary background for card sections in modular layout |

### Text

| Token | Light | Light hex | Dark | Dark hex | Usage |
|---|---|---|---|---|---|
| `sr.color.text.primary` | `color.grey.900` | `#212B32` | `color.white` | `#FFFFFF` | Body text, headings |
| `sr.color.text.secondary` | `color.grey.600` | `#4C6272` | `color.grey.200` | `#D8DDE0` | Supporting text, captions |
| `sr.color.text.inverse` | `color.white` | `#FFFFFF` | `color.grey.900` | `#212B32` | Text on dark/coloured backgrounds |

### Border

| Token | Light | Light hex | Dark | Dark hex | Usage |
|---|---|---|---|---|---|
| `sr.color.border.subtle` | `color.grey.100` | `#F0F4F5` | `color.navy.700` | `#464C64` | Row dividers, internal table separators |
| `sr.color.border.default` | `color.grey.200` | `#D8DDE0` | `color.navy.500` | `#707488` | Standard borders — inputs, cards, dividers |
| `sr.color.border.strong` | `color.grey.600` | `#4C6272` | `color.navy.300` | `#9EA1AF` | Active/selected rows, structural dividers |
| `sr.color.border.focus` | `color.focus-yellow` | `#FFEB3B` | `color.focus-yellow` | `#FFEB3B` | Focus ring — pair with 2px dark inner ring |

### Brand

| Token | Light | Light hex | Dark | Dark hex | Usage |
|---|---|---|---|---|---|
| `sr.color.brand.accent` | `color.cyan.700` | `#12A3C9` | `color.cyan.700` | `#12A3C9` | **Decorative only.** Borders, icon strokes, chart series, tab underlines. Never use as a filled surface with white text — contrast is 2.6:1 (fails AA). |

> **Cyan usage rule:** Cyan-700 (`brand.accent`) = decorative. Cyan-900 (`interactive.primary` dark) = filled surfaces with white text (5.8:1 AA). Never mix these roles.

### Status

| Token | Light | Light hex | Dark | Dark hex | Meaning |
|---|---|---|---|---|---|
| `sr.color.status.critical` | `color.red.600` | `#D5281B` | `color.red.100` | `#FCDBD9` | Failed, invalid, critical |
| `sr.color.status.critical-surface` | `color.red.100` | `#FCDBD9` | `color.blue.900` | `#1E3050` | Critical background |
| `sr.color.status.success` | `color.green.600` | `#007F3B` | `color.green.100` | `#D9EFE5` | Completed, confirmed |
| `sr.color.status.success-surface` | `color.green.100` | `#D9EFE5` | `color.navy.900` | `#1B294A` | Success background |
| `sr.color.status.warning` | `color.yellow.500` | `#F8CA4D` | `color.yellow.500` | `#F8CA4D` | Requires attention |
| `sr.color.status.warning-surface` | `color.yellow.100` | `#FDF6DC` | `color.navy.700` | `#464C64` | Warning background |
| `sr.color.status.info` | `color.info-blue.700` | `#005AA8` | `color.info-blue.700` | `#005AA8` | Informational |
| `sr.color.status.info-surface` | `color.info-blue.100` | `#D6E8F5` | `color.navy.900` | `#1B294A` | Info background |

**Clinical alert rule:** Never rely on colour alone for clinical status. Always pair with an icon and text label.

### Verified Contrast Pairings (Light Mode)

| Pairing | Ratio | WCAG |
|---|---|---|
| `text.primary` (`#212B32`) on `surface.background` (`#F0F4F5`) | 13.8:1 | AAA |
| `text.primary` (`#212B32`) on `surface.small-cards` (`#FFFFFF`) | 15.6:1 | AAA |
| `text.secondary` (`#4C6272`) on `surface.small-cards` (`#FFFFFF`) | 6.1:1 | AA |
| `text.inverse` (`#FFFFFF`) on `interactive.primary` (`#325083`) | 7.5:1 | AAA |
| `status.critical` (`#D5281B`) on `status.critical-surface` (`#FCDBD9`) | 4.7:1 | AA |
| `status.success` (`#007F3B`) on `status.success-surface` (`#D9EFE5`) | 4.5:1 | AA |

---

## 6. Typography

### Typeface

| Role | Family | Fallback |
|---|---|---|
| Primary (UI) | `Roboto` | `Arial, sans-serif` |

Token: `font.family.primary` = `Roboto`

### Font Weight Scale

| Token | Value | Usage |
|---|---|---|
| `font.weight.regular` | `400` | Body text, captions |
| `font.weight.medium`  | `500` | Labels, table column headers |
| `font.weight.bold`    | `700` | Headings |

### Font Size Scale

| Token | Value |
|---|---|
| `font.size.12` | 12px |
| `font.size.14` | 14px |
| `font.size.16` | 16px |
| `font.size.19` | 19px |
| `font.size.22` | 22px |
| `font.size.26` | 26px |
| `font.size.27` | 27px |
| `font.size.32` | 32px |
| `font.size.36` | 36px |
| `font.size.48` | 48px |

### Letter Spacing

| Token | Value | Usage |
|---|---|---|
| `font.letter-spacing.default` | `0px`    | Body text, headings |
| `font.letter-spacing.wide`    | `0.7px`  | Labels and UI controls |
| `font.letter-spacing.caption` | `0.24px` | Caption text |

### Semantic Text Styles

These are the named styles used in Figma and in all component specs.

| Token | Desktop | Mobile | Weight | Tracking | Usage |
|---|---|---|---|---|---|
| `sr.typography.heading-xl` | 48px / 54px lh | 32px / 38px lh | Bold | Default | Page-level titles |
| `sr.typography.heading-l`  | 36px / 42px lh | 27px / 33px lh | Bold | Default | Section headings |
| `sr.typography.heading-m`  | 26px / 32px lh | 22px / 29px lh | Bold | Default | Sub-section headings, card headers |
| `sr.typography.heading-s`  | 22px / 30px lh | 19px / 27px lh | Bold | Default | Panel headings, modal titles |
| `sr.typography.heading-xs` | 16px / 24px lh | 16px / 24px lh | Bold | Default | Inline labels, compact contexts |
| `sr.typography.body-m`     | 16px / 24px lh | 16px / 24px lh | Regular | Default | **Default body text. Minimum for clinical content.** |
| `sr.typography.body-s`     | 14px / 24px lh | 14px / 24px lh | Regular | Default | Supporting text. Do not use for primary clinical content. |
| `sr.typography.label`      | 14px / 20px lh | 14px / 20px lh | Medium | Wide (0.7px) | Form labels, column headers, button text |
| `sr.typography.caption`    | 12px / 16px lh | 12px / 16px lh | Regular | Caption (0.24px) | Timestamps, metadata, annotations |

### Accessibility Rules for Typography

- `body-m` (16px) is the **minimum** for primary clinical content — consistent with WCAG 2.2 and NHS guidance.
- `body-s` (14px) is for supporting text only. Never use for essential clinical information.
- `caption` (12px): do not use for text that conveys essential meaning without a visible alternative.
- Do not use colour alone to distinguish text styles — use weight or size differences.
- Text must be resizable to 200% without loss of content or functionality (WCAG 1.4.4).
- Line length for body text: 60–80 characters.

---

## 7. Spacing

Base unit: **4px**. All spacing values are multiples of 4px. Off-scale values (e.g. 6px, 10px) are not permitted without a DDR.

### Primitive Scale

| Token | px | Usage |
|---|---|---|
| `space.0`  | 0px  | Explicit zero |
| `space.1`  | 4px  | Icon padding, micro gaps |
| `space.2`  | 8px  | Tight component internals |
| `space.3`  | 12px | Compact form elements |
| `space.4`  | 16px | Default internal padding |
| `space.5`  | 20px | |
| `space.6`  | 24px | Section spacing within panels |
| `space.8`  | 32px | Component separation |
| `space.10` | 40px | |
| `space.12` | 48px | Section breaks |
| `space.16` | 64px | Major layout sections |
| `space.20` | 80px | Page-level vertical rhythm |
| `space.24` | 96px | |

### Semantic Spacing Tokens

#### Component Internal Spacing

| Token | Maps to | px | Usage |
|---|---|---|---|
| `spacing.component.xs` | `space.1` | 4px  | Icon-only buttons, tight badges |
| `spacing.component.sm` | `space.2` | 8px  | Compact inputs, table cells |
| `spacing.component.md` | `space.4` | 16px | Default padding for most components |
| `spacing.component.lg` | `space.6` | 24px | Panels, cards |
| `spacing.component.xl` | `space.8` | 32px | Large containers |

#### Form Spacing

| Token | Maps to | px | Usage |
|---|---|---|---|
| `spacing.form.field-gap`  | `space.6` | 24px | Vertical gap between form fields |
| `spacing.form.label-gap`  | `space.2` | 8px  | Gap between label and input |
| `spacing.form.hint-gap`   | `space.1` | 4px  | Gap between hint and input |
| `spacing.form.error-gap`  | `space.1` | 4px  | Gap between error and input |
| `spacing.form.group-gap`  | `space.8` | 32px | Gap between field groups / fieldsets |

#### Layout Spacing

| Token | Maps to | px | Usage |
|---|---|---|---|
| `spacing.layout.xs`      | `space.4`  | 16px | Column gutters (mobile) |
| `spacing.layout.sm`      | `space.6`  | 24px | Column gutters (tablet) |
| `spacing.layout.md`      | `space.8`  | 32px | Column gutters (desktop) |
| `spacing.layout.section` | `space.12` | 48px | Between page sections |
| `spacing.layout.page`    | `space.16` | 64px | Page padding / top-level margin |

---

## 8. Elevation

Shadow colour is derived from `color.navy.900` (`#1B294A`) rather than pure black — on-brand and subdued on clinical displays.

**Use shadow only for elements that genuinely float above the page. Borders handle structural hierarchy on flat surfaces.**

| Token | CSS `box-shadow` | Used for |
|---|---|---|
| `sr.elevation.button`  | `0 2px 0 #1B294A`                    | Primary and outline button press affordance (GDS-aligned) |
| `sr.elevation.raised`  | `0 1px 4px rgba(27,41,74,0.12)`      | Cards, panels — gentle lift from page |
| `sr.elevation.overlay` | `0 4px 16px rgba(27,41,74,0.18)`     | Modals, drawers, dropdowns, tooltips |

**Button shadow by variant:**

| Button variant | Shadow |
|---|---|
| Primary | `sr.elevation.button` — `0 2px 0 #1B294A` |
| Outline / secondary | `sr.elevation.button` — `0 2px 0 #1B294A` |
| Ghost | `none` — affordance carried by border and colour only |
| Warning / destructive | `sr.elevation.button` — `0 2px 0 #1B294A` |
| Disabled (any variant) | `none` — shadow removed to reinforce unavailability |

Rules:
- Do not stack multiple elevations on one element.
- Do not rely on shadow alone to indicate interactivity.
- Do not use shadow decoratively. If in doubt, use a border.

---

## 9. Motion

In a clinical environment, motion must be purposeful and restrained. **Never animate content that carries clinical meaning** — alert banners must appear immediately, not fade in.

### Duration

| Token | Value | Usage |
|---|---|---|
| `motion.duration.instant` | `0ms`   | No animation — immediate state changes |
| `motion.duration.fast`    | `100ms` | Micro-interactions (hover, checkbox tick) |
| `motion.duration.base`    | `200ms` | Default transitions (focus, expand) |
| `motion.duration.slow`    | `350ms` | Panel slide, modal entrance |
| `motion.duration.slower`  | `500ms` | Page-level transitions (use rarely) |

### Easing

| Token | Value | Usage |
|---|---|---|
| `motion.easing.linear`   | `linear`                       | Loading bars, progress indicators |
| `motion.easing.standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | Most transitions |
| `motion.easing.enter`    | `cubic-bezier(0, 0, 0.2, 1)`   | Elements entering the screen |
| `motion.easing.exit`     | `cubic-bezier(0.4, 0, 1, 1)`   | Elements leaving the screen |

### Reduced Motion (Required)

All animations must respect `prefers-reduced-motion`. When set, fall back to `motion.duration.instant` and use opacity only (no transforms). This is a WCAG 2.2 requirement.

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 10. Border and Radius

### Border Width

| Token | Value | Usage |
|---|---|---|
| `sr.border.width.default` | 1px | All standard borders — inputs, cards, dividers |
| `sr.border.width.strong`  | 2px | Active/selected states, focus ring inner stroke, error states |

### Corner Radius

| Token | Value | Usage |
|---|---|---|
| `sr.radius.none` | 0px    | Tables, data grids, full-bleed containers |
| `sr.radius.sm`   | 2px    | Form inputs, text areas, select controls, inline tags |
| `sr.radius.md`   | 4px    | Buttons, cards, panels, banners, tooltips — **default** |
| `sr.radius.lg`   | 8px    | Modals, side drawers, floating menus |
| `sr.radius.full` | 9999px | Status chips, avatar rings, toggle switches |

#### Radius by Component (Reference)

| Component | Radius |
|---|---|
| Button (all variants) | `radius.md` — 4px |
| Text input, select, textarea | `radius.sm` — 2px |
| Card, panel | `radius.md` — 4px |
| Data table | `radius.none` — 0px |
| Modal, drawer | `radius.lg` — 8px |
| Tooltip | `radius.md` — 4px |
| Badge, status chip | `radius.full` |
| Tag, inline label | `radius.sm` — 2px |
| Navigation sidebar | `radius.none` — 0px |

Each component spec is the authoritative source. This table is a starting reference.

### Focus Ring (Standard Pattern)

The standard focus ring is drawn from GDS and NHS England:

```css
:focus-visible {
  outline: 3px solid #FFEB3B;   /* sr.color.border.focus */
  outline-offset: 2px;
  box-shadow: 0 0 0 2px #1B294A; /* navy-900 inner dark ring */
}
```

Never use `outline: none` without providing a visible equivalent.

---

## 11. Touch Targets

### Key Fact

- **44×44px** = WCAG 2.2 Level AAA (SC 2.5.5)
- **24×24px** = WCAG 2.2 Level AA (SC 2.5.8 — with spacing exception)

### Token Tiers

| Token | Value | Platform | WCAG | When to use |
|---|---|---|---|---|
| `sr.touch.default` | 44px | All | AAA | All MAUI elements (hard floor). Default for Blazor. All primary and destructive actions. |
| `sr.touch.compact` | 32px | Desktop only | — | Secondary actions in dense contexts: row-level icons in data tables. Needs documented rationale. |
| `sr.touch.minimum` | 24px | Desktop only | AA (with spacing) | Absolute floor. Only with the spacing exception — ≥10px inactive space on all sides. |

### Spacing Exception (SC 2.5.8)

A 24px target satisfies AA only if no other target is within 24px. A 32px button satisfies AA with ≥6px inactive space on all sides. Document the spacing choice in the component spec.

### Platform Rules

| Platform | Rule |
|---|---|
| MAUI | `sr.touch.default` (44px) is the hard floor — no exceptions |
| Blazor | 44px is the strong default. 32px permitted in dense data grids with justification. 24px is the absolute floor with spacing exception. |

---

## 12. Grid and Layout

### Breakpoints

| Token | Width | Primary context |
|---|---|---|
| `breakpoint.xs`  | < 480px  | Mobile |
| `breakpoint.sm`  | 480px    | Small mobile |
| `breakpoint.md`  | 768px    | Tablet |
| `breakpoint.lg`  | 1024px   | Desktop / clinical workstations |
| `breakpoint.xl`  | 1280px   | Wide desktop |
| `breakpoint.2xl` | 1536px   | Ultra-wide |

**Primary design and test target: 1024px–1280px** — the majority of clinical workstations.

### Column Grid

| Breakpoint | Columns | Gutter | Margin |
|---|---|---|---|
| xs  | 4  | 16px | 16px |
| sm  | 4  | 16px | 24px |
| md  | 8  | 24px | 32px |
| lg  | 12 | 24px | 40px |
| xl  | 12 | 32px | 48px |
| 2xl | 12 | 32px | 64px |

### Max Content Width

| Context | Max width |
|---|---|
| Body text / long-form content | 720px |
| Forms (single column) | 560px |
| Full-width data tables | None (full container) |
| Page container | 1400px |

### Common Layout Patterns

**Application shell:**
```
┌─────────────────────────────────────────────┐
│ Global navigation (top bar)                 │
├─────────────┬───────────────────────────────┤
│ Side nav    │ Main content area             │
└─────────────┴───────────────────────────────┘
```

**Patient record view:**
```
┌──────────────────────────────────────────────┐
│ Patient banner (persistent, full width)      │
├──────────────┬───────────────────────────────┤
│ Section nav  │ Record content                │
└──────────────┴───────────────────────────────┘
```

**Form page:**
```
┌───────────────────────────────────────────┐
│ Page heading + context                    │
├──────────────────────────┬────────────────┤
│ Form content (cols 1–8)  │ Summary / hint │
└──────────────────────────┴────────────────┘
```

---

## 13. Iconography

### Icon Library

**Adopted: Lucide Icons** — ISC licence (permissive; no attribution required in UI). See DDR-003 for the full decision record.

| Attribute | Detail |
|---|---|
| Grid | 24 × 24px |
| Stroke | 2px, round linecap, round linejoin |
| Variant | Outline only (filled deferred to navigation component phase) |
| Coverage | 1,500+ icons; 106 SR aliases defined across 10 domains |
| Blazor | `Lucide.Blazor` NuGet |
| MAUI | `Lucide.Maui` NuGet |
| Delphi | Rasterised PNG export at 16, 20, 24, 32px (1x and 2x) |

### Icon Sizes

| Token | Size | Stroke | Usage |
|---|---|---|---|
| `sr.icon.size.xs` | 16px | 1.75 | Inline within dense content |
| `sr.icon.size.sm` | 20px | 1.75 | Standard inline icons |
| `sr.icon.size.md` | 24px | 2 | Default icon size |
| `sr.icon.size.lg` | 32px | 2 | Prominent icons, empty states |

### Icon Colour Roles

| Token | Maps to | Usage |
|---|---|---|
| `sr.icon.color.default`     | `sr.color.text.primary`         | Default icon |
| `sr.icon.color.subtle`      | `sr.color.text.secondary`       | Subdued / secondary icons |
| `sr.icon.color.inverse`     | `sr.color.text.inverse`         | Icons on dark/coloured surfaces |
| `sr.icon.color.interactive` | `sr.color.interactive.primary`  | Clickable icons |
| `sr.icon.color.critical`    | `sr.color.status.critical`      | Critical / error |
| `sr.icon.color.warning`     | `sr.color.status.warning`       | Warning |
| `sr.icon.color.success`     | `sr.color.status.success`       | Success |
| `sr.icon.color.info`        | `sr.color.status.info`          | Informational |

### Icon Accessibility Rules

1. **Decorative icons** (paired with visible text): `aria-hidden="true"` on the SVG — all SR SVGs ship with this by default.
2. **Meaningful icons** (no visible text): provide `aria-label` on the parent button/link.
3. Never rely on icon alone in clinical contexts — always pair with a text label.
4. Status icons must always be paired with a text label.

### Usage Rules

- Use SR catalogue aliases (`clinical/medication`, `nav/home`) — never raw Lucide names.
- Do not use icons from other libraries alongside SR icons.
- Do not modify SVG paths.
- Avoid decorative icons in dense data views.

---

## 14. Accessibility — Colour and Contrast

### Contrast Requirements

#### Text (WCAG 1.4.3)

| Text type | AA minimum | AAA target |
|---|---|---|
| Normal text (< 18pt / < 14pt bold) | 4.5:1 | 7:1 |
| Large text (≥ 18pt / ≥ 14pt bold)  | 3:1   | 4.5:1 |
| Disabled text | Exempt | — |

#### UI Components and Focus (WCAG 1.4.11)

| Element | Minimum ratio |
|---|---|
| Input borders | 3:1 against background |
| Focus ring | 3:1 against adjacent colours |
| Icons conveying meaning | 3:1 against background |

#### Focus Indicator (WCAG 2.4.11 — new in WCAG 2.2)

- Area: at least as large as a 2px perimeter around the component
- Contrast: 3:1 against unfocused state

SR implementation: 3px solid `#FFEB3B` (focus-yellow) + 2px `#1B294A` (navy-900) inner shadow. Meets and exceeds the requirement.

### Colour-Only Communication — Prohibited

The following must never rely on colour alone:

| Context | Required supplement |
|---|---|
| Form field error state | Red border + error icon + "Error:" text prefix |
| Required field indicator | Asterisk (*) + hint text |
| Allergy flag | Icon + text label |
| Clinical alert severity | Icon + text label + heading level |
| Status badge | Text label always visible |
| Chart data series | Pattern/shape + legend with text |
| Table row highlight | Secondary visual indicator (e.g. left border) |

### Clinical Environment Considerations

- Clinical workstations can be in bright, high-ambient-light environments. Contrast should exceed minimums.
- Some clinical staff have colour vision deficiency — never use red/green alone for safe/unsafe meaning.
- Avoid pure white backgrounds for full-page views — `grey.100` (`#F0F4F5`) is preferred.

---

## 15. Accessibility — Focus Management

### Focus Ring (Standard Implementation)

```css
:focus-visible {
  outline: 3px solid #FFEB3B;   /* sr.color.border.focus */
  outline-offset: 2px;
  box-shadow: 0 0 0 2px #1B294A; /* navy-900 inner ring */
}
```

- Use `:focus-visible` (not `:focus`) — this suppresses the ring for mouse users while maintaining it for keyboard users.
- Never `outline: none` without a visible replacement.

### Tab Order Rules

- Tab order follows DOM order — ensure visual layout matches DOM structure.
- Do not use `tabindex` values greater than 0.
- Use `tabindex="0"` only to make non-interactive elements focusable when necessary.
- Use `tabindex="-1"` for programmatically-focusable elements not in tab flow (error summaries, dialog headings).

### Focus Trapping

Required in: modals, drawers, confirmation dialogs, and any overlay that blocks the page.

- On open: move focus to first interactive element or dialog heading.
- Tab cycles through elements within the trap. Shift+Tab cycles backwards.
- Escape closes the overlay; focus returns to the trigger.
- Clicking outside does not close clinical dialogs.

### Programmatic Focus — Events

| Event | Focus action |
|---|---|
| Form submit error | Move to error summary (`tabindex="-1"`) |
| Modal/dialog open | Move to dialog heading or first input |
| Modal/dialog close | Return to the element that triggered it |
| Toast/notification | Do not move focus — use `aria-live` region |
| Page section update | Move to updated region heading if significant |

### Skip Links

Every page must have a skip link as the first focusable element:

```html
<a href="#main-content" class="skip-link">Skip to main content</a>
```

Visually hidden by default; visible on keyboard focus. Target: `id="main-content"` with `tabindex="-1"`.

### Keyboard Interaction Patterns

| Component | Keys |
|---|---|
| Button | Enter, Space |
| Link | Enter |
| Checkbox | Space to toggle |
| Radio group | Arrow keys to move; Space/Enter to select |
| Select / dropdown | Arrow keys to navigate; Enter to select; Escape to close |
| Modal | Tab/Shift+Tab within; Escape to close |
| Tab component | Arrow keys between tabs; Enter to activate |
| Accordion | Enter/Space to expand/collapse |
| Autocomplete | Arrow keys; Enter to select; Escape to clear |

---

## 16. Component: Button

**Status:** Planned

### Purpose

Triggers an action. The most fundamental interactive component.

### Variants

| Variant | Usage |
|---|---|
| Primary | Single dominant action per view — form submit, confirm |
| Secondary | Alternative or supporting action alongside primary |
| Ghost | Low-emphasis — cancel, back, tertiary |
| Warning | Destructive or irreversible action — delete, override |
| Destructive | Permanent deletion — requires confirmation pattern |
| Icon + label | Action with supporting icon for recognition |
| Icon only | Toolbar / space-constrained — must have accessible name |

### Anatomy

```
[ Icon? ]  Label text  [ Icon? ]
└─────────────────────────────┘
         Button container
```

- **Label**: Required on all variants except icon-only. Sentence case. Verb-first ("Save record", "Add medication").
- **Icon**: Optional. Leads the label. Never follows.

### Sizing

| Size | Height | Padding H | Usage |
|---|---|---|---|
| Small  | 32px | 12px | Inline, table actions |
| Medium | 40px | 16px | Default |
| Large  | 48px | 24px | Primary CTAs, mobile |

Minimum touch target: 44×44px — apply padding or invisible hit area for the small variant.

### States

| State | Behaviour |
|---|---|
| Default | Standard appearance |
| Hover | Background lightens / border strengthens |
| Focus | 3px amber focus ring + 2px dark inner shadow |
| Active | Background darkens |
| Loading | Spinner replaces/precedes label; button disabled |
| Disabled | Muted colours; `aria-disabled="true"` (not `disabled` attribute — preserves focus) |

### Button Spacing

- Minimum gap between adjacent buttons: `spacing.component.xs` (4px) — recommended: `space.3` (12px)
- Left-aligned on forms (GDS pattern). Right-aligned in modals and toolbars.

### Accessibility

- All buttons must have an accessible name.
- Icon-only: `aria-label` required.
- Loading: update `aria-label` to describe the in-progress state ("Saving record…").
- Do not use `disabled` attribute on buttons that should remain focusable.
- Warning/Destructive: always pair with a confirmation dialog. Never execute irreversible actions on a single click.

### Content Guidelines

- Label format: imperative verb + object. "Save record", "Add medication", "Cancel appointment".
- Avoid vague labels: "OK", "Yes", "Submit".
- Sentence case. No exclamation marks.

### Engineering Notes

- Blazor: render as `<button type="button">` or `<button type="submit">`. Never `<input type="button">`.
- Always specify `type` explicitly.
- MAUI: map to `Button` control with custom design token style.

---

## 17. Component: Patient Banner

**Status:** Planned  
**This is a safety-critical component. Changes require clinical safety review.**

### Purpose

Persistent strip at the top of all patient-contextual screens. Ensures clinical staff always know which patient they are viewing, reducing wrong-patient errors.

### Required Data Fields

| Field | Format | Notes |
|---|---|---|
| Full name | `Surname, Forename(s)` | Bold — most prominent |
| Date of birth | `DD MMM YYYY` + age | e.g. `15 Mar 1962 (64)` |
| NHS number | `XXX XXX XXXX` | Monospace, clearly separated |
| Gender / sex | As recorded | Do not abbreviate |
| Allergy status | Flag — see below | Always visible |

Optional (configurable per product): address, GP surgery, ward/location, preferred name.

### Allergy Flag

| State | Display |
|---|---|
| No known allergies | Muted: "No known allergies" |
| Allergies recorded | High-visibility badge: "Allergies" — links to allergy list |
| Status unknown | Amber: "Allergy status unknown" |

Do not use colour alone — always include text.

### Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│  SMITH, Jane Elizabeth        DOB: 15 Mar 1962 (64)  ⚠ Allergies    │
│  NHS: 485 777 3456            Female                                 │
└──────────────────────────────────────────────────────────────────────┘
```

- Full width — spans the entire viewport, outside the column grid.
- Fixed at top of content area (below global navigation).
- Background: `sr.color.interactive.primary`. Text: `sr.color.text.inverse`.

### States

| State | Behaviour |
|---|---|
| Loaded | Normal display |
| Loading | Skeleton placeholders — do not show partial data |
| No patient context | Banner not shown |
| Data error | Show name and NHS number if available; flag other fields as unavailable |

### Accessibility

- Use `role="region"` with `aria-label="Patient information"` (not `role="banner"` — conflicts with page `<header>`).
- Allergy flag: icon + text always. Never colour alone.
- NHS number: `aria-label="NHS number: 485 777 3456"` — readable as a grouped number, not individual digits.
- Do not put interactive elements inside the banner that distract from primary task flow.

### Clinical Safety Notes

- Must never display data from a different patient session.
- Session timeout must clear the banner simultaneously.
- Any modification to displayed fields requires clinical informatics review.

### Engineering Notes

- Blazor: implement as a cascading parameter or persistent layout component.
- MAUI: implement as a shared shell view, not repeated per-page.
- Do not cache patient data in local storage.

---

## 18. Pattern: Form Validation

**Status:** Planned

### Problem

Users make errors in complex clinical forms. Validation must communicate which fields are invalid, why, and how to fix them — without confusion under time pressure.

### Solution

Two-layer validation: an **error summary** at the top of the form, and **inline errors** next to each invalid field. Both always shown together.

### Error Summary

Displayed above the form heading on a failed submission:

```
┌─────────────────────────────────────────────────────────┐
│ ✕  There is a problem                                   │
│    • Date of birth must be in the past                  │
│    • NHS number must be 10 digits                       │
└─────────────────────────────────────────────────────────┘
```

- Contains: "There is a problem" / "There are X problems"
- Each error is a link — clicking navigates to the relevant field
- Focus moves to the error summary on render after submission

### Inline Error

```
Label text
Hint text (optional)
Error: Date of birth must be in the past
[ Day  ] [ Month ] [ Year ]
```

- Shown between the label/hint and the input
- Red left border on the field container
- Text in `sr.color.status.critical`, prefixed with visually-hidden "Error:" for screen readers
- Associated with field via `aria-describedby`

### When to Validate

| Trigger | Approach |
|---|---|
| Form submission | Full validation — error summary + all inline errors |
| Field blur | Inline error for that field only — no error summary |
| Real-time / keypress | Only for format feedback (character count) — not required fields |

Do not validate empty required fields on blur — only on submission.

### Error Message Guidelines

- Be specific: "Enter a date of birth" not "This field is required"
- Include expected format: "Enter the date as DD MM YYYY"
- Do not blame: "The date must be…" not "You entered an invalid…"
- Match summary wording to inline wording exactly
- Sentence case. No trailing full stop.

### Accessibility

- Error summary: `tabindex="-1"`, focus set programmatically on submission failure
- Each link in summary navigates to and focuses the invalid field
- `aria-invalid="true"` on invalid inputs
- `aria-describedby` links input to its inline error
- Do not use colour alone — "Error:" prefix and border style carry the state

---

## 19. Pattern: Confirmation Dialog

**Status:** Planned

### When to Use

**Always use** before:
- Permanently deleting any record or data
- Overriding a clinical alert or safety check
- Discharging, transferring, or closing a patient episode
- Sending external communications (referrals, prescriptions)
- Any action described as irreversible

**Do not use** for routine saves or low-stakes reversible actions.

### Structure

```
┌──────────────────────────────────────────────────────────┐
│  Dialog heading                                          │
│                                                          │
│  One or two sentences explaining what will happen        │
│  and why it matters.                                     │
│                                                          │
│  [ Cancel ]          [ Confirm action label ]            │
└──────────────────────────────────────────────────────────┘
```

- **Heading**: States the action clearly. "Delete medication record" not "Are you sure?"
- **Body**: States the consequence. "This will permanently delete the medication record for Aspirin 75mg. This cannot be undone."
- **Cancel** (secondary button): Always present. Always on the left.
- **Confirm** (warning or destructive button): Specific label matching the action. "Delete record" not "Yes" or "OK".

### Behaviour

- Opens centred over the page with an overlay
- Focus moves to the dialog on open; trapped within it
- Tab cycles only between Cancel and Confirm
- Escape triggers Cancel
- Clicking the overlay does **not** dismiss — clinical dialogs require explicit dismissal
- On Cancel: dialog closes, focus returns to trigger, no action
- On Confirm: dialog closes, action executes, success/error state shown

### Accessibility

- `role="dialog"` with `aria-modal="true"`
- `aria-labelledby` → dialog heading
- `aria-describedby` → explanation paragraph
- Focus moves to heading or first interactive element on open
- Focus returns to trigger on close

### Destructive Variant

For permanent data deletion, use the destructive button variant (red). For very high-risk clinical actions, consider a two-step confirmation:
1. First dialog: explanation + cancel/confirm
2. Second dialog: "Type DELETE to confirm" — only for truly critical, not routine

---

## 20. Design Decisions

Significant design choices are recorded as Design Decision Records (DDRs). A DDR is required before any non-trivial structural change.

### DDR-001: 4px Base Spacing Unit

**Date:** 2026-03-18 | **Status:** Accepted

Adopt 4px as the base spacing unit. All spacing values are multiples of 4px.

**Why not 8px?** Lacks granularity for compact clinical data views (table cells, badges, dense forms). 4px provides the necessary range — tight (4px, 8px) and comfortable (16px, 24px) — without arbitrary off-scale values.

**Why not 5px?** Does not align with standard pixel grids; awkward in code; not used by GDS or NHS England.

**Consequences:** Off-scale values (6px, 10px, etc.) are not permitted. Raise a DDR if a genuine need arises.

---

### DDR-002: WCAG 2.2 AA as Mandatory Baseline

**Date:** 2026-03-18 | **Status:** Accepted

WCAG 2.2 AA is the mandatory minimum for all components, patterns, and products. No component is approved without meeting this standard.

**Why WCAG 2.2 (not 2.1)?** WCAG 2.2 is the legally applicable standard under EN 301 549 for Welsh public sector digital services. New 2.2 criteria (SC 2.4.11 focus indicators, SC 2.5.8 target size, SC 3.3.8 accessible authentication) are directly applicable to clinical workstation interfaces.

**Why not full AAA?** WCAG does not expect universal AAA conformance — some criteria are impossible to meet across all content types. AA is the legal and clinical requirement.

**Consequences:** All colour pairings are verified against WCAG 2.2 contrast requirements. Clinical alert and status components additionally target AAA contrast.

---

### DDR-003: Lucide as Icon Library

**Date:** 2026-03-23 | **Status:** Accepted | **Supersedes:** Provisional Material Symbols evaluation

Adopt Lucide Icons as the SR icon library (ISC licence, 24×24px grid, 2px stroke, outline only).

**Why not NHS App icon set?** Only 21 consumer navigation icons — insufficient for clinical product scope. Does not cover medication, allergy, lab results, imaging, ward management, or any of the 80+ clinical/administrative concepts in the SR catalogue.

**Why not Material Symbols?** Google Material visual language is not aligned with NHS/GDS design principles. Apache 2.0 licence adds attribution requirements. Variable font weight is less predictable than fixed-stroke.

**Why Lucide?** 1,500+ icons; ISC licence; consistent 24px grid; clean minimal visual language compatible with NHS/GDS; NuGet packages for Blazor and MAUI; 106-icon SR clinical/admin catalogue fully covered.

**Consequences:** Always use SR catalogue aliases — not raw Lucide names. Delphi requires rasterised PNG export workflow. Filled variants are not assigned speculatively.

---

## 21. Figma Variable Mapping

### Convention

| Layer | Format | Example |
|---|---|---|
| Figma variable (primitives) | `Primitives/Group/Scale` | `Primitives/Blue/800` |
| Figma variable (semantic) | `SR/Category/Name` | `SR/Interactive/Primary` |
| Design token (primitives) | `color.{hue}.{scale}` | `color.blue.800` |
| Design token (semantic) | `sr.color.{category}.{name}` | `sr.color.interactive.primary` |
| CSS custom property | `--sr-color-{category}-{name}` | `--sr-color-interactive-primary` |
| MAUI resource | `SrColor{Category}{Name}` | `SrColorInteractivePrimary` |

### Semantic Colour — Interactive

| Figma Variable | Token | Light alias | Dark alias |
|---|---|---|---|
| `SR/Interactive/Primary` | `sr.color.interactive.primary` | `color.blue.800` | `color.cyan.900` |
| `SR/Interactive/Primary Hover` | `sr.color.interactive.primary-hover` | `color.blue.900` | `color.cyan.800` |
| `SR/Interactive/Secondary` | `sr.color.interactive.secondary` | `color.navy.900` | `color.blue.300` |
| `SR/Interactive/Link` | `sr.color.interactive.link` | `color.info-blue.700` | `color.cyan.400` |
| `SR/Interactive/Destructive` | `sr.color.interactive.destructive` | `color.red.600` | `color.red.600` |

### Semantic Colour — Surface

| Figma Variable | Token | Light alias | Dark alias |
|---|---|---|---|
| `SR/Surface/Background` | `sr.color.surface.background` | `color.grey.100` | `color.navy.900` |
| `SR/Surface/Small Cards` | `sr.color.surface.small-cards` | `color.white` | `color.cyan.900` |
| `SR/Surface/Accent` | `sr.color.surface.accent` | `color.cyan.100` | `color.blue.900` |
| `SR/Surface/Subtle` | `sr.color.surface.subtle` | `color.blue.50` | `color.navy.700` |
| `SR/Surface/Section Cards` | `sr.color.surface.section-cards` | `color.white` | `color.blue.900` |

### Semantic Colour — Text

| Figma Variable | Token | Light alias | Dark alias |
|---|---|---|---|
| `SR/Text/Primary` | `sr.color.text.primary` | `color.grey.900` | `color.white` |
| `SR/Text/Secondary` | `sr.color.text.secondary` | `color.grey.600` | `color.grey.200` |
| `SR/Text/Inverse` | `sr.color.text.inverse` | `color.white` | `color.grey.900` |

### Semantic Colour — Border

| Figma Variable | Token | Light alias | Dark alias |
|---|---|---|---|
| `SR/Border/Subtle`  | `sr.color.border.subtle`  | `color.grey.100` | `color.navy.700` |
| `SR/Border/Default` | `sr.color.border.default` | `color.grey.200` | `color.navy.500` |
| `SR/Border/Strong`  | `sr.color.border.strong`  | `color.grey.600` | `color.navy.300` |
| `SR/Border/Focus`   | `sr.color.border.focus`   | `color.focus-yellow` | `color.focus-yellow` |

### Semantic Colour — Brand

| Figma Variable | Token | Light alias | Dark alias |
|---|---|---|---|
| `SR/Brand/Accent` | `sr.color.brand.accent` | `color.cyan.700` | `color.cyan.700` |

### Semantic Colour — Status

| Figma Variable | Token | Light alias | Dark alias |
|---|---|---|---|
| `SR/Status/Critical` | `sr.color.status.critical` | `color.red.600` | `color.red.100` |
| `SR/Status/Critical Surface` | `sr.color.status.critical-surface` | `color.red.100` | `color.blue.900` |
| `SR/Status/Success` | `sr.color.status.success` | `color.green.600` | `color.green.100` |
| `SR/Status/Success Surface` | `sr.color.status.success-surface` | `color.green.100` | `color.navy.900` |
| `SR/Status/Warning` | `sr.color.status.warning` | `color.yellow.500` | `color.yellow.500` |
| `SR/Status/Warning Surface` | `sr.color.status.warning-surface` | `color.yellow.100` | `color.navy.700` |
| `SR/Status/Info` | `sr.color.status.info` | `color.info-blue.700` | `color.info-blue.700` |
| `SR/Status/Info Surface` | `sr.color.status.info-surface` | `color.info-blue.100` | `color.navy.900` |

### Border Width and Radius

| Figma Variable | Token | Value | CSS property |
|---|---|---|---|
| `SR/Border/Width/Default` | `sr.border.width.default` | 1px | `--border-width-default` |
| `SR/Border/Width/Strong`  | `sr.border.width.strong`  | 2px | `--border-width-strong` |
| `SR/Radius/None` | `sr.radius.none` | 0px    | `--radius-none` |
| `SR/Radius/SM`   | `sr.radius.sm`   | 2px    | `--radius-sm`   |
| `SR/Radius/MD`   | `sr.radius.md`   | 4px    | `--radius-md`   |
| `SR/Radius/LG`   | `sr.radius.lg`   | 8px    | `--radius-lg`   |
| `SR/Radius/Full` | `sr.radius.full` | 9999px | `--radius-full` |

### Touch Targets

| Figma Variable | Token | Value |
|---|---|---|
| `SR/Touch/Default`  | `sr.touch.default`  | 44px |
| `SR/Touch/Compact`  | `sr.touch.compact`  | 32px |
| `SR/Touch/Minimum`  | `sr.touch.minimum`  | 24px |

### Spacing

| Figma Variable | Token | CSS Custom Property |
|---|---|---|
| `Spacing/Component/XS` | `spacing.component.xs` | `--spacing-component-xs` |
| `Spacing/Component/SM` | `spacing.component.sm` | `--spacing-component-sm` |
| `Spacing/Component/MD` | `spacing.component.md` | `--spacing-component-md` |
| `Spacing/Component/LG` | `spacing.component.lg` | `--spacing-component-lg` |
| `Spacing/Component/XL` | `spacing.component.xl` | `--spacing-component-xl` |
| `Spacing/Form/Field Gap` | `spacing.form.field-gap` | `--spacing-form-field-gap` |
| `Spacing/Form/Label Gap` | `spacing.form.label-gap` | `--spacing-form-label-gap` |

### Typography Primitives

| Figma Variable | Token | Value |
|---|---|---|
| `Primitives/Font/Family/Primary` | `font.family.primary` | `Roboto` |
| `Primitives/Font/Weight/Regular` | `font.weight.regular` | `400` |
| `Primitives/Font/Weight/Medium` | `font.weight.medium` | `500` |
| `Primitives/Font/Weight/Bold` | `font.weight.bold` | `700` |
| `Primitives/Font/Letter Spacing/Default` | `font.letter-spacing.default` | `0px` |
| `Primitives/Font/Letter Spacing/Wide` | `font.letter-spacing.wide` | `0.7px` |
| `Primitives/Font/Letter Spacing/Caption` | `font.letter-spacing.caption` | `0.24px` |

### Semantic Typography Styles

| Figma group | Token | Desktop | Mobile |
|---|---|---|---|
| `Typography/Heading XL` | `sr.typography.heading-xl` | 48px / 54px lh / Bold | 32px / 38px lh / Bold |
| `Typography/Heading L` | `sr.typography.heading-l` | 36px / 42px lh / Bold | 27px / 33px lh / Bold |
| `Typography/Heading M` | `sr.typography.heading-m` | 26px / 32px lh / Bold | 22px / 29px lh / Bold |
| `Typography/Heading S` | `sr.typography.heading-s` | 22px / 30px lh / Bold | 19px / 27px lh / Bold |
| `Typography/Heading XS` | `sr.typography.heading-xs` | 16px / 24px lh / Bold | 16px / 24px lh / Bold |
| `Typography/Body M` | `sr.typography.body-m` | 16px / 24px lh / Regular | 16px / 24px lh / Regular |
| `Typography/Body S` | `sr.typography.body-s` | 14px / 24px lh / Regular | 14px / 24px lh / Regular |
| `Typography/Label` | `sr.typography.label` | 14px / 20px lh / Medium / Wide | 14px / 20px lh / Medium / Wide |
| `Typography/Caption` | `sr.typography.caption` | 12px / 16px lh / Regular / Caption | 12px / 16px lh / Regular / Caption |

---

## 22. For Designers

### Getting Started

1. Request Figma access from the design lead (editor access required).
2. Use **library components** — do not detach instances without documented reason.
3. Use **library variables** for all colour, spacing, and typography — no hardcoded values.
4. Familiarise yourself with semantic colour and typography tokens before designing anything new.

### Designing a New Component

1. Check `/components/README.md` — does something already cover the need?
2. Check GDS and NHS England — has this been solved already?
3. If genuinely new: agree scope with the design lead before starting.
4. Design all states: default, hover, focus, active, disabled, error, loading.
5. Include an accessibility section — not optional.
6. Submit for design review and accessibility review before marking approved.

### Accessibility in Design

- Every interactive element needs a visible focus state designed.
- Status and error states must not rely on colour alone.
- Check contrast ratios before submitting. 4.5:1 AA minimum for normal text.
- Consider screen reader experience — what gets announced? In what order?

### Making a Design Decision

For significant choices (new token, new pattern, deviation from GDS), write a DDR before implementation. The DDR creates a permanent record and prevents the same debate recurring.

---

## 23. For Engineers

### Token Consumption

**Web (Blazor) — CSS custom properties:**

```css
:root {
  --sr-color-interactive-primary: #325083;
  --sr-color-text-primary: #212B32;
  --spacing-component-md: 1rem;
}

.sr-button-primary {
  background-color: var(--sr-color-interactive-primary);
  color: #FFFFFF;
  padding: 0 var(--spacing-component-md);
  min-height: 40px;
  border-radius: var(--radius-md);
}
```

**.NET MAUI — XAML resource dictionary:**

```xml
<Color x:Key="SrColorInteractivePrimary">#325083</Color>
<Color x:Key="SrColorTextPrimary">#212B32</Color>
```

### Focus Ring (Required on All Interactive Elements)

```css
:focus-visible {
  outline: 3px solid var(--sr-color-border-focus); /* #FFEB3B */
  outline-offset: 2px;
  box-shadow: 0 0 0 2px #1B294A; /* navy-900 inner ring */
}
```

Never override this without a documented reason. Never `outline: none`.

### Accessibility Implementation Checklist

For every component or feature:

- [ ] All interactive elements have accessible names
- [ ] Focus ring uses the correct token values and is visible
- [ ] Tab order is logical and matches visual order
- [ ] `aria-invalid`, `aria-describedby`, `aria-label` applied where specified
- [ ] Keyboard interaction matches the component spec
- [ ] `prefers-reduced-motion` respected
- [ ] Minimum touch target: 44×44px (WCAG 2.2 SC 2.5.8)
- [ ] Screen reader testing completed (NVDA + Chrome minimum)

### Semantic HTML First

- Use native HTML elements: `<button>`, `<a>`, `<input>`, `<select>`, `<details>`.
- Only use ARIA to extend semantics — not to repair broken HTML.
- `role="button"` on a `<div>` is wrong. Use `<button>`.

### Implementing a Component

1. Read the spec at `/components/{name}/spec.md` fully before writing any code.
2. Implement all states — do not skip hover, focus, disabled, or loading.
3. Apply the focus ring exactly as specified.
4. Implement all ARIA attributes from the spec.
5. Test with keyboard only, then with a screen reader.
6. Run a contrast check on the rendered output.

---

## 24. Contribution Rules

### Before Making Changes

- Read relevant existing files before editing or creating anything.
- Check `/decisions/` — the decision may already have been made.
- Do not invent new design tokens — use or extend existing tokens in `/foundations/tokens/`.

### Commit Conventions

```
type(scope): short description

Types: feat, fix, docs, refactor, accessibility, token, decision
Scopes: foundations, components, patterns, accessibility, docs, products/{name}

Examples:
  feat(components): add summary-card component spec
  token(foundations): add semantic colour tokens for status states
  decision(foundations): record choice of 4px base spacing unit
  accessibility(components): update focus state guidance for form inputs
```

### What Not to Do

- Do not add dependencies, tooling, or frameworks without a DDR.
- Do not create empty placeholder files.
- Do not hardcode colour, spacing, or typography values in components.
- Do not copy-paste from external design systems without adaptation and attribution.
- Do not mark a component as approved without accessibility review.

### Product Extensions

The core system is shared across all Single Record products. Products may extend — but must not contradict — the core.

| Area | Location |
|---|---|
| Core system | `/foundations`, `/components`, `/patterns` |
| EPR-specific | `/products/epr/` |
| Patient admin-specific | `/products/patient-admin/` |

### Contacts

| Role | Responsible for |
|---|---|
| Design lead | Figma library, component decisions, design tokens |
| Engineering lead | Code implementation, token consumption, build pipeline |
| Accessibility lead | WCAG compliance, testing, assistive technology review |

---

*This file reflects the state of the design system as of the date in the repository commit history. If it conflicts with Figma, raise it with the design lead — do not resolve it silently.*
