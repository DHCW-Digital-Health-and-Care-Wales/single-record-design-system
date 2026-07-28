# CLAUDE.md — Project Instructions for AI-Assisted Work

This file defines how this repository is maintained and how AI-assisted contributions should be made. Read it before making any changes.

---

## What This Repository Is

The **DHCW Single Record Design System** is a production design system for the Single Record programme within NHS Wales (DHCW). It supports multiple clinical and administrative products across web, mobile, and desktop platforms.

This is a healthcare system. Decisions affect real clinical staff and patients. Accuracy, accessibility, and consistency are non-negotiable.

---

## Repository Principles

1. **Everything must have a reason.** Do not create files, components, or patterns unless they serve a current, documented need.
2. **Accessibility is a hard requirement.** WCAG 2.2 AA is the minimum. Where feasible, target AAA. Never compromise on this.
3. **Consistency over novelty.** Align with GDS and NHS England patterns before inventing new ones.
4. **Design before building.** All components and patterns should originate in Figma and be documented in `/foundations` or `/components` before any code implementation.
5. **Decision records are mandatory** for any non-trivial design choice. Use `/decisions/` and follow the DDR format.

---

## Directory Structure

```
/foundations       Design tokens: colour, typography, spacing, elevation, motion, iconography
/components        Individual UI components — one folder per component (spec.md / guidelines.md)
/patterns          Composed interactions and page-level patterns
/accessibility     WCAG 2.2 guidance, testing checklists, assistive technology notes
/decisions         Design Decision Records (DDRs) — permanent log of key choices
/docs              Guides for designers and engineers contributing to or using this system
/products          Per-product extensions or overrides (only where products diverge from core)
/figma             Figma variable exports, token mappings, and handoff conventions
/packages          Code monorepo (DDR-007): tokens, web, react, blazor, maui, storybook, website
```

---

## Standards

| Standard | Role |
|---|---|
| WCAG 2.2 AA | Mandatory compliance baseline |
| GDS Design System | Primary reference for patterns and interaction design |
| NHS England Design System | Reference for clinical UI conventions |
| CDPS Wales | Reference for public sector Welsh-language and accessibility guidance |

---

## Working Rules for AI-Assisted Sessions

### Before making changes
- **Read `/decisions/handoff.md` first.** It contains the current state of the design system, hard constraints, open work items, and key Figma node references. Do not skip this.
- Read relevant existing files before editing or creating anything
- Check `/decisions/` for prior decisions that may affect your work
- Do not assume anything about component behaviour — look it up or ask

### When creating components or patterns
- Follow `docs/templates/component-spec-template.md` (→ `components/{name}/spec.md`) for a component's contract, and `docs/templates/guidelines-template.md` (→ a sibling `*.guidelines.md` or `guidelines.md`) for its usage guidance. A guidelines file is the single source for both the Figma "Guidelines / Usage notes" panel and the DS website page — do not fork the content between the two.
- Every component needs: purpose, anatomy, usage guidance, accessibility notes, and known variants
- Do not invent new design tokens — use or extend those in `/foundations/tokens/`
- **Always use existing icon components** from the Icons page (`103:760`, `Icon/{group}/{name}`) when a component needs an icon. Do not draw inline vector/SVG placeholders. If an appropriate icon does not exist, ask the user before importing a new one from the Lucide library.

### When editing the Figma file
- **Author directly with the Figma MCP `use_figma` tool.** Do not build or run a Figma plugin to generate design content. The legacy plugins under `figma/plugins/` predate this convention and carry stale, hand-inlined colour data — do not run them without reconciling them against the tokens first.
- The Figma file key is recorded in `/decisions/handoff.md` (Figma File Reference table). Every Figma MCP tool requires it.

### When creating design tokens
- Tokens must use a three-tier structure: **global → semantic → component**
- All colour tokens must meet WCAG 2.2 contrast ratios before being added
- Token names follow the format: `{tier}.{category}.{variant}` (e.g. `color.interactive.primary`)

### When writing documentation
- Write for two audiences: designers (Figma users) and engineers (.NET, Blazor, MAUI)
- Be concise. Use tables and lists. Avoid prose where structure works better.
- Do not document hypothetical future states — document what exists

### When making structural decisions
- Write a DDR in `/decisions/` before restructuring anything significant
- Use `DDR-000-template.md` as the base format

### What not to do
- Do not add dependencies, tooling, or frameworks without a DDR
- Do not create empty placeholder files
- Do not use design system jargon that clinical staff wouldn't understand in user-facing content
- Do not copy-paste from external design systems without adaptation and attribution

---

## Product Scope

The core system (tokens, components, patterns) is shared across all products. Products may extend — but not contradict — the core.

| Product area | Location |
|---|---|
| Core system | `/foundations`, `/components`, `/patterns` |
| Product-specific | `/products/{product-name}/` |

Current products under the Single Record programme: **EPR**, **patient administration**. Others TBD.

---

## Technology Context

| Platform | Technology | Status |
|---|---|---|
| Web (reference baseline) | Standard HTML / CSS | Current |
| Web applications | Blazor / .NET | Current |
| Web applications | React | Current |
| Desktop / Mobile | .NET MAUI | Current |
| Legacy web | .NET Framework 4.8 | Limited — tokens (CSS custom properties) only |
| Legacy desktop | Delphi | Maintained, not extended |

Components and patterns must be implementation-agnostic at the design level. Per-framework consumption guidance lives in `/docs/for-engineers.md`.

---

## Commit Conventions

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

---

## Key Contacts

| Role | Responsible for |
|---|---|
| Design lead | Figma library, component decisions, design tokens |
| Engineering lead | Code implementation, token consumption, build pipeline |
| Accessibility lead | WCAG compliance, testing, assistive technology review |
