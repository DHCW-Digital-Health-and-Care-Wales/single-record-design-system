# Design Language Updates — Backlog

Running log of design language changes to be applied in batches. Each item records what changed, what it affects, and current status.

Add new items to **Pending**. Move to **In Progress** when a batch is being applied. Move to **Done** with a date when confirmed in Figma and any relevant components are updated.

---

## Pending

| # | Change | Affects | Notes |
|---|---|---|---|
| DL-003 | Decide approach for active/pressed state on Primary button | Button (Primary), any future interactive controls | `Interactive/Primary` = Blue/800. Blue/900 taken by hover. Active/pressed deferred — revisit when needed. Do not change the default Blue/800 without explicit permission. |
| DL-006 | Add `Border/Error` semantic token (→ `Interactive/Destructive` → Red/600) | All form components using error borders (Input Field, Select, Checkbox, Radio) | Currently `Interactive/Destructive` is used directly for error borders, which reads semantically wrong in code. A dedicated `Border/Error` alias makes the intent explicit. `Interactive/Destructive` stays for destructive action buttons. Apply to all form components when token is created. |
| DL-007 | Decide persistence scope for the Navigation sidebar's pinned collapse/expand state — session-only vs. per-user profile setting (`localStorage`/account) | Navigation (Sidebar) | See DDR-017. Blocking a full build of the per-screen default + manual-override logic. Needs stakeholder or quick user check before implementation. |

---

## In Progress

_Nothing currently in progress._

---

## Done

| # | Change | Completed | Components updated | Notes |
|---|---|---|---|---|
| DL-001 | Heading XS Desktop + Mobile font weight → Medium (500) | All text using SR Typography/Desktop/Heading XS or SR Typography/Mobile/Heading XS | Root fix: Text Style `fontName` updated to Roboto Medium. Variable binding alone was insufficient — style definition is authoritative. Applies to all existing and new text using the style. | 2026-05-29 |
| DL-002 | Create semantic disabled tokens: `Interactive/Disabled` (→ Blue/400), `Text/Disabled` (→ Navy/300), `Border/Disabled` (→ Navy/300) | 2026-05-29 | Button (all 12 disabled variants) | Confirmed pattern across secondary buttons, toggles, input fields, tab menus. Primitives replaced with semantic tokens in Button. Apply to other components as they are built. |
| DL-004 | Add `Cyan/850` primitive (`#0c7b99`, midpoint between Cyan/800 and Cyan/900). Update Dark mode aliases: `Interactive/Primary` and `Surface/Small Cards` both shifted from Cyan/900 → Cyan/850. | 2026-06-01 | All components using Interactive/Primary or Surface/Small Cards in Dark mode | Cyan/850 gives 4.88:1 contrast with Text/Inverse (white) at 16px — WCAG AA pass, AAA fail. Cyan/900 was the prior dark mode value. Change improves legibility margin in dark mode without dropping below AA. Sign-off confirmed before applying. |
| DL-005 | Revise desktop heading scale — insert 20px step at Heading S, shift S/M/L/XL down one level. See DDR-004. | 2026-06-01 | All components using SR Typography/Desktop/Heading S, M, L, or XL | Desktop was missing a usable heading between 16px (XS) and 24px (S). New scale: XS=16, S=20, M=24, L=28, XL=36. 48px retained as primitive for future use. Mobile scale unchanged. Component audit required — sizes change at every affected level. |

---

## How to use this file

- **Batching:** group related changes into a single session. Update multiple components at once rather than one at a time.
- **DDR threshold:** if a change affects a core token, a pattern, or an architectural decision, write a full DDR in `/decisions/` before applying.
- **Component audit:** when closing an item, list every component that was checked (not just the ones that changed).
- **Key decisions:** colour scale, token naming, and structural changes require explicit sign-off before applying — do not act on recommendations without confirmation.
