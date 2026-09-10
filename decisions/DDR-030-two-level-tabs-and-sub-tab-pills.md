# DDR-030 — Two-level tabs, and the pill / segmented boundary

**Date:** 2026-09-08
**Status:** Accepted
**Decided by:** Design lead
**Relates to:** DDR-002, DDR-006, DDR-011, DDR-025

---

## Context

Screens are appearing where a tab has sub-views: Results splitting into Bloods,
Imaging, Microbiology. The first framing was "a tab with a chevron" — a dropdown
overlay in horizontal use, an in-place expansion in vertical use.

That framing does not survive contact with the ARIA tabs pattern.
`role="tablist"` may contain only `role="tab"`, and a `tab` controls exactly one
`tabpanel`. There is no tab-with-children. A control announced as *"Results, tab,
2 of 4, selected"* promises a panel; producing a menu instead fails SC 4.1.2 in a
way no automated check catches. A control that both selects a view and expands a
menu also has two actions and one accessible name.

Three different needs were hiding behind one description:

| Need | Answer |
|---|---|
| The strip does not fit | Tabs wrap onto another row. Settled 2026-09-08; overflow does not scroll and does not hide behind a "More" menu — clinicians are explicit that hidden navigation costs recall effort and discoverability |
| A tab groups sub-views | **This DDR** |
| A sidebar anchors scrolling across many form sections | Not tabs at all. In-page anchor navigation, where every section is in the DOM at once. Deferred with the form patterns |

---

## Decision

### 1. Sub-views are a second tablist, not a nested tab

The outer tablist selects the group. That group's **panel contains a second,
complete tablist**. Both levels are valid ARIA, both get the full keyboard model,
and no chevron is involved anywhere.

```
role="tablist"   Summary | Results | Medication | Documents
  └─ role="tabpanel" (Results)
       role="tablist"   Bloods | Imaging | Microbiology
         └─ role="tabpanel" (Bloods)
```

**Two levels is the limit.** A third means the information architecture is
wrong, matching the same rule Navigation already carries.

### 2. The second level is a bare pill — `Tabs Level=Secondary`

The two levels must not look alike; two identical underlined strips stacked are
ambiguous about which row you are on. The second level is a pill.

| | Rest | Hover | Selected | Focus | Disabled |
|---|---|---|---|---|---|
| Fill | transparent | `Surface/Accent` | `Interactive/Primary` | — | transparent |
| Border | 1px `Border/Strong` | **unchanged** | `Interactive/Primary` | — | `Border/Disabled` |
| Label | `Text/Secondary` | `Interactive/Primary` | `Text/Inverse` | — | `Text/Disabled` |
| Ring | — | — | — | 2px surface halo, then 2px `Border/Focus` | — |

32px tall, 12px horizontal padding, full radius, 8px apart, wrapping.
Deliberately smaller and lighter than the 40px parent: a child that outweighs its
parent inverts the hierarchy.

### 3. Pill and Segmented control are separated by the track

Both are single-select and both fill the selected option in brand blue. The
difference is structural and learnable in one line:

> **Track = filter. No track = navigate.**

| | Segmented control | Sub-tab pill |
|---|---|---|
| Container | Grey track, 8px radius, 4px padding | None |
| Arrangement | Butted together inside the track | Individual, 8px apart |
| Semantics | `aria-pressed`, `role="group"` | `role="tab"` → `tabpanel` |
| Means | Filters or sets an option **within** the view you are looking at | Switches **which** view you are looking at |

This resolves a contradiction that was live in the system:
`segmented-control.css` described itself as covering "options/**views** … (or
implement as a radiogroup/tablist)", while `components/tabs/spec.md` said the two
"are not interchangeable". The spec is right and the CSS comment was wrong.

### 4. The unselected pill carries a border

A pill with no boundary at rest is discoverable only by hovering it. The border
is the affordance, so it is a UI component boundary under SC 1.4.11 and needs
3:1 — which is why it is `Border/Strong` and not `Border/Default` (1.37:1 on
white, and the same mistake Checkbox and Radio already had to be fixed for).

`Border/Strong` was repointed from Grey/600 to **Grey/500** on 2026-09-08 for
this: 3.75:1 on white, 3.44:1 on the page background. Subtle enough that five
outlined pills in a row do not shout, and still clear of the line.

### 5. Hover does not touch the border

Hover changes the wash and the label only. Moving the border to
`Interactive/Primary` — the treatment Checkbox and Radio use — would make a
hovered pill visually identical to `Button/Secondary`, which is also a
transparent, blue-outlined, blue-labelled control. Only the corner radius would
separate a *"switch to this view"* from a *"do this thing"*.

The cost is losing hover as a preview of the selected colour. That preview earns
its place on a small binary control; on a labelled pill it does not.

---

## Why not …

**A chevron on a tab.** It cannot be built accessibly. See Context.

**An overflow "More" menu.** Rejected on clinical grounds: hidden navigation
adds recall effort and hurts discoverability, and horizontal scrolling is worse
still because nothing indicates that anything is off-screen. Tabs wrap instead.

**Reuse Segmented control as-is for sub-tabs.** Three problems. Its track is
46px against the parent tab's 40px, so the child is physically larger than its
parent. The track cannot wrap (`flex-wrap: nowrap`, and a wrapped rounded track
reads as broken), so five sub-views produce a 559px slab that cannot honour the
wrapping decision. And it keys its selected state off `aria-pressed` while a
sub-tab is `aria-selected`, so sharing the styles would weld two components'
state models together. There is also no reuse saving: the keyboard model —
roving tabindex, arrow keys, panel wiring — has to come from Tabs either way, so
this is a Tabs variant whichever skin it wears.

**Smaller underlined tabs for level two.** Tried and rejected on the render: it
reads as the same control twice, which is the ambiguity the second level exists
to avoid.

**A new `border.moderate` semantic token.** Considered, then rejected in favour
of repointing `Border/Strong` itself, so the system keeps one token for "the
boundary of a control" rather than two that reviewers must choose between.

---

## Consequences

- `Tabs` gains `Level = Primary | Secondary`. Primary is unchanged.
- Nesting is a composition, not a component: a consumer puts a secondary Tabs
  inside a primary tab's panel. No new component, no new ARIA.
- `Border/Strong` is 3.75:1 rather than 6.37:1 for every consumer, not just
  pills. Checked and asserted; see `check:contrast`.
- The Segmented control's self-description needs correcting to match §3.
- **Open, and deliberately not resolved here:** the track cue is the only thing
  separating a filter from a sub-tab. It should be tested on a screen carrying
  both at once. If it does not hold, the fallback is a larger size gap between
  the levels, not a return to the segmented look.
- The Switch's OFF-state thumb is 1.37:1 against its track — found while doing
  this, unrelated to it, recorded as an open finding in `check:contrast` and
  awaiting a colour decision.
