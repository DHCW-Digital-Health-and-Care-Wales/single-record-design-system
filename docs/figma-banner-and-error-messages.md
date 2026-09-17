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

### Steps, in order

The order matters because renaming a property detaches every instance bound to
it, and deleting a set leaves its instances orphaned.

**Steps 1–6 were done on 2026-09-17.** What remains is 7 and 8, and step 7 is
much smaller than this plan assumed — see the inventory below.

| # | Step | State |
|---|---|---|
| 1 | Find the instances first | **Done** — 6 live instances, all on one page. Inventory below. |
| 2 | Rename `Notification Banner/Severity` to `Notification Banner` | **Done** |
| 3 | Merge Critical into Error | **Done** — zero instances used Critical, so nothing was re-pointed. Five became four. |
| 4 | Add `Placement` | **Done** — four became eight. Global variants have square corners. |
| 5 | Add `Dismissible` boolean | **Done** — `Dismissible#5340:0`, default off |
| 6 | Add `Actions` boolean | **Done** — `Actions#5340:9`, default off |
| 7 | Swap the orphans | **Open** — 6 instances, recommendation per instance below |
| 8 | Delete `Notification Banner/Variants` (`2561:21735`) | **Open** — blocked on 7 |

The merged set is `2561:21695`, still on the Notification banner page
(`2561:21736`), with eight variants:

```
Severity = Information | Success | Warning | Error
Placement = Inline | Global
Dismissible = boolean (default off)
Actions     = boolean (default off)
```

Both booleans were verified by spawning an instance of all eight variants,
toggling each on, and confirming the Close and Actions layers became visible in
every one. The temporary frame was deleted afterwards.

#### One thing had to be normalised first

The five original Severity variants were not built alike. Information and Success
had a `Close` layer and no `Actions` row; Warning, Error and Critical had an
`Actions` row and no `Close`. A boolean bound to a layer that does not exist
cannot be bound at all, so every variant now carries both layers before the
booleans were added. The two new Actions rows were cloned from Error's and then
re-pointed off the red they were cloned with — `Status/Info` for Information,
`Status/Success` for Success.

### Step 1's output — every instance of either set

Swept all 61 pages of the file. **Six live instances, all on `Adaptations UEC`**
(`1363:23684`). Nothing in `PAGES`, `PATTERNS` or any component page uses either
set. None is nested inside another instance, so all six are directly re-pointable.

> Reading `variant.instances.length` reports **15**, not 6. The other nine sit in
> orphaned subtrees whose root frame has a `null` parent — they are not on the
> canvas and no sweep can reach them. So step 8's "once step 7 reports zero
> instances" means zero *page-reachable* instances; `.instances` will never read
> zero. Recorded in `docs/figma-known-issues.md`.

#### The old set never recorded a severity — but the instances did

This plan assumed choosing a severity per instance would be a judgement call.
It is not, or barely. Every live instance **overrides the fill and stroke** to a
status token, and that override is the severity the designer meant:

| Instance | Frame | Fill / stroke override | Message | Recommended |
|---|---|---|---|---|
| `2942:9469` | `MacBook Air - 12` | `Info Blue/50` / `Status/Info` | "Total previous attendances is a combined count…" | Information · Inline |
| `4242:31587` | `Modal` | `Status/Critical` | "Clinical Reminder: NEWS Score > 3 — Suspect SEPSIS…" | Error · Inline |
| `4242:31937` | `Modal` | `Status/Critical` | same message | Error · Inline |
| `4562:22833` | `Modal` | `Status/Critical` | same message | Error · Inline |
| `4562:25111` | `Modal` | `Status/Critical` | same message | Error · Inline |
| `4562:25792` | `Modal` | `Status/Critical` | same message | Error · Inline |

All six were `Type=Inline`, none had a visible close button or action row, so
`Placement=Inline`, `Dismissible=off`, `Actions=off` throughout.

Two things are still genuinely yours:

1. **The five sepsis banners are the case Critical existed for.** They are a
   patient-safety alert, and collapsing them to Error is exactly the collapse
   DDR-032 argued for — a safety alert that must outrank an error needs more
   than a darker red. Mapping them to Error is the decision this merge implies,
   but it is the one instance where the merge changes meaning on a live screen,
   so it should be your call rather than a script's.
2. **`2942:9469` binds its fill to `Info Blue/50`**, a global token, where every
   other banner binds to a `Status/… Surface` semantic. Worth fixing to
   `Status/Info Surface` while you are in there.

There is also a **seventh** banner on that page, `4562:22747`, which is already
an instance of the surviving set (`Severity=Information`, "Form guidance") and
needs nothing.

### A naming mismatch this merge exposes

The variant is called `Severity=Error`; the tokens it binds to are
`Status/Critical` and `Status/Critical Surface`. There is no `Status/Error`
variable in the file. After the Critical/Error collapse the axis value and the
token name disagree on the same colour. Renaming the variable is a token change
with its own blast radius, so it is left as a flagged decision rather than done
here.

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
