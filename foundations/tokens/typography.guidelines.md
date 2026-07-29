# Typography

> How we size, weight and space text so clinical information is clear, scannable
> and legible for everyone, on any Single Record product.

| | |
|---|---|
| **Type** | Foundation |
| **Status** | Approved (scale governed by DDR-005) |
| **Reference** | [`typography.md`](./typography.md) (token reference) · [`primitives/typography.json`](./primitives/typography.json) · [`semantic/typography.json`](./semantic/typography.json) |
| **Figma** | Foundations page Typography (`12:3378`); guidelines panel `Guidelines/Typography` (`3460:20`), format per `3446:8762` |
| **Related standards** | GDS / NHS England typography · DHCW UI Standards [p.14](../../docs/reference/dhcw-ui-standards-v1.3.md#page-14), [p.63](../../docs/reference/dhcw-ui-standards-v1.3.md#page-63) |
| **Last updated** | 2026-07 |

> **Design-language note (deliberate divergence).** This is a clinical, table and
> data heavy system, so the primary-content minimum is **Body S (14px)**, not the
> 16px that public-facing NHS/GDS guidance defaults to. This stays WCAG 2.2 AA: there
> is no minimum font-size success criterion, and resize-to-200% (1.4.4), reflow
> (1.4.10) and AA contrast (1.4.3) are all still met. Prefer Body M (16px) for
> long-form reading and clinical notes.

---

## When to use

- Use the semantic text styles (`sr.typography.*`) on every screen.
- Choose by role: heading, body, label or caption, not by the size you want.
- Keep headings in order; do not skip levels to reach a size.

## When not to use

- Do not hardcode font values in a component. If a size or weight you need is not in
  the scale, that is a token decision (DDR plus sign-off), not a local override.
- Do not use Caption (12px) to fit more in. If content does not fit, fix the layout.
- Do not use a heading style purely for its size on non-heading text.

## Type scale

- Desktop headings XL to XS: 36 / 28 / 24 / 20 / 16.
- Body M 16, Body S 14, Label 14 (Medium), Caption 12.
- Mobile shifts the top steps down one; all line-heights sit on the 4px grid (DDR-001, DDR-005).

| Style | Desktop | Mobile | Weight | Use when |
|---|---|---|---|---|
| `heading-xl` | 36/44 | 28/36 | Bold | Page title (one per page) |
| `heading-l` | 28/36 | 24/32 | Bold | Major section |
| `heading-m` | 24/32 | 20/28 | Bold | Sub-section |
| `heading-s` | 20/28 | 18/24 | Bold | Card / group heading |
| `heading-xs` | 16/24 | 16/24 | Medium | Smallest heading |
| `body-m` | 16/24 | 16/24 | Regular | Long-form reading, clinical notes |
| `body-s` | 14/20 | 14/20 | Regular | **Primary content in tables and data-dense views**, supporting text, form values |
| `label` | 14/20 | 14/20 | Medium | Form labels, column headers |
| `caption` | 12/16 | 12/16 | Regular | Hints, timestamps, metadata |

Full values and letter-spacing: [`typography.md`](./typography.md).

## Typeface and weight

- Roboto, with Arial as the system fallback.
- Regular 400 for body and caption.
- Medium 500 for labels and table column headers.
- Bold 700 for headings.
- No other families or weights.

## Minimum size (data-dense)

- Body S (14px) is the minimum for primary content, including tables and data-dense views.
- Body M (16px) is preferred for long-form reading and clinical notes.
- Caption (12px) is non-essential text only; never the sole carrier of meaning.
- Type must use relative units so it scales with the user's browser or OS settings,
  a carried-forward requirement from the DHCW standards ([p.14](../../docs/reference/dhcw-ui-standards-v1.3.md#page-14)).

## Responsive behaviour

- Use the `.sr-type-*` utilities or the semantic styles.
- They shift desktop to mobile automatically at 1024px and above (DDR-011).
- Never hardcode per-viewport sizes.

## Hierarchy and emphasis

- Size expresses hierarchy; reinforce it with weight and spacing.
- Never separate one style from another by colour alone.

## Do and don't

| Do | Don't |
|---|---|
| Use semantic styles chosen by role | Pick a heading style for its size |
| Keep primary content at Body S (14px) or larger | Drop essential text to Caption to save space |
| Constrain reading width to 60 to 80 characters | Let body text run the full screen width |
| Let text resize to 200% without loss | Fix pixel heights that clip zoomed text |
| Use weight and size together for emphasis | Use colour alone to distinguish styles |

## Accessibility

- Primary-content minimum is Body S (14px); this meets WCAG 2.2 AA (no minimum
  font-size criterion exists). Caption (12px) never carries essential meaning alone.
- Text must resize to 200% (1.4.4) and reflow at 400% (1.4.10) with no loss of content
  or function. Never suppress zoom.
- Text spacing (1.4.12): the scale tolerates user overrides. Body line heights are at
  or above 1.5; the largest heading is 1.22.
- Meet WCAG 2.2 AA contrast (1.4.3) for every text style.
- Hold body line length to 60 to 80 characters through layout, not type tokens.
- Do not convey meaning by colour or weight alone.

## Content and casing

- Sentence case everywhere, for example "Senior responsible clinician", not "Senior
  Responsible Clinician" (DHCW standard [p.9](../../docs/reference/dhcw-ui-standards-v1.3.md#page-9)).
- Avoid abbreviations; where unavoidable, show the full term on hover
  ([p.10](../../docs/reference/dhcw-ui-standards-v1.3.md#page-10)).
- Follow the DHCW terminology list for preferred wording
  ([p.67 to 69](../../docs/reference/dhcw-ui-standards-v1.3.md#page-67)).

## Frameworks

| Framework | Status | Where |
|---|---|---|
| Web (HTML/CSS) | Reference baseline | `@dhcw/sr-tokens` build/css/typography.css (`.sr-type-*` utilities) |
| React | Current | consumes the same typography.css (`@dhcw/sr-web`) |
| Blazor / .NET | Current | same token CSS served via the RCL |
| .NET MAUI | Current | XAML type styles from the token build; `OnIdiom` for form factor |
| Legacy (.NET 4.8 / Delphi) | Tokens only / best-effort | CSS custom properties, visual layer only |

> The new Single Record app is likely React; Web (HTML/CSS) remains the
> lowest-common-denominator reference all products can lean on. Per-framework detail:
> [`docs/for-engineers.md`](../../docs/for-engineers.md).

## Clinical / DHCW notes

The legacy DHCW UI Standards specify Roboto at `1rem` weight 300 with question labels
at `0.8rem` for desktop eForm PDFs ([p.63](../../docs/reference/dhcw-ui-standards-v1.3.md#page-63),
[p.71](../../docs/reference/dhcw-ui-standards-v1.3.md#page-71)). Those specific sizes and
weights are superseded by our tokens (`TOKEN` disposition). What we carry forward is the
intent: Roboto family, relative and zoomable sizing, generous line spacing for
legibility, and a clear visual step between question and answer.

## Related

- [`typography.md`](./typography.md), token reference (source of truth for values)
- [DDR-005](../../decisions/DDR-005-typography-scale-cleanup.md), the scale · [DDR-011](../../decisions/DDR-011-desktop-mobile-form-factor-model.md), responsive model
- [`components/form-fields.md`](../../components/form-fields.md), the denser form-field type pairing
- GDS / NHS England typography (pattern references)
</content>
