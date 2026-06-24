# DDR-009 — Storybook as the component catalogue

**Date:** 2026-06-23
**Status:** Accepted
**Decided by:** Design lead / Engineering lead

---

## Context

The `/packages/` monorepo (DDR-007) holds the coded design-system packages: tokens, icons, web (canonical HTML/CSS), react, blazor, maui. As coded components start to land (beginning with Button), the team needs a way to **see, browse, and pick** components without reading source or wiring up a throwaway test page — for developers, designers, reviewers, and clinical stakeholders alike.

Storybook is the de-facto standard for this and was requested by management. We needed to decide how it fits the monorepo without disturbing the token pipeline or the per-framework packages.

---

## Decision

Adopt **Storybook 8 (HTML + Vite renderer)** as the component catalogue, added as a dedicated dev-only workspace package.

### Structure

- New package **`packages/storybook`** (`@dhcw/sr-storybook`, `private`, never published). Holds only the Storybook config (`.storybook/main.js`, `preview.js`).
- A **root `package.json`** introduces npm **workspaces** across `tokens`, `icons`, `web`, `react`, `storybook`.
- **Stories live next to the components they document** (e.g. `packages/web/src/button/button.stories.js`), not inside the storybook package. `main.js` globs the sibling packages.
- `preview.js` imports the generated `@dhcw/sr-tokens` CSS so every story renders with real tokens (no hard-coded values).
- The first reference component, **Button** (`packages/web/src/button/`), and a **Foundations → Colour** token-showcase story ship with this change.

### Renderer

Start with the **HTML/Vite** renderer against `@dhcw/sr-web` (the canonical reference implementation). The React renderer glob is stubbed (commented) in `main.js` and enabled once `@dhcw/sr-react` has components. Blazor and MAUI are out of Storybook's scope — they consume tokens/markup and are documented separately.

### Accessibility

`@storybook/addon-a11y` (axe-core) runs on every story, surfacing WCAG issues in the Accessibility panel — consistent with the project's WCAG 2.2 AA hard requirement.

### Distribution

- **Developers** run `npm run storybook` locally and view at `http://localhost:6006`.
- **Everyone else** views the **published static build** at a URL. A `deploy-storybook` GitHub Action builds tokens + Storybook and publishes to **GitHub Pages** on every push to `main`, so the catalogue always matches `main`.

---

## Storybook MCP

The Storybook MCP server (which lets AI tools read the catalogue programmatically) is **deferred**. It is additive and not required to get value from Storybook; revisit once the catalogue has meaningful coverage.

---

## Consequences

- Introduces a Node/npm dev-dependency surface (Storybook, Vite) — confined to the dev/build toolchain; no runtime dependency is added to any shipped package.
- Root `.gitignore` ignores `package.json`/`package-lock.json`; workspace manifests are force-added (`git add -f`) as with `@dhcw/sr-tokens`. **Follow-up:** narrow the `.gitignore` rules so package manifests are tracked normally.
- Requires one-time repo setup: Settings → Pages → Source = "GitHub Actions".

---

## Alternatives considered

**No catalogue / hand-rolled demo pages.** Rejected: drifts from source, no a11y tooling, poor discoverability.

**Storybook as a root-level config (not a package).** Rejected: a workspace package keeps its heavy devDependencies isolated and consistent with the monorepo model.

**Histoire / other catalogues.** Rejected: Storybook has the broadest ecosystem (a11y, visual regression via Chromatic) and was the named request.
