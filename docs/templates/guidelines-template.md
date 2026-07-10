<!--
GUIDELINES TEMPLATE — copy this to author a guidelines page.

One guidelines page per DS topic (a Foundation, a Component, or a Pattern).
Save as a sibling `*.guidelines.md` (foundations) or `guidelines.md` (component /
pattern folders). This file is the SINGLE SOURCE for two surfaces:
  1. the Figma "Guidelines / Usage notes" panel for the topic, and
  2. the topic's page on the DS website (Foundations / Components / Patterns).

Keep it short and scannable — guidance, not reference. Deep reference lives
elsewhere: tokens in /foundations/tokens/, component contracts in
/components/<name>/spec.md, patterns in /patterns/. Link to them, don't repeat them.

Format mirrors the NHS England / GDS design-system page shape (When to use ·
When not to use · How it works · Do & don't · Accessibility) and the Figma
Usage-notes panel (short titled sections). Every section below is expected;
delete a row of a table or a whole optional section only if it genuinely
does not apply, and say why in a Research/notes line if the omission is notable.
-->

# [Topic name]

<!-- One-line definition. What it is, in plain clinical-staff language. -->
> [One-sentence summary — plain language, no design-system jargon.]

| | |
|---|---|
| **Type** | [Foundation / Component / Pattern] |
| **Status** | [Draft / In review / Approved / Live] |
| **Reference** | [link to tokens / spec.md] |
| **Figma** | [node id / link] |
| **Related standards** | [links to any DHCW UI-standards items, GDS/NHS England equivalents] |
| **Last updated** | YYYY-MM |

---

## When to use

Short, concrete guidance on when this is the right choice.

## When not to use

The situations where something else is better — **link the alternative**. (For
components/patterns this replaces "there's only one way"; always offer the exit.)

## How it works

The core usage rules — the substance of the page. Prefer short titled
sub-points (they map 1:1 to the Figma Usage-notes panel rows):

- **[Rule title]** — one or two sentences.
- **[Rule title]** — one or two sentences.

Use a small anatomy diagram or a compact table only where it earns its place.

## Options

Brief list of the meaningful variants/choices, each with a one-line "use when".
Detailed variant matrices stay in the spec — link, don't duplicate.

| Option | Use when |
|---|---|
| … | … |

## Do & don't

| Do | Don't |
|---|---|
| … | … |

## Accessibility

The WCAG-relevant essentials for this topic — keyboard, focus, screen-reader,
contrast, target size, resize. Reference `/accessibility` for cross-cutting rules;
keep only the topic-specific points here.

- …

## Content

Voice, labels, casing and terminology specific to this topic. Sentence case;
follow the DHCW terminology table where relevant (link the source anchor).

- …

## Frameworks

Where and how this is consumed. The system is implementation-agnostic at the
design level; per-framework detail lives in the spec / Storybook / package —
link, don't inline code here.

| Framework | Status | Where |
|---|---|---|
| Web (HTML/CSS) | [reference baseline] | `packages/web/…` / token CSS |
| React | [current] | `packages/react/…` |
| Blazor / .NET | [current] | `packages/blazor/…` |
| .NET MAUI | [current] | `packages/maui/…` |
| Legacy (.NET 4.8 / Delphi) | tokens only / best-effort | token CSS custom properties |

> Web (HTML/CSS) is the lowest-common-denominator reference any product — including
> the new React Single Record app and legacy products — can lean on. See
> `docs/for-engineers.md` and `docs/engineering/adopting-components.md`.

## Clinical / DHCW notes

Any WCP / DHCW UI-standards requirement that applies to this topic, quoted with its
source anchor into `docs/reference/dhcw-ui-standards-v1.3.md` (`[p.N]`). Mark each
as carried forward, adapted, or superseded-by-tokens. Omit the section if none apply.

## Related

- [Related components / patterns / foundations]
- [GDS / NHS England equivalent]
</content>
