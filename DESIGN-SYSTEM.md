# Single Record Design System

The Single Record Design System provides the shared design language, component library, and interaction patterns for all products under the Single Record programme at Digital Health and Care Wales (DHCW).

This document is the primary reference for everyone working on Single Record — designers, engineers, and delivery leads.

**Last reviewed:** 2026-08-12. Update this file whenever a component ships, a
token is added, or a system-wide rule changes — not on a schedule. If it
disagrees with `/foundations/tokens/` or `/components/`, those win and this file
is out of date.

---

## Purpose

The design system exists to ensure that every Single Record product — across EPR, patient administration, and future areas — is visually consistent, clinically safe, and accessible to all users.

It achieves this by:

- Defining a single set of design tokens (colour, typography, spacing, elevation) used across all products and platforms
- Providing a library of tested, accessible components and interaction patterns
- Maintaining a permanent record of design decisions so that the team can understand why, not just what

This is a healthcare system. Design decisions affect clinical staff, administrative staff, and ultimately patients. Accuracy, accessibility, and consistency are non-negotiable.

---

## Who This Is For

| Role | Primary use |
|---|---|
| Designers | Figma library, tokens, component specs, pattern guidance |
| Engineers | Token consumption, component implementation, platform integration |
| Delivery leads | Understanding system scope, product boundaries, decision history |
| New team members | Orientation to standards, structure, and contribution workflow |

---

## Standards

All Single Record products must comply with the following standards.

| Standard | Role | Mandatory? |
|---|---|---|
| WCAG 2.2 AA | Accessibility baseline | Yes — all components and products |
| WCAG 2.2 AAA | Extended accessibility target | Where feasible |
| GDS Design System | Primary reference for patterns and interaction design | Yes — follow unless documented otherwise |
| NHS England Design System | Reference for clinical UI conventions | Yes — follow unless documented otherwise |
| CDPS Wales | Welsh-language and public sector guidance | Yes |

Departures from GDS or NHS England patterns must be recorded in a Design Decision Record (DDR) before implementation.

---

## Foundations

Foundations are the base layer of the system — the raw materials that components and patterns are built from. Everything in the system traces back to a foundation token.

| Foundation | Location | Description |
|---|---|---|
| Colour | `/foundations/tokens/colour/` | Global palette and semantic colour system |
| Typography | `/foundations/tokens/typography.md` | Typeface, scale, line height, letter spacing |
| Spacing | `/foundations/tokens/spacing.md` | 4px base grid, component and layout spacing |
| Elevation | `/foundations/tokens/elevation.json` · [`.md`](foundations/tokens/elevation.md) | Two functional shadow steps: `raised`, `overlay` |
| Motion | `/foundations/tokens/motion.md` | Duration, easing, animation principles |
| Border | `/foundations/tokens/border.md` | Border widths and radius scale |
| Iconography | `/foundations/iconography.md` | Icon library, sizing, usage |
| Logos | `/components/logos/guidelines.md` | Brand marks: 5 subgroups × icon/full × light/dark. **Only the `dhcw` lockup and icon are exported** — see the guidelines for the gap and the four Figma fixes needed before the rest can ship |
| Grid and layout | `/foundations/grid-and-layout.md` | 5 breakpoints (Mobile → XLarge), columns, gutters, EPR content zones. Synced from Figma `289:301` on 2026-08-03 |

### Token Structure

Design tokens follow a three-tier structure:

```
Tier 1 — Global (primitives)
  Raw palette values: colour hex codes, px sizes, raw font values.
  Stored in: /foundations/tokens/primitives/
  Never referenced directly in components.

Tier 2 — Semantic
  Meaningful aliases: "primary button colour", "body text size".
  Stored in: /foundations/tokens/semantic/
  Used by components and patterns.

Tier 3 — Component (per component)
  Component-specific overrides that reference semantic tokens.
  Stored within each component spec.
  Added only when a component genuinely diverges from semantic defaults.
```

Token names follow the pattern: `{tier}.{category}.{variant}` — for example `sr.color.interactive.primary` or `sr.typography.body-m`.

### Colour System

The colour system is built from four brand palettes (Blue, Cyan, Navy, Grey) and four status palettes (Red, Green, Yellow, Info Blue). The `Single Record` collection in Figma exposes semantic aliases with Light and Dark mode variants.

