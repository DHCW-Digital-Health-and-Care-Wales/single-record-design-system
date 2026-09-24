# Figma: merging the Notification banner sets, and where Error/Warning messages goes

Two jobs the design lead asked for on 2026-09-14, both following from DDR-032.
Written as steps to follow in the file, because both involve detaching instances
and the order matters.

---

## 1. Notification banner: two sets become one

### Where it is now

| Set | Node | Variants | Property |
|---|---|---|---|
| `Notification Banner/Severity` | `2561:21695` | 5 | Severity: Critical, Error, Information, Success, Warning |
| `Notification Banner/Variants` | `2561:21735` | 4 | Type: Call to action, Global, Inline, Inline Dismissible |

Nine variants across two sets, and neither set is complete on its own. Picking
"Warning" has not yet chosen a placement; picking "Inline" has not yet chosen a
meaning. Nothing in either set says the other exists.

### Where it should be

**One set, `Notification Banner`, with eight variants and two booleans.**

| Property | Kind | Values |
|---|---|---|
| `Severity` | Variant | Information · Success · Warning · Error |
| `Placement` | Variant | Inline · Global |
| `Dismissible` | **Boolean** | on / off |
| `Actions` | **Boolean** | on / off |

The trick that keeps this small is the last two. `Dismissible` and `Actions` are
**boolean component properties that show and hide a layer**, not variant axes. As
variants they would multiply the set to 32; as booleans the set stays at 4 × 2 =
**8 variants**, one fewer than the nine spread across two sets today, and every
combination is reachable.

This is the same shape the other sets in this file already use — Input exposes
`Required` as a boolean, Search exposes `Label`, `Hint` and `Required`.

### The two collapses

**Critical and Error are one severity.** Both render red. The example drawn
under Critical is a patient safety alert, which is doing the job Error already
does, one shade darker. If a patient-safety banner needs to outrank an error
banner it has to differ by more than a shade — a different icon, a different
weight, an interaction that cannot be dismissed — and that is a design decision
worth its own DDR, not a fifth colour. Until then, four severities, matching the
four `status/*` token pairs the contrast check already asserts.

**Dismissible is not a type.** `Inline` and `Inline Dismissible` differ by one
close button.

**Call to action is not a type either.** It is a banner with `Actions` on. The
example under it ("This is a read-only view", with *Request access* and *Open in
WCP*) is an Information banner with two actions.

### What Placement actually changes

Worth writing on the set, because it is the one distinction that earns a variant:

| | Inline | Global |
|---|---|---|
| Position | In the content column, with the content | Full width at the top of the page, under the header |
| Corners | `--radius-md` | Square — it meets the viewport edges |
| Margins | Sits in the flow, with space above and below | None; it is chrome |
| Applies to | One thing on the page | The whole page, or the whole system |

### Steps, in order — all eight are done

The merge completed on 2026-09-21. `Notification Banner` (`2561:21695`) is the
only banner component set in the file; `Notification Banner/Variants`
(`2561:21735`) has been deleted.

| # | Step | Outcome |
|---|---|---|
| 1 | Find the instances first | 15 instances, on 2 pages — see below |
| 2 | Rename the survivor to `Notification Banner` | Done |
| 3 | Merge Critical into Error | Done — no instance used Critical |
| 4 | Add `Placement` | Done — four variants became eight |
| 5 | Add `Dismissible` boolean | `Dismissible#5340:0`, default off |
| 6 | Add `Actions` boolean | `Actions#5340:9`, default off |
| 7 | Swap the orphans | Done — all 15 re-pointed, text preserved |
| 8 | Delete `Notification Banner/Variants` | Done |

### The set as it now stands

```
Severity    = Information | Success | Warning | Error   (variant)
Placement   = Inline | Global                           (variant)
Title       = boolean, default ON
Dismissible = boolean, default off
Actions     = boolean, default off
```

**`Title` was not in the original plan.** It had to be added: the old `Variants`
set had no title layer at all, and **every one of the 15 live banners is
title-less**. Without the boolean, the merge would have forced a title onto
fifteen real screens or left fifteen hand-hidden layers behind. A title-less
banner is a supported state, so it is a property.

Two other shapes had to be normalised before the booleans could bind. The five
original Severity variants were not built alike — Information and Success had a
`Close` and no `Actions` row, the other three the reverse. A boolean cannot bind
to a layer that is not there, so both layers now exist on all eight variants. The
two cloned Actions rows carried Error's red and were re-pointed to `Status/Info`
and `Status/Success`.

### Step 1's output — where the 15 instances were

| Page | Count | Held in |
|---|---|---|
| `Adaptations UEC` (`1363:23684`) | 10 | 6 direct, 4 in the `Screen Content` slot |
| `Single Record App` (`5:3226`) | 5 | all in the `Screen Content` slot |

> **The first sweep of this file reported 6, and it was wrong.** Nine instances
> sit inside a `Screen Content` **SLOT** on a `Page Template` component, which a
> `page.loadAsync()` sweep does not reach — and on a page that is not fully
> loaded, walking `.parent` stops at `null`, which made them look like orphaned
> off-canvas nodes. They were live screens. Sweep with `setCurrentPageAsync()`
> when the result gates a delete. Both failure modes are in
> `docs/figma-known-issues.md`.

### The severity each instance was meant to have

The old set never recorded a severity, but every instance **overrode its fill and
stroke to a status token**, and that override is the answer:

