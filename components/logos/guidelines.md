# Logos

> The brand marks staff recognise before they read anything: whose system this
> is, and which service inside it they are in.

| | |
|---|---|
| **Type** | Foundation |
| **Status** | In review |
| **Reference** | `figma/assets/` · `packages/web/src/assets/logo.js` · `docs/engineering/logo-tokens-recommendations.md` |
| **Figma** | Logos component set (`270:2850`) |
| **Last updated** | 2026-08 |

---

## What exists

Five subgroups, each drawn as an icon-only mark and a full lockup, each in a
light and a dark colour mode — 20 variants in all.

| Subgroup | What it is |
|---|---|
| `nhs_wales` | GIG Cymru / NHS Wales — the parent identity |
| `dhcw` | Digital Health and Care Wales — the organisation that builds these systems |
| `wcp` | Welsh Clinical Portal |
| `wncr` | Welsh Nursing Care Record |
| `UEC` | Urgent and Emergency Care |

"Colour mode" names the background, not the artwork: **light** is the navy mark
for light backgrounds, **dark** is the white mark for dark or coloured ones.

## When to use

- **Full lockup** for the primary brand position on a screen — the sidebar
  header, a header with no sidebar beside it, a sign-in screen, a printed
  document.
- **Icon-only** where the lockup will not fit and the identity is already
  established: mobile headers, collapsed navigation, breadcrumbs, favicons.
- **A product subgroup** (`wcp`, `wncr`, `UEC`) only inside that product. The
  parent identity still belongs somewhere on the screen.

## When not to use

- Not as decoration, a bullet, a watermark, or a loading spinner. These are
  identity marks, not illustration.
- Not to indicate status or state. A logo means "this is whose system this is"
  and nothing else.
- Not twice on one screen. If the sidebar carries the lockup, the header does
  not repeat it — this is why the header's `desktop-2` variant has no logo.

## How it works

Size comes from tokens, never from a hand-typed pixel value:

| Token | Default | Use |
|---|---|---|
| `logo.icon.size` | 32px | Icon mark. `compact` 24px, `prominent` 48px |
| `logo.full.height` | 48px | Full lockup. `compact` 32px, `prominent` 64px |

- **Height is the controlled dimension; width follows.** The lockups have
  different aspect ratios per subgroup, so constraining width instead will
  produce marks of visibly different weight side by side.
- **Pick the colour mode from the background, not the theme.** A navy header in
  light mode still needs the dark-mode (white) mark. Do not bind logo colour to
  `[data-theme]` and assume it follows.
- **Logo colour does not inherit.** Brand colours are fixed values, not
  `currentColor` — a mark that changes with its parent's text colour is a brand
  defect. Ship one asset per colour mode instead.

## Do and don't

- **Do** keep clear space around the mark of at least the height of the icon.
  Crowding it reads as a broken layout.
- **Do** use the mono (black) lockup for single-colour output — print, fax,
  photocopied forms.
- **Don't stretch, rotate, recolour, or crop.** Scale uniformly only. This is
  the rule recorded on the Figma component itself, and it is the one most often
  broken by well-meaning resizing.
- **Don't derive the icon mark by cropping the knot out of a full lockup.** The
  icon is a separately drawn asset with its own spacing; a crop is not it.
- **Don't** place a mark on a background that drops it below 3:1 against its
  surroundings, or on a busy photograph.
- **Don't** recreate a mark in code as paths, CSS, or type. Use the exported
  asset.

## Accessibility

- **A logo that is the only thing naming the service needs a text alternative**
  giving the organisation, not the file: `alt="GIG Cymru NHS Wales, Digital
  Health and Care Wales"`.
- **A logo beside a visible wordmark or service name is decorative** — mark it
  `aria-hidden="true"` so the name is not announced twice.
- **A logo that is a link home** takes its accessible name from the
  destination, not the artwork: "Digital Health and Care Wales home".
- Do not rely on the mark alone to distinguish two products. `wcp` and `wncr`
  are not distinguishable at 24px to a user who does not already know them —
  the service name has to be present as text.
- The marks are raster or outlined-path assets and carry no live text, so they
  do not reflow with text-resize. Keep the accessible name in the markup, where
  it does.

## Known gaps

Five assets are in the repo (`figma/assets/`) — the `dhcw` full lockup in navy,
white and mono, and the `dhcw` icon-only mark in navy and white. The remaining
15 variants have not been exported. Until they are:

- No product subgroup (`nhs_wales`, `wcp`, `wncr`, `UEC`) has any asset at all,
  so no co-brand or product mark can be rendered in code.

**Audited 2026-08-13:** twelve of the fifteen can be lifted from Figma's vector
geometry today (all of `nhs_wales`, all of `wcp`, `wncr/Icon/light`, and
`UEC/Icon`). Only four genuinely need a Figma fix first — see below and
`figma/assets/README.md`.

The four that must be fixed in Figma before export, not after: `UEC/Full` in
both colour modes contains live text that must be outlined, or the exported SVG
carries a font dependency and renders differently wherever Roboto is absent;
`wncr/Full` in both modes and `wncr/Icon/dark` use strokes, which are not
carried on the vector geometry and would export as hairlines or vanish.

Two items from the earlier version of this list did not survive the audit and
are recorded here so they are not chased again: `wcp/Full` does **not** contain
live text (that was `UEC/Full`), and the `wcp` and `wncr` lockups no longer
differ in width between colour modes — both are 208×48 and 246×48 respectively.
`nhs_wales/Icon/light` was reported as having a broken fill; the audit checked
for raster fills, strokes and text rather than for a wrong colour, so that one
is **unverified** and still needs a designer's eye. NHS Wales marks also need
brand-team approval before any public
publication.
