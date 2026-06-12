# DHCW Single Record Design System

A design system for the Single Record programme within NHS Wales (DHCW). Provides a shared design language, component library, and interaction patterns across clinical and administrative products.

---

## Who This Is For

- **Designers** working on Single Record products in Figma
- **Engineers** implementing components in standard HTML/CSS, Blazor, React, or .NET MAUI
- **Anyone** making decisions that affect the visual or interactive consistency of these products

---

## Quick Start

| I want to… | Go to… |
|---|---|
| Understand the rules | `CLAUDE.md` |
| Find or add a component | `/components/README.md` |
| Find or add a pattern | `/patterns/README.md` |
| Look up design tokens | `/foundations/tokens/` |
| Check accessibility requirements | `/accessibility/README.md` |
| See past design decisions | `/decisions/README.md` |
| Prepare a Figma handoff | `/figma/handoff-conventions.md` |
| Start contributing (designer) | `/docs/for-designers.md` |
| Start contributing (engineer) | `/docs/for-engineers.md` |

---

## Repository Structure

```
/foundations       Design tokens: colour, typography, spacing, elevation, motion, iconography
/components        Individual UI components — one folder per component
/patterns          Composed UI patterns: forms, tables, dialogs, navigation, workflows
/accessibility     WCAG 2.2 guidance, focus management, contrast, screen reader notes
/decisions         Design Decision Records — permanent log of significant choices
/docs              Guides for designers and engineers; templates for specs and DDRs
/figma             Figma variable mapping, library structure, handoff conventions
/products          Product-specific extensions (EPR, patient admin, etc.)
```

---

## Standards

| Standard | Role |
|---|---|
| WCAG 2.2 AA | **Mandatory** — all components and products |
| GDS Design System | Primary reference for patterns and interaction design |
| NHS England Design System | Reference for clinical UI conventions |
| CDPS Wales | Reference for Welsh-language and public sector guidance |

---

## Technology

Standard HTML / CSS · Blazor / .NET · React · .NET MAUI · Legacy .NET Framework 4.8 (limited) · Legacy Delphi (maintained)

The design system is implementation-agnostic at the design level — tokens are the shared contract and each framework binds to the same token names. Per-framework consumption and a support matrix live in `/docs/for-engineers.md`.

---

## Status

**Active development** — foundations, tokens, and a growing component library (Button, Input, Select, Checkbox, Radio, Search, Link, Progress Indicators, Patient Banner, and more) are in use. Designers and engineers are onboarded to the Figma library and this repository. See `/decisions/handoff.md` for the current checkpoint and `/components/README.md` for the live component catalogue.
