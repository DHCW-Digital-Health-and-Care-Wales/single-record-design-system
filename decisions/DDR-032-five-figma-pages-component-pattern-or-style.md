# DDR-032: Where five Figma pages sit — component, pattern, or style

**Date:** 2026-09-14
**Author:** Design lead (with AI-assisted session)
**Status:** Accepted
**Supersedes:** N/A

---

## Context

Five pages in the Figma file were queued for the DS website: Status Indicator
(`5013:28116`), Link (`1636:21000`), Inset text (`3613:17760`), Notification
banner (`2561:21736`) and Error/Warning messages (`1438:2087`).

"Add them to the website" is not one decision. A Components page promises a
thing with a contract you can instantiate; a Patterns page promises a
composition; a Styles page promises a token or a family of marks. Publishing all
five as components would put three different kinds of thing behind one promise,
and two of the five would then have two implementations of the same markup.

The test used throughout: **what is the smallest honest thing this is?** A
component has its own anatomy and can be instantiated on its own. A pattern
composes components to solve a task. A style is a value or a family of marks
that components consume.

---

## Decision

| Page | Verdict | Where it goes |
|---|---|---|
| Status Indicator | **Style** — the filled status icon family | A section on `styles/icons.html`. No Components page |
| Link | **Component** | `components/link.html`, with web and React code |
| Inset text | **Component**, narrowed | `components/inset-text.html`, stripped back to prose emphasis |
| Notification banner | **Component**, one set not two | `components/notification-banner.html` |
| Error/Warning messages | **Neither** — shared form-field anatomy | A section of the form-field guidance. The missing piece is an **error summary**, which is a pattern |

---

### 1. Status Indicator is a style, and it already ships

The page holds four filled marks — error, warning, success, and a neutral
determinate dash — and nothing else. They are the `Icon/warnings/*` group:
two-tone filled marks whose colour carries meaning, deliberately kept out of the
1px outline icon set (DDR-013, DDR-029).

They already ship as `.sr-status-indicator` in `packages/web` and
`StatusIndicator` in `packages/react`, with size and status modifiers. The page
even carries a `Guidelines/Icons` frame rather than a guidelines frame of its
own, which is the file agreeing with this reading.

A Components page for it would promise a contract that is really an icon
lookup. It goes on the Icons page, beside the outline set it is deliberately not
part of.

**Open:** the fourth mark (the neutral dash) has no counterpart in code —
`.sr-status-indicator` ships success, error and warning only. Either the mark is
real and the code needs it, or it is a leftover. Resolve before publishing.

### 2. Link is a component

24 variants across Type × Size × State, plus a `Leading icon` boolean. It has
its own anatomy, it is instantiated on its own, and it is the counterpart to
Button — which is already a component page. Nothing borderline here.

**The spec is stale and must be corrected before publishing.**
`components/link/spec.md` describes 36 variants across three types including
`Inverse`, and cites node `1633:320`. The real set is `1636:21236` with **24**
variants and **no Inverse type**; `1633:320` no longer exists. A spec that
names a node that is gone is worse than no spec, because it reads as checked.

### 3. Inset text is a component, but it is currently wearing the banner's clothes

GDS inset text is a block of prose held apart from the prose around it: a left
bar, no icon, no status colour, no actions. It is emphasis *within* content.

In the file, the Inset Text component (`3613:17859`) is close to that — text
with a left bar — but it is tinted informational blue, and the frame beside it
(`3613:17851`) adds a heading and two buttons, at which point it is
indistinguishable from `Notification Banner/Variants → Call to action`. Two
components that render the same thing will be used interchangeably and will
drift apart.

**Narrow it.** Inset text keeps: a left bar, body text, no icon, no heading, no
buttons, and a neutral bar rather than a status colour. Then the boundary is
sayable in one line:

> **Inset text is part of the page. A banner is an event.**

Inset text is written by the author and is always there. A banner appears
because something happened — a save succeeded, a record is locked, the system is
going down at 2am.

**Also:** the Inset text page's title layer reads "NOTIFICATION BANNERS". Fix
that while it is open; it is how the two got conflated.

### 4. Notification banner is a component, and its two sets should be one

Today there are two sets:

| Set | Property |
|---|---|
| `Notification Banner/Severity` (`2561:21695`) | Severity: Critical, Error, Information, Success, Warning |
| `Notification Banner/Variants` (`2561:21735`) | Type: Call to action, Global, Inline, Inline Dismissible |

These are orthogonal — every severity can appear in every type — so they are two
properties of one component, not two components. Splitting them means a
designer picking "Warning" has not yet chosen a placement, and picking "Inline"
has not yet chosen a meaning, with nothing in either set saying so.

Two further corrections fall out of looking at them together:

- **Dismissible is a boolean, not a type.** `Inline` and `Inline Dismissible`
  differ by one close button. That is `Dismissible: on/off`.
