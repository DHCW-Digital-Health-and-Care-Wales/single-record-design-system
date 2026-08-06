# DDR-021 — MAUI is native XAML, and the design system owns its token and style layer

**Date:** 2026-08-06
**Status:** Accepted
**Decided by:** Design lead
**Corrects:** DDR-011 (as summarised in `CLAUDE.md`), DDR-020 §1 (Blazor RCL channel)
**Related:** DDR-005 / DDR-015 (type scale), DDR-006 (focus ring), DDR-002 (WCAG 2.2 AA)

---

## Context

Until now this repository has recorded, in `CLAUDE.md`, `docs/for-engineers.md`
and the 2026-08-04c handoff checkpoint, that **MAUI renders the Single Record
components through a `BlazorWebView` hosting the Blazor Razor Class Library** —
"Blazor Hybrid" — and that MAUI therefore has no native-XAML components *by
design*.

That is wrong. The mobile app (`WCPMobile.Maui`) is **native MAUI XAML**. A
sample screen (`Views/Patient/PatientHomePage.xaml`) confirms it: `Grid`,
`Border`, `StackLayout`, `FlexLayout`, `TinyMvvm` for MVVM, Syncfusion controls
for `SfExpander` and `SfBadgeView`, and an existing native component set
(`DemographicsHeader`, `AdmissionControl`, `CustomLoadingSpinner`,
`TemplateHeaderFooterStandard`). There is no `BlazorWebView` anywhere in it.

The error was introduced in a single session and propagated: **29 of the 34 MAUI
code tabs on the design-system website** currently print "MAUI renders the Blazor
component through Blazor Hybrid" followed by Blazor markup, and 11 further
assertions exist across `CLAUDE.md`, `docs/` and DDR-020.

Two things limited the damage. `packages/maui` has never contained code — its
README reads *"Status: Planned — depends on `@dhcw/sr-tokens` XAML output"* — so
there is nothing to unwind. And `@dhcw/sr-tokens` already emits
`build/xaml/Tokens.xaml` and `Tokens.Dark.xaml`: **209 keys including 29 SR
semantic ones**, PascalCased for XAML, with light and dark genuinely differing.
The prerequisite that package was waiting on is already satisfied.

### What the app's existing style layer actually contains

`Colors.xaml` and `Styles.xaml` were reviewed in full. Three overlapping colour
systems coexist: the **Material 3 baseline** from the MAUI project template
(`Surface`, `OnSurface`, `SurfaceVariant`, `ErrorContainer`), a **DHCW-prefixed
set** (`DHCWPrimaryBlue`, `DHCWBackgroundClickable`, `DHCWGreen`), and the
**MAUI template greys** (`Gray100`–`Gray950`). Six different reds are in play.
A prior consolidation pass has already happened and is visible in the comments,
so the hygiene instinct is there.

Two findings matter more than the rest:

1. **`Secondary` / `DHCWBackgroundClickable` is `#12A3C9`, byte-identical to
   Single Record's `cyan.700`** — used as a filled surface with white text on
   the default `Button`, `ButtonSelected`, `ImageButtonWithBackground` and
   expander headers. That is **2.95:1**, failing WCAG 2.2 AA for normal text
   (4.5:1) and for large text (3:1). SR's own token description for
   `brand.accent` already forbids exactly this: *"Decorative accent only …
   Never use as a filled surface with text on top."* Compounding it, SR uses
   `cyan.700` as `border.focus` (DDR-006), so adopting SR focus rings over a
   cyan fill would make focus invisible on the controls that most need it.

2. **The type scale is shifted down one step.** The implicit `Label` style is
   `FontSize="12"`, which *is* SR's caption size, so caption-weight text had
   nowhere to go but smaller — hence a `Micro` class at 10px carrying
   provenance metadata (`LastReaction.LastAction`, `LastActionMessage`).

The design lead is redesigning these screens rather than retrofitting them, so
this DDR settles what the redesign builds on.

