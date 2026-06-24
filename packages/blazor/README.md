# @dhcw/sr-blazor

Razor component library for the DHCW Single Record Design System.

Razor components wrapping `@dhcw/sr-web` HTML/CSS, consuming `@dhcw/sr-tokens` CSS custom properties. Published as a NuGet package.

Follows the pattern established by `GovUk.Frontend.AspNetCore` — Razor Tag Helpers that auto-host the design system's CSS/JS/fonts.

**Status:** In progress — Button (`SrButton`) is the first component.

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

Blazor components cannot render in the Storybook (HTML/JS) catalogue. For live preview, use the `dotnet watch` dev server with the companion test app (to be scaffolded), or the Blazor component playground in Visual Studio.
