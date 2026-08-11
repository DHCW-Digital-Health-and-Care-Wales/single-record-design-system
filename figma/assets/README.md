# figma/assets

Official brand rasters for the DHCW Single Record programme, exported from the
Figma **Logos** component set (`270:2850`).

## Contents

| File | Figma variant | Usage |
|---|---|---|
| `dhcw-logo-blue.png` | `Type=Full, Subgroup=dhcw, Colour mode=light` | Navy lockup — light backgrounds. Source for `logoFullSrc`. |
| `dhcw-logo-white.png` | `Type=Full, Subgroup=dhcw, Colour mode=dark` | White lockup — dark/coloured backgrounds. Used by the DS website masthead. |
| `dhcw-logo-black.png` | — | Mono lockup — print, faxes, single-colour output. |

All three are 1132×403, transparent background.

## Brand rules

Figma states, on `270:2850`: **do not stretch, rotate, recolour, or crop.**
Scale uniformly only. In particular the icon-only mark must **not** be produced
by cropping the knot out of a full lockup — it is a separate exported asset.

## Not yet exported

The Figma set holds 20 variants (5 subgroups × Icon/Full × light/dark). Only the
three `dhcw` full lockups above are in the repo. Still missing:

| Subgroup | Missing |
|---|---|
| `dhcw` | Icon (light `275:165`, dark `270:2849`) |
| `nhs_wales` | Icon (`270:2851`, `275:167`), Full (`279:199`, `279:201`) |
| `wcp` | Icon (`283:166`, `284:763`), Full (`285:788`, `285:790`) |
| `wncr` | Icon (`285:969`, `285:1119`), Full (`285:1220`, `285:1137`) |
| `UEC` | Icon (`1408:16295`, `1408:16298`), Full (`1408:15337`, `1408:16292`) |

These cannot be exported from the Claude Code environment: outbound access to
`www.figma.com` is denied by the environment network policy, so the MCP asset
URLs return HTTP 403 at download. Either enable `figma.com` egress on the
environment, or export them by hand from Figma and commit them here.

Consequence today: `logoSymbolSrc` in `packages/web/src/assets/logo.js` is still
a neutral placeholder, so mobile headers and collapsed navigation render a
generic mark rather than the DHCW icon.

## Notes

- Do not add product screenshots, mockups, or large binaries here — this folder
  is for shared brand assets only.
- `packages/web/src/assets/logo.js` is generated from this folder by
  `npm run build:logo`. Re-run it after replacing a raster.
- Reference from guide HTML pages using a relative path: `../assets/<filename>`
