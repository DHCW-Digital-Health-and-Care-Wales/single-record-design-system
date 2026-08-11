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

### `<sr:Colors />` does not work for merging dictionaries

**Symptom:** The documented merge syntax fails to compile.

**Why:** That element form instantiates a *type*, which requires an `x:Class` on
the dictionary. `Colors.xaml`, `Styles.xaml` and `Icons.xaml` deliberately have
none — they are plain resource dictionaries.

**Fix:** Merge by `Source`, as the stock MAUI template does. **Colors must come
first**, because `Styles.xaml` resolves `{StaticResource SrColor…}` against it:

```xml
<ResourceDictionary Source="Resources/Styles/Colors.xaml" />
<ResourceDictionary Source="Resources/Styles/Styles.xaml" />
<ResourceDictionary Source="Resources/Styles/Icons.xaml" />
```

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

## Web / CSS

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
