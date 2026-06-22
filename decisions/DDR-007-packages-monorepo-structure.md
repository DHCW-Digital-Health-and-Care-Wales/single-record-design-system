# DDR-007 — Packages monorepo structure for multi-framework delivery

**Status:** Accepted  
**Date:** 2026-06-22  
**Author:** Design system team  

---

## Context

The design system repo contains tokens (JSON), icon SVGs, component specs, and documentation — but no consumable packages for engineers. The system must serve:

| Target | Delivery |
|---|---|
| Standard HTML / CSS | CSS custom properties (reference baseline) |
| Blazor / .NET | CSS custom properties + Razor components |
| React | CSS custom properties + React components |
| .NET MAUI (mobile) | XAML ResourceDictionary |
| .NET Framework 4.8 (legacy) | CSS custom properties only — visual layer, no component model |

## Decision

Adopt a **monorepo with scoped packages** under `/packages/`, following the MOD/Royal Navy design system pattern. A single token build pipeline (Style Dictionary) transforms the existing `/foundations/tokens/` JSON into all required output formats.

### Package structure

```
/packages
  /tokens        Token build pipeline. Input: /foundations/tokens/ JSON.
                 Output: CSS custom properties, SCSS variables, XAML ResourceDictionary.
                 This is the first package — everything else depends on it.
  /icons         SVG sprite, React/Blazor icon components (future)
  /web           Canonical HTML/CSS components (future — govuk-frontend model)
  /react         React wrappers around /web (future)
  /blazor        Razor components consuming /web CSS (future)
  /maui          .NET MAUI controls consuming XAML tokens (future)
```

### Why monorepo over multi-repo

1. Single team — discoverability matters more than isolation
2. Token changes propagate to all packages in one PR
3. MAUI requires XAML from the same JSON source — same-repo build is simpler
4. Aligns with GDS guidance: one canonical source, thin per-framework adapters

### .NET Framework 4.8

Consumes `/packages/tokens/build/css/tokens.css` directly. No component library. No dependency on GovUk.Frontend.AspNetCore (targets ASP.NET Core, incompatible with 4.8 runtime). The token CSS file is the contract — engineers drop it into their existing stylesheet pipeline.

### Build tool

Style Dictionary 4.x. Chosen because:
- W3C DTCG token format support (our JSON already follows this)
- Multi-platform output (CSS, SCSS, XAML, JSON, iOS, Android)
- Used by GOV.UK, NHS, and MOD design system pipelines
- No runtime dependency — generates static files

## Alternatives considered

| Alternative | Why rejected |
|---|---|
| Multi-repo (GDS model) | Overhead for a single team; harder to keep tokens in sync across repos |
| Tailwind config export | Locks out non-Tailwind consumers (Blazor, MAUI, legacy) |
| Manual token files | Already what we have — doesn't scale, error-prone |

## Consequences

- Engineers can consume tokens immediately via CSS custom properties or XAML resources
- Future component packages build on this foundation
- Token changes require re-running the build — CI should automate this