---

## Decision

### 1. MAUI is a native-XAML target. Blazor Hybrid is not in use anywhere.

`packages/blazor` (`DHCW.SingleRecord.Components`) serves **Blazor web only**.
It has exactly one audience, not two.

### 2. The design system replaces the app's token and style layer. It does not reconcile with it.

SR semantic tokens are the source of truth. The existing `Colors.xaml` is
replaced outright rather than aliased, because its assignments encode decisions
this system rejects — most importantly cyan-as-primary-fill, which is an
accessibility defect, not a stylistic difference. Preserving those keys would
carry the defect forward under a new name.

### 3. Take their idiom, not their palette.

The risk in replacing a team's resource dictionary is that it arrives feeling
foreign, so nobody extends it and it rots. Familiarity here is **structural, not
nominal**: no developer minds `SrColorInteractivePrimary` over `Primary`, but
they will mind a dictionary that does not behave like MAUI.

Their `Styles.xaml` already uses every correct MAUI mechanism. SR adopts all of
them unchanged:

| Mechanism | SR keeps it |
|---|---|
| Implicit styles (`TargetType="Button"`, no key) | Yes — a bare `<Button>` must look right with zero ceremony |
| `AppThemeBinding Light=… Dark=…` | Yes — this is how MAUI does theming |
| `VisualStateManager` for Normal / Disabled / On / Off | Yes — states belong in XAML, not code-behind |
| `StyleClass` for type variants | Yes, carrying SR's scale |
| Keyed styles for intent (`SaveButton`, `CancelButton`) | Yes, as `ButtonPrimary` / `ButtonDestructive` |
| `OnPlatform` / `OnIdiom` | Yes |

`packages/maui` ships `Colors.xaml` and `Styles.xaml` as drop-in replacements at
the same paths, adopted with one `MergedDictionaries` entry.

### 4. Colour: `blue.800` stays primary. The DHCW navy does not enter the palette.

`interactive.primary` remains `blue.800` `#325083` (a Hard Constraint, and
re-affirmed here). The organisational navy `#2C3E72` is **not** added to SR's
primitives. Where the app currently uses it for chrome (`DHCWNavBar`,
`DHCWBackgroundNonClickable`), the SR equivalent is **`navy.900` `#1B294A`** —
what the SR Header already uses for its masthead. If brand compliance requires
`#2C3E72` somewhere specific, it lives in the app beside the logo, outside SR's
semantic layer.

`DHCWBackgroundClickable` is **deleted**, not remapped. Its usages become
`interactive.primary`. This is the one change that will be visible on every
screen, and it is the reason for the exercise.

### 5. Type: base moves to 14px, 12px is the floor, `Micro` is deleted.

The implicit `Label` becomes `body-s` **14/20**. Caption stays **12/16** and
takes over what `Micro` was doing — which makes that text *larger* than before.
Hierarchy is preserved by the 14 → 12 step plus `text.secondary` (`#4C6272`,
7.2:1, AAA, safe for real content).

**Caption does not go below 12px.** 12 is already smaller than anything GDS
(14px) or NHS England (14px) ship, and at or below Material 3 (`body-small`
12sp) and the iOS HIG floor (11pt). That latitude is spent. WCAG 2.2 sets no
minimum size, so there is no rule either way — but no reference remains to cite
below 12, and mobile is the worst place to shrink text: variable holding
distance, ward and bedside lighting, glare, screen protectors, gloves, and staff
late in a twelve-hour shift.

When density genuinely bites, spend colour, weight, caption's tighter 16px
line-height, truncation or progressive disclosure. Not size.

| Their class | Size | Job | SR replacement |
|---|---|---|---|
| `Title` | 18 bold | Section heading | `heading-s` 20/28 |
| `Large` | 18 | — | `heading-xs` 16/24 |
| `Medium` | 16 | Emphasis body | `body-m` 16/24 |
| *(implicit)* | **12** | **Body text** | **`body-s` 14/20** |
| `Small` | 12 | Duplicate of implicit | `caption` 12/16 |
| `Micro` | 10 | Provenance metadata | `caption` 12/16 |

