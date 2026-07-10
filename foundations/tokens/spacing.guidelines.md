# Spacing

> How we size padding, margins, gaps and layout rhythm so screens feel consistent
> and dense clinical data stays readable.

| | |
|---|---|
| **Type** | Foundation |
| **Reference** | [`spacing.md`](./spacing.md) (token reference) · [`primitives/spacing.json`](./primitives/spacing.json) · [`semantic/spacing.json`](./semantic/spacing.json) |
| **Figma** | Foundations page Spacing & Elevation (`103:2340`) |
| **Related standards** | DDR-001 (4px base unit) · GDS / NHS England spacing |
| **Last updated** | 2026-07 |

---

## When to use

- Use spacing tokens (`--space-*`) for every padding, margin and gap.
- Never type a raw pixel value; if a value you need is not on the scale, that is a token decision, not a local override.
- Pick by role using the semantic spacing tokens where they exist, not by eyeballing pixels.

## The 4px grid

- Every step is a multiple of the **4px base unit** (DDR-001), matching the type line-height grid so text and layout share one rhythm.
- Scale: 0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96px.
- Density matters in clinical tables: prefer the smaller steps (`space-1` to `space-4`) for component internals, larger steps for page-level rhythm.

## Options

| Token | px | Typical use |
|---|---|---|
| `space-1` | 4 | Icon padding, micro gaps |
| `space-2` | 8 | Tight component internals, table cells |
| `space-3` | 12 | Compact form elements |
| `space-4` | 16 | Default internal padding |
| `space-6` | 24 | Section spacing within panels |
| `space-8` | 32 | Component separation |
| `space-12` | 48 | Section breaks |
| `space-16` | 64 | Major layout sections |

Full scale and semantic mappings: [`spacing.md`](./spacing.md).

## Do and don't

| Do | Don't |
|---|---|
| Use `--space-*` for all spacing | Hardcode pixel values |
| Keep to the 4px grid | Introduce off-grid one-offs |
| Use smaller steps for dense tables | Pad clinical tables so loosely they need scrolling |
| Let spacing scale with the layout | Fix gaps that break at small viewports |

## Accessibility

- Spacing must not defeat WCAG 2.2 text-spacing (1.4.12): layouts tolerate user spacing overrides without clipping.
- Keep interactive targets at least 24x24px with adequate spacing (2.5.8); 44x44px is preferred for primary touch controls.

## Frameworks

| Framework | Status | Where |
|---|---|---|
| Web (HTML/CSS) | Reference baseline | `--space-*` custom properties from `@dhcw/sr-tokens` |
| React | Current | same token CSS |
| Blazor / .NET | Current | same token CSS via the RCL |
| .NET MAUI | Current | XAML `Space*` keys from the token build |
| Legacy (.NET 4.8 / Delphi) | Tokens only / best-effort | CSS custom properties |

## Related

- [`spacing.md`](./spacing.md) — token reference
- [DDR-001](../../decisions/DDR-001-four-px-base-spacing.md) — the 4px base unit
- [`typography.guidelines.md`](./typography.guidelines.md) · [`colour/colour.guidelines.md`](./colour/colour.guidelines.md)
</content>
