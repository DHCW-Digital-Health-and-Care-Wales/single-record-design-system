# DDR-003: Lucide as Icon Library

**Date:** 2026-03-23
**Author:** Design lead
**Status:** Accepted — **stroke weight superseded by DDR-023 (2026-08-13)**
**Supersedes:** `foundations/iconography.md` provisional entry (Material Symbols)

---

## Context

The Single Record Design System requires a consistent icon library covering clinical and administrative UI across EPR, EMR, patient administration, scheduling, ward management, and related products — 7+ workstreams, three platforms (Blazor web, .NET MAUI, Delphi desktop).

An icon library decision was deferred at project start. The `foundations/iconography.md` file contained a provisional note that Material Symbols was being evaluated. This DDR formalises the decision.

---

## Decision

**Lucide Icons** is adopted as the SR icon library.

- Licence: ISC (fully permissive — suitable for NHS/public sector internal use; copyright notice required in source, not in UI)
- Grid: 24 × 24 px
- Stroke: 2px, round linecap, round linejoin
- Variant: outline only (filled deferred to navigation component phase)
- Source: `https://github.com/lucide-icons/lucide/tree/main/icons`
- NuGet packages available for Blazor and .NET MAUI

The SR catalogue defines 106 aliases across 10 clinical/administrative domains. SVGs are stored in `foundations/iconography/svg/{domain}/{sr-name}.svg` normalised to the SR visual spec (1em × 1em, `currentColor`, `aria-hidden="true"`).

---

## Options Considered

### Option A: NHS App icon set
- **Pros:** NHS-branded; officially used on NHS.uk and NHS App
- **Cons:** Only 21 consumer navigation icons — insufficient for clinical product scope. Covers: home, heart, menu, profile, etc. Does not cover: medication, allergy, procedure, lab result, imaging, ward management, scheduling, referral, consent, or any of the 80+ clinical/administrative concepts in the SR catalogue. Not designed for data-dense clinical interfaces.
- **Decision:** Not suitable. Would require significant supplementation, creating a mixed icon language.

### Option B: Material Symbols (Google)
- **Pros:** 3,000+ icons; well-documented; used in healthcare applications globally
- **Cons:** Apache 2.0 licence (acceptable, but adds attribution requirements); visual language is Google Material — not aligned with NHS/GDS design principles; 24px grid and variable font weight are less predictable at implementation than a fixed-stroke library; no first-party NHS/DHCW usage to align with
- **Decision:** Not adopted. Visual language mismatch with NHS context.

### Option C: Lucide Icons (chosen)
- **Pros:** 1,500+ icons under ISC licence; consistent 24px grid and stroke language (2px as shipped, changed to 1px by DDR-023); clean, minimal visual language compatible with NHS/GDS style; NuGet packages for Blazor (`Lucide.Blazor`) and .NET MAUI (`Lucide.Maui`); active maintenance; 106-icon SR catalogue fully covered
- **Cons:** Not an NHS-owned or NHS-endorsed library (acceptable — no NHS-owned library of sufficient scope exists for clinical applications)
- **Decision:** Adopted.

### Option D: Custom icon set
- **Pros:** Complete brand control; purpose-built for clinical use cases
- **Cons:** Significant design and maintenance resource; no current capacity; would take months before usable in products
- **Decision:** Deferred indefinitely. Review if DHCW establishes a core design system with its own icon library.

---

## Platform Considerations

| Platform | Implementation | Notes |
|---|---|---|
| Web (Blazor) | Inline `currentColor` SVG | Size via CSS `font-size` or explicit dimensions; colour roles via `color` CSS property |
| Mobile (.NET MAUI) | Embedded SVG resource | `TintColor` for colour roles; `Lucide.Maui` NuGet package available |
| Desktop (Delphi) | Rasterised PNG export | Export from SVG at 16, 20, 24, 32px; maintain at 1x and 2x for HiDPI displays |

---

## Future Alignment

**Potential: medium.**

If DHCW establishes a core design system that adopts Lucide (or a Lucide-derived set), the SR catalogue can be shared directly with minimal rework. If DHCW adopts a different library, the domain/name alias structure allows SVG sources to be swapped without changing component APIs or token references.

---

## Consequences

- `foundations/iconography/catalogue.md` is the authoritative icon list. All product teams must use catalogue aliases, not raw Lucide names, in component code and Figma.
- Delphi products require a rasterised export workflow. Engineering lead to establish this.
- Filled variants are not assigned speculatively. Each filled icon must be explicitly required by a navigation component.
- `foundations/iconography.md` is updated to reflect this decision.
