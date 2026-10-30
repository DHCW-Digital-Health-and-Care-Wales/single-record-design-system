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

Minimum interactive touch target: **44 × 44 px** (`sr.touch.default`; WCAG 2.2 SC 2.5.5, AAA).
The AA floor is 24 × 24 px (SC 2.5.8), which Single Record uses only on desktop with the spacing
exception. The icon itself may be smaller with padding applied at the component level.

### Icons as buttons

A button made of an icon alone (back, close, menu, more, search, filter) has no words to help the
user, so the glyph has to carry the meaning on its own. Make it bigger than an icon that sits next
to a label.

| Where the icon is | Icon size | Tap target | Why |
|---|---|---|---|
| Beside a visible label (a button with an icon, bottom navigation, a menu row) | `sm` 20px in buttons, `md` 24px elsewhere | The whole button or row | The label does the explaining |
| Standalone, desktop and web toolbars | `md` 24px | 44 × 44 (`sr.touch.default`). 32 × 32 (`sr.touch.compact`) only in dense tables, with the reason in the spec | Read at desk distance with a pointer |
| **Standalone, mobile** (app bar back, close, menu, more, scan) | **`lg` 32px** | **44 × 44** (`sr.touch.default`, the MAUI floor) | Read at arm's length and tapped with a thumb |

- **Why 32px on mobile.** The stroke scales with the icon. At 24px our 1px stroke is a 1px line,
  which is faint on a phone. At 32px it draws at 1.33px and the glyph is a third bigger, without
  changing the icon or adding a heavier variant. A 32px icon in a 44px target leaves 6px all round.
- **The target is the button, not the icon.** Size the button frame to 44 × 44 and centre the icon
  in it. Do not make the icon itself 44px.
- **Every standalone icon button needs an accessible name** that says what it does: "Back",
  "Close", "Open menu", "Scan wristband". Never the icon's name ("Chevron left").
- **Keep the meaning, not just the size.** If people hesitate over what a standalone icon does in
  testing, add a label rather than making the icon bigger.
- **Android recommends 48 × 48dp.** Single Record's floor is 44 on every platform. Moving mobile to
  48 would need a new touch token and a decision record; raise it if the mobile app is tested
  with users who find 44 too small.

**Figma:** place the `Icon/…` instance in a 44 × 44 frame with no fill and centre it. Make it 32px
with the **Scale tool (K)**, not by dragging or typing a new width: a plain resize keeps the 1px
stroke, so the icon gets bigger but no clearer. Scaled, the stroke grows to 1.33px, matching code.
An icon nested inside another component's instance cannot be resized at all; size it in the main
component.

---

## Colour Roles

Icons use `currentColor` and inherit from CSS context. Eight semantic colour roles are defined:

| Token | Maps to | Usage |
|---|---|---|
| `sr.icon.color.default` | `sr.color.text.primary` | Default icon colour |
| `sr.icon.color.subtle` | `sr.color.text.secondary` | Subdued / secondary icons |
| `sr.icon.color.inverse` | `sr.color.text.inverse` | Icons on dark or coloured surfaces |
| `sr.icon.color.interactive` | `sr.color.interactive.primary` | Clickable / hoverable icons |
| `sr.icon.color.critical` | `sr.color.status.error` | Critical / error state |
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
