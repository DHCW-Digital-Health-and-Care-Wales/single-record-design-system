# DDR-020: Package Distribution — Registries, Versioning and Release

**Date:** 2026-08-04 (amended 2026-08-05)
**Author:** Design lead
**Status:** Proposed — needs engineering lead and DHCW governance sign-off before the first publish

**Amendment, 2026-08-05.** Two corrections from the design lead, both material:
React is an approved, first-class target for Single Record (Case Note Tracking
will be built in it, and likely new products too) — an earlier draft treated it
as secondary to Blazor, which was wrong. And the `@dhcw` npm scope is **not
ours to take**: DHCW is building its own design system, and Single Record is a
programme *within* DHCW. See "Naming and scope ownership" below.
**Supersedes:** N/A (extends DDR-007 monorepo structure and DDR-014 design-to-publish workflow)

---

## Context

A developer on a Single Record product asked for "the CSS/JS files needed for
the web assets". They were right to: there was no way to get them.

- The packages exist (`@dhcw/sr-tokens`, `@dhcw/sr-icons`, `@dhcw/sr-web`,
  `@dhcw/sr-react`, plus the Blazor Razor Class Library) and carry `name`,
  `version`, `license` and `publishConfig` fields.
- **None of them has ever been published.** `npm install @dhcw/sr-web` does not
  resolve. Nothing in the repo publishes anything.
- Until this change, `@dhcw/sr-web` also had no built output at all: 21 separate
  component stylesheets and a `main` pointing at a file that did not exist.

The immediate gap is now closed — `npm run build:web` produces
`packages/web/dist/`, and the design-system website serves those files from a
**Get the files** page. That is a download, not a dependency: nothing tells a
consumer their copy is stale, and nothing lets a build pin a version.

Constraints carried over from DDR-014:

- **One author.** A release process that needs a second person to run it will
  not run.
- **Lean consuming teams.** Single Record engineers maintain legacy systems and
  have no design-system capacity. Anything that adds per-developer setup will be
  skipped, and they will paste CSS instead.
- **The personal repo is the only place automation can act.** The DHCW org repo
  is a fast-forward mirror with exactly one writer.
- **Healthcare governance.** Least privilege for credentials; anything published
  publicly is published permanently in practice.

And one constraint specific to this decision, which is easy to miss:

> **There are two first-class web targets, not one.** React is approved and is
> what Case Note Tracking will be built in, with further products likely. Blazor
> is equally current, and MAUI renders those same Blazor components. So the
> distribution question has two halves that use different registries: npm for
> React (and the tokens, icons and CSS everything shares), **NuGet** for the
> Blazor Razor Class Library. A decision framed as "npm publishing" answers only
> half of it.

---

## Decision

### 1. Two registries, chosen by who consumes what

Package names below are shown in the **preferred** scope from §2. The names in
the repository today (`@dhcw/sr-*`) change with that decision, before any
publish.

| Package | Channel | Consumers |
|---|---|---|
| `…/single-record-tokens` | npm, public | Everything with a build; also the legacy .NET Framework 4.8 screens, which take the CSS custom properties |
| `…/single-record-icons` | npm, public | Web and React |
| `…/single-record-web` | npm, public | Any web application; the canonical CSS |
| `…/single-record-react` | npm, public | **React products — Case Note Tracking and new products** |
| `DHCW.SingleRecord.Components` (Blazor RCL) | **NuGet** | Blazor web **and** MAUI, which renders the same components |
| Website, Storybook, prototypes | **Never published** | — |

### 2. Naming and scope ownership — public npm, but the scope is not ours to take

The packages are currently named `@dhcw/sr-*`. That was written before it was
clear that **DHCW is building its own design system**, and Single Record is a
programme within DHCW rather than a peer of it. Two things follow, and both
matter more than they look:

- **An npm scope is one global name, owned by one account.** Scopes cannot
  nest: there is no `@dhcw/single-record/…`. Whoever registers `@dhcw` owns
  every package published under it.
- **`@dhcw` therefore belongs to DHCW**, not to this programme. Registering it
  from a Single Record account would take the organisation's name on a public
  registry on their behalf, and would have to be untangled later.

So the naming decision comes before the publishing decision, and it cannot be
made unilaterally.

**Preferred — `@dhcw` as a DHCW-owned npm Organization, Single Record as a team
inside it.** Packages become `@dhcw/single-record-tokens`,
`@dhcw/single-record-icons`, `@dhcw/single-record-web`,
`@dhcw/single-record-react`. DHCW's own design system publishes its names
alongside in the same scope. One DHCW namespace, the hierarchy readable from
the package name, and no competing "DHCW design system" scopes on npm. An npm
Organization is free for public packages and supports teams with per-package
publish rights, so DHCW keeps ownership while this programme keeps its own
release cadence.

`single-record-` rather than the current `sr-`: `sr` means nothing to someone
outside the programme reading a dependency list, and this is the last moment
renaming is free.

