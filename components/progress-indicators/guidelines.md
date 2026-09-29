# Progress indicators

> Show how far through something the user is: one task finishing, a set of
> stages, or what has already happened to a record.

| | |
|---|---|
| **Type** | Component |
| **Status** | In review |
| **Reference** | [spec.md](spec.md) · `packages/web/src/progress-indicators/progress-indicators.css` · `packages/react/src/progress-indicators/` |
| **Figma** | Page `1736:12775` — samples in section `5529:44147` |
| **Related standards** | WCAG 2.2 AA · GDS "Task list" and NHS "Contents list" for the neighbouring patterns |
| **Last updated** | 2026-09 |

---

## When to use

- **Progress bar** — one task with a known or unknown end: a form filling in,
  an upload, a record saving.
- **Stepper** — a fixed sequence of stages the user works through in order:
  Patient → Triage → Clinical assessment → Review and submit.
- **Timeline** — what has already happened, with times: a referral's history,
  the events on an attendance.

## When not to use

- **For switching between views** of the same record. That is
  [tabs](../tabs/guidelines.md). A compact stepper looks like a tab strip, and
  is not one.
- **For a handful of independent tasks** that can be done in any order. That is
  a task list, not a stepper — a stepper implies an order.
- **For a count.** "3 referrals" is a [badge](../badge/guidelines.md).
- **For a status on its own.** "Awaiting review" is a [tag](../tags/guidelines.md).
- **When the wait is under a second.** A bar that flashes up and disappears is
  noise.

## How it works

- **A bar always says its number.** "65%" or "3/5" sits beside the bar. The
  segments are told apart by colour alone, so the number is what carries the
  meaning.
- **An unknown wait gets a caption.** The indeterminate bar moves until the task
  ends. The caption ("Saving record") says what is happening. With reduced
  motion switched on, the bar holds still.
- **One current step.** Exactly one step is current. Steps before it are done
  or have errors; steps after it are upcoming.
- **An error step says why.** A red marker is not enough. The step shows a
  short reason under its label: "2 fields missing".
- **Steps can link back.** A done step may link to its stage so the user can
  change an answer. Upcoming steps do not link.
- **A timeline is oldest first** and read-only. Every item has a time. Use
  "Now" for the item in progress and "—" for one that has not happened.

## Options

| Option | Use when |
|---|---|
| Progress bar — determinate | You know how much is done, as a percentage |
| Progress bar — segmented | The task is N sections, and you know how many are done |
| Progress bar — indeterminate | You cannot say how long it will take |
| Stepper — horizontal | Four to six short-named stages across the top of a flow |
| Stepper — vertical | Narrow side panels, or stages that need a line of description |
| Stepper — compact | The flow sits directly under a tab bar and needs tab-strip weight |
| Timeline | Showing events that have already happened, with their times |

## Do & don't

| Do | Don't |
|---|---|
| Show the number beside every determinate and segmented bar | Rely on the length of the fill alone |
| Give an error step a short reason | Show a red marker with no words |
| Keep step labels to one or two words | Put a sentence in a horizontal step |
| Use the compact stepper under a tab bar | Add a tick to a real tab to show it is "done" |
| Put the time on every timeline item | Mix future plans into a timeline of events |

## Accessibility

- **Bars are progress bars.** They have a name (the caption) and a value, and
  screen readers announce both. The segmented bar says "3 of 5 sections
  complete".
- **Steppers are ordered lists.** The current step is marked as the current
  step. Each step's state ("completed", "has errors", "not started") is read out
  after its label — the tick and the colour are hidden from screen readers.
- **Timeline times are machine-readable** dates, even when the screen says
  "Now".
- **Alert items are announced as alerts**, not only coloured red.
- **Known dark-mode gap.** The current step's blue label is about 2.1:1 on a
  dark card, below the 4.5:1 text needs. Tabs have the same problem. It is
  waiting on a token decision and tracked by `check:contrast`.

## Content

- Name stages as nouns: "Triage", not "Do triage".
- Keep step labels short enough to fit on one line in a horizontal stepper.
- Write error hints as the problem, in a few words: "2 fields missing".
- Write dates as `08-Apr-2024` and times as `15:30`.

## Related

- [Tabs](../tabs/guidelines.md) — switching between views
- [Tags](../tags/guidelines.md) — a status word
- [Buttons](../button/guidelines.md) — Back / Next / Submit in a stepped form

## Engineering

```html
<ol class="sr-stepper" aria-label="Referral progress">
  <li class="sr-stepper__step sr-stepper__step--done">…</li>
  <li class="sr-stepper__step sr-stepper__step--current" aria-current="step">…</li>
</ol>
```
