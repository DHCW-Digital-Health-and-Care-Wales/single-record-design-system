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

## Checkpoint — 2026-06-23

This session's accepted changes (in Figma, tokens, docs):

- **Notification banner** built (`2561:19825`). GDS-aligned name. 5 severity types (Information, Success, Warning, Error, Critical) + structural variants (Global/system, Inline, composed title+body+actions, Minimal). All bound to `Status/*` and `Status/* Surface`, icons from `Icon/status/*` and `Icon/warnings/*`. Critical tier is NHS-specific (above Error) for patient-safety alerts.
- **Yellow primitive scale expanded** from 2 stops (500, 100) to a full 50–900 scale, matching Red/Green. Added darker variants (`Yellow/700` `#8A5A00` for warning banner/pill text, plus 600/800/900). `Yellow/100` corrected to `#FDF3D7`, `Yellow/50` `#FFFAEB`. Applied in both `foundations/tokens/primitives/color.json` and the Figma Primitives collection.
- **Modal dialog** built (`2561:22206`). See **DDR-008**: one base `Modal dialog` component, with **Confirmation** and **Result** as composed patterns. Confirmation: Standard, Destructive, Warning, Acknowledgement, High-stakes (checkbox gate), Processing. Result: Success (simple / next-step / summary), Error. Includes usage/dev-handoff panels (when-to-use vs toast/inline banner, anatomy, accessibility, do-not, tokens). Uses `Elevation/Overlay`, `Button`, `Icon`, `Checkbox/Boxes`.
- **Packages monorepo + token build pipeline** landed earlier (DDR-007): Style Dictionary outputs CSS/SCSS/XAML/JSON from the DTCG sources. .NET 4.8 gets tokens (CSS custom properties) only — no component library; GovUk.Frontend.AspNetCore is incompatible with 4.8.
- **Storybook component catalogue** added (DDR-009). New `packages/storybook` (`@dhcw/sr-storybook`, dev-only, HTML+Vite renderer); root `package.json` adds npm workspaces. Stories live next to components in their packages. First reference component **Button** (`packages/web/src/button/`) + a **Foundations → Colour** token-showcase story ship with it, both rendering from generated `@dhcw/sr-tokens` CSS. `@storybook/addon-a11y` runs axe-core on every story. Telemetry disabled. `deploy-storybook` GitHub Action publishes the static build to GitHub Pages on push to `main` (needs one-time Settings → Pages → Source = "GitHub Actions"). Devs run `npm run storybook` (localhost:6006); everyone else uses the published URL. Build verified locally.

---

## Checkpoint — 2026-06-12

Snapshot taken as engineers were onboarded to the Figma library and this repo.

- **Required marker now on all form fields.** Checkbox (`Required#2287:0`) and Radio (`Required#2287:13`) joined Input, Select, and Search. See `/components/form-fields.md`.
- **Framework support broadened in docs.** Standard HTML/CSS (reference baseline), Blazor, React, and .NET MAUI are documented as current targets in `/docs/for-engineers.md`, with per-framework token consumption examples. Legacy **.NET Framework 4.8** added as *limited* (CSS custom properties / token values only — visual layer, no component model). Delphi noted as maintained, not extended. Tech tables in `README.md`, `DESIGN-SYSTEM.md`, and `CLAUDE.md` updated to match.
- **Concept prototypes removed.** `concept-patient-record.html` and `concept-patient-search.html` deleted from the repo root — they used hardcoded NHS colours, not design-system tokens, and were not referenced anywhere. Production patterns live in `/patterns/`.
- README status moved from "Initialising" to "Active development" with a pointer to the live component catalogue.

---

## Form fields rebound — 2026-06-04 (later in day)

Cross-cutting change applied to Input, Select, Radio, Checkbox:

- **Typography**: Label/Legend → `Label` (14/20 M), Value/Placeholder/Option text → `Body S` (14/20 R), Hint/Description/Error → `Caption` (12/16 R). 336 text nodes rebound across all sets and templates. See `/components/form-fields.md`.
- **Required boolean** added to Input and Select sets (`Required#1835:0`, `Required#1835:38`). Toggling shows an inline `*` in `Status/Critical` after the label. Pair with `aria-required` in code; the asterisk is decorative only.
- **Required boolean now on all form fields** (2026-06-12). Added to **Checkbox** (`Required#2287:0`) and **Radio** (`Required#2287:13`) — the asterisk renders after the group legend (Legend=Shown only). Each legend was wrapped in a horizontal `Label Row` to hold the inline `*`. **Search** already carried `Required#1851:50`. So Input, Select, Search, Checkbox, Radio all expose `Required` now.
- **Search variants removed from Input** (8 variants gone). The standalone `Search` component set (`1715:375`) is now canonical. For labelled/hinted search in a form, wrap a Search instance with label/hint rows.
- **Textarea variants added to Input** (4 — one per state, Label=Shown, Hint=Hidden, 120px min-height).
- See `/components/form-fields.md` for the full mapping and the Form Field wrapper as a future task.

