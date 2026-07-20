# DDR-016 — DS website IA and publishing (single Pages site: website at root, Storybook at /storybook)

**Date:** 2026-07-10
**Status:** Accepted
**Decided by:** Design lead
**Supersedes:** Refines DDR-014 (the `/catalogue/` subpath is now `/storybook`)

---

## Context

DDR-014 set the design-to-publish workflow and said the DS website would take Pages root
while Storybook moved to a subpath (`/catalogue/`). The website did not exist yet, so
Storybook temporarily owned Pages root via `deploy-storybook.yml`.

Phase A of the website now exists (`packages/website`, DDR-014's Concept B, first two
foundations). GitHub Pages serves **one artifact per site**, so two independent deploy
workflows (website + Storybook) would clobber each other. We need one publish path that
serves both, and a confirmed subpath for Storybook.

---

## Decision

**One GitHub Pages site, assembled from both builds and deployed once:**

```
/                     → the DS website (packages/website)
/storybook/           → the Storybook catalogue (packages/storybook)
/assets/…             → website token CSS + site CSS
```

- Storybook lives at **`/storybook`** (not `/catalogue/` — simpler, matches the "Catalogue"
  nav link on the site).
- A single script assembles the deploy directory: `npm run build:pages` →
  `scripts/assemble-pages.mjs` copies the website build to `site-dist/` and the Storybook
  build to `site-dist/storybook/`.
- A single workflow (`.github/workflows/deploy-pages.yml`) builds tokens → website →
  Storybook, assembles, and deploys. It replaces `deploy-storybook.yml` and the Phase A
  `deploy-website.yml`.
- **Portability:** the website uses relative asset paths and Storybook is built with a
  relative Vite `base` (`./`), so the site works under any Pages base path
  (e.g. `https://<org>.github.io/single-record-design-system/`) with no hardcoded base.
- **Guarding:** the build job runs everywhere (PRs included) and uploads a downloadable
  artifact, so the pipeline is exercised even on the personal repo. The **deploy** job is
  guarded to the org repo (which has Pages) and runs on push to `main`, on a schedule
  (preview refresh), and on manual dispatch — never on pull requests.

### IA — revised to a two-level structure (2026-07-20)

The flat single-level nav is replaced by a **two-level IA** modelled on the NHS
England / GDS design-system sites, per the reference designs supplied by the design lead:

```
Masthead — NHS Wales logo · Report an issue (MS Forms) · Cymraeg toggle · dark-mode toggle
Top nav  — Get Started · Styles · Components · Patterns · Pages · Figma · Contributions
Sidebar  — per-section pages (Styles: Typography, Colours, Spacing & Elevation, Icons,
           Grids, Token Translator; Components: Buttons, Tables, …)
Page     — breadcrumb + guideline (single-source *.guidelines.md) + live token/component showcase
```

Decisions folded in:

- **Storybook leaves the primary nav** but stays reachable at `/storybook` — linked from the
  Figma and Icons pages and the Get Started catalogue card. The assemble step and subpath are
  unchanged (below).
- **Token Translator** moves under **Styles** (it is a styles tool, not a top-level section).
- **Welsh toggle** ships in the header as a **stub** (flips label + `lang` attribute, English
  fallback). Genuine Welsh content parity (CDPS) is tracked as separate work; the toggle can be
  removed if parity is not pursued.
- **Two intake channels, kept distinct:** *Report an issue* → Microsoft Forms (bugs/issues);
  *Request a component or change* → Azure DevOps intake. Both URLs are placeholders in
  `build.mjs` (`REPORT_ISSUE_URL`, `CONTRIBUTION_URL`) until supplied.
- **Framework tabs** use one order and style everywhere: **HTML · React · Blazor · MAUI**.
- **Accessibility table** has a locked column structure — *Requirement · WCAG SC · How Single
  Record meets it · Test method* — reused per component, SR-specific content per row.
- **Playground vs flat:** components with 3+ variant axes (e.g. Button: variant × size ×
  framework) get a live playground; simpler components render flat/static (e.g. Table).
- Pages **must consume the real tokens and reference component CSS** (`packages/web/src/*`),
  not a visual mock. Sections without authored content (Icons, Grids, Patterns, Pages) render an
  explicit *planned* status page with upstream links — never an empty placeholder.

Per DDR-014 the **published** website is gated (built from a release tag) once the full
build lands; the working site publishes from `main` as the preview, same as Storybook did.

---

## Options Considered

### Option A — Two separate Pages deploys (website + Storybook)
- **Cons:** Impossible on one Pages site — they clobber each other. Rejected.

### Option B — One assembled artifact, website root + Storybook subpath (chosen)
- **Pros:** One deploy, no clobber; matches DDR-014 intent; Storybook stays live; portable base.
- **Cons:** Slightly more build orchestration (assemble step); Storybook must build with a relative base.

### Option C — Separate Pages sites on separate repos
- **Cons:** Fragments the system across URLs; more infra; rejected for now.

---

## Rationale

A single assembled artifact is the only way to serve both from one Pages site, and it
matches the end-state DDR-014 already described. `/storybook` is chosen over `/catalogue/`
because it is self-describing and pairs with the site's "Catalogue" link. Relative bases
keep the whole thing host- and path-agnostic, so the same build works locally, on the org
Pages base path, and anywhere else.

---

## Consequences

- `deploy-storybook.yml` and `deploy-website.yml` are removed; `deploy-pages.yml` is the
  single publisher. The preview schedule moves onto it.
- Storybook `.storybook/main.js` sets Vite `base: './'` for subpath serving. If any manager
  asset 404s under the subpath, fall back to an absolute base of the repo Pages path.
- One-time org setup unchanged: Settings → Pages → Source = "GitHub Actions". Mirror-key
  pushes still do not trigger workflows on the org repo — use the schedule or manual
  dispatch after a mirror (as before).
- When the gated release publish lands (DDR-014), the same assemble step feeds it; only the
  trigger (release tag) and the guard change.

---

## References

- DDR-014 — design-to-publish workflow (this refines the subpath + unifies the deploy)
- DDR-009 — Storybook catalogue
- `docs/website-build-brief.md` — Concept B brief
- `packages/website/build.mjs`, `scripts/assemble-pages.mjs`, `.github/workflows/deploy-pages.yml`
</content>
