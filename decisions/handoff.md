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

## Checkpoint — 2026-07-09

Branch `claude/single-record-ds-guidelines-v003fa`. Guidelines programme kicked off.

- **Reusable guidelines format defined** — `docs/templates/guidelines-template.md`.
  One `*.guidelines.md` per DS topic (Foundation/Component/Pattern) is the **single
  source** for both the Figma "Guidelines / Usage notes" panel (format seeded from
  node `3446:8762`) and the topic's DS-website page. Shape mirrors NHS England / GDS
  (When to use · When not to use · How it works · Do & don't · Accessibility ·
  Content · Frameworks · Clinical/DHCW notes). Framework coverage now spells out
  **Web (HTML/CSS) + React** alongside Blazor/MAUI (new SR app is likely React).
- **Typography guideline authored** (first exemplar) — `foundations/tokens/
  typography.guidelines.md`. Grounded in DDR-005 tokens; NHS/GDS structure; folds in
  carried-forward clinical requirements (zoomable relative sizing, Body M 16px min,
  sentence case) with source anchors. `typography.md` stays the token reference.
- **Design-language shift: primary-content minimum is now Body S (14px), not 16px.**
  Directed by the design lead for this table/data-heavy clinical system. Stays WCAG 2.2
  AA (no min font-size SC; resize/reflow/contrast all met). Body M (16px) preferred for
  long-form/clinical notes. Applied to `typography.guidelines.md` and the token
  reference `typography.md` (accessibility notes + Body M/S rows). **Consider a DDR** to
  formalise the divergence. Also: guideline copy switched to **bulleted** critical
  points and **em dashes removed**.
- **Guidelines panel built IN FIGMA** on the Typography page (`12:3378`). Cloned the
  former "Guidelines/Usage notes" panel format (`3446:8762`) → new
  **`Guidelines/Typography` (`3460:20`)** at x=0, y=850 (below the original, which is
  left intact as the template). Repopulated with 8 sections (When to use · Type scale ·
  Typeface & weight · Minimum size · Responsive · Hierarchy · Accessibility · Content).
  All fills variable-bound (navy header `203:92`, title Interactive/Primary `203:90`,
  body Text/Default `92:1488`, divider Grey/200 `203:103`) so dark-mode/token switches
  flow through. **Pattern to reuse for every other guidelines page.**
- **DHCW UI Standards Guide v1.3 extracted** to `docs/reference/dhcw-ui-standards-v1.3.md`
  (faithful, page-anchored `[p.N]`). Legacy WCP/eForms content standards — clinical/
  content/interaction rules are authoritative *input*; hex colours / rem sizes / the
  Appendix CSS are **superseded by tokens**. **UI-standards review project opened** at
  `docs/ui-standards-review/` (README + `standards-inventory.md` triage worksheet, 57
  standards catalogued with disposition codes).
- **Grey primitive expanded to a full 50–900 ramp — SIGNED OFF & APPLIED.** Additive
  (900/600/200/100 unchanged, no rebinding); added 800/700/500/400/300/50 anchored to
  the NHS neutral greys, incl. **Grey/500 `#768692`** for placeholder/muted use.
  Applied to `foundations/tokens/primitives/color.json`, rebuilt token outputs, updated
  the palette-frame plugin, and created the six new variables in the **Figma Primitives
  collection** (`VariableCollectionId:203:2`, single Default mode, `ALL_SCOPES` to match
  siblings). Placeholder **semantic** token deferred (user will set later) — for
  accessible placeholder *text* use Grey/600 (4.5:1); Grey/500 is for muted fills/
  borders/disabled (3.75:1, non-text).

---

## Checkpoint — 2026-07-09 (later)

