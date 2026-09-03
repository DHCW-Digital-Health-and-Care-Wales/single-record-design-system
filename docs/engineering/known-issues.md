# Engineering — Known Issues & Workarounds

Living reference of gotchas, limitations and confirmed workarounds hit while
building the code packages. Companion to `docs/figma-known-issues.md`, which
covers the Figma side; same format, same purpose.

Each entry records **what the problem is, why it happens, and the fix**. Where a
build check now makes the mistake impossible, the entry says so — that line is
the point of the document.

---

## How to use this, and how to add to it

**Read it** before starting work in a framework you have not touched recently.
The entries are things that cost someone hours and would cost the next person
the same.

**Add to it** when you hit something that (a) was not obvious from the code or
the docs, and (b) would plausibly catch someone else. Not every bug — only the
ones with a lesson.

**Prefer a gate to a paragraph.** A check that fails the build cannot be
forgotten; a paragraph can. If a finding is mechanisable, write the check and
then record it here with a **Prevented by** line. If it is not mechanisable, say
so explicitly — that is useful information in itself.

**Where this sits relative to the other logs:**

| Document | Answers | Organised by |
|---|---|---|
| `decisions/handoff.md` | "Where are we, what is open?" | Date |
| `decisions/DDR-*.md` | "Why is it like this?" | Decision |
| **This file** | **"What do we know about framework X?"** | **Topic** |

A finding recorded only in a handoff checkpoint is effectively lost: the file is
chronological and nearly two thousand lines, so nobody reads back through it
before writing MAUI. Promote findings out of the checkpoint and into here.

---

## .NET MAUI

### An explicit `Style` on a `Label` silently drops the implicit style

**Symptom:** A label with `Style="{StaticResource Something}"` loses its font
family, its themed text colour and its disabled visual state, even though the
style only set a font size.

**Why:** In MAUI an explicit `Style` **replaces** the implicit `TargetType`
style rather than layering on it. `Styles.xaml`'s implicit `Label` style carries
`FontFamily`, the `AppThemeBinding` text colour and the `VisualStateManager`
states, and all of it goes.

**Fix:** Use `StyleClass`, which composes on top of the implicit style and takes
a list:

```xml
<Label Text="April 2026" StyleClass="FieldLabel,Muted" />
```

Reserve `Style` for types where there is no implicit style worth keeping
(`Border`, `Path`, `BoxView`).

**Prevented by:** nothing — this is a silent behavioural difference, not an
error. It needs knowing.

---

### Medium font weight is unreachable

**Symptom:** Text that should be 500 weight (`sr.typography.label`,
`sr.typography.heading-xs`) renders regular.

**Why:** MAUI's `FontAttributes` offers `None`, `Bold` and `Italic`. There is no
medium.

**Fix:** Bundle `Roboto-Medium.ttf` and register it in `MauiProgram` as its own
family, then set `FontFamily` rather than `FontAttributes`. Until that happens,
do not rely on weight alone to distinguish anything — the bottom bar's current
destination is currently carried by colour only, which is a WCAG 1.4.1 risk if
it ever becomes the sole signal.

**Status:** Open.

---

### Roboto is free only on Android

**Symptom:** An iOS or Windows build silently renders everything in the system
face despite `FontFamily="Roboto"` throughout `Styles.xaml`.

**Why:** Roboto is the Android system font. Nowhere else.

**Fix:** Bundle `Roboto-Regular.ttf` and `Roboto-Bold.ttf` in
`Resources/Fonts` and register them before adding a non-Android target.

---

### The merge syntax depends on which way you consumed the design system

**Symptom:** `<sr:Colors />` fails to compile, or `Source="…"` cannot find the
dictionary — depending on which of the two install routes you took. Both syntaxes
are correct; neither is correct for both routes.

**Why:** The element form (`<sr:SrColors />`) instantiates a *type*, which needs
an `x:Class` on the dictionary and is the only form that works across an
assembly boundary. The `Source` form is a path lookup and only works within your
own project.

**Fix:** Match the syntax to the route.

**NuGet (`DHCW.SingleRecord.Maui`)** — merge by type. The packaged dictionaries
carry an `x:Class` precisely so this works:

