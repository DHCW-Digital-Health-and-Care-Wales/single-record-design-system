# DHCW.SingleRecord.Maui

Native .NET MAUI token and style layer for the **DHCW Single Record Design
System** (NHS Wales).

This is a **token and style layer, not a component library**. Your app keeps its
own native controls; this package makes them look like Single Record. Everything
in it is generated from the same sources as the web CSS and the web icon set, so
MAUI and web cannot drift apart.

> **Why a NuGet package and not npm?** npm is JavaScript-only — there is no npm
> in the .NET toolchain, so a MAUI project cannot consume `@dhcw/sr-maui`
> directly. That package is what the design system *builds from*; this is what
> your app *installs*.

## Install

```
dotnet add package DHCW.SingleRecord.Maui
```

Targets `net8.0-android`, `net8.0-ios`, `net8.0-maccatalyst` and, on Windows,
`net8.0-windows10.0.19041.0`.

## Set up

Merge the three dictionaries in `App.xaml`. They are merged **by type**, not by
file path — that is how a ResourceDictionary in a referenced assembly works.

```xml
<Application xmlns="http://schemas.microsoft.com/dotnet/2021/maui"
             xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml"
             xmlns:sr="clr-namespace:DHCW.SingleRecord.Maui;assembly=DHCW.SingleRecord.Maui"
             x:Class="YourApp.App">
    <Application.Resources>
        <ResourceDictionary>
            <ResourceDictionary.MergedDictionaries>
                <sr:SrColors />
                <sr:SrIcons />
                <sr:SrStyles />
            </ResourceDictionary.MergedDictionaries>
        </ResourceDictionary>
    </Application.Resources>
</Application>
```

**Merge `SrStyles` last.** It references keys from the other two, so merging it
first fails at runtime with a `StaticResource not found`, not at build.

If your app already has its own `Colors.xaml` and `Styles.xaml`, merge those
*after* the Single Record ones so yours win where they overlap, and work through
the overrides as you adopt.

## What is in it

| Dictionary | Contents |
|---|---|
| `SrColors` | 210 resources — every primitive and semantic colour token, two elevation shadows, and a `…Dark` twin for the 16 semantics that change with the theme |
| `SrIcons` | 123 icons as XAML path geometry, one `x:String` per icon |
| `SrStyles` | Implicit styles for stock MAUI controls, keyed styles for intent variants, the `StyleClass` type scale, and `VisualStateManager` states |

### Colours

```xml
<Label TextColor="{AppThemeBinding Light={StaticResource SrColorTextPrimary},
                                   Dark={StaticResource SrColorTextPrimaryDark}}" />
```

### Icons

Icons ship as **geometry, not images**. MAUI will rasterise an SVG at build time
through `MauiImage`, but that bakes the colour into the PNG. These are outline
icons that must take their colour from a token and follow the theme, so they are
`Path` data instead:

```xml
<Path Data="{StaticResource SrIconNavSearch}"
      Stroke="{AppThemeBinding Light={StaticResource SrColorTextPrimary},
                               Dark={StaticResource SrColorTextPrimaryDark}}"
      StrokeThickness="1" StrokeLineCap="Round" StrokeLineJoin="Round"
      Aspect="Uniform" HeightRequest="24" WidthRequest="24" />
```

`Fill` is deliberately unset — filling closes shapes meant to read as strokes.

**On stroke weight:** icons are drawn at 1px on a 24×24 grid (DDR-023 — Lucide
ships 2px; Single Record overrides it). `StrokeThickness="1"` is correct at a
24px render. MAUI's `StrokeThickness` is a device-independent unit and does not
scale with `Aspect` the way SVG `stroke-width` scales inside a viewBox, so at
smaller sizes you may need a proportionally smaller value — **check this on a
device.** Prefer 20px or 24px for any icon that carries meaning on its own; at
16px a 1px stroke goes visibly light.

### Brand marks

The DHCW, NHS Wales, Welsh Clinical Portal and WNCR marks are included and
registered as `MauiImage` in your app automatically:

```xml
<Image Source="srsymwcpblue.png" HeightRequest="32" />
```

Note the **`.png`** extension: MAUI rasterises the source SVG at build time, so
you reference the output, not the input.

| Name | Mark |
|---|---|
| `srsymdhcwblue` / `srsymdhcwwhite` | DHCW knot |
| `srsymwcpblue` / `srsymwcpwhite` | Welsh Clinical Portal roundel |
| `srlogowcpblue` / `srlogowcpwhite` | WCP bilingual lockup |
| `srsymnhswalesblue` / `srsymnhswaleswhite` | GIG Cymru / NHS Wales knot |
| `srlogonhswalescolour` / `srlogonhswaleswhite` | NHS Wales lockup |
| `srsymwncrwhite` | WNCR — **white only** |

`sym` is the icon-only mark; `logo` is the full lockup. They are different
artwork: the icon is drawn separately and is **not** a crop of the lockup.

**Brand marks are not icons.** Each ships as one file per ink because the
artwork must never be recoloured — pick the variant that suits the background.
Do not stretch, rotate, recolour or crop; scale uniformly only.

Two gaps to know about: **WNCR has no navy mark**, so it cannot go on a light
background, and **Urgent and Emergency Care has no mark at all**. Both need
fixing in Figma before they can ship.

To opt out of the brand images entirely:

```xml
<PropertyGroup>
  <SrIncludeBrandImages>false</SrIncludeBrandImages>
</PropertyGroup>
```

## Accessibility

Colour tokens meet WCAG 2.2 AA in the pairings the design system documents.
That guarantee does not survive recombination — pairing an arbitrary text token
with an arbitrary surface token is not covered. Check any pairing the design
system does not already specify.

## Licence and provenance

MIT. Icons derive from [Lucide](https://lucide.dev) (ISC), redrawn to a 1px
stroke. Brand marks are the property of NHS Wales and DHCW and are **not**
covered by the MIT licence — they are trademarked artwork included for use in
Single Record products. NHS Wales marks need brand-team approval before any
public publication.

Source, decision records and the full documentation:
<https://github.com/Chuk-DCHW/dhcw-single-record-design-system>