### 6. Syncfusion: wrap what the design system would never design; build what it already has.

Syncfusion stays. It is justified — but by roughly one control, not by a suite.
Only **3 of ~50 styles** in the app's `Styles.xaml` target a Syncfusion type
(`SfCheckBox`, `SfTabItem`, `SfTextInputLayout`), and **0 of ~50 colours** do.

| Control | Action | Licensed build needed |
|---|---|---|
| `SfPdfViewer` | **Wrap** as `SrDocumentViewer` | Yes — implemented by a developer with a seat |
| `SfListView` | Wrap **only if** `CollectionView` measurably underperforms. Defer. | Defer |
| `SfTextInputLayout` | Build natively — `components/input/` already specifies it | No |
| `SfCheckBox` | Build natively | No |
| `SfExpander` | Build natively, or `CommunityToolkit.Maui`'s `Expander` | No |
| `SfBadgeView` | Build natively — a `Border` over a `Grid` | No |
| `SfTabItem` | Build natively | No |

Wrapping isolates the dependency to one file, applies SR theming once where it
cannot be forgotten, and means replacing Syncfusion later changes one file
rather than every screen.

**Division of labour:** the design system specifies the wrapper's API and visual
contract; a developer with a Syncfusion seat implements it. The design lead does
not need a licence — ~94% of the styling surface is stock MAUI, and the
remainder is verified in a short pairing session.

### 7. The website carries MAUI **code**, not a live MAUI **embed**.

- **Code tabs: yes, and properly.** XAML is text; `codePanel()` already renders
  it. The MAUI tab carries real native XAML on every component page.
- **Verified, like the React tabs.** The site build already reads each React
  component's props from source and fails when a snippet uses one that does not
  exist. The XAML analogue: **every `{StaticResource …}` in a MAUI snippet must
  resolve against the emitted `Tokens.xaml` / `Styles.xaml`, or the build
  fails.** This is what stops the MAUI tab drifting the way the React tabs did.
- **Live interactive embed: no.** No browser runs XAML. Sandpack works for Case
  Note Tracking because that prototype is React — web technology compiling in
  the visitor's browser. There is no equivalent for MAUI.
- **Rejected: an HTML facsimile of each MAUI screen.** It would look
  authoritative, drift within a week, and create a second implementation of
  screens the design system does not own. That directly contradicts the standing
  rule that the code packages are the source of truth and prototypes never
  restyle what they demonstrate.
- **A mobile prototype page instead carries three honest artefacts:** the
  **Figma prototype** (interactive, and the design source so it cannot drift),
  **screenshots from a real build** (proof it renders), and the **real XAML**
  (copyable and build-verified).

---

## Consequences

**Corrections required**

1. `CLAUDE.md` — Technology Context table and the MAUI/Blazor Hybrid paragraph.
2. `docs/for-engineers.md` — the whole "What runs where" section.
3. `decisions/handoff.md` — the 2026-08-04c checkpoint recorded this as settled;
   it needs a correction entry rather than a silent edit.
4. **DDR-020 §1** — routes the Blazor RCL to NuGet "for Blazor web **and** MAUI,
   which renders the same components". MAUI needs its own NuGet package,
   `DHCW.SingleRecord.Maui`, versioned in lockstep.
5. **29 MAUI code tabs on the website.** They cannot be written correctly until
   `packages/maui/Styles.xaml` exists, so they are staged: an honest interim
   note first, real XAML per component after.
6. `packages/maui/README.md` — describe the actual deliverable.

**Accepted trade-offs**

- No live mobile preview on the website. Figma plus screenshots plus verified
  code is the substitute, and it is honest about what it is.
- Replacing rather than aliasing the app's dictionary means visible change on
  every redesigned screen. Accepted: the cyan contrast failure is the reason.