```xml
xmlns:sr="clr-namespace:DHCW.SingleRecord.Maui;assembly=DHCW.SingleRecord.Maui"
...
<sr:SrColors />
<sr:SrIcons />
<sr:SrStyles />
```

**Copied files** — merge by `Source`, as the stock MAUI template does. The
copies in `packages/maui/` are plain dictionaries with no `x:Class`:

```xml
<ResourceDictionary Source="Resources/Styles/Colors.xaml" />
<ResourceDictionary Source="Resources/Styles/Icons.xaml" />
<ResourceDictionary Source="Resources/Styles/Styles.xaml" />
```

**Either way, Styles goes last** — it resolves `{StaticResource SrColor…}` and
`{StaticResource SrIcon…}` against the other two, and merging it first fails at
runtime rather than at build.

---

### `StrokeThickness` does not scale with `Aspect`, so icons thicken as they shrink

**Symptom:** An icon set to `HeightRequest="16"` looks heavier, relative to its
own size, than the same icon at 24px — and heavier than the web version.

**Why:** SVG `stroke-width` lives inside the viewBox and scales with the icon;
MAUI's `StrokeThickness` is a device-independent unit applied after `Aspect`
has scaled the geometry. `StrokeThickness="1"` is therefore 1px at *any*
`HeightRequest`, which at 16px is proportionally 1.5× what it is at 24px.

**Fix:** `StrokeThickness="1"` is correct at a 24px render, which is what the
generated header and the NuGet README document. Below that, scale it with the
size — `HeightRequest / 24` — rather than leaving it at 1.

**Not verified on a device.** This follows from how MAUI Shapes are documented
to render, and .NET cannot be run in the environment where the design system is
built, so it has not been confirmed empirically. First engineer with a device:
confirm it and replace this paragraph with what you actually see.

---

### Icons are 1px, not Lucide's 2px

**Symptom:** Icons regenerated from Lucide come back visibly heavier than the
ones in the repository, or a code sample shows `stroke-width="2"`.

**Why:** DDR-023 overrides Lucide's shipped 2px stroke with 1px, globally. The
Figma library had already moved to 1px — 121 of 125 components — and nothing
recorded it, so Figma and code drifted apart silently for some time.

**Fix:** Take the stroke from the source SVGs; never hand-write it. If you are
adding an icon from Lucide, `foundations/iconography/fetch-icons.js` already
emits `stroke-width="1"` — use it rather than copying markup off lucide.dev.

**Prevented by** `npm run build -w @dhcw/sr-icons`, which regenerates
`icons.js` and `sprite.svg` from the source SVGs, and by `verify-icons.mjs`,
which fails if the MAUI geometry stops matching those sources. Neither catches a
hand-inlined icon pasted into a page — the design-system website had ten of
those, all now corrected.

**Do not apply this to `Icon/warnings/*` in Figma.** Those four are filled state
badges, not outlines, and an audit that flags them as "stray stroke weights" is
reading them wrongly — the fill carries the meaning, and their stroke weight is
incidental. They have no counterpart in the code icon set.

---

### `Path` is ambiguous with `System.IO.Path`

**Symptom:** `error CS0104: 'Path' is an ambiguous reference`.

**Why:** `System.IO` is an implicit using, and
`Microsoft.Maui.Controls.Shapes.Path` collides with it.

**Fix:** Alias at the top of the file:

```csharp
using Path = Microsoft.Maui.Controls.Shapes.Path;
```

---

### Re-declaring `PropertyChanged` on a page kills your bindings

**Symptom:** A bound property updates in code but nothing on screen reacts.
Build shows `warning CS0114: … hides inherited member`.

**Why:** `ContentPage` already implements `INotifyPropertyChanged` via
`BindableObject`. Declaring `public new event PropertyChangedEventHandler
PropertyChanged` plus your own `OnPropertyChanged` hides the inherited pair —
XAML bindings subscribe to the *base* event, so you raise one nobody is
listening to.

**Fix:** Delete the reimplementation and call the inherited
`OnPropertyChanged()`.

**Watch for:** it is only a *warning*. The app compiles, ships, and the control
just does nothing.

---

### An XML comment may not contain `--`

