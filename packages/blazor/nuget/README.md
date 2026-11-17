# DHCW.SingleRecord.Blazor

The DHCW Single Record Design System's **token and style layer for Blazor**.

Generated from the same sources as the web CSS, so the two cannot drift.

## What this is, and is not

It ships stylesheets, not Razor components. You write your own markup using the
`sr-*` classes, exactly as an HTML consumer does. That is the same shape as
`DHCW.SingleRecord.Maui`, which ships resource dictionaries rather than
controls.

## Get access to the feed

The package is on GitHub Packages, which asks for a token on every install,
even for public packages. There is no special group to join. **Your GitHub
password will not work: it gets a 401.** You need a token instead.

1. **Create a classic personal access token.** GitHub → Settings → Developer
   settings → Personal access tokens → **Tokens (classic)** → Generate new
   token. Tick **`read:packages`**. Fine-grained tokens do not work with the
   GitHub Packages NuGet feed.
2. **Authorise the token for the organisation.** If the
   DHCW-Digital-Health-and-Care-Wales organisation uses single sign-on, click
   **Configure SSO** next to the token and authorise it. A token that is not
   authorised gets a 401 even with the right scope.
3. **Give the token to NuGet.** Either add a `nuget.config` beside your
   solution (below), or add the feed in Visual Studio (Tools → Options → NuGet
   Package Manager → Package Sources) and, when it asks you to sign in, enter
   your **GitHub username** and paste the **token as the password**.

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <packageSources>
    <add key="dhcw" value="https://nuget.pkg.github.com/DHCW-Digital-Health-and-Care-Wales/index.json" />
  </packageSources>
  <packageSourceCredentials>
    <dhcw>
      <add key="Username" value="YOUR_GITHUB_USERNAME" />
      <add key="ClearTextPassword" value="%GITHUB_PACKAGES_TOKEN%" />
    </dhcw>
  </packageSourceCredentials>
</configuration>
```

`%GITHUB_PACKAGES_TOKEN%` reads an environment variable, so the file is safe
to commit and the token is not in it. Set the variable locally, or from a
secret in your pipeline. Never commit the token itself.

### Still getting a 401?

| Check | Fix |
|---|---|
| You typed your GitHub password | Use the token as the password |
| The token is fine-grained | Make a **classic** token with `read:packages` |
| The token is not authorised for the organisation | **Configure SSO** next to the token on GitHub |
| Visual Studio saved an old login | Remove the `nuget.pkg.github.com` entry from Windows Credential Manager and sign in again |
| Your account cannot see the package | Ask the design system team to check you are in the organisation, or have an organisation admin give you read access under the package's **Package settings → Manage access** |

## Install

```
dotnet add package DHCW.SingleRecord.Blazor
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

0.6.0, versioned in lockstep with the npm packages and
`DHCW.SingleRecord.Maui` — one version number describes the whole design system.
