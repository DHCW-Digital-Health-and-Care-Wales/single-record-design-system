# Case Note Tracking — prototype

A working React prototype of the Case Note Tracking screens, built entirely from
the Single Record Design System.

**Figma:** `U0Ugs6bG1KLzrrWdnxqcZO` (Case Notes Tracking), page `0:1` "HiFi Designs".
The patient casenote view is node `2:4386`.

---

## What this is

A **reference implementation**, authored by design, so the engineering team can
see the design intent running *and* read the React code that produces it. Every
component comes from `@dhcw/sr-react`. Nothing here restyles a design-system
component — if something looks wrong, the design system is wrong, and finding
that out is the point.

You can lift from it: the folder structure, how components are composed, how
tokens are consumed, the state patterns, the accessibility markup.

## What this is **not**

Do not ship this. It has:

- **Mock data only** — everything is in `src/data.js`, in memory
- **No API integration**, no data fetching, no persistence
- **No authentication** and no authorisation
- **No error or loading handling**
- **No tests**
- **No performance or security review**

It is a starting skeleton for the **UI layer**, not a foundation for a
deployable application.

---

## Running it

### In the browser

The design-system website publishes this under **Prototypes → Case Note
Tracking**, embedded via Sandpack (DDR-019): a preview/code toggle running
directly in the page, with no unrelated IDE chrome. Unlike the earlier
StackBlitz version, this embed does not clone a repository at all — the
website's build step reads this prototype's actual source, plus the exact
`@dhcw/sr-react` / `sr-web` / `sr-tokens` / `sr-icons` files it depends on,
and hands them to Sandpack as data. Nothing about the embed depends on this
repository's visibility.

Because it is generated from source at every site build, the embed always
reflects what is actually in this file, never a stale copy.

### Locally

From the **repository root** (not this directory):

```bash
npm install
npm run dev:prototype
```

It must be installed from the root because the design-system packages
(`@dhcw/sr-react`, `@dhcw/sr-web`, `@dhcw/sr-tokens`, `@dhcw/sr-icons`) are
**unpublished npm workspace members**. They are resolved by symlink from the
repo root; they are not on the npm registry and `npm install` inside this folder
alone will fail with a 404.

That is deliberate. It means the prototype always tracks the current design
system — change a token, rebuild, and this app picks it up with no sync step.
A vendored copy would rot.

## What it demonstrates

| Flow | Status |
|---|---|
| Patient banner, expand/collapse | Working |
| Site / type / search filtering | Working |
| Show-inactive toggle | Working |
| Table sorting | Working |
| Row selection with indeterminate select-all | Working |
| Send-batch confirmation modal | Working |
| Remaining screens (search, SendIT, My Requests, side panels) | Not yet built |

## Structure

```
src/
  main.jsx    entry — imports the token CSS, then the app
  App.jsx     the casenote view; all state lives here
  data.js     mock data (patient, reactions, notes, filter options)
  app.css     prototype-only layout — no component styling
```

There is deliberately no component folder: everything visual comes from the
design system, so the only local code is layout, state and data.
