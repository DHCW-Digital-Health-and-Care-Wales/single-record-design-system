# @dhcw/sr-maui

Native .NET MAUI token and style layer for the DHCW Single Record Design System.
Published to NuGet as `DHCW.SingleRecord.Maui` (DDR-020, as amended).

**MAUI is native XAML.** There is no `BlazorWebView` and no Blazor Hybrid
anywhere in the Single Record mobile estate — see DDR-021, which corrects an
earlier assumption to the contrary. `packages/blazor` serves Blazor web only.

## What this package is

A **token and style layer**, not a parallel component library. The mobile app
has its own working native components (`DemographicsHeader`, `AdmissionControl`,
a header/footer control template); this package makes them look like Single
Record rather than competing with them.

| Artefact | Source | Purpose |
|---|---|---|
| `Colors.xaml` | **Generated** by `build.mjs` from `@dhcw/sr-tokens` | 208 resources: every primitive and semantic token, plus a `…Dark` twin for the 16 semantics that change with the theme |
| `Styles.xaml` | Hand-authored | Implicit styles for stock MAUI controls, keyed styles for intent variants, `StyleClass` type scale, `VisualStateManager` states |

MAUI cannot consume CSS custom properties, which is why the XAML format exists.
Both files come from the same JSON as the web CSS, so the two cannot drift.

### Why `Colors.xaml` rather than `Tokens.xaml` directly

`@dhcw/sr-tokens` emits `Tokens.xaml` and `Tokens.Dark.xaml` with the **same key
names** and different values. That shape suits swapping dictionaries at runtime,
but this app themes with `AppThemeBinding`, which needs both values reachable at
once under different keys — merging both files would be a key collision.

`Colors.xaml` carries every key once, plus a `Dark` twin for the 16 semantic
tokens whose value actually differs. Primitives are identical in both modes and
are not duplicated.

```xml
<Setter Property="TextColor"
        Value="{AppThemeBinding Light={StaticResource SrColorTextPrimary},
                                Dark={StaticResource SrColorTextPrimaryDark}}" />
```

## Using it

```xml
<ResourceDictionary.MergedDictionaries>
    <sr:Colors />   <!-- first: Styles.xaml resolves against it -->
    <sr:Styles />
</ResourceDictionary.MergedDictionaries>
```

Reach for the **semantic** names (`SrColorInteractivePrimary`,
`SrColorTextSecondary`). The primitives beneath them (`ColorBlue800` and
friends) exist so the semantics have something to resolve to; binding a
component straight to a primitive skips the layer that carries the meaning, and
it will not follow a token change.

## The build is a conformance gate

`npm run build:maui` regenerates `Colors.xaml` and then **fails** if
`Styles.xaml` either references a resource that does not exist or hard-codes a
colour — a hex value or a named one such as `Red`. `Transparent` is allowed: it
is the absence of a colour, not a choice of one. This runs as part of
`npm run check`.

## Conventions

Written in ordinary MAUI idiom so it reads like a file a MAUI developer wrote:

- **Implicit styles** — a bare `<Button>` must look right with no ceremony
- **`AppThemeBinding Light=… Dark=…`** for light/dark, not a runtime swap
- **`VisualStateManager`** for Normal / Disabled / On / Off — states live in XAML
- **`StyleClass`** for type variants
- **Keyed styles** for intent (`ButtonPrimary`, `ButtonDestructive`)
- **`MinimumHeightRequest`, not `HeightRequest`**, wherever text is involved —
  `FontAutoScalingEnabled` defaults to `true`, so fixed heights clip at 200%
  system font scale

## Type scale

Base is `body-s` **14/20** (DDR-015). Caption is **12/16** and is the floor —
nothing goes below it. The app's previous 10px `Micro` class is deleted; its work
(provenance metadata such as "last actioned by") is caption's job.

## Syncfusion

> Wrap what the design system would never design. Build natively what it already
> specifies.

| Control | Approach |
|---|---|
| `SfPdfViewer` | **Wrapped** as `SrDocumentViewer` — the dependency lives in one file |
| `SfListView` | Wrap only if `CollectionView` measurably underperforms |
| `SfTextInputLayout`, `SfCheckBox`, `SfExpander`, `SfBadgeView`, `SfTabItem` | Built natively |

The design system specifies a wrapper's API and visual contract; a developer with
a Syncfusion seat implements it. Authoring and verifying this package needs no
licence for roughly 94% of its surface.

**Status:** First cut shipped. `Colors.xaml` generates and `Styles.xaml` covers
typography, surfaces, buttons, form fields and status treatments.

Not done yet, in rough order:

- **Verify on a device.** Nothing here has been compiled — it is validated as
  well-formed XAML with every resource reference resolving, which catches typos
  but not layout. BrowserStack App Live is the cheapest way to check it.
- **Test at 200% system font scale.** Every text-bearing style uses
  `MinimumHeightRequest`, but that needs proving rather than asserting.
- **The Syncfusion theming layer** — `SfPdfViewer` wrapped as
  `SrDocumentViewer`, and default theming for whatever else survives the
  wrap-or-build decision.
- **Native components** for the vocabulary the design system already specifies
  and MAUI has no stock equivalent of.
