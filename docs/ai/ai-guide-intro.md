# Single Record Design System: guide for AI tools

You are helping someone build a prototype for the Single Record programme at
Digital Health and Care Wales (DHCW). Build it with the Single Record Design
System (SR). Do not invent your own colours, type, spacing or components.

This file is generated from the design system's source each time its website
is built. The version and date are at the top of the generated sections. If
something here disagrees with what you remember, this file wins.

## Hard rules

1. **Load the SR stylesheet and use its classes.** Every component below is
   already styled. Write the markup with the `sr-` classes shown. Do not
   restyle a component with your own CSS.
2. **Never hard-code a colour, size or font.** Use the CSS custom properties
   in "Tokens" (`var(--sr-color-text-primary)`, `var(--space-4)`). Your own
   layout CSS may use tokens only.
3. **Icons come from the SR icon set only**, by name, drawn at a 1px stroke.
   Do not draw your own SVG or use another icon library.
4. **Accessibility is not optional.** WCAG 2.2 AA is the minimum:
   - Every field has a visible label. Errors say what is wrong and how to fix it.
   - Colour is never the only signal.
   - Every control works with the keyboard and shows the SR focus ring.
   - Icon-only buttons have an accessible name (`aria-label="Scan wristband"`).
   - Tap targets are at least 44 by 44px on mobile.
5. **If a component you need is not listed, say so.** Compose it from listed
   components and tokens, and tell the user it is not part of SR yet. Do not
   present an invented component as an SR one.

## Setting up a prototype

Paste this into the `<head>` of an HTML page. Both files come from the public
npm release, through the jsDelivr CDN.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@dhcw/sr-web@{{VERSION}}/dist/single-record.css">
<!-- Dark mode (optional): load after, then set data-theme="dark" on <html> -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@dhcw/sr-web@{{VERSION}}/dist/single-record-dark.css">
```

Icons, as inline SVG:

```html
<span data-icon="nav/search"></span>
<script type="module">
  import { iconMarkup } from 'https://cdn.jsdelivr.net/npm/@dhcw/sr-icons@{{VERSION}}/build/icons.js';
  document.querySelectorAll('[data-icon]').forEach((el) => {
    el.innerHTML = iconMarkup(el.dataset.icon, { label: el.dataset.label });
  });
</script>
```

Roboto is embedded in the stylesheet, so no font link is needed.

In a React project with the packages installed, use the React components named
below (`import { Tabs } from '@dhcw/sr-react'`). In a single-file prototype,
use the HTML markup.

## Content rules

| Item | Write it as |
|---|---|
| Patient name | `SURNAME, Forename`: `ADAMS, Ruby` |
| Date | `3 Oct 2014`. Never `03/10/14` or a two-digit year |
| Date of birth | With age: `3 Oct 2014 (11 years)` |
| Time | 24-hour: `14:05` |
| NHS number | Groups of 3, 3 and 4: `496 806 8271` |
| Empty field | `Not recorded`, never a blank or a dash |
| Headings and buttons | Sentence case. Buttons say what happens: `Save referral`, not `OK` |
| Confirmations | Ask about the action: `Delete this record?`, never `Are you sure?` |

Write for clinical and admin staff. Use plain words, not design-system terms.
Use realistic but obviously made-up patient data. Never use real patient details.

## Patterns to follow

- **Patient search:** NHS or case number first, then name and date of birth.
  Always ask the user to confirm the patient before opening a record, even
  with one match.
- **Dialogs:** a modal for a decision. On mobile, a bottom sheet for hints and
  filters. A full page for long read-only content.
- **Counts on tabs:** see the Badge and Tabs entries. Say `3 new` when the
  number is not a total. Cap at `99+`.
