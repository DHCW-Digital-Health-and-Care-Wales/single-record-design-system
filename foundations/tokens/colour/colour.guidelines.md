# Colour

> How we use colour so it carries meaning consistently, meets accessibility, and
> works in light and dark, across every Single Record product.

| | |
|---|---|
| **Type** | Foundation |
| **Reference** | [`global.md`](./global.md) (primitives) · [`semantic.md`](./semantic.md) (semantic tokens) · [`primitives/color.json`](../primitives/color.json) · [`semantic/color.json`](../semantic/color.json) |
| **Figma** | Foundations page Colours (`12:3270`); guidelines panel `Guidelines/Colours` (`3468:9073`); colour-tokens frame (`125:5188`) |
| **Related standards** | GDS / NHS England colour · WCAG 2.2 (1.4.1, 1.4.3, 1.4.11) · DDR-006 (focus ring) |
| **Last updated** | 2026-07 |

---

## When to use

- Use semantic colour tokens (`sr.color.*`) for every fill, text and border.
- Never use primitive palette values (`blue-800`, `grey-600`) directly in a design or component.
- Pick by role, not by hue.

## Token tiers

- **Primitives** are the raw palette; reference them only from semantic tokens.
- **Semantic (Single Record)** tokens carry meaning: `Interactive/Primary`, `Text/Default`, `Status/Critical`.
- **Component** tokens inherit from semantic where a part needs its own value.

## Contrast (AA)

- Body text and essential UI meet WCAG 2.2 AA: 4.5:1 for text, 3:1 for large text, icons and borders.
- Cyan/700 is an accent only; it fails AA with white text (2.6:1), so never fill a button or a surface needing white text with it. Use `Interactive/Primary` (Blue/800, 7.1:1 with white).
- Validate every colour token against its intended background before use.

## Never colour alone

- Colour is never the only signal; pair a status colour with text and an icon (WCAG 1.4.1).
- Applies to do and don't cards, form validation, and clinical alert states.

## Status colours

- Critical red, Success green, Warning yellow, Info blue; each has a light surface pair.
- Critical sits above Error for patient-safety alerts.
- Use `Status/*` for clinical severity (badge, tag); use `Interactive/Destructive` for a risky action (delete button, error border). Same red, different roles, never swapped.

## Focus ring

- Focus uses `Border/Focus` (Cyan/700) in both light and dark modes (DDR-006).
- The ring sits outside the element, paired with a 2px strong border.
- Add an inner dark ring on saturated backgrounds so the ring stays visible.

## Placeholder and muted greys

- Placeholder text uses `Text/Secondary` (Grey/600), which meets AA. There is no separate placeholder token.
- Prefer a visible label and hint over placeholder text (GDS/NHS position); placeholders disappear on input and are easily mistaken for a value. Full rules will live in the Input and Select guidelines.
- Distinguish an entered value (`Text/Default`, Grey/900) from a placeholder (`Text/Secondary`, Grey/600) by lightness; both pass AA.
- `Grey/500` (#768692) is for disabled text, muted icons and strong borders only, never live body text (3.75:1, non-text/exempt uses).

## Dark mode

- Dark mode is a variable mode on the Single Record collection, mirrored by `[data-theme="dark"]` in code (with `prefers-color-scheme` as the default signal).
- Switch a parent frame's mode and variable-bound fills update automatically.
- Do not build a separate dark palette or hardcode dark values.

## Frameworks

| Framework | Status | Where |
|---|---|---|
| Web (HTML/CSS) | Reference baseline | `@dhcw/sr-tokens` build/css `--sr-color-*` (light) + `tokens-dark.css` via `[data-theme]` |
| React | Current | consumes the same token CSS |
| Blazor / .NET | Current | same token CSS via the RCL |
| .NET MAUI | Current | XAML `SrColor*` keys (light + dark dictionaries) |
| Legacy (.NET 4.8 / Delphi) | Tokens only / best-effort | CSS custom properties, visual layer only |

## Clinical / DHCW notes

The legacy DHCW UI Standards hardcode WCP colours (e.g. `#1B6EC2` section bars,
`#FD8A10` warning, `#D50000` badges — see [Appendix p.70](../../../docs/reference/dhcw-ui-standards-v1.3.md#page-70)).
Those are superseded by our tokens (`TOKEN` disposition). What carries forward is the
intent: consistent status semantics, high-contrast text on filled bars, and reserving
red for critical/destructive meaning.

## Related

- [`semantic.md`](./semantic.md) and [`global.md`](./global.md), token reference
- [DDR-006](../../../decisions/DDR-006-focus-ring-cyan.md), focus ring · [DDR-013](../../../decisions/DDR-013-filled-status-indicators.md), status indicators
- [`typography.guidelines.md`](../typography.guidelines.md), the sibling foundation guideline
- GDS / NHS England colour (pattern references)
</content>