| Palette | Primary role |
|---|---|
| Blue | NHS Wales brand primary — buttons, links, interactive states |
| Cyan | DHCW brand secondary — accents, highlights, focus ring (Cyan/700 per DDR-006) |
| Navy | Deep brand navy — headers, structure |
| Grey | Neutral UI — text, borders, surfaces |
| Red | Error / critical status |
| Green | Success status |
| Yellow | Warning status |
| Info Blue | Informational status |

See `/foundations/tokens/colour/global.md` for the full primitive palette and `/foundations/tokens/colour/semantic.md` for semantic token definitions and contrast ratios.

**Dark mode is behind the light-mode work, and deliberately so.** Light-mode
semantic assignments — which colour means which state, which surface, which
interaction — have moved a long way and are still moving. Re-deriving the dark
values after every one of those changes would cost more than it is worth and
would still be wrong at the end. The dark tokens build and are structurally
complete; they are not yet reviewed against the current light-mode meanings, so
treat them as provisional. The pass to reconcile them is a deliberate later
step, taken once the light-mode assignments hold still — not an oversight, and
not something to do piecemeal alongside other work.

### Typography System

The system uses **Roboto** as its only typeface across all platforms. It is
vendored at `packages/tokens/fonts/` (Apache 2.0) and emitted by the token build
as `build/css/fonts.css`, with the face embedded as a data URI so it resolves
with no network request — including inside sandboxed prototype embeds. **Import
`fonts.css` alongside `tokens.css`;** without it every surface falls back
silently, which is the failure this replaced.

The semantic type scale provides named styles for use in Figma and component specs:

| Style | Desktop | Usage |
|---|---|---|
| `heading-xl` | 36px bold | Page-level titles |
| `heading-l` | 28px bold | Section headings |
| `heading-m` | 24px bold | Sub-section headings, card headers |
| `heading-s` | 20px bold | Panel headings, modal titles |
| `heading-xs` | 16px medium | Inline labels, compact contexts |
| `body-m` | 16px regular | Preferred for long-form reading and clinical notes |
| `body-s` | 14px regular | Supporting text, secondary content |
| `label` | 14px medium, wide tracking | Form labels, column headers, button text |
| `caption` | 12px regular, caption tracking | Timestamps, metadata, annotations |

**`body-s` (14px) is the minimum for primary content**, including tables and
data-dense views (DDR-015, which supersedes the earlier 16px rule inherited
from public-facing NHS/GDS practice). `body-m` (16px) remains *preferred* for
long-form reading and clinical notes. `caption` (12px) is for non-essential
text only and must never be the sole carrier of meaning — patient identifiers,
allergy detail and alert counts are therefore never `caption`.

**Applying a style.** A style is only correct when all four of its properties
are applied together. In markup, use the `.sr-type-{name}` class. In component
CSS, which cannot add a class it does not own, use the composite pair — always
both, never one:

```css
font: var(--sr-type-label-font);
letter-spacing: var(--sr-type-label-letter-spacing);
```

Never hand-pick `--font-size-*` / `--font-line-height-*` to assemble a style:
that is how off-scale pairs such as 16px/700 and 12px/20px entered the system.
`npm run check` (`check:type` + `check:ds`) fails on new occurrences. As of
2026-08-03 the typography debt is **5 declarations in one file** (`button.css`,
where button text is 16/24 rather than the `label` style — see the open
question below); it was 128 across 17 files before the composite properties
existed.

`check:ds` additionally fails on any new hardcoded colour, any `font-family`
outside the token build, and any inline `<svg>` where an `<Icon>` belongs.

**Open question — button text size.** `DESIGN-SYSTEM.md` lists `label` as the
style for button text (14/20/500), but `button.css` renders default and large
buttons at 16/24 and small at 12/16. Changing it would alter every button in
the system, so it is left as-is and flagged rather than decided unilaterally.

See `/foundations/tokens/typography.md` for the full specification.

---

## Components

Components are discrete UI elements defined at the design level. Each component has a spec in `/components/{component-name}/spec.md` covering:

- Purpose and when to use it
- Anatomy
- States and variants
- Usage guidance
- Accessibility requirements
- Known limitations