**Symptom:** `error MSB4025: The project file could not be loaded. An XML
comment cannot contain '--'`. The project does not parse at all, so the error
points nowhere near your actual work.

**Why:** XML forbids `--` inside a comment body, and forbids one ending in `-`.
Easy to write the moment a comment quotes a command line, because nearly every
CLI flag starts with a double hyphen.

**Fix:** Reword. Applies to `.csproj`, `.props`, `.targets` and `.xaml` alike.

**Prevented by:** `packages/maui/verify-xaml.mjs`, which checks every XML
comment in those four file types.

---

### A MAUI project with no `Platforms/Android` builds an APK that cannot start

**Symptom:** `dotnet publish` is green, the APK is signed and installable, and
BrowserStack App Live rejects it: *"Launcher activity was not found in
AndroidManifest.xml"*.

**Why:** The MAIN/LAUNCHER intent filter is generated from
`[Activity(MainLauncher = true)]` on a `MainActivity`. With no
`Platforms/Android/MainActivity.cs` there is nothing to generate it from, and
MSBuild does not consider an app with no entry point an error.

**Fix:** Add `Platforms/Android/MainActivity.cs`, `MainApplication.cs` and
`AndroidManifest.xml`. See `packages/maui/testbed/Platforms/Android/`.

**Prevented by:** the `Verify the APK can actually launch` step in
`.github/workflows/build-maui-testbed.yml`, which runs `aapt2 dump badging` on
the built APK and fails if there is no `launchable-activity`.

---

### MAUI is native XAML — not Blazor Hybrid

The mobile estate has no `BlazorWebView` anywhere. An earlier assumption to the
contrary reached 29 code tabs on the DS website and six documents before it was
caught, and the tabs showed *Blazor* markup labelled MAUI — worse than nothing,
because copying it gives you a component that does not exist in XAML.

Full correction in **DDR-021**. `packages/blazor` serves Blazor web only.

**Prevented by:** `packages/website/build.mjs` validates every MAUI snippet's
`{StaticResource …}` references against what `@dhcw/sr-maui` actually ships.

---

### A packed MAUI TFM is `net10.0-android36.0`, not `net10.0-android`

**Symptom:** `publish-nuget.yml`'s completeness check reported *"no assembly for
net10.0-android — packed on the wrong host?"* for all three platforms, on a
macOS run, from a package that contained all three. The message points at the
host, so the natural next move is to go looking at runners and workloads. That
is the wrong tree.

**Why:** the csproj targets `net10.0-android`, but NuGet packs under the
**materialised** platform version — `lib/net10.0-android36.0/`, and likewise
`net10.0-ios18.0` and `net10.0-maccatalyst18.0`. A check matching the literal
path segment `/net10.0-android/` therefore never matches anything, whatever the
package contains.

It reported *android* missing too, which is the tell: android compiles on Linux
in the PR workflow on every change, so it was certainly present. Three
simultaneous failures including one that could not really be missing means the
matcher is wrong, not the package.

**Fix:** match the TFM with an optional trailing version, anchored at `lib/`:

```python
pattern = re.compile(rf'^lib/net10\.0-{tfm}[0-9.]*/.+\.dll$')
```

`[0-9.]*` is optional, so it holds whether or not the version is materialised,
and stays correct when an Android or iOS API level moves.

**The general shape, which is the reusable part:** when a check that has never
run reports something impossible, suspect the check. This one was written,
reviewed and shipped without ever executing — its first real run was the dry
run that found this.

**Verified** by running the old and new matchers over a realistic packed-name
list: the old one reproduces the exact three-error message against a good
package; the new one passes it, still fails a genuinely Linux-only pack on ios
and maccatalyst, and is not satisfied by a stray `.dll` outside `lib/`.

---

## React

### A snippet can use a prop the component does not have

**Symptom:** Copying a documented snippet produces a component that silently
ignores half of what you passed.

**Why:** Snippets were hand-written and drifted from the components. Four were
wrong at once: `Button` takes **`type`**, not `variant`; `SegmentedControl`
takes **`ariaLabel`**, not `label`; `Navigation` takes **`collapsed`** and
**`onCollapseToggle`**, not `state`/`onToggle`; and the Table page showed the
Blazor component name with a prop React has no equivalent of.

