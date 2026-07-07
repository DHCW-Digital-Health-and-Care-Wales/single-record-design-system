# Adopting SR Design System Components — Engineer Guide

For engineers integrating Single Record design system components into projects.
The goal: adopt incrementally without breaking your application.

**TL;DR:** Start with tokens, wrap your existing components, migrate one screen
at a time.

> **Token names in this guide are the real, generated ones.** CSS colour tokens
> use the **`--sr-color-*`** prefix; spacing uses **`--space-*`**; MAUI XAML keys
> are **`SrColor*`** / **`Space*`**. Never inline hex — bind the token. If a value
> below ever disagrees with `packages/tokens/build/`, the build wins.

## Read this first — how much adoption applies to you

The design system is built primarily for the **new Single Record app**. Support
for existing and legacy products is **best-effort, not compulsory**. Find your
tier:

| Your product | Expectation | Realistic ceiling |
|---|---|---|
| **New Single Record app** | Full adoption — all components, patterns, native tokens (Blazor primary) | The whole system |
| **Existing product** (EPR, patient admin) | Best-effort — tokens first, components where they fit | Tokens + high-value components |
| **Legacy (.NET Framework 4.8, Delphi)** | Token-level alignment *where achievable*, or leave as-is | Tokens via Web (HTML) / CSS layer — or nothing, and that's fine |

Frameworks in scope: **Web (HTML), React, Blazor, MAUI**. The **Web (HTML)** layer
(semantic markup + token CSS) is the lowest common denominator any product can
lean on, including legacy. .NET parity is expected mainly at **token level** for
older stacks — do not force full component parity where it doesn't hold up.

No product is obligated to adopt beyond its tier. Legacy constraints must never
dictate the new app's ceiling.

---

## Three adoption paths — pick one

### Path 1: Token-first (lowest risk, start here)

You replace hard-coded colours and sizing with SR tokens. Your components stay
yours; they just look aligned.

**Risk level:** 🟢 Green — no component changes, just theming

**Timeline:** 1–2 weeks per product

**Steps:**
1. Install the SR token package (NuGet/npm per framework)
2. Import the token CSS custom properties (e.g. `var(--sr-color-interactive-primary)`)
3. Replace hard-coded values in your CSS/XAML with token references
4. Test in light/dark mode (tokens auto-adapt)
5. Commit and deploy

**Example (Blazor):**
```razor
@* Before *@
<button style="background: #325083; color: white; padding: 12px 24px;">
  Click me
</button>

@* After *@
<button class="sr-button-primary">
  Click me
</button>
```

```css
/* Themed with SR tokens */
.sr-button-primary {
  background: var(--sr-color-interactive-primary);
  color: var(--sr-color-text-inverse);
  padding: var(--space-3) var(--space-6);
}
```

**What you're not doing:** replacing Button component logic, changing your HTML
structure, adopting new interaction patterns.

**When to use this:** Your app already has working buttons, inputs, modals — they
just need to look like SR.

---

### Path 2: Wrapper pattern (medium risk, when you're ready)

You keep your existing component *but wrap it with SR tokens and accessibility
spec*. The wrapper enforces SR patterns; your component provides the
implementation.

**Risk level:** 🟡 Yellow — one layer of abstraction, but your code stays

**Timeline:** 2–4 weeks per component, parallelizable

**Steps:**
1. Document what your component does (inputs, outputs, states)
2. Create a wrapper component that enforces SR patterns (token props, accessibility attributes, error handling)
3. The wrapper calls *your* existing component, just with SR-compliant props
4. Test for accessibility (axe, keyboard nav, screen reader)
5. Add to SR Storybook / preview
6. Product teams adopt the *wrapper*, not your original

**Example (Blazor):**
```csharp
// Your existing component (unchanged)
public class TextInput : ComponentBase
{
    [Parameter] public string Value { get; set; }
    [Parameter] public EventCallback<string> ValueChanged { get; set; }
    // ... your logic
}

// SR wrapper (new)
public class SRTextInput : ComponentBase
{
    [Parameter] public string Label { get; set; }
    [Parameter] public string? ErrorMessage { get; set; }
    [Parameter] public string Value { get; set; }
    [Parameter] public EventCallback<string> ValueChanged { get; set; }
    [Parameter] public bool Required { get; set; }

    // Wrapper enforces SR token props + WCAG state
    // Calls TextInput with validated inputs
}
```

```razor
@* Old way (product code) — hard to get right *@
<TextInput Value="@Name" ValueChanged="@OnNameChange" />

@* SR way (wrapped) — guaranteed to be accessible *@
<SRTextInput
  Label="Patient name"
  Value="@Name"
  ValueChanged="@OnNameChange"
  Required="true"
  ErrorMessage="@NameError"
/>
```

