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
| DL-009 | Bring the remaining Styles pages up to the published content standard (Spacing & Elevation is still rendered markdown; Icons and Grids are still planned pages) | Website Styles section | Typography and Colour are the two worked exemplars. Standard is recorded in the 2026-07-27 handoff checkpoint. |
| DL-010 | Update the Figma colour guideline frame to match the reconciled tokens, and confirm the Figma variables agree (yellow.100 = `#FDF3D7`, no focus-yellow variable) | Figma Colours page `12:3270` | Needs a frame-level node id from the design lead; `get_metadata` on the page exceeds the tool limit. |
| DL-008 | Audit + normalise CTA placement per DDR-018 — forms/sections left-aligned (cancel as a link); modals right-grouped (cancel equal-weight button left of primary) | Button, all forms/page sections, all modals/dialogs, confirmation-dialog pattern, batch review-before-send modal | See DDR-018. Includes: expand the Button spec "Button group alignment" line + cite DDR-018; regroup confirmation-dialog + batch-review modal footers to bottom-right. Fold into Button guideline authoring. |
| DL-012 | Checkbox box corner radius is `3px` in Figma, which is not a token (`radius-sm` = 2px, `radius-md` = 4px) | Checkbox `843:14568`, and any component reusing the box | Built with `radius-sm` (2px) per the agreed "design system wins on conflict" rule. Either add a 3px radius token or change the Figma to 2px so the two agree. Visually indistinguishable at 20px, so this is a consistency question, not a visual one. |
| DL-013 | Checkbox error message text is bound to `Font/Size/14` in Figma but renders at Caption 12/16 | Checkbox `1517:13764` error variants | The frame geometry (16px row) and `components/form-fields.md` ("Hint, Description, Error message → Caption 12/16") both say Caption. The variable binding disagrees with both. Built as Caption. Rebind the Figma text to `Font/Size/12` / `Font/Line Height/16`. |
| DL-014 | Button component **description text** in Figma still says "Type: Primary · Secondary · Ghost · **Warning**" | Button `1346:500` (description field only) | The variants themselves are correct — `[Primary, Secondary, Ghost, Destructive]`. Only the hand-written description box in the right sidebar is stale; it was not updated when the variants were renamed on 2026-06-24. It flows into Code Connect output and dev handoff. Same text also claims "Pending semantic tokens: Interactive/Primary Disabled, Interactive/Destructive Hover" — confirm whether still pending. |
| DL-015 | Focus-ring treatment is inconsistent across coded components | Button vs Select / Checkbox | Button uses `0 0 0 2px surface-background, 0 0 0 4px cyan-700` (2px gap then a 2px ring); Select and Checkbox use a solid `0 0 0 3px border-focus`. DDR-006 fixes the *colour* but not the geometry. Pick one and normalise — the gapped version reads better on saturated fills, the solid one is simpler. |
| DL-016 | Checkbox target size passes SC 2.5.8 only via the **spacing exception**, not on size | Checkbox, and any dense control reusing 20px boxes | 20px boxes with 12px gaps put target centres 32px apart, so the 24px exception circles do not intersect — AA compliant. But it fails SC 2.5.5 (AAA, 44×44) and **any future tightening of the options gap below 12px would break AA**. Decide whether a 44px touch variant is needed for MAUI/tablet and gloved clinical use. Recorded in `components/checkbox/spec.md`. |
| DL-017 | Sortable-header **directional** states are not designed | Table `1122:14466` (Sortable header building block) | Figma designs only the neutral two-triangle indicator. `aria-sort` announces ascending/descending, so the direction must also be visible. Built using existing icons — `nav/sort` unsorted, `nav/chevron-up`/`nav/chevron-down` when applied. Confirm or design the active states. Also: the Figma indicator is 10px wide; built at 16px (`sr-icon--xs`, the smallest icon token) since 10px is below the icon scale. |
| DL-018 | Table header height disagrees between Figma sources | Table `1122:14469` building blocks vs shipped `table.css` | The building-block symbols are all 40px tall, including `Header` and `Sortable header`. The shipped CSS uses 36px for the header row and 40px for body cells, presumably taken from the composed table. Left at 36px — changing a shipped row height is a visual change needing sign-off. Confirm which is correct. |
| DL-019 | Figma Modal is bound to `Elevation/Raised`, but `elevation.md` reserves `sr.elevation.overlay` for modals | Modal `3807:36855` | `foundations/tokens/elevation.md`: "Use `sr.elevation.overlay` for all floating layers: modals, side drawers, dropdown menus, and tooltips." The Figma binds the card step (`0 1px 4px rgba(27,41,74,0.12)`) instead of the overlay step (`0 4px 16px rgba(27,41,74,0.18)`). Built with the documented overlay value — a modal with a card shadow reads flat against its own backdrop. Rebind the Figma effect, or change the doc. |
| DL-020 | There are **no elevation tokens in the token JSON** | `foundations/tokens/` — no elevation file; `elevation.md` documents three steps that nothing generates | Every component that needs a shadow hardcodes it, and they have already drifted: `navigation.css` uses `0 1px 4px rgba(27,41,74,0.12)` (matches the doc), `date-picker.css` uses `0 4px 16px rgba(27,41,74,0.16)` where the doc says `0.18`. Adding `elevation.json` would make these generated and checkable, like the colour docs. |
| DL-021 | Modal divider strokes are **not variable-bound** in Figma | Modal `3807:36855` | `get_variable_defs` returns no border colour for the rules above and below the content — they are raw strokes, so a token change would not reach them. Built with `Border/Default`. Bind them. |

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
| DL-011 | Colour token reconciliation: removed the deprecated `focus-yellow` primitive and the duplicate `info-blue.default`; documented 24 previously-undocumented primitives (full grey, green and yellow ramps, `cyan.850`); corrected `yellow.100` to `#FDF3D7` and `status.critical`/`status.success` to the 700 steps; recorded navy as a deliberately short ramp | 2026-07-27 | Website Colour page rewritten; all component CSS unaffected (semantic names unchanged) | No visual change: every correction moved the docs to match what already shipped. Colour reference markdown is now generated by `scripts/sync-token-docs.mjs` and verified by `npm run check:docs`. The four judgement calls were offered for sign-off and taken as the conservative default; reversal notes are in the 2026-07-27 handoff checkpoint. |
| DL-005 | Revise desktop heading scale — insert 20px step at Heading S, shift S/M/L/XL down one level. See DDR-004. | 2026-06-01 | All components using SR Typography/Desktop/Heading S, M, L, or XL | Desktop was missing a usable heading between 16px (XS) and 24px (S). New scale: XS=16, S=20, M=24, L=28, XL=36. 48px retained as primitive for future use. Mobile scale unchanged. Component audit required — sizes change at every affected level. |

---

## How to use this file

- **Batching:** group related changes into a single session. Update multiple components at once rather than one at a time.
- **DDR threshold:** if a change affects a core token, a pattern, or an architectural decision, write a full DDR in `/decisions/` before applying.
- **Component audit:** when closing an item, list every component that was checked (not just the ones that changed).
- **Key decisions:** colour scale, token naming, and structural changes require explicit sign-off before applying — do not act on recommendations without confirmation.
