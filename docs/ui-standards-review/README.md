# UI Standards Review — Project

**Status:** Open · **Opened:** 2026-07-09

A working project to review the legacy **DHCW UI Standards Guide v1.3** (WCP / DHCW
eForms) and reconcile it with the Single Record Design System.

## Why this project exists

The UI Standards Guide (2022) predates the Single Record Design System. It holds
genuinely important **clinical, content and interaction** requirements — NHS number
formatting, name display, sentence case, mandatory-field behaviour, copy/paste
patient-safety rules, misfiling, cooling-off/finalisation, terminology — that must
carry forward into the new system. It *also* contains **design-system dictates**
(specific hex colours, `rem` font sizes, legacy CSS in the Appendix) that are now
**superseded by our design tokens** and should be treated as historical.

The job of this project is to go through the guide, decide what each standard
becomes in the Single Record world, and land the outcome as guidelines, tokens,
component/pattern specs, or DDRs.

## Inputs

| Input | Location |
|---|---|
| Extracted source (faithful, page-anchored) | `../reference/dhcw-ui-standards-v1.3.md` |
| Curated standards inventory (triage worksheet) | `standards-inventory.md` |
| Original PDF | supplied by the design lead (not committed — 20 MB) |

## How to use it

1. Work through `standards-inventory.md` row by row.
2. For each standard, set a **Disposition** (see legend in that file).
3. Where a standard becomes guidance, fold it into the relevant guidelines page
   (e.g. content rules → a `content` / `writing` guideline; field behaviour →
   the component/pattern guideline). Where it's a real design decision, open a DDR.
4. Keep `[p.N]` anchors when quoting, so every decision traces back to source.

## Guardrails (from CLAUDE.md + handoff)

- **Take design-system dictates lightly.** Colours, font sizes and the Appendix CSS
  are legacy WCP values — do not import them. Use tokens.
- **Clinical/content/interaction requirements are authoritative input** — but they
  target *desktop eForms*. Re-express them platform-agnostically (web/React/Blazor/
  MAUI) rather than copying desktop-only assumptions.
- Colour-scale, token-naming and structural changes need **explicit sign-off**.
</content>
</invoke>
