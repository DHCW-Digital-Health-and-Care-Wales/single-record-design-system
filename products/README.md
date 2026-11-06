# Products

Product-specific extensions and overrides. This directory exists for the cases where a product genuinely diverges from the core design system — not as a first resort.

---

## Principles

- The core system (`/foundations`, `/components`, `/patterns`) is shared by all products.
- A product may **extend** the core — adding product-specific components or token overrides.
- A product may **not** contradict the core — do not redefine shared tokens or components in a way that would break consistency across the programme.
- If a product need is common enough that two products share it, it belongs in the core system.

---

## Current Products

| Product | Directory | Status |
|---|---|---|
| EPR (Electronic Patient Record) | `products/epr/` | Planned |
| Patient Administration | `products/patient-admin/` | Planned |
| Case Note Tracking | `products/case-note-tracking/` | Web prototype |
| WCP mobile (Welsh Clinical Portal app) | `products/wcp-mobile/` | MAUI prototype: onboarding and home |

---

## Adding a Product

1. Create `/products/{product-slug}/README.md` defining:
   - What the product is
   - Which core components and patterns it uses
   - Any product-specific tokens, components, or patterns (and why they can't be in the core)
2. Create sub-folders only as needed — do not pre-populate empty directories.
3. Document any core overrides clearly, with justification.
