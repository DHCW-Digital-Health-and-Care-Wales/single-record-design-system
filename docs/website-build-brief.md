# SR Design System Website — Build Brief (Concept B)

**Committed:** 2026-07-07 · **Status:** Active brief (build not yet started)
**Related:** DDR-014 (design-to-publish workflow) · website IA + translator DDRs *to be written when the build starts*

> Values corrected against the live token build (`packages/tokens/build/`) on
> 2026-07-07. The prototype HTML concept is intent only and is **not** committed
> (it hard-codes hex; the repo does not keep hardcoded-colour prototypes — see the
> 2026-06-12 cleanup). Its required corrections are recorded in
> *Prototype & corrections* below.

---

## What this is

Build the reference website for the DHCW Single Record Design System (NHS Wales).
It is the single source of truth for component reference, guidelines, code, and
adoption tooling. Two audiences: Figma designers and .NET/Blazor engineers.
Healthcare context — accuracy, accessibility, and consistency are non-negotiable.

Two prototype HTML concepts existed. **Concept B was chosen** (GDS/NHS-style
reference + separate tools route). Treat the prototype as intent, not final
markup — and it must be rebuilt on **live SR components and tokens**, not the
prototype's hardcoded styles.

## Who and what this serves (framing — read first)

- **Primary target: a new Single Record app.** This is where the system is fully
  expressed — full component adoption, all patterns, native token use.
- **Secondary: existing products** (EPR, patient administration) — supported
  *where possible, not compulsory*. Best-effort adoption, tokens-first.
- **Legacy (.NET Framework 4.8 / Delphi):** support at **token level where
  achievable, or ignore**. Not a compliance mandate. Graceful degradation, not
  full parity.

This ordering matters: legacy constraints must not drag down the new-app build.
The website documents the full system for the new app; the translator and
adoption guidance handle best-effort support for everything else. See
`docs/engineering/adopting-components.md` for the adoption tiers.

---

## Non-negotiable principles (from CLAUDE.md)

1. Everything must have a reason — no components/patterns without documented need
2. Accessibility is a hard requirement — WCAG 2.2 AA minimum, AAA where feasible
3. Consistency over novelty — align with GDS + NHS England before inventing
4. Design before building — components originate in Figma, then documented, then built
5. Decision records mandatory for non-trivial choices

---

## Standards

- WCAG 2.2 AA (mandatory), GDS Design System (primary pattern reference), NHS
  England Design System (clinical UI), CDPS Wales (Welsh language + public sector
  accessibility)

---

## Design tokens (source of truth)

- Three-tier: Primitives → Semantic (Single Record collection) → Component
- Format: `{tier}.{category}.{variant}` e.g. `color.interactive.primary`
- 4px base spacing unit
- All colour tokens must meet WCAG 2.2 contrast before use
- The site must consume the **published token artifact** the build emits
  (`packages/tokens/build/`) — **do not hard-code values** anywhere in the site
  chrome or component examples. Ask what token covers a value.

**Generated token API (public):** CSS colour = **`--sr-color-*`**, spacing =
**`--space-*`**; MAUI XAML keys = **`SrColor*`** / **`Space*`**. Dark mode is
driven by `[data-theme="dark"]` (with `prefers-color-scheme` as the default
signal) — not a separate stylesheet.

**Illustrative values only — the build is authoritative, do not inline these:**
`color.interactive.primary #325083` (blue-800; white text 7.1:1 AAA) ·
`color.interactive.primary-hover #1e3050` ·
`color.border.focus #12a3c9` (Cyan-700 focus ring, DDR-006) ·
`color.text.secondary #4c6272` · `color.surface.background #f4f5f8` ·
Roboto typeface · 6px radius.

> ⚠️ Earlier drafts of this brief and the prototype used stale values
> (`#185FA5` primary, `#00A9CE` focus). Those are wrong — use the build.

---

## Site information architecture (Concept B)

```
Masthead — brand + persistent Welsh-language toggle (Cymraeg / English, each in its own language, never a flag — CDPS requirement)
Primary nav — Get started · Foundations · Components · Patterns · Tools · Accessibility
Component reference page (per component):
   Examples — variant switcher + framework switcher + live preview + code view (copyable)
   When to use — do / don't
   Accessibility — WCAG criteria table
   Tokens used — inline panel listing the tokens the component consumes
Tools / token-translator — SEPARATE ROUTE
```

This IA maps onto the repo: **Foundations** ↔ `/foundations`, **Components** ↔
`/components/{name}/spec.md`, **Patterns** ↔ `/patterns`, **Accessibility** ↔
`/accessibility`, **Get started** ↔ `docs/` (incl. the adoption guide).

Layout notes: constrained reading measure (~760px) for guidance content; left
in-page nav; masthead + primary nav follow NHS/GDS convention.

---

## Framework + variant switchers

