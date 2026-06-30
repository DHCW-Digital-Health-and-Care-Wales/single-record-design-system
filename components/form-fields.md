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

Every form field now exposes a boolean component property:

| Component set | Property | Default | Behaviour |
|---|---|---|---|
| Input | `Required` | `false` | Inline asterisk (`*` in `Status/Critical`) immediately after the label text. |
| Select | `Required` | `false` | As above. |
| Search | `Required` | `false` | Inline `*` after the label (when `Label=true`). |
| Checkbox | `Required` | `false` | Inline `*` after the **group legend** (shown only when `Legend=Shown`). |
| Radio | `Required` | `false` | Inline `*` after the **group legend** (shown only when `Legend=Shown`). |

The asterisk is **decorative only** — it does not replace `aria-required`. In code:

```html
<label for="nhs-number">NHS number <span class="asterisk" aria-hidden="true">*</span><span class="visually-hidden"> required</span></label>
<input id="nhs-number" required aria-required="true" />
```

For Radio and Checkbox the marker sits on the group `<legend>`, not the individual options:

```html
<fieldset>
  <legend>Preferred contact method <span class="asterisk" aria-hidden="true">*</span><span class="visually-hidden"> required</span></legend>
  ...
</fieldset>
```

The `visually-hidden` "required" span ensures screen-reader users get the same information sighted users get from the symbol. Do not rely on `*` alone.

---

## Search inputs

The in-form `Type=Search` variants previously in the Input component set have been **removed**. The Search component set (`1715:375`) is canonical and now carries its own form-field properties — no Input wrapper needed.

| Property on Search | Default | Behaviour |
|---|---|---|
| `Label` | `false` | Show label row above the input |
| `Hint` | `false` | Show hint row between label and input |
| `Required` | `false` | Inline `*` after the label (when `Label=true`) |

Toggle these on any Search variant (`Type=Basic`, `With Button`, `With Icon Button`, `Typeahead`). The existing `State=Error` variant still owns the inline error message.

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
- When a Typography guide page is next authored in Figma (via `use_figma`), make sure it reflects the post-DDR-005 sizes. (The old `typography-guide.html` static page that showed pre-DDR-005 sizes was removed on 2026-06-29.)
