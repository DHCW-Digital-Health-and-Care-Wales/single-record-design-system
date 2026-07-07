# DDR-014: Design-to-Publish Workflow — Export Routing, Ownership & CI/CD

**Date:** 2026-07-07
**Author:** Design lead
**Status:** Accepted
**Supersedes:** N/A (formalises and extends the mirror model in `docs/repo-mirroring.md` and the Storybook pipeline in DDR-009 / DDR-010)

---

## Context

The design system is authored by a **single designer (+ AI assistance)** working
in a **personal GitHub repo** (`Chuk-DCHW/dhcw-single-record-design-system`).
Assets originate in Figma and are pushed via the Figma MCP into that personal
repo, which **mirrors to the DHCW org repo**
(`DHCW-Digital-Health-and-Care-Wales/single-record-design-system`).

Constraints that shaped this decision:

- **One key person.** Anything that stalls the flow waiting on someone else is a
  material risk. The pipeline must run end-to-end on one person.
- **Lean dev team, no design-system capacity.** The Single Record engineers
  maintain legacy systems, do not use Storybook, and have little AI exposure.
  They cannot be put on the critical path of producing the system.
- **AI tooling is scoped to the personal repo only.** Claude cannot act on the
  org repo. All AI-assisted authoring must happen on the personal repo and reach
  org via the mirror.
- **The mirror is fast-forward only** (`docs/repo-mirroring.md`). If the org
  `main` ever gains a commit the personal repo lacks, the mirror fails. So org
  `main` can have **exactly one writer**.
- **Two output surfaces with different lifecycles:** a *working preview*
  (Storybook + a local Visual Studio gallery) that should reflect current work,
  and a *published* design-system website that should only ever show approved,
  released work.
- **Healthcare / DHCW governance.** Published property should be served inside
  org infrastructure; least-privilege for any automation credentials.

---

## Decision

### 1. Two export lanes out of Figma

| Export type | Lands on | How |
|---|---|---|
| **Non-code** — tokens, `DESIGN-SYSTEM.md`, docs, decisions, guidance | personal `main` | PR with an automated contrast + token-build check, **auto-merged when green** |
| **Code** — component scaffold, snippets, package code | personal `feature/{component}` | branch → refined to production quality → PR → merge to personal `main` |

Non-code always lands **first**, so component scaffold always builds against
tokens already on `main` ("tokens feed the build" as an ordering rule, not a
hope).

### 2. Read-only mirror, single writer

Personal `main` mirrors **read-only (fast-forward, deploy key)** to org `main`.
**Nobody writes to org `main` except the mirror.** This keeps the fast-forward
guarantee intact and means the mirror can never break through divergence.

### 3. Ownership

- **Design (designer + Claude) owns the entire DS repo** — `/foundations`,
  `/components`, `/patterns`, `/accessibility`, `/decisions`, `/docs`,
  `/figma`, `/packages`, **and `/products`** (sanctioned, design-authored
  product overrides). All of it is authored on the personal repo.
- **Devs own their own product/application repos.** They *consume* the published
  design system and adapt it **there**, using the token-first / wrapper /
  replacement paths (see the adoption guide). Product-specific divergence lives
  in the product repo — never in the shared DS repo.

Note the deliberate distinction: **`/products/{name}` in the DS repo** =
reusable, design-authored, sanctioned overrides. **A dev's product repo** =
their application code. The two are not the same thing despite the shared word.

### 4. Dev feedback loop (no dev writes to the DS repo)

- **"A shared component is broken."** Devs cannot fix it, but they can describe
  it → they open a **GitHub issue on the org repo** (issues never touch the
  mirror). Design + Claude fix it on the personal repo; it re-mirrors.
- **Concrete dev input on a shared component** (rare) → Claude works it on a
  `feature/{component}` branch **on the personal repo**, PR → personal `main` →
  mirror. The dev's input is advisory; the commit stays single-writer.

### 5. Two surfaces, two lifecycles, one org Pages site

| Surface | Built from | Refreshes when | Gated? |
|---|---|---|---|
| **Preview** — Storybook (hosted) + local VS gallery | current `main` | scheduled cron + manual **Run workflow** | No |
| **Published** — DS website | **latest release tag** | a release is published | Yes |

Both live on the org repo's single GitHub Pages site. Each surface **builds from
its own git ref**, so a mirror refreshes the preview without touching the
published site, and a release refreshes the published site without leaking
unreleased work. End-state Pages layout:

