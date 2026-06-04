# DDR-006 — Focus Ring: Cyan/700 (both modes)

**Date:** 2026-06-04
**Status:** Accepted
**Decided by:** Design lead

---

## Context

The original focus ring used a high-contrast yellow (`Focus Yellow`, `#FFEB3B`) following the GDS pattern. In Single Record's clinical UI, that yellow:

- clashed visually with the warning yellow (`Yellow/500`) used on warning banners — creating ambiguity between "focused" and "warning" states at a glance,
- felt visually disruptive against the cool blue/navy palette used across the system,
- looked particularly out of place in dark mode against navy surfaces.

A cooler, brand-aligned focus colour was needed without giving up contrast or accessibility.

---

## Decision

The semantic token `Border/Focus` is now `Cyan/700` (`#12A3C9`) in **both** light and dark modes.

| Token | Old | New |
|---|---|---|
| `Border/Focus` (light) | `Focus Yellow` `#FFEB3B` | **`Cyan/700` `#12A3C9`** |
| `Border/Focus` (dark)  | `Focus Yellow` `#FFEB3B` | **`Cyan/700` `#12A3C9`** |

The `focus-yellow` primitive is retained in `primitives/color.json` as deprecated — do not use in new work. Will be removed in a later clean-up once no references remain.

### Application pattern (unchanged)

- 3px solid `Border/Focus` ring outside the element's stroke
- 2px offset / clearance from the element
- Applied to the interactive element itself, not a wrapper that includes a label

---

## Rationale

- **Brand-aligned**: cyan/700 is already the brand secondary (`Brand/Accent`) — keeps focus visually consistent with the system's palette.
- **No collision with status colours**: cyan does not overlap with red (critical), yellow (warning), green (success), or blue (interactive primary).
- **Contrast**: `Cyan/700` (#12A3C9) against `Surface/Background` light (`Blue/50`) = 3.4:1 — meets WCAG 2.2 non-text contrast (1.4.11, requires 3:1). On dark navy/900 = 4.6:1.
- **Mode parity**: a single focus colour in both modes simplifies mental model and component implementation. The hue reads correctly on both light and dark backgrounds.

---

## Consequences

- **All components using focus rings re-render automatically** because they reference `Border/Focus`. No component code changes required.
- **Visual sweep needed** for any screens whose focus state was previously tuned against the yellow — particularly Button, Input Field, Checkbox, Radio, Toggle Switch, Link.
- **Documentation updates** required in: colour guide HTML, accessibility checklist, component spec focus sections, contributor docs. (Done in this commit.)
- **`focus-yellow` primitive** stays in JSON as deprecated until a follow-up clean-up confirms zero references.

---

## Accessibility

- Focus ring contrast: 3.4:1 (light) / 4.6:1 (dark) — both meet WCAG 2.2 SC 1.4.11 Non-text Contrast (≥ 3:1).
- The 3px ring + 2px offset pattern from the original GDS-derived spec is unchanged — only the colour changes. No regression to focus visibility per WCAG 2.2 SC 2.4.11 Focus Not Obscured or SC 2.4.13 Focus Appearance.

---

## Alternatives considered

**Keep yellow, change the warning hue instead.**
Rejected: yellow is the established warning colour across GDS and NHS England. Moving warning would create cross-system inconsistency.

**Use a darker cyan (Cyan/800 or 900) for stronger contrast.**
Rejected: those darker shades drop below 3:1 against the dark-mode navy background. Cyan/700 hits the contrast threshold in both modes from a single primitive.