- **Framework switcher:** Web (HTML) / React / Blazor / MAUI. Switches the code
  view (and where relevant the rendered example). Blazor is primary for the new
  SR app. Web (HTML) is the lowest-common-denominator reference (semantic markup
  + token CSS) that any product — including legacy — can lean on.
- **.NET-only where feasible:** for legacy products, parity is expected mainly at
  **token level**, not full component parity. Where a framework tab has no
  meaningful equivalent, show the token/CSS layer or omit the tab — don't invent
  a legacy snippet that won't hold up.
- **Variant switcher:** driven by the component's Figma variants. For Button that
  is **Primary / Secondary / Destructive** (the red 4th type is `Destructive`,
  renamed from the old "Warning" on 2026-06-24 — do not label it "Warning").
- Code view: syntax-highlighted, dark surface, per-framework tabs, copy button.

---

## Token translator (Tools route)

**Architecture is decided (see the Token Translator Architecture DDR — to be
written with the build). Build Phase 1 only.**

### Phase 1 — deterministic, client-side, NO external calls, NO secrets, NO API keys

Nothing leaves the browser. This is an IG requirement — staff will paste product
code.

Inputs: file upload or paste. Formats: CSS, SCSS, XAML, Razor (auto-detect +
manual override). The translator is the main bridge for existing/legacy products:
its job is to get them to **token-level alignment** even when full component
adoption isn't feasible.

Processing (all client-side, all deterministic):
| Step | Method |
|---|---|
| Parse the input | Standard parsers |
| Exact value match | Lookup against the published token artifact |
| Nearest-colour match | Colour-distance maths (CIELAB / ΔE) |
| WCAG contrast validation | Contrast-ratio formula — flag any recommended token that fails 4.5:1 in the stated context |
| Spacing grid check | Arithmetic against the 4px base; show the two nearest tokens when off-grid |
| Typography match | Font size + weight lookup |

Output — a **review report**, three buckets: **Exact** · **Close / review**
(nearest match, WCAG warning, or off-grid — show options, don't auto-pick) ·
**No match** (not in palette; direct to the intake form → a GitHub issue on the
org repo, `component-request` / token request; see DDR-014).

Output actions: on-screen report + download (CSV/JSON) + copy. **The tool never
mutates the user's code.**

Mandatory UI contract (must be visible):
> The translator matches values, not intent. It won't decide whether a colour is
> "primary" or "warning" — that stays a design decision. It never changes your
> code. Always review flagged items before applying.

### Phase 2 — DO NOT BUILD YET

Semantic intent hints (LLM via Azure OpenAI) are a separate, later decision
pending IG sign-off. No external inference call in Phase 1.

---

## Accessibility requirements for the site itself

- WCAG 2.2 AA across the site (it documents an accessible system; it must be exemplary)
- Focus states: the SR focus pattern — `color.border.focus` (`#12a3c9`, Cyan-700)
  outer ring + inner gap, 2px strong border, 3:1 offset
- Full keyboard operability incl. switchers, code tabs, translator
- Welsh-language toggle in masthead, each language written in its own name, no flag
- Colour never the sole signal (do/don't cards, status buckets carry text + icon)
- Respect `prefers-color-scheme`; tokens carry light/dark via `[data-theme]` — do
  not build a separate dark stylesheet

---

## Hosting & publishing (DECIDED — DDR-014)

- Served from the **org repo's GitHub Pages** (inside DHCW infrastructure —
  published property does not leave the org).
- **Website at `/`**, built from the **latest release tag** (gated; refreshes
  only when a release is published — Gate 2, performed in the org repo).
- **Storybook at `/catalogue/`**, built from `main` (the preview surface;
  refreshes on cron + manual dispatch).
- Each surface builds from its own git ref; one Pages site. The website build
  should still be reasonably portable (static output), but GitHub Pages is the
  target — not host-agnostic-forever.

---

## Explicitly out of scope for this build

- Phase 2 semantic translator / any LLM call
- Authenticated/gated content
- Search backend (a client-side index is fine if included; hosted search is a later decision)

---

## Open dependencies (flag if they block you)

1. Which components have complete `spec.md` + Figma variants ready to document
   first — **start with Button** (per the prototype and DDR history)
2. The two website DDRs (Website IA & Translator Placement; Token Translator
   Architecture) should be written as the build starts

---

## Prototype & corrections (Concept B)

The chosen prototype is intent only. When rebuilding on live components/tokens,
apply these corrections:

| In the prototype | Correct to |
|---|---|
| `--primary: #185FA5` (and all hardcoded hex) | Bind `var(--sr-color-*)` — primary is `#325083`, never inline |
| `--focus-ring: #00A9CE` | `var(--sr-color-border-focus)` = `#12a3c9` (Cyan-700, DDR-006) |
| Button variant labelled **"Warning"** | **"Destructive"** |
| `color.text.secondary #5A6472` | `#4c6272` |
| Intake form → "Azure DevOps" | GitHub issue on the org repo (DDR-014) |
