# WCP mobile prototype: onboarding and home

A native MAUI app you can tap through on a phone or on BrowserStack App Live.
**UI only:** no backend, no database, no real sign-in. Every name and number is
fixed demo content.

Figma: Adaptations Mobile page, section `5443:23238`, row **ONBOARDING/DASHBOARD**.

## Getting the APK for BrowserStack

BrowserStack App Live takes an `.apk`, not a project folder.

1. GitHub → **Actions** → **Build MAUI library and testbed APK** → **Run workflow**,
   on your branch.
2. When it finishes, download the **`wcp-prototype-build<n>`** artifact (kept 3
   days), where `<n>` is the run number.
3. Unzip it (GitHub always zips artifacts) and upload `wcp-prototype-build<n>.apk`
   to App Live, then pick **that** upload in App Live's list.

The sign-in screens show **Prototype build `<n>`** under the version. If the
number is not the run you meant to test, App Live is running an older upload:
every build before 30 had the same name and version, so they look identical there.

The same run also builds the testbed APK (`sr-testbed-apk`). The workflow fails
rather than uploading an APK with no launchable activity.

To build it locally instead, follow `packages/maui/testbed/README.md` (Route 2)
and publish `products/wcp-mobile/prototype/WcpPrototype.csproj`.

## The flow

| Screen | Figma | Tap | Goes to |
|---|---|---|---|
| Splash | `5443:38534` | (waits 1.2s) | Login, or Welcome back if a PIN was set before |
| Login | `6432:36606` | Log in with Microsoft | Microsoft sign-in |
| Microsoft sign-in (simulated) | `5949:12194`, `5949:12197` | Continue as signed in | Create PIN |
| Create PIN | `6432:36447` | Six digits, six again, Save PIN | Home |
| Welcome back | `6432:36863` | Six digits, or Biometric login | Home |
| | | Log out | Login |
| Home | `5849:17493` | Avatar | Profile information |
| | | Menu (☰), or More | Side menu |
| | | Search circle | Cursor into the NHS number field |
| Profile information | `5880:30076` | Back arrow, or Android back | Home |
| Side menu | `5880:30286` | Home, scrim, chevron, or Android back | Closes |
| | | Log out | Login |

**To see Welcome back:** after reaching Home, press the device's Home button and
reopen the app. It locks on resume, as the real app does. Closing and relaunching
also shows it.

**PINs.** Create PIN checks the two entries match. Welcome back accepts the PIN set
in this session; after a restart it accepts any six digits, because the real PIN
is never written to the device. Only a "PIN has been set" flag is saved.

Anything else (help links, quick actions, the attention rows, Watchlist, Patients,
Scan, Notifications) shows "This prototype covers sign-in and the home screen only."

## Where it departs from the Figma frames

Each is a correction the design system already requires. The Figma frames need the
same changes.

| Figma | Prototype | Why |
|---|---|---|
| Microsoft sign-in screens are screenshots of Microsoft's page | One simulated step that says what happens | A prototype must not imitate another organisation's sign-in or ask for a password. The real app opens Microsoft's own page. |
| Unlock screen **Log out** is a red filled button; side menu **Log Out** is red text | Outlined white button; plain text | `Styles.xaml` keeps the destructive style for permanent deletion. Logging out loses nothing. |
| Get Started, Welcome Back, Biometric Login, Log Out, Login with Microsoft, Infection Control, Call Support, Current Issuing Authority | Sentence case; "Log in" as the verb | Content rules (`docs/content/data-standards.md`). |
| "Change organization" | "Change organisation" | UK English. |
| "Please enter your PIN to access WCP mobile" | "Enter your PIN to open WCP mobile" | Plain English: no "please", no "access". |
| "Message of the day, 01/12" | "Message of the day, 1 Dec" | Dates as `1 Dec`, no leading zero. |
| Staff member is a real person (name, email, Nadex ID, GMC) | Fictional: BEVAN, Alys; `example.nhs.wales` email; `be000001`; GMC `7000001` | Demo data must not be a real person. `SURNAME, First` is UI Standards v1.3 #6. |
| "Username" shows a full name | "Name" | It is a name, not a username. |
| PIN dots have no filled state | A filled `Interactive/Primary` dot, and "3 of 6 digits entered" for screen readers | The frame only draws the empty state. |
| Keypad keys 40px high | 44px minimum | Touch target floor. |

## Known gaps

- **Not run on a device yet.** It compiles (C# and every XAML file through XamlC,
  checked against a plain `net10.0` target) and passes `verify-xaml.mjs`, but the
  Android APK is only built in CI. Look at it before trusting the layout.
- **Medium weight** renders regular (known-issues: "Medium font weight is
  unreachable").
- **Safe areas.** Android 15 and later draw edge to edge; check the header is not
  under the status bar on App Live.
- **Dark mode** applies after sign-in only. The sign-in screens are fixed navy by design.
- The keypad key fill is `Border/Default`, as bound in Figma. A border token used as
  a fill; it wants a surface token.
- The PIN pad, quick-action circle, attention row and side menu have no `spec.md`.