**What you're doing:** enforcing SR patterns and accessibility without rewriting
your component.

**When to use this:** You have solid components but need them to follow SR
patterns (tokens, a11y states, error handling).

---

### Path 3: Full replacement (highest effort, when components differ significantly)

You migrate from your component to the SR component. The SR component is the new
source of truth.

**Risk level:** 🔴 Red — full component replacement, needs testing

**Timeline:** 4–8 weeks per component, one at a time

**Steps:**
1. SR component is built and tested in Storybook
2. Product team runs it on a staging branch with their data/logic
3. Run a11y tests (axe-core)
4. Compare with old component (same states? better UX?)
5. Migrate product code one screen at a time
6. Deploy to staging for user testing
7. Merge to main once confident

**Example migration (one screen):**
```razor
@* Old (your component) *@
<ScanInput PatientId="@PatientId" OnScan="@HandleScan" />

@* New (SR component) *@
<SRBarcodeInput
  Label="Scan NHS number"
  Value="@NhsNumber"
  ValueChanged="@OnNhsNumberChange"
  ErrorMessage="@ScanError"
  OnScan="@HandleScan"
  HelperText="Scan the barcode on the patient wristband"
/>
```

**What you're doing:** wholesale adoption of a new component, with all its
patterns and a11y built in.

**When to use this:** SR component solves a real problem your old one doesn't
(accessibility, state handling, clinical context), and you have time to test it.

---

## Phased adoption strategy (recommended for all paths)

Don't convert the whole product at once. Go screen by screen.

**Phase 1: Tokens only (Week 1–2)**
- Import SR token package
- Replace hard-coded colours in your CSS
- Light/dark mode now works automatically
- No component logic changes

**Phase 2: High-impact wrappers (Week 3–4)**
- Wrap your most-used components (Button, TextInput, Modal)
- These appear on almost every screen
- A11y fix + consistent theming covers 80% of your app

**Phase 3: Migration (Week 5+, ongoing)**
- Screen by screen, replace components as you touch them
- Bug fix on a patient search screen? Migrate the search inputs to SR while you're there
- No "big bang" rewrite

**Risk management per phase:**
| Phase | Risk | Testing | Rollback |
|---|---|---|---|
| Tokens | 🟢 None — CSS only | Visual regression | Revert CSS import |
| Wrappers | 🟡 One abstraction layer | Storybook preview + axe | Revert wrapper, use old component |
| Full replacement | 🔴 Logic change | Full a11y + user test on staging | Keep old component branch, redeploy |

---

## How tokens work in your project (so you don't break them)

### For Blazor / Web

Tokens export as CSS custom properties (CSS variables):

```css
/* In the SR tokens CSS (imported into your project) */
:root {
  --sr-color-interactive-primary: #325083;        /* white text = 7.1:1 (AAA) */
  --sr-color-interactive-primary-hover: #1e3050;
  --sr-color-text-inverse: #ffffff;
  --space-2: 8px;
  --space-4: 16px;
  /* ... 200+ tokens */
}

[data-theme="dark"] {
  --sr-color-interactive-primary: #0d62a3;         /* info-blue/600 (DDR-006) */
  --sr-color-interactive-primary-hover: #004483;
  /* ... dark-mode values */
}
```

> Dark mode is driven by `[data-theme="dark"]` (with `prefers-color-scheme` as
> the default signal), not a separate stylesheet.

Use them like this:

```razor
<button style="background: var(--sr-color-interactive-primary);
               color: var(--sr-color-text-inverse);
               padding: var(--space-2) var(--space-4);">
  Save
</button>
```

**Don't do this:**
```razor
@* ❌ Hard-coded value — breaks dark mode, blocks theming *@
<button style="background: #325083;">Save</button>

@* ❌ Mixing tokens and hard-codes — inconsistent *@
<button style="background: var(--sr-color-interactive-primary); color: #333;">Save</button>
```

**When a token value changes (e.g. a colour is retuned for contrast):**
- Update the SR tokens package in your project (or re-pull the CSS)
- Rebuild
- Everything using `var(--sr-color-interactive-primary)` auto-updates
- No component code changes needed

### For MAUI

Tokens export as a XAML `ResourceDictionary` (`Tokens.xaml` / `Tokens.Dark.xaml`):

```xml
<!-- In Tokens.xaml -->
<Color x:Key="SrColorInteractivePrimary">#325083</Color>
<Color x:Key="SrColorInteractivePrimaryHover">#1e3050</Color>
<Color x:Key="SrColorTextInverse">#ffffff</Color>
<x:Double x:Key="Space2">8</x:Double>
<x:Double x:Key="Space4">16</x:Double>
```

