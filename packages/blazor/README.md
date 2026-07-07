# @dhcw/sr-blazor

Razor component library for the DHCW Single Record Design System.

Razor components wrapping `@dhcw/sr-web` HTML/CSS, consuming `@dhcw/sr-tokens` CSS custom properties. Published as a NuGet package.

Follows the pattern established by `GovUk.Frontend.AspNetCore` — Razor Tag Helpers that auto-host the design system's CSS/JS/fonts.

**Status:** In progress — Button (`SrButton`) is the first component. Now a
buildable Razor Class Library (`DHCW.SingleRecord.Components.csproj`, net8.0) with
a shared `<Gallery />` and the design-system CSS bundled as static web assets
(`wwwroot/css`, served at `_content/DHCW.SingleRecord.Components/css/…`).

To preview in Visual Studio (Blazor web + native MAUI), see
[`docs/engineering/visual-studio-preview.md`](../../docs/engineering/visual-studio-preview.md).

## Usage

```razor
@using DHCW.SingleRecord.Components

<SrButton Type="ButtonType.Primary" Size="ButtonSize.Large" OnClick="HandleSave">
    Save record
</SrButton>

<SrButton Type="ButtonType.Destructive" OnClick="HandleDelete">
    Delete record
</SrButton>
```

## Prerequisites

The host app must include `button.css` from `@dhcw/sr-web` and the generated `tokens.css` from `@dhcw/sr-tokens` in its stylesheet bundle.

## Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `Type` | `ButtonType` | `Primary` | Visual type (Primary, Secondary, Ghost, Destructive) |
| `Size` | `ButtonSize` | `Default` | Height variant (Large, Default, Small) |
| `Disabled` | `bool` | `false` | Disabled state |
| `LeadingIcon` | `RenderFragment?` | `null` | Optional leading icon slot |
| `TrailingIcon` | `RenderFragment?` | `null` | Optional trailing icon slot |
| `OnClick` | `EventCallback<MouseEventArgs>` | — | Click handler |

## Preview

Blazor components cannot render in the Storybook (HTML/JS) catalogue. Preview
them in Visual Studio instead: add a Blazor Web host and/or a MAUI Blazor Hybrid
host, reference this library, and render `<Gallery />`. Full steps in
[`docs/engineering/visual-studio-preview.md`](../../docs/engineering/visual-studio-preview.md).