| Message | Instances | Token evidence | Mapped to |
|---|---|---|---|
| "Clinical Reminder: NEWS Score > 3 — Suspect SEPSIS…" | 5 | `Status/Critical` | **Error** · Inline |
| "Total previous attendances is a combined count…" | 4 | `Status/Info` | Information · Inline |
| "Investigations recorded here have not been operationally requested…" | 4 | `Status/Warning` | Warning · Inline |
| "Barcode scanning: Scan a wristband or notes label…" | 2 | `Status/Info`, was `Inline Dismissible` | Information · Inline · **Dismissible on** |

All 15 have `Title` off and `Actions` off.

**The sepsis mapping is the one that changes meaning**, and it was made on the
design lead's explicit instruction. Those five were the patient-safety case
Critical existed for; DDR-032's argument is that a safety alert needing to
outrank an error must differ by more than a shade, and until that is designed
they are Errors. Their icon changed from a warning triangle to the error circle
as a result, which is the merge doing its job.

### Two things the swap broke and how they were fixed

- **Four banners silently lost their text.** They had never overridden the body —
  they were rendering the *old component's default string*, which does not
  survive a swap. Caught by comparing rendered text before and after, and
  rewritten with their styled runs re-applied so bold lead-ins survived.
- **One banner's fill was on a global token.** `Info Blue/50` rather than
  `Status/Info Surface`; re-pointed to the semantic token.

One cosmetic consequence, accepted: the sepsis banner now wraps to two lines at
651px. The merged set's horizontal padding is 16px against the old set's 12px, and
that string was one line only by a few pixels. Both parent modals were checked and
neither layout breaks.

### A naming question left open

`Placement = Inline | Global` keeps the words the old set used, but the two values
are not opposites: `Inline` describes how the banner sits, `Global` describes how
much it covers. `Inline`/`Full-width` or `Local`/`Global` would each be a
consistent pair. Cheap to change now, expensive once
`.sr-notification-banner--global` ships in three frameworks.

### The `Severity=Error` / `Status/Critical` mismatch

The variant is called Error; the tokens it binds to are `Status/Critical` and
`Status/Critical Surface`. There is no `Status/Error` variable in the file. After
the collapse the axis value and the token name disagree about the same colour.
Left flagged — a variable rename has its own blast radius.

### What ships in code

Once the set is one, the component follows it: a `.sr-notification-banner` with
`--information` / `--success` / `--warning` / `--error`, a `--global` modifier,
and the close button and action row present only when passed. Severity carries
`role="status"` or `role="alert"` depending on whether it interrupts. That build
is queued behind Inset text in the DDR-032 order.

---

## 2. Error/Warning messages: do not delete the page, repurpose it

### Why it is not a component

The two variants in `Warning Messages` (`1517:13667`) are an icon plus red text
and an icon plus amber text. That markup already ships inside **six** components
— Input, Select, Checkbox, Radio, Search and Date input each render a `__error`
element, tied to its field by `aria-describedby`, with the field marked
`aria-invalid`.

A standalone component would be a second implementation of markup six components
already own, and it would invite the failure the current arrangement prevents: a
message that looks right and is not attached to anything. The attachment is the
part that matters, and a standalone component cannot carry it.

### So where does it go

**Keep the two variants, but as a building block, not a component.** Rename the
set `Form field / Message`, with `Type = Error | Warning`, and treat it the way
`Checkbox/Boxes` and `Select / Building blocks` are treated: a part that the
real components are built from, not something to place on a screen by itself.

Its guidance goes into `components/form-fields.md`, beside the required-marker
and hint rules it belongs with. On the DS website it is a section of the
form-field guidance, not a page in Components.

### And the page becomes the Errors page

Retitle the page from `Error/Warning messages` to **Errors**, and let it hold
two things:

1. `Form field / Message` — the building block above.
2. **The error summary** — which is what is actually missing.

### The error summary, which is a pattern

The box at the top of a form that lists every error, each one a link that moves
focus to the field it names. GDS and NHS England both treat it as required for
any form longer than a couple of fields, and nothing in this system provides it.

It is a **pattern**, not a component, because it composes three things that
already exist rather than introducing a new one: Link, the form-field message
anatomy, and focus management.

Anatomy:

```
┌────────────────────────────────────────────┐
│ ⚠  There is a problem                      │  h2, focused on render
│                                            │
│    • Enter the patient's NHS number        │  each one a Link to #field-id
│    • Date of birth must be a real date     │
└────────────────────────────────────────────┘
```

The rules that make it work, and that a hand-rolled version always misses:

- **It takes focus when it appears**, so a screen-reader user hears the problem
  rather than being left at the submit button.
- **Each item is a real link to the field's id.** Clicking it moves focus into
  the field, not merely scrolls to it.
- **The text matches the inline message exactly.** Two wordings for one problem
  is two problems.
- **It lists errors in the order the fields appear**, not the order validation
  found them.
- **It appears once, at the top, above the form's heading** — never beside the
  field, which is the inline message's job.
- **It is not a Notification banner.** A banner reports an event; the summary
  reports the state of the form in front of you, and it is interactive.

Where it goes when built: `patterns/error-summary/`, a Patterns page on the
website, and a frame on the Errors page in Figma.

---

## References

- DDR-032 — the classification these two jobs follow from
- `components/form-fields.md` — where the message guidance lands
- GDS "Error summary", "Error message"; NHS England "Error summary"
- Figma: `2561:21695`, `2561:21735`, `1517:13667`, page `1438:2087`
