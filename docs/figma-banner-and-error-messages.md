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

1. **Find the instances first.** Before touching either set, search the file for
   instances of both and list the frames they sit in. Anything in `PAGES` or
   `PATTERNS` is a real screen someone is working from.
2. **Keep `Notification Banner/Severity` (`2561:21695`) as the survivor.** It has
   the richer artwork and the axis with more values. Rename it to
   `Notification Banner`.
3. **Merge Critical into Error.** Re-point any instance using Critical at Error,
   then delete the Critical variant. Five becomes four.
4. **Add the `Placement` property.** Set the existing four to `Placement=Inline`,
   then duplicate them and adjust the copies to `Placement=Global`: square the
   corners, take the horizontal margin off, and let the fill run edge to edge.
   Four becomes eight.
5. **Add `Dismissible` as a boolean** bound to the close button's visibility, on
   all eight. Default off.
6. **Add `Actions` as a boolean** bound to the action row's visibility, on all
   eight. Default off.
7. **Swap the orphans.** Re-point every instance of
   `Notification Banner/Variants` at the merged set, choosing the severity and
   placement that matches what it was drawing.
8. **Delete `Notification Banner/Variants` (`2561:21735`)** once step 7 reports
   zero instances.

Steps 3 and 7 are the ones that lose work if rushed. Do the search in step 1
before anything else.

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