**Fix:** Check the component's own destructured props in
`packages/react/src/<component>/`.

**Prevented by:** the website build reads each component's destructured props
from source and fails if a snippet uses one that does not exist. It is
deliberately shallow — it cannot tell you a *value* is wrong, only that a prop
does not exist, which is the failure that actually happens.

---

### Spreading `...rest` is not optional

**Symptom:** A pre-filled date renders as an empty placeholder.

**Why:** `Input` type=calendar and type=time were the only variants that dropped
`...rest`, so `value` / `defaultValue` / `onChange` never reached the underlying
`DatePicker` or `TimeSelect`.

**Fix:** Every variant of a wrapper component forwards `...rest`. If one branch
does not, that branch is broken for every prop you did not explicitly name.

---

## Packaging and install

### `--tag next` does not spare a package's FIRST publish from becoming `latest`

**Symptom:** `0.2.1-rc.0` was published with `--tag next` specifically so that no
consumer could pick it up. The registry then showed:

```
sr-icons  {'next': '0.2.1-rc.0', 'latest': '0.2.1-rc.0'}
```

so a bare `npm install @dhcw/sr-icons` served a release candidate.

**Why:** a package must have a `latest` tag. On the first publish there is no
other version to point it at, so npm sets `latest` to whatever was just
published, whatever `--tag` says. On every subsequent publish `--tag next`
behaves as expected and leaves `latest` alone.

**What it does and does not affect:**

| | |
|---|---|
| Tarball URL consumers | unaffected — no npm range involved |
| `"^0.2.0"` in a `package.json` | unaffected — a caret range does not match a prerelease |
| A bare `npm install @dhcw/sr-tokens` | **serves the prerelease** |

**Fix:** publish a stable version, which moves `latest` to it. There is no way
to undo it in place — `latest` cannot be unset, and with a single published
version there is nowhere else to move it.

**Expect this again** for any *new* package added to the published set: the
first `@dhcw/sr-blazor` release candidate would do exactly the same.

**Reported by:** the `Warn if a prerelease became latest` step in
`release-packages.yml`, which reads the registry back after publishing and
prints a warning naming the affected packages. It cannot prevent it, and the
step says so — the point is that nobody has to notice by hand, which is how it
was found the first time.

---

### `repository.url` without a `git+` prefix is auto-corrected on every publish

**Symptom:** every `npm publish` prints

```
npm warn publish npm auto-corrected some errors in your package.json
npm warn publish "repository.url" was normalized to "git+https://…"
```

**Why:** npm expects a git URL for `repository.url` and normalises a bare
`https://…` form at publish time. The published metadata is correct — npm fixed
it — but the warning recurs on every release and invites the assumption that
something is wrong with the package.

**Fix:** write it as `git+https://…` in the manifest. `npm pkg fix` does it, or
edit the four manifests directly.

---

### You cannot `npm install` a single workspace out of a git repository

**Symptom:** A developer follows the documented install, `npm install` reports
success, and then `import { Button } from '@dhcw/sr-react'` throws
`ERR_MODULE_NOT_FOUND`. It reads as a broken npm or a proxy problem, and a lot
of time goes into the wrong place.

**Why:** This is a monorepo. The thing at the repository root is
`@dhcw/sr-design-system` — `private: true`, a `workspaces` array, no `main` and
no `exports`. npm has no mechanism for installing one workspace out of a git
repo, so both documented forms fetch the *root*:

```bash
# Installs one package: @dhcw/sr-design-system. sr-react is simply absent.
npm install github:DHCW-Digital-Health-and-Care-Wales/single-record-design-system#main
```

```json
// Installs the same root under an alias. The package it fetches is private
// with no entry point, so importing from it throws.
"@dhcw/sr-react": "github:DHCW-Digital-Health-and-Care-Wales/single-record-design-system#main"
```

Both were verified by running them: `added 1 package`, and
`node_modules/@dhcw/sr-react/package.json` reports
`name: @dhcw/sr-design-system, private: true, main: (none)`.

