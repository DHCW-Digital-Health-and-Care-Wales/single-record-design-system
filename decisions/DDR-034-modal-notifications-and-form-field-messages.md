# DDR-034: Modal, Notifications and Error/Warning messages — component, pattern, or neither

**Date:** 2026-09-21
**Author:** Design lead (with AI-assisted session)
**Status:** Accepted
**Follows:** DDR-008 (modal dialog), DDR-032 (five Figma pages)

---

## Context

Three more Figma pages were queued for classification: **Modal** (`3807:36489`),
**Notifications** (`3116:24139`) and **Error/Warning messages** (`1438:2087`).

DDR-032's test applies unchanged: **what is the smallest honest thing this is?**
A component has its own anatomy and can be instantiated on its own. A pattern
composes components to solve a task. A style is a value or family of marks that
components consume.

This round added a second test, because all three questions turned on it:
**where are the instances?** A set used only inside the design system's own
documentation pages is not a component in use — it is artwork. A set with no
instances at all is a proposal, not a decision.

| Set | Node | Page-reachable instances | Where |
|---|---|---|---|
| `Modal` | `3807:36855` | 1 | Adaptations UEC |
| `Dialog` | `2612:3330` | **0** | — |
| `Notification Icon` | `817:7235` | 4, all `Badge=None` | Header page only |
| `Warning Messages` | `1517:13667` | 15, all `Type=Error` | Checkbox, Radios, Select — **DS doc pages only** |

---

## Decision

| Page | Verdict | Action |
|---|---|---|
| Modal | **Component** — already decided by DDR-008 | Keep `Modal`. **Delete the `Dialog` set**, which contradicts DDR-008 |
| Notifications | **Misnamed; not a component** | The reusable thing is a **Badge**. Rename the page; do not ship "Notifications" |
| Error/Warning messages | **Neither** — confirmed by DDR-032 | Keep as the `Form field / Message` building block |

---

## 1. Modal is a component. The problem is the `Dialog` set.

DDR-008 settled this on 2026-06-23: one base `Modal dialog` component, with
Confirmation and Result as **documented patterns** composed from it. Its stated
reason was that a variant matrix over intent × layout × action-count × states
"would explode combinatorially and still not fit real content."

**The file does the thing DDR-008 rejected.** `Dialog` (`2612:3330`) is a
ten-variant component set whose variants are exactly DDR-008's pattern
inventory:

```
Standard · Destructive · Warning · Acknowledgement · High-stakes · Processing
Result - Success simple · Result - Success next-step
Result - Success summary · Result - Error result
```

That is the pattern list encoded as a variant axis. It is the combinatorial
matrix the DDR declined to build, and it has **zero instances** — nobody has
ever placed one.

Meanwhile `Modal` (`3807:36855`) is correct and is what DDR-008 describes:
`Size = Small | Medium | Large` plus a `Modal Content` slot property. The slot
is the mechanism that makes composed patterns possible, and it is already there.

**So:** keep `Modal` as the component. Rebuild the Dialogs page as **pattern
frames** — instances of `Modal` with real content plugged into the slot — and
delete the `Dialog` component set. Nothing is lost, because nothing uses it, and
the patterns become what DDR-008 said they were: compositions you can read,
not variants you must maintain.

### Three defects found on those pages

- **Both pages are titled `NOTIFICATION BANNERS`.** The Modal page's heading and
  the Dialogs page's heading are copy-paste leftovers. Neither page is about
  banners.
- **`patterns/dialogs/` has only `confirmation-dialog.md`.** DDR-008 names two
  patterns; the Result dialog has no write-up at all.
- **`components/modal/spec.md` is still "In development"** while `Modal` ships
  in `packages/web/src/modal/`. Spec and code disagree about whether it exists.

---

## 2. "Notifications" is the wrong name, and the component is a Badge

The page contains exactly one thing: `Notification Icon`, a set of
`Badge = None | Dot | Count`. It is a bell icon that can carry a badge.

**The name promises something that does not exist.** "Notifications" reads as a
notification centre, a feed, or a toast system. None of those are in the file. A
Components page called Notifications would promise a contract nobody can
instantiate.

