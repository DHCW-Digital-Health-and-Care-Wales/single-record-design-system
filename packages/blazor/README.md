# @dhcw/sr-blazor

The Single Record Design System's **token and style layer for Blazor**.

Two projects live here and they do different jobs:

| | |
|---|---|
| `nuget/DHCW.SingleRecord.Blazor.csproj` | **GENERATED**, and what ships. Stylesheets only. |
| `DHCW.SingleRecord.Components.csproj` | The preview gallery — `SrButton` and `Gallery.razor`, for the Visual Studio host. Never packed. |

## The package is a style layer, not a component library

It ships stylesheets. A Blazor consumer writes their own markup with the `sr-*`
classes, exactly as an HTML consumer does.

That is the same shape as `DHCW.SingleRecord.Maui`, which ships resource
dictionaries rather than controls, and it is deliberate: shipping one Razor
component out of twenty-one would imply a component set that does not exist.
When one does, it can be added here without changing how the styles are consumed.

## Nothing under `nuget/` is hand-maintained

`build-nuget.mjs` generates the whole project from `packages/web/dist`, which is
itself built from the tokens and component sources. Editing it is silently
overwritten on the next build.

```
npm run build:blazor
```

This replaced a hand copy under `packages/blazor/wwwroot/`, refreshed by commands
written in the csproj as a comment that nothing ran. It drifted, and it carried
three stylesheets where a web consumer got twenty-one components.

## What a consumer gets

| File | For |
|---|---|
| `css/single-record.css` | Everything: font, tokens, type utilities, all components |
| `css/single-record-dark.css` | Dark-mode overrides. Opt-in, **load second** |
| `css/foundations.css` | Tokens and type only, no components |
| `css/sprite.svg` | The icon set, for `<use>` references |
| `css/components/*.css` | One component at a time |

Served at `_content/DHCW.SingleRecord.Blazor/css/…`.

## Version

Lockstep with the npm packages and `DHCW.SingleRecord.Maui` — one version number
describes the whole design system, and `npm run check:versions` enforces it.
