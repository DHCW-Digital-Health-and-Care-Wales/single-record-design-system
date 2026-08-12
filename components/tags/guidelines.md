# Tags

> A small pill that labels something — its status, its category, or how many of it there are.

| | |
|---|---|
| **Type** | Component |
| **Status** | Live |
| **Reference** | [spec.md](spec.md) · `packages/web/src/tags/tags.css` |
| **Figma** | Tags/status `399:7984` · Tags/filter `3229:71674` · Tags/count `3504:12900` |
| **Related standards** | NHS England tag · GDS tag |
| **Last updated** | 2026-08 |

---

## When to use

- **Labelling state** on a row, card or record — "Pending", "Sent", "Overdue".
- **Showing which filters are applied**, where each one can be removed.
- **Carrying a count** beside a heading or a navigation item — how many items are waiting.

## When not to use

- **As a button.** A tag is a label, not a control. The filter type has a close button inside it, but the tag itself is still not clickable — if the whole thing should do something, use a Button.
- **For long text.** A tag holds one or two words. If it needs a sentence, it is body text.
- **As the only signal for something clinically important.** Colour and a short word cannot carry a warning on their own — put the meaning in the surrounding content and let the tag summarise it.

---

## How it works

Three variants. They share one colour vocabulary, so a green tag means the same thing whichever shape it takes.

- **Status** — a filled pill. The default, and the one to reach for.
- **Filter** — an outlined pill with a close button, for a filter the user can remove.
- **Count** — a 24px disc holding a number.

**Colour is a secondary signal.** The text carries the meaning in every case; the colour only reinforces it. "Overdue" in red is legible to someone who cannot see it is red, because it says "Overdue".

**Sentence case, no full stop.** "Awaiting approval", not "AWAITING APPROVAL" or "Awaiting approval.".

---

## Options

| Variant | Types | Sizes | Use when |
|---|---|---|---|
| `status` | Blue, Green, Red, Yellow, Grey, Outline | Default 24px · Small 16px | Labelling what something is or where it has got to |
| `filter` | Blue, Green, Red, Yellow, Black | Default 24px · Small 16px | Showing an applied filter the user can remove |
| `count` | Blue, Green, Red, Yellow, Grey, Outline, Dark blue | 24px disc only | Showing how many |

### Choosing a colour

| Type | Means |
|---|---|
| Blue | Informational, in progress, neutral state |
| Green | Complete, approved, within range |
| Red | Needs attention, overdue, outside range |
| Yellow | Waiting, provisional, needs checking |
| Grey | Inactive, archived, not applicable |
| Outline | No state at all — a category or a plain label |

**Dark blue is count-only, and it is for one thing per screen** — the single total the screen is about. If two counts on a screen are dark blue, neither reads as primary.

### Counts

A count is a circle, which holds two digits. Past that the React component switches it to a pill (`sr-tag--wide`) rather than clipping the number. If your counts routinely run into three digits, consider whether a number beside a label reads better than a badge.

Digits use tabular figures, so a column of counts lines up.

---

## Do & don't

| Do | Don't |
|---|---|
| Keep the label to one or two words | Write a sentence inside a tag |
| Let the text carry the meaning, with colour reinforcing it | Use colour as the only difference between two states |
| Use one dark-blue count per screen at most | Make every count dark blue because it looks stronger |
| Give the filter close button a specific name — "Remove Ward: Aneurin" | Leave the close button labelled "Remove" with no object |
| Use Grey or Outline where there is no state to report | Reach for Red because it stands out |

---

## Accessibility

- **The close button on a filter tag is the only interactive part**, and it needs a name that says what it removes. `closeLabel="Remove Ward: Aneurin"` reads usefully; a bare "Remove" does not tell a screen-reader user which of six filters they are about to clear.
- **Every colour pairing meets WCAG 2.2 AA at 4.5:1**, including all seven count types. Verified against the tokens rather than assumed.
- **A tag is not announced as a status by default.** If a tag's value changes in response to something the user did and they need to know, the surrounding region needs `aria-live` — the tag alone will not announce itself.
- **The Outline count's border is a container edge, not a control boundary**, and sits below 3:1 against white by design. The number inside it carries the contrast.
- Tags are inline text-sized elements, so they scale with the page. Nothing here uses a fixed height that would clip at 200% zoom, apart from the count disc, which grows with its text.

---

## Content

- Sentence case. No terminal full stop.
- Prefer the clinical or administrative term staff already use over a design-system word — "Awaiting validation", not "Pending review", if that is what the service calls it.
- A count is a number on its own. No "items", no "×".

---

## Frameworks

| Framework | Status | Where |
|---|---|---|
| Web (HTML/CSS) | Live | `packages/web/src/tags/tags.css` |
| React | Live | `packages/react/src/tags/Tag.jsx` |
| Blazor / .NET | Not built | — |
| .NET MAUI | Style layer | `TagInfo` / `TagSuccess` / `TagWarning` / `TagCritical` in `Styles.xaml` |
| Legacy (.NET 4.8 / Delphi) | Tokens only | token CSS custom properties |

---

## Related

- **[Patient Banner](../patient-banner/guidelines.md)** — uses status colours for its alert cards, at a larger scale than a tag.
- **Status indicator** — a filled icon badge (tick, cross, exclamation) rather than a labelled pill. Separate component by decision, see DDR-013.
- **NHS England Tag** and **GDS Tag** — the same idea; ours adds the filter and count variants and the Welsh-language considerations.
