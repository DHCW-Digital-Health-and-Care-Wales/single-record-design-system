# Changelog

Releases are announced by the design lead. There is no fixed cadence — a release
happens when there is something worth shipping.

**Versions are pinned in your `package.json`, deliberately.** Nothing changes
under you. To take a new release, change the version in all four tarball URLs
and run `npm install`.

The system is **0.x**. Minor bumps may contain breaking changes; where they do,
this file says so and tells you what to change.

| Marker | Means |
|---|---|
| **Action needed** | You have to change something to take this release |
| **Optional** | Worth doing, but the previous release keeps working |
| **No action** | Take it and carry on |

---

## Unreleased

**No action.** Take it and carry on.

### Changed

- **Icons are now 1px, not 2px (DDR-023). Every icon in every product changes
  weight.** Lucide ships a 2px stroke and the design system had taken it
  wholesale; the Figma library had already moved to 1px — 121 of 125 components
  — and nothing recorded the divergence. 2px read heavier than the text beside
  it, most visibly on the design-system website.

  **No action needed:** no markup, class name, token or prop changes. Icons
  simply render lighter.

  One thing to know: at 16px a 1px stroke resolves to about two-thirds of a
  device pixel and goes visibly light. **Prefer 20px or 24px for any icon that
  carries meaning on its own**; 16px is fine beside a text label. Do not
  reintroduce a per-size stroke — size the control up instead.

- **DDR-022 records when to wrap a third-party component on web.** The test is
  behavioural complexity, not component importance: build on native elements,
  wrap for keyboard interaction models. Menu, Tabs and Autocomplete are now
  blocked on a library evaluation rather than hand-built; Select stays as it is.
  Summarised for engineers in `docs/for-engineers.md` → "Wrapped or built?".

- **The DHCW logo is now the real lockup.** `logoFullSrc` used to return a drawn
  placeholder — a blue square with a diamond in it. It now returns the official
  GIG Cymru / NHS Wales / Digital Health and Care Wales lockup. Anything
  rendering it picks up the change with no code edit; expect the mark to look
  different, and to be wider than the placeholder at the same height.
- The lockup is a PNG rather than a vector. That was the deliberate choice:
  the artwork is trademarked and accuracy matters more than file size here.
- **The icon-only mark is now real too.** `logoSymbolSrc` — used by mobile
  headers and by navigation when it is collapsed — used to render a generic
  square-and-diamond. It now returns the official DHCW icon, taken from the
  Figma Logos component's own vector geometry rather than cropped out of the
  lockup. Unlike the lockup it is an SVG, so it stays sharp at any size.

### Added

- `logoSymbolInverseSrc` — the icon-only mark in white, for dark or coloured
  backgrounds. Use it instead of recolouring `logoSymbolSrc` with CSS; the
  brand rules forbid recolouring the artwork.
- **Checkbox, Radio and Select now have website pages**, each with usage
  guidance, every state, and copyable HTML, React, Blazor and MAUI markup. All
  three had code but nowhere documenting when to reach for which; each page now
  opens with the same "which one" table so the choice between them is the first
  thing you see.
- **`DHCW.SingleRecord.Maui` publishes to GitHub Packages (DDR-024).** A MAUI app
  installs it with `dotnet add package` instead of building it out of a checkout.
  **Action needed for MAUI teams:** the feed requires authentication for every
  install, including public packages — add a `nuget.config` and a token with
  `read:packages`. That is deliberate rather than an oversight: the package
  carries NHS Wales and DHCW brand marks that its MIT licence does not cover.
  Setup is on the "Get the files" page.
- **The npm packages stay on release tarballs, and still need URL edits per
  release.** GitHub Packages was considered and rejected for them: it would
  require the scope to be renamed away from `@dhcw`, and it would put a token in
  every developer's `.npmrc` for what is currently a credential-free install.
  DDR-024 records the reasoning and names npmjs.org as the escape hatch.
- **`DHCW.SingleRecord.Maui` on NuGet — MAUI apps no longer copy XAML by hand.**
  Ships `SrColors`, `SrIcons` and `SrStyles` as typed ResourceDictionaries, plus
  the brand marks registered as `MauiImage` automatically. npm cannot serve
  .NET; this is the route for a MAUI app. Merge `SrStyles` **last** — it
  references keys from the other two. Copying the XAML by hand still works; the
  merge syntax differs between the two routes.
- **Three new icons: `action/star`, `schedule/bookmark`, `file/pin`.** 123 icons
  now, across web, React, the sprite and MAUI.
- **Brand marks for NHS Wales, Welsh Clinical Portal and WNCR.** Nine logo
  variants extracted from Figma and shipped from `@dhcw/sr-web`, as data URIs
  (`nhsWalesLogoSrc`, `wcpSymbolSrc`, and so on) and as real files under
  `@dhcw/sr-web/logos`. Previously only the DHCW marks existed, so no product
  or co-brand mark could be rendered at all.
- **Brand marks are not icons and are not in `@dhcw/sr-icons`.** Icons inherit
  `currentColor` and are meant to be recoloured; brand marks must never be. Each
  mark ships as one file per ink — pick the variant that suits the background
  rather than recolouring.
