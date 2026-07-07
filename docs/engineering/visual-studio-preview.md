# Previewing SR Components in Visual Studio — Blazor + MAUI, one gallery

How to stand up a **single Visual Studio solution** that previews the design
system's Blazor components in a **web** host *and* in a **native MAUI** shell —
from **one shared component source**. This is the "one previewer for all" goal.

> **Scope & honesty:** this guide is written to be followed in Visual Studio,
> where the project templates generate workload-correct project files. The repo
> does **not** yet contain these .NET projects (see *Current state*), and they
> are not committed pre-built. Create them once via the steps below; after that
> it's open-solution-and-F5.

---

## The idea: one component source, many hosts

```
packages/blazor  →  Razor Class Library (RCL): SrButton, future components
                         │  referenced by
        ┌────────────────┴───────────────────┐
   Blazor Web host                     MAUI Blazor Hybrid host
   (browser preview,                   (native Windows/Android shell,
    later → GitHub Pages)               hot reload, in Visual Studio)
        └──────────────── both render the SAME components ─────────────┘
        both pull the SAME tokens.css + component CSS (design-to-publish preview)
```

You write each component **once** (in the RCL). Two thin host apps render it —
one in a browser, one as a native app. That native host is what gives you the
"MAUI preview" today.

---

## Current state (what exists vs what you'll create)

| Piece | State today |
|---|---|
| `packages/blazor/src/Button/` | `SrButton.razor` (+ `.razor.css`), `ButtonType.cs`, `ButtonSize.cs` exist. Namespace `DHCW.SingleRecord.Components`. **No `.csproj`** — not yet a compilable project. |
| `packages/maui` | README only — **no components**. Nothing to preview as native MAUI XAML yet. |
| Solution / host apps | **None.** No `.sln`. |
| Tokens | `npm run build:tokens` → `packages/tokens/build/css/tokens.css` (+ `tokens-dark.css`) and `packages/tokens/build/xaml/Tokens.xaml` (+ `Tokens.Dark.xaml`). |
| Component CSS | `packages/web/src/button/button.css` — classes `sr-button`, `sr-button--{type}`, `sr-button--{size}`. **Note:** `packages/web/package.json` `main` points at `src/index.css`, which does **not** exist yet — there is no aggregated CSS bundle, so hosts reference component CSS files individually for now. |

Because MAUI has no native controls yet, **"MAUI preview" = the MAUI Blazor
Hybrid host rendering the Blazor RCL natively.** When real MAUI XAML controls
land in `packages/maui`, you preview those with XAML **Hot Reload / Live
Preview** in this same solution.

---

## Prerequisites (one-time)

1. **Visual Studio 2022** (17.8 or newer).
2. **.NET 8 SDK** (LTS) — recommended for MAUI stability. (.NET 9 works if you
   already have it; keep all projects on the same TFM.)
3. **VS workloads** — Installer → *Modify* → *Workloads*, tick:
   - **ASP.NET and web development** (Blazor web host)
   - **.NET Multi-platform App UI development** (MAUI + Blazor Hybrid)
4. **Node** — so the tokens exist: run `npm install && npm run build:tokens` at
   the repo root. The hosts consume the generated `tokens.css`.

---

## Suggested layout

Keep the preview **host apps** out of `packages/` (those are published libraries;
the hosts are dev-only). Put them in a top-level `preview/` folder; the RCL stays
in `packages/blazor`.

```
packages/blazor/            → RCL (the components)      [published later as NuGet]
preview/
  SingleRecord.Preview.sln  → open THIS in Visual Studio
  BlazorGallery/            → Blazor Web host
  MauiGallery/              → MAUI Blazor Hybrid host
  Shared/Gallery.razor      → the variant matrix, rendered by both hosts
```

---

## Step 1 — Turn `packages/blazor` into a Razor Class Library

Create `packages/blazor/DHCW.SingleRecord.Components.csproj`:

```xml
<Project Sdk="Microsoft.NET.Sdk.Razor">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <RootNamespace>DHCW.SingleRecord.Components</RootNamespace>
  </PropertyGroup>
  <ItemGroup>
    <SupportedPlatform Include="browser" />
    <PackageReference Include="Microsoft.AspNetCore.Components.Web" Version="8.0.*" />
  </ItemGroup>
</Project>
```

Add `packages/blazor/_Imports.razor`:

```razor
@using Microsoft.AspNetCore.Components.Web
@using DHCW.SingleRecord.Components
```

**Bring the design-system CSS in as RCL static web assets** (the
`GovUk.Frontend.AspNetCore` pattern the README references). Put the CSS the
gallery needs under `packages/blazor/wwwroot/css/`:

- `tokens.css` (copy from `packages/tokens/build/css/`)
- `tokens-dark.css`
- `button.css` (copy from `packages/web/src/button/`) — add more component CSS as you add components

Any host that references the RCL then serves these at
`_content/DHCW.SingleRecord.Components/css/…`.

> **Keep CSS in sync, don't fork it.** The source of truth stays in
> `packages/web` + `packages/tokens/build`. Add an MSBuild copy step so the
> wwwroot copies refresh on every build:
> ```xml
> <Target Name="CopySrCss" BeforeTargets="Build">
>   <ItemGroup>
>     <SrCss Include="..\tokens\build\css\tokens*.css" />
>     <SrCss Include="..\web\src\**\*.css" Exclude="..\web\src\**\*.stories.*" />
>   </ItemGroup>
>   <Copy SourceFiles="@(SrCss)" DestinationFolder="wwwroot\css" SkipUnchangedFiles="true" />
> </Target>
> ```
> (Or copy manually the first time if you prefer to keep the csproj minimal.)

