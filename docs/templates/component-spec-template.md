# [Component Name]

**Status:** [Planned | In design | In review | Approved | In development | Live | Deprecated]
**Last updated:** YYYY-MM

---

## Purpose

One or two sentences: what this component does and when to use it. If there is an existing component or pattern that covers a similar need, reference it here.

---

## Variants

| Variant | Usage |
|---|---|
| Default | ... |

---

## Anatomy

Label each part of the component. Use a simple ASCII diagram if useful.

```
[ Part A ]  [ Part B ]
└─────────────────────┘
      Container
```

- **Part A**: description
- **Part B**: description

---

## States

| State | Visual behaviour |
|---|---|
| Default | ... |
| Hover | ... |
| Focus | `Border/Focus` (Cyan/700) ring, outside the element — DDR-006 |
| Active | ... |
| Disabled | Muted colours; `aria-disabled="true"` |
| Error | (if applicable) |
| Loading | (if applicable) |

---

## Sizing

| Size | Dimensions | Usage |
|---|---|---|
| Default | ... | ... |

Minimum touch target: 44×44px (WCAG 2.2 SC 2.5.8).

---

## Responsive behaviour

Classify the component (see DDR-011) and document accordingly:

- **Form factor:** [Responsive | Adaptive | Distinct]
  - *Responsive* — one component; only tokens/sizes change across breakpoints (the common case).
  - *Adaptive* — one component with a `Breakpoint=Desktop/Mobile` variant where the layout rearranges.
  - *Distinct* — a separate component for the mobile vs desktop job (e.g. header/footer); cross-link the counterpart under Related.

| Breakpoint | Behaviour |
|---|---|
| Mobile (≤767px) | ... |
| Tablet (768–1023px) | ... |
| Desktop (≥1024px) | ... |

Form factor is **not** a separate package — web (HTML/React/Blazor) adapts responsively in one codebase; MAUI uses `OnIdiom`. Use the responsive typography utilities (`.sr-type-*`) and breakpoint tokens rather than hard-coded sizes.

---

## Spacing

Internal padding and gap values — reference semantic spacing tokens.

---

## Accessibility

- Accessible name: how is the name provided?
- Role: what ARIA role, if any?
- State: what ARIA states are needed?
- Keyboard: how does a keyboard user interact with this?
- Screen reader: what does a screen reader announce?
- Any additional notes specific to this component.

---

## Content Guidelines

- Labels, placeholder text, helper text rules
- Tone and voice guidance specific to this component

---

## Engineering Notes

- Blazor: ...
- MAUI: ...
- Token references: list the specific tokens used

---

## Do / Don't

| Do | Don't |
|---|---|
| ... | ... |

---

## Related

- Links to related components
- Links to patterns that use this component
- Links to GDS or NHS England equivalents
