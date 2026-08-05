# Session Handoff — DHCW Single Record Design System

Read this at the start of every AI-assisted session. Update it at the end.  
For the full log of design language changes, see `design-language-backlog.md`.

---

## Checkpoint — 2026-08-04f (DDR-020 distribution; React snippets checked)

### DDR-020: how the design system is distributed

Written because publishing is a decision, not a task — it fixes the package
names, the registry and the update path for everyone downstream. **Status is
Proposed**, not Accepted: it needs governance sign-off before anything is
published.

The decision in one line: **public npm under the `@dhcw` scope for the web
packages, NuGet for the Blazor RCL, one version number across all of them,
released by git tag through CI.**

The point most likely to be missed, and the reason the DDR is not just about
npm: **the primary consumers are .NET, not JavaScript.** Single Record products
are Blazor and MAUI renders those same Blazor components, so npm alone would
serve React and leave the main audience where they started.

Public over a private Azure Artifacts feed, because every alternative puts a
credential between a developer and their first install — an `.npmrc` token on
every machine and a service connection in every pipeline. For teams with no
design-system capacity that is where adoption stops, and the fallback is
pasting CSS into their own repo, which is the outcome the system exists to
prevent. The privacy a private feed buys is worth little: the package contains
colours, spacing, markup and accessibility guidance, no patient data and no
internal anything. GDS and NHS England both publish publicly.

**Do this next, in order** (none of it is code):
1. Governance sign-off that the system may be published publicly.
2. **Reserve the `@dhcw` scope on npmjs.com** under a DHCW-owned account —
   free, and it stops someone else taking the name. Do it whatever is decided.
3. An npm automation token as a repo secret, publish-scoped.
4. Decide NuGet for the Blazor RCL — it can differ from the npm answer, since
   .NET teams already have Azure DevOps credentials and the friction argument
   does not apply the same way.

`decisions/README.md`'s index had drifted to listing 3 of 19 DDRs; it is
regenerated from each file's own front matter and now lists all 20.

### The React snippets on the website were wrong

Found while answering "how do I locate the Button React snippet". The Button
page said `<Button variant="primary">`. **The component's prop is `type`** —
copying that snippet gave a button that silently ignored the variant. Three
more: `SegmentedControl label` (it is `ariaLabel`), `Navigation state` /
`onToggle` (they are `collapsed` / `onCollapseToggle`), and the Table page
showed the *Blazor* component name in the React tab with a `selectedId` prop
React does not have.

All fixed, and the build now prevents recurrence: it reads each component's
destructured props out of its own source and fails if a snippet uses one that
does not exist. The Button snippet is assembled in the browser from the
variant/size switches, so it never passes through `codePanel()` — there is an
explicit assertion beside `BUTTON_SCRIPT` covering it, and that is the only
snippet on the site built client-side.

The check is deliberately shallow: it cannot tell you a *value* is wrong, only
that a prop does not exist. That is the failure that actually happens.

### Where to find a component's React code

