# Figma Variable Mapping

Maps Figma variable names to design token names used in this repository and in code.

This file must be kept in sync whenever tokens are added, renamed, or removed.

---

## Convention

| Layer | Format | Example |
|---|---|---|
| Figma variable (primitives) | `Primitives/Group/Scale` | `Primitives/Blue/800` |
| Figma variable (semantic) | `SR/Category/Name` | `SR/Interactive/Primary` |
| Design token (primitives) | `color.{hue}.{scale}` | `color.blue.800` |
| Design token (semantic) | `sr.color.{category}.{name}` | `sr.color.interactive.primary` |
| CSS custom property | `--sr-color-{category}-{name}` | `--sr-color-interactive-primary` |
| MAUI resource | `SrColor{Category}{Name}` | `SrColorInteractivePrimary` |

---

## Primitive Colour Variables

Source: `/foundations/tokens/primitives/color.json`

### Blue (NHS Wales Blue)
| Figma Variable | Token | Hex |
|---|---|---|
| `Primitives/Blue/900` | `color.blue.900` | `#1E3050` |
| `Primitives/Blue/800` | `color.blue.800` | `#325083` |
| `Primitives/Blue/700` | `color.blue.700` | `#3D6199` |
| `Primitives/Blue/600` | `color.blue.600` | `#4C72AE` |
| `Primitives/Blue/500` | `color.blue.500` | `#5C6991` |
| `Primitives/Blue/400` | `color.blue.400` | `#828DAC` |
| `Primitives/Blue/300` | `color.blue.300` | `#AAB1C6` |
| `Primitives/Blue/200` | `color.blue.200` | `#D4D8E2` |
| `Primitives/Blue/100` | `color.blue.100` | `#ECEEF3` |
| `Primitives/Blue/50`  | `color.blue.50`  | `#F4F5F8` |

### Cyan (DHCW Blue)
| Figma Variable | Token | Hex |
|---|---|---|
| `Primitives/Cyan/900` | `color.cyan.900` | `#0A6A84` |
| `Primitives/Cyan/800` | `color.cyan.800` | `#0D8BAD` |
| `Primitives/Cyan/700` | `color.cyan.700` | `#12A3C9` |
| `Primitives/Cyan/600` | `color.cyan.600` | `#71ACCD` |
| `Primitives/Cyan/500` | `color.cyan.500` | `#8DC0DA` |
| `Primitives/Cyan/400` | `color.cyan.400` | `#AFD4E5` |
| `Primitives/Cyan/300` | `color.cyan.300` | `#D6EAF2` |
| `Primitives/Cyan/100` | `color.cyan.100` | `#EBF5FA` |
| `Primitives/Cyan/50`  | `color.cyan.50`  | `#F4FAFC` |

### Navy (DHCW Navy)
| Figma Variable | Token | Hex |
|---|---|---|
| `Primitives/Navy/900` | `color.navy.900` | `#1B294A` |
| `Primitives/Navy/700` | `color.navy.700` | `#464C64` |
| `Primitives/Navy/500` | `color.navy.500` | `#707488` |
| `Primitives/Navy/300` | `color.navy.300` | `#9EA1AF` |
| `Primitives/Navy/100` | `color.navy.100` | `#CDCFD6` |

### Red (Status — error/critical)
| Figma Variable | Token | Hex |
|---|---|---|
| `Primitives/Red/900` | `color.red.900` | `#5F110A` |
| `Primitives/Red/800` | `color.red.800` | `#8B190F` |
| `Primitives/Red/700` | `color.red.700` | `#B32014` |
| `Primitives/Red/600` | `color.red.600` | `#D5281B` |
| `Primitives/Red/500` | `color.red.500` | `#E03A31` |
| `Primitives/Red/400` | `color.red.400` | `#EC5E56` |
| `Primitives/Red/300` | `color.red.300` | `#F48B85` |
| `Primitives/Red/200` | `color.red.200` | `#F9B5B1` |
| `Primitives/Red/100` | `color.red.100` | `#FCDBD9` |
| `Primitives/Red/50`  | `color.red.50`  | `#FEF3F2` |

