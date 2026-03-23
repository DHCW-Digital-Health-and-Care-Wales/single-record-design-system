# Design Decision Records

A permanent log of significant design decisions. DDRs explain what was decided, why, and what alternatives were considered.

DDRs exist to:
- Prevent the same debate recurring
- Give new contributors context they would otherwise lack
- Create accountability for decisions
- Enable future decisions to be made with awareness of existing constraints

---

## Index

| DDR | Title | Status | Date |
|---|---|---|---|
| DDR-001 | 4px base spacing unit | Accepted | 2026-03-18 |
| DDR-002 | WCAG 2.2 AA as mandatory baseline | Accepted | 2026-03-18 |
| DDR-003 | Lucide as icon library | Accepted | 2026-03-23 |

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
