# DDR-024 — MAUI ships on GitHub Packages; npm stays on release tarballs

**Date:** 2026-08-13
**Status:** Accepted
**Decided by:** Design lead, engineering lead
**Resolves:** DDR-020 §"how MAUI is distributed" — the part left open
**Related:** DDR-021 (MAUI is native XAML), DDR-023 (icon stroke), DDR-020 (package distribution)

---

## Context

DDR-020 settled how the four npm packages reach product teams — tarballs
attached to a GitHub Release, installable with plain npm and no credentials —
and left MAUI open, because at the time `packages/maui` shipped no code.

It does now. `DHCW.SingleRecord.Maui` exists, compiles and packs, and there is
nowhere to put it. Today a MAUI team has to clone this repository, run
`npm run pack:maui`, and add a folder as a local NuGet source. That is a
workable stopgap for one engineer and unworkable as a way to run a mobile estate:
nothing is versioned, nothing is auditable, and every upgrade is a manual copy.

The obvious question was whether the npm packages should move to a registry at
the same time, since the tarball approach makes every consumer hand-edit four
URLs at every release. Investigating that turned up two constraints that split
the answer in half.

### GitHub Packages requires authentication for every install

> "You need an access token to publish, install, and delete private, internal,
> and public packages."
> — [GitHub Packages docs](https://docs.github.com/en/packages/learn-github-packages/about-permissions-for-github-packages)

There is no anonymous read, even for a public package in a public repository.

### GitHub Packages npm requires the scope to equal the owning account

Packages must be `@NAMESPACE/PACKAGE-NAME`, where the namespace is the GitHub
account that owns them. Ours are `@dhcw/*`; the owning organisation is
`DHCW-Digital-Health-and-Care-Wales`. There is no `@dhcw` account, so the only
routes are renaming every package to
`@dhcw-digital-health-and-care-wales/sr-web` — which changes every import in
every product for no benefit — or creating a second GitHub organisation named
`dhcw` and splitting the estate across two.

## Decision

**Publish `DHCW.SingleRecord.Maui` to the GitHub Packages NuGet feed. Leave the
npm packages on release tarballs.**

The two constraints above land differently on the two ecosystems, so the same
answer for both would be wrong.

### Why GitHub Packages is right for NuGet

- **Neither blocker applies the same way.** NuGet package IDs carry no
  namespace requirement, so `DHCW.SingleRecord.Maui` publishes unchanged.
- **The authentication requirement is a feature here, not a cost.** This package
  contains the NHS Wales and DHCW brand marks, which are trademarked artwork
  explicitly *not* covered by its MIT licence, and which need brand-team
  approval before public publication. A feed that cannot be read anonymously is
  the correct place for it. Publishing the same content to nuget.org would put
  those marks on a public CDN.
- **Authenticated feeds are unremarkable in .NET.** `nuget.config` plus a PAT is
  standard, Visual Studio and Azure DevOps both handle it natively, and there is
  no existing credential-free promise for MAUI to break — there is no
  distribution at all today.

### Why npm stays on tarballs

- **The scope problem has no acceptable fix.** Both routes cost more than the
  problem.
- **Authentication would be a real regression.** The current install is
  deliberately credential-free, and that is a stated selling point on the
  website and in the changelog. Moving to GitHub Packages would put a PAT in
  every developer's `.npmrc` and every Azure DevOps pipeline across seven-plus
  workstreams — trading "edit four URLs per release" for something teams are
  measurably more likely to get stuck on, and which quietly stops them upgrading.
- **The web packages carry no trademarked artwork that needs gating.** The brand
  marks in `@dhcw/sr-web` are the same marks, which is a real wrinkle, but that
  package is already distributed by public release asset, so this decision
  changes nothing about their exposure either way. Flagged below.

If the URL editing becomes the dominant complaint, **nuget.org's npm equivalent
is npmjs.org, not GitHub Packages** — public scoped packages, anonymous install,
`@dhcw` preserved if the scope is available. That is a separate decision and
should be taken on its own evidence.

## How it works

`.github/workflows/publish-nuget.yml`, on a `v*` tag or manual dispatch.

**It runs on macOS, deliberately.** The workloads decide the target frameworks:
ubuntu has `maui-android` only and cannot build iOS or macCatalyst at all, so a
Linux pack produces an Android-only package that succeeds, publishes, and then
fails at the first iOS consumer. Only macOS can produce a complete package. The
PR workflow still proves the Android TFM on every change — the cheap check —
and this is the expensive one.

Four gates, because a published package is hard to unpublish:

1. The design system layer is **regenerated, not trusted**, and the run fails if
   the committed output was stale.
2. The **tag must match** `packages/maui/package.json`. A tag that disagrees
   with the version is a lie about what was published.
3. The `.nupkg` is **opened and inspected**: the `buildTransitive` targets must
   be present (without them the package installs and silently does nothing), all
   eleven brand marks must be there, and there must be an assembly for each of
   `net10.0-android`, `-ios` and `-maccatalyst` — which is what catches a pack
   done on the wrong host.
4. `--skip-duplicate`, so a re-run cannot fail on an already-published version.

The version has **one source**: `packages/maui/package.json`, written into the
csproj by `build-nuget.mjs`. This is not tidiness. The npm release workflow
hardcoded `0.1.0` in the URLs it advertises, the packages moved to `0.1.1`, and
nothing noticed — a release would have published four install URLs that 404 while
the release page looked healthy. Both are now derived.

## Consequences

- **MAUI teams need a `nuget.config` and a PAT with `read:packages`.** That is
  the cost of the decision, and it is documented in the package README and on
  the website. It cannot be avoided on this feed.
- **Publishing happens wherever MAUI teams can authenticate.** GitHub Packages
  scopes a feed to the owning account. The workflow derives the feed URL, the
  `RepositoryUrl` and the token from `github.repository`, so it is correct in
  whichever repository it runs from — but *which* repository is a real choice,
  and it should be the one the mobile estate can reach.
- **The npm URL-editing friction stays.** Four URLs per release, per product.
  Accepted for now, with npmjs.org as the escape hatch if it becomes the
  dominant complaint.
- **`packages/maui` is now versioned with the other four** (`0.1.1`), so one
  version number describes the whole design system rather than MAUI drifting on
  its own count.

## Open

- **The brand marks are already on a public release asset** via `@dhcw/sr-web`,
  whose tarballs are attached to a public GitHub Release. Gating the NuGet feed
  is consistent with the brand rules; the npm distribution is not, and predates
  this decision. Whether that matters is a brand-team question, not an
  engineering one, and it should be asked rather than assumed either way.
- **Whether `@dhcw` is available on npmjs.org.** Unchecked. It determines
  whether the npm escape hatch is real.