---

## Weekly Checkpoint — 2026-06-04

This week's accepted changes (now reflected in Figma, tokens, and docs):

- **DDR-005** — typography scale cleaned to 4px grid. New desktop scale XS 16/24 · S 20/28 · M 24/32 · L 28/36 · XL 36/44. New mobile XS 16/24 · S 18/24 · M 20/28 · L 24/32 · XL 28/36. Letter-spacing aligned to Figma (`wide` 0.3, `caption` 0.2). Off-grid primitives deleted from Figma.
- **DDR-006** — focus ring changed from `Focus Yellow` (#FFEB3B) to `Cyan/700` (#12A3C9) in both modes. `focus-yellow` primitive deprecated, not yet removed.
- Dark mode `Interactive/Primary` updated to `Info Blue/600` (#0D62A3), hover to `Info Blue/800`. Supersedes the earlier Cyan/850 decision.
- New semantic tokens added: `Interactive/Disabled`, `Text/Disabled`, `Border/Disabled` (now bound across components).
- Surface/Background (light) shifted from `Grey/100` to `Blue/50` (#F4F5F8) for a slightly cooler page tone.
- Status surfaces in dark mode kept light (red.100, green.100, yellow.100, info-blue.100) — banners use light fills in both modes for contrast against the bright status colour.
- New components: **Link** component set (36 variants) — see `/components/link/spec.md`, Figma node `1633:320`.

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
| ~~Destructive button type~~ **(resolved 2026-06-24)** | The red 4th button type was named `Warning` but styled red. Renamed `Warning` → `Destructive` (Figma `1346:500` + coded `.sr-button--destructive`). No amber button added — GDS/NHS have no amber button; severity nuance lives in the confirmation dialog. Modal patterns instance `Destructive` directly. See DDR-008. |
| Show/hide pattern for component parts | Decision made: boolean Component Property for optional decoration (icons, badges); variant for layout-shifting show/hide (label, hint). Hidden layers = `visible=false`, never delete. Apply consistently when building new components. |
| ~~Enable GitHub Pages for Storybook~~ **(resolved 2026-06-24)** | Pages enabled on the DHCW org repo (Source = GitHub Actions). Storybook deploys to `https://dhcw-digital-health-and-care-wales.github.io/single-record-design-system/`. Personal repo doesn't have Pages (free plan); disable the workflow there via Actions → ⋯ → Disable workflow to avoid red-X noise. Mirror pushes via deploy key don't auto-trigger workflows on the org repo — use "Run workflow" manually after each mirror. |
| Narrow root `.gitignore` | Root `.gitignore` ignores bare `package.json`/`package-lock.json`; workspace manifests are force-added. Tighten the rules so package manifests track normally. |
| Grow Storybook coverage | Add stories alongside each new `@dhcw/sr-web` component; enable the `@dhcw/sr-react` stories glob in `.storybook/main.js` once that package has components. Storybook MCP deferred (DDR-009). |
| Blazor WASM component gallery | Scaffold a Blazor WebAssembly "gallery" app that renders `@dhcw/sr-blazor` components (starting with `SrButton`) in their full variant matrix. Deploy as a second GitHub Pages site via a `dotnet publish` workflow. **Priority: this week.** The existing Blazor product team needs a live-preview URL to evaluate adopting the design system. Pattern: static WASM output → `actions/upload-pages-artifact` → deploy. |

---

## Key Semantic Decisions (summary — full detail in DDRs)

| Decision | Rule |
|---|---|
| `Interactive/Destructive` vs `Status/Critical` | Same colour (Red/600), different roles. `Interactive/Destructive` = UI action risk (delete button, error border on forms). `Status/Critical` = clinical severity label (badge, tag). Never swap them. |
| Show/hide on components | Boolean property for optional decoration. Variant for structural layout changes. Hidden = `visible=false`, never deleted. |
| Dark mode Interactive/Primary | `Info Blue/600` (#0D62A3) — replaces the earlier Cyan/850. Hover step `Info Blue/800`. 5.1:1 with white text (AA). Do not revert. |
| Heading scale | Governed by **DDR-005** (supersedes DDR-004). Desktop XS=16/24, S=20/28, M=24/32, L=28/36, XL=36/44. Mobile XS=16/24, S=18/24, M=20/28, L=24/32, XL=28/36. All line-heights on the 4px grid; letter-spacing aligned to Figma (wide=0.3, caption=0.2). |
| Focus rings | **`Cyan/700` (DDR-006)** in both modes. OUTSIDE stroke, applied to the interactive element itself — not a wrapper frame that includes a label. The `focus-yellow` primitive is deprecated. |

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
| Border/Focus variable | VariableID:203:105 | Cyan/700 focus ring (DDR-006) |
| Link component set | 1633:320 | On the Buttons page (1318:14904), below the Button frame |
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