---

## Step 2 — Blazor Web host (browser preview → later, Pages)

In VS: **New Project → Blazor Web App** (interactive server is simplest), or
**Blazor WebAssembly Standalone** if you want a static build for GitHub Pages.
Put it in `preview/BlazorGallery`. Then:

1. **Add a project reference** to `packages/blazor/DHCW.SingleRecord.Components.csproj`.
2. In the host's main page (`App.razor` / `index.html` head), **link the CSS**:
   ```html
   <link rel="stylesheet" href="_content/DHCW.SingleRecord.Components/css/tokens.css" />
   <link rel="stylesheet" href="_content/DHCW.SingleRecord.Components/css/button.css" />
   ```
3. Render the shared gallery (Step 4) on the home page.
4. **F5** → the component matrix in your browser.

Later this host is also your **Blazor WASM gallery** (a standing handoff item):
`dotnet publish` → `wwwroot` → `upload-pages-artifact`, published alongside
Storybook (e.g. at a `/blazor/` subpath), consistent with the preview/publish
split in **DDR-014**.

---

## Step 3 — MAUI Blazor Hybrid host (native preview in VS)

In VS: **New Project → .NET MAUI Blazor Hybrid App** → `preview/MauiGallery`.
The template creates a `BlazorWebView` that hosts Razor components in a native
shell. Then:

1. **Add a project reference** to the RCL.
2. In `wwwroot/index.html` head, link the same CSS as Step 2
   (`_content/DHCW.SingleRecord.Components/css/…`).
3. Replace the sample `Components/Pages/Home.razor` (or `Main.razor`) content
   with the **shared gallery** (Step 4) — the *same* markup the web host uses.
4. Set the debug target to **Windows Machine** (fastest) or an Android emulator,
   and **F5**. A native window opens rendering the SR components. **.NET Hot
   Reload** applies C#/Razor edits live.

This is your MAUI preview. When native XAML controls arrive in `packages/maui`,
add that library to the solution and preview it with **XAML Hot Reload** and
**Live Preview** — no separate tool needed.

---

## Step 4 — the shared gallery (write the preview once)

Create `preview/Shared/Gallery.razor` (add it as a linked file to both hosts, or
place it in the RCL so both get it for free):

```razor
@using DHCW.SingleRecord.Components

<h1>SR Button</h1>
@foreach (var size in Enum.GetValues<ButtonSize>())
{
    <h2>@size</h2>
    <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap; margin-bottom:16px;">
        @foreach (var type in Enum.GetValues<ButtonType>())
        {
            <SrButton Type="type" Size="size">@type</SrButton>
            <SrButton Type="type" Size="size" Disabled="true">@type disabled</SrButton>
        }
    </div>
}
```

Both hosts render this identically — so the gallery is authored once and previews
on web and native from the one solution.

---

## Step 5 — one solution to open

Create `preview/SingleRecord.Preview.sln` and add all three projects (RCL,
BlazorGallery, MauiGallery). Open **that** in Visual Studio. To preview:

- **Right-click a host → Set as Startup Project → F5.** Switch startup project to
  flip between web and native preview.
- Or use VS's startup-project dropdown to pick the host you want.

That single solution is your "one previewer for all."

---

## Keeping preview in sync with the design system

The hosts consume the generated `tokens.css` + component CSS. After any token or
component change: `npm run build:tokens` (and re-copy CSS if you didn't wire the
MSBuild target), then rebuild the host. This mirrors the **DDR-014** rule that
the *preview* surface tracks current work, while the *published* website tracks a
release tag.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| MAUI project won't create/build | MAUI workload not installed | VS Installer → Modify → tick *.NET MAUI development*; or `dotnet workload install maui` |
| Components render unstyled | CSS not served / not built | Confirm `npm run build:tokens` ran and the CSS is under the RCL `wwwroot/css`; check the `_content/DHCW.SingleRecord.Components/css/…` paths resolve (F12 → Network) |
| `_content/...` 404 | Host doesn't reference the RCL, or CSS not in `wwwroot` | Add the project reference; ensure CSS files sit in the RCL's `wwwroot` |
| Windows target greyed out | Not on Windows / missing Windows SDK | Use an Android emulator target, or run on a Windows machine |
| CSS edits don't hot-reload | Static CSS isn't part of .NET Hot Reload | Re-run the host; for rapid CSS iteration use the **web** host (browser refresh) |
| TFM/version conflicts | Mixed .NET versions across projects | Put RCL + both hosts on the **same** TFM (`net8.0` / `net8.0-*`) |

---

## Out of scope / follow-ups

- **No native MAUI XAML controls exist yet** — `packages/maui` is a placeholder;
  there is nothing native to preview until controls are built.
- **`packages/web` has no aggregated `index.css`** (its `main` points at a
  missing file) — until one exists, hosts link component CSS individually. Worth
  creating an `index.css` that `@import`s each component so hosts add one link.
- **This environment has no .NET SDK**, so these projects can't be built or
  verified here — they are created and run in Visual Studio on your machine.
- Publishing the Blazor gallery to GitHub Pages (WASM) is a separate step aligned
  with DDR-014's preview/publish model.
