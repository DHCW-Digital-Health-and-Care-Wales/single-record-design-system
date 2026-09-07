# Iconography

Guidelines for icon usage across the design system.

---

## Icon Library

**Adopted:** [Lucide Icons](https://lucide.dev) — ISC licence

See [DDR-003](../decisions/DDR-003-lucide-icon-library.md) for the full decision record.

| Attribute | Detail |
|---|---|
| Library | Lucide Icons |
| Licence | ISC (permissive; copyright notice required in source, not in UI) |
| Grid | 24 × 24 px |
| Stroke | **1px** at every size, round linecap, round linejoin (DDR-023 — Lucide ships 2px; Single Record overrides it globally) |
| Coverage | 2,000+ icons in Lucide. For the SR alias and domain counts see `foundations/iconography/catalogue.md`, which is generated — do not type a total here |
| NuGet | `Lucide.Blazor`, `Lucide.Maui` |
| Source SVGs | `foundations/iconography/svg/{domain}/{sr-name}.svg` |
| Catalogue | `foundations/iconography/catalogue.md` |

---

## Sizes and Stroke

Four sizes are defined via token. **Stroke does not vary by size** — it is 1px
everywhere (DDR-023).

| Token | Size | Usage |
|---|---|---|
| `sr.icon.size.xs` | 16px | Inline within dense content |
| `sr.icon.size.sm` | 20px | Standard inline icons |
| `sr.icon.size.md` | 24px | Default. Matches the source grid 1:1 |
| `sr.icon.size.lg` | 32px | Prominent icons, empty states |
| `sr.icon.stroke`  | 1     | Every size. There is no dense/default pair |

> This table previously specified 2px at md/lg and 1.75px at xs/sm, and the
> token layer carried `icon.stroke.default: 2` and `icon.stroke.dense: 1.75` to
> match — which reached Blazor CSS and MAUI XAML as real, consumable values.
> No icon has ever been drawn that way: every SVG in
> `foundations/iconography/svg/` is `stroke-width="1"`, and `npm run check:icons`
> fails on any that is not. The tokens now say 1, once.

### Per platform

The tokens above are emitted to every platform from one source, so a size or
colour is the same number everywhere.

| Platform | How to consume |
|---|---|
| Web / Blazor | `var(--sr-icon-size-md)`, `var(--sr-icon-stroke)`, `var(--sr-icon-color-subtle)` — or the `.sr-icon--md` / `.sr-icon--subtle` classes, which read the same tokens |
| React | `<Icon name="nav/search" size="md" color="subtle" />` — maps to those classes |
| .NET MAUI | `{StaticResource SrIconSizeMd}` (`x:Double`), `{StaticResource SrIconStroke}` (`x:Double`, bind to `StrokeThickness`), `{StaticResource SrIconColorSubtle}` (`Color`) |
| Delphi | Rasterise from the SVGs at 16/20/24/32px |

Minimum interactive touch target is unchanged by icon size — see below.

Minimum interactive touch target: **44 × 44 px** (WCAG 2.2 SC 2.5.8). The icon itself may be smaller with padding applied at the component level.

---

## Colour Roles

Icons use `currentColor` and inherit from CSS context. Eight semantic colour roles are defined:

| Token | Maps to | Usage |
|---|---|---|
| `sr.icon.color.default` | `sr.color.text.primary` | Default icon colour |
| `sr.icon.color.subtle` | `sr.color.text.secondary` | Subdued / secondary icons |
| `sr.icon.color.inverse` | `sr.color.text.inverse` | Icons on dark or coloured surfaces |
| `sr.icon.color.interactive` | `sr.color.interactive.primary` | Clickable / hoverable icons |
| `sr.icon.color.critical` | `sr.color.status.critical` | Critical / error state |
| `sr.icon.color.warning` | `sr.color.status.warning` | Warning state |
| `sr.icon.color.success` | `sr.color.status.success` | Success / confirmed state |
| `sr.icon.color.info` | `sr.color.status.info` | Informational |

---

## Filled Variant Policy

Filled variants are **deferred to the navigation component phase**.

Filled variants are only assigned to specific icons when a navigation component explicitly requires them. They are not assigned speculatively. All icons in the current catalogue are outline only.

---

## Accessibility Rules

1. **Decorative icons** (paired with visible text): set `aria-hidden="true"` on the SVG. All SVGs in this system ship with `aria-hidden="true"` by default.
2. **Meaningful icons** (used without visible text): provide an accessible name via `aria-label` on the parent button/link, or use a visually-hidden label alongside the icon.
3. **Icon + text pairs**: the icon is always decorative; the text carries the meaning. Never rely on icon alone in clinical contexts.
4. **Status icons**: always pair with a text label. Do not use colour or icon shape as the sole differentiator for status.

---

## Usage Rules

- Use SR catalogue aliases (`nav/home`, `clinical/medication`) in code and Figma — not raw Lucide names.
- Do not use icons from other libraries alongside SR icons in the same product.
- Do not modify SVG paths. If a new icon is needed, follow the process in `foundations/iconography/catalogue.md`.
- Avoid decorative icons in dense data views — they add visual noise with no semantic value.