Use them:

```xml
<Button
  BackgroundColor="{StaticResource SrColorInteractivePrimary}"
  TextColor="{StaticResource SrColorTextInverse}"
  Padding="{StaticResource Space4}"
/>
```

**When tokens update:** Same as Blazor — rebuild, all components using token
references auto-update. Merge `Tokens.Dark.xaml` under `AppThemeBinding` /
`OnAppTheme` for dark mode.

---

## What NOT to do

| Do NOT | Why | Do instead |
|---|---|---|
| Copy a component into your project and modify it | You're now maintaining two versions; updates don't flow; testing breaks | Use the published SR component, or raise an issue so design forks it on a feature branch and PRs it back to SR |
| Hard-code a colour because "it's easier" | You block dark mode, break theming, create accessibility debt | Use a token; if no token exists, request one from design |
| Import SR tokens *and* keep your old design system | Colour collision, hard to debug, products get confused | Pick one. If migrating, do it phase by phase (tokens first, components after) |
| Change a token value in your product only | You're forking the system; next product update from SR conflicts with your override | If a token doesn't work for your product, raise it. Design reviews the need; an accepted override becomes a **product-level exception** in `/products/{name}` (a DDR), not a silent change |
| Wait for "the perfect moment" to start adopting | "Perfect" never comes. Migrate one screen at a time, as you touch it | Pick a low-risk screen (something you're bug-fixing anyway) and start there |

---

## Checklist: before you adopt a component

- [ ] Component is in SR Storybook and you've read its `spec.md`
- [ ] You've checked the a11y notes (WCAG criteria, keyboard nav, AT notes)
- [ ] Token names match the generated build (`--sr-color-*`, `--space-*`), not guesses
- [ ] You've tested in light *and* dark mode
- [ ] You've tested on your target platforms (Blazor web, MAUI mobile/desktop)
- [ ] If wrapping your old component, you've tested both side-by-side on the same screen (visual regression)
- [ ] You've run axe-core or equivalent a11y testing
- [ ] You've tested with a screen reader if the component has text
- [ ] You have a rollback plan (old component branch still exists if you need to revert)

---

## Reporting bugs & requesting changes

**All feedback on the shared design system goes through GitHub issues on the org
repo** (`DHCW-Digital-Health-and-Care-Wales/single-record-design-system`). You do
not commit to the design-system repo — you describe the problem and design fixes
it on the source repo, which mirrors back. See DDR-014 for the ownership model.

| Question | Where | How |
|---|---|---|
| "How do I use token X in my project?" | Org repo | GitHub issue, label `question` |
| "I found a bug in component Y" | Org repo | GitHub issue, label `bug` — include reproduction + your use case |
| "Can I request a new component / variant?" | Org repo | GitHub issue, label `component-request` — triaged by Nonso (design) + David (product) |
| "This component doesn't work in dark mode in my app" | Org repo | GitHub issue, label `bug` — might be your theme, might be a component bug |
| "Can I fork this component / override a token for my product?" | Org repo | GitHub issue — **don't fork**; design decides if it becomes a `/products/{name}` override (DDR) |

Before filing, search existing issues to avoid duplicates.

---

## Questions worth asking before adopting

| Question | Why |
|---|---|
| "Is this component in production use elsewhere?" | Signals maturity. Beta = test on staging first. |
| "What a11y testing has it had?" | Healthcare context = high bar. Want to know if it's passed axe, keyboard nav, AT. |
| "Can I override token values for my product?" | Usually no — but if your clinical context is unique, ask. Design reviews the exception. |
| "Does this component work in dark mode?" | Yes (mandatory) — but test it in your app anyway. Your theme might not match SR's. |
| "What do I do if the component doesn't fit my use case?" | Request a new pattern or a variant. Don't fork the component. |

---

## Success metrics (how to know it's working)

| Metric | What it means |
|---|---|
| **Tokens imported, zero hard-coded colours in CSS** | Foundation is solid. Dark mode works. Theming is maintainable. |
| **One full screen migrated to SR components** | You've validated the migration path. Next screens are faster. |
| **A11y audit passes on migrated screen** | Component is accessible in your context, not just in Storybook. |
| **Light/dark mode toggle works** | Tokens are wired correctly. Users can switch themes without recompile. |
| **Zero console errors on migrated screen** | Component props and event bindings are correct. |
| **Clinical staff test the screen, no complaints about usability** | Component is fit for clinical use, not just technically correct. |
