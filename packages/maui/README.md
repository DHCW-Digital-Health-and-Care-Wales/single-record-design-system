# @dhcw/sr-maui

Native .NET MAUI token and style layer for the DHCW Single Record Design System.

**This npm package is what the design system builds *from*. A MAUI app installs
`DHCW.SingleRecord.Maui` from NuGet instead** — npm is JavaScript-only, and
there is no npm in the .NET toolchain. The NuGet project is generated into
`nuget/` by `build-nuget.mjs`; see `nuget/README.md` for consumer docs, and
`npm run pack:maui` at the repository root to produce the `.nupkg`.

Copying the three XAML files into an app by hand still works and is still
supported — the merge syntax differs between the two routes, which is written up
in `docs/engineering/known-issues.md`.

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
| `Colors.xaml` | **Generated** by `build.mjs` from `@dhcw/sr-tokens` | 210 resources: every primitive and semantic token, the two elevation shadows, plus a `…Dark` twin for the 16 semantics that change with the theme |
| `Icons.xaml` | **Generated** by `build-icons.mjs` from `foundations/iconography/svg/` | 123 icons as XAML path geometry, 1px stroke (DDR-023) |
| `Styles.xaml` | Hand-authored | Implicit styles for stock MAUI controls, keyed styles for intent variants, `StyleClass` type scale, `VisualStateManager` states |

MAUI cannot consume CSS custom properties, which is why the XAML format exists.
All three come from the same sources as the web CSS and the web icon set, so they
cannot drift.

### Why icons are geometry, not images

MAUI will rasterise an SVG at build time through `<MauiImage>`, but the colour is
baked into the PNG that comes out. These are `stroke="currentColor"` outlines
that have to take their colour from a token and follow the theme, so a bitmap is
the wrong container. As geometry on a `Path`, the stroke is an ordinary bindable
property.

The conversion is not a copy: several icons are drawn from multiple `<path>`
elements, and concatenating them into one geometry only works if each subpath
opens with an **absolute** moveto. 30 of the 120 open with a relative one, which
would be measured from the previous subpath's end point and silently displace the
shape. `verify-icons.mjs` walks both forms and compares the points they visit, so
that class of error fails the build rather than shipping a wrong-looking icon.

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

Include the three files in your project and merge them in `App.xaml`:

```xml
<ItemGroup>
  <MauiXaml Include="path/to/Colors.xaml" Link="Resources/Styles/Colors.xaml" />
  <MauiXaml Include="path/to/Styles.xaml" Link="Resources/Styles/Styles.xaml" />
  <MauiXaml Include="path/to/Icons.xaml"  Link="Resources/Styles/Icons.xaml" />
</ItemGroup>
```

```xml
<ResourceDictionary.MergedDictionaries>
    <!-- Colors FIRST: Styles.xaml resolves {StaticResource SrColor…} against it,
         so the other order leaves every colour in the system unresolved. -->
    <ResourceDictionary Source="Resources/Styles/Colors.xaml" />
    <ResourceDictionary Source="Resources/Styles/Styles.xaml" />
    <ResourceDictionary Source="Resources/Styles/Icons.xaml" />
</ResourceDictionary.MergedDictionaries>
```

> An earlier version of this README showed `<sr:Colors />`. That form needs an
> `x:Class` on each dictionary, and these files deliberately have none — they are
> plain resource dictionaries loaded by `Source`, which is what the stock MAUI
> template does. `<sr:Colors />` would not have compiled.

Reach for the **semantic** names (`SrColorInteractivePrimary`,
`SrColorTextSecondary`). The primitives beneath them (`ColorBlue800` and
friends) exist so the semantics have something to resolve to; binding a
component straight to a primitive skips the layer that carries the meaning, and
it will not follow a token change.

Icons carry no colour of their own:

```xml
<Path Data="{StaticResource SrIconNavSearch}"
      Stroke="{AppThemeBinding Light={StaticResource SrColorTextPrimary},
                               Dark={StaticResource SrColorTextPrimaryDark}}"
      StrokeThickness="1" StrokeLineCap="Round" StrokeLineJoin="Round"
      Aspect="Uniform" HeightRequest="16" WidthRequest="16" />
```

Leave `Fill` unset. These are outline icons, and filling them closes shapes that
are meant to read as strokes.

**On `Label`, prefer `StyleClass` over `Style`.** An explicit `Style` *replaces*
the implicit `Label` style, silently dropping the font family, the themed text
colour and the disabled visual state. `StyleClass` composes on top of it, and
takes a list: `StyleClass="Caption,Muted"`.

## The build is a conformance gate

`npm run build:maui` regenerates `Colors.xaml` and `Icons.xaml`, then **fails**
on any of:

| Check | Catches |
|---|---|
| `build.mjs` | `Styles.xaml` referencing a resource that does not exist, or hard-coding a colour — a hex value or a named one such as `Red`. `Transparent` is allowed: it is the absence of a colour, not a choice of one. |
| `build.mjs` | A resource that differs between light and dark but has no simple value, so no `Dark` twin can be generated for it |
| `verify-icons.mjs` | Any icon whose emitted geometry does not visit the same points as its source SVG |
| `verify-xaml.mjs` | Consuming XAML that is malformed, references a missing `StaticResource` or `StyleClass`, or hard-codes a colour |
| `verify-xaml.mjs` | Any `.xaml`, `.csproj`, `.props` or `.targets` file with an illegal XML comment — one containing `--` or ending in `-`. Easy to write the moment a comment quotes a command line, and it stops the file parsing at all (MSBuild reports MSB4025 a long way from the cause). |

All of it runs as part of `npm run check`.

## Seeing it on a device

`testbed/` is a MAUI app that puts this layer on real hardware — see
`testbed/README.md`. Route 1 is a GitHub Actions run that hands you an APK with
nothing to install locally.

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

`SrDocumentViewer`'s API and visual contract are specified in
`components/document-viewer/`.

**Status:** Tokens, icons and styles all generate and verify. `Styles.xaml`
covers typography, surfaces, buttons, form fields and status treatments, and
`testbed/` composes a real screen from them.

Not done yet, in rough order:

- **Run the testbed on a device.** Nothing here has been compiled. It is
  validated as well-formed XAML with every reference resolving and every icon
  geometry checked against its source, which catches typos and drift but not
  layout. `testbed/README.md` Route 1 produces an APK from CI.
- **Test at 200% system font scale.** Every text-bearing style uses
  `MinimumHeightRequest`, but that needs proving rather than asserting.
- **Bundle Roboto-Medium.** SR's `label` and `heading-xs` are 500 weight, and
  MAUI's `FontAttributes` has no medium — both currently render regular.
- **Add a `surface.header` semantic.** Header and bottom-bar chrome is neither a
  card nor the page background, and currently borrows `surface.section-cards`.
- **Reconcile dark mode.** `surface.small-cards` is a saturated teal (`#0c7b99`)
  in dark mode, which turns the stat cards teal beneath a navy section card. It
  passes contrast; it is very likely not intended.
- **The Syncfusion theming layer** — `SfPdfViewer` wrapped as
  `SrDocumentViewer` against the spec, and default theming for whatever else
  survives the wrap-or-build decision.
- **Native components** for the vocabulary the design system already specifies
  and MAUI has no stock equivalent of. `Stat Card`, `Dashboard/Row cards` and the
  week strip are drawn in Figma, composed by hand in the testbed, and have no
  spec — the first candidates.
