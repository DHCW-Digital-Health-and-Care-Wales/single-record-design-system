# Grid and Layout

Defines the layout system for product interfaces. Consistent layout underpins readability in data-heavy clinical views.

**Source:** Figma *SR Grid & Layout System* (`289:301`, page `286:1605`).
**Last synced:** 2026-08-03.

> This file was rewritten in 2026-08 to match Figma. The previous version
> described a six-step `xs / sm / md / lg / xl / 2xl` scale with different
> gutter and margin values. That scale never existed in
> `foundations/tokens/breakpoints.json`, which has always carried the five
> named breakpoints below — so the doc, not the tokens, was wrong.

---

## Breakpoints

Five breakpoints. All values are pixel-width thresholds and all exist as tokens.

| Breakpoint | Width range | Columns | Gutter | Margin | Token | Platform |
|---|---|---|---|---|---|---|
| Mobile | 0 – 767px | 4 | 16px | 16px | `--breakpoint-mobile-max` | MAUI mobile · web mobile |
| Tablet | 768 – 1023px | 8 | 24px | 32px | `--breakpoint-tablet-min` | MAUI tablet · web tablet |
| Desktop | 1024 – 1279px | 12 | 24px | 40px | `--breakpoint-desktop-min` | Blazor web · MAUI desktop |
| Large | 1280 – 1439px | 12 | 24px | 64px | `--breakpoint-large-min` | Blazor web (standard) |
| XLarge | 1440px + | 12 | 32px | 80px | `--breakpoint-xlarge-min` | Blazor web (wide) |

**Primary target:** `1024px – 1440px` — the majority of clinical workstations. Design and test at this range first.

`--breakpoint-desktop-min` (1024px) also switches the typography scale from the mobile to the desktop values. Changing it moves both.

---

## Grid types

Three configurations. Mobile and tablet grids are **fluid** — columns scale to fill. Desktop is **12-column with fixed margins**.

| Grid | Applies at | Columns | Gutter | Margin |
|---|---|---|---|---|
| 4-column fluid | 0 – 767px | 4 | 16px | 16px |
| 8-column fluid | 768 – 1023px | 8 | 24px | 32px |
| 12-column fixed | 1024px + | 12 | 24 – 32px | 40 – 80px |

---

## EPR application grid

When the EPR navigation sidebar is visible, the content zone is reduced. **Design against the content zone, not the full frame width.**

| Context | Frame | Sidebar | Content zone | Columns | Gutter | Margin |
|---|---|---|---|---|---|---|
| Full width (no sidebar) | 1440px | — | 1440px | 12 | 32px | 80px |
| EPR with sidebar | 1440px | 248px | 1192px | 12 | 24px | 32px |
| EPR with sidebar | 1280px | 248px | 1032px | 12 | 20px | 24px |

> **Open discrepancy.** This table specifies a **248px** sidebar, but the
> `Navigation` component is **220px** in both the DS master
> (`725:8903`) and the Case Note Tracking adaptation (`125:5362`), and 220px
> is what ships in `packages/web/src/navigation/navigation.css`. The three
> content-zone widths above are derived from 248px and are therefore 28px out
> against the component as built. Needs a decision: either the grid page
> updates to 220px, or the Navigation component grows. Do not "fix" either
> side in isolation.

---

## Spacing token reference

Gutter and margin values map directly to the Space scale in Primitives.

| Usage | Value | Primitive | Semantic |
|---|---|---|---|
| Mobile — gutter & margin | 16px | `Space/4` | `Spacing/Layout/XS` |
| Tablet — gutter | 24px | `Space/6` | `Spacing/Layout/SM` |
| Tablet — margin | 32px | `Space/8` | `Spacing/Layout/MD` |
| Desktop — gutter | 24px | `Space/6` | `Spacing/Layout/SM` |
| Desktop — margin (1024px) | 40px | `Space/10` | — |
| Desktop — margin (1280px) | 64px | `Space/16` | `Spacing/Layout/Page` |
| Desktop — margin (1440px) | 80px | `Space/20` | — |

