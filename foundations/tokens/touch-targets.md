# Touch Target Tokens

Token source: `foundations/tokens/touch-targets.json`  
Figma: `Primitives` collection (global), `Single Record` collection (semantic)

---

## The key fact

**44×44px is WCAG 2.2 Level AAA (SC 2.5.5), not AA.**

The WCAG 2.2 Level AA requirement is SC 2.5.8 (Target Size, Minimum): **24×24 CSS pixels**, with an option to satisfy this via the spacing exception rather than target size alone.

This distinction matters for a dense clinical EPR — 44px applied uniformly to every interactive element in a data grid is impractical. A tiered approach satisfies AA compliance whilst remaining usable.

---

## Token tiers

| Token | Value | Platform | WCAG | When to use |
|---|---|---|---|---|
| `sr.touch.default`  | 44px | All | AAA (SC 2.5.5) | All MAUI interactive elements (hard floor). Recommended default for Blazor desktop. All primary and destructive actions. |
| `sr.touch.compact`  | 32px | Desktop only | — | Secondary actions in genuinely dense layouts: row-level action icons, inline icon buttons in data tables. Requires documented rationale. |
| `sr.touch.minimum`  | 24px | Desktop only | AA (SC 2.5.8 with spacing) | Absolute floor. Only valid with the spacing exception — see below. |

---

## The spacing exception (SC 2.5.8)

A target smaller than 24×24px fails AA unconditionally.

A target **exactly 24×24px** satisfies AA only if there is no other target within 24px of it in any direction. In practice this means: if a 24px icon has 10px of inactive (non-interactive) space on all sides, the total interactive zone is 44×44px.

A target **between 24px and 44px** can satisfy AA if the inactive space fills the gap to 24px. A 32px button with 4px spacing on each side (total 40px) does **not** satisfy AA — the total must reach at least 24px, but the combination must also not overlap another target's zone.

**Practical rule:** if you use `sr.touch.compact` (32px), ensure at least 6px inactive space on all sides. If you use `sr.touch.minimum` (24px), ensure at least 10px inactive space on all sides. Document the spacing in the component spec.

---

## Platform rules

### MAUI (touch)

- `sr.touch.default` (44px) is the **hard floor** — no exceptions
- Do not apply `sr.touch.compact` or `sr.touch.minimum` on any MAUI target
- Tap areas must be the full 44px even if the visible element is smaller — use padding or hit-test override to expand the interactive area

### Blazor desktop (mouse + keyboard)

- `sr.touch.default` (44px) is the **strong default** — use unless you have a documented reason not to
- `sr.touch.compact` (32px) is permitted for secondary actions in dense data contexts with written justification in the component spec
- `sr.touch.minimum` (24px) is the absolute floor, only with the spacing exception documented

### Keyboard navigation

Touch target size and keyboard focus size are separate concerns. A visually small element (e.g. 24px icon) must still:
- Receive a visible focus ring when tabbed to
- Have a tab stop with a clearly perceivable focus indicator
- Not trap focus

The touch target token controls the interactive area, not the focus ring size. Focus ring specification is in `foundations/tokens/border.md`.

---

## Applying the tiers in practice

### When to use Compact (32px)

| Context | Acceptable? |
|---|---|
| Primary "Save" button | No — use Default |
| Destructive "Delete" action | No — use Default |
| Row-level "Edit" icon in a data table | Yes, with spacing justification |
| Inline "Copy to clipboard" icon | Yes, with spacing justification |
| Navigation sidebar links | No — use Default |
| Pagination next/prev arrows | Borderline — prefer Default |

### When to use Minimum (24px)

Reserve exclusively for:
- Icon-only action columns in very dense data grids (e.g. a grid showing 20+ rows, each with 2–3 row actions)
- Cases where using 32px would require reducing visible data to the point of clinical usability harm

In every case, confirm the spacing exception is met and record the justification in the component spec.

---

## Platform implementation

### CSS (Blazor)

```css
:root {
  --touch-default:  44px;
  --touch-compact:  32px;
  --touch-minimum:  24px;
}

/* Default interactive target */
.sr-button {
  min-height: var(--touch-default);
  min-width:  var(--touch-default);
  padding: 0 16px; /* horizontal padding expands width beyond min */
}

/* Compact — row action icon in data table */
.sr-table__row-action {
  min-height: var(--touch-compact);
  min-width:  var(--touch-compact);
  /* Ensure ≥6px spacing from adjacent targets */
}

/* Minimum — extreme density with spacing exception */
.sr-table__row-action--dense {
  min-height: var(--touch-minimum);
  min-width:  var(--touch-minimum);
  padding: 10px; /* spacing exception: total interactive area = 44px */
}
```

### XAML (MAUI — Default only)

```xml
<ResourceDictionary>
  <x:Double x:Key="TouchTargetDefault">44</x:Double>
  <!-- Compact and Minimum are not defined for MAUI — 44px is the hard floor -->
</ResourceDictionary>

<!-- Usage -->
<Button MinimumHeightRequest="{StaticResource TouchTargetDefault}"
        MinimumWidthRequest="{StaticResource TouchTargetDefault}" />

<!-- For icon-only buttons where visual size is smaller than 44px -->
<ImageButton MinimumHeightRequest="{StaticResource TouchTargetDefault}"
             MinimumWidthRequest="{StaticResource TouchTargetDefault}"
             Padding="10"
             Source="icon_edit.svg" />
```

---

## References

- WCAG 2.2 SC 2.5.5 — Target Size (Enhanced) — Level AAA
- WCAG 2.2 SC 2.5.8 — Target Size (Minimum) — Level AA
- GDS Design System — Touch targets
- NHS England — Interaction design guidance