**Status key.** *Spec* is the design contract in `/components/`. *Web* is the
reference HTML/CSS in `packages/web/src/` — the layer Blazor and MAUI also consume.
*React* is the wrapper in `packages/react/src/`.

| Component | Spec | Web | React |
|---|---|---|---|
| Autocomplete | ✅ | ✅ | ✅ |
| Bottom nav | — | ✅ | ✅ |
| Breadcrumbs | — (guidelines ✅) | ✅ | ✅ |
| Button | ✅ | ✅ | ✅ |
| Checkbox | ✅ (guidelines ✅) | ✅ | ✅ |
| Date input | — | ✅ | ✅ |
| Date picker | — | ✅ | ✅ |
| Footer | — (guidelines ✅) | ✅ | ✅ |
| Header | — (guidelines ✅) | ✅ | ✅ |
| Input | — | ✅ | ✅ |
| Link | ✅ | — | — |
| Modal dialog | ✅ | ✅ | ✅ |
| Navigation | — (guidelines ✅) | ✅ | ✅ |
| Patient banner | ✅ | ✅ | ✅ |
| Progress indicators | ✅ | — | — |
| Radio | ✅ (guidelines ✅) | ✅ | ✅ |
| Search | ✅ | — | — |
| Segmented control | — (guidelines ✅, with Switch) | ✅ | ✅ |
| Select | ✅ (guidelines ✅) | ✅ | ✅ |
| Status indicator | — | ✅ | ✅ |
| Switch | — (guidelines ✅, with Segmented control) | ✅ | ✅ |
| Table | ✅ | ✅ | ✅ |
| Tags | ✅ | ✅ | ✅ |
| Time select | — | ✅ | ✅ |

**Known gaps, stated plainly:** eleven components ship code without a spec, and
three specs (Link, Progress indicators, Search) have no code. Neither is
satisfactory — a component without a spec has no agreed contract, and a spec
without code cannot be consumed. Both lists are worked down as components are
touched.

**No Menu/Dropdown component, and no Tabs component.** The Case Note Tracking
prototype's row-level action menu (Figma `47:4041`) needed a small popover
list — send/receive/tag/merge/deactivate/delete — and its My Requests screen
(`127:4813`) needed an All/Sent/Received tab switcher, with neither component
in this table to reach for. Both are built locally, from tokens only, in
`products/case-note-tracking/prototype/src/shared/RowActions.jsx`
(`RowActionMenu`) and `MyRequests.jsx` (the tab buttons) — scoped to that
prototype rather than promoted to `packages/web`/`packages/react`. Promote
either once a second consumer needs the same pattern, with a spec in
`/components/menu/` or `/components/tabs/`.

**Navigation, Breadcrumbs and the two Toggles now have website pages.**
Navigation had guidelines and full code and no page at all. Switch and
Segmented control are published together as **Toggles**, because the Figma set
(`1414:16858`) groups them and the first real decision is which of the two you
need: a switch answers "is this on?", a segmented control answers "which of
these?". They stay two components in code — different APIs, different ARIA —
under one guidelines document, `components/toggles/`.

**Navigation's icon-only width was wrong in code.** `.sr-nav--collapsed` was
72px; Figma (`3569:15850`, `2212:7613`) and the component's own guidelines both
say **48px**. Corrected to 48px, with the list padding reduced so a 24px icon
still centres.

**Breadcrumbs and Toggle switch are now documented.** Both had shipped code in
`packages/web` and `packages/react` with no guidelines and no website page —
code nobody could find. Both now have `components/{breadcrumbs,switch}/
guidelines.md` and a page under Components. Breadcrumbs also gained the `Back`
type from Figma `1307:19303`, which the implementation had omitted: a
four-level trail wraps on a phone, and the set has always carried a
single-step alternative for exactly that case. Neither has a `spec.md` yet.

**No destructive-confirmation dialog component yet.** Deactivate/Delete row
actions use a confirmation dialog matched to the design system's own Figma
frame (`x5fwyefxxgD03csz8ld7SZ`, node `2612:3325`), which is not yet added to
this website or given a spec — `ConfirmModal` in the same `shared/
RowActions.jsx` composes it from the existing base `Modal` and `Button
type="destructive"`, so it is not a new component, just an undocumented
pattern. Document it under `/components/modal/` once it has a second
consumer.