Two margin values (40px and 80px) have no semantic layout token. Use the primitive until one exists.

---

## Platform guidance

### Web — Blazor
Targets Desktop and Tablet. The sidebar reduces content width — design in the content zone.

- Desktop XLarge (1440px) — 12 col, 32px gutter, 80px margin
- Desktop Large (1280px) — 12 col, 24px gutter, 64px margin
- Desktop (1024px) — 12 col, 24px gutter, 40px margin
- Tablet (768px) — 8 col, 24px gutter, 32px margin

### .NET MAUI
Adaptive layout across phone, tablet and desktop. Drive layout switches with the breakpoint token values, not hardcoded numbers.

- Phone (< 768px) — 4 col, 16px gutter, 16px margin
- Tablet (768 – 1023px) — 8 col, 24px gutter, 32px margin
- Desktop (≥ 1024px) — 12 col, 24px gutter, 48px margin
- Use `OnIdiom` / `AdaptiveTrigger` bound to `Breakpoint/*` tokens

> MAUI desktop margin is listed as **48px** in Figma's platform card, which
> matches none of the web margins (40 / 64 / 80). Carried over as drawn; worth
> confirming it is deliberate rather than a stale value.

---

## Responsive frame templates

Pre-configured Figma frames with live column grids, for use as prototype artboards.

| Frame | Size | Grid |
|---|---|---|
| `SR/Mobile/390` | 390 × 844 | 4 col · 16px gutter · 16px margin |
| `SR/Mobile/428` | 428 × 926 | 4 col · 16px gutter · 16px margin |
| `SR/Tablet/768` | 768 × 1024 | 8 col · 24px gutter · 32px margin |
| `SR/Tablet/1024` | 1024 × 900 | 12 col · 24px gutter · 40px margin |
| `SR/Desktop/1280` | 1280 × 900 | 12 col · 24px gutter · 64px margin |
| `SR/Desktop/1440` | 1440 × 900 | 12 col · 32px gutter · 80px margin |
| `SR/EPR/1440` | 1440 × 900 | 248px sidebar · 1192px content · 12 col · 24px gutter · 32px margin |
| `SR/EPR/1280` | 1280 × 900 | 248px sidebar · 1032px content · 12 col · 20px gutter · 24px margin |

---

## Common layout patterns

### Application shell
```
┌─────────────────────────────────────────────┐
│ Global navigation (top bar)                 │
├─────────────┬───────────────────────────────┤
│ Side nav    │ Main content area             │
│ (optional)  │                               │
└─────────────┴───────────────────────────────┘
```

### Record / patient view
```
┌──────────────────────────────────────────────┐
│ Patient banner (persistent)                  │
├──────────────┬───────────────────────────────┤
│ Section nav  │ Record content (tabs/sections)│
│              │                               │
└──────────────┴───────────────────────────────┘
```

### Form page
```
┌───────────────────────────────────────────┐
│ Page heading + context                    │
├──────────────────────────┬────────────────┤
│ Form content (cols 1–8)  │ Summary / hint │
│                          │ (cols 9–12)    │
└──────────────────────────┴────────────────┘
```

Specific layout compositions are documented in `/patterns/`.

---

## Max content width

| Context | Max width |
|---|---|
| Body text / long-form content | `720px` |
| Forms (single column) | `560px` |
| Full-width data tables | `none` (full container) |
| Page container | `1440px` |

---

## Usage rules

- Layout tokens are used in Figma auto-layout and code implementations.
- Do not create custom grid configurations per product — extend via `/products/{name}/` overrides if genuinely required.
- The patient banner is **always full width** and outside the column grid constraint.
- Avoid horizontal scrolling in all views except data tables with an explicit overflow affordance.
