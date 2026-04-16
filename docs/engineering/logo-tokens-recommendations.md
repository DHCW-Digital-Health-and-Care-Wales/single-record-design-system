# Logo Tokens — Code Recommendations

**Status:** For review — no implementation has been applied yet  
**Scope:** Logos component, logo sizing tokens, platform-specific consumption  
**Related:** `foundations/tokens/logo-sizing.json`, Figma Logos component (`270:2850`)

---

## Token Structure (Tokens Studio export)

Below is the JSON structure that Tokens Studio would export for the logo sizing token set. This follows the W3C DTCG format and matches `foundations/tokens/logo-sizing.json`.

```json
{
  "size": {
    "logo": {
      "xs":  { "$type": "dimension", "$value": "24px" },
      "sm":  { "$type": "dimension", "$value": "32px" },
      "md":  { "$type": "dimension", "$value": "48px" },
      "lg":  { "$type": "dimension", "$value": "64px" },
      "xl":  { "$type": "dimension", "$value": "80px" },
      "2xl": { "$type": "dimension", "$value": "96px" },
      "icon": {
        "default":   { "$type": "dimension", "$value": "{size.logo.sm}" },
        "compact":   { "$type": "dimension", "$value": "{size.logo.xs}" },
        "prominent": { "$type": "dimension", "$value": "{size.logo.md}" }
      },
      "full": {
        "default":   { "$type": "dimension", "$value": "{size.logo.md}" },
        "compact":   { "$type": "dimension", "$value": "{size.logo.sm}" },
        "prominent": { "$type": "dimension", "$value": "{size.logo.lg}" }
      }
    }
  },
  "logo": {
    "icon": {
      "size":   { "$type": "dimension", "$value": "{size.logo.icon.default}" }
    },
    "full": {
      "height": { "$type": "dimension", "$value": "{size.logo.full.default}" }
    }
  }
}
```

---

## Platform Implementations

### CSS Custom Properties (Blazor / web)

Output from a Style Dictionary or Tokens Studio W3C → CSS transform.

```css
/* ── Global (primitives) ── */
--size-logo-xs:  24px;
--size-logo-sm:  32px;
--size-logo-md:  48px;
--size-logo-lg:  64px;
--size-logo-xl:  80px;
--size-logo-2xl: 96px;

/* ── Alias (semantic intent) ── */
--size-logo-icon-default:   var(--size-logo-sm);   /* 32px */
--size-logo-icon-compact:   var(--size-logo-xs);   /* 24px */
--size-logo-icon-prominent: var(--size-logo-md);   /* 48px */
--size-logo-full-default:   var(--size-logo-md);   /* 48px */
--size-logo-full-compact:   var(--size-logo-sm);   /* 32px */
--size-logo-full-prominent: var(--size-logo-lg);   /* 64px */

/* ── Component ── */
--logo-icon-size:   var(--size-logo-icon-default);  /* 32px */
--logo-full-height: var(--size-logo-full-default);  /* 48px */
```

**Usage in Blazor components:**

```css
/* logo.razor.css — or shared component stylesheet */
.sr-logo--icon {
  height: var(--logo-icon-size);
  width: var(--logo-icon-size);     /* 1:1 aspect ratio */
  display: inline-block;
}

.sr-logo--full {
  height: var(--logo-full-height);
  width: auto;                       /* proportional — let the SVG viewBox handle it */
  display: inline-block;
}

/* Size overrides at usage point */
.sr-logo--compact  { --logo-icon-size: var(--size-logo-icon-compact); }
.sr-logo--prominent { --logo-icon-size: var(--size-logo-icon-prominent); }
```

---

### XAML Resource Dictionary (.NET MAUI)

```xml
<!-- LogoTokens.xaml — add to App.xaml ResourceDictionary -->
<ResourceDictionary xmlns="http://schemas.microsoft.com/dotnet/2021/maui"
                    xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml">

    <!-- Global primitives -->
    <x:Double x:Key="SizeLogoXs">24</x:Double>
    <x:Double x:Key="SizeLogoSm">32</x:Double>
    <x:Double x:Key="SizeLogoMd">48</x:Double>
    <x:Double x:Key="SizeLogoLg">64</x:Double>
    <x:Double x:Key="SizeLogoXl">80</x:Double>
    <x:Double x:Key="SizeLogo2xl">96</x:Double>

    <!-- Alias tokens -->
    <x:Double x:Key="SizeLogoIconDefault"
              x:FactoryMethod="Get"
              x:Arguments="{StaticResource SizeLogoSm}" />
    <!-- MAUI doesn't support aliasing in XAML natively;
         use the resolved values directly in production: -->
    <x:Double x:Key="SizeLogoIconCompact">24</x:Double>
    <x:Double x:Key="SizeLogoIconProminent">48</x:Double>
    <x:Double x:Key="SizeLogoFullDefault">48</x:Double>
    <x:Double x:Key="SizeLogoFullCompact">32</x:Double>
    <x:Double x:Key="SizeLogoFullProminent">64</x:Double>

    <!-- Component tokens -->
    <x:Double x:Key="LogoIconSize">32</x:Double>
    <x:Double x:Key="LogoFullHeight">48</x:Double>

</ResourceDictionary>
```

