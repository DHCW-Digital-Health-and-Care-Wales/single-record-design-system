# Link

> Text that takes someone somewhere else — another page, a document, a place
> further down the one they are on.

| | |
|---|---|
| **Type** | Component |
| **Status** | In review |
| **Reference** | [spec.md](spec.md) · `packages/web/src/link/link.css` · `packages/react/src/link/Link.jsx` |
| **Figma** | Link (`1636:21236`) on page `1636:21000` |
| **Related standards** | GDS "Links" · NHS England "Links" · WCAG 2.2 AA |
| **Last updated** | 2026-09 |

---

## When to use

- Moving to another page, screen or record.
- Opening a document, a report, or a system outside Single Record.
- Jumping to a place further down the same page.
- Anywhere the address bar should change as a result.

## When not to use

- **Anything that changes state.** Saving, submitting, deleting, opening a
  modal, toggling a panel. Use a [Button](../button/guidelines.md). A screen
  reader announces "link", and a user who is told they are about to navigate and
  instead deletes a record has been misled by the markup.
- **A row that is entirely clickable.** A whole table row or card that opens a
  record is not a link with a big hit area; put the link on the text that names
  the thing, so the accessible name says what will open.
- **Navigation between the main areas of the product.** That is the
  [Navigation](../navigation/guidelines.md) component, which also carries the
  current-page state.
- **A back step in a flow.** Use Breadcrumbs, or the back link the flow already
  provides.

## How it works

- **Underlined, always.** The underline is what identifies a link when the
  colour cannot be seen. It is never removed, including on focus.
- **Hover thickens the underline; the colour does not change.** Figma changes
  hue on hover, but the hover colour is a dark navy that reads at 1.47:1 on the
  dark page. Thickening is GDS's own treatment and works in both modes.
- **An inline link takes the size of the sentence it sits in.** The three sizes
  are for standalone links, where the link is the whole line.
- **The leading icon is decorative.** It never carries meaning the label does not
  already carry, so "opens in a new tab" is written, not drawn.
- **Focus is a 2px ring drawn outside the text**, the same ring every other
  interactive component in the system uses.

## Options

| Size | Type | Use when |
|---|---|---|
| Inherit (default) | Body copy | A link inside a sentence. Matches the surrounding text |
| Large | Body M, 16/24 | A standalone link at the size of body copy |
| Default | Body S, 14/20 | A standalone link in a dense area — a table cell, a card footer |
| Small | Caption, 12/16 | Metadata and footnotes |

### Type

| Type | Use when |
|---|---|
| Default | Everything |
| Destructive | The link opens a flow that removes something. Pair with a confirmation step — the link opens the flow, it does not perform the act. **Light mode only** until the colour question below is settled |

## Do & don't

| Do | Don't |
|---|---|
| Name the destination — "Patient summary" | Write "Click here", "More", "Read more" |
| Say "opens in a new tab" in the text | Rely on an icon to say it |
| Keep the underline | Remove it and leave colour as the only cue |
| Use a Button for anything that changes state | Style a button as a link to make it look quieter |
| Let a long link wrap with its sentence | Put an inline link in a flex container |

## Accessibility

- The link text is the accessible name, so it must make sense read on its own.
  Screen-reader users list the links on a page; "read more" nine times is a list
  of nine identical entries.
- A link that opens a new tab says so in its visible text. The behaviour is a
  surprise otherwise, and a surprise is worse for someone who cannot see the
  tab bar change.
- Focus is a 2px `Border/Focus` ring at a 2px offset, drawn outside the text so
  it is never clipped and never moves the line.
- The underline survives every state. Colour is the second signal, not the first
  (SC 1.4.1).
- **Target size.** A link inside a block of text is exempt from SC 2.5.8. A
  standalone link is not, and the line boxes alone are 24, 20 and 16px — two of
  the three under the 24px minimum. Each size therefore carries 4px of vertical
  padding, which grows the hit area without moving the line. Touch layouts should
  give more than the minimum.
- A disabled link keeps no `href`, so it leaves the tab order the way the browser
  intends. Prefer removing the link and leaving plain text.

## Content

- Sentence case. No full stop unless the link ends a sentence.
- Front-load the distinguishing word: "Blood results" not "View the blood
  results".
- Do not stack three or more links in a row. That is a list or a navigation
  pattern.

## Known gaps

- **No hover colour that works in both modes.** Hover thickens the underline
  instead. A semantic `interactive/link-hover` would let the colour move; colour
  changes need sign-off.
- **Destructive is light-mode only.** `interactive/destructive` is a fill colour
  and sits at 2.84:1 as text on the dark page. Recorded as an open finding in
  `scripts/check-contrast.mjs` with the two options.
- **No visited state.** There is no token for it, and browsers apply their own on
  the web until there is.
- **The Figma set draws `Type=Destructive, Size=Large` in Heading XS** while
  `Type=Default, Size=Large` is Body M — same size, different weight, for no
  stated reason. Code uses Body M for both.
- No Blazor or MAUI implementation yet.

## Related

- [Button](../button/guidelines.md) — for actions
- [Breadcrumbs](../breadcrumbs/guidelines.md) — for going back up
- [Navigation](../navigation/guidelines.md) — for moving between product areas
