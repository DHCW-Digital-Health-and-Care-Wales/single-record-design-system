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
- Pick by role using the semantic spacing tokens where they exist, not by eyeballing pixels.
- Use proximity to show relationship: put related items closer together than unrelated ones.

## When not to use

- Do not type a raw pixel value. If a value you need is not on the scale, that is a token
  decision (DDR plus sign-off), not a local override.
- Do not pad clinical tables so loosely that rows need horizontal scrolling to fit the view.
- Do not use spacing alone to separate content that also needs a visible boundary — use
  `Border/Subtle` or a divider, not a gap, when the grouping must survive at high zoom.

## How it works

- **4px base unit** — every step is a multiple of 4px (DDR-001), matching the type
  line-height grid so text and layout share one rhythm.
- **Scale** — 0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96px.
- **Density in clinical tables** — prefer the smaller steps (`space-1` to `space-4`) for
  component internals; use larger steps for page-level rhythm, not table cells.
- **Proximity signals grouping** — the gap between a label and its value should be smaller
  than the gap to the next unrelated item, so related information reads as one group without
  needing a rule or fill to separate it.

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
- Reflow (1.4.10): spacing must scale or wrap at 400% zoom and 320px width, never cause
  content loss or a second scroll axis.

## Frameworks

| Framework | Status | Where |
|---|---|---|
| Web (HTML/CSS) | Reference baseline | `--space-*` custom properties from `@dhcw/sr-tokens` |
| React | Current | same token CSS |
| Blazor / .NET | Current | same token CSS via the RCL |
| .NET MAUI | Current | XAML `Space*` keys from the token build |
| Legacy (.NET 4.8 / Delphi) | Tokens only / best-effort | CSS custom properties |

## Clinical / DHCW notes

DHCW UI Standards state that the space between a field's content and its heading must be smaller than the space between that content and the next heading below it, so related information reads as a group without a rule or fill ([p.15](../../docs/reference/dhcw-ui-standards-v1.3.md#page-15)).

We carry that grouping-by-proximity intent forward (`CARRIED` disposition): choose adjacent
`--space-*` steps for label-to-value and a larger step for the gap to the next group, rather
than fixed legacy pixel values.

## Related

- [`spacing.md`](./spacing.md) — token reference
- [DDR-001](../../decisions/DDR-001-four-px-base-spacing.md) — the 4px base unit
- [`typography.guidelines.md`](./typography.guidelines.md) · [`colour/colour.guidelines.md`](./colour/colour.guidelines.md)
