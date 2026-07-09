# Typography

> How we size, weight and space text so clinical information is clear, scannable
> and legible for everyone — on any Single Record product.

| | |
|---|---|
| **Type** | Foundation |
| **Status** | Approved (scale governed by DDR-005) |
| **Reference** | [`typography.md`](./typography.md) (token reference) · [`primitives/typography.json`](./primitives/typography.json) · [`semantic/typography.json`](./semantic/typography.json) |
| **Figma** | Foundations → Typography (Single Record library) · usage-notes panel format per node `3446:8762` |
| **Related standards** | GDS / NHS England typography · DHCW UI Standards [p.14](../../docs/reference/dhcw-ui-standards-v1.3.md#page-14), [p.63](../../docs/reference/dhcw-ui-standards-v1.3.md#page-63) |
| **Last updated** | 2026-07 |

---

## When to use

Every product screen. Use the **semantic text styles** (`sr.typography.*`) for all
text — headings, body, labels, captions. Pick the style by the text's *role*, not
by how big you want it to look:

- **Headings** (`heading-xl` → `heading-xs`) — page and section titles, in order.
  Don't skip levels to get a size; the visual step and the heading level move together.
- **Body M** (16/24) — the default for reading content and clinical notes.
- **Body S** (14/20) — supporting/secondary text, and form-field values/placeholders.
- **Label** (14/20 Medium) — form labels, table column headers, UI controls.
- **Caption** (12/16) — hints, timestamps, metadata.

## When not to use

- **Don't hardcode font values** in a component. If a size/weight you need isn't in
  the scale, that's a token decision (DDR + sign-off), not a local override.
- **Don't reach for Caption (12px) to fit more in.** If content doesn't fit, fix the
  layout — shrinking essential clinical text below Body S is not the answer.
- **Don't use Body S for primary clinical content.** It's for supporting text only.

## How it works

- **One typeface — Roboto**, with `Arial, sans-serif` as the system fallback.
  Weights: Regular 400 (body/caption), Medium 500 (labels/column headers), Bold 700
  (headings). No other families or weights.
- **Responsive by token, not by breakpoint hacks.** Each style carries a desktop and
  a mobile size; the build emits `.sr-type-*` utilities that shift automatically at
  ≥1024px (DDR-011). Use those utilities / semantic styles — never per-viewport
  hardcoded sizes.
- **Everything sits on the 4px line-height grid** (DDR-001/DDR-005) so vertical
  rhythm stays consistent when you mix headings, body and components.
- **Size expresses hierarchy; also vary weight/spacing** — never rely on colour alone
  to separate one style from another.
- **Relative units, so text can zoom.** Type must scale with the user's browser/OS
  settings; a carried-forward requirement from the DHCW standards ([p.14](../../docs/reference/dhcw-ui-standards-v1.3.md#page-14)).

## Options

| Style | Desktop | Mobile | Weight | Use when |
|---|---|---|---|---|
| `heading-xl` | 36/44 | 28/36 | Bold | Page title (one per page) |
| `heading-l` | 28/36 | 24/32 | Bold | Major section |
| `heading-m` | 24/32 | 20/28 | Bold | Sub-section |
| `heading-s` | 20/28 | 18/24 | Bold | Card / group heading |
| `heading-xs` | 16/24 | 16/24 | Bold | Smallest heading |
| `body-m` | 16/24 | 16/24 | Regular | **Default body / clinical content** |
| `body-s` | 14/20 | 14/20 | Regular | Supporting text, form values/placeholders |
| `label` | 14/20 | 14/20 | Medium | Form labels, column headers |
| `caption` | 12/16 | 12/16 | Regular | Hints, timestamps, metadata |

Full values, letter-spacing and the form-field pairing: [`typography.md`](./typography.md).

## Do & don't

| Do | Don't |
|---|---|
| Use semantic styles chosen by role | Pick a heading level for its size |
| Keep body text at **Body M (16px) minimum** for clinical content | Drop essential text to Caption to save space |
| Constrain reading width to **60–80 characters** | Let body text run the full screen width |
| Let text resize to 200% without loss (WCAG 1.4.4) | Fix pixel heights that clip zoomed text |
| Use weight/size together for emphasis | Use colour alone to distinguish styles |

## Accessibility

- **Body M (16px) is the minimum** for primary clinical content (WCAG 2.2 + NHS
  guidance). Body S (14px) is supporting-only; Caption (12px) never carries essential
  meaning without a visible alternative.
- **Resize to 200%** with no loss of content or function (WCAG 1.4.4); reflow at 400%
  (1.4.10) — never suppress zoom.
- **Text spacing** (WCAG 1.4.12): the scale tolerates user overrides — body line
  heights are ≥ 1.5; the largest heading is 1.22.
- **Measure:** hold body text to 60–80 characters via layout, not type tokens.
- Don't convey meaning by **colour or weight alone**.

## Content

- **Sentence case everywhere** — "Senior responsible clinician", not "Senior
  Responsible Clinician" (DHCW standard [p.9](../../docs/reference/dhcw-ui-standards-v1.3.md#page-9)).
- Avoid abbreviations; where unavoidable, provide the full term (tooltip) — a content
  rule, not a type rule ([p.10](../../docs/reference/dhcw-ui-standards-v1.3.md#page-10)).
- Follow the DHCW terminology table for preferred wording ([p.67–69](../../docs/reference/dhcw-ui-standards-v1.3.md#page-67)).

## Frameworks

| Framework | Status | Where |
|---|---|---|
| Web (HTML/CSS) | Reference baseline | `@dhcw/sr-tokens` → `build/css/typography.css` (`.sr-type-*` utilities) |
| React | Current | consumes the same `typography.css` (`@dhcw/sr-web`) |
| Blazor / .NET | Current | same token CSS served via the RCL |
| .NET MAUI | Current | XAML type styles from the token build; `OnIdiom` for form factor |
| Legacy (.NET 4.8 / Delphi) | Tokens only / best-effort | CSS custom properties — visual layer only |

> The new Single Record app is likely React; Web (HTML/CSS) remains the
> lowest-common-denominator reference all products can lean on. Per-framework detail:
> [`docs/for-engineers.md`](../../docs/for-engineers.md).

## Clinical / DHCW notes

The legacy DHCW UI Standards specify Roboto at `1rem`/weight 300 with question
labels at `0.8rem` for desktop eForm PDFs ([p.63](../../docs/reference/dhcw-ui-standards-v1.3.md#page-63),
[p.71](../../docs/reference/dhcw-ui-standards-v1.3.md#page-71)). Those specific
sizes/weights are **superseded by our tokens** (`TOKEN` disposition). What we
**carry forward** is the *intent*: Roboto family, relative/zoomable sizing, generous
line spacing for legibility, and a clear visual step between question and answer.

## Related

- [`typography.md`](./typography.md) — token reference (source of truth for values)
- [DDR-005](../../decisions/DDR-005-typography-scale-cleanup.md) — the scale · [DDR-011](../../decisions/DDR-011-desktop-mobile-form-factor-model.md) — responsive model
- [`components/form-fields.md`](../../components/form-fields.md) — the denser form-field type pairing
- GDS / NHS England typography (pattern references)
</content>