**Fix:** Until the packages are published, use the download route —
`single-record.css` plus `sprite.svg` — which is complete for anything that is
not consuming the React wrappers. Publishing is the real answer and is blocked
on the scope decision in DDR-020.

**Prevented by:** nothing yet. Worth a check that fails if the website
documents a `github:` install of this repo.

---

### React consumers were loading every component's CSS twice

**Symptom:** None visible — it renders correctly. The cost is bytes: a React
screen using seven components shipped **238KB** of CSS where 131KB would do.

**Why:** Every React component imports its own stylesheet
(`import '@dhcw/sr-web/src/button/button.css'`), which is the right design — an
app gets only the components it uses. But the documented consumer import was
`@dhcw/sr-web/dist/single-record.css`, which contains *all 21* component
stylesheets. So an app got all 21, plus a second copy of each one it actually
imported.

**Fix:** `@dhcw/sr-web/foundations` — font, tokens and typography utilities,
no components. Pair it with the React package and the app ships the foundations
plus only what it imports.

Plain HTML keeps `single-record.css`: with no bundler there is nothing to
assemble the per-component files, and the whole point of that file is that one
`<link>` works.

**Worth knowing either way:** 77KB of both files is the embedded Roboto. That is
the floor, and it is the reason the CSS works with no network access at all.

---

### An `exports` map is a closed list, and ours omitted the path everyone writes

**Symptom:** `import '@dhcw/sr-web/dist/single-record.css'` fails with
`ERR_PACKAGE_PATH_NOT_EXPORTED`, even though the file is right there in the
package and `files` includes `dist/`.

**Why:** Once `exports` exists, *only* the subpaths it lists are importable —
`files` and the real directory layout stop mattering. `@dhcw/sr-web` mapped
`"."` to the CSS but never mapped `./dist/*`, so the fully-qualified path that
every guide and every developer writes was not reachable.

**Fix:** `"./dist/*": "./dist/*"` in the exports map. The bare
`import '@dhcw/sr-web'` also works and is shorter, but people write the long
form and it should not punish them.

**Also worth knowing:** the same map had drifted from `src/` — `autocomplete`,
`radio`, `select` and `tags` had no entry, so `@dhcw/sr-react/select` failed
while `import { Select } from '@dhcw/sr-react'` worked. A missing subpath export
is invisible until someone uses that exact import.

**Prevented by:** nothing yet. A check comparing `exports` against `src/` would
catch the drift half of this.

---

## Web / CSS

### A form control's rest border needs 3:1, and Border/Default does not reach it

**Symptom:** An unchecked checkbox or radio looks faint, especially on a laptop
screen in a bright ward. It reads as decoration rather than as something to
click.

**Why:** Both drew their rest border with `Border/Default` (Grey/200 `#D8DDE0`),
which is **1.37:1 on white**. WCAG 2.2 SC 1.4.11 Non-text Contrast requires
**3:1** for the visual boundary of a UI component, and an unchecked box is
exactly that — the border is the only thing telling you the control is there.
This is easy to get wrong because Border/Default is the right choice for a
*divider*, where nothing is being identified as interactive, and the two uses
look similar in a stylesheet.

**Fix:** Form control boundaries use `Border/Strong` (Grey/600 `#4C6272`,
6.37:1). Dividers, card outlines and table rules stay on `Border/Default` —
they are not control boundaries and 1.4.11 does not apply to them.

**Watch the state that used to be the fix.** Both components had hover set to
`Border/Strong`. Once rest uses it, hover is a no-op — the same value applied
twice. Hover moved to `Interactive/Primary`, previewing the checked colour.
Any component that darkens on hover has this collision waiting for it.

**Prevented by:** `npm run check:contrast`
(`scripts/check-contrast.mjs`), which asserts the pairs the system commits to
and fails the build when one drops below its ratio. Verified by planting the
old Grey/200 value and confirming it was caught at 1.37:1.

---

### The focus ring was 2.95:1 against the 3:1 SC 1.4.11 wants — fixed, DDR-025

**Resolved 2026-09-02.** `Border/Focus` is now Cyan/800 `#0D8BAD`. The entry is
kept because the reasoning is the reusable part: the trap here is fixing a
contrast failure in one mode and creating one in the other.