**Fallback — a scope Single Record owns outright**, if DHCW cannot act on this
soon enough to matter. `@nhswales-single-record` or `@single-record-ds`, taken
in the order they are available. Accept the cost explicitly: moving to `@dhcw/*`
later is a **breaking rename** for every consumer, softened only by `npm
deprecate` and a pointer package.

**Third option, and often the right one while the name is unresolved — do not
publish yet.** The download page and `npm install github:…` already work. A
wrong name published publicly is materially harder to undo than a delay, and
version pinning is the only thing the delay costs.

Do **not** register `@dhcw` from a personal or programme account as a
placeholder, even with the intention of transferring it. On a public registry,
for a healthcare organisation, that is a decision presented as a formality.

### 3. One version number across all packages

Every package moves together, even when only one changed. `@dhcw/sr-react@0.4.0`
always works with `@dhcw/sr-web@0.4.0`. Inter-package dependencies pin exactly
(`"@dhcw/sr-tokens": "0.4.0"`), never a range.

The system stays on **0.x** until the light-mode semantic colour assignments
settle and dark mode has been reconciled (see `DESIGN-SYSTEM.md`). Under
semver, 0.x says "this may break between minors", which is true today and
should be said rather than implied.

**1.0.0 means:** token semantics are stable, dark mode is reconciled, and every
shipped component has a spec. Not before.

### 4. Release is a tag, and the tag is the only trigger

1. Bump the version in every package and record it in `CHANGELOG.md`.
2. Merge to `main`.
3. Tag `v0.4.0` and push the tag.
4. CI verifies (`npm run check`, `npm run build:site`, the prototype build),
   then publishes every package with `npm publish --provenance`.

No publishing from a laptop. A hand-run `npm publish` is how an unbuilt or
uncommitted `dist/` reaches consumers.

### 5. `dist/` stays committed

Even after publishing. It is what makes the website's download page and
`npm install github:…` work, and it is the fallback for anyone who cannot reach
a registry from their network. The cost is diff noise on CSS changes, which is
worth paying.

### 6. What is inside a published package is decided by `files`, not by luck

Each package's `files` (or `.npmignore`) lists what ships. Stories, tests and
fixtures do not. A `prepublishOnly` script runs the build, so a package can
never be published with stale or missing output.

### 7. React ships as source, and that is stated

`@dhcw/sr-react` publishes `.jsx`. Consumers need a bundler that compiles JSX —
true of every React setup in use here. It is **not** a drop-in `<script>` tag
for a page with no build step; that audience is served by `@dhcw/sr-web`'s CSS
plus plain markup. Revisit only if a consumer without a build step actually
needs React.

---

## Options Considered

### Option A: Public npm — **chosen** (scope per §2)

- **Pros:** No authentication for consumers, so nothing to set up on a
  developer machine or in a CI job — this is what a React product team hits on
  day one. Matches how GOV.UK Frontend and NHS.UK Frontend are distributed, so
  it is a pattern reviewers recognise. The repo is already MIT and the packages
  already declare `publishConfig.access: public`. Free. Works from anywhere,
  including a contractor's machine.
- **Cons:** Public and effectively permanent — an unpublish window is 72 hours
  and discouraged. A mistake is visible. Needs governance sign-off that the
  design system is publishable, which is a real question even though nothing in
  it is sensitive.

> **Option A does not settle the name.** Public npm is the right channel;
> *which scope* is a separate question that DHCW answers, not this programme.
> See "Naming and scope ownership" in the Decision.

### Option B: Azure Artifacts private feed

- **Pros:** Stays inside DHCW infrastructure. No governance question. DHCW
  already uses Azure DevOps (the component-request intake runs there).
- **Cons:** **Every consumer needs credentials.** An `.npmrc` with a personal
  access token on every developer machine, rotated on expiry, plus a service
  connection for every CI pipeline. For teams with no design-system capacity
  this is the difference between adopting the system and pasting CSS. It also
  makes the design-system website's public download page inconsistent with the
  supported install path.

### Option C: GitHub Packages

- **Pros:** Lives beside the repo; no new service.
- **Cons:** Authentication is required **even for public packages** on the npm
  registry endpoint — the worst of both: token setup with none of the privacy
  benefit. Consumers would also be authenticating against a personal GitHub
  account's package registry, not a DHCW one.

### Option D: No registry — download and `npm install github:…` (status quo)

- **Pros:** Works today. Zero setup and zero credentials.
- **Cons:** No version pinning that means anything, no update signal, no
  dependency resolution between the packages, no changelog a consumer sees. Fine
  for a first look; not a foundation for products that must reproduce a build.

---

## Rationale

**Public npm, because friction is the thing most likely to kill adoption.**
Every option except A puts a credential between a developer and their first
`npm install`. With two consuming teams that have no spare capacity, that
credential is where adoption stops — and the fallback they reach for is copying
CSS into their own repo, which is exactly the outcome the design system exists
to prevent.