**Usage in MAUI views:**

```xml
<Image Source="dhcw_icon_light.svg"
       HeightRequest="{StaticResource LogoIconSize}"
       WidthRequest="{StaticResource LogoIconSize}"
       Aspect="AspectFit" />

<Image Source="dhcw_full_light.svg"
       HeightRequest="{StaticResource LogoFullHeight}"
       WidthRequest="Auto"
       Aspect="AspectFit" />
```

---

### C# Constants (older .NET, Delphi integration layer)

```csharp
namespace DHCW.SingleRecord.DesignSystem.Tokens
{
    /// <summary>
    /// Logo sizing tokens — DHCW Single Record Design System.
    /// Height is the controlled dimension; width scales proportionally.
    /// Source: foundations/tokens/logo-sizing.json
    /// </summary>
    public static class LogoTokens
    {
        // Global (primitives)
        public const double SizeLogoXs  = 24;
        public const double SizeLogoSm  = 32;
        public const double SizeLogoMd  = 48;
        public const double SizeLogoLg  = 64;
        public const double SizeLogoXl  = 80;
        public const double SizeLogo2Xl = 96;

        // Alias — icon variants
        public const double SizeLogoIconDefault   = SizeLogoSm;   // 32
        public const double SizeLogoIconCompact   = SizeLogoXs;   // 24
        public const double SizeLogoIconProminent = SizeLogoMd;   // 48

        // Alias — full lockup variants
        public const double SizeLogoFullDefault   = SizeLogoMd;   // 48
        public const double SizeLogoFullCompact   = SizeLogoSm;   // 32
        public const double SizeLogoFullProminent = SizeLogoLg;   // 64

        // Component tokens (what gets applied to the Logo component)
        public const double LogoIconSize   = SizeLogoIconDefault;  // 32
        public const double LogoFullHeight = SizeLogoFullDefault;  // 48
    }
}
```

---

## SVG Strategy Recommendations

### Use SVG with fill-based theming, not `currentColor`

DHCW logos use specific brand colours that must not inherit from their context. Using `currentColor` would cause the logo colour to change based on parent text colour, which breaks brand integrity.

**Recommended approach:** Two SVG files per brand, one per colour mode:

| File | Colours | Use case |
|---|---|---|
| `dhcw-icon-light.svg` | `#325083` fill | Light backgrounds |
| `dhcw-icon-dark.svg`  | `#ffffff` fill | Dark or coloured backgrounds |
| `dhcw-full-light.svg` | `#325083` fill | Light backgrounds |
| `dhcw-full-dark.svg`  | `#ffffff` fill | Dark or coloured backgrounds |

NHS Wales logos (`nhs-wales-*`) follow the same pattern but use `#325a8a` and `#d2ae7e` for light mode — these are NHS Wales brand colours and must not be altered.

### SVG file requirements

- All artwork must be **outlined paths** — no live text, no embedded fonts
- Each SVG must define a correct `viewBox` derived from the Figma frame dimensions
- `width` and `height` attributes should be **omitted** from the SVG root — sizing is controlled exclusively via CSS/XAML/C# tokens
- All path data must be clean: no overlapping fills, no strokes, no masks unless unavoidable
- Files should be run through an SVG optimiser (SVGO) with the following config: no `removeViewBox`, no `cleanupIds` (if IDs are used for masks)

### File naming convention

```
{subgroup}-{type}-{colour-mode}.svg

Examples:
  dhcw-icon-light.svg
  dhcw-full-dark.svg
  nhs-wales-icon-light.svg
  wcp-full-dark.svg
  wncr-icon-light.svg
```

### Delivery format

Do not use a sprite sheet for logos. Logos are brand assets and need to be individually auditable, replaceable, and accessible. Deliver as individual files in a `/assets/logos/` directory.