**Symptom:** Nothing visible. This was found by computing it, not by looking.

**Why:** `Border/Focus` is Cyan/700 `#12A3C9` (DDR-006). Against a white card
it is **2.95:1**; against the page background (Blue/50 `#F4F5F8`) it is
**2.71:1**. SC 1.4.11 requires 3:1 for a focus indicator. The card case misses
by 0.05, the page case by more. It affects every focusable component, because
the ring is system-wide.

Worth separating from the other `#12A3C9` finding already on file: that one is
*white text on a cyan fill* at 2.95:1 in the MAUI app. This is *cyan on white*
— a different pair that happens to land on a near-identical number, and it had
not been computed before.

**Fix:** Applied — `Border/Focus` moved to Cyan/800 `#0D8BAD` (DDR-025).

**Check both modes before picking a stop.** The obvious move is to darken the
ring, and in light mode any of 800/850/900 works. Dark mode inverts the
problem: its surfaces are navy, so a darker ring gets *worse*, and Cyan/850 —
the intuitive choice, and the one first proposed here — fails dark mode at
2.95:1 on `navy.900`, mirroring exactly the light-mode failure it was meant to
fix. Only one stop clears 3:1 in both:

| Stop | Light: white / page | Dark: navy.900 / blue.900 | Verdict |
|---|---|---|---|
| Cyan/700 (current) | 2.95 / 2.71 | 4.86 / 4.46 | fails light |
| **Cyan/800 `#0D8BAD`** | **3.95 / 3.63** | **3.63 / 3.33** | **passes both** |
| Cyan/850 `#0C7B99` | 4.87 / 4.47 | 2.95 / 2.70 | fails dark |
| Cyan/900 `#0A6A84` | 6.16 / 5.65 | 2.29 / 2.10 | fails dark |

Cyan/800 is also the smallest visual change, being the nearest stop to the
current value.

**An exception was considered and rejected.** The warning-icon exception holds
because the warning colour is a fill that always sits beside a text label, so
nothing depends on the colour alone. A focus ring has no such backstop: it is
the only thing telling a keyboard user where they are.

**Two things had to change together, and one of them was not the token.**
Thirteen focus rings across eight components (`button`, `header`, `navigation`,
`breadcrumbs`, `segmented-control`, `table`, `tags`, `bottom-nav`) hardcoded
`var(--color-cyan-700)` — the raw primitive — instead of
`var(--sr-color-border-focus)`. Changing the token alone would have moved the
other rings and left those thirteen behind, giving the system two focus colours
at once. They were repointed first. **This is the shape to look for whenever a
semantic token changes: grep for the primitive as well as the semantic name.**

**Prevented by:** `npm run check:contrast` asserts the ring against page
background and section cards in **both modes**, so a future change that clears
one mode and breaks the other fails the build.

**Separately, and true of any stop:** in dark mode `surface.small-cards`
resolves to Cyan/850, so a cyan ring on a small card is 1.65:1 today and
cannot be fixed by moving the ring. That is the dark-mode surface assignment
flagged in the 2026-08-10 checkpoint, not a focus-ring problem.

**Tracked by:** `npm run check:contrast`, which reports it under OPEN FINDINGS
on every run without failing the build. It is pre-existing debt with a name on
it, not an exemption — the check is what stops it being forgotten again.

---

### The dark-mode primary button is near-black text on mid-blue — open

**Symptom:** In dark mode the primary button's label is barely legible, at
2.26:1. Nobody has reported it, because the website's dark-mode toggle is
currently off — but any product consuming `single-record-dark.css` has this
today.

**Why:** `button.css` sets `color: var(--sr-color-text-inverse)` on an
`--sr-color-interactive-primary` fill. That is right in light mode: white on
Blue/800, 8.04:1. In dark mode `text-inverse` is `#212b32`, near-black — and
that is not a bug in the token. Its own description says it means *"text on
light elements within a dark-mode interface"*, which is a sensible thing for a
token to mean. The mismatch is that **a primary button is not a light element
in either mode**, so it is reaching for the wrong token.

DDR-011 records the intent as white on Info-Blue/600 at 5.1:1. That is not what
renders.