- **Critical and Error are one severity.** Both render red. If "Critical" is
  meant to be the patient-safety case, it needs to differ by more than the word
  — and the example drawn under it ("Patient safety alert") is doing exactly the
  job the Error variant does, one shade darker. Collapse to four severities
  matching the status tokens: Information, Success, Warning, Error.

Target: one set, `Severity` (4) × `Placement` (Global | Inline) × `Dismissible`
(boolean) × `Actions` (boolean).

**Not applied in Figma by this DDR** — merging sets detaches live instances, the
same reason DDR-031 left the Stat Card set alone. Recorded so the code ships the
right shape and the Figma pass is a known, deliberate job.

### 5. Error/Warning messages is not a component

Two variants: an icon plus red text, and an icon plus amber text. This markup
already exists inside **six** shipped components — Input, Select, Checkbox,
Radio, Search and Date input all render `__error` today, with the message tied
to the field by `aria-describedby` and the field marked `aria-invalid`.

Publishing it as a standalone component creates a second implementation of
something six components already own, and invites a validation message that is
visually right and semantically detached from its field — which is the failure
mode the current arrangement exists to prevent.

It belongs in `components/form-fields.md` as shared anatomy, and on the website
as a section of the form-field guidance.

**What is genuinely missing is the error summary**, and that *is* a pattern: the
box at the top of a form listing every error, each a link that moves focus to
the field it names. GDS and NHS England both treat it as required for a form of
any length, and nothing in this system provides it. It composes Link, the
form-field error anatomy, and focus management, which is what makes it a
pattern rather than a component.

---

## Options Considered

### Option A: publish all five under Components
- **Pros:** one shape, no judgement calls, five pages ship at once.
- **Cons:** the Components section stops meaning anything. Two of the five would
  ship a second implementation of markup that already exists, and the one thing
  actually missing — the error summary — would still be missing.

### Option B (chosen): classify each, then publish
- **Pros:** each page promises what it delivers. Two duplications are avoided
  rather than shipped and later deprecated. Surfaces the one real gap.
- **Cons:** slower, and three of the five need work in Figma before they are
  publishable.

---

## Rationale

Four of the five were already answered by something in the repo, once looked at:
Status Indicator by the shipped `.sr-status-indicator`, Error messages by the
six components that render errors today, Inset text by the banner variant that
duplicates it, and Notification banner by its own two sets being orthogonal. The
judgement was mostly a matter of reading what exists rather than deciding what
ought to be.

Link is the one with no complication, which is why it is the one to build first.

---

## Consequences

**Build order**, easiest to hardest, each self-contained:

1. **Link** — correct the spec, write `guidelines.md`, build web and React, add
   the website page. No Figma work needed.
2. **Status Indicator** — a section on the Icons page. Settle the fourth mark
   first.
3. **Inset text** — narrow the component in Figma, fix the page title, then
   spec, code and page.
4. **Notification banner** — one set in Figma, then spec, code and page. The
   largest piece.
5. **Error summary** — a new pattern, after the banner, since it borrows the
   banner's anatomy.

- `components/error-warning-messages/` is **not** created. The guidance goes
  into `components/form-fields.md`.
- `DESIGN-SYSTEM.md` gains rows for Inset text and Notification banner as
  Figma-only, and its "Link has a spec and no code" gap now has an owner and an
  order.
- No new tokens. All four severities map to existing `status/*` and
  `status/*-surface` pairs, which `scripts/check-contrast.mjs` already asserts.

---

## Follow-up, 2026-09-14

The design lead accepted all five verdicts and asked two follow-on questions.
Both are answered in `docs/figma-banner-and-error-messages.md`, as steps to
follow in the file rather than as principles, because both involve detaching
instances and the order matters.

- **Merging the banner's two sets** collapses to one set of eight variants plus
  two booleans. The trick that keeps it small is making `Dismissible` and
  `Actions` boolean component properties rather than variant axes — as variants
  they would multiply the set to 32.
- **Error/Warning messages is not deleted.** Its two variants become a
  `Form field / Message` building block, and the page is retitled **Errors** to
  hold that block plus the error summary, which the design lead asked to see
  there.

Also settled: the fourth mark on the Status Indicator page is `action/remove`,
the existing icon, not a new one. That confirms the "it is a style, it already
ships" reading — with one gap, since `.sr-status-indicator` has no neutral
variant using that icon today.

---

## References

- DDR-013 (filled status marks are not part of the outline icon set)
- DDR-029 (one glyph, one meaning)
- DDR-031 (component vs pattern for Stat card; the same test, applied here)
- GDS "Inset text", "Error summary", "Error message"
- NHS England "Warning callout", "Error summary"
- Figma: Status Indicator `5013:28659`, Link `1636:21236`, Inset Text
  `3613:17859`, Notification Banner `2561:21695` / `2561:21735`, Warning
  Messages `1517:13667`