**Header and Footer website coverage was incomplete.** Header (Figma
`475:19980`) ships three variants — `desktop`, `desktop-2`, `mobile` — but the
website page showed only `desktop-2`; it now shows all three, each labelled
with its Figma type and, for `desktop`/`desktop-2`, a note that MAUI has no
equivalent since it is mobile only. Footer (Figma `665:16525`) is different:
its `Mobile` type (`665:16526`) is not a scaled-down version of the `Desktop`
bar — it is the persistent bottom tab bar, already built as its own component,
`BottomNav`. Footer's website page now **shows** that type, rendered from
`BottomNav`, under a `Type: Mobile` heading — the Figma Footer page
(`1322:15480`) carries both bars, so a reader looking up Footer should find
both. `BottomNav` still has no page of its own under its own name; it is
reached through Footer, which is where the design file puts it.

**The Footer is on every screen, pinned.** It is persistent chrome, not page
content: the version has to be reachable everywhere because it is what staff
read out when reporting a fault, and a bar that appears on some screens and
not others reads as a layout bug. A screen with no committing action gets the
bar with the version alone — `Footer` renders no buttons unless given some,
rather than falling back to a generic pair that would do nothing. Pinning is
`position: sticky`, not `fixed`, so the bar stays inside its own column and
stops at the sidebar without the component having to know the sidebar's
width; the page owes it a full-height column, noted in the component's
guidelines.

**`Footer` takes an `actions` slot.** Its own guidelines require the action
labels to name the screen's specific action ("Mark as complete", not
"Submit"), which the component could not honour while the labels were fixed
in its markup — SendIT needs *Print Labels* and *Approve Summary list*. The
Save/Mark-as-complete pair remains the default, so nothing existing changed.
Whatever a screen passes must still keep to the pattern: exactly one primary,
and no destructive action in persistent chrome.

**`Autocomplete` can be marked required.** Every other form field in the
system could express `required`, so a required combobox — SendIT's "Open
existing batch" — had no way to say so, visually or to a screen reader. It now
takes `required`, rendering the same marker as `Input` and `Select` and
setting `aria-required`.

**A wide table no longer drags the page sideways.** `.sr-table-wrap` sets
`overflow-x: auto` so a table wider than its container scrolls, but that
alone does not stop the table extending the *page's* horizontal scroll — the
wrapper scrolled and the whole page scrolled behind it. Every consumer had
been unknowingly working around it by nesting the table inside a second
`overflow-x: auto` ancestor; SendIT's batch summary, which does not, exposed
it (72px of page scroll at 390px). The wrapper now adds `contain: paint`,
which is what actually holds the table inside it. No visual change — a scroll
container already clips — and the table still scrolls internally.

**The website was restyling the components it documents.** Three defects, one
cause — page-level CSS in `packages/website/site.css` reaching into the
component previews and the component markup:

- `.content h2 { margin: 40px 0 12px }` (0,1,1) outranked the Patient Banner's
  own `.sr-patient-banner__name { margin: 0 }` (0,1,0), so the patient's name
  sat ~40px below the alert cards it is meant to align with — in every variant
  on the page. Page-copy rules are now excluded from `.showcase__preview`
  descendants.
- `.content th { border-bottom: 2px solid … }` gave every table on the site,
  including the Table component's own example, a heavy rule under the header
  row that the Table component does not have (Figma `1363:22598`: tinted
  header, no rule). The site's documentation tables now match the component,
  and `.sr-table` is excluded from them outright.

A design system website that restyles its own components documents something
that does not exist. Both fixes are containment, not new styling.

**Type=Fill keeps its tint when collapsed.** The collapsed Patient Banner's
count pills were outlined in both types, so a Fill banner appeared to become a
Border banner when the user collapsed it. Collapsing changes how much detail is
shown, not which type the banner is — Fill's pills now carry the same Red/50
and Yellow/100 as its expanded alert cards (Figma `1711:15585`).

**Three more leaks from the website's page CSS, same cause as the two above.**
`.content a` painted every BottomNav tab blue, which hid the fact that only the
current tab is blue. `publicise()`'s empty-section pruner dropped any heading
immediately followed by another heading, which silently deleted "Type: Switch"
and "Type: Segmented control" from the Toggles page — it now only prunes a
heading followed by one at the same or higher level. And `inline()` had no
emphasis rule, so `*submit*` printed its asterisks.

