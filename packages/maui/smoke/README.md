# MAUI launch smoke test

Builds, off-device, what a MAUI app builds when it starts, and fails if any of
it throws:

- each packaged dictionary (`SrColors`, `SrIcons`, `SrStyles`) **on its own**,
  which is what `<sr:SrStyles />` does in a product's `App.xaml`;
- the WCP mobile prototype's `App` and every page.

It exists because the first WCP prototype APK built, signed and passed every
static check, then closed on launch on BrowserStack:
`StaticResource not found for key SrColorTextPrimary`. Static checks prove a
key exists somewhere; only constructing the dictionary proves it is reachable
when it is needed.

Everything compiles for plain `net10.0`, so no Android SDK is needed. It runs in
the *Build MAUI library and testbed APK* workflow. Locally:

```bash
npm run build:maui
dotnet run --project packages/maui/smoke/Run/Run.csproj -c Release
```

Needs the .NET 10 SDK and `dotnet workload install maui-android`.
Not covered: layout, platform code, anything that happens after a tap.