The privacy that Option B buys is worth little here. The design system contains
colours, spacing, markup and accessibility guidance. It contains no patient
data, no credentials, no internal hostnames and no clinical logic. The public
sector precedent is strong and deliberate: GDS and NHS England both publish
their frontends publicly, for the same reason — a design system that is hard to
get is not used.

**NuGet is not an afterthought.** React and Blazor are both current, approved
targets — React for Case Note Tracking and likely new products, Blazor for the
existing ones and for MAUI, which renders the same Blazor components. Publishing
only to npm would leave the Blazor half of the estate exactly where it started.
Naming it here keeps it from being discovered late, and keeps the two halves on
the same version number.

**Lockstep versions, because the alternative costs more than it saves.**
Independent versioning is more precise and needs tooling and judgement per
release. One number across four packages is a rule anyone can follow and a
consumer can reason about at a glance.

**Tag-triggered CI, because the one-author constraint cuts both ways.** It
means nobody is waiting on a second person; it also means there is no second
person to catch a bad publish. The check has to be automatic.

---

## Consequences

**Accepted trade-offs**

- The design system becomes public property. Anything published is effectively
  permanent, so a mistake is corrected by publishing a fix, never by deleting.
- Diff noise from a committed `dist/` on every CSS change.
- Consumers on 0.x must expect breaking changes at minor versions. Said plainly
  in the README rather than discovered.

**Prerequisites — none of these are code**

1. **Agree the scope with DHCW.** Ask the DHCW design-system owner to register
   `@dhcw` as an npm Organization at organisation level and add Single Record
   as a team with publish rights to `single-record-*` names. This is the
   blocking prerequisite — it decides the package names, and renaming after
   publishing breaks every consumer.
2. **Governance sign-off** that the design system may be published publicly.
   This DDR stays *Proposed* until both 1 and 2 are answered.
3. **An automation token** stored as a repository secret, scoped to publish
   only, mirroring the deploy-key model in `docs/repo-mirroring.md`.
4. **A NuGet decision** for the Blazor RCL: nuget.org or a DHCW Azure Artifacts
   NuGet feed. It can differ from the npm answer — .NET teams already have
   Azure DevOps credentials, so the friction argument that decides the npm
   question does not apply in the same way.

**Then, in order**

5. **Rename the packages** to the agreed scope, in one commit, before any
   publish: `package.json` `name` fields, the inter-package `dependencies`, the
   workspace imports (`@dhcw/sr-web` appears in every React component's CSS
   import), the prototype, and every code snippet on the website. Free now;
   breaking later.
6. Add `CHANGELOG.md` and a release workflow.
7. Add `prepublishOnly` build scripts.
8. Publish `0.x` and update the website's **Get the files** page to lead with
   `npm install` and keep the direct download as the no-build route.

**Until all of that is done**, the supported routes are the download page and
`npm install github:Chuk-DCHW/dhcw-single-record-design-system#main`. They stay
supported after publishing too — publishing adds a route, it does not remove
one.

---

## Runbook — once the scope is agreed and publishing is signed off

Written out because it will be run by one person, once, and steps 1–3 are the
ones that are expensive to get wrong.

1. **Confirm the scope exists and this account can publish to it.**
   `npm org ls <scope>` should list you. If it does not, stop — do not create
   the scope to get unblocked.
2. **Rename, in one commit, with nothing published yet.** `name` in each
   `package.json`, the inter-package `dependencies`, every `@dhcw/sr-web` and
   `@dhcw/sr-icons` import inside `packages/react`, the prototype's imports, and
   the code snippets on the website. `npm run check && npm run build:site` and
   the prototype build all pass before it is committed.
3. **Dry run first.** `npm publish --dry-run` in each package and read the file
   list it prints. This is the moment to notice a package shipping stories, or
   missing its `dist/`.
4. Add `CHANGELOG.md`, `prepublishOnly` build scripts, and the tag-triggered
   release workflow.
5. Tag `v0.x.0` and push the tag. CI publishes.
6. **Verify as a consumer, not as the author:** in an empty folder,
   `npm install <scope>/single-record-web`, link the CSS in a plain HTML page,
   serve it over HTTP, and check it renders. The same test caught two real bugs
   when the download bundle was built.
7. Update the website's **Get the files** page to lead with `npm install`,
   keeping the direct download as the no-build route.

If step 1 fails, everything after it waits. The download page and
`npm install github:…` remain supported throughout — publishing adds a route,
it does not remove one.

---

## References

- DDR-007 — packages monorepo structure
- DDR-011 — desktop/mobile form-factor model (why MAUI consumes the Blazor RCL)
- DDR-014 — design-to-publish workflow, mirror model, single-writer constraint
- `docs/repo-mirroring.md` — deploy-key and least-privilege precedent
- `docs/for-engineers.md` — "What runs where"
- GOV.UK Frontend and NHS.UK Frontend, both published publicly on npm
- npm scopes and `publishConfig.access`; npm unpublish policy (72-hour window)