### Status & Utility
| Figma Variable | Token | Hex |
|---|---|---|
| `Primitives/Green/600` | `color.green.600` | `#007F3B` |
| `Primitives/Green/100` | `color.green.100` | `#D9EFE5` |
| `Primitives/Yellow/500` | `color.yellow.500` | `#F8CA4D` |
| `Primitives/Yellow/100` | `color.yellow.100` | `#FDF6DC` |
| `Primitives/Focus Yellow` | `color.focus-yellow` | `#FFEB3B` |
| `Primitives/Grey/900` | `color.grey.900` | `#212B32` |
| `Primitives/Grey/600` | `color.grey.600` | `#4C6272` |
| `Primitives/Grey/200` | `color.grey.200` | `#D8DDE0` |
| `Primitives/Grey/100` | `color.grey.100` | `#F0F4F5` |
| `Primitives/White` | `color.white` | `#FFFFFF` |

### Info Blue (Status — informational)
| Figma Variable | Token | Hex |
|---|---|---|
| `Primitives/Info Blue/900` | `color.info-blue.900` | `#002E5C` |
| `Primitives/Info Blue/800` | `color.info-blue.800` | `#004483` |
| `Primitives/Info Blue/700` | `color.info-blue.700` | `#005AA8` |
| `Primitives/Info Blue/600` | `color.info-blue.600` | `#0D62A3` |
| `Primitives/Info Blue/500` | `color.info-blue.500` | `#267AB8` |
| `Primitives/Info Blue/400` | `color.info-blue.400` | `#4E95CA` |
| `Primitives/Info Blue/300` | `color.info-blue.300` | `#7EB0D9` |
| `Primitives/Info Blue/200` | `color.info-blue.200` | `#AECCE8` |
| `Primitives/Info Blue/100` | `color.info-blue.100` | `#D6E8F5` |
| `Primitives/Info Blue/50`  | `color.info-blue.50`  | `#EEF5FC` |

---

## Semantic Colour Variables

Source: `/foundations/tokens/semantic/color.json` (light) and `color.dark.json` (dark).

All semantic variables alias primitives — no raw hex values.

### Interactive
| Figma Variable | Token | Light alias | Dark alias |
|---|---|---|---|
| `SR/Interactive/Primary` | `sr.color.interactive.primary` | `color.blue.800` | `color.cyan.900` |
| `SR/Interactive/Primary Hover` | `sr.color.interactive.primary-hover` | `color.blue.900` | `color.cyan.800` |
| `SR/Interactive/Secondary` | `sr.color.interactive.secondary` | `color.navy.900` | `color.blue.300` |
| `SR/Interactive/Link` | `sr.color.interactive.link` | `color.info-blue` | `color.cyan.400` |
| `SR/Interactive/Destructive` | `sr.color.interactive.destructive` | `color.red.600` | `color.red.600` |

### Surface
| Figma Variable | Token | Light alias | Dark alias |
|---|---|---|---|
| `SR/Surface/Background` | `sr.color.surface.background` | `color.grey.100` | `color.navy.900` |
| `SR/Surface/Small Cards` | `sr.color.surface.small-cards` | `color.white` | `color.cyan.900` |
| `SR/Surface/Accent` | `sr.color.surface.accent` | `color.cyan.100` | `color.blue.900` |
| `SR/Surface/Subtle` | `sr.color.surface.subtle` | `color.blue.50` | `color.navy.700` |
| `SR/Surface/Section Cards` | `sr.color.surface.section-cards` | `color.white` | `color.blue.900` |

### Text
| Figma Variable | Token | Light alias | Dark alias |
|---|---|---|---|
| `SR/Text/Primary` | `sr.color.text.primary` | `color.grey.900` | `color.white` |
| `SR/Text/Secondary` | `sr.color.text.secondary` | `color.grey.600` | `color.grey.200` |
| `SR/Text/Inverse` | `sr.color.text.inverse` | `color.white` | `color.grey.900` |

