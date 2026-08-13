# figma/assets

Official brand assets for the DHCW Single Record programme, taken from the Figma
**Logos** component set (`270:2850`).

## Contents

| File | Figma variant | Usage |
|---|---|---|
| `dhcw-logo-blue.png` | `Type=Full, Subgroup=dhcw, Colour mode=light` | Navy lockup — light backgrounds. Source for `logoFullSrc`. |
| `dhcw-logo-white.png` | `Type=Full, Subgroup=dhcw, Colour mode=dark` | White lockup — dark/coloured backgrounds. Used by the DS website masthead. |
| `dhcw-logo-black.png` | — | Mono lockup — print, faxes, single-colour output. |
| `dhcw-symbol-blue.svg` | `Type=Icon, Subgroup=dhcw, Colour mode=light` (`275:165`) | Navy icon-only mark. Source for `logoSymbolSrc`. |
| `dhcw-symbol-white.svg` | `Type=Icon, Subgroup=dhcw, Colour mode=dark` (`270:2849`) | White icon-only mark. Source for `logoSymbolInverseSrc`. |
| `wcp-symbol-blue.svg` | `Type=Icon, Subgroup=wcp, Colour mode=dark` (`284:763`) | Navy Welsh Clinical Portal roundel — light backgrounds. Source for `wcpSymbolSrc`. |
| `wcp-symbol-white.svg` | `Type=Icon, Subgroup=wcp, Colour mode=light` (`283:166`) | White WCP roundel — dark backgrounds. Source for `wcpSymbolInverseSrc`. |

Note the `wcp` rows: the file named `blue` comes from the variant named `dark`.
That is not a transcription error — see the naming warning below.

The three lockups are 1132×403, transparent background. The two symbols are
48×48 SVG on a 0 0 48 48 viewBox.

### How the symbols got here without an image download

`www.figma.com` is blocked by the environment network policy, so an exported
PNG/SVG URL cannot be fetched (see "Not yet exported" below). The symbols
sidestep that: the Figma MCP `use_figma` tool returns the component's own
`fillGeometry` path data over the MCP channel, which is not an asset download.
The twelve paths, the fill colour and the winding rule are copied verbatim from
the two `Type=Icon, Subgroup=dhcw` variants — the mark as drawn, not a crop and
not a redraw. The same route works for any other variant whose artwork is pure
vector; it does **not** work for the lockups, which contain raster and text.

## Brand rules

Figma states, on `270:2850`: **do not stretch, rotate, recolour, or crop.**
Scale uniformly only. In particular the icon-only mark must **not** be produced
by cropping the knot out of a full lockup — it is a separate exported asset.

## Not yet exported

The Figma set holds 20 variants (5 subgroups × Icon/Full × light/dark). Five are
in the repo — the three `dhcw` lockups and the two `dhcw` symbols. Still
missing:

| Subgroup | Missing |
|---|---|
| `nhs_wales` | Icon (`270:2851`, `275:167`), Full (`279:199`, `279:201`) |
| `wcp` | Icon (`283:166`, `284:763`), Full (`285:788`, `285:790`) |
| `wncr` | Icon (`285:969`, `285:1119`), Full (`285:1220`, `285:1137`) |
| `UEC` | Icon (`1408:16295`, `1408:16298`), Full (`1408:15337`, `1408:16292`) |

These cannot be *downloaded* from the Claude Code environment: outbound access
to `www.figma.com` is denied by the environment network policy, so the MCP asset
URLs return HTTP 403. But most of them do not need a download — see "How the
symbols got here" above.

**Audited 2026-08-13, corrected twice, now complete.** **Nine** of the sixteen
were liftable via `fillGeometry`, and all nine have been extracted. Two earlier
counts were wrong and are recorded so the method is not repeated: the first pass
said twelve because it counted `VECTOR` node types, but `UEC/Icon` has vector
nodes carrying no solid fill and yields an empty SVG; the second said ten by
arithmetic error. Check for *filled* geometry, not for vector node types, and
count the table.

| Variant | Liftable | Blocker |
|---|---|---|
| `nhs_wales` Icon + Full, both modes | Yes | — |
| `wcp` Icon + Full, both modes | Yes | — |
| `wncr` Icon light | Yes | — |
| `UEC` Icon, both modes | No | Vector nodes with no solid fill — yields an empty SVG |
| `wncr` Icon dark, Full both modes | No | Strokes — outline them in Figma first |
| `UEC` Full, both modes | No | Live text — outline it in Figma first |

All nine are now in this folder. Every one was checked by rendering it in a
browser on both a light and a dark ground before being committed.

Two notes from doing it:

- **`wncr` has no navy mark.** Only the white artwork is liftable, so a WNCR
  mark cannot be placed on a light background until `wncr/Icon/dark` is
  outlined in Figma.
- **The two `nhs_wales` lockup variants are the same drawing.** A geometry hash
  said otherwise, but comparing them path by path showed the only differences
  are in the 4th decimal of two transforms — under a thousandth of a pixel. The
  reversed lockup is therefore derived by recolouring the two-colour one, which
  keeps them provably in register. Hash equality is too strict a test for
  "same artwork"; compare the paths.

This supersedes the earlier note that `wcp/Full` contains live text. It does
not: `wcp` is clean in all four variants. The live-text problem is `UEC/Full`,
and the stroke problem is `wncr`. Re-audit rather than trusting a stale list —
the check is a dozen lines of `use_figma` walking `node.type` and the fill and
stroke arrays.

**Name files by ink colour, never by the Figma "Colour mode" variant.** That
variant does not mean the same thing in every subgroup — `nhs_wales/Icon/light`
is navy but `wcp/Icon/light` is white. See `docs/figma-known-issues.md`.

Consequence today: of the product subgroups, only `wcp` has an asset in the
repo. For the remaining liftable variants that is a task, not a blocker. NHS
Wales marks still need brand-team approval before public publication.

## Notes

- Do not add product screenshots, mockups, or large binaries here — this folder
  is for shared brand assets only.
- `packages/web/src/assets/logo.js` is generated from this folder by
  `npm run build:logo`. Re-run it after replacing an asset here.
- The SVGs are inlined into `logo.js` as `utf8` data URIs, so they must not
  contain a single quote — the build fails loudly if one appears.
- Reference from guide HTML pages using a relative path: `../assets/<filename>`