- `/` → DS website (from the latest release tag)
- `/catalogue/` → Storybook (from current `main`)

Until the website build ships, Storybook remains at `/` and the move to
`/catalogue/` happens **with** the website launch (so the live URL is never left
empty).

### 6. Releases happen in the org repo

The release (tag) is **Gate 2** — a human action performed in the **org**
Releases UI. Because it uses a real user token (not the mirror's deploy key), it
**does** trigger org workflows, which build and publish the website. In practice
the design lead performs the release in org on the product owner's behalf.

### 7. Preview trigger = cron + manual, not a broader token

The mirror's **deploy-key pushes do not trigger org workflows**. Rather than
widen the mirror credential to a PAT (broader blast radius, IG concern), the
preview redeploy runs on a **schedule** with a **manual `workflow_dispatch`**
button for on-demand refresh. Local Storybook (`localhost:6006`) and the VS
gallery give instant preview while authoring; the cron is the safety net for the
hosted copy.

---

## Options Considered

### Option A: Single `main`, devs develop in the org repo
- **Pros:** Devs "own" the org repo; conventional GitHub flow.
- **Cons:** The moment a dev merges to org `main`, it diverges from personal
  `main` and the **fast-forward mirror breaks** — manual reconciliation on every
  dev touch. Puts a no-capacity team on the critical path. **Rejected.**

### Option B: Mirror to a `design-incoming` branch; org `main` dev-owned
- **Pros:** Devs get a repo they can write to; supports multiple folder owners.
- **Cons:** Needs org-side auto-merge automation and CODEOWNERS now, more moving
  parts than a solo team needs today. **Deferred** — this is the documented
  *evolution path* once there is more than one writer (see Consequences).

### Option C (chosen): Read-only mirror, design owns the DS repo, devs consume + file issues
- **Pros:** Mirror is trivially always fast-forward; nothing stalls on devs; no
  CODEOWNERS gymnastics; least machinery; fits a solo maintainer.
- **Cons:** Dev fixes to shared components round-trip through the designer. Given
  low expected volume and the `/products` escape valve, acceptable.

### Publishing trigger
- **Gate both surfaces on release** — rejected: conflates the working preview
  with the published site.
- **Chosen:** split — preview on cron/dispatch from `main`; published on release
  from the tag.

### Preview refresh mechanism
- **PAT on the mirror** (instant) — rejected: broader token than a repo-scoped
  deploy key; IG/least-privilege concern.
- **Manual only** — rejected: forgettable, leads to stale hosted preview.
- **Chosen:** cron + `workflow_dispatch`.

---

## Rationale

This is the leanest arrangement that (a) never blocks on the dev team,
(b) keeps the fast-forward mirror unbreakable, (c) keeps AI authoring on the one
repo Claude can reach, (d) serves published DHCW property inside org
infrastructure, and (e) separates "what's being worked on" from "what's
approved." Every gate that requires a human (token PR check, release) is either
automated or a single deliberate click by the one key person.

---

## Consequences

- **Org `main` is a read-only, published mirror.** Devs view it (Storybook / VS),
  consume it, and file issues against it. No CODEOWNERS needed yet.
- **Storybook stays at Pages root** until the website ships, then moves to
  `/catalogue/` as part of the website launch (non-breaking).
- **No website-publish workflow is committed until the website build exists** —
  per the repo principle of no placeholder files/CI. It is designed here and
  added with the site.
- **Actions cost:** the preview cron frequency is tunable; a "skip if `main` SHA
  unchanged" guard can be added if runner minutes become a concern.
- **`/products` is design-owned**; product-specific adaptation belongs in product
  repos, keeping the shared component clean.
- **Evolution path (Option B), when a second writer appears:** change the mirror
  to land on a `design-incoming` branch, open the org PR manually, hand org
  `main` to its owners, and add CODEOWNERS so folder owners gate their areas.
  This DDR is superseded at that point.

---

## References

- `docs/repo-mirroring.md` — fast-forward mirror, deploy key, troubleshooting
- `.github/workflows/mirror-to-dhcw.yml` — the mirror
- `.github/workflows/deploy-storybook.yml` — preview (Storybook) pipeline
- DDR-007 — packages monorepo + token build pipeline
- DDR-009 / DDR-010 — Storybook catalogue and toolchain
- Adoption guide for engineers (token-first / wrapper / replacement paths)
- Website brief — *Claude Code Brief — SR Design System Website (Concept B)*