Three places, most useful first: the **React tab** on the component's page
(Buttons' updates live as you change variant and size), the source at
`packages/react/src/<component>/<Component>.jsx`, and Storybook, which has the
interactive controls.

---

## Checkpoint — 2026-08-04e (sidebar 248px; the web package now ships files)

### Sidebar reconciled to 248px

Closed the open question that had been sitting in
`components/navigation/guidelines.md`. The component shipped at 220px while
`foundations/grid-and-layout.md` derived its EPR content zones from 248px — the
width the Figma grid frame and the Figma nav item block (`665:21099`) are both
drawn at. Both moved together, in one change:

| | Was | Now |
|---|---|---|
| `.sr-nav` width | 220px | **248px** |
| EPR content zone @ 1440 | 1220px | **1192px** |
| EPR content zone @ 1280 | 1060px | **1032px** |

"Appointments" no longer truncates when a row carries both a badge and a
chevron — that 4px was the symptom that surfaced the discrepancy. Prototype
re-checked at 1280 and 1440: no overflow, layout unaffected.

### "CSS/JS files needed for the web assets" — Morgan Rowe

The feedback was correct and the diagnosis is worth recording, because the gap
was invisible from inside the repo.

**What was wrong.** A developer could read a component's source in the
prototype's Code panel, but there was nothing to *install*. `packages/web`
shipped 21 separate component stylesheets and a `package.json` whose `main`
pointed at `src/index.css` — **a file that did not exist**. Nothing is published
to npm. So the honest answer to "where are the CSS and JS files?" was "there
aren't any".

(The React `src/` is not empty — 48 files are committed. Anyone seeing it empty
was looking at a different branch or at the DHCW mirror before a sync.)

**What now exists.** `npm run build:web` writes `packages/web/dist/`:

| File | For |
|---|---|
| `single-record.css` | Everything, flattened: font, tokens, typography utilities, all 21 components. One `<link>`, no tooling. |
| `single-record-dark.css` | Dark-mode token overrides, opt-in, loaded second. |
| `icons.js` | Icon set as an ES module. |
| `sprite.svg` | Icon set as an SVG sprite, for consumers with no JS build step. |
| `components/*.css` | One component at a time. |

Concatenation and file copies only — no bundler, so no new dependency and no
DDR. The component list is read from the directory rather than hand-maintained,
so a new component cannot be added and left out of the bundle. `dist/` is
committed, like the token and icon builds, so the files can be taken straight
from GitHub.

The site serves the same files from a new **Get the files** page under Get
Started, and the website build now *fails* if `packages/web/dist` is missing
rather than publishing dead links. `build:site` and `build:pages` run
`build:web` first.

**Two real bugs found by actually consuming the output:**

- `packages/web/package.json` `main` pointed at a non-existent file. Fixed, and
  `src/index.css` now exists as an `@import` manifest for bundler consumers.
- Sprite `<symbol>`s carried only a `viewBox`. These icons are stroke-drawn
  outlines, so a `<use>` reference inherited the SVG defaults (fill black, no
  stroke) and rendered *nothing*. The presentation attributes now live on the
  symbol. Verified by building a page from the dist files alone and serving it
  over HTTP.

**Verify it the same way next time:** copy `dist/single-record.css` and
`dist/sprite.svg` into an empty folder, write a plain HTML page against them,
and serve it over HTTP (not `file://` — a cross-file `<use>` is blocked there
and fails silently). If it renders, a consumer can use it.

### Open for you

1. **npm publishing is still not done**, and it is a decision, not a task: it
   fixes the package names, the registry (public npm vs an Azure Artifacts
   feed) and the update path for everyone downstream. Worth a DDR. Until then
   the download page and `npm install github:...` are the supported routes.
2. **React has no pre-built browser file.** It is JSX source, so consumers need
   a bundler that compiles JSX. Fine for the React products; worth revisiting
   only if a consumer without a build step needs it. Blazor is the path for
   Single Record products anyway.
3. `dist/` is committed, so it will show up in diffs on any CSS change. That is
   the cost of letting people download without building.

---

## Checkpoint — 2026-08-04d (one page width; navigation previews; rail overflow)

### One page shape, and it is wider

Pages came in two shapes: an 800px column, or a "wide" one that *also* dropped
`.layout`'s 1280px cap. On a widescreen monitor that meant some pages ran past
the masthead while their neighbours sat still — which is what the reader
noticed. The `wide` flag is gone; every documentation page now uses the same
column.

The cap moved 1280 → **1440px** (XLarge, from the grid foundation) on the
layout, masthead and site footer together, so they still line up and a
widescreen gets the extra column instead of more margin. Two supporting rules:

- **Prose keeps a measure.** `.content > p/ul/ol/blockquote/dl` cap at 72ch —
  filling a 1160px column with text would give a 110-character line.
- **Showcases are full-bleed** to the page gutter (a variable, so it still
  works at the 20px mobile padding). This is not decoration: the Patient
  Banner's demographics grid drops to one column below roughly 1230px of banner
  width, so the 80px of reading gutter was the difference between documenting
  the two-column pattern and documenting its reflow. Every showcase does it, so
  previews are the same width on every page.

### Navigation

- **Previews take their height from the menu.** A fixed frame height had put a
  scrollbar inside the example, so the reader scrolled a sidebar inside a page
  to see the destinations being described.
- **The icon-only rail no longer scrolls sideways.** Its labels are tooltips
  positioned outside the 48px width, and `.sr-nav__body` sets `overflow-y:
  auto` — which per the overflow spec forces `overflow-x` to `auto` too. The
  hidden tooltips counted toward scroll width (144px of content in a 48px
  rail), so the rail grew a horizontal scrollbar, and a *shown* tooltip would
  have been clipped by the same container. Fixed by not making the collapsed
  body a scroll container. **The width is not the problem** — 48px is the Figma
  width and a tooltip is deliberately wider than the rail it belongs to. Where
  a product has more destinations than fit the rail's height, the 108px state
  is the one that scrolls cleanly with its labels in flow.
- **Tooltips no longer inherit the row's ellipsis.** `.sr-nav__item-label` sets
  `overflow: hidden; text-overflow: ellipsis` for the expanded row; the tooltip
  exists to show the name in full, so it overrides both.

### Still open

- **"Appointments" truncates by 4px** in the expanded 220px sidebar when it
  carries a badge and a chevron. That is the visible symptom of the open
  question already recorded in `components/navigation/guidelines.md`: the
  sidebar is 220px but `foundations/grid-and-layout.md` specifies 248px for the
  EPR content zones, and the Figma item building block (`665:21099`) is 248px
  wide. Not fixed here because the note says, correctly, that the two must be
  reconciled together — nudging padding to hide the ellipsis would bury the
  question rather than answer it.
- Grids page still overflows 15px at 390px. Pre-existing.

---

## Checkpoint — 2026-08-04c (Navigation + Toggles pages; send-from-tag; MAUI clarified)

### The code packages are the source of truth for what gets published

Stated plainly because it now governs how work is done here: the versions in
`packages/web`, `packages/react` and `packages/blazor` are what will be
published, and the DS website renders those same files. So **a fix found on the
website is a fix to the package**, never a patch on the site. Three this
session went that way — BottomNav's hover colour, Navigation's icon-only width,
and `Input`'s calendar/time value handling — and none of them are website code.

The corollary: where the site has to change a component to document it (the
Navigation previews are boxed, because the component is `100vh` by design),
that override is scoped to a named class and declared on the page in a callout.
It is the only one.

### This session

- **Navigation has a page** (Figma `1307:16983`): Sectioned expanded, rail, and
  icon-only, each with what it is for. It had full code and guidelines and no
  page at all.
- **Toggles replaces the Toggle switch page.** Switch and Segmented control are
  published together because Figma's `1414:16858` groups them and the first
  decision is which one you need — "is this on?" versus "which of these?". Two
  components in code, one guidelines document (`components/toggles/`).
- **Navigation icon-only was 72px in code, 48px in Figma and in its own
  guidelines.** Now 48px.
- **BottomNav**: rest is Text/Secondary, hover *and* current are
  Interactive/Link. Hover had been Text/Primary — darker than rest, which reads
  as the control switching off under the cursor.
- **Case Note Tracking: Send now offers the volume's earlier tags.** A tag is a
  standing request carrying the same facts a Send collects, so starting a Send
  on a tagged volume opens on a chooser (Figma `450:19231`, Case Notes Tracking
  file): the tags most-recent-first, an OR, and "start blank". Continue carries
  the chosen tag's values into the form, with a note saying where they came
  from, and "Back to tags" returns. A volume with no tags opens straight on the
  form — a chooser with one option is a click for nothing.
- **MAUI / Blazor Hybrid is written down** in `docs/for-engineers.md` ("What
  runs where") and summarised in `CLAUDE.md`. Short version: MAUI is the mobile
  target; Blazor Hybrid is *how* the MAUI app draws these components (a
  `BlazorWebView` hosting the same Blazor RCL the web uses). They are not
  alternatives. The Azure Blazor web host is a separate preview convenience and
  can be retired after publication without touching MAUI.
- **Dark mode is provisional, on purpose** — recorded in `DESIGN-SYSTEM.md`
  under Colour. The dark tokens build but have not been reconciled against the
  light-mode semantic assignments, which are still moving. One deliberate pass
  once they hold still; not piecemeal.

### Component fixes found through the above

- `Input` type=calendar and type=time were the only Input types that dropped
  `...rest`, so `value` / `defaultValue` / `onChange` never reached DatePicker
  or TimeSelect. A pre-filled date rendered as an empty placeholder.
- `RadioGroup` gained `hideLegend`, matching `hideLabel` on Input and Checkbox.
- `publicise()`'s empty-section pruner deleted any heading immediately followed
  by another heading, which silently removed "Type: Switch" and "Type:
  Segmented control" from the Toggles page. It now prunes only where the next
  heading is at the same or a higher level.
- `inline()` had no emphasis rule, so `*submit*` printed its asterisks.
- `.content a` painted every BottomNav tab blue in the preview, hiding the fact
  that only the current tab is blue.

### Open for you

1. Grids page still overflows 15px at 390px. Pre-existing, verified against a
   clean tree.
2. `components/toggles/` and `components/breadcrumbs/` have guidelines but no
   `spec.md`.
3. The tag→send prefill covers "I am working with", Location, Holder and
   Clinic/TCI date. Send date and time are deliberately left blank: a tag says
   when the notes are *wanted*, not when they are being sent.
4. `NOTE_TAGS` is mock data on two of the five volumes. There is no tagging
   action that writes to it — Tag Notes still just closes.
5. Still outstanding: Figma `448:8806` shows "Create new batch"; three
   prototype-local components await a second consumer.

---

## Checkpoint — 2026-08-04b (website page structure; two new components; banner alignment)

### The website was restyling the components it documents

One root cause behind three separate complaints. `packages/website/site.css`
styles page copy with `.content h2`, `.content th`, `.content p` and so on —
selectors that also match component markup rendered inside a showcase preview,
at a higher specificity than the component's own class rules.

| Symptom | Cause | Fix |
|---|---|---|
| Patient Banner's name sat ~40px below the alert cards, in every variant | `.content h2 { margin: 40px 0 12px }` (0,1,1) beat `.sr-patient-banner__name { margin: 0 }` (0,1,0) | page-copy rules now carry `:not(.showcase__preview *)` |
| Tables on the site did not look like the Table component — heavy rule under the header row | `.content th { border-bottom: 2px solid Border/Strong }`, the site's own invention | doc tables restyled to match Figma `1363:22598` (tinted header, no rule, 8px padding); `.sr-table` excluded outright |

If a site rule needs to reach a heading or a paragraph, it must exclude
`.showcase__preview` descendants. That preview area is the component, not
page copy.

### Everything else this session

- **Page titling set.** The category eyebrow is now the 12px caption variant
  with a 4px gap to the `h1` — one titling set, not two lines of furniture.
  Header, Footer, Tables and Patient Banner had **no `h1` at all**; they now
  have one, plus a lede. Their guidelines' own leading `# Title` is stripped
  (`stripLeadingH1`) so the title is not printed twice.
- **Header page reorganised** to the same shape as Patient Banner: `Type:
  Desktop 1` / `Desktop 2` / `Mobile`, each a heading and a description
  *before* its example. Previously three near-identical bars appeared with
  their explanations underneath.
- **Footer page now shows the Mobile type.** Figma `1322:15480` puts both bars
  on the Footer page, so the site does too — rendered from the existing
  `BottomNav` component, under `Type: Mobile`, with the reason it is a separate
  component stated rather than hidden.
- **Two components documented and published:** Breadcrumbs
  (`components/breadcrumbs.html`) and Toggle switch (`components/switch.html`).
  Both already had code in `packages/web` and `packages/react` with no
  guidelines and no page — code nobody could find. Breadcrumbs also gained the
  `Back` type from Figma `1307:19303`, which the implementation had omitted.
- **Collapsed Fill banner keeps its tint.** Its count pills were outlined in
  both types, so a Fill banner appeared to become a Border banner on collapse
  (Figma `1711:15585`).
- **Components sidebar is alphabetical**, and the section link opens the first
  entry. Six entries is past the point where build order is findable.
- **Prototype card** carries one sentence about what the product is, then the
  status. The per-screen build detail lives here, in this handoff, not on a
  card. The prototype's own control bar now reads "Back to design system".
- **Masthead search could not shrink** (`flex: none; width: 240px`), so between
  1001px — where the masthead stops wrapping — and roughly 1150px it was pushed
  past the right edge and scrolled *every page on the site* sideways by 84px.
  Now `flex: 0 1 240px`.

### Open for you

1. **Grids page still overflows 15px at 390px.** Pre-existing, verified against
   a clean tree; not introduced here. `.table-wrap` already has `contain: paint`
   and the wrapper measures inside the column, so the source is elsewhere on
   that page — it is the only page that does it.
2. **Neither new component has a `spec.md`** — guidelines only, matching
   Header/Footer. The twelve-components-without-a-spec gap in
   `DESIGN-SYSTEM.md` is unchanged.
3. `BottomNav` is reachable only through the Footer page. That matches the
   Figma file's own structure; revisit if products start treating it as a
   component in its own right.
4. The Toggle switch page's disabled examples are static markup. Storybook has
   the interactive states.
5. Still outstanding from the previous checkpoint: Figma `448:8806` shows
   "Create new batch"; three prototype-local components await a second consumer.

### Commands that must pass

`npm run check` (typography 0/0, design-system 16/16 baseline), `npm run
build:site` (19 pages), and `npm run build -w @dhcw/case-note-tracking-prototype`.
No horizontal overflow at 390 / 768 / 1024 / 1440 on any page except the Grids
page at 390 noted above.

---

## Checkpoint — 2026-08-04 (SendIT batch flow; footer rule; four DS fixes)

### Where the Case Note Tracking prototype stands

| Screen | State |
|---|---|
| Dashboard | Built |
| Patient Search | Built (quick, advanced, results) |
| Case notes (single patient) | Built — reached only from Patient Search's "View" |
| My Requests | Built — cross-patient, All/Sent/Received tabs |
| SendIT | Built — new batch, existing batch, find, approve, send |
| ReceiveIT · TagIT · Settings | Nav entries only, no screen |

### SendIT (Figma 192:4901 · 341:9165 · 341:9673 · 279:22906 · 287:23848 · 448:8420 · 448:8806)

Find case notes on the left, build the batch on the right, approve and send
from the footer. Volumes sit at `Pending` until the approval modal's Send is
confirmed — before that the batch is an editable list, not a dispatch.

- **Creation is a gate.** Nothing below the settings card exists until "Create
  new batch" is pressed: that press assigns the batch number, so there was
  nothing for a batch reference to refer to before it. Pressing it again over
  a batch with unsent notes asks first (reuses `ConfirmModal`).
- **Existing Batch** asks one question — which batch — and shows nothing else
  until answered. The field is an `Autocomplete` with a chevron, so it takes a
  number read off a printed label as readily as one picked from the list.
  "Create new batch" is not shown in this mode: the batch already exists.
- **One patient at a time** in the finder. A new search replaces the patient
  showing, so the checkbox list never spans two people and "Select all" always
  means one patient's volumes. Volumes already added stay in the batch, which
  is still cross-patient.
- **The two panels match height** — one task split in half; a short finder
  beside a tall summary read as two unrelated cards. Below Desktop they stack
  and the rule stops applying.
- **Approval modal** — banner has the two variants from `445:8419` (amber and
  leading with the instruction while blocked; green and leading with the state
  once acknowledged). Warning detail panel has both states from `445:8402`;
  every row's warnings cell is clickable, not only the ones with warnings, so
  selecting a clean row answers "this one is fine" rather than leaving the
  previous row's warnings on screen.
- **Data is logical, not the Figma's placeholder rows**: the case-note number
  belongs to the *patient* (one case record, volumes numbered within it), so a
  patient's volumes carry their number and stay with them. Two patients in the
  fixture, because a batch is genuinely cross-patient.

### Design-system fixes this session — all found via the prototype

- **The Footer is on every screen, pinned.** Persistent chrome, not page
  content: the version has to be reachable everywhere, and a bar that comes
  and goes reads as a layout bug. A screen with no committing action gets the
  bar with the version alone — `Footer` no longer falls back to a generic
  Save / Mark-as-complete pair, which would put two dead buttons on every
  read-only screen. Pinning is `position: sticky`, not `fixed`, so the bar
  stays in its own column and stops at the sidebar without the component
  needing to know the sidebar's width. **The guidelines said the opposite**
  ("Not on read-only or list screens…") and are corrected.
- **`Footer` takes an `actions` slot** — its guidelines require labels to name
  the screen's specific action, which fixed labels could not honour.
- **`.sr-table-wrap` did not contain a wide table.** `overflow-x: auto`
  scrolled the table but did not stop it extending the *page's* horizontal
  scroll. Every consumer had been working around it by nesting the table in a
  second `overflow-x: auto` ancestor; SendIT's batch summary, which does not,
  scrolled the page 72px at 390px. Fixed with `contain: paint`.
- **`DatePicker` / `TimeSelect` had hard widths** (220px / 140px) that could
  not shrink, overflowing any narrower container — this is what put a
  horizontal scrollbar in the Send / Receive / Tag modals. Now `max-width`.
- **`Autocomplete` can be marked `required`, and has a chevron.** It was the
  one form field that could not say it was required, and without the chevron
  its options could only be discovered by typing.

### The website build fails on a prototype's missing component

Each `PROTOTYPES` entry carries a hand-maintained `components` list and the
embed ships only what is listed, so using a component nobody added built
cleanly and broke at runtime *on the published site*. The build now collects
what each prototype imports from `@dhcw/sr-react` and throws if the list does
not cover it. It caught `Footer` and then `Autocomplete` in the same session.

### Open — for the design lead

1. **`448:8806` (opened existing batch) still shows "Create new batch"**,
   carried over from the New Batch frame it was copied from. Omitted here: in
   that mode the batch already exists, and a button that would create a second
   one — discarding the one just opened — is not what the screen is for.
2. **`BottomNav` has no website page.** Footer's Figma `Mobile` type
   (`665:16526`) is the bottom tab bar, already built as `BottomNav`, not a
   scaled-down Footer. Footer's page says so; `BottomNav` still needs its own.
3. **No Menu/Dropdown, Tabs, or destructive-confirmation component.** The row
   action menu, My Requests' tabs and `ConfirmModal` are local to the
   prototype (`products/case-note-tracking/prototype/src/shared/`). Promote
   each once a second consumer needs it.
4. **Tables** still need alignment work against `1354:18055` — deferred.
5. **Button text size** — `DESIGN-SYSTEM.md` says `label` (14/20/500) but
   `button.css` renders 16/24. Flagged, not changed unilaterally.

### Next session, start here

- `npm run check` (typography + conformance), `npm run build:site`, and
  `npm run build -w @dhcw/case-note-tracking-prototype` must all pass. Baselines
  are typography 0 and conformance 16 — both are ceilings, not targets.
- ReceiveIT and TagIT are the obvious next screens; both are nav entries with
  no Figma flow linked yet.

---

## Checkpoint — 2026-08-03 (later — grids, barcode scan, responsive)

### Grids synced from Figma — the repo doc was wrong, the tokens were right

`foundations/grid-and-layout.md` described a six-step `xs / sm / md / lg / xl /
2xl` scale with its own gutter and margin values. That scale **never existed**
in `foundations/tokens/breakpoints.json`, which has always carried the five
named breakpoints in Figma's *SR Grid & Layout System* (`289:301`). So the doc
was the stale artefact, not the tokens — nothing in code had to change.

Rewritten from Figma, and the DS website Grids page (a placeholder until now)
is real: `packages/website/build.mjs` `gridsBody()` renders the breakpoint
table, the three grid types as live CSS-grid ribbons, the EPR grid, the
spacing-token map and platform guidance. Breakpoint values are read from
`tokens-flat.json` at build time and printed beside each token name, so that
table cannot drift from what ships.

**Two things carried over as drawn, both needing a decision:**

1. **EPR sidebar is 248px in the grid spec; `Navigation` is 220px** in the DS
   master (`725:8903`), in the product adaptation (`125:5362`) and in
   `navigation.css`. The three content-zone widths (1192px / 1032px) are
   derived from 248px and are therefore 28px out against the component as
   built. Either the grid page moves to 220px or the component grows — do not
   change one side alone.
2. **MAUI desktop margin is 48px** on Figma's platform card, matching none of
   the web margins (40 / 64 / 80). Possibly deliberate for MAUI, possibly
   stale.

### Barcode scan moved into the search field, and made to behave like a scanner

The scan control now sits inside the search input at its trailing edge (new
`trailingAction` prop on `Input` — its anatomy comment already promised a
trailing slot). Scanning populates the field **and runs the search**, because
real scanners are HID devices: they type into the focused field and send
Enter. There is no button in the real flow; the visible trigger is a stand-in
for hardware this prototype does not have.

**It never auto-opens a patient, including when exactly one row returns.**
Given the known duplicate records in the source system, "one result" is not
proof of one patient, and auto-opening would let a scan put a record on screen
with no human step in between. Landing on the list costs one click and keeps
the choice with the clinician. When more than one row matches, the results
panel says so explicitly and names duplicates as the reason — at the point of
choosing, which is where it changes behaviour.

### Responsive

The prototype and the Header now work at every DS breakpoint. Verified with no
horizontal overflow at 1440 / 1280 / 1024 / 900 / 420 / 390.

- Below Large: stat cards and quick actions go 4-across → 2-across.
- Below Desktop: dashboard panels stack; header search flexes instead of its
  fixed 280px.
- Below Tablet: single column throughout; the sidebar stops being a sticky
  full-height rail and becomes a normal-flow strip (100vh of nav on a phone is
  the whole screen); header hides the org/Cymraeg **words**.
- Media queries use literal pixel values because CSS media queries cannot read
  `var()`. That is the one place raw numbers are unavoidable, and they are
  commented with the token they correspond to.

**Two bugs this surfaced, both fixed:**
- Hiding the header labels with a bare `span` selector also hid the globe
  icon, because `<Icon>` renders a `<span>` — an empty button remained. Now
  `> span:not(.sr-icon)`.
- `.panel` overflowed the viewport at 420px: grid items default to
  `min-width: auto`, so wide content pushes the track past its `1fr` share.
  Needs an explicit `min-width: 0`.

### Website navigation

Patterns now behaves like Components: the top-nav entry opens the first
pattern directly and the overview page is gone. With one pattern it was a card
pointing at the only sibling already in the sidebar.

---

## Checkpoint — 2026-08-03 (patient search, patient banner pattern, header fixes)

### Patient Search screen — built (Figma `2:4437` quick · `2:3927` advanced · `2:4068` results)

`products/case-note-tracking/prototype/src/PatientSearch.jsx`, reachable from
the nav and from the dashboard's Patient Search quick action.

- **Quick vs Advanced is a `SegmentedControl`**, not a link or a disclosure.
  It switches between two ways of doing one task, both of which stay on the
  page. Advanced **adds** fields below the shared search bar rather than
  replacing it, so a user who has already typed an identifier does not lose it
  when they widen the search.
- All three states verified in a real browser: quick (empty), advanced
  (expanded fields + both radio groups), and results.

### Four Figma slips found on those screens — implemented corrected, not copied

Each of these would have shipped a defect if transcribed literally. Flagging
rather than silently absorbing, because the Figma file still needs fixing:

| Screen | Slip | What the prototype does |
|---|---|---|
| `2:3927` advanced | Surname field's placeholder reads "Enter forename"; Forename's reads "Enter surname" — transposed | Placeholders match their labels |
| `2:3927` advanced | "Forename Searching Methods" lists **See and treat / Rapid assessment / Triage** — triage categories pasted from another screen | Mirrors the surname methods (Containing / Exact Match / Sounds Like) |
| `2:4068` results | **Two columns both headed "Birth date"**. The second is populated only on the Deceased row | Second column is headed "Date of death" |
| `2:4068` results | Surname/Forenames transposed on several rows (Surname "JANE", Forenames "DOE"); every row reads Sex "Male", including AVA and JANE | Names un-transposed, sexes corrected |

### Three DS gaps this screen exposed — all filled

- **Radio had no code.** The Figma component set exists and
  `components/form-fields.md` already documents its `Required` marker, but
  there was no `packages/web/src/radio/` or React wrapper — so a single-select
  group was unbuildable. Added `radio.css` + `Radio.jsx` + `RadioGroup.jsx`,
  deliberately kept structurally identical to the Checkbox trio (same 20px
  control, 28px label offset, focus ring, error treatment; round instead of
  square, dot instead of tick). Native `<input type="radio">`, so arrow-key
  roving focus is the browser's, not reimplemented. **Still no `spec.md`.**
- **`Button` could not submit a form.** Its `type` prop is the visual variant,
  and the native attribute was hardcoded to `"button"`, so a Button inside a
  `<form>` did nothing. Added `htmlType` (defaults to `"button"`, so nothing
  changes for existing callers).
- **`Input` had no way to hide a label.** The search bars here show no visible
  label, and a placeholder is not an accessible name — it also vanishes on
  typing. Added `hideLabel`, which renders the label visually-hidden rather
  than dropping it. `label` remains required.
  - Side effect worth knowing: `.sr-visually-hidden` is now defined in **both**
    `table.css` and `input.css`. Each component stylesheet is independently
    importable, so a shared utility has to be duplicated until there is a
    foundations stylesheet to hold it. Extract when a third component needs it.

### Patient Banner pattern — now on the DS website

- `components/patient-banner/guidelines.md` (new) + a page at
  `patterns/patient-banner.html` rendering **all four Figma variants**
  (`1711:15585`): Fill/Border × Expanded/Collapsed, from the real CSS contract.
  Patterns gained a sidebar and an overview card; it was a placeholder before.
- Both types documented as **live**, with a "choosing between Fill and Border"
  table. Recorded plainly that this choice has never been user-tested and that
  keeping both is provisional.
- The page renders `wide`, because the banner is a 1280px strip — in the
  default reading column its name row wraps and the action stack collides with
  the demographics, which misrepresents the pattern.
- **Pre-existing wart fixed in passing:** `accessibilityTable()` emitted
  `<h2>Accessibility</h2>`, colliding with the prose `## Accessibility` section
  every `guidelines.md` carries — two identical h2s on one page. Retitled to
  "Accessibility requirements", which also de-duplicates the Tables page.

### Header fixes

- `desktop-2` bar was 80px against the sidebar's 64px logo block; now 64px, so
  the two bottom rules form one continuous line.
- The "strange dropdown chevron" beside the language switcher was the **org
  switcher rendering with an empty label** (the prototype passes `org=""`).
  It is now omitted entirely when there is no org, rather than showing a
  control that opens nothing.
- Search moved from the far left to sit with the utility cluster —
  `justify-content` was `space-between`, which pushed them apart.

### Quick-action interaction states

Now mirror the DS Button: cyan-tint hover with primary border, solid navy on
`:active`, SR cyan focus ring. The permanent "selected" state on Patient
Search is gone — these are actions, not a choice set.

**Design-lead question answered:** navy is the **pressed** state, not hover.
It reads as "committed/selected", and firing it on mouseover makes every pass
of the cursor across a row of four look like a selection. The cyan tint is
what the DS already uses for secondary and ghost button hover.

---

## Checkpoint — 2026-07-31 (later still, design review pass on the dashboard)

Design lead reviewed the first dashboard pass. Three pieces of feedback, all
actioned, plus a new Figma reference: the **Case Note Tracking adaptation of
the sidebar nav, `125:5362`** in `U0Ugs6bG1KLzrrWdnxqcZO`.

- **The product nav has only TWO states**, confirmed from `125:5362`:
  `State=Expanded` (220px) and `State=Collapsed` (108px rail). There is **no
  48px icon-only variant** in the product adaptation. The prototype's collapse
  toggle now goes Expanded ⇄ rail. The DS component still carries the
  icon-only state (it exists on the DS master, `3569:15850` / `2212:7613`,
  with the hover+focus tooltip from the earlier checkpoint) — products opt in,
  and this one hasn't. Worth knowing if the earlier "might need to knock the
  icon-only state off" question comes back: for this product it is already
  moot.
- **The rail stacks icon ABOVE label, centred — it is not a truncated row.**
  The earlier implementation had it as a horizontal icon+label row with an
  ellipsis, which was simply wrong; both the product adaptation and the DS
  master (item heights of 44 on a 60px pitch, and hugging widths of 47-94px,
  which only make sense for a centred stack) show the vertical form. Rail
  labels drop to 12px so the longest ("Patient Search") fits the 92px content
  box without truncating. Fixed in `navigation.css`.
- **Typography was a step too large throughout.** Root cause was a missing
  base `font-size` on `body` in the prototype, so every element without an
  explicit size inherited the browser's 16px default — row text, quick-action
  labels and panel copy all rendered at 16px instead of Body S. Base is now
  14/20 per DDR-015, which is the right default for this table- and data-dense
  system. Separately the page title dropped from 28/36 to **20/28** and the
  stat values from 28/36 to **24/32**.
- **Spacing loosened** in the sidebar (52px item pitch: 36px item + 16px gap,
  per `125:5361`), quick-action cards (64px min height, single-line
  descriptions — the copy was shortened because a wrapped second line breaks
  the row), stat cards, panels and the attention/transit rows.
  **Watch out:** bumping `.app__main`'s *horizontal* padding to 24px squeezed
  the casenote table enough to wrap cell text onto two lines. It is back at
  16px horizontally (24px vertically), and `.notes` gained `overflow-x: auto`
  so a wide data table scrolls rather than reflows.
- **The sidebar now fills the full viewport height and sticks.** It was
  collapsing to content height, leaving grey page background below "Log Out".
  Cause: `.sr-nav` had `height: 100%`, which inside an auto-height flex row
  resolves against an indefinite height and gives up. Now
  `position: sticky; top: 0; height: 100vh` on the component itself (Figma
  draws the sidebar full-frame-height in every variant, so this is component
  behaviour, not a consumer layout choice), and `.app` uses
  `align-items: flex-start` so stretch doesn't defeat the sticky.

### Two DS-vs-product spec discrepancies — flagged, not silently resolved

Both were resolved in favour of the **product adaptation**, because that is
the reference the design lead handed over and it is the one the prototype
renders. Neither is obviously "the" right answer and both are worth a
decision:

| Thing | DS master (`x5fwyefxxgD03csz8ld7SZ`) | Product (`U0Ugs6bG1KLzrrWdnxqcZO`) | Taken |
|---|---|---|---|
| Sidebar header height | 80px (`665:20955`) | 64px (`125:5361`) | **64px** — it also aligns the sidebar's bottom rule with the 64px Header bar's, which 80px visibly did not |
| Linear nav item gap | 8px, 44px pitch (`1317:24167`) | 16px, 52px pitch (`125:5361`) | **16px** |

Sectioned nav keeps its items flush (36px pitch, `665:20955`) since its
section labels already do the separating — the 16px gap is scoped to
`.sr-nav--linear`.

### Resolved on review

The dashboard's page title read "Patient Search" while the current nav item
was Dashboard. Carried over verbatim from Figma at first rather than quietly
corrected; design lead confirmed it was a slip in the design, so the
prototype now titles the screen **"Dashboard"**. Figma node `2:3875` still
has the old text and needs the same correction.

---

## Checkpoint — 2026-07-31 (later, dashboard home screen, same branch)

Started the item flagged "not done" at the end of the previous checkpoint:
the Dashboard-as-home-screen prototype from Figma node `2:3875` (file
`U0Ugs6bG1KLzrrWdnxqcZO`).

- **Prototype restructured into a shell + two views**, rather than building
  the dashboard as a second disconnected prototype. `App.jsx` now holds one
  persistent `Navigation` (Type=Linear, matching the flat sidebar actually
  shown on `2:3875` — no section labels, unlike the Sectioned nav used
  elsewhere) and a `view` state (`'dashboard' | 'case-notes'`) that swaps
  between two extracted components: new `Dashboard.jsx` (the home screen) and
  `CaseNotes.jsx` (the table view that used to be all of `App.jsx`, unchanged
  apart from losing its own `Navigation` instance). Clicking "Dashboard" or
  "Patient Search"/"My Requests" in the nav calls `onSelect` to switch views —
  verified in a real headless-Chromium render, not just by reading the code.
- **Dashboard.jsx** composes `Header` (variant `desktop-2`), 4 stat cards, a
  quick-actions row, and two panels ("Needs attention", "In transit") — all
  read off the real node tree (`get_metadata`) and the rendered screenshot,
  matched side by side and confirmed close. No coded "Stat Card" or
  "Dashboard section" component exists in `@dhcw/sr-react` — this composes
  `Tag`/`Icon`/`Header` plus local layout in `app.css`, the same pattern
  `CaseNotes.jsx` already uses for its `.filters`/`.notes` wrappers, not a new
  DS component invented outside Figma.
- **Figma MCP gotcha worth recording:** the short instance-local ids
  `get_metadata` prints for a nested tree (e.g. `0:353` for "Stat Card") are
  **not independently resolvable** — calling `get_design_context`/
  `get_metadata` again with just that bare id returns unrelated content
  elsewhere in the file (in this session, `0:303` resolved to a "SendIT" nav
  building block, not the "Header bar" it was nested under). Only the
  fully-qualified instance path (`I2:3875;...;125:4980`, as returned inline
  inside a `get_design_context` call on an ancestor) is safe to reuse.
  Re-running `get_metadata` on the known-good top node (`2:3875`) each time
  was the reliable path; the screenshot (`enableBase64Response: true`, since
  the Figma asset host is still egress-blocked here, same as prior sessions)
  supplied the actual card copy/numbers that the metadata tree doesn't carry
  for leaf instances with no overrides.
- **Sandpack embed build gained multi-file support.** `buildSandpackFiles()`
  in `packages/website/build.mjs` previously only ever emitted a single
  `/App.js` — now it walks the entry file's own local `./*.jsx` sibling
  imports (the same queue-and-rewrite approach `assembleDesignSystemFiles`
  already used for `@dhcw/sr-react` internals), so `Dashboard.jsx`/
  `CaseNotes.jsx` both ship into the embed as their own files. `Header` added
  to the prototype's `components` list. **Verified**: `npm run build:site`,
  a real `vite build` of the prototype package, and a headless-Chromium
  screenshot of `vite preview` all pass — including clicking the collapse
  toggle (rail ⇄ icon-only) and clicking a nav item to switch views.
- **Not carried over:** Patient Search and My Requests both currently open
  the same casenote table as a stand-in (there's no dedicated Patient Search
  screen yet); SendIT/ReceiveIT/TagIT are nav entries with no screen at all.
  The dashboard's "Patient Search" H1 heading and "Quick actions" label are
  copied faithfully off the Figma screen as found, including the apparent
  mismatch between the page title and the Dashboard nav item being current —
  not something this session's job was to silently correct.

---

## Checkpoint — 2026-07-31 (case note nav, branch `claude/case-note-nav-prototype-8409gg`)

Picked up the "nav bar missing from the casenote view" item from the previous
checkpoint, plus the design lead's follow-up: they wanted the two Figma links
below understood before the nav bar just gets dropped in.

- **`Navigation/Sidebar/Desktop` (`725:8903`, file `x5fwyefxxgD03csz8ld7SZ`) has
  6 variants, confirmed directly in Figma (`get_metadata`), not assumed:**
  `Type=Sectioned`/`Type=Linear` × `State=Expanded`/`Collapsed` (108px, rail)/
  `Collapsed 2` (48px, icon-only). Linear is a flat list — no section labels,
  no dividers — for simpler single-level navigation; Sectioned groups items
  under labels (PATIENTS, CLINICAL, ...). Neither collapsed state in Figma has
  any hover-triggered content; "Collapsed 2" simply never shows a label.
- **Accessibility call on icon-only hover-reveal — made, not deferred.** The
  question raised was whether revealing the item's label on hover, for the
  48px icon-only rail, is safe to keep or needs to be dropped. Verdict: **keep
  it, but the reveal must fire on `:hover` AND `:focus-visible`, never hover
  alone.** A hover-only reveal fails WCAG 2.2 SC 1.4.13 (Content on Hover or
  Focus) and effectively SC 2.1.1 (Keyboard) for anyone tabbing through the
  rail — they can reach `:focus-visible` but never `:hover`. This was already
  a non-issue for screen readers (`aria-label` names every item regardless of
  what's visually shown); the gap was only for sighted keyboard users. Nothing
  needs "knocking off" — it needs the focus state added, which is a CSS-only
  fix. Implemented in `navigation.css`.
- **`Navigation` (`packages/react/src/navigation/Navigation.jsx` +
  `packages/web/src/navigation/navigation.css`) now covers both types and all
  three states:**
  - `type="sectioned" | "linear"` (default sectioned). Linear flattens the
    `sections` prop into one list and drops labels/dividers — no new prop
    shape, so existing consumers of `sections` don't need to restructure data.
  - `collapsed={false | 'rail' | 'icon'}` (also accepts the old boolean `true`
    as an alias for `'icon'`, so the existing Storybook/consumer usage keeps
    working). `'rail'` = 108px, icon + visible truncated label, no
    badge/chevron/submenu. `'icon'` = 48px, icon only, label becomes a tooltip
    on hover/focus as above.
  - Storybook (`Navigation.stories.jsx`) gained `CollapsedRail`, `CollapsedIcon`
    and `Linear` stories so the two types and both collapse states are each
    independently viewable — this is the seed for the DS website Navigation
    page, which does **not exist yet** (see below).
- **Case Note Tracking prototype now has its sidebar** (the actual "next task"
  from the last checkpoint). `products/case-note-tracking/prototype/src/App.jsx`
  renders the real `Navigation` component (Sectioned/Expanded, with the
  collapse toggle wired to `'icon'`), sourced from new `NAV_SECTIONS`/
  `NAV_FOOTER` in `data.js`. `app.css` gained the flex row layout to hold it.
  `packages/website/build.mjs`'s `PROTOTYPES[0].components` gained
  `'Navigation'` so the Sandpack embed picks it up — **verified**: `npm run
  build:site` succeeds end to end, and the assembled embed file
  (`packages/website/dist/prototypes/case-note-tracking.html`) contains
  `/design-system/react/Navigation.jsx` with no bare `@dhcw/sr-web` import
  left unresolved (see the logo note below). Browser-side Sandpack execution
  itself still isn't verifiable in this sandbox (no egress to `esm.sh`, same
  standing restriction as before) — needs a real-browser check next session.
- **Gotcha hit and fixed: don't import `@dhcw/sr-web/src/assets/logo.js`
  directly from a prototype.** `assembleDesignSystemFiles()` in
  `build.mjs` only rewrites the bare `@dhcw/sr-react` import in a prototype's
  entry file — nothing rewrites arbitrary `@dhcw/sr-web` imports, so the logo
  path from `Navigation.stories.jsx` would have shipped into the Sandpack
  bundle unresolved. Used a plain text lockup (`BRAND_LOCKUP` in `App.jsx`)
  instead — same "placeholder, not the real NHS/GIG asset" reasoning as the
  logo file itself, just without the fragile import. If a future prototype
  needs the real logo, `build.mjs` needs a rewrite rule for it first.

### Not done this session — next task

1. **DS website Navigation component page.** No `components/navigation/`
   folder exists at all — no `spec.md`, no `guidelines.md`. Per CLAUDE.md this
   is a gap worth stating outright: the component has real code and Storybook
   coverage but no design-authored spec/guidelines, and no page in
   `packages/website/build.mjs`'s component list. This is exactly what the
   design lead asked to be "worked on in the DS website too" — the Storybook
   stories added this session are the raw material, not the page itself.
2. ~~**Dashboard-as-home-screen prototype.**~~ **Started same day, see the
   checkpoint above.** The design lead wants
   `https://www.figma.com/design/U0Ugs6bG1KLzrrWdnxqcZO/...?node-id=2-3875`
   (file `U0Ugs6bG1KLzrrWdnxqcZO`, instance `2:3875`, "Page Template" wrapping
   a "DASHBOARD COMPONENT" frame `0:4`) as the product's actual home screen,
   not the casenote table view. Confirmed via `get_metadata`: it's a different
   screen from the current prototype — patient search, 4 stat cards, quick
   actions (radio-card style), and two "Dashboard/Section slot" panels
   (Upcoming Appointments-shaped), all behind its own `Casenotes/Sidebar
   Navigation` instance (`0:5`). Not started — this is a new screen to build,
   not a nav-bar fix, and is the natural next PROTOTYPES-array entry once the
   nav work above lands. Login page is explicitly out of scope per the design
   lead.
3. Still open from the prior checkpoint, untouched this session: npm publish
   CI job (license sign-off still pending) and DL-029 (no
   link-on-dark-surface token).

---

## Hard Constraints — Never Override Without Explicit Permission

| Constraint | Detail |
|---|---|
| `Interactive/Primary` = Blue/800 | Do NOT scale down to Blue/700 or any other value. Key decisions on colour require explicit sign-off before applying. |
| DL-003 deferred | Active/pressed state for Primary button is unresolved. Blue/900 is taken by hover. Do not assign an active/pressed colour without sign-off. |
| Colour scale, token naming, structural changes | Require explicit user sign-off before applying, do not act on recommendations alone. |
| Token JSON is the source of truth | `foundations/tokens/**` is authoritative. The colour reference markdown is GENERATED by `scripts/sync-token-docs.mjs`. Never hand-edit the palette or semantic tables in `colour/global.md` or `colour/semantic.md`; edit the JSON and re-run the sync. |
| Published content standard | See the 2026-07-27 checkpoint. Real `sr-*` classes, NHS.UK section order in SR voice, no internal references, MS Forms feedback only, shared framework tabs, and no em dashes. |

---

## Checkpoint — 2026-07-29 (later, publishing scaffold)

### Repo visibility — resolved, decision made

`Chuk-DCHW/dhcw-single-record-design-system` (this repo) is now **private** again.
`DHCW-Digital-Health-and-Care-Wales/single-record-design-system` (the org mirror) is
now **public** — this was a deliberate decision by the repo owner, made after
confirming no secrets or credentials exist in the tree. The DS website's Prototypes
page and its StackBlitz embed point at the **org mirror**, not this repo, for exactly
this reason: whichever repo StackBlitz loads from has to be public, and the org-owned
one is the right one to expose, not a personal-namespace copy.

### The four DS packages are now publish-ready (not yet published)

`@dhcw/sr-tokens`, `@dhcw/sr-icons`, `@dhcw/sr-web`, `@dhcw/sr-react` all had
`"private": true` removed and gained `publishConfig.access: "public"`, a
`repository`/`bugs` field, and (tokens/icons) a `prepublishOnly` build step. Verified
with `npm pack --dry-run` in each package — story files are correctly excluded,
`build/` outputs are fresh, nothing extraneous ships. **Nothing has actually been
published yet** — this is scaffolding only, done ahead of the dev team's production
app needing these as real installable dependencies (their app lives in their own
repo, so workspace-symlink resolution won't reach it).

**Decided:** packages will be published to the **public npm registry**, matching the
precedent of `govuk-frontend` and `nhsuk-frontend` (both public, both MIT-licensed on
public npm). This was chosen partly because the client org is being mandated to move
from Azure DevOps to GitHub, which rules out investing in Azure Artifacts as a
registry, and GitHub Packages was rejected as an unnecessary auth-token complication
once public npm was already in play.

**Still open, needs sign-off before actually running `npm publish`:**
- **License.** No `license` field was added to any package.json and no `LICENSE`
  file exists in the repo. GDS and NHS.UK precedent is MIT, but this is a legal
  decision for whoever owns that call, not assumed here.
- **Publish workflow.** No CI step publishes these yet. When the license question is
  settled, add a GitHub Actions job (npm token stored as an org secret, triggered on
  a version tag or manual dispatch) — same shape as `mirror-to-dhcw.yml`.
- **Versioning policy.** All four are at `0.1.0` with caret-range internal
  dependencies (`^0.1.0`) so they can be bumped independently once published, rather
  than the previous exact pins that would have forced lockstep upgrades.

### DS website Prototypes section, using CodeSandbox Sandpack instead of StackBlitz — decided, not yet built

StackBlitz was ruled out for the embedded prototype preview: its full IDE chrome is
unnecessary here, and its underlying WebContainers runtime needs a commercial license
beyond light use. Replacing it with **Sandpack** (`@codesandbox/sandpack-react`, MIT),
which:
- gives a plain preview/code toggle (the actual ask, matching how Figma Make's
  switcher looks) with no unrelated IDE furniture we don't control
- takes files directly rather than cloning a GitHub repo, so it has **no dependency
  on repo visibility at all** — DL-028 goes away entirely once this is built
- bundles in the visitor's own browser via a **free hosted CodeSandbox compiling
  service** (no login, no API key) — decided as good enough here since the prototype
  never carries real patient data, only mock data. Self-hosting that compiling step
  instead is possible later with no code change if this ever needs to be fully
  offline.

**Built, same session, later.** DDR-019 records the decision. `build.mjs` gained
`assembleDesignSystemFiles()` / `buildSandpackFiles()`, which walk the real import
graph starting from each prototype's declared `components` list (following
`@dhcw/sr-react`'s actual `src/index.js` barrel, not the `package.json` "exports"
map — that map predates several components and is missing entries) and inline
exactly the react/web/icons/tokens files reached. Sandpack itself loads via ESM CDN
import (`esm.sh`) in the browser only, so `packages/website`'s own Node build gains
no dependency and keeps its "zero runtime dependencies" description accurate. Site
build verified end-to-end (`npm run build:site`); the actual Sandpack module load
could not be verified in this session's sandbox (no egress to `esm.sh`, same
restriction hit earlier for `stackblitz.com` and `github.io`) — needs a real-browser
check. DL-028 is retired, not just resolved, by this change.

---

## Checkpoint — 2026-07-27 (later, direct Figma session)

Branch `claude/design-system-record-continuation-2ouctr`. Worked **directly in Figma**
via `use_figma` this session — no plugin, no generated content. **File key:
`x5fwyefxxgD03csz8ld7SZ`** (SINGLE-RECORD-DESIGN-SYSTEM, NHS Wales enterprise). See the
Figma File Reference table below; record it there in every future session, it was
missing before and cost real time to recover.

### Colour Tokens frame (`125:5188`, Colours page `12:3270`) reconciled against the JSON

Was in better shape than the prior checkpoint's open item implied — status 700s,
`yellow-100`, the cyan focus ring and the full grey ramp were already correct. What
was actually wrong or missing, now fixed:

- **`sr.color.surface.background`** still showed `grey-100`/`#F0F4F5` from before the
  2026-06-04 change to `blue-50`/`#F4F5F8`. Corrected.
- **4 missing semantic rows** added to both light and dark tables: `interactive.disabled`,
  `text.disabled`, `border.subtle`, `border.disabled`.
- **Red/Green/Yellow/Info Blue primitive ramps** had no section at all (only selected
  stops inside Status); added all four as full 10-stop sections matching the
  Blue/Cyan/Navy/Neutral pattern.
- **Cyan-850** (`#0C7B99`) added as a 10th stop between 900 and 800 — this is an
  intentional addition (lightest cyan that still clears AA at 4.87:1 for white text),
  not a gap. The Figma **variable** already existed; only the documentation frame was
  behind.
- **`border.subtle` reordered** in both tables to match token declaration order
  (`subtle, default, strong, focus, disabled` — it had been appended last).
- **Two classes of layout defect, one pre-existing and widespread, one from this
  session's own edits:**
  - Row heights were fixed (56/60px) against wrapped usage-column text generated from
    token `$description`s, which run longer than the original hand-written copy —
    caused overlap in 6 pre-existing dark-mode rows plus every row this session added.
    Fixed by measuring text and growing rows to fit, across all 11 tables.
  - **22 alias badges across nearly every table (light and dark)** had a background pill
    narrower than its own text — e.g. `yellow-100` rendered as `yellow-10` with the final
    character unreadable against white. Pre-existing, not something this session
    introduced; found while chasing what looked like a single isolated case. Fixed
    generically: every badge resized to fit its text, alias columns widened where
    needed, usage columns shifted/rewrapped only where that was actually forced.
  - Verified with a structural sweep (clipping, vertical row overlap, horizontal
    alias/usage overflow, badge underfit) across the whole frame after every pass:
    zero problems on the final pass.

### Figma variables vs. the token JSON (open item 2, now closed)

Diffed all 78 primitive and 30 semantic (`Single Record` collection) variables against
`foundations/tokens/`. Found and fixed, with sign-off:

| Variable | Was | Now |
|---|---|---|
| `Status/Critical` (dark) | Red/600 | **Red/700** — matches light mode and the JSON; this is the AA contrast fix from the July reconciliation, which had reached the JSON and light mode but not the dark Figma variable |
| `Status/Success` (dark) | Green/600 | **Green/700** — same gap, same fix |
| `Interactive/Link` (light) | standalone duplicate `Info Blue` primitive | **`Info Blue/700`** — same resolved colour, but now points at the canonical stepped primitive instead of the duplicate the JSON already removed (`info-blue.default`) |
| `Focus Yellow` primitive | existed, unreferenced | **Deleted** — DDR-006 deprecated it and deferred removal until nothing referenced it; confirmed no variable-level references and no fill/stroke bindings on the Colours page. **Not exhaustively swept across all 51 pages in the file** — if anything elsewhere still shows a broken reference, this is why; recoverable via Figma version history. |
| standalone duplicate `Info Blue` primitive | existed, unreferenced after the repoint above | **Deleted**, same basis |

Everything else matched: all 10-step ramps, Navy's 5 steps, and 26 of 29 semantic
tokens across both modes.

### Two Figma plugins exist under `figma/plugins/` — do not use them

`colour-guide` and `colour-palette` predate this session's direct-write method and
generate design content programmatically rather than through `use_figma`. An earlier
attempt this session to keep `colour-guide`'s inlined data in sync with the token JSON
was **reverted at the user's explicit instruction** — the standing method is direct
authoring in Figma, not plugins. The `colour-guide` plugin's inlined colour data is
still stale (a `focus` `#FFEB3B` swatch, `border.focus` still aliasing the removed
`focus-yellow`, pre-reconciliation status colours) — do not run it without reconciling
first, or better, do not use it at all.

---

## Checkpoint - 2026-07-27

Branch `claude/single-record-ds-guidelines-v003fa`. Website chrome rebuilt to the
approved Figma page template, and the colour tokens reconciled end to end.

### Content standard (applies to ALL future DS content, not just Typography)

The design lead confirmed these as the standing rules for every page we write:

1. Class names in code samples are real `sr-*` names, following the established
   pattern (`sr-type-heading-l`, `sr-button--primary`). Never invent a class that
   does not exist in `packages/web/src` or the built token CSS.
2. Use the NHS.UK page's section order as the structural template, but rewrite all
   prose in Single Record's own voice. Do not carry over NHS-specific copy.
3. The published site is documentation plus copyable code, nothing about how the
   system is built or governed. No decision-record citations, no source file paths,
   no internal standards documents, no contribution or backlog language.
4. Any feedback affordance points at the Microsoft Forms "Report an issue" link.
5. Framework tabs are HTML, React, Blazor, MAUI, in that order, using the shared
   code panel. Do not introduce a second code-display convention.
6. **No em dashes anywhere.**

Rules 1, 3 and 6 are enforced mechanically: `publicise()` in
`packages/website/build.mjs` strips internal references and em dashes from any
markdown-sourced page, so internal guideline docs keep their citations while the
public site stays clean.

### Website

- **Logo fixed.** `packages/website/static/nhs-wales-logo.svg` was an incomplete
  export: GIG CYMRU, WALES and three of the four DHCW wordmark lines were simply
  not in the geometry, and being flat navy it also vanished on a navy masthead.
  Deleted. The site now uses `figma/assets/dhcw-logo-white.png`, which is complete
  and matches the Figma.
- Masthead rebuilt to the reference: navy bar, utility row (Report an issue,
  Cymraeg), logo, nav pills, search field. Sidebar is sticky and hugs its content.
- **Header search works.** Build-time index over every page (title, headings, body)
  emitted to `assets/search-index.js`; ranked results, keyboard navigation,
  prefix-aware links. Verified in a real browser.
- Dark-mode toggle removed at the design lead's request while colour is finalised.
  The dark token sheet still builds; re-enabling is a small change in `shell()`.
- Get Started gained a sidebar (SR Design System, How to use, Using figma), so
  Figma left the primary nav but stays reachable.
- Typography and Colour pages are the two worked exemplars of the content standard.

### Colour reconciliation

The token JSON is now the **single source of truth**. The reference markdown is
generated from it by `scripts/sync-token-docs.mjs`, which runs inside
`npm run build:tokens` and has a `--check` mode wired up as `npm run check:docs`.
Add that check to CI so the docs can never silently drift again.

Decisions taken (all were offered to the design lead, who did not select; these
are the conservative options and **none change what currently renders**, so any of
them can be reversed):

| Decision | What was done | Reverse by |
|---|---|---|
| `focus-yellow` | **Removed.** DDR-006 already made `cyan.700` the focus colour in both modes and deferred removal until nothing referenced it. Only two stale doc lines still did. | Re-add the primitive to `primitives/color.json` |
| `color.yellow.100` | JSON value `#FDF3D7` wins; `global.md` had a stale `#FDF6DC`. Both pass contrast, so this was a sync question only. | Change the value in the JSON |
| Navy ramp | **Left at 5 steps** and documented why. It is a narrow utility family, and adding unused steps would breach "everything must have a reason". | Add steps to the navy block |
| `info-blue.default` | **Removed.** It duplicated `info-blue.700` exactly and built to an odd `--color-info-blue-default`. | Re-add the alias |

Drift that was corrected:

- 24 primitives existed in the JSON but were undocumented: the full grey UI ramp,
  the full green and yellow ramps, and `cyan.850`.
- `status.critical` and `status.success` were documented as the 600 steps but ship
  as the 700 steps. **The 700s are correct**: 6.7:1 and 7.14:1 on white, against
  roughly 5:1 for the 600s.
- `border.md` still resolved the focus ring to the removed yellow primitive.

### Open, and what to pick up next

1. ~~**Figma colour guideline frame is NOT yet updated.**~~ **Done** - the Colour Tokens
   frame `125:5188` was reconciled directly in Figma. See the addendum below. The
   `Guidelines/Colours` panel (`3468:9073`) is a separate artifact and was not touched.
2. **Confirm the Figma variables match the cleaned tokens**, in particular that
   `yellow.100` is `#FDF3D7` in Figma and that no focus-yellow variable remains.
   Still outstanding. `get_variable_defs` needs a live selection, but the variable
   collections can be read programmatically via `use_figma`, so this no longer needs
   the design lead to be at the keyboard.
3. Remaining Styles pages to bring up to the content standard: Spacing & Elevation
   (still renders sanitised markdown rather than authored content) and Grids (still
   a "planned" status page). **Icons is now authored** (see the 2026-07-27 addendum).
4. DL-008 in the backlog: the CTA placement audit across forms and modals. The
   Button spec and the confirmation-dialog pattern were updated this session; the
   wider sweep is outstanding.
5. There is still no `sr-list` / `sr-link` / section-break utility CSS. The
   Typography page documents what the system actually does today rather than
   inventing class names. If those utilities are wanted, they need authoring in
   `packages/web/src` and a naming decision first.

### Addendum - Icons page (branch `claude/design-system-record-continuation-2ouctr`)

- **Icons page authored** (`styles/icons.html`), replacing the planned placeholder and
  following the content standard above. Every icon is rendered at build time from the
  built icon set, so the gallery cannot drift from what products consume. Name filter,
  click-to-copy tiles, live size and colour specimens.
- **Icon documentation was 13 icons behind the built set.** `foundations/iconography/
  catalogue.md` and `fetch-icons.js` both listed 106 aliases; the SVG source, which is
  the source of truth, holds 119. The extras arrived with the Figma icon sync and the
  language-toggle work and were never written back. Both are now reconciled. The stale
  `status/error` alias is recorded as `status/error-circle`; its circle-x glyph moved to
  `nav/clear`.
- **Warning icon colour is a documented accessibility exception.** Every other icon role
  clears 3:1 on a light surface. The warning role resolves to Yellow/500, a fill colour,
  and reaches 1.6:1 on white. The token is left unchanged because colour changes need
  sign-off; the page states the limit and requires a text label alongside the icon.
  **This needs a decision from the design lead** - either a darker warning role token or
  a formal DDR recording the exception.
- **Sidebar** nav column now stretches to the full height of the layout row, with the menu
  inside it doing the sticking, so the background runs the length of the page.

### Figma file key - record it, do not lose it again

**File key: `x5fwyefxxgD03csz8ld7SZ`** (SINGLE-RECORD-DESIGN-SYSTEM, NHS Wales
enterprise, Full seat). Also in the Figma File Reference table below.

Every Figma MCP tool takes a required `fileKey`, including `use_figma`, which is the
direct-write tool. It was never recorded in this repo, only bare node ids, so a session
that starts without it in the conversation cannot reach Figma at all. If a session reports
Figma as unreachable, check the MCP connection first: the symptom also appears when
continuing a session from a machine whose desktop Claude is not signed in to the Figma
account.

**Method: author directly in Figma via `use_figma`.** Do not build or run Figma plugins to
generate design content. The two plugins under `figma/plugins/` predate this and their
inlined colour data is stale, notably a `focus` `#FFEB3B` swatch and a `border.focus` that
still aliases the removed `focus-yellow`. Do not run them without reconciling them first.

### Colour Tokens frame `125:5188` reconciled in Figma

Done directly in Figma. The frame was in better shape than open item 1 implied: the status
700s, `yellow.100` `#FDF3D7`, the `cyan-700` focus ring, the full grey ramp and the whole
dark-mode table were already correct.

| Change | Detail |
|---|---|
| Corrected `surface.background` | Read `#F0F4F5` / `grey-100`; the token moved to `blue-50` `#F4F5F8` on 2026-06-04 and the frame never caught up. Swatch fill, hex label, alias label and layer names all updated. |
| 4 semantic rows added, light and dark | `interactive.disabled`, `text.disabled`, `border.subtle`, `border.disabled`. All four ship in the tokens and are bound across components but were undocumented. Cloned from existing rows so styling carries over. |
| 4 primitive ramps added | Red, Green, Yellow, Info Blue, full 10 stops each, cloned from the Neutral ramp section. Order is now Blue, Cyan, Navy, Red, Green, Yellow, Info Blue, Status, Neutral. |

**Gotchas for anyone editing this frame:**

- The `Table Body` frames have `layoutMode: NONE`. Rows are **absolutely positioned**, so a
  cloned row lands exactly on top of its template and must have its `y` set explicitly.
  Child index does not affect visual order; `y` does.
- `Section` and `Frame 1` (`1235:1719`) are vertical auto-layout and hug, so they grow on
  their own. `Main Content` (`125:5234`) and the page frame (`125:5188`) are **fixed** and
  must be grown by hand, which is why the frame is now 9397px tall.
- The first row of each table is 62px against 61px for the rest, so reordering rows moves
  that 1px divider. New rows were appended rather than inserted for this reason, which is
  why `border.subtle` sits after `border.focus` instead of in token order.
- Ramp cells carry a role label on the swatch. Stops with no assigned role have the label
  frame set to `visible = false` rather than deleted.

Verified structurally across the whole frame: no clipped frames, no overlapping siblings.

**Not done, deliberately:** `cyan.850` (`#0C7B99`) is still missing from the Cyan ramp,
which shows 9 of its 10 stops. It is referenced, not unused: dark-mode
`surface.small-cards` resolves to it. The design lead did not select it this session.

**Pre-existing defect, not introduced here:** in the dark-mode Interactive table, the usage
text on the `primary` and `primary-hover` rows is taller than the 60px rows and overlaps
into the row below. Worth a pass when someone is next in that table.

### Useful commands

```
npm run build:tokens    build tokens and re-sync the colour docs
npm run check:docs      fail if the colour docs have drifted from the JSON
npm run build:site      tokens + website
npm run build:pages     tokens + website + storybook, assembled into site-dist/
```

---

## Checkpoint — 2026-07-09

Branch `claude/single-record-ds-guidelines-v003fa`. Guidelines programme kicked off.

- **Reusable guidelines format defined** — `docs/templates/guidelines-template.md`.
  One `*.guidelines.md` per DS topic (Foundation/Component/Pattern) is the **single
  source** for both the Figma "Guidelines / Usage notes" panel (format seeded from
  node `3446:8762`) and the topic's DS-website page. Shape mirrors NHS England / GDS
  (When to use · When not to use · How it works · Do & don't · Accessibility ·
  Content · Frameworks · Clinical/DHCW notes). Framework coverage now spells out
  **Web (HTML/CSS) + React** alongside Blazor/MAUI (new SR app is likely React).
- **Typography guideline authored** (first exemplar) — `foundations/tokens/
  typography.guidelines.md`. Grounded in DDR-005 tokens; NHS/GDS structure; folds in
  carried-forward clinical requirements (zoomable relative sizing, Body M 16px min,
  sentence case) with source anchors. `typography.md` stays the token reference.
- **Design-language shift: primary-content minimum is now Body S (14px), not 16px.**
  Directed by the design lead for this table/data-heavy clinical system. Stays WCAG 2.2
  AA (no min font-size SC; resize/reflow/contrast all met). Body M (16px) preferred for
  long-form/clinical notes. Applied to `typography.guidelines.md` and the token
  reference `typography.md` (accessibility notes + Body M/S rows). **Consider a DDR** to
  formalise the divergence. Also: guideline copy switched to **bulleted** critical
  points and **em dashes removed**.
- **Guidelines panel built IN FIGMA** on the Typography page (`12:3378`). Cloned the
  former "Guidelines/Usage notes" panel format (`3446:8762`) → new
  **`Guidelines/Typography` (`3460:20`)** at x=0, y=850 (below the original, which is
  left intact as the template). Repopulated with 8 sections (When to use · Type scale ·
  Typeface & weight · Minimum size · Responsive · Hierarchy · Accessibility · Content).
  All fills variable-bound (navy header `203:92`, title Interactive/Primary `203:90`,
  body Text/Default `92:1488`, divider Grey/200 `203:103`) so dark-mode/token switches
  flow through. **Pattern to reuse for every other guidelines page.**
- **DHCW UI Standards Guide v1.3 extracted** to `docs/reference/dhcw-ui-standards-v1.3.md`
  (faithful, page-anchored `[p.N]`). Legacy WCP/eForms content standards — clinical/
  content/interaction rules are authoritative *input*; hex colours / rem sizes / the
  Appendix CSS are **superseded by tokens**. **UI-standards review project opened** at
  `docs/ui-standards-review/` (README + `standards-inventory.md` triage worksheet, 57
  standards catalogued with disposition codes).
- **Grey primitive expanded to a full 50–900 ramp — SIGNED OFF & APPLIED.** Additive
  (900/600/200/100 unchanged, no rebinding); added 800/700/500/400/300/50 anchored to
  the NHS neutral greys, incl. **Grey/500 `#768692`** for placeholder/muted use.
  Applied to `foundations/tokens/primitives/color.json`, rebuilt token outputs, updated
  the palette-frame plugin, and created the six new variables in the **Figma Primitives
  collection** (`VariableCollectionId:203:2`, single Default mode, `ALL_SCOPES` to match
  siblings). Placeholder **semantic** token deferred (user will set later) — for
  accessible placeholder *text* use Grey/600 (4.5:1); Grey/500 is for muted fills/
  borders/disabled (3.75:1, non-text).

---

## Checkpoint — 2026-07-09 (later)

- **Placeholder decision finalised.** No separate placeholder semantic token.
  Placeholder text defers to **`Text/Secondary` (Grey/600, 4.5:1+ AA)**; distinguish an
  entered value (`Text/Default` Grey/900) from a placeholder by lightness. `Grey/500`
  (#768692) is disabled/muted/non-text only. **Deleted the `Text/Placeholder` Figma
  variable** (`3417:22607`) — verified unused on Input/Select pages first. To be written
  up fully in the Input and Select guidelines.
- **Colour guideline authored** — `foundations/tokens/colour/colour.guidelines.md`
  (single source) and the **`Guidelines/Colours` Figma panel (`3468:9073`)** repopulated
  (8 bulleted sections incl. the placeholder decision). Same clone-and-repopulate pattern.
- **Typography Figma frame (`89:3074`) synced to the 14px direction** — Body M usage →
  "Long-form reading, prose, clinical notes"; Body S usage → "Primary content in tables
  and data-dense views; supporting text; form values".
- **Colour-tokens frame (`125:5188`) — grey grid NOT yet extended.** Its primitives grey
  group is a hand-built absolute-positioned row of the 4 in-use greys (raw fills, not
  variables). Extending to the full 10-stop ramp is a two-row grid rebuild; deferred (not
  in the Figma→website pipeline path). Token JSON + Figma variables already carry the full
  ramp.
- **DS website Phase A shipped — Figma→website pipeline proven.** New `packages/website`
  (`@dhcw/sr-website`, **zero runtime deps** — self-contained md renderer in `build.mjs`).
  Generates Overview + Typography + Colour pages from the **built token artifact**
  (`packages/tokens/build`) and the single-source guideline docs. Colour page renders the
  full grey ramp (all 10 stops incl. the new ones) + semantic swatches straight from
  `tokens-flat.json`; Typography page renders the live `.sr-type-*` scale. Site chrome is
  token-bound (no hardcoded palette), dark-mode toggle wired. Root scripts: `build:site`;
  workspace added. CI: `.github/workflows/deploy-website.yml` — build+artifact on every
  push/PR (runs everywhere), Pages deploy is manual + org-guarded so it won't clobber the
  Storybook preview at root (DDR-014). Verified end to end via headless Chromium.
- **DDR-015** (primary-content min = Body S 14px) and **DDR-016** (website IA + single
  Pages publisher) written and Accepted.
- **Publishing consolidated (DDR-016).** One Pages site: **website at `/`, Storybook at
  `/storybook`**. `npm run build:pages` builds tokens → website → Storybook and assembles
  `site-dist/` via `scripts/assemble-pages.mjs`. Storybook `.storybook/main.js` now sets
  Vite `base:'./'` for subpath serving; website has a **Catalogue** nav link → `/storybook`.
  Replaced `deploy-storybook.yml` + `deploy-website.yml` with **`deploy-pages.yml`** (build
  everywhere + artifact; deploy org-guarded, never on PRs; 30-min preview cron). Verified
  end to end over HTTP — Storybook renders correctly at the subpath.
- **Colour-tokens Figma grey grid rebuilt** (`125:5188`, Neutral section `125:5524`). The
  primitives grey row is now the full 10-stop ramp in a wrapping auto-layout (2 rows), each
  cell with role label + stop + hex, legible on-swatch text (white on 900–500, dark on
  400–50). Section set to hug; the two fixed ancestor frames grown +142px so nothing clips.
- **Website grown toward Concept B.** `packages/website/build.mjs` now emits: Overview, 3
  **foundations** (Typography, Colour, **Spacing** — new `spacing.guidelines.md` + live
  `--space-*` scale & radius), a **Button component page** with **variant + size + framework
  switchers** (Web/React/Blazor/MAUI) driving a live `button.css` preview and copyable code,
  and a **token translator** (Tools) — client-side, no external calls: pastes CSS, matches
  `#hex` by CIELAB ΔE and `px` against the 4px grid into Exact / Close / No-match buckets
  (verified: `#325083`→blue-800 ΔE0, `#ff4400`→no-match ΔE21.7). Site CSS moved to
  `packages/website/site.css`. All token-bound, dark-mode toggle. Verified via headless Chromium.
- **Still open:** gated release publish (build from release tag, DDR-014); more components;
  Welsh-language toggle; translator file-upload + CSV/JSON export; DDR for Website IA is DDR-016.
- **Tables guideline — seed content (to formalise).** Two content rules captured for a future
  Tables guideline (component `components/table/`, Figma Tables page):
  - ~~**Dates: keep the legacy DHCW format `dd-Mmm-yyyy`**~~ **SUPERSEDED 2026-07-28.**
    The design lead set the system-wide rule as **`10 Mar 2026` in tables and other
    space-constrained UI, and `10 March 2026` in prose** and anywhere without a width
    constraint. This reinstates roughly the `10 Jan 2020` shape that was dropped here
    earlier, so the reversal is deliberate — do not revert to hyphens. The clinical-safety
    intent of UI Standards [p.24](../docs/reference/dhcw-ui-standards-v1.3.md#page-24) is
    unchanged: a **named month**, never an all-numeric date. See DL-022.
  - **Table headings: allow `No.` as the abbreviation for "Number"** where column width is
    tight. This is a deliberate **exception** to the general "avoid abbreviations / no full
    stops" rule (UI Standards [p.10](../docs/reference/dhcw-ui-standards-v1.3.md#page-10)),
    justified by table space constraints and limited to headings.
  Flagged, not yet built — user will return to the Tables guideline.

---

## Checkpoint — 2026-07-07

Way-of-working formalised this session (branch `claude/design-system-workflow-j4xir6`):

- **DDR-014 — Design-to-Publish Workflow.** Records the full pipeline: two export
  lanes (non-code → `main` via auto-checked PR; code → `feature/{component}` →
  PR → `main`); **read-only fast-forward mirror**, single writer on org `main`;
  **design owns the entire DS repo** (incl. `/products`), **devs own their own
  product repos** and consume + file GitHub issues; **preview** (Storybook + VS
  gallery, from `main`, cron + manual) vs **published** (DS website, from the
  release tag, gated); releases performed in the **org** repo (Gate 2). Evolution
  path noted: mirror-to-branch + CODEOWNERS when a second writer appears.
- **Preview CI wired.** `deploy-storybook.yml` gains `schedule` (every 30 min,
  tunable) + `workflow_dispatch`, and both jobs are guarded to the org repo
  (`if: github.repository == …`) so the personal repo never red-Xes on a
  scheduled run. Storybook stays at Pages root until the website ships, then
  moves to `/catalogue/` (website takes root).
- **Workflow diagram** added to the FigJam DESIGN-SYSTEM-BOARD for sharing.

### Open follow-ups from this session
- **DS website build** (Concept B) — not started. Needs its own DDRs (Website IA &
  Translator Placement; Token Translator Architecture) + the `release`-triggered
  publish workflow (deferred until the site build exists — no placeholder CI).
- ✅ **Website build brief** committed at `docs/website-build-brief.md` with the
  stale hexes corrected (`interactive.primary #325083`, `border.focus #12a3c9`,
  `text.secondary #4c6272`), Button `Warning`→`Destructive`, hosting decided per
  DDR-014, and a *Prototype & corrections* table. The concept HTML is **not**
  committed (hardcoded hex; corrections captured in the brief instead).
- ✅ **Adoption guide** landed at `docs/engineering/adopting-components.md`
  (linked from `for-engineers.md`). Feedback channel decided: **GitHub issues on
  the org repo** (matches DDR-014). Token examples corrected to the real build API
  (`--sr-color-*`, `--space-*`, `text-inverse`; MAUI `SrColor*` / `Space*`).
- ✅ **Blazor Button is now a buildable Razor Class Library.** Added
  `packages/blazor/DHCW.SingleRecord.Components.csproj` (net8.0, RCL),
  `_Imports.razor`, a shared `src/Gallery.razor` (Button variant matrix), and
  `wwwroot/css/` (copied `tokens.css`/`tokens-dark.css`/`button.css`, served at
  `_content/DHCW.SingleRecord.Components/css/…`). ⚠️ **No .NET SDK in the web
  session** — the library is authored but **not compile-verified**; if VS shows a
  build error, report it for a fix.
- ✅ **VS Blazor+MAUI preview guide** at `docs/engineering/visual-studio-preview.md`
  — answers "clone vs new project" (clone the repo), then create a Blazor Web host
  + a MAUI Blazor Hybrid host via VS templates, reference the RCL, render
  `<Gallery />`, F5. MAUI preview = the Blazor component rendered natively via
  Blazor Hybrid (no separate native-XAML Button by design, DDR-011).
- Still open: `packages/web` `main` points at a **missing `src/index.css`** (no
  aggregated CSS bundle); host apps + `preview/*.sln` are created by the user in VS.
- **Figma guidelines ↔ website guidelines** sync — to design.

---

## Checkpoint — 2026-07-03

Landed this session (branch `claude/table-icon-colors-9j96s1`, merged to main):

- **Table** (`packages/web/src/table/`, Figma 1363:22598): Info Blue/50 header, Body S cells, Border/Subtle dividers. `layout` toggle — `plain` / `kebab-left` (nav/menu2) / `icons-left` / `row-headers`. Row action / menu icons render Interactive/Primary (blue), delete red. Spec `/components/table/spec.md`.
- **Tag** (`packages/web/src/tags/` + `packages/react/src/tags/`, Figma 399:7984): Blue/Green/Red/Yellow/Grey/Outline × Default/Small, with a **closable** filter-tag variant (`.sr-tag--closable` + `.sr-tag__close`, `nav/close`). Spec `/components/tags/spec.md`.
- **Select** (`packages/web/src/select/` + React, Figma 1517:14471): custom listbox — button trigger (`aria-haspopup`), `role="listbox"`/`option`, full keyboard, 3px Cyan/700 focus ring, error/disabled, nested-menu chevron. Spec `/components/select/spec.md`.
- **Autocomplete** (`packages/web/src/autocomplete/` + React): searchable select **composed** from Input search field + Select listbox (no new tokens). Combobox ARIA, live filter, match-bolding, clear button. **A dedicated Figma component is still TBD** — this reference is the interim contract. Spec `/components/autocomplete/spec.md`.
- **Segmented control** (`packages/web/src/segmented-control/`) restyled to the Figma segment building block (2752:40): 8px-radius track, hover = Info Blue/50 wash + brand-blue text, disabled-selected = muted outline, Cyan/700 focus ring. Distinct from the Toggle Switch. React consumes the same shared CSS.
- **Status contrast fix (AA).** `Status/Critical` Red/600 → **Red/700 (#B32014)**, `Status/Success` Green/600 → **Green/700 (#006630)** in both light and dark semantic tokens. `Interactive/Destructive` unchanged (Red/600 — separate role). Token outputs rebuilt.
- **Icons:** `nav/dashboard` now used for the Dashboard nav item (was `data/table`), in web + React storybooks. New **`action/hold`** icon added. ⚠️ The Figma asset host is blocked by egress policy, so `action/hold` uses the Lucide `pause` glyph (two bars) as a faithful stand-in — **confirm it matches the Figma artwork.**

### Fixes (follow-up, after PR #49)
- **Tag refactored into two variants** matching the new Figma split: `status` (filled — Blue/Green/Red/Yellow/Grey/Outline, no close, `399:7984`) and `filter` (outline only + close — Blue/Green/Red/Yellow/**Black**, `3229:71674`). Class contract: `.sr-tag--status|--filter` + type + size. Web + React stories rebuilt (old Closable/Matrix previews removed).
- **Select hover** now distinct from active/selected: hover = Info Blue/50 wash (secondary text); keyboard-active + selected = Interactive/Primary fill (white). Matches option-items `1517:14856`.
- **React icon fixes:** Select error icon (was 24px black → 16px red), nested-option chevron on active blue (was black → white), trigger chevron, and Autocomplete search/clear icons — all now pass `size` + `color="inherit"` to `<Icon>` so the wrapper's size/colour win.

### Open follow-ups for next session
- Confirm the `action/hold` glyph vs Figma (egress-blocked).
- Autocomplete needs a dedicated Figma design to ratify the interim reference.
- **Table toolbar/filter + pagination pattern** — the natural home for the filter tags + segmented control + autocomplete. Not started (wants a Figma design first).

---

## Checkpoint — 2026-07-01

Code session — coded reference components shipped to Storybook (web `@dhcw/sr-web`
+ React `@dhcw/sr-react`), no Figma writes. All verified with axe (0
serious/critical) and screenshots against Figma.

- **Repo build fix.** Root `.gitignore` blanket-ignored `package.json`, so
  `packages/icons/package.json` had never been committed — CI/fresh clones
  couldn't resolve `@dhcw/sr-icons` and `build-storybook` failed. Removed the
  blanket rules and committed the manifest. (Closes the "Narrow root .gitignore"
  open item.)
- **Components shipped (web + React, in Storybook):** Header (Desktop 1,
  **Desktop 2** = org selector + Cymraeg, Mobile 1/2), Footer (desktop
  save/version bar), Breadcrumbs, **Bottom navigation** (mobile tab bar,
  665:16526), Navigation (expandable submenus with real children; icon-only
  collapsed rail now has `aria-label` per item — fixed 13 axe button-name
  violations; logo hidden when collapsed), **Input** (text/password/phone/
  textarea + calendar→DatePicker, time→TimeSelect), **Toggle switch**,
  **Segmented control**, **Date input** (3-field GDS/NHS), **Date picker**
  (custom calendar popover, no dep, full keyboard), **Time select**,
  **Status indicator** (filled success/error/warning).
- **Icon set synced with Figma** → 118 icons. Added globe `location/language`
  (2962:53479) + 12 outline icons (action/check·edit2·eye·eye-off·scan,
  data/grid-2x2·grid-3x3, nav/clear·dashboard·menu2, status/alert·error-circle),
  each matched to its Lucide source by sight. `status/error` (circle-x) relocated
  to `nav/clear` to match Figma. `warnings/determinate` **deferred** (purpose
  unknown); the other warnings/* ship as the StatusIndicator component.
- **DDR-012** — date/time entry: 3-field DateInput is the default for *known*
  dates (not just DOB); calendar picker only for *choosing* (scheduling); time
  is a text field or select, never a wheel. WCAG 2.2 AA applies to new internal
  tools; the 3-field pattern is the GDS/NHS design standard.
- **DDR-013** — the filled warnings/* group ships as `StatusIndicator`, colour
  driven by status tokens, geometry **derived from Lucide (ISC), not traced** —
  no licensing exposure.
- **Logo is a neutral placeholder** (`packages/web/src/assets/logo.js`, symbol +
  wordmark). The real NHS/GIG lockups are trademarked raster assets and Figma
  egress is blocked from the coding env — swap the placeholder for the official
  exported SVG/PNGs (or enable figma.com egress) when available. Header/Nav take
  the logo as a prop, so it's a one-line change per consumer.
- **Next:** Tables (queued, not started).

---

## Checkpoint — 2026-06-26

- **Desktop/mobile form-factor model decided (DDR-011).** Two orthogonal axes: **platform** = `packages/*` (incl. MAUI); **form factor** = responsive tokens/variants *inside* each platform — **no separate desktop/mobile trees**. Per-component class: **Responsive** (most; tokens only), **Adaptive** (a `Breakpoint=Desktop/Mobile` variant), **Distinct** (separate components, e.g. header/footer/nav). Web adapts responsively in one codebase; MAUI uses `OnIdiom`.
- **Typography token build fixed.** Composites were emitting `--sr-typography-*: [object Object];`. `@dhcw/sr-tokens` now generates `build/css/typography.css` — mobile-first `.sr-type-*` utility classes, desktop override at ≥1024px — and filters the composites out of the CSS/SCSS/XAML var dumps. No `[object Object]` left in the build.
- **Storybook previews all breakpoints.** `.storybook/preview.js` adds SR viewports (Mobile/Tablet/Desktop/Large/X-Large) from `breakpoints.json` and imports `typography.css`; new **Foundations → Typography** story shows the responsive scale. Build verified.
- **Dark mode is the third token-driven axis (DDR-011) and now previews for real.** Structure was already complete (`color.dark.json` → `tokens-dark.css`/scss/XAML, `[data-theme="dark"]`, Figma Dark mode). Preview was faked (a dark *background* swatch that never activated dark tokens) — replaced with a **Theme** toolbar toggle that imports `tokens-dark.css`, sets `data-theme`, and paints the canvas from tokens. axe-core now runs in both themes; theme × form factor are both togglable.
- **Spec template updated:** new **Responsive behaviour** section (form-factor class + per-breakpoint table); fixed the stale "amber focus ring" line to `Border/Focus` Cyan/700 (DDR-006).

---

## Checkpoint — 2026-06-25

- **Storybook toolchain security upgrade (DDR-010).** Dependabot raised 8 alerts (1 high, 7 moderate) — all dev-only (Vite/esbuild/uuid via Storybook), none in published packages or the deployed static site. Cleared by upgrading `packages/storybook` to **Storybook 9.1.x on Vite 7.x** (`storybook`, `@storybook/html-vite`, `@storybook/addon-a11y` → `^9.1.0`; `vite` → `^7`). `@storybook/addon-essentials` removed (folded into Storybook 9 core); `.storybook/main.js` and `preview.js` migrated (v9 `backgrounds.options` + `initialGlobals`). Verified: `npm audit` = **0 vulnerabilities**, `npm run build-storybook` builds on SB 9.1.20 / Vite 7.3.6. Lockfile pins vite 7.x + esbuild ≥ 0.25 everywhere (incl. the `@vitest/mocker` copy, deduped) — deterministic via `npm ci`, no `overrides` needed.
- **`.github/dependabot.yml` added.** Weekly npm + github-actions version-update PRs, grouped (Storybook/Vite toolchain group + batched dev minor/patch) to keep the feed signal-rich.

---

## Checkpoint — 2026-06-24

This session's accepted changes (code + docs; no Figma changes):

- **Storybook live on GitHub Pages.** Pages enabled on the DHCW org repo (Source = GitHub Actions); Storybook publishes to `https://dhcw-digital-health-and-care-wales.github.io/single-record-design-system/`. Deploy workflow (`.github/workflows/deploy-storybook.yml`) cleaned up: removed the temporary feature-branch trigger (now `main` + manual `workflow_dispatch` only); bumped `actions/checkout`/`actions/setup-node` to v5 and Node to 22 to clear Node 20 deprecation warnings. **Gotcha for next session:** mirror pushes via deploy key do NOT auto-trigger workflows on the org repo — use "Run workflow" manually after each merge to main. Personal repo has no Pages (free plan) — disable the workflow there to avoid red-X noise.
- **React Button shipped** (`packages/react/src/button/Button.jsx`): `forwardRef` wrapper around the shared `@dhcw/sr-web` `button.css`, full prop API (type/size/disabled/leadingIcon/trailingIcon). Story renders in the HTML Storybook via `createRoot` → appears as **React/Button** alongside **Components/Button**. `react`/`react-dom` added as Storybook devDeps; React glob enabled in `.storybook/main.js`. `@dhcw/sr-react` added to root workspaces.
- **Blazor Button shipped** (`packages/blazor/src/Button/SrButton.razor` + `ButtonType.cs`/`ButtonSize.cs`): Razor component, icon `RenderFragment` slots, `EventCallback<MouseEventArgs>`, consumes the same `sr-button` CSS. **Cannot render in Storybook** (needs .NET runtime) — live preview will come from the planned Blazor WASM gallery (see Open Work Items).
- **Token drift fixed.** `foundations/tokens/border.json` had `color.border.focus` still aliasing the deprecated `focus-yellow`; corrected to `{color.cyan.700}` per DDR-006. Rebuilt all token outputs; updated `border.md`. Verified all other Button-relevant tokens match the Figma variables (`1346:500`).
- **Tokens `build/` now tracked.** Removed `build/` from `packages/tokens/.gitignore` so the generated CSS/SCSS/XAML/JSON are visible in editors and version-controlled (source of truth remains `/foundations/tokens/`; re-run `npm run build:tokens` and commit after token changes). Fixed a doubled-prefix bug in the tokens README examples (`--sr-color-*`, not `--sr-sr-color-*`).

---

## Checkpoint — 2026-06-23

This session's accepted changes (in Figma, tokens, docs):

- **Notification banner** built (`2561:19825`). GDS-aligned name. 5 severity types (Information, Success, Warning, Error, Critical) + structural variants (Global/system, Inline, composed title+body+actions, Minimal). All bound to `Status/*` and `Status/* Surface`, icons from `Icon/status/*` and `Icon/warnings/*`. Critical tier is NHS-specific (above Error) for patient-safety alerts.
- **Yellow primitive scale expanded** from 2 stops (500, 100) to a full 50–900 scale, matching Red/Green. Added darker variants (`Yellow/700` `#8A5A00` for warning banner/pill text, plus 600/800/900). `Yellow/100` corrected to `#FDF3D7`, `Yellow/50` `#FFFAEB`. Applied in both `foundations/tokens/primitives/color.json` and the Figma Primitives collection.
- **Modal dialog** built (`2561:22206`). See **DDR-008**: one base `Modal dialog` component, with **Confirmation** and **Result** as composed patterns. Confirmation: Standard, Destructive, Warning, Acknowledgement, High-stakes (checkbox gate), Processing. Result: Success (simple / next-step / summary), Error. Includes usage/dev-handoff panels (when-to-use vs toast/inline banner, anatomy, accessibility, do-not, tokens). Uses `Elevation/Overlay`, `Button`, `Icon`, `Checkbox/Boxes`.
- **Packages monorepo + token build pipeline** landed earlier (DDR-007): Style Dictionary outputs CSS/SCSS/XAML/JSON from the DTCG sources. .NET 4.8 gets tokens (CSS custom properties) only — no component library; GovUk.Frontend.AspNetCore is incompatible with 4.8.
- **Storybook component catalogue** added (DDR-009). New `packages/storybook` (`@dhcw/sr-storybook`, dev-only, HTML+Vite renderer); root `package.json` adds npm workspaces. Stories live next to components in their packages. First reference component **Button** (`packages/web/src/button/`) + a **Foundations → Colour** token-showcase story ship with it, both rendering from generated `@dhcw/sr-tokens` CSS. `@storybook/addon-a11y` runs axe-core on every story. Telemetry disabled. `deploy-storybook` GitHub Action publishes the static build to GitHub Pages on push to `main` (needs one-time Settings → Pages → Source = "GitHub Actions"). Devs run `npm run storybook` (localhost:6006); everyone else uses the published URL. Build verified locally.

---

## Checkpoint — 2026-06-12

Snapshot taken as engineers were onboarded to the Figma library and this repo.

- **Required marker now on all form fields.** Checkbox (`Required#2287:0`) and Radio (`Required#2287:13`) joined Input, Select, and Search. See `/components/form-fields.md`.
- **Framework support broadened in docs.** Standard HTML/CSS (reference baseline), Blazor, React, and .NET MAUI are documented as current targets in `/docs/for-engineers.md`, with per-framework token consumption examples. Legacy **.NET Framework 4.8** added as *limited* (CSS custom properties / token values only — visual layer, no component model). Delphi noted as maintained, not extended. Tech tables in `README.md`, `DESIGN-SYSTEM.md`, and `CLAUDE.md` updated to match.
- **Concept prototypes removed.** `concept-patient-record.html` and `concept-patient-search.html` deleted from the repo root — they used hardcoded NHS colours, not design-system tokens, and were not referenced anywhere. Production patterns live in `/patterns/`.
- README status moved from "Initialising" to "Active development" with a pointer to the live component catalogue.

---

## Form fields rebound — 2026-06-04 (later in day)

Cross-cutting change applied to Input, Select, Radio, Checkbox:

- **Typography**: Label/Legend → `Label` (14/20 M), Value/Placeholder/Option text → `Body S` (14/20 R), Hint/Description/Error → `Caption` (12/16 R). 336 text nodes rebound across all sets and templates. See `/components/form-fields.md`.
- **Required boolean** added to Input and Select sets (`Required#1835:0`, `Required#1835:38`). Toggling shows an inline `*` in `Status/Critical` after the label. Pair with `aria-required` in code; the asterisk is decorative only.
- **Required boolean now on all form fields** (2026-06-12). Added to **Checkbox** (`Required#2287:0`) and **Radio** (`Required#2287:13`) — the asterisk renders after the group legend (Legend=Shown only). Each legend was wrapped in a horizontal `Label Row` to hold the inline `*`. **Search** already carried `Required#1851:50`. So Input, Select, Search, Checkbox, Radio all expose `Required` now.
- **Search variants removed from Input** (8 variants gone). The standalone `Search` component set (`1715:375`) is now canonical. For labelled/hinted search in a form, wrap a Search instance with label/hint rows.
- **Textarea variants added to Input** (4 — one per state, Label=Shown, Hint=Hidden, 120px min-height).
- See `/components/form-fields.md` for the full mapping and the Form Field wrapper as a future task.

---

## Weekly Checkpoint — 2026-06-04

This week's accepted changes (now reflected in Figma, tokens, and docs):

- **DDR-005** — typography scale cleaned to 4px grid. New desktop scale XS 16/24 · S 20/28 · M 24/32 · L 28/36 · XL 36/44. New mobile XS 16/24 · S 18/24 · M 20/28 · L 24/32 · XL 28/36. Letter-spacing aligned to Figma (`wide` 0.3, `caption` 0.2). Off-grid primitives deleted from Figma.
- **DDR-006** — focus ring changed from `Focus Yellow` (#FFEB3B) to `Cyan/700` (#12A3C9) in both modes. `focus-yellow` primitive deprecated, not yet removed.
- Dark mode `Interactive/Primary` updated to `Info Blue/600` (#0D62A3), hover to `Info Blue/800`. Supersedes the earlier Cyan/850 decision.
- New semantic tokens added: `Interactive/Disabled`, `Text/Disabled`, `Border/Disabled` (now bound across components).
- Surface/Background (light) shifted from `Grey/100` to `Blue/50` (#F4F5F8) for a slightly cooler page tone.
- Status surfaces in dark mode kept light (red.100, green.100, yellow.100, info-blue.100) — banners use light fills in both modes for contrast against the bright status colour.
- New components: **Link** component set (36 variants) — see `/components/link/spec.md`, Figma node `1633:320`.

---

## Current Design System State (as of 2026-06-04)

### Tokens in Figma
- **Primitives:** Blue, Navy, Cyan, Red, Green, Teal, White, Grey scales defined
- **Semantic (Single Record):** Interactive/Primary, Interactive/Destructive, Interactive/Disabled, Text/Default, Text/Inverse, Text/Disabled, Surface/Default, Surface/Small Cards, Border/Default, Border/Focus, Border/Disabled
- **Missing (pending sign-off):** `Border/Error` → see DL-006

### Components completed in Figma
| Component | Status | Notes |
|---|---|---|
| Button | Done | All 12 disabled variants use semantic disabled tokens. Active/pressed deferred (DL-003). |
| Input Field / Text Input | Done | Error states use `Interactive/Destructive` directly — will shift to `Border/Error` when DL-006 lands |
| Checkbox | Done | 11 variants. Checkmark is a proper vector path. All fills, strokes, text bound to variables. Error-indeterminate removed; error-checked has red border. |
| Radio | Done | Building blocks and templates variable-bound |
| Toggle Switch | Done | Focus ring is OUTSIDE stroke on Track Wrapper only (not label). 3px padding added to variant for ring clearance. |
| Select | Done | |
| Navigation / Sidebar | Done | All Nav Item instances swapped to correct component set (368:3682). 140 instances updated. |
| Breadcrumbs | Done | |
| Header / Footer | Done | |
| Tags | In progress | |
| Error/Warning Messages | In progress | |

### Icons (page 103:760)
- Library is Lucide-based, 24×24, stroke-only, all strokes bound to `VariableID:203:100` (Text/Default)
- Recently added: `Icon/action/edit2` (Lucide square-pen) — use for editing a record/document; `Icon/action/edit` (plain pen) for inline text editing
- Recently added: `Icon/status/error-circle` (circle with exclamation) — use alongside error text
- Status icons exist for: info, warning, error-circle, pending

---

## Open Work Items

### Pending sign-off before acting
| Item | What's needed |
|---|---|
| DL-006: `Border/Error` token | Create `Border/Error` → `Interactive/Destructive` → Red/600. Apply to all form error borders. Needs sign-off first. |
| DL-003: Active/pressed state | Blue/800 = default, Blue/900 = hover. Active/pressed colour TBD. Do not proceed without sign-off. |

### Ready to action (no sign-off needed)
| Item | Detail |
|---|---|
| Apply disabled tokens to remaining components | Tabs, form controls beyond Button still use primitives. Pattern: `Interactive/Disabled` (Blue/400), `Text/Disabled` (Navy/300), `Border/Disabled` (Navy/300) |
| DL-005 component audit | Desktop heading scale changed (XS=16, S=20, M=24, L=28, XL=36). Need visual check on Button, Input Field, Select, and any component using SR Typography/Desktop/Heading S–XL |
| Toggle building blocks | `_Toggle/Track` and related building blocks not yet formalised |
| ~~Destructive button type~~ **(resolved 2026-06-24)** | The red 4th button type was named `Warning` but styled red. Renamed `Warning` → `Destructive` (Figma `1346:500` + coded `.sr-button--destructive`). No amber button added — GDS/NHS have no amber button; severity nuance lives in the confirmation dialog. Modal patterns instance `Destructive` directly. See DDR-008. |
| Show/hide pattern for component parts | Decision made: boolean Component Property for optional decoration (icons, badges); variant for layout-shifting show/hide (label, hint). Hidden layers = `visible=false`, never delete. Apply consistently when building new components. |
| ~~Enable GitHub Pages for Storybook~~ **(resolved 2026-06-24)** | Pages enabled on the DHCW org repo (Source = GitHub Actions). Storybook deploys to `https://dhcw-digital-health-and-care-wales.github.io/single-record-design-system/`. Personal repo doesn't have Pages (free plan); disable the workflow there via Actions → ⋯ → Disable workflow to avoid red-X noise. Mirror pushes via deploy key don't auto-trigger workflows on the org repo — use "Run workflow" manually after each mirror. |
| ~~Narrow root `.gitignore`~~ **(resolved 2026-07-01)** | Removed the blanket `package.json`/`package-lock.json` ignore rules and committed the previously-untracked `packages/icons/package.json` (its absence was breaking CI/fresh-clone Storybook builds). Package manifests now track normally. |
| Grow Storybook coverage | Add stories alongside each new `@dhcw/sr-web` component; enable the `@dhcw/sr-react` stories glob in `.storybook/main.js` once that package has components. Storybook MCP deferred (DDR-009). |
| Blazor WASM component gallery | Scaffold a Blazor WebAssembly "gallery" app that renders `@dhcw/sr-blazor` components (starting with `SrButton`) in their full variant matrix. Deploy as a second GitHub Pages site via a `dotnet publish` workflow. **Priority: this week.** The existing Blazor product team needs a live-preview URL to evaluate adopting the design system. Pattern: static WASM output → `actions/upload-pages-artifact` → deploy. |

---

## Key Semantic Decisions (summary — full detail in DDRs)

| Decision | Rule |
|---|---|
| `Interactive/Destructive` vs `Status/Critical` | Same colour (Red/600), different roles. `Interactive/Destructive` = UI action risk (delete button, error border on forms). `Status/Critical` = clinical severity label (badge, tag). Never swap them. |
| Show/hide on components | Boolean property for optional decoration. Variant for structural layout changes. Hidden = `visible=false`, never deleted. |
| Dark mode Interactive/Primary | `Info Blue/600` (#0D62A3) — replaces the earlier Cyan/850. Hover step `Info Blue/800`. 5.1:1 with white text (AA). Do not revert. |
| Heading scale | Governed by **DDR-005** (supersedes DDR-004). Desktop XS=16/24, S=20/28, M=24/32, L=28/36, XL=36/44. Mobile XS=16/24, S=18/24, M=20/28, L=24/32, XL=28/36. All line-heights on the 4px grid; letter-spacing aligned to Figma (wide=0.3, caption=0.2). |
| Focus rings | **`Cyan/700` (DDR-006)** in both modes. OUTSIDE stroke, applied to the interactive element itself — not a wrapper frame that includes a label. The `focus-yellow` primitive is deprecated. |

---

## Figma File Reference

| Thing | Node ID | Notes |
|---|---|---|
| **File key** | `x5fwyefxxgD03csz8ld7SZ` | SINGLE-RECORD-DESIGN-SYSTEM. Required by every Figma MCP tool. NHS Wales enterprise, Full seat. |
| Icons page | 103:760 | All icon components live in "Icon Components (Lucide)" frame |
| Icon/action/edit | 189:25 | Lucide pen |
| Icon/action/edit2 | 1541:20 | Lucide square-pen (added 2026-06-04) |
| Icon/status/error-circle | 1444:20 | Circle + exclamation |
| Checkbox component | 843:14568 | 11 variants |
| Nav Item component set | 368:3682 | Use this. The old flat component 368:3681 is deprecated. |
| Sidebar Navigation | 725:8903 | 140 Nav Item instances, all pointing to 368:3682 |
| Stroke/icon colour variable | VariableID:203:100 | Text/Default — used for all icon strokes |
| Border/Focus variable | VariableID:203:105 | Cyan/700 focus ring (DDR-006) |
| Link component set | 1633:320 | On the Buttons page (1318:14904), below the Button frame |
| Interactive/Destructive | VariableID:203:94 | Red/600 — error borders, destructive actions |
| Border/Disabled | VariableID:1351:22 | |
| Text/Disabled | VariableID:1351:21 | |
| Grey/800 | VariableID:3455:20 | #2C3A44 — added 2026-07-09 |
| Grey/700 | VariableID:3455:21 | #3B4E5B |
| Grey/500 | VariableID:3455:22 | #768692 — placeholder/muted |
| Grey/400 | VariableID:3455:23 | #AEB7BD |
| Grey/300 | VariableID:3455:24 | #C6CDD1 |
| Grey/50 | VariableID:3455:25 | #F7FAFA |
| Nav Type=Sectioned, State=Expanded | 665:20955 | 220px |
| Nav Type=Sectioned, State=Collapsed (rail) | 746:13066 | 108px, icon + visible label |
| Nav Type=Sectioned, State=Collapsed 2 (icon-only) | 3569:15850 | 48px |
| Nav Type=Linear, State=Expanded | 1317:24167 | 220px, flat list |
| Nav Type=Linear, State=Collapsed (rail) | 1942:7143 | 108px |
| Nav Type=Linear, State=Collapsed 2 (icon-only) | 2212:7613 | 48px |
| Case Note Tracking home-screen dashboard | 2:3875 (file `U0Ugs6bG1KLzrrWdnxqcZO`) | "Page Template" instance; DASHBOARD COMPONENT frame is `0:4` |

---

## How to Update This File

At the end of a session, update:
1. **Current Design System State** — mark anything newly completed
2. **Open Work Items** — move done items out, add new ones
3. **Key Semantic Decisions** — add any new decisions made
4. **Figma File Reference** — add new node IDs for components created

Keep entries brief. This is a handoff doc, not a changelog — the backlog and DDRs hold the full history.