**BottomNav rest state is Text/Secondary; hover and current are
Interactive/Link.** Hover previously went to Text/Primary — darker than rest,
which reads as the control switching off under the cursor. A tab bar is
navigation, and blue is what "you can go here / you are here" means everywhere
else in the product.

**`Input` type=calendar and type=time could not carry a value.** They were the
only Input types that dropped `...rest`, so `value` / `defaultValue` /
`onChange` never reached `DatePicker` or `TimeSelect` and a pre-filled date
rendered as an empty placeholder. Found by the Case Note Tracking send-from-tag
flow, which exists to pre-fill exactly that field.

**`RadioGroup` takes `hideLegend`**, matching `hideLabel` on Input and
Checkbox. A group whose name is already given by the surrounding copy still
needs a legend for screen readers; the alternative in use was dropping the
legend, which leaves an unnamed fieldset.

**The web package now ships files, not just source.** A developer adopting the
system needs something to put in an application, and until now this package
offered 21 separate component stylesheets and a `main` field pointing at an
`index.css` that did not exist — so the honest answer to "where are the CSS and
JS files?" was "there aren't any". `npm run build:web` now writes
`packages/web/dist/`: one flattened `single-record.css` (font + tokens +
typography + every component), an opt-in `single-record-dark.css`, `icons.js`,
`sprite.svg`, and the individual component stylesheets. Concatenation and file
copies only — no bundler, so no new dependency and no DDR needed. The website
serves the same files from its **Get the files** page, and its build fails if
`dist/` is missing rather than publishing a page of dead links.

The component list is read from the directory, not hand-maintained, so a new
component cannot be added to the repo and left out of the bundle — the failure
that produces "it works on the website but not in my app".

**Sprite symbols carry their own presentation attributes.** The generated
`<symbol>`s had only a `viewBox`, so a `<use>` reference inherited the SVG
defaults (fill black, no stroke) and these stroke-drawn outlines rendered as
nothing. The attributes now live on the symbol, which is what makes a bare
`<svg><use href="sprite.svg#icon-nav-search"></use></svg>` work for a consumer
with no JavaScript build step.

**Navigation is 248px, and so is the grid.** The component had shipped at 220px
while `foundations/grid-and-layout.md` derived its EPR content zones from
248px — the width the Figma grid frame and the Figma nav item block
(`665:21099`) are both drawn at. Reconciled on both sides together: the
component is 248px and the EPR content zones are 1192px at 1440 and 1032px at
1280. 220px was also 4px too narrow for a row carrying both a badge and a
chevron, which is what surfaced it.

**React snippets on the website are now checked against the components.**
The Button page said `<Button variant="primary">` while the component's prop is
`type` — copying it gave a button that silently ignored the variant. Two more
were wrong (`SegmentedControl label`, `Navigation state`/`onToggle`) and the
Table page showed the Blazor component name with a prop React does not have.
The website build now reads each component's destructured props out of its own
source and fails if a snippet uses one that does not exist. A documentation
snippet that does not work is worse than no snippet, because the reader has no
reason to doubt it.

**Distribution has a decision record: DDR-020.** Registries (public npm for the
web packages, NuGet for the Blazor RCL — which serves **Blazor web only**, not
MAUI; see DDR-021), one version across all packages, 0.x until the token
semantics settle, and release by git tag through CI. Status is **Proposed**: it needs governance sign-off,
and — the blocking item — the npm scope has to be agreed with DHCW. `@dhcw` is
not this programme's to take: DHCW is building its own design system and Single
Record is a programme within it, while an npm scope is one global name owned by
one account. The packages are named `@dhcw/sr-*` today and that changes with
the scope decision, before anything is published.

See `/components/README.md` for the full catalogue and contribution guidance, and
the live catalogue in Storybook for every variant.

---

## Patterns

Patterns are composed interactions and page-level solutions built from components. They address common clinical and administrative workflows.

Patterns live in `/patterns/`. Each pattern follows the template in `/docs/templates/pattern-template.md`.

