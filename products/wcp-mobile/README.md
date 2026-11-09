# WCP mobile

The Welsh Clinical Portal app for phones (Porth Clinigol Cymru), built in native
.NET MAUI XAML (DDR-021). Designs are on the Figma **Adaptations Mobile** page
(`5443:23237`), section `5443:23238`.

## What it uses from the core

| Core | How |
|---|---|
| Tokens, type scale, control styles | `DHCW.SingleRecord.Maui` (`SrColors`, `SrStyles`) |
| Icons | `SrIcons` geometry |
| Brand marks | The library's `srsymwcp*` images |
| Content rules | `docs/content/data-standards.md`, checked by `check-content.mjs --prototype` |

## Product-specific

Nothing overrides the core. The sign-in screens use a fixed navy gradient that
the core has no token for; it is built from two existing tokens
(`Interactive/Primary` to `Navy/900`) in the prototype's `App.xaml`.

Not yet in the core, and composed locally in the prototype until they have a
spec: the PIN pad, the quick-action circle, the "Needs your attention" row, and
the side menu.

## Contents

| Folder | What |
|---|---|
| `prototype/` | Tap-through of the onboarding and home flow. UI only. See its README. |
