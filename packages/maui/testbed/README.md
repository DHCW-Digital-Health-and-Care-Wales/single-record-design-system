# SR MAUI testbed

A throwaway MAUI app whose only job is to put `@dhcw/sr-maui` on a real device.

Not shipped, not published, not a product. It exists because reading XAML proves
a reference is spelled correctly and nothing more. These four questions need a
device:

| Question | Where it is answered |
|---|---|
| Do the resource references resolve at runtime? | Anything unstyled on the More tab means a dictionary did not merge |
| Does `AppThemeBinding` flip cleanly? | More → Theme, which lists the 16 semantics that differ and shows both values |
| Does `MinimumHeightRequest` survive 200% font scale? | Device settings → font size → 200%, then Home |
| Do the 120 icon geometries render as the icons they claim to be? | More → Icons |

## First, the thing to be clear about

**BrowserStack App Live takes an app binary — an `.apk` or `.ipa` — not a file
you can open.** There is no HTML or XAML you can load into it, and no HTML mock
would answer any of the four questions above, because none of them are about
HTML. So the deliverable is an APK, and below are two ways to get one.

None of this has been compiled. It is validated as well-formed XAML with every
`StaticResource` and `StyleClass` resolving and no hard-coded colours
(`npm run build:maui`), and the icon geometry is verified point-for-point against
the source SVGs. That catches typos and drift. It says nothing about layout,
which is the whole reason to run it.

## Route 1 — GitHub Actions (nothing to install)

Actions → **Build MAUI testbed APK** → Run workflow. Download the
`sr-testbed-apk` artifact, **unzip it** (GitHub always zips artifacts), and
upload `sr-testbed.apk` to App Live.

This is the recommended route. It needs no toolchain on your machine and it is
reproducible. The workflow fails rather than uploading something broken if:

- the committed `Colors.xaml` or `Icons.xaml` has drifted from what the
  generator produces, or
- **the APK has no launchable activity.** A green publish is not the same as a
  usable APK — the first one this workflow produced built, signed and uploaded
  cleanly, and App Live rejected it with *"Launcher activity was not found in
  AndroidManifest.xml"*. `Platforms/Android/MainActivity.cs` was missing, so
  nothing carried `MainLauncher = true` and the app had no entry point. The
  build has no opinion about that; `aapt2` does, so the workflow now asks it.

## Route 2 — build it locally

Only worth the setup if you want to iterate quickly. The project targets
**`net10.0`** by default; pass `-p:SrDotnet=net9.0` and `-f net9.0-android` if
that is what you have, though .NET 9 is now out of support and the build says so.

### Windows

By far the easiest route, because one Visual Studio workload covers all of it.

1. **Visual Studio 2022 or later** → Installer → Modify → check **.NET Multi-platform App UI development**. That brings the .NET SDK, the MAUI workloads, the Android SDK and the JDK together, already wired up.
2. Open `packages/maui/testbed/SrTestbed.csproj`, or from a terminal:

```powershell
cd path\to\dhcw-single-record-design-system
npm ci
npm run build:maui
dotnet publish packages\maui\testbed\SrTestbed.csproj -f net10.0-android -c Release -p:AndroidPackageFormat=apk
```

No Visual Studio? The CLI alone works:

```powershell
winget install Microsoft.DotNet.SDK.10
winget install Microsoft.OpenJDK.17
dotnet workload install maui-android
```

The Android SDK still has to exist. Android Studio provides it and sets
`ANDROID_HOME`; otherwise point the build at one with
`-p:AndroidSdkDirectory=C:\path\to\android-sdk`.

### macOS

```bash
brew install --cask microsoft-openjdk@17
brew install --cask android-commandlinetools
export ANDROID_HOME=/opt/homebrew/share/android-commandlinetools
sdkmanager --install "platforms;android-35" "build-tools;35.0.0" "platform-tools"
sudo dotnet workload install maui-android

npm ci && npm run build:maui
dotnet publish packages/maui/testbed/SrTestbed.csproj \
  -f net10.0-android -c Release -p:AndroidPackageFormat=apk
```