**The general shape, which is the reusable part:** a token whose meaning is
*relative to the mode* ("inverse") cannot be used by a component whose surface
is *absolute* (always saturated). Anywhere a component fills with a brand colour
and labels it with `text-inverse`, check both modes.

**Fix:** Not applied. The fix is a token that means "text on a primary fill" and
holds white in both modes, which is a token-structure change and needs a DDR.
Found by extending the contrast gate to dark mode, not by looking.

**Tracked by:** `npm run check:contrast`, under OPEN FINDINGS.

---

### The Blazor CSS under `wwwroot/` is a hand-copied mirror and had drifted

**Symptom:** A token change lands everywhere except Blazor, which keeps
rendering the old values with nothing failing.

**Why:** `packages/blazor/wwwroot/css/` holds copies of `tokens.css`,
`tokens-dark.css` and `button.css`. The copy commands are written down in
`DHCW.SingleRecord.Components.csproj` — as a **comment**. Nothing runs them.
When the focus ring moved to Cyan/800 the mirror still carried Cyan/700
throughout, and its `button.css` still referenced the `--color-cyan-700`
primitive that had just been removed from source.

**Fix:** `npm run fix:blazor-mirror` re-copies all three.

**Prevented by:** `npm run check:blazor-mirror` (`scripts/check-blazor-mirror.mjs`),
wired into `npm run check`, which fails when any mirrored file differs from its
source. Verified by planting a change in the copy and confirming it was caught.

---

### `overflow-x: auto` does not stop a wide child scrolling the page

**Symptom:** A wide table scrolls inside its wrapper *and* drags the whole page
sideways.

**Why:** `overflow-x: auto` gives the element its own scroll container but does
not stop it contributing to an ancestor's scroll width.

**Fix:** Add `contain: paint`. Every consumer had been working around this by
nesting the table in a second scrolling ancestor.

---

### An SVG sprite `<symbol>` needs its presentation attributes

**Symptom:** Icons referenced through `<use href="sprite.svg#icon-x">` render
nothing at all.

**Why:** These icons are stroke-drawn outlines. A `<symbol>` carrying only a
`viewBox` inherits the SVG defaults — fill black, no stroke — so a stroke-only
shape has nothing to paint.

**Fix:** Put `fill`, `stroke`, `stroke-width`, `stroke-linecap` and
`stroke-linejoin` on the `<symbol>` itself.

**Verify like this:** copy `dist/` into an empty folder, write a plain HTML page
against it, and serve it **over HTTP** — a cross-file `<use>` is blocked on
`file://` and fails silently.

---

### Documentation CSS restyles the components it documents

**Symptom:** A component looks wrong on its own DS website page but right in the
prototype.

**Why:** `site.css` styles page copy with `.content h2`, `.content th`,
`.content p`. Those selectors also match component markup inside a showcase
preview, at higher specificity than the component's own class rules.

**Fix:** Any site rule reaching a bare element must exclude showcase
descendants: `:not(.showcase__preview *)`. That preview area is the component,
not page copy.

---

### A grid item defaults to `min-width: auto`

**Symptom:** A panel overflows its column at narrow widths despite a `1fr`
track.

**Fix:** `min-width: 0` on the item. Wide content otherwise pushes the track
past its share.

---

## Build & CI

### A gate that checks the source and trusts the toolchain is not a gate

The single most expensive lesson here, learned twice in one session.

`verify-xaml.mjs` passed a `.csproj` it never opened, and the build failed on
it. Then the workflow uploaded an APK it never inspected, and BrowserStack
rejected it. Both times the checks were green and the artefact was broken.

**The rule:** check the thing you are shipping, in the form you are shipping it.
Source-level checks catch source-level mistakes only, and "the build succeeded"
is not evidence the output is usable. `aapt2 dump badging` on the actual APK
answers the question BrowserStack asks, of the file BrowserStack receives.

---

### A scheduled build on a fork fills the artifact storage quota

**Symptom:** Over a weekend, hourly mail: *"Deploy DS site (website + Storybook)
to GitHub Pages: Some jobs were not successful"* — on scheduled runs, attached to
no commit anyone made. Then GitHub: *"You have used 100% of the Actions storage
included for the account"* (0.5 GB). In the run logs the Storybook build is
clean and green; the failure is one line at the very end:

```
Failed to CreateArtifact: Artifact storage quota has been hit.
```

**Why:** `deploy-pages.yml` runs on a schedule as a safety net for the *org*
repo, because mirror-key pushes don't trigger workflows there (DDR-014). The
**deploy** job was guarded to the org repo; the **build** job was not. So the
source repo — where pushes already trigger the workflow directly — rebuilt the
whole site and uploaded a ~190-file artifact every 30 minutes, 48 times a day,
at `upload-artifact`'s default **90-day** retention. Nothing ever aged out.

Two things make this hard to see coming. Retention is invisible at the moment
you write the step and only bites months later. And the quota failure lands on
the *upload* step of a *scheduled* run, so the mail points at a job nobody
started, under a log that looks entirely successful.

**Fix:** Guard the job, not just the deploy step —

```yaml
if: >-
  github.event_name != 'schedule' ||
  github.repository == 'ORG/repo'
```

and set `retention-days` on every upload. Push and PR runs still build
everywhere, which was the point of running the build unguarded.

**Prevented by:** `npm run check:workflows` (`scripts/check-workflows.mjs`),
in `npm run check`. It fails any `actions/upload-artifact` step with no
`retention-days`. Setting it to `90` explicitly passes — the goal is that the
number is a decision, not a default nobody saw. The repo-guard half is not
mechanised: "which events should run on which repo" is intent, not a rule a
script can infer.

**Also worth knowing:** the check's own first run reported a false positive on
the one step written as `- name:` with `uses:` on the next line — it read the
step's indent off the `uses:` line and treated `with:` as the start of the next
step. Caught only because the defect was planted deliberately in *both* step
shapes. One shape passing is not the gate working.

---

### Generated files must be regenerated in CI, not trusted

`Colors.xaml` and `Icons.xaml` are committed so consumers can take them straight
from GitHub. That means a stale commit is possible.

**Prevented by:** the MAUI workflow regenerates both and fails if `git diff`
shows a change — a committed file that disagrees with its generator is a
defect, not a convenience.

---

### A line-anchored regex parser drops multi-line elements

**Symptom:** Two tokens (`ElevationRaised`, `ElevationOverlay`) were absent from
`Colors.xaml` with no error. 208 resources emitted where 210 were expected.

**Why:** They are emitted as multi-line self-closing `<Shadow … />` elements,
and the parser matched only single-line patterns anchored with `^`/`$`.

**Fix:** Parse blocks, not lines. And **count**: the mismatch was invisible
until the emitted key count was compared against the source.

---

### Concatenating SVG subpaths needs absolute movetos

**Symptom:** An icon built from several `<path>` elements renders as a scribble.

**Why:** Each `<path>` starts its own coordinate context at the origin, so a
leading relative `m` means the same as `M`. Once they become subpaths of one
geometry that stops holding — a relative moveto is measured from the previous
subpath's end point. 30 of the 120 icons open with a relative moveto.

**The trap inside the trap:** upper-casing the `m` is *not* the fix. In
`m12 5 7 7-7 7` the trailing pairs are implicit **relative** linetos inherited
from the lowercase moveto; an absolute `M` makes them absolute too and draws a
different shape. Rewrite the moveto absolute and re-attach the remainder under
an explicit relative `l`.

**Prevented by:** `packages/maui/verify-icons.mjs` walks the source form and the
emitted form and compares the absolute points each visits.

---

## Testing & verification

### Prove a check fails before trusting that it passes

Every gate in this repo was verified by planting the defect it targets:

| Check | Planted defect | Result |
|---|---|---|
| `verify-icons.mjs` | the naive `m` → `M` fix | 40 icons reported, with wrong coordinates |
| `verify-xaml.mjs` | typo'd resource key, typo'd StyleClass, unclosed tag, literal colour | all four, correct line numbers |
| `verify-xaml.mjs` comments | the exact `--` that broke CI | caught at the right line |
| MAUI literal-colour check | a planted `#FF0000` | **initially passed** — the first version only matched named colour attributes, not `Value="…"` |

That last row is the argument for the practice. A check nobody has seen fail is
a check nobody knows works.
