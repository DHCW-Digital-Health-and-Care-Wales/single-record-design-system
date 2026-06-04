# Session Handoff — DHCW Single Record Design System

Read this at the start of every AI-assisted session. Update it at the end.  
For the full log of design language changes, see `design-language-backlog.md`.

---

## Hard Constraints — Never Override Without Explicit Permission

| Constraint | Detail |
|---|---|
| `Interactive/Primary` = Blue/800 | Do NOT scale down to Blue/700 or any other value. Key decisions on colour require explicit sign-off before applying. |
| DL-003 deferred | Active/pressed state for Primary button is unresolved. Blue/900 is taken by hover. Do not assign an active/pressed colour without sign-off. |
| Colour scale, token naming, structural changes | Require explicit user sign-off before applying — do not act on recommendations alone. |

---

## Current Design System State (as of 2026-06-04)

### Tokens in Figma
- **Primitives:** Blue, Navy, Cyan, Red, Green, Teal, White, Grey scales defined
- **Semantic (Single Record):** Interactive/Primary, Interactive/Destructive, Interactive/Disabled, Text/Default, Text/Inverse, Text/Disabled, Surface/Default, Surface/Small Cards, Border/Default, Border/Focus, Border/Disabled
- **Missing (pending sign-off):** `Border/Error` → see DL-006

### Components completed in Figma
| Component | Status | Notes |
|---|---|---|
| Button | Done | All 12 disabled variants use semantic disabled tokens. Active/pressed deferred (DL-003). |
| Input Field / Text Input | Done | Error states use `Interactive/Destructive` directly — will shift to `Border/Error` when DL-006 lands |
| Checkbox | Done | 11 variants. Checkmark is a proper vector path. All fills, strokes, text bound to variables. Error-indeterminate removed; error-checked has red border. |
| Radio | Done | Building blocks and templates variable-bound |
| Toggle Switch | Done | Focus ring is OUTSIDE stroke on Track Wrapper only (not label). 3px padding added to variant for ring clearance. |
| Select | Done | |
| Navigation / Sidebar | Done | All Nav Item instances swapped to correct component set (368:3682). 140 instances updated. |
| Breadcrumbs | Done | |
| Header / Footer | Done | |
| Tags | In progress | |
| Error/Warning Messages | In progress | |

### Icons (page 103:760)
- Library is Lucide-based, 24×24, stroke-only, all strokes bound to `VariableID:203:100` (Text/Default)
- Recently added: `Icon/action/edit2` (Lucide square-pen) — use for editing a record/document; `Icon/action/edit` (plain pen) for inline text editing
- Recently added: `Icon/status/error-circle` (circle with exclamation) — use alongside error text
- Status icons exist for: info, warning, error-circle, pending

---

## Open Work Items

### Pending sign-off before acting
| Item | What's needed |
|---|---|
| DL-006: `Border/Error` token | Create `Border/Error` → `Interactive/Destructive` → Red/600. Apply to all form error borders. Needs sign-off first. |
| DL-003: Active/pressed state | Blue/800 = default, Blue/900 = hover. Active/pressed colour TBD. Do not proceed without sign-off. |

### Ready to action (no sign-off needed)
| Item | Detail |
|---|---|
| Apply disabled tokens to remaining components | Tabs, form controls beyond Button still use primitives. Pattern: `Interactive/Disabled` (Blue/400), `Text/Disabled` (Navy/300), `Border/Disabled` (Navy/300) |
| DL-005 component audit | Desktop heading scale changed (XS=16, S=20, M=24, L=28, XL=36). Need visual check on Button, Input Field, Select, and any component using SR Typography/Desktop/Heading S–XL |
| Toggle building blocks | `_Toggle/Track` and related building blocks not yet formalised |
| Show/hide pattern for component parts | Decision made: boolean Component Property for optional decoration (icons, badges); variant for layout-shifting show/hide (label, hint). Hidden layers = `visible=false`, never delete. Apply consistently when building new components. |

---

## Key Semantic Decisions (summary — full detail in DDRs)

| Decision | Rule |
|---|---|
| `Interactive/Destructive` vs `Status/Critical` | Same colour (Red/600), different roles. `Interactive/Destructive` = UI action risk (delete button, error border on forms). `Status/Critical` = clinical severity label (badge, tag). Never swap them. |
| Show/hide on components | Boolean property for optional decoration. Variant for structural layout changes. Hidden = `visible=false`, never deleted. |
| Dark mode Interactive/Primary | Cyan/850 (`#0c7b99`). Was Cyan/900. Gives 4.88:1 contrast (WCAG AA) with white text. Do not revert. |
| Heading scale | Governed by **DDR-005** (supersedes DDR-004). Desktop XS=16/24, S=20/28, M=24/32, L=28/36, XL=36/44. Mobile XS=16/24, S=18/24, M=20/28, L=24/32, XL=28/36. All line-heights on the 4px grid; letter-spacing aligned to Figma (wide=0.3, caption=0.2). |
| Focus rings | Yellow (`Border/Focus`), OUTSIDE stroke, applied to the interactive element itself — not a wrapper frame that includes a label. |

---

## Figma File Reference

| Thing | Node ID | Notes |
|---|---|---|
| Icons page | 103:760 | All icon components live in "Icon Components (Lucide)" frame |
| Icon/action/edit | 189:25 | Lucide pen |
| Icon/action/edit2 | 1541:20 | Lucide square-pen (added 2026-06-04) |
| Icon/status/error-circle | 1444:20 | Circle + exclamation |
| Checkbox component | 843:14568 | 11 variants |
| Nav Item component set | 368:3682 | Use this. The old flat component 368:3681 is deprecated. |
| Sidebar Navigation | 725:8903 | 140 Nav Item instances, all pointing to 368:3682 |
| Stroke/icon colour variable | VariableID:203:100 | Text/Default — used for all icon strokes |
| Border/Focus variable | VariableID:203:105 | Yellow focus ring |
| Interactive/Destructive | VariableID:203:94 | Red/600 — error borders, destructive actions |
| Border/Disabled | VariableID:1351:22 | |
| Text/Disabled | VariableID:1351:21 | |

---

## How to Update This File

At the end of a session, update:
1. **Current Design System State** — mark anything newly completed
2. **Open Work Items** — move done items out, add new ones
3. **Key Semantic Decisions** — add any new decisions made
4. **Figma File Reference** — add new node IDs for components created

Keep entries brief. This is a handoff doc, not a changelog — the backlog and DDRs hold the full history.
