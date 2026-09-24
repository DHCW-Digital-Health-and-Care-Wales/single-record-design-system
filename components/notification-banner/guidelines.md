# Notification banner

> Tells the reader that something happened — a save succeeded, a record is
> locked, the service goes down at 2am.

| | |
|---|---|
| **Type** | Component |
| **Status** | In review |
| **Reference** | [spec.md](spec.md) · `packages/web/src/notification-banner/notification-banner.css` · `packages/react/src/notification-banner/NotificationBanner.jsx` |
| **Figma** | Notification Banner (`2561:21695`) on page `2561:21736` |
| **Related standards** | GDS "Notification banner" · NHS England "Warning callout" · WCAG 2.2 AA |
| **Last updated** | 2026-09 |

---

## When to use

- **Something happened that the reader did not ask about.** The record was
  updated by someone else. The connection dropped. A background job finished.
- **A state changed and the page cannot show it on its own** — this record is
  now read-only, this service is degraded.
- **A message about the whole page or the whole system**, which is what
  `Placement=Global` is for.

## When not to use

- **Emphasis the page author typed.** That is
  [inset text](../inset-text/guidelines.md). The line to hold is:

  > **Inset text is part of the page. A banner is an event.**

- **A problem with one form field.** That is the field's own error message,
  attached by `aria-describedby` — see [form fields](../form-fields.md).
- **A problem with the form as a whole.** That is the error summary pattern,
  which focuses on render and links to each field. A banner is not interactive
  in that way and does not move focus into anything.
- **A decision the user must make before continuing.** That is a
  [modal](../modal/spec.md). A banner never blocks.
- **A clinical alert that must outrank an error.** There is no severity above
  Error, deliberately. Something that must outrank an error needs more than a
  darker red — a different icon, a different weight, an interaction that cannot
  be dismissed — and that is its own decision (DDR-032).

## How it works

### Severity — what kind of event

| Severity | Use for |
|---|---|
| Information | Something the reader should know, with no problem attached |
| Success | An action completed |
| Warning | Something needs attention but nothing has failed |
| Error | Something failed, or is blocked |

Four severities, matching the four `status/*` token pairs.

### Placement — what the event is about

| | Inline | Global |
|---|---|---|
| Scope | One thing on the page — this form, this table, this record | The whole page, or the whole system |
| Position | In the content column, in the flow | Full width at the top, under the header |
| Corners | `--radius-md` | Square |

The corners follow from the position rather than being a separate choice.
Inline sits *in* the content column and takes the same radius as everything
else there; Global spans the viewport edge to edge, where a radius would leave
four notches against the browser chrome.

The test when placing one: *could the reader act on this without leaving the
page?* "You have unsaved changes on this form" is Inline. "The record service is
unavailable" is Global.

### Title, Dismissible and Actions are optional

All three are off by default, and a banner with none of them — an icon and one
line — is the common case. Every live banner in the Figma file is title-less.

- **Never make a banner dismissible when it is the only record of the problem.**
  If dismissing it loses the information, it is not dismissible.
- **Actions belong in the banner only when they resolve the event it reports.**
  "Retry", "Refresh", "Request access". Not general navigation.

## Accessibility

- **Error and Warning announce assertively** (`role="alert"`); Information and
  Success announce politely (`role="status"`). An error that waits for a pause
  is an error the reader acts too late on; a success that interrupts is rude.
- **A banner present on page load is not announced by `role="status"`** in most
  screen readers — the live region has to exist before the content arrives. If
  the message matters on load, it needs to be in the page's heading structure
  or the error summary, not only in a banner.
- **Severity is never carried by colour alone.** The icon and the wording carry
  it. `Status/Warning` is Yellow/500 at 1.49:1 on its own surface — a fill
  colour, never a text colour, which is why the warning title uses body text
  rather than the status colour.
- **The dismiss button needs a real accessible name** — "Dismiss", or better,
  what is being dismissed.
- **Do not stack banners.** Two at once means neither is read.

## Content

- **Say what happened, then what to do.** "The record could not be saved due to
  a connection problem. Your changes are preserved — try again."
- **Reassure before explaining** on an error. What happened to the data is the
  first thing the reader needs.
- **Never blame the reader** for a system failure.
- Keep it to one or two sentences. A banner that needs a paragraph is a page.

## Related

- [Inset text](../inset-text/guidelines.md) — emphasis that is part of the page
- [Form fields](../form-fields.md) — a message about one field
- [Modal](../modal/spec.md) — when the reader must decide before continuing

## Engineering

```html
<div class="sr-notification-banner sr-notification-banner--error" role="alert">
  <span class="sr-notification-banner__icon" aria-hidden="true">…</span>
  <div class="sr-notification-banner__content">
    <p class="sr-notification-banner__body">
      The record could not be saved due to a connection problem. Your changes
      are preserved — try again.
    </p>
  </div>
</div>
```

```jsx
<NotificationBanner severity="error" icon={<Icon name="status/error-circle" />}>
  The record could not be saved due to a connection problem.
</NotificationBanner>

<NotificationBanner severity="information" placement="global" onDismiss={close}>
  This is a read-only view.
</NotificationBanner>
```