- **Three new Radio types — `card-radio`, `card`, and `card-icon`.** An option
  that needs a line of explanation was previously unbuildable. Pass `type` and
  `description` to `<Radio>`, or use the `sr-radio--card` classes. The plain
  radio is unchanged and stays the default.

### Known gap

- **`UEC` has no asset**, so Urgent and Emergency Care cannot render its own
  mark. Its Figma artwork needs fixing first — the icons have unfilled vectors,
  the lockups carry live text.
- **`wncr` is white only**, so a WNCR mark cannot go on a light background. Its
  navy variant is drawn with strokes and cannot be exported until outlined.

---

## v0.1.1 — 2026-08-12

**Optional.** v0.1.0 keeps working. Two of these are worth taking when you have
a moment.

### Added

- **Tags is published**, with a component page on the website covering all three
  variants: `status` (a filled pill), `filter` (an outlined pill with a close
  button) and `count` (a 24px disc holding a number).
- **`Tags/count` is new in code.** It existed in Figma and had never been built —
  seven types including a Dark Blue reserved for the one primary total on a
  screen. Past two digits the circle becomes a pill rather than clipping the
  number.
- **`@dhcw/sr-web/foundations`** — the font, the tokens and the typography
  utilities with no component CSS.

### Changed

- **React apps should import `foundations`, not `single-record.css`:**

  ```diff
  - import '@dhcw/sr-web/dist/single-record.css';
  + import '@dhcw/sr-web/foundations';
  ```

  Every React component already imports its own stylesheet, so the complete file
  was shipping all 21 component stylesheets *plus* a duplicate of each one you
  used. On a screen using seven components that is **238KB before, 131KB
  after** — identical styling, 45% less of it.

  Nothing renders differently. If you do not make this change, everything keeps
  working exactly as it does now.

  **Plain HTML keeps `single-record.css`.** With no bundler there is nothing to
  assemble the per-component files, and one `<link>` working is the whole point
  of that file.

- **Internal version pins are now ranges rather than exact.** `@dhcw/sr-web`
  pinned its siblings to an exact `0.1.0`, so a version bump had to move all
  four packages in lockstep or npm went looking for a version that is on no
  registry and the install failed. This only affected releases, not consumers.

### Fixed

- **`@dhcw/sr-tokens` had no entry points**, so every import of it failed —
  including the CSS files that are the package's whole purpose.

---

## v0.1.0 — 2026-08-11

The first installable release. **Action needed if you followed an earlier
guide** — see below.

### Added

- **Packages ship as tarballs attached to each GitHub release**, installable
  with plain npm: no registry, no credentials, nothing in `.npmrc`, and the same
  behaviour in Azure DevOps CI.

  ```json
  "dependencies": {
    "@dhcw/sr-tokens": ".../releases/download/v0.1.0/dhcw-sr-tokens-0.1.0.tgz",
    "@dhcw/sr-icons":  ".../releases/download/v0.1.0/dhcw-sr-icons-0.1.0.tgz",
    "@dhcw/sr-web":    ".../releases/download/v0.1.0/dhcw-sr-web-0.1.0.tgz",
    "@dhcw/sr-react":  ".../releases/download/v0.1.0/dhcw-sr-react-0.1.0.tgz"
  }
  ```

  All four are required — the React package depends on the other three.

- **A native .NET MAUI token and style layer** (`Colors.xaml`, `Styles.xaml`,
  `Icons.xaml`), and 120 icons as XAML path geometry so an icon takes its colour
  from a token and follows the theme. MAUI is native XAML throughout; there is no Blazor Hybrid anywhere in the
  mobile estate.

- **`SrDocumentViewer` specification** — the API and visual contract for the PDF
  viewer wrapper, for a developer with a Syncfusion licence to implement.

### Fixed

- **The documented npm install never worked.** Both of these fetch the
  repository *root*, which is a private workspace container with no entry point:

  ```
  npm install github:DHCW-.../single-record-design-system#main
  "@dhcw/sr-react": "github:DHCW-.../single-record-design-system#main"
  ```

  They appear to install and then throw `ERR_MODULE_NOT_FOUND` on import. npm
  cannot install a single workspace out of a git repository.

  **If your `package.json` still has a `github:` dependency, or your Vite config
  has `resolve.alias` entries pointing inside `node_modules/@dhcw`, replace them
  with the tarball URLs above and delete the aliases.**

- **`@dhcw/sr-web/dist/single-record.css` was not importable.** An `exports` map
  is a closed list, and `./dist/*` was missing — so the path every guide printed
  threw `ERR_PACKAGE_PATH_NOT_EXPORTED` even though the file was right there.

- **Missing subpath exports** on `@dhcw/sr-react` for `autocomplete`, `radio`,
  `select` and `tags`. The barrel import worked; `@dhcw/sr-react/select` did not.

### Known gaps

- `modal` and `tags` are built with no website page *(tags landed in v0.1.1)*.
- `status-indicator` is built and undocumented.
- `link`, `progress-indicators` and `search` are specified but not built.
- Dark mode tokens are provisional and not yet reconciled.

The website records the full picture of what is documented, built and
published.