---

## Component Library Guidance

### Is a dedicated Logo component needed?

**Yes, for all platforms.** A component provides:

1. Consistent token consumption — size controlled by `LogoIconSize` / `LogoFullHeight` tokens, not hard-coded
2. Correct SVG selection — component handles light/dark mode switching based on the active theme
3. Accessibility — component sets correct `role="img"` and `aria-label` from a required prop
4. Future-proofing — adding a new subgroup only requires adding the SVG asset, not touching consumer code

### Minimum component API (all platforms)

| Prop | Type | Required | Default | Notes |
|---|---|---|---|---|
| `subgroup` | `dhcw \| nhs_wales \| wcp \| wncr` | Yes | — | More subgroups will be added; design extensibly |
| `type` | `icon \| full` | No | `icon` | |
| `size` | `compact \| default \| prominent` | No | `default` | Maps to alias token tier |
| `colourMode` | `light \| dark \| auto` | No | `auto` | `auto` follows app theme |
| `label` | `string` | Yes | — | Accessible name (`aria-label` / screen reader alt) |

### Blazor component sketch

```razor
@* SrLogo.razor *@
<img src="@SvgPath"
     height="@TokenHeight"
     alt="@Label"
     role="img"
     class="sr-logo sr-logo--@Type" />

@code {
    [Parameter, EditorRequired] public string Subgroup { get; set; } = default!;
    [Parameter, EditorRequired] public string Label    { get; set; } = default!;
    [Parameter] public string Type       { get; set; } = "icon";
    [Parameter] public string Size       { get; set; } = "default";
    [Parameter] public string ColourMode { get; set; } = "auto";

    private string SvgPath => $"/assets/logos/{Subgroup}-{Type}-{ResolvedMode}.svg";

    private string ResolvedMode =>
        ColourMode == "auto" ? (ThemeService.IsDark ? "dark" : "light") : ColourMode;

    private string TokenHeight => Size switch {
        "compact"   => Type == "icon" ? "24" : "32",
        "prominent" => Type == "icon" ? "48" : "64",
        _           => Type == "icon" ? "32" : "48",   // default
    };
}
```

### MAUI component sketch

```csharp
// SrLogoView.cs
public class SrLogoView : Image
{
    public static readonly BindableProperty SubgroupProperty = ...;
    public static readonly BindableProperty LogoTypeProperty = ...;
    public static readonly BindableProperty SizeVariantProperty = ...;

    public string Subgroup { ... }
    public LogoType LogoType { get; set; } = LogoType.Icon;
    public LogoSizeVariant SizeVariant { get; set; } = LogoSizeVariant.Default;

    protected override void OnPropertyChanged(string propertyName = null)
    {
        base.OnPropertyChanged(propertyName);
        Source = $"dhcw_{Subgroup}_{LogoType}_{CurrentColourMode}.svg";
        HeightRequest = SizeVariant switch {
            LogoSizeVariant.Compact   => LogoType == LogoType.Icon ? LogoTokens.SizeLogoIconCompact   : LogoTokens.SizeLogoFullCompact,
            LogoSizeVariant.Prominent => LogoType == LogoType.Icon ? LogoTokens.SizeLogoIconProminent : LogoTokens.SizeLogoFullProminent,
            _                        => LogoType == LogoType.Icon ? LogoTokens.LogoIconSize           : LogoTokens.LogoFullHeight,
        };
        Aspect = Aspect.AspectFit;
    }
}
```

---

## Open Issues (for engineering team review)

| # | Issue | Impact |
|---|---|---|
| 1 | `wcp/Full` contains live text layers in Figma ("Porth Clinigol Cymru" / "Welsh Clinical Portal"). SVG export will include live text — must be outlined before asset delivery. | High |
| 2 | `wncr/Icon/light` contains live TEXT "WNCR". Same issue — outline before export. | High |
| 3 | `nhs_wales/Icon/light` fill is in a broken state in Figma. Must be fixed before SVG export. | Critical |
| 4 | `wcp/Full` and `wncr/Full` have sub-pixel width differences between light/dark variants. Widths should be normalised before exporting SVGs to avoid layout shift in co-brand scenarios. | Medium |
| 5 | NHS Wales SVG files will have specific governance requirements from the NHS Wales brand team. Confirm approval process before any web publication. | Process |

These issues are tracked in the Figma audit (see audit report, pending design lead sign-off for visual fixes).