### Border colours
| Figma Variable | Token | Light alias | Dark alias |
|---|---|---|---|
| `SR/Border/Subtle`  | `sr.color.border.subtle`  | `color.grey.100` | `color.navy.700` |
| `SR/Border/Default` | `sr.color.border.default` | `color.grey.200` | `color.navy.500` |
| `SR/Border/Strong`  | `sr.color.border.strong`  | `color.grey.600` | `color.navy.300` |
| `SR/Border/Focus`   | `sr.color.border.focus`   | `color.focus-yellow` | `color.focus-yellow` |

### Status
| Figma Variable | Token | Light alias | Dark alias |
|---|---|---|---|
| `SR/Status/Critical` | `sr.color.status.critical` | `color.red.600` | `color.red.100` |
| `SR/Status/Critical Surface` | `sr.color.status.critical-surface` | `color.red.100` | `color.blue.900` |
| `SR/Status/Success` | `sr.color.status.success` | `color.green.600` | `color.green.100` |
| `SR/Status/Success Surface` | `sr.color.status.success-surface` | `color.green.100` | `color.navy.900` |
| `SR/Status/Warning` | `sr.color.status.warning` | `color.yellow.500` | `color.yellow.500` |
| `SR/Status/Warning Surface` | `sr.color.status.warning-surface` | `color.yellow.100` | `color.navy.700` |
| `SR/Status/Info` | `sr.color.status.info` | `color.info-blue.700` | `color.info-blue.700` |
| `SR/Status/Info Surface` | `sr.color.status.info-surface` | `color.info-blue.100` | `color.navy.900` |

### Brand

| Figma Variable | Token | Light alias | Dark alias |
|---|---|---|---|
| `SR/Brand/Accent` | `sr.color.brand.accent` | `color.cyan.700` | `color.cyan.700` |

