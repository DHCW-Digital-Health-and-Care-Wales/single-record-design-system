# DHCW.SingleRecord.Blazor

The DHCW Single Record Design System's **token and style layer for Blazor**.

Generated from the same sources as the web CSS, so the two cannot drift.

## What this is, and is not

It ships stylesheets, not Razor components. You write your own markup using the
`sr-*` classes, exactly as an HTML consumer does. That is the same shape as
`DHCW.SingleRecord.Maui`, which ships resource dictionaries rather than
controls.

## Install

```
dotnet add package DHCW.SingleRecord.Blazor
```

The feed is GitHub Packages, which requires authentication even for public
packages. You need a `nuget.config` and a token with `read:packages`:

```xml
<configuration>
  <packageSources>
    <add key="dhcw" value="https://nuget.pkg.github.com/DHCW-Digital-Health-and-Care-Wales/index.json" />
  </packageSources>
  <packageSourceCredentials>
    <dhcw>
      <add key="Username" value="YOUR_GITHUB_USERNAME" />
      <add key="ClearTextPassword" value="YOUR_TOKEN_WITH_read:packages" />
    </dhcw>
  </packageSourceCredentials>
</configuration>
```

## Use

In `App.razor` or `_Host.cshtml`, in this order:

```html
<link rel="stylesheet" href="_content/DHCW.SingleRecord.Blazor/css/single-record.css" />

<!-- Dark mode is opt-in and must load SECOND: it overrides the tokens above. -->
<link rel="stylesheet" href="_content/DHCW.SingleRecord.Blazor/css/single-record-dark.css" />
```

Then set `data-theme="dark"` on `<html>` to switch.

Then write markup:

```razor
<button class="sr-button sr-button--primary" @onclick="Confirm">Confirm patient</button>
```

## What is in the package

| File | For |
|---|---|
| `css/single-record.css` | Everything: font, tokens, type utilities, all components |
| `css/single-record-dark.css` | Dark-mode token overrides. Opt-in, load second |
| `css/foundations.css` | Tokens and type only, no components |
| `css/sprite.svg` | The icon set, for `<use>` references |
| `css/components/*.css` | One component at a time, if you do not want the bundle |

## Version

0.2.1-rc.0, versioned in lockstep with the npm packages and
`DHCW.SingleRecord.Maui` — one version number describes the whole design system.