| Pattern | Guidelines | DS website page | Notes |
|---|---|---|---|
| Patient banner | ✅ `components/patient-banner/guidelines.md` | ✅ `patterns/patient-banner.html` | Two types (`Fill`, `Border`) and two states (`Expanded`, `Collapsed`) — **all four are live**. Fill vs Border has not been user-tested; keeping both is provisional. |

**Known gap:** forms, search and sign-off flows are named in the pattern
intro but have no guidelines file and no website page. Only the patient
banner is documented.

---

## Prototypes

Working product prototypes, authored by design and built entirely from this system. They exist to show the design intent running, to give engineering a readable starting template for the UI layer, and to test the system against a real product before it reaches production. Nothing in a prototype restyles a design-system component — if a prototype looks wrong, the design system is wrong.

They live under `/products/{product}/prototype/` and consume the design-system packages as npm workspace siblings, so they always render the current version of every component with no sync step.

| Prototype | Location | State |
|---|---|---|
| Case Note Tracking | `products/case-note-tracking/prototype/` | Dashboard, Patient Search, the single-patient casenote view, My Requests and the SendIT batch flow are built. ReceiveIT, TagIT and Settings are nav entries only. |

**Prototypes are not shippable.** Mock data only, no API integration, no authentication, no error or loading handling, no tests, no security review.

They are published on the design-system website under **Prototypes**, which embeds each one live via Sandpack (DDR-019) — a plain preview/code toggle, generated from the actual source at every site build. No repository visibility is required to view them; the embed doesn't clone a repo at all, it's handed the files directly. To run one locally instead, install from the **repository root** (not the prototype folder, whose design-system dependencies are unpublished workspace members) and run `npm run dev:prototype`.

---

## Content rules

System-wide rules that apply to every product, not just one component.

| Rule | Detail |
|---|---|
| **Dates** | `10 Mar 2026` in tables and space-constrained UI. `10 March 2026` in prose and anywhere without a width constraint. **Never all-numeric** (`06/12/21`) — a named month is what removes day/month ambiguity, which is a clinical-safety requirement, not a style preference. Adapts UI Standards p.24; set 2026-07-28. |
| **Casing** | Sentence case everywhere, including headings, labels and buttons. |
| **Names** | `SURNAME, Forename(s)` with any title in brackets. |
| **Buttons** | Name the action and its subject — "Confirm patient", never "OK" or "Yes". |
| **Abbreviations** | Avoid them. `No.` for "Number" in a tight table heading is a documented exception. |
| **Empty states** | Say what is absent — "No known adverse reactions", not a blank panel. Absence of data and absence of a finding are clinically different. |

---

## Accessibility

WCAG 2.2 AA is the mandatory baseline for all components and products. The `/accessibility/` directory contains:

| File | Contents |
|---|---|
| `/accessibility/README.md` | Overview, testing approach, role assignments |
| `/accessibility/colour-and-contrast.md` | Contrast ratios, colour-only communication guidance |
| `/accessibility/focus-management.md` | Focus ring standards, keyboard navigation |

Every component spec must include an accessibility section. New components are not approved without it.

---

## Design Decisions

Design decisions that affect the system — token choices, pattern departures, structural changes — are recorded as Design Decision Records (DDRs) in `/decisions/`.

| Decision | Summary |
|---|---|
| DDR-001 | 4px base spacing unit |
| DDR-002 | WCAG 2.2 AA as mandatory baseline |
| DDR-003 | Lucide icon library |

Use `DDR-000-template.md` as the starting point for new records. A DDR is required before any non-trivial structural change is made.

---

## Figma Library

The Figma file is the **source of truth** for visual design. All component specs and token definitions in this repository must match Figma. If they conflict, raise it with the design lead — do not resolve it silently.

| Collection | Contents | Visibility |
|---|---|---|
| `Primitives` | Raw palette and scale variables | Internal — not published to library |
| `Single Record` | Semantic aliases — colour, typography, spacing, border, radius | Published to library |

The `Single Record` collection has two modes: **Light** and **Dark**.

### Guidelines frames

Usage guidance is mirrored into Figma as a `Guidelines/{topic}` frame on the
topic's own page, so designers read the same rules as the DS website without
leaving the file. Each frame is sourced from that topic's `guidelines.md` — the
markdown is the single source, and the two must not fork.

