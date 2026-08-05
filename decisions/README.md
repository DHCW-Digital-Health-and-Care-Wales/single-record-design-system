# Design Decision Records

A permanent log of significant design decisions. DDRs explain what was decided, why, and what alternatives were considered.

DDRs exist to:
- Prevent the same debate recurring
- Give new contributors context they would otherwise lack
- Create accountability for decisions
- Enable future decisions to be made with awareness of existing constraints

---

## Index

Regenerate this table whenever a DDR is added: it had drifted to listing 3 of
19. Every row is read from the DDR's own front matter, so the file is the
source and this is the summary.

| DDR | Title | Status | Date |
|---|---|---|---|
| [DDR-001](DDR-001-four-px-base-spacing.md) | 4px Base Spacing Unit | Accepted | 2026-03-18 |
| [DDR-002](DDR-002-wcag-aa-mandatory.md) | WCAG 2.2 AA as Mandatory Baseline | Accepted | 2026-03-18 |
| [DDR-003](DDR-003-lucide-icon-library.md) | Lucide as Icon Library | Accepted | 2026-03-23 |
| [DDR-004](DDR-004-desktop-heading-scale-revision.md) | Desktop Heading Scale Revision | Accepted | 2026-06-01 |
| [DDR-005](DDR-005-typography-scale-cleanup.md) | Typography Scale Cleanup (4px Grid) | Accepted | 2026-06-04 |
| [DDR-006](DDR-006-focus-ring-cyan.md) | Focus Ring: Cyan/700 (both modes) | Accepted | 2026-06-04 |
| [DDR-007](DDR-007-packages-monorepo-structure.md) | Packages monorepo structure for multi-framework delivery | Accepted | 2026-06-22 |
| [DDR-008](DDR-008-modal-dialog-component-vs-patterns.md) | Modal Dialog: one base component, confirmation & result as patterns | Accepted | 2026-06-23 |
| [DDR-009](DDR-009-storybook-component-catalogue.md) | Storybook as the component catalogue | Accepted | 2026-06-23 |
| [DDR-010](DDR-010-storybook-9-vite-7-security-upgrade.md) | Storybook 9 / Vite 7 upgrade to clear Dependabot advisories | Accepted | 2026-06-25 |
| [DDR-011](DDR-011-desktop-mobile-form-factor-model.md) | Desktop vs mobile: the form-factor model | Accepted | 2026-06-26 |
| [DDR-012](DDR-012-date-and-time-entry.md) | Date & time entry: 3-field input by default, calendar picker for scheduling | Accepted | 2026-07-01 |
| [DDR-013](DDR-013-filled-status-indicators.md) | Filled status indicators (Figma "warnings/*") as a component, not outline icons | Accepted | 2026-07-01 |
| [DDR-014](DDR-014-design-to-publish-workflow.md) | Design-to-Publish Workflow — Export Routing, Ownership & CI/CD | Accepted | 2026-07-07 |
| [DDR-015](DDR-015-primary-content-min-14px.md) | Primary-content minimum type size: Body S (14px) | Accepted | 2026-07-09 |
| [DDR-016](DDR-016-website-ia-and-publishing.md) | DS website IA and publishing (single Pages site: website at root, Storybook at /storybook) | Accepted | 2026-07-10 |
| [DDR-017](DDR-017-navigation-collapse-expand.md) | Navigation sidebar: collapse/expand behaviour | Accepted | 2026-07-23 |
| [DDR-018](DDR-018-cta-placement-forms-vs-modals.md) | CTA button placement: forms/sections vs. modals | Accepted | 2026-07-23 |
| [DDR-019](DDR-019-prototype-embed-sandpack.md) | Prototype embed: CodeSandbox Sandpack, not StackBlitz | Accepted | 2026-07-29 |
| [DDR-020](DDR-020-package-distribution-and-publishing.md) | Package Distribution — Registries, Versioning and Release | Proposed | 2026-08-04 |

---

## When to Write a DDR

Write a DDR for:
- Any new design token category
- Choosing a typeface, icon library, or colour palette
- Structural decisions (repo organisation, naming conventions)
- Deviating from GDS or NHS England patterns
- Any decision that, if reversed, would require significant rework

You do not need a DDR for:
- Adding a single token value within an established system
- Writing a component spec that follows existing conventions
- Documentation updates

---

## Format

Use the template at `/docs/templates/ddr-template.md`. Number sequentially.

File name: `DDR-NNN-short-slug.md`