Already have Android Studio? `ANDROID_HOME` is set for you — skip the
`android-commandlinetools` step.

### Where the APK lands

`packages/maui/testbed/bin/Release/net10.0-android/publish/`, as `*-Signed.apk`.
Upload that.

iOS is deliberately not a target. It needs Xcode and a signing identity before it
produces anything installable, and it would answer none of the four questions
that Android does not already answer — with one exception, noted below.

## What to actually look at on the device

**Home** is Figma `554:6606` (Page Template, Viewport=Mobile). Check the layout
holds, then raise the system font size to 200% and check it again. Every
text-bearing style uses `MinimumHeightRequest` rather than `HeightRequest`; this
is where that claim is either true or not. Watch the bottom bar's five labels and
the stat cards in particular — those are the tightest boxes on the screen.

**More** is a diagnostics page and not design-system vocabulary. It carries the
theme switch, the environment readout (including the live font scale on Android),
the type-scale ladder, every stock control under its implicit style only, the
status treatments, the 16 themed semantics as light/dark swatch pairs, and all
120 icons with their names.

Diary, Patients and Messages are drawn because the design draws them and lead
nowhere. Inventing three screens the design system has not specified would be
worse than leaving them inert.

## Three departures from the Figma frame

Each is a deliberate correction, marked in the XAML where it occurs.

| Frame | Testbed | Why |
|---|---|---|
| Avatar filled `Cyan/700` with white initials | `Interactive/Primary` with white initials | The frame is **2.95:1** — it fails WCAG 2.2 AA for normal *and* large text. SR's own `brand.accent` description already forbids using it as a filled surface with text on top. `Interactive/Primary` is 8.04:1. The frame needs the same fix. |
| Section card fixed at 440px, fifth row clipped mid-row | Card sizes to content, page scrolls | A fixed-height slot artefact. A card showing half a row promises more without offering a way to reach it. |
| Code Connect maps all five tags to `Tag type="Blue"` | Blue for Physical, green for Virtual, as drawn | The mapping contradicts the frame's own rendering. Implemented as drawn; the mapping is what needs correcting. |

## Known gaps in the layer this exercises

Found while building the screen. None are blocking, all are real.

- **No `surface.header` semantic.** The header and bottom bar are chrome, not
  cards, and there is no token that says so — `Surface/Section-cards` stands in.
  It happens to be right in both modes, which is why this has gone unnoticed.
- **Medium weight is unreachable.** SR's `label` and `heading-xs` are 500 weight.
  MAUI's `FontAttributes` offers Regular and Bold only, so medium needs
  `Roboto-Medium.ttf` bundled and registered as its own family. Until then every
  medium-weight style renders regular. This affects the bottom bar's current
  destination, which is currently distinguished by colour alone.
- **Roboto is free only on Android**, where it is the system font. An iOS target
  must bundle `Roboto-Regular.ttf` and `Roboto-Bold.ttf` or every style in
  `Styles.xaml` silently falls back to San Francisco. This is the one thing an
  iOS build would tell you that Android cannot.
- **`Surface/Small-cards` is `#0c7b99` in dark mode** — a saturated teal, so the
  four stat cards turn teal while the section card below them stays navy. It
  passes contrast (4.87:1 with white text) so it is not a defect, but it is
  almost certainly not intended. Dark mode is provisional and unreconciled by
  design; this is a concrete instance to settle.
- **Stat Card, Dashboard/Row cards and the week strip are Figma components with
  no spec and no DS implementation.** They are composed locally here. Two of the
  three look like system vocabulary and should probably be promoted.

## Cleaning up

```bash
rm -rf packages/maui/testbed/bin packages/maui/testbed/obj
```

Neither is tracked.