**The badge is the reusable thing, and it is already duplicated.** Code has two
independent implementations — `.sr-nav__item-badge` (navigation) and
`.sr-tabs__badge` (tabs) — and `.sr-header__notification` exists with **no badge
at all**. Shipping `Notification Icon` as a component would make a third.

All four instances of the set are `Badge=None` on the Header page. The Dot and
Count variants have never been placed. The badge feature is unexercised in
Figma and independently reinvented twice in code.

**So:** a count/dot **Badge** is the honest unit — a small mark applied to an
icon, a nav row or a tab, owned once. The bell itself is `Icon/*` plus
`.sr-header__notification`, which already exists.

- Rename the page away from "Notifications"; its content belongs with the
  Header and Icons pages.
- Do not publish a Notifications component page.
- Open a separate piece of work to unify the two code badges behind one style.

**If a real notification centre is planned**, it is a **pattern** — a panel
composing Link, Tag, the status marks and a list — and nothing for it exists
yet. It should not be back-filled under this page's name.

---

## 3. Error/Warning messages is not a component — and the instances prove it

DDR-032 already reached this verdict. The usage data confirms it rather than
merely restating it.

`Warning Messages` (`1517:13667`) has **15 instances, every one `Type=Error`,
and every one on the Checkbox, Radios or Select pages** — the design system's
own documentation. **Not one sits on a product screen.** `Type=Warning` has
never been placed at all.

So the set is not a component in use; it is **how the component pages draw their
own error state**. That is precisely the "shared form-field anatomy" reading.

The substantive argument is unchanged: Input, Select, Checkbox, Radio, Search
and Date input each already render an `__error` element tied to its field by
`aria-describedby`, with the field marked `aria-invalid`. **The attachment is
the part that matters**, and a standalone component cannot carry it — it would
invite a message that looks right and is attached to nothing.

**So:** keep the two variants as `Form field / Message`, a building block in the
same class as `Checkbox/Boxes` and `Select / Building blocks`. Guidance lives in
`components/form-fields.md`. No Components page, and **no deletion** — the
component pages depend on it as artwork.

The real gap behind this page remains the **error summary**, which is a pattern
and is still unbuilt. See `docs/figma-banner-and-error-messages.md`.

---

## 4. `Status/Critical` is renamed to `Status/Error` — additively

Carried over from the DDR-032 banner merge, where `Severity=Error` was found to
bind to `Status/Critical` with no `Status/Error` variable in existence.

**The token is the misnamed one, not the variant.** `status.critical` is what
Input, Select, Checkbox, Radio, Search and Date input use for an ordinary
invalid field. A mistyped NHS number is not a critical event. The name was
inherited from the red ramp's description ("Status — error/critical") and has
been carrying two meanings since.

It is also load-bearing: **249 occurrences across 57 files**, and
`--sr-color-status-critical` is public API of `@dhcw/sr-tokens` (v0.3.0).

**Decision: add `status.error` as the canonical name and keep
`status.critical` as a deprecated alias.** Both custom properties are emitted,
internal usage migrates to `status.error`, and the alias is removed at the next
major. A straight rename is defensible pre-1.0 but would break every consumer
stylesheet for a naming tidy-up, which is not a trade worth making silently.

Figma's `Status/Critical` and `Status/Critical Surface` variables are renamed to
match, which costs nothing — variable renames do not detach bindings.

---

## Consequences

- `Dialog` (`2612:3330`) is deleted; the Dialogs page is rebuilt as pattern
  frames from `Modal` instances.
- `patterns/dialogs/` gains a Result dialog write-up.
- `components/modal/spec.md` moves off "In development".
- The Notifications page is renamed and does not become a Components page; a
  shared Badge style supersedes two code implementations.
- `Warning Messages` becomes `Form field / Message` and stays where it is.
- `status.error` becomes canonical; `status.critical` becomes a deprecated alias.

## References

- DDR-008 — modal dialog: one base component, confirmation and result as patterns
- DDR-032 — the classification test this follows
- `docs/figma-banner-and-error-messages.md` — the error summary gap
- `components/form-fields.md` — where the message guidance lands
