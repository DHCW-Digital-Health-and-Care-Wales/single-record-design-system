# Guide for Engineers

How to consume and contribute to this design system as an engineer.

---

## Framework Support

The design system is **implementation-agnostic at the design level** — components and tokens are defined once and consumed per platform. Tokens are the contract; every framework binds to the same token names.

| Target | Status | How tokens are consumed |
|---|---|---|
| **Standard HTML / CSS** | Supported (reference baseline) | CSS custom properties (`var(--…)`). This is the canonical implementation — other web targets map onto it. |
| **Blazor / .NET** | Supported | CSS custom properties, scoped CSS, or component CSS isolation. |
| **React** | Supported | CSS custom properties via CSS Modules / plain CSS, or a CSS-in-JS theme object. |
| **.NET MAUI** | Supported | XAML `ResourceDictionary`. |
| **.NET Framework 4.8 (legacy web)** | Limited | CSS custom properties only — see *Legacy .NET Framework 4.8* below. |
| **Delphi (legacy desktop)** | Maintained, not extended | Manual colour/spacing values from the token tables; no automated binding. |

> If you are starting a **new** product surface, prefer standard semantic HTML + CSS custom properties (and React or Blazor on top). That path gets the full token set, focus rings, and accessibility behaviour for free.

---

## Getting Started

1. **Read `CLAUDE.md`** — project rules, conventions, and what not to do.
2. **Understand the token system** — all design values come from tokens. Start with `/foundations/tokens/`.
3. **Read the component spec** before implementing any component — `/components/{name}/spec.md`.
4. **Check the Figma library** for the current design. Access via the design lead.

---

## Token Consumption

Tokens are defined in `/foundations/tokens/` and mapped in `/figma/variable-mapping.md`.

### Standard HTML / CSS (reference baseline)

Define the tokens once as CSS custom properties, then reference them everywhere. This is the canonical web implementation — Blazor and React both build on it.

```css
:root {
  --color-interactive-primary: #0E4F97;
  --color-text-primary: #111827;
  --spacing-component-md: 1rem;
  /* etc. */
}

.button-primary {
  background-color: var(--color-interactive-primary);
  color: var(--color-interactive-primary-text);
  padding: var(--spacing-component-md);
}
```

Use native semantic elements (`<button>`, `<input>`, `<select>`, `<fieldset>`/`<legend>`) so accessibility and focus behaviour come for free — see *Semantic HTML* below.

### Web (Blazor)

Same CSS custom properties as above. Put the `:root` token block in a global stylesheet (e.g. `wwwroot/css/tokens.css`) and consume via scoped component CSS or CSS isolation (`Component.razor.css`). Do not hard-code hex values in components — always reference `var(--…)`.

### React

Consume the same CSS custom properties via CSS Modules or plain CSS:

```tsx
// Button.module.css uses the same :root tokens
import styles from "./Button.module.css";

export function Button({ children }: { children: React.ReactNode }) {
  return <button className={styles.buttonPrimary}>{children}</button>;
}
```

Or, if you use a CSS-in-JS / theme provider, build the theme object from the same token names so there is a single source of truth:

```ts
export const theme = {
  color: { interactivePrimary: "var(--color-interactive-primary)" },
  spacing: { componentMd: "var(--spacing-component-md)" },
};
```

Prefer binding to the CSS variables (not raw hex) so light/dark mode switching keeps working.

### .NET MAUI

Consume as XAML resource dictionary:

```xml
<Color x:Key="ColorInteractivePrimary">#0E4F97</Color>
<Color x:Key="ColorTextPrimary">#111827</Color>
```

Reference token names from `/figma/variable-mapping.md` (MAUI column).

### Legacy .NET Framework 4.8 (WebForms / older MVC)

Older Single Record web apps still run on .NET Framework 4.8. The design system **can** help these, but support is limited and pragmatic:

- **What works:** the visual layer. Drop the `:root` CSS custom-property block into a shared stylesheet and reference `var(--…)` from your existing markup. Colour, spacing, typography, and focus-ring tokens all apply with no framework upgrade.
- **What to expect:** you will not get the Blazor/React component models. Treat these apps as **token consumers only** — match colours, spacing, and focus styles to bring them visually in line, but don't expect drop-in components.
- **Priority order:** fix focus rings and colour-contrast first (accessibility), then spacing/typography. These give the biggest consistency win for the least effort.
- **IE / very old browsers:** CSS custom properties are unsupported in IE11. If an app must support IE11, fall back to the literal hex/px values in `/figma/variable-mapping.md` rather than `var(--…)`.

If you maintain a 4.8 app and aren't sure whether a given component is feasible, raise it — see *Raising Issues*. It's better to scope realistically than to half-implement.

### Token source of truth

Until a token build pipeline is implemented, `/figma/variable-mapping.md` is the authoritative mapping. Keep it updated when tokens change.

---

## Implementing a Component

1. Read the spec at `/components/{name}/spec.md` fully before writing code.
2. Implement all states specified — do not skip hover, focus, disabled, or loading.
3. Apply the focus ring exactly as specified in `/accessibility/focus-management.md`.
4. Implement ARIA attributes as described in the spec's accessibility section.
5. Test with keyboard — tab to the component, interact with keyboard only.
6. Test with a screen reader (NVDA + Chrome minimum).
7. Run a contrast check on the rendered output.

---

## Accessibility Implementation Checklist

For every component or feature:

- [ ] All interactive elements have accessible names
- [ ] Focus ring is visible and uses the correct token values
- [ ] Tab order is logical and matches visual order
- [ ] `aria-invalid`, `aria-describedby`, and `aria-label` applied where specified
- [ ] Keyboard interaction matches spec
- [ ] `prefers-reduced-motion` respected — see `/foundations/tokens/motion.md`
- [ ] Minimum touch target: 44×44px (WCAG 2.2 SC 2.5.8)
- [ ] Screen reader testing completed

---

## Focus Ring Implementation

All interactive elements:

```css
:focus-visible {
  outline: 3px solid var(--color-interactive-focus);
  outline-offset: 2px;
  box-shadow: 0 0 0 2px var(--color-interactive-focus-inner);
}
```

Do not override this without a documented reason. Do not use `outline: none`.

---

## Semantic HTML

- Use native HTML elements where possible: `<button>`, `<a>`, `<input>`, `<select>`, `<details>`.
- Only use ARIA to extend semantics — do not use ARIA to repair broken HTML structure.
- `role="button"` on a `<div>` is wrong. Use `<button>`.

---

## Raising Issues

If a spec is unclear, missing states, or technically infeasible — raise it before implementing a workaround. Update the spec as part of the resolution.

If you find an accessibility issue in an existing component — raise it immediately. Do not ship with known accessibility failures.

---

## Contributing to the Design System

To add or modify a component:
1. Discuss with design lead
2. Update or create the spec in `/components/{name}/spec.md`
3. Write a DDR if the change is non-trivial
4. Update the component catalogue in `/components/README.md`
5. Commit with the appropriate commit convention (see `CLAUDE.md`)
