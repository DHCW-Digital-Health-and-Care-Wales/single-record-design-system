# DDR-022 — When to wrap a third-party component on web, and what wrapping means

**Date:** 2026-08-13
**Status:** Accepted
**Decided by:** Design lead, engineering lead
**Related:** DDR-021 (MAUI is native XAML — the same principle, stated for mobile), DDR-002 (WCAG 2.2 AA), DDR-003 (Lucide icons), DDR-020 (package distribution)

---

## Context

DDR-021 settled this question for MAUI in one line: **Single Record wraps what
it would never design, and builds natively what it already specifies.**
Syncfusion keeps the PDF viewer; buttons, cards and headers are built from
tokens.

The same question is now live on web, and nothing records an answer. It has
come up three times in different clothes:

- **Select.** `packages/web/src/select/select.css` plus its React wrapper is a
  hand-built button-and-listbox: `aria-haspopup`, `aria-expanded`,
  `role="listbox"`, roving focus, typeahead, Escape-to-close, focus return. All
  of that is ours to keep correct, and all of it is a solved problem in several
  free libraries.
- **Menu and Tabs.** Neither exists in the system. The Case Note Tracking
  prototype needed both and built them locally from tokens
  (`RowActions.jsx`, `MyRequests.jsx`), scoped to that prototype.
- **Autocomplete, date picker, data grid.** Specced or partially built, each
  with a well-known library that does it better than a first attempt will.

Without a rule, each of these gets decided by whoever picks it up, and the
system ends up with some components wrapped, some built, and no way to explain
which is which to a new engineer.

The instinct that "a design system should own all its components" is not the
right test. Owning a component means owning its **accessibility behaviour
forever** — every browser quirk, every screen-reader combination, every WCAG
2.2 criterion, on a healthcare product where getting it wrong has consequences.
For a listbox that is a real and ongoing cost. For a button it is trivial.

---

## Decision

### 1. The test is behavioural complexity, not component importance

Wrap a third-party library when the component's **interaction and
accessibility behaviour** is complex, standardised, and not specific to Single
Record. Build natively when the component is mostly **appearance and layout**
over a native element.

The dividing question: *if we build this ourselves, what are we signing up to
maintain — a stylesheet, or a keyboard interaction model?*

| Build natively | Wrap a library |
|---|---|
| Button, tag, card, banner, patient banner | Combobox / autocomplete |
| Checkbox, radio, switch, text input | Date picker |
| Table (static), breadcrumbs, header, footer | Menu / dropdown, tabs |
| Segmented control | Data grid (virtualised, sortable, resizable) |
| Anything whose behaviour is a native element's | Modal focus-trapping primitives |

These all sit on native elements and carry no focus management, no popover
positioning, and no roving tabindex. A library adds weight and a dependency
without removing any real burden.

### 2. Wrapping means the library is an implementation detail, never an API

A wrapped component must be **invisible from the outside**. Specifically:

- **Single Record's own component API.** Consumers import `<Select>` from
  `@dhcw/sr-react`, not the library. Props are ours and named for our system.
  A consumer must never need to read the library's docs.
- **Never re-export the library's components or types** from our packages. That
  turns the dependency into our public API and makes replacing it a breaking
  change for every product.
- **Styling comes from our tokens, not the library's theme system.** Prefer
  headless or unstyled libraries for exactly this reason. Where a library ships
  a theme, do not configure it to approximate our tokens — disable it and style
  from `@dhcw/sr-tokens`, so there is one source of colour and spacing rather
  than a mapping that drifts.
- **The design contract is still ours.** A wrapped component needs the same
  `spec.md` and `guidelines.md` as a built one. The library supplies behaviour;
  it does not supply the decision about when to use the component, or what its
  states mean.

If a library cannot be used this way — if its styling cannot be fully replaced,
or its API leaks into ours — that is a reason to reject that library, not a
reason to accept the leak.

### 3. Prefer headless libraries, and record the choice in a DDR

Adopting a library is adding a dependency, which already requires a DDR
(`CLAUDE.md`). That DDR must state:

- What behaviour we are buying, in terms of the interactions we no longer own.
- Licence, and whether it is compatible with distributing our packages.
- Bundle cost, and whether the component can be imported in isolation.
- **Its accessibility record**, tested rather than taken from the README. A
  library that fails the criteria in our own `accessibility/` checklists is not
  a shortcut; it is a liability we would have to patch around.
- The exit: what replacing it would cost, given §2 holds.

Headless libraries (behaviour and ARIA, no styling) are strongly preferred.
They are the only kind that satisfies §2 cleanly.

### 4. Existing hand-built components stay until there is a reason

This decision is **not** a mandate to rewrite Select against a library. It
works, it is specced, and it passes its accessibility requirements. Replace it
only if a concrete defect appears that the library would have prevented, and
record that as its own decision.

The rule applies to **new** complex components — the ones this system does not
have yet: Menu, Tabs, Autocomplete, date picker, data grid.

### 5. Brand and clinical content is never wrapped

Logos, icons, the patient banner, clinical status and priority indicators are
Single Record's own. Their meaning is specific to NHS Wales and to clinical
safety, and no library encodes that. This is the same boundary DDR-021 drew for
MAUI, and the same reason brand marks are not in `@dhcw/sr-icons`.

---

## Consequences

- **Select stays as it is**, and its spec keeps the note that every keyboard
  behaviour is ours.
- **Menu, Tabs and Autocomplete are now blocked on a library evaluation**
  rather than on someone finding time to hand-build them. That evaluation is a
  DDR, and it should cover all three together — they usually come from the same
  library, and choosing three times invites three answers.
- **The prototype's local Menu and Tabs stay scoped to the prototype** until
  that evaluation happens. Promoting them now would build exactly the thing
  this decision says to buy.
- `docs/for-engineers.md` gains a short "Wrapped or built?" section pointing
  here, so an engineer meets the rule where they are working rather than in the
  decision log.
- A wrapped component costs *more* documentation, not less: the library removes
  implementation work, not design work.

## What this does not decide

- **Which library.** Deliberately out of scope. The evaluation is its own DDR
  with the criteria in §3, and it needs bundle and accessibility testing rather
  than a preference.
- **MAUI and Blazor.** DDR-021 covers MAUI. Blazor has no wrapped components
  today and no live question; when one appears, it should follow §1 and §2 by
  analogy rather than assuming this decision transfers unexamined.
