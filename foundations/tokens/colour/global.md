# Global Colour Tokens (Primitives)

Primitive tokens define the raw palette. They are **not used directly** in components or patterns — always use semantic tokens.

Machine-readable source of truth: `/foundations/tokens/primitives/color.json` (W3C Design Token format).

These values are defined in Figma as **primitive colour variables** in the `Primitives` collection.

---

## Palette

### Blue (NHS Wales Blue — primary brand)

| Token | Value | Notes |
|---|---|---|
| `color.blue.900` | `#1E3050` | Darkest |
| `color.blue.800` | `#325083` | Brand primary |
| `color.blue.700` | `#3D6199` |  |
| `color.blue.600` | `#4C72AE` |  |
| `color.blue.500` | `#5C6991` |  |
| `color.blue.400` | `#828DAC` | Interactive/Disabled — semantic anchor |
| `color.blue.300` | `#AAB1C6` |  |
| `color.blue.200` | `#D4D8E2` |  |
| `color.blue.100` | `#ECEEF3` |  |
| `color.blue.50` | `#F4F5F8` | Lightest — backgrounds only |

### Cyan (DHCW Blue — secondary/accent)

| Token | Value | Notes |
|---|---|---|
| `color.cyan.900` | `#0A6A84` | Darkest |
| `color.cyan.850` | `#0C7B99` | Surface/Small Cards in dark mode |
| `color.cyan.800` | `#0D8BAD` |  |
| `color.cyan.700` | `#12A3C9` | Brand secondary |
| `color.cyan.600` | `#71ACCD` |  |
| `color.cyan.500` | `#8DC0DA` |  |
| `color.cyan.400` | `#AFD4E5` | Interactive/Link in dark mode |
| `color.cyan.300` | `#D6EAF2` |  |
| `color.cyan.100` | `#EBF5FA` |  |
| `color.cyan.50` | `#F4FAFC` | Lightest |

### Navy (DHCW Navy)

| Token | Value | Notes |
|---|---|---|
| `color.navy.900` | `#1B294A` | Darkest |
| `color.navy.700` | `#464C64` |  |
| `color.navy.500` | `#707488` | Text/Disabled in light mode |
| `color.navy.300` | `#9EA1AF` | Border/Disabled, Text/Disabled (dark) |
| `color.navy.100` | `#CDCFD6` | Lightest |

### Red (Status — error/critical)

Full scale added for component-level flexibility. Components reference via semantic tokens only.

| Token | Value | Notes |
|---|---|---|
| `color.red.900` | `#5F110A` | Darkest |
| `color.red.800` | `#8B190F` |  |
| `color.red.700` | `#B32014` |  |
| `color.red.600` | `#D5281B` | NHS red — primary semantic value |
| `color.red.500` | `#E03A31` |  |
| `color.red.400` | `#EC5E56` |  |
| `color.red.300` | `#F48B85` |  |
| `color.red.200` | `#F9B5B1` |  |
| `color.red.100` | `#FCDBD9` | Error surface |
| `color.red.50` | `#FEF3F2` | Lightest |

### Green (Status — success)

| Token | Value | Notes |
|---|---|---|
| `color.green.900` | `#003319` |  |
| `color.green.800` | `#004D24` |  |
| `color.green.700` | `#006630` |  |
| `color.green.600` | `#007F3B` | NHS green |
| `color.green.500` | `#1FA66D` |  |
| `color.green.400` | `#4AB88B` |  |
| `color.green.300` | `#7BCAAA` |  |
| `color.green.200` | `#AEDDC9` |  |
| `color.green.100` | `#D9EFE5` | Success surface |
| `color.green.50` | `#F0FAF4` |  |

### Yellow (Status — warning)

| Token | Value | Notes |
|---|---|---|
| `color.yellow.900` | `#4A3000` | Darkest warning text on light surfaces |
| `color.yellow.800` | `#6B4400` |  |
| `color.yellow.700` | `#8A5A00` | Warning banner/pill text colour |
| `color.yellow.600` | `#B47800` |  |
| `color.yellow.500` | `#F8CA4D` | Warning |
| `color.yellow.400` | `#FACE62` |  |
| `color.yellow.300` | `#FBD97F` |  |
| `color.yellow.200` | `#FDE8AB` |  |
| `color.yellow.100` | `#FDF3D7` | Warning surface |
| `color.yellow.50` | `#FFFAEB` |  |

### Info Blue (Status — informational)

Full scale added to support semantic aliasing. `info-blue.700` is the primary semantic value.

| Token | Value | Notes |
|---|---|---|
| `color.info-blue.900` | `#002E5C` | Darkest |
| `color.info-blue.800` | `#004483` | Interactive/Primary Hover (dark mode) |
| `color.info-blue.700` | `#005AA8` | Primary semantic value |
| `color.info-blue.600` | `#0D62A3` | Interactive/Primary (dark mode) |
| `color.info-blue.500` | `#267AB8` |  |
| `color.info-blue.400` | `#4E95CA` |  |
| `color.info-blue.300` | `#7EB0D9` |  |
| `color.info-blue.200` | `#AECCE8` |  |
| `color.info-blue.100` | `#D6E8F5` | Info surface |
| `color.info-blue.50` | `#EEF5FC` | Lightest |

### Focus

There is no separate focus primitive. The focus ring uses `color.cyan.700` in both light and dark mode, exposed through the `sr.color.border.focus` semantic token.

### Neutral / UI

| Token | Value | Notes |
|---|---|---|
| `color.grey.900` | `#212B32` | Near-black — primary text |
| `color.grey.800` | `#2C3A44` | Strong text on tinted surfaces (11.7:1) |
| `color.grey.700` | `#3B4E5B` | Headings on grey surfaces (8.7:1) |
| `color.grey.600` | `#4C6272` | Secondary text |
| `color.grey.500` | `#768692` | Muted/placeholder fill, disabled text, icons, strong borders (3.75:1 — passes 3:1 non-text; below 4.5:1 for body text). NHS grey-2. |
| `color.grey.400` | `#AEB7BD` | Borders, dividers — non-text (2.0:1). NHS grey-3. |
| `color.grey.300` | `#C6CDD1` | Subtle dividers, disabled fills (1.6:1) |
| `color.grey.200` | `#D8DDE0` | Default borders |
| `color.grey.100` | `#F0F4F5` | Default surface |
| `color.grey.50` | `#F7FAFA` | Lightest neutral wash |
| `color.white` | `#FFFFFF` | Card and panel surfaces in light mode; Text/Inverse on saturated fills |

---

## Contrast Verification

All semantic colour pairings must be checked against WCAG 2.2:
- **Text on background**: minimum 4.5:1 (AA), target 7:1 (AAA)
- **UI components and focus indicators**: minimum 3:1 against adjacent colours

Contrast checks are documented in `/foundations/tokens/colour/semantic.md`.

---

## Notes

- Do not reference `color.*` primitive tokens in component files — use semantic tokens.
- Palette supports light mode and dark mode. Dark mode aliases are in `semantic/color.dark.json`.
- Machine-readable source: `/foundations/tokens/primitives/color.json`.