> Cyan-700 (#12A3C9) is decorative only — borders, icon strokes, chart accents, tab indicators. White text on cyan-700 = 2.6:1 (fails AA). For any filled surface with white text, use `sr.color.interactive.primary` (cyan-900 dark / blue-800 light).

---

### Border widths
| Figma Variable | Token | Value | CSS property |
|---|---|---|---|
| `Primitives/Border/Width/1` | `border.width.1` | 1px | — |
| `Primitives/Border/Width/2` | `border.width.2` | 2px | — |
| `SR/Border/Width/Default` | `sr.border.width.default` | → `border.width.1` | `--border-width-default` |
| `SR/Border/Width/Strong`  | `sr.border.width.strong`  | → `border.width.2` | `--border-width-strong` |

### Radius
| Figma Variable | Token | Value | CSS property |
|---|---|---|---|
| `Primitives/Radius/0`    | `radius.0`    | 0px    | — |
| `Primitives/Radius/2`    | `radius.2`    | 2px    | — |
| `Primitives/Radius/4`    | `radius.4`    | 4px    | — |
| `Primitives/Radius/8`    | `radius.8`    | 8px    | — |
| `Primitives/Radius/9999` | `radius.9999` | 9999px | — |
| `SR/Radius/None` | `sr.radius.none` | → `radius.0`    | `--radius-none` |
| `SR/Radius/SM`   | `sr.radius.sm`   | → `radius.2`    | `--radius-sm`   |
| `SR/Radius/MD`   | `sr.radius.md`   | → `radius.4`    | `--radius-md`   |
| `SR/Radius/LG`   | `sr.radius.lg`   | → `radius.8`    | `--radius-lg`   |
| `SR/Radius/Full` | `sr.radius.full` | → `radius.9999` | `--radius-full` |

### Touch targets
| Figma Variable | Token | Value | Note |
|---|---|---|---|
| `Primitives/Size/Touch/24` | `size.touch.24` | 24px | Global primitive |
| `Primitives/Size/Touch/32` | `size.touch.32` | 32px | Global primitive |
| `Primitives/Size/Touch/44` | `size.touch.44` | 44px | Global primitive |
| `SR/Touch/Default`  | `sr.touch.default`  | → `size.touch.44` | All platforms. WCAG 2.2 AAA. |
| `SR/Touch/Compact`  | `sr.touch.compact`  | → `size.touch.32` | Desktop (Blazor) only. |
| `SR/Touch/Minimum`  | `sr.touch.minimum`  | → `size.touch.24` | Desktop only, with ≥10px spacing. |

---

## Spacing Variables

| Figma Variable | Token | CSS Custom Property |
|---|---|---|
| `Spacing/Component/XS` | `spacing.component.xs` | `--spacing-component-xs` |
| `Spacing/Component/SM` | `spacing.component.sm` | `--spacing-component-sm` |
| `Spacing/Component/MD` | `spacing.component.md` | `--spacing-component-md` |
| `Spacing/Component/LG` | `spacing.component.lg` | `--spacing-component-lg` |
| `Spacing/Component/XL` | `spacing.component.xl` | `--spacing-component-xl` |
| `Spacing/Form/Field Gap` | `spacing.form.field-gap` | `--spacing-form-field-gap` |
| `Spacing/Form/Label Gap` | `spacing.form.label-gap` | `--spacing-form-label-gap` |

---

## Typography Variables

Source: `/foundations/tokens/primitives/typography.json` and `semantic/typography.json`.

Semantic typography tokens are defined in Figma as individual property variables within the `Single Record` collection (e.g. `Typography/Body M/Desktop/Font Size`).

### Primitive font variables
| Figma Variable | Token | Value |
|---|---|---|
| `Primitives/Font/Family/Primary` | `font.family.primary` | `Roboto` |
| `Primitives/Font/Weight/Regular` | `font.weight.regular` | `400` |
| `Primitives/Font/Weight/Medium` | `font.weight.medium` | `500` |
| `Primitives/Font/Weight/Bold` | `font.weight.bold` | `700` |
| `Primitives/Font/Letter Spacing/Default` | `font.letter-spacing.default` | `0px` |
| `Primitives/Font/Letter Spacing/Wide` | `font.letter-spacing.wide` | `0.7px` |
| `Primitives/Font/Letter Spacing/Caption` | `font.letter-spacing.caption` | `0.24px` |

### Semantic typography styles
| Figma group | Token | Desktop | Mobile |
|---|---|---|---|
| `Typography/Heading XL` | `sr.typography.heading-xl` | 48px / 54px lh / Bold | 32px / 38px lh / Bold |
| `Typography/Heading L` | `sr.typography.heading-l` | 36px / 42px lh / Bold | 27px / 33px lh / Bold |
| `Typography/Heading M` | `sr.typography.heading-m` | 26px / 32px lh / Bold | 22px / 29px lh / Bold |
| `Typography/Heading S` | `sr.typography.heading-s` | 22px / 30px lh / Bold | 19px / 27px lh / Bold |
| `Typography/Heading XS` | `sr.typography.heading-xs` | 16px / 24px lh / Bold | 16px / 24px lh / Bold |
| `Typography/Body M` | `sr.typography.body-m` | 16px / 24px lh / Regular | 16px / 24px lh / Regular |
| `Typography/Body S` | `sr.typography.body-s` | 14px / 24px lh / Regular | 14px / 24px lh / Regular |
| `Typography/Label` | `sr.typography.label` | 14px / 20px lh / Medium / Wide | 14px / 20px lh / Medium / Wide |
| `Typography/Caption` | `sr.typography.caption` | 12px / 16px lh / Regular / Caption | 12px / 16px lh / Regular / Caption |

---

## Maintenance

- When adding a new Figma variable, add a corresponding row to this file in the same commit.
- When renaming, update all columns simultaneously.
- Breaking changes (token renames that affect code) require a DDR before implementation.
- JSON sources are the machine-readable single source of truth. This file is the human-readable reference.
