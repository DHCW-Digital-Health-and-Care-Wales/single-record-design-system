# DDR-011 — Desktop vs mobile: the form-factor model

**Date:** 2026-06-26
**Status:** Accepted
**Decided by:** Design lead / Engineering lead
**Related:** DDR-005 (typography scale, desktop+mobile), DDR-007 (packages monorepo), DDR-009 (Storybook)

---

## Context

The Single Record programme ships **web apps** (HTML/CSS reference, React, Blazor) and
**native desktop + mobile apps** (.NET MAUI). We need a clear, consistent way to handle
form factor (mobile / tablet / desktop) before building more components. Some components are
genuinely **distinct** between mobile and desktop (header, footer, navigation); for most, it is
only **typography and sizing** that adapt.

The risk is modelling "mobile" as a parallel library to "desktop" — which would fork the system,
double maintenance, and drift.

---

## Decision

Treat the design system along **two orthogonal axes**, and do **not** create separate
desktop/mobile package or directory trees.

### Axis 1 — Platform (how code ships) — already `packages/*`

`web` (canonical HTML/CSS) · `react` · `blazor` · `maui` · `tokens` · `icons`. Unchanged by this DDR.

### Axis 3 — Theme (light / dark) — token-driven, inside each platform

Light/dark is **not** a separate library either. It is handled entirely by tokens: the dark
semantic palette (`semantic/color.dark.json`) builds to `tokens-dark.css` / `_tokens-dark.scss` /
`Tokens.Dark.xaml`, scoped to `[data-theme="dark"]` (web) and the Dark mode of the MAUI/Figma
variable collection. Components reference semantic colour tokens only, so they flip automatically
when `data-theme="dark"` is set — no per-theme component code. Same principle as form factor:
one component, token-driven adaptation, no fork.

### Axis 2 — Form factor (how the UI adapts) — lives *inside* each platform

- **Web stack (HTML / React / Blazor):** desktop and mobile are handled **responsively in one
  codebase** via breakpoints (`foundations/tokens/breakpoints.json`). "Mobile web" = responsive
  web, never a separate package.
- **MAUI:** is itself the native desktop+mobile app (already its own package). Device differences
  use MAUI idiom (`OnIdiom`, device-specific XAML) — not a separate package.

### Per-component classification (apply to every component)

| Class | Meaning | How it's built |
|---|---|---|
| **Responsive** (most) | Same component; only tokens/sizes change across breakpoints | One component, one spec. Use breakpoint tokens + `.sr-type-*` utilities. e.g. Button, Input, Card, Tag |
| **Adaptive** (some) | Same purpose; layout rearranges at a breakpoint | One component with a `Breakpoint=Desktop/Mobile` variant |
| **Distinct** (few) | Genuinely different UI for the same job | Separate component folders that share tokens/sub-parts; cross-link them. e.g. desktop header vs mobile app bar + bottom nav |

Every component spec carries a **Responsive behaviour** section recording its class and
per-breakpoint behaviour (added to `docs/templates/component-spec-template.md`).

### Breakpoints (from `breakpoints.json`)

Mobile ≤767 · Tablet 768–1023 · Desktop ≥1024 · Large ≥1280 · X-Large ≥1440. Typography is
**mobile-first**: the mobile scale is the base; the desktop scale applies at **≥1024px** (so tablet
uses the mobile scale, matching DDR-005's "desktop typography ≥1024px").

---

## Enabling changes shipped with this DDR

1. **Responsive typography now renders.** The token build emitted the `typography` composite as
   `--sr-typography-*: [object Object];` (unusable). `@dhcw/sr-tokens` now generates
   **`build/css/typography.css`** — mobile-first `.sr-type-*` utility classes with a desktop
   override at the 1024px breakpoint — and excludes the composites from the CSS/SCSS/XAML variable
   dumps. (XAML/flat-JSON keep the structured values for native consumption.)
2. **Storybook previews every form factor.** `.storybook/preview.js` defines SR viewports from the
   breakpoint tokens (Mobile/Tablet/Desktop/Large/X-Large) and imports `typography.css`, so any
   story can be viewed at each breakpoint and the type scale visibly changes at ≥1024px. A
   **Foundations → Typography** story demonstrates the scale.
3. **Storybook previews real dark mode.** The old "Dark" entry was only a background swatch and
   never activated dark tokens. Replaced with a **Theme** toolbar toggle (Light/Dark) that imports
   `tokens-dark.css`, sets `data-theme` on the document root, and paints the canvas from the surface/
   text tokens so it tracks the theme. axe-core now runs contrast checks against the active theme,
   and theme × form factor are both previewable toggles.

---

## Consequences

- No new package/directory trees; form factor is a property of components and tokens, not a fork.
- Distinct components (header/footer/nav) are the only place we maintain separate mobile/desktop
  artefacts — kept minimal and cross-linked.
- Component authors must classify each component and fill the Responsive behaviour section.
- Consumers apply `.sr-type-*` utilities (or the breakpoint tokens) instead of hard-coded sizes.

---

## Alternatives considered

- **Separate `desktop/` and `mobile/` trees (packages or components).** Rejected: forks the system
  and doubles maintenance for components that only differ by tokens; encourages drift.
- **One scale, ignore form factor.** Rejected: DDR-005 already defines distinct mobile/desktop
  type scales and clinical use spans phones to wide desktops.
- **Per-breakpoint variant on every component in Figma.** Rejected: variant explosion. Reserve
  `Breakpoint=…` variants for Adaptive/Distinct components; everything else adapts via tokens.
