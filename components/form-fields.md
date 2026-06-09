# Form Fields — Typography & Behaviour

**Status:** Applied across Input, Select, Radio, Checkbox in Figma (2026-06-04)

This page captures the cross-cutting typography and behaviour rules that apply to every form field. It is the canonical source for the form-field scale — individual component specs reference it rather than restate it.

---

## Typography scale (form fields)

Single Record uses a denser scale than the full body-text scale, because clinical UI typically packs multiple fields per row.

| Slot | Style | Size |
|---|---|---|
| Label, Legend | `SR Typography/Desktop/Label` | 14 / 20 Medium |
| Value, Placeholder, Option text (radio/checkbox/select option) | `SR Typography/Desktop/Body S` | 14 / 20 Regular |
| Hint, Description, Error message | `SR Typography/Desktop/Caption` | 12 / 16 Regular |

Applied in: Input (45 variants), Select (9), Select Building Blocks (4), Select Option Items (2), Radio (21), Radio Templates (12), Checkbox Building Blocks (11), Checkbox Templates (12).

> The full **body** scale (Body M 16, Body S 14) still applies in prose, clinical notes, and summary content. Form-field text is denser by design.

---

## Required marker

Input and Select both expose a boolean component property:

| Property | Default | Behaviour |
|---|---|---|
| `Required` | `false` | When `true`, an inline asterisk (`*` in `Status/Critical`) appears immediately after the label/legend text. |

The asterisk is **decorative only** — it does not replace `aria-required`. In code:

```html
<label for="nhs-number">NHS number <span class="asterisk" aria-hidden="true">*</span><span class="visually-hidden"> required</span></label>
<input id="nhs-number" required aria-required="true" />
```

The `visually-hidden` "required" span ensures screen-reader users get the same information sighted users get from the symbol. Do not rely on `*` alone.

Radio and Checkbox individual items do not carry `Required` — the marker belongs on the group legend, which is composed at form-field level.

---

## Search inputs

The in-form `Type=Search` variants previously in the Input component set have been **removed**.

| Need | Use |
|---|---|
| Search input anywhere | `Search` component set (`1715:375`) |
| Search input that needs a labelled form field with hint and error message | Wrap a `Search` instance with a label row and hint/error row using the same vertical layout as Input. |

A reusable "Form Field" wrapper component is a candidate for a future addition; until then, compose manually.

---

## Textarea (multi-line input)

Input now includes `Type=Textarea` variants:

| Variant | State |
|---|---|
| `Type=Textarea, State=Default, Label=Shown, Hint=Hidden` | Default |
| `Type=Textarea, State=Focus, Label=Shown, Hint=Hidden` | Focus |
| `Type=Textarea, State=Error, Label=Shown, Hint=Hidden` | Error |
| `Type=Textarea, State=Disabled, Label=Shown, Hint=Hidden` | Disabled |

Default minimum height: **120px**. Text is top-aligned. In implementation, allow vertical resize by the user (`resize: vertical`) — never horizontal.

For long-form content (clinical notes ≥ 500 characters), prefer a dedicated note-taking pattern rather than a single Textarea.

---

## Open follow-ups

- Build a **Form Field** wrapper component that composes a Search / DatePicker / custom input with the label / hint / error rows used by Input — currently composed manually.
- Add `Hint=Shown` and `Label=Hidden` permutations to Textarea — currently only Hint=Hidden / Label=Shown variants exist (4 of a potential 16).
- The `typography-guide.html` static page still shows pre-DDR-005 sizes. Regenerate when a typography-guide generator is in place.
