# Notification banner

**Status:** Shipped — `.sr-notification-banner` in `@dhcw/sr-web`, `NotificationBanner` in `@dhcw/sr-react`
**Last updated:** 2026-09-22

---

## Purpose

Reports that something happened — an event the reader did not ask about, or a
state change the page cannot show on its own.

> **Inset text is part of the page. A banner is an event.**

---

## Variants

Matches the merged Figma set `Notification Banner` (`2561:21695`), which
replaced two incomplete sets on 2026-09-21 (DDR-032).

| Property | Kind | Values | Class |
|---|---|---|---|
| Severity | Variant | Information · Success · Warning · Error | `--information` `--success` `--warning` `--error` |
| Placement | Variant | Inline · Global | `--global` |
| Title | Boolean | default **on** in Figma, omitted in code unless passed | `__title` present |
| Dismissible | Boolean | default off | `__dismiss` present |
| Actions | Boolean | default off | `__actions` present |

4 × 2 = **8 variants**, plus three booleans. As variants the booleans would
have made 32.

**There is no Critical severity.** It was merged into Error: both rendered red,
and a patient-safety alert that must outrank an error needs more than a shade.

---

## Anatomy

```
┌────────────────────────────────────────────────┐
│ (i)  Title                                 [×] │
│      Body text explaining what happened.       │
│      [ Action ] [ Action ]                     │
└────────────────────────────────────────────────┘
```

| Part | Class |
|---|---|
| Root | `.sr-notification-banner` |
| Severity icon (required) | `.sr-notification-banner__icon` — `status/info`, `status/success`, `status/warning`, `status/error-circle`. React draws it from `severity`. Figma's Error variants use `status/info`; code does not follow that (DDR-029) |
| Content column | `.sr-notification-banner__content` |
| Title | `.sr-notification-banner__title` |
| Body | `.sr-notification-banner__body` |
| Action row | `.sr-notification-banner__actions` |
| Dismiss | `.sr-notification-banner__dismiss` |

---

## Tokens

| Severity | Surface | Border / icon |
|---|---|---|
| Information | `status.info-surface` | `status.info` |
| Success | `status.success-surface` | `status.success` |
| Warning | `status.warning-surface` | `status.warning` |
| Error | `status.error-surface` | `status.error` |

`status.error` is the token formerly named `status.critical` (DDR-034);
`--sr-color-status-critical` still resolves as a deprecated alias.

### Text on a status surface takes the severity colour, not `text/primary`

This is forced, not a style choice, and it is worth knowing before anyone
"fixes" it.

The status **surfaces stay light in dark mode** — banners switch to light fills
so they stay legible against the bright status colour. `text/primary`, however,
flips to white. Neutral dark text on a status surface is therefore
**1.04–1.10:1 in dark mode**, and **no neutral semantic token stays dark in
both modes**: `text/primary` and `text/inverse` are exact opposites of each
other, and `text/secondary` flips too.

The mode-stable colours are the status colours themselves, so title and body
take them and differ by weight. `tags.css` reached the same answer for its
status variant — this follows that precedent rather than inventing a token.

**Warning is the exception within the exception.** `status.warning` is
Yellow/500, a fill colour at 1.49:1 on its own surface (an accepted exception
in `check:contrast`) and must never carry text. Warning text takes
`--color-yellow-700`, whose own token description reads *"Warning banner/pill
text colour"* — it exists for this.

> **Figma draws the banner body as `Text/Primary`.** That has the dark-mode bug
> latent in it; the Figma file is light-mode only, so nobody had seen it. It was
> caught by `check:contrast` on the first run of these pairs, while this
> component was being written.

---

## Placement

| | Inline | Global |
|---|---|---|
| Scope | One thing on the page | The whole page or system |
| Position | In the content column, in the flow | Full width at the top, under the header |
| Corners | `--radius-md` | Square (`border-radius: 0`) |
| Border | All four sides | Bottom rule only |

The corners follow from the position, not from a separate style choice: a
radius on something that meets the viewport edges leaves four notches against
the browser chrome.

---

## Behaviour and accessibility

- **`role="alert"` for Error and Warning** (assertive), **`role="status"` for
  Information and Success** (polite). The React component picks this from
  `severity` and allows an explicit override.
- **A banner rendered on page load is not reliably announced** — a live region
  must exist before its content arrives. A message that matters on load belongs
  in the heading structure or the error summary as well.
- Severity is never colour alone (SC 1.4.1) — the icon and the wording carry it.
- The dismiss control is a real `<button>` with an accessible name and a visible
  focus ring.
- **Never dismissible when the banner is the only record of the problem.**

---

## Related

- [Inset text](../inset-text/spec.md) — emphasis that is part of the page
- [Form fields](../form-fields.md) — a message about one field
- Error summary — the form-level counterpart. **Still unbuilt**