- The Syncfusion licence remains necessary for the PDF viewer. Narrowing the
  justification to one control is the win, not removal.

**Duplication found in the token source — needs sign-off, not a quiet fix**

The four semantic border colours are declared **twice**: as `color.border.*` in
`foundations/tokens/border.json` and as `sr.color.border.*` in
`foundations/tokens/semantic/color.json`. Both emit, so every build carries
`ColorBorderSubtle` *and* `SrColorBorderSubtle` in XAML, and
`--color-border-subtle` *and* `--sr-color-border-subtle` in CSS. Values agree
today, which is why nobody noticed.

Only one place consumes the unprefixed form: `packages/web/src/button/button.css`
(`var(--color-border-subtle)`). Removing the duplicate is therefore a one-line
consumer change — but it is a **token-structure change**, which `CLAUDE.md`
requires explicit sign-off for, and it is not on the MAUI critical path. Left in
place deliberately, recorded here so the MAUI style layer uses the `Sr`-prefixed
keys exclusively and does not entrench the duplicate.

**Open, needs verification before build**

- **Confirm `#12A3C9`-on-white independently.** If it holds at 2.95:1 it is an
  accessibility fix that outranks everything else here and should not wait.
- `PatientHomePage.xaml` references `NWISBlack`, `NWISBlackDark` and `NWISGrey`,
  none of which exist in the `Colors.xaml` supplied. Either a second dictionary
  exists or that screen throws at parse time.
- The `ExpanderView.Header` / `.Content` / `.Arrow` styles use class selectors
  that are not Syncfusion syntax, while the sample screen uses
  `syncfusion:SfExpander`. There may already be a non-Syncfusion expander in the
  app, which would reduce the Syncfusion surface further.
- **Test at 200% font scale early.** `FontAutoScalingEnabled` defaults to `true`
  on `Label`, and the app has fixed heights that will clip scaled text
  (`RowDefinitions="30"`, `HeightRequest="60"`, the icon size styles). SR styles
  should use `MinimumHeightRequest` wherever text is involved.

---

## Alternatives considered

**Reconcile with the existing palette, aliasing SR values behind the app's
existing keys.** Rejected. It preserves `DHCWBackgroundClickable` as a concept,
which is the accessibility defect; and it front-loads a migration cost for
screens that are being redesigned anyway. A translation layer would have been
right for a retrofit, and this is not one.

**Keep Blazor Hybrid as an aspiration and build native XAML as an interim.**
Rejected. There is no evidence anyone wants a `BlazorWebView` in this app, and
carrying a phantom target distorts every downstream decision, as it already has.

**Build a MAUI component library from scratch, ignoring the existing app.**
Rejected. `DemographicsHeader`, `AdmissionControl` and the header/footer template
already work in production. The design system aligns them; it does not compete
with them.

**Replace Syncfusion with free libraries throughout.** Rejected for the PDF
viewer specifically. `CommunityToolkit.Maui` and UraniumUI (both MIT) cover
ordinary controls, but no free MAUI PDF viewer loads from a memory stream
without significant custom engineering across two platforms. DevExpress was
investigated and is trial-only, not free.

---

## References

- DDR-011 — form-factor model (its body already said "MAUI idiom, `OnIdiom`,
  device-specific XAML"; the Blazor Hybrid framing was added later, in summary)
- DDR-015 — primary content minimum 14px
- DDR-006 — cyan focus ring
- DDR-019 — why the Sandpack embed works for React, and therefore why it cannot
  work here
- DDR-020 — package distribution; §1 amended by this record
- `WCPMobile.Maui` `Views/Patient/PatientHomePage.xaml`, `Colors.xaml`,
  `Styles.xaml` — the evidence base
- GOV.UK Frontend and NHS.UK Frontend type scales (smallest style 14px)
- Material 3 type scale; Apple Human Interface Guidelines (11pt floor)
