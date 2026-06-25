# DDR-010 — Storybook 9 / Vite 7 upgrade to clear Dependabot advisories

**Date:** 2026-06-25
**Status:** Accepted
**Decided by:** Engineering lead
**Supersedes (in part):** the Storybook 8 / Vite 5 toolchain pinned in DDR-009

---

## Context

After the Storybook catalogue landed (DDR-009), Dependabot raised **8 alerts** (1 high,
7 moderate) against the dev toolchain. They resolve to **5 distinct advisories**, all in
**dev-only** tooling — none ship in the published packages (`@dhcw/sr-tokens`,
`@dhcw/sr-web`) or in the deployed static Storybook (which is plain HTML/JS with no server):

| Advisory | Severity | Package (was) | Notes |
|---|---|---|---|
| `server.fs.deny` bypass on Windows alt paths (GHSA-fx2h-pf6j-xcff) | High | vite 5.4.21 | dev server only |
| Path traversal in optimized deps `.map` (GHSA-4w7w-66w2-5vf9) | Moderate | vite 5.4.21 | dev server only |
| launch-editor NTLMv2 disclosure (GHSA-v6wh-96g9-6wx3) | Moderate | via vite | Windows, dev server |
| esbuild dev-server request leak (GHSA-67mh-4wv8-2f99) | Moderate | esbuild 0.21.5 (nested in vite) | dev server only |
| uuid missing buffer bounds check (GHSA-w5hq-g745-h8pq) | Moderate | uuid 9.0.1 (via `@storybook/addon-actions`) | — |

Two findings drove the decision:

1. The interim bump to **vite 5.4.21 did not clear the three vite advisories** — the vulnerable
   range is `≤ 6.4.2`, so **no patched 5.x or 6.x exists**. They only resolve on **vite 7+**.
2. **vite 7 requires Storybook 9** (Storybook 8.6 caps at Vite 5/6). `npm overrides` cannot fix
   the vite advisories because there is no safe lower version to pin to.

Real-world risk is **low** (all dev-server-time, some Windows-only), but the alerts are worth
clearing for hygiene and to keep the alert feed signal-rich.

---

## Decision

Upgrade the catalogue toolchain to **Storybook 9.1.x (HTML + Vite renderer) on Vite 7.x.**

### Changes

- `packages/storybook/package.json` devDependencies:
  - `storybook`, `@storybook/html-vite`, `@storybook/addon-a11y` → `^9.1.0`
  - `vite` → `^7.0.0`
  - **Removed `@storybook/addon-essentials`** — its features (controls, actions, viewport,
    backgrounds, toolbars, measure, outline) are folded into Storybook **core** as of v9.
- `.storybook/main.js`: dropped `@storybook/addon-essentials` from `addons` (now core).
- `.storybook/preview.js`: migrated the `backgrounds` parameter to the v9 API
  (`backgrounds.options` keyed map + `initialGlobals.backgrounds.value`).

### Result (verified locally)

- `npm audit` → **0 vulnerabilities**.
- `npm run build-storybook` succeeds on **Storybook 9.1.20 / Vite 7.3.6**; Button and
  Colours stories build, axe-core a11y addon bundles.
- The committed `package-lock.json` pins **vite 7.x and esbuild ≥ 0.25 everywhere** — including
  the transitive `@vitest/mocker` copy, which deduplicates to vite 7. This makes the fix
  deterministic via `npm ci`; **no `overrides` entry is needed.** If a future resolution
  reintroduces a vite < 7 copy, the lockfile pin or a scoped
  `overrides: { "@vitest/mocker": { "vite": "^7" } }` is the fallback.

---

## Consequences

- Storybook major upgrade (8 → 9). Config surface is small (two files) and was migrated; no
  story code changed. Future `.storybook` edits should follow Storybook 9 conventions.
- No change to any shipped/published package — this is confined to the dev/build toolchain,
  consistent with DDR-009.
- A `.github/dependabot.yml` is added so these surface as reviewable **version-update PRs**
  going forward, not just silent security alerts.

---

## Alternatives considered

- **`npm audit fix --force`.** Rejected: it jumps vite to 8.x *and* downgrades
  `@storybook/addon-essentials` to 7.0.6 (a major regression).
- **Stay on Storybook 8 + `npm overrides`.** Rejected: cannot satisfy the vite `≤ 6.4.2`
  advisories — there is no patched 5.x/6.x to pin to.
- **Jump straight to Storybook 10 / Vite 8.** Deferred: Storybook 9 + Vite 7 clears every
  advisory with one fewer major step; revisit 10 when convenient.