| Frame | Page | Node |
|---|---|---|
| `Guidelines/Colours` | Colours | `3468:9073` (reference pattern) |
| `Guidelines/Icons` | Icons | `4380:33481` |
| `Guidelines/Logos` | Branding | `4329:26` |
| `Guidelines/Navigation` | Navigation | `4380:33504` |
| `Guidelines/Header` | Header | `4380:33527` |
| `Guidelines/Footer` | Footer | `4380:33550` |

See `/figma/README.md` for tooling guidance and `/figma/variable-mapping.md` for the full token-to-variable mapping.

---

## Technology

The design system is **implementation-agnostic at the design level**. Tokens are defined in W3C Design Token JSON format and mapped to platform-specific outputs by engineers.

| Platform | Technology | Status |
|---|---|---|
| Web (reference baseline) | Standard HTML / CSS | Current |
| Web applications | Blazor / .NET | Current |
| Web applications | React | Current |
| Mobile (phone, tablet) | .NET MAUI — **native XAML** | Current |
| Legacy web | .NET Framework 4.8 | Limited — tokens via CSS only |
| Legacy desktop | Delphi | Maintained, not extended |

**MAUI is native XAML, not Blazor Hybrid (DDR-021).** What the design system
ships for it is a token and style layer, not a parallel component library:
`Colors.xaml` (210 resources, generated from the tokens), `Icons.xaml` (120 icons
as XAML path geometry, generated from the same SVGs as the web icon set), and a
hand-authored `Styles.xaml` of implicit styles, keyed intent styles and the
`StyleClass` type scale. All in `packages/maui`.

Two things a MAUI consumer needs to know up front. Prefer **`StyleClass` over
`Style` on a `Label`** — an explicit `Style` replaces the implicit one and
silently drops the font family, themed colour and disabled state. And **medium
weight is currently unreachable**: SR's `label` and `heading-xs` are 500 weight,
MAUI's `FontAttributes` offers only Regular and Bold, so both render regular
until `Roboto-Medium.ttf` is bundled.

`packages/maui/testbed` is a MAUI app that puts the layer on a real device, with
a diagnostics page covering theme flipping, font scale, every stock control and
all 120 icons. Nothing in the MAUI layer has been compiled yet — it is verified
statically (resource resolution, icon geometry against source, no literal
colours) and that gap is named in `packages/maui/README.md`.

Code implementation guidance lives in `/docs/for-engineers.md`.

---

## Repository Structure

```
/foundations       Design tokens: colour, typography, spacing, elevation, motion, iconography
/components        Individual UI components — one folder per component
/patterns          Composed interactions and page-level patterns
/accessibility     WCAG 2.2 guidance, focus management, contrast, assistive technology notes
/decisions         Design Decision Records — permanent log of significant choices
/docs              Guides for designers and engineers; templates for specs and DDRs
/figma             Figma variable mapping, library structure, handoff conventions
/products          Product-specific extensions (EPR, patient admin, etc.)
```

---

## Contributing

### Designers
See `/docs/for-designers.md` for the full guide. In brief:

1. All new components and patterns must be designed and approved in Figma before any spec is written.
2. Use existing semantic tokens — do not introduce new values without a DDR.
3. Accessibility annotation is required before handoff.

### Engineers
See `/docs/for-engineers.md` for the full guide. In brief:

1. Reference semantic tokens only — never hardcode values.
2. Component specs define the required behaviour; implementation is in the relevant platform repo.
3. Any token or component change that affects published code requires a DDR.

### Everyone
- Check `/decisions/` before proposing a structural change — it may already have been decided.
- Follow commit conventions in `CLAUDE.md`.
- Raise accessibility concerns early — retrofitting is expensive.

---

## Product Scope

The core system is shared across all Single Record products. Products may extend — but must not contradict — the core.

| Area | Location |
|---|---|
| Core system | `/foundations`, `/components`, `/patterns` |
| EPR-specific | `/products/epr/` |
| Patient admin-specific | `/products/patient-admin/` |

---

## Contacts

| Role | Responsible for |
|---|---|
| Design lead | Figma library, component decisions, design tokens |
| Engineering lead | Code implementation, token consumption, build pipeline |
| Accessibility lead | WCAG compliance, testing, assistive technology review |
