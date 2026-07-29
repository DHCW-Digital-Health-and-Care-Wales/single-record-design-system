# DDR-019 — Prototype embed: CodeSandbox Sandpack, not StackBlitz

**Date:** 2026-07-29
**Status:** Accepted
**Decided by:** Design lead

---

## Context

The DS website's Prototypes section embeds a live, running copy of each product
prototype (currently Case Note Tracking) alongside its source, so a viewer can see
the design intent working and read the React code that produces it in one place.

The first implementation used **StackBlitz**, pointed at this repository so its
workspace-resolved `@dhcw/sr-react` / `sr-web` / `sr-tokens` / `sr-icons` packages
would load exactly as they do locally. Two problems surfaced once this was actually
used:

1. **The embed requires a public repository.** StackBlitz's GitHub import clones the
   repo live; a private repo needs every viewer to be signed in to StackBlitz with
   GitHub access to it, and private-repo import is gated behind a paid StackBlitz
   tier. This repo's visibility is a separate governance decision (see the 2026-07-29
   handoff checkpoint) and should not be forced by an embed's technical requirements.
2. **The interface itself is the wrong shape for this audience.** StackBlitz ships
   its full IDE — terminal, extensions panel, settings — because that is its product.
   For a design-system website whose audience wants "see it run, see the code," that
   is unnecessary complexity. Figma Make's own preview/code switcher was raised as
   the actual reference point: two panes, one toggle, nothing else.

StackBlitz's underlying execution engine, **WebContainers**, is also proprietary —
free for light use, but requiring a commercial license for anything beyond that. That
is the direct cause of both problems above: the full VM-in-browser experience needs
a real filesystem clone (hence the public-repo requirement) and comes with the tooling
that makes a VM usable (hence the IDE chrome).

---

## Decision

Replace the StackBlitz embed with **Sandpack** (`@codesandbox/sandpack-react`), CodeSandbox's
open-source (MIT-licensed) embeddable bundler-and-preview component.

### Why this solves both problems

- **No repository dependency at all.** Sandpack does not clone a GitHub repo — it
  takes a set of files directly as data. The DS website's build step
  (`packages/website/build.mjs`) already reads this repo's real source at build
  time; it will now also assemble the prototype's file set from that same read and
  hand it to Sandpack, instead of building a GitHub URL. Repo visibility becomes
  irrelevant to the embed. DL-028 (the backlog item raised when StackBlitz needed a
  public repo) is retired by this change, not worked around.
- **A plain preview/code view**, styled as part of our own page — no unrelated IDE
  panels, no settings we don't want exposed. This matches the Figma Make reference
  directly.

### What "hand it files directly" means for our unpublished packages

`@dhcw/sr-react` etc. are not (yet) on npm — Sandpack's default dependency resolution
fetches from a public npm CDN (unpkg), which cannot see them. Rather than wait on
publishing (tracked separately, see the 2026-07-29 handoff checkpoint), the website
build **inlines the actual built component source and CSS as local files inside the
Sandpack file set**, generated fresh at every site build from the same
`packages/web`, `packages/react`, `packages/tokens/build`, and `packages/icons`
output already used elsewhere on the site. This is not a manual vendored copy — it
is generated code, produced by the same build that already reads this source for
every other page, so it cannot drift out of sync the way a hand-copied file would.
Once the packages are actually published, this inlining step can be simplified to a
plain npm dependency in the Sandpack file set — a small follow-up, not a rebuild.

### Bundling: hosted, not self-hosted, for now

Sandpack needs an in-browser compile step. Its default is a **free hosted compiling
service run by CodeSandbox** — no login, no API key, no cost — versus self-hosting
that same service (`@codesandbox/sandpack-bundler`) to avoid any external call at
all. **Decided: use the default hosted service.** The prototype only ever contains
mock, non-clinical data (see each prototype's own README), so a public compiling
service carries no patient-data risk. Self-hosting remains available later with no
change to how any prototype's code is written, if that call changes.

---

## Consequences

- `packages/website` has no Node-side build tooling today — every page is a plain
  string-templated HTML write, with no bundler and no npm runtime dependency
  (`package.json` says so explicitly). Adding a webpack/Vite pipeline just to embed
  one React micro-widget would be a disproportionate change. Instead, the prototype
  page loads `@codesandbox/sandpack-react` (MIT) and its React peer dependencies via
  **ESM CDN import** (`esm.sh`) in a `<script type="module">`, in the browser only.
  `packages/website`'s own Node build stays dependency-free; only the one page that
  needs it pays the browser-side cost.
- `packages/website/build.mjs`'s `stackblitzUrl()` / `REPO_SLUG` /
  `REPO_BRANCH` constants and the `<iframe>` embed are replaced by a Sandpack file
  set assembled from real source at build time, serialised into that
  `<script type="module">` mount point.
- The embed's visual chrome (breadcrumb, "all prototypes" link, page title) that
  today sits in a bar above the StackBlitz iframe is unaffected — Sandpack renders
  inside the same `.embed` container, styled with our own CSS instead of an iframe
  boundary.
- Publishing the four DS packages to npm (tracked separately) becomes purely
  additive to this: it simplifies the generated file set, it is not a prerequisite
  for this DDR.

---

## Alternatives considered

**Keep StackBlitz, make the org repo public to satisfy it.** Rejected as the sole
fix: it solves problem 1 but not problem 2 (the IDE-chrome mismatch), and it makes
an embed implementation detail the deciding factor in a repository-visibility
decision that should be made on its own merits.

**CodeSandbox's own hosted embed (`codesandbox.io/embed/...`) instead of the
Sandpack library.** Rejected: that product still clones a project from CodeSandbox's
own hosting (or GitHub), reintroducing a "where does this live" dependency; Sandpack
as a library embedded in our own page avoids that by taking files directly.

**Self-host the Sandpack bundler from day one.** Not rejected outright — recorded
as the natural next step if the hosted-service data-egress question is ever revisited
— but adds infrastructure to build and maintain for a risk (mock data only) judged
low today.