- **Placeholder decision finalised.** No separate placeholder semantic token.
  Placeholder text defers to **`Text/Secondary` (Grey/600, 4.5:1+ AA)**; distinguish an
  entered value (`Text/Default` Grey/900) from a placeholder by lightness. `Grey/500`
  (#768692) is disabled/muted/non-text only. **Deleted the `Text/Placeholder` Figma
  variable** (`3417:22607`) — verified unused on Input/Select pages first. To be written
  up fully in the Input and Select guidelines.
- **Colour guideline authored** — `foundations/tokens/colour/colour.guidelines.md`
  (single source) and the **`Guidelines/Colours` Figma panel (`3468:9073`)** repopulated
  (8 bulleted sections incl. the placeholder decision). Same clone-and-repopulate pattern.
- **Typography Figma frame (`89:3074`) synced to the 14px direction** — Body M usage →
  "Long-form reading, prose, clinical notes"; Body S usage → "Primary content in tables
  and data-dense views; supporting text; form values".
- **Colour-tokens frame (`125:5188`) — grey grid NOT yet extended.** Its primitives grey
  group is a hand-built absolute-positioned row of the 4 in-use greys (raw fills, not
  variables). Extending to the full 10-stop ramp is a two-row grid rebuild; deferred (not
  in the Figma→website pipeline path). Token JSON + Figma variables already carry the full
  ramp.
- **DS website Phase A shipped — Figma→website pipeline proven.** New `packages/website`
  (`@dhcw/sr-website`, **zero runtime deps** — self-contained md renderer in `build.mjs`).
  Generates Overview + Typography + Colour pages from the **built token artifact**
  (`packages/tokens/build`) and the single-source guideline docs. Colour page renders the
  full grey ramp (all 10 stops incl. the new ones) + semantic swatches straight from
  `tokens-flat.json`; Typography page renders the live `.sr-type-*` scale. Site chrome is
  token-bound (no hardcoded palette), dark-mode toggle wired. Root scripts: `build:site`;
  workspace added. CI: `.github/workflows/deploy-website.yml` — build+artifact on every
  push/PR (runs everywhere), Pages deploy is manual + org-guarded so it won't clobber the
  Storybook preview at root (DDR-014). Verified end to end via headless Chromium.
- **DDR-015** (primary-content min = Body S 14px) and **DDR-016** (website IA + single
  Pages publisher) written and Accepted.
- **Publishing consolidated (DDR-016).** One Pages site: **website at `/`, Storybook at
  `/storybook`**. `npm run build:pages` builds tokens → website → Storybook and assembles
  `site-dist/` via `scripts/assemble-pages.mjs`. Storybook `.storybook/main.js` now sets
  Vite `base:'./'` for subpath serving; website has a **Catalogue** nav link → `/storybook`.
  Replaced `deploy-storybook.yml` + `deploy-website.yml` with **`deploy-pages.yml`** (build
  everywhere + artifact; deploy org-guarded, never on PRs; 30-min preview cron). Verified
  end to end over HTTP — Storybook renders correctly at the subpath.
- **Colour-tokens Figma grey grid rebuilt** (`125:5188`, Neutral section `125:5524`). The
  primitives grey row is now the full 10-stop ramp in a wrapping auto-layout (2 rows), each
  cell with role label + stop + hex, legible on-swatch text (white on 900–500, dark on
  400–50). Section set to hug; the two fixed ancestor frames grown +142px so nothing clips.
- **Website grown toward Concept B.** `packages/website/build.mjs` now emits: Overview, 3
  **foundations** (Typography, Colour, **Spacing** — new `spacing.guidelines.md` + live
  `--space-*` scale & radius), a **Button component page** with **variant + size + framework
  switchers** (Web/React/Blazor/MAUI) driving a live `button.css` preview and copyable code,
  and a **token translator** (Tools) — client-side, no external calls: pastes CSS, matches
  `#hex` by CIELAB ΔE and `px` against the 4px grid into Exact / Close / No-match buckets
  (verified: `#325083`→blue-800 ΔE0, `#ff4400`→no-match ΔE21.7). Site CSS moved to
  `packages/website/site.css`. All token-bound, dark-mode toggle. Verified via headless Chromium.
- **Still open:** gated release publish (build from release tag, DDR-014); more components;
  Welsh-language toggle; translator file-upload + CSV/JSON export; DDR for Website IA is DDR-016.
- **Open decision — date display format (to formalise).** Design lead's approach: show dates
  as **day + 3-letter abbreviated month + 4-digit year, space-separated — e.g. `10 Jan 2020`**
  — to save table/column space. This **diverges from the legacy DHCW standard** `dd-Mmm-yyyy`
  with leading zero and hyphens (e.g. `06-Dec-2021`, UI Standards [p.24](../docs/reference/dhcw-ui-standards-v1.3.md#page-24)).
  Open sub-details to confirm: leading zero on single-digit days (`1 Jan` vs `01 Jan`), and
  date-time pairing. To land in a **content/dates guideline** (and the Tables guideline) and be
  reconciled in the UI-standards review. Flagged, not yet built — user will return to it.

---

## Checkpoint — 2026-07-07

Way-of-working formalised this session (branch `claude/design-system-workflow-j4xir6`):

- **DDR-014 — Design-to-Publish Workflow.** Records the full pipeline: two export
  lanes (non-code → `main` via auto-checked PR; code → `feature/{component}` →
  PR → `main`); **read-only fast-forward mirror**, single writer on org `main`;
  **design owns the entire DS repo** (incl. `/products`), **devs own their own
  product repos** and consume + file GitHub issues; **preview** (Storybook + VS
  gallery, from `main`, cron + manual) vs **published** (DS website, from the
  release tag, gated); releases performed in the **org** repo (Gate 2). Evolution
  path noted: mirror-to-branch + CODEOWNERS when a second writer appears.
- **Preview CI wired.** `deploy-storybook.yml` gains `schedule` (every 30 min,
  tunable) + `workflow_dispatch`, and both jobs are guarded to the org repo
  (`if: github.repository == …`) so the personal repo never red-Xes on a
  scheduled run. Storybook stays at Pages root until the website ships, then
  moves to `/catalogue/` (website takes root).
- **Workflow diagram** added to the FigJam DESIGN-SYSTEM-BOARD for sharing.

### Open follow-ups from this session
- **DS website build** (Concept B) — not started. Needs its own DDRs (Website IA &
  Translator Placement; Token Translator Architecture) + the `release`-triggered
  publish workflow (deferred until the site build exists — no placeholder CI).
- ✅ **Website build brief** committed at `docs/website-build-brief.md` with the
  stale hexes corrected (`interactive.primary #325083`, `border.focus #12a3c9`,
  `text.secondary #4c6272`), Button `Warning`→`Destructive`, hosting decided per
  DDR-014, and a *Prototype & corrections* table. The concept HTML is **not**
  committed (hardcoded hex; corrections captured in the brief instead).
- ✅ **Adoption guide** landed at `docs/engineering/adopting-components.md`
  (linked from `for-engineers.md`). Feedback channel decided: **GitHub issues on
  the org repo** (matches DDR-014). Token examples corrected to the real build API
  (`--sr-color-*`, `--space-*`, `text-inverse`; MAUI `SrColor*` / `Space*`).
- ✅ **Blazor Button is now a buildable Razor Class Library.** Added
  `packages/blazor/DHCW.SingleRecord.Components.csproj` (net8.0, RCL),
  `_Imports.razor`, a shared `src/Gallery.razor` (Button variant matrix), and
  `wwwroot/css/` (copied `tokens.css`/`tokens-dark.css`/`button.css`, served at
  `_content/DHCW.SingleRecord.Components/css/…`). ⚠️ **No .NET SDK in the web
  session** — the library is authored but **not compile-verified**; if VS shows a
  build error, report it for a fix.
- ✅ **VS Blazor+MAUI preview guide** at `docs/engineering/visual-studio-preview.md`
  — answers "clone vs new project" (clone the repo), then create a Blazor Web host
  + a MAUI Blazor Hybrid host via VS templates, reference the RCL, render
  `<Gallery />`, F5. MAUI preview = the Blazor component rendered natively via
  Blazor Hybrid (no separate native-XAML Button by design, DDR-011).
- Still open: `packages/web` `main` points at a **missing `src/index.css`** (no
  aggregated CSS bundle); host apps + `preview/*.sln` are created by the user in VS.
- **Figma guidelines ↔ website guidelines** sync — to design.

---

## Checkpoint — 2026-07-03

Landed this session (branch `claude/table-icon-colors-9j96s1`, merged to main):

- **Table** (`packages/web/src/table/`, Figma 1363:22598): Info Blue/50 header, Body S cells, Border/Subtle dividers. `layout` toggle — `plain` / `kebab-left` (nav/menu2) / `icons-left` / `row-headers`. Row action / menu icons render Interactive/Primary (blue), delete red. Spec `/components/table/spec.md`.
- **Tag** (`packages/web/src/tags/` + `packages/react/src/tags/`, Figma 399:7984): Blue/Green/Red/Yellow/Grey/Outline × Default/Small, with a **closable** filter-tag variant (`.sr-tag--closable` + `.sr-tag__close`, `nav/close`). Spec `/components/tags/spec.md`.
- **Select** (`packages/web/src/select/` + React, Figma 1517:14471): custom listbox — button trigger (`aria-haspopup`), `role="listbox"`/`option`, full keyboard, 3px Cyan/700 focus ring, error/disabled, nested-menu chevron. Spec `/components/select/spec.md`.
- **Autocomplete** (`packages/web/src/autocomplete/` + React): searchable select **composed** from Input search field + Select listbox (no new tokens). Combobox ARIA, live filter, match-bolding, clear button. **A dedicated Figma component is still TBD** — this reference is the interim contract. Spec `/components/autocomplete/spec.md`.
- **Segmented control** (`packages/web/src/segmented-control/`) restyled to the Figma segment building block (2752:40): 8px-radius track, hover = Info Blue/50 wash + brand-blue text, disabled-selected = muted outline, Cyan/700 focus ring. Distinct from the Toggle Switch. React consumes the same shared CSS.
- **Status contrast fix (AA).** `Status/Critical` Red/600 → **Red/700 (#B32014)**, `Status/Success` Green/600 → **Green/700 (#006630)** in both light and dark semantic tokens. `Interactive/Destructive` unchanged (Red/600 — separate role). Token outputs rebuilt.
- **Icons:** `nav/dashboard` now used for the Dashboard nav item (was `data/table`), in web + React storybooks. New **`action/hold`** icon added. ⚠️ The Figma asset host is blocked by egress policy, so `action/hold` uses the Lucide `pause` glyph (two bars) as a faithful stand-in — **confirm it matches the Figma artwork.**

### Fixes (follow-up, after PR #49)
- **Tag refactored into two variants** matching the new Figma split: `status` (filled — Blue/Green/Red/Yellow/Grey/Outline, no close, `399:7984`) and `filter` (outline only + close — Blue/Green/Red/Yellow/**Black**, `3229:71674`). Class contract: `.sr-tag--status|--filter` + type + size. Web + React stories rebuilt (old Closable/Matrix previews removed).
- **Select hover** now distinct from active/selected: hover = Info Blue/50 wash (secondary text); keyboard-active + selected = Interactive/Primary fill (white). Matches option-items `1517:14856`.
- **React icon fixes:** Select error icon (was 24px black → 16px red), nested-option chevron on active blue (was black → white), trigger chevron, and Autocomplete search/clear icons — all now pass `size` + `color="inherit"` to `<Icon>` so the wrapper's size/colour win.

### Open follow-ups for next session
- Confirm the `action/hold` glyph vs Figma (egress-blocked).
- Autocomplete needs a dedicated Figma design to ratify the interim reference.
- **Table toolbar/filter + pagination pattern** — the natural home for the filter tags + segmented control + autocomplete. Not started (wants a Figma design first).

---

## Checkpoint — 2026-06-26

- **Desktop/mobile form-factor model decided (DDR-011).** Two orthogonal axes: **platform** = `packages/*` (incl. MAUI); **form factor** = responsive tokens/variants *inside* each platform — **no separate desktop/mobile trees**. Per-component class: **Responsive** (most; tokens only), **Adaptive** (a `Breakpoint=Desktop/Mobile` variant), **Distinct** (separate components, e.g. header/footer/nav). Web adapts responsively in one codebase; MAUI uses `OnIdiom`.
- **Typography token build fixed.** Composites were emitting `--sr-typography-*: [object Object];`. `@dhcw/sr-tokens` now generates `build/css/typography.css` — mobile-first `.sr-type-*` utility classes, desktop override at ≥1024px — and filters the composites out of the CSS/SCSS/XAML var dumps. No `[object Object]` left in the build.
- **Storybook previews all breakpoints.** `.storybook/preview.js` adds SR viewports (Mobile/Tablet/Desktop/Large/X-Large) from `breakpoints.json` and imports `typography.css`; new **Foundations → Typography** story shows the responsive scale. Build verified.
- **Dark mode is the third token-driven axis (DDR-011) and now previews for real.** Structure was already complete (`color.dark.json` → `tokens-dark.css`/scss/XAML, `[data-theme="dark"]`, Figma Dark mode). Preview was faked (a dark *background* swatch that never activated dark tokens) — replaced with a **Theme** toolbar toggle that imports `tokens-dark.css`, sets `data-theme`, and paints the canvas from tokens. axe-core now runs in both themes; theme × form factor are both togglable.
- **Spec template updated:** new **Responsive behaviour** section (form-factor class + per-breakpoint table); fixed the stale "amber focus ring" line to `Border/Focus` Cyan/700 (DDR-006).

---

## Checkpoint — 2026-06-25

- **Storybook toolchain security upgrade (DDR-010).** Dependabot raised 8 alerts (1 high, 7 moderate) — all dev-only (Vite/esbuild/uuid via Storybook), none in published packages or the deployed static site. Cleared by upgrading `packages/storybook` to **Storybook 9.1.x on Vite 7.x** (`storybook`, `@storybook/html-vite`, `@storybook/addon-a11y` → `^9.1.0`; `vite` → `^7`). `@storybook/addon-essentials` removed (folded into Storybook 9 core); `.storybook/main.js` and `preview.js` migrated (v9 `backgrounds.options` + `initialGlobals`). Verified: `npm audit` = **0 vulnerabilities**, `npm run build-storybook` builds on SB 9.1.20 / Vite 7.3.6. Lockfile pins vite 7.x + esbuild ≥ 0.25 everywhere (incl. the `@vitest/mocker` copy, deduped) — deterministic via `npm ci`, no `overrides` needed.
- **`.github/dependabot.yml` added.** Weekly npm + github-actions version-update PRs, grouped (Storybook/Vite toolchain group + batched dev minor/patch) to keep the feed signal-rich.

---

## Checkpoint — 2026-06-24

This session's accepted changes (code + docs; no Figma changes):

- **Storybook live on GitHub Pages.** Pages enabled on the DHCW org repo (Source = GitHub Actions); Storybook publishes to `https://dhcw-digital-health-and-care-wales.github.io/single-record-design-system/`. Deploy workflow (`.github/workflows/deploy-storybook.yml`) cleaned up: removed the temporary feature-branch trigger (now `main` + manual `workflow_dispatch` only); bumped `actions/checkout`/`actions/setup-node` to v5 and Node to 22 to clear Node 20 deprecation warnings. **Gotcha for next session:** mirror pushes via deploy key do NOT auto-trigger workflows on the org repo — use "Run workflow" manually after each merge to main. Personal repo has no Pages (free plan) — disable the workflow there to avoid red-X noise.
- **React Button shipped** (`packages/react/src/button/Button.jsx`): `forwardRef` wrapper around the shared `@dhcw/sr-web` `button.css`, full prop API (type/size/disabled/leadingIcon/trailingIcon). Story renders in the HTML Storybook via `createRoot` → appears as **React/Button** alongside **Components/Button**. `react`/`react-dom` added as Storybook devDeps; React glob enabled in `.storybook/main.js`. `@dhcw/sr-react` added to root workspaces.
- **Blazor Button shipped** (`packages/blazor/src/Button/SrButton.razor` + `ButtonType.cs`/`ButtonSize.cs`): Razor component, icon `RenderFragment` slots, `EventCallback<MouseEventArgs>`, consumes the same `sr-button` CSS. **Cannot render in Storybook** (needs .NET runtime) — live preview will come from the planned Blazor WASM gallery (see Open Work Items).
- **Token drift fixed.** `foundations/tokens/border.json` had `color.border.focus` still aliasing the deprecated `focus-yellow`; corrected to `{color.cyan.700}` per DDR-006. Rebuilt all token outputs; updated `border.md`. Verified all other Button-relevant tokens match the Figma variables (`1346:500`).
- **Tokens `build/` now tracked.** Removed `build/` from `packages/tokens/.gitignore` so the generated CSS/SCSS/XAML/JSON are visible in editors and version-controlled (source of truth remains `/foundations/tokens/`; re-run `npm run build:tokens` and commit after token changes). Fixed a doubled-prefix bug in the tokens README examples (`--sr-color-*`, not `--sr-sr-color-*`).

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
| Grey/800 | VariableID:3455:20 | #2C3A44 — added 2026-07-09 |
| Grey/700 | VariableID:3455:21 | #3B4E5B |
| Grey/500 | VariableID:3455:22 | #768692 — placeholder/muted |
| Grey/400 | VariableID:3455:23 | #AEB7BD |
| Grey/300 | VariableID:3455:24 | #C6CDD1 |
| Grey/50 | VariableID:3455:25 | #F7FAFA |

---

## How to Update This File

At the end of a session, update:
1. **Current Design System State** — mark anything newly completed
2. **Open Work Items** — move done items out, add new ones
3. **Key Semantic Decisions** — add any new decisions made
4. **Figma File Reference** — add new node IDs for components created

Keep entries brief. This is a handoff doc, not a changelog — the backlog and DDRs hold the full history.
