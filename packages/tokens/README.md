# @dhcw/sr-tokens

Design tokens for the DHCW Single Record Design System.

Transforms the canonical JSON token source (`/foundations/tokens/`) into consumable formats for all supported frameworks.

## Outputs

| File | Format | Target |
|---|---|---|
| `build/css/tokens.css` | CSS custom properties (`:root`) | HTML/CSS, Blazor, React, .NET 4.8 legacy |
| `build/css/tokens-dark.css` | CSS custom properties (`[data-theme="dark"]`) | Dark mode — all web targets |
| `build/scss/_tokens.scss` | SCSS variables | Build-time consumption where Sass is used |
| `build/scss/_tokens-dark.scss` | SCSS variables (dark) | Build-time dark mode |
| `build/xaml/Tokens.xaml` | XAML ResourceDictionary | .NET MAUI |
| `build/xaml/Tokens.Dark.xaml` | XAML ResourceDictionary (dark) | .NET MAUI dark mode |
| `build/json/tokens-flat.json` | Flat key→value JSON | Tooling, CI, linting |

## Usage

### Build

```bash
cd packages/tokens
npm install
npm run build
```

### Consume in HTML / CSS / Blazor / .NET 4.8

Copy or link `build/css/tokens.css` into your project:

```html
<link rel="stylesheet" href="tokens.css">
```

Then reference tokens as CSS custom properties:

```css
.button-primary {
  background-color: var(--sr-sr-color-interactive-primary);
  color: var(--sr-sr-color-text-inverse);
}
```

For dark mode, include `tokens-dark.css` and toggle `data-theme="dark"` on the root element.

### Consume in .NET MAUI

Add `build/xaml/Tokens.xaml` to your `ResourceDictionary`:

```xml
<Application.Resources>
    <ResourceDictionary>
        <ResourceDictionary.MergedDictionaries>
            <ResourceDictionary Source="Tokens.xaml" />
        </ResourceDictionary.MergedDictionaries>
    </ResourceDictionary>
</Application.Resources>
```

Then reference tokens:

```xml
<Button BackgroundColor="{StaticResource SrColorInteractivePrimary}"
        TextColor="{StaticResource SrColorTextInverse}" />
```

### Consume in SCSS

```scss
@use 'path/to/tokens' as sr;

.button-primary {
  background-color: sr.$sr-sr-color-interactive-primary;
}
```

## Token architecture

```
Global (Tier 1)          → Semantic (Tier 2)           → Component (Tier 3)
/primitives/color.json      /semantic/color.json           (future — per-component)
/primitives/spacing.json    /semantic/spacing.json
/primitives/typography.json /semantic/typography.json
```

Components reference semantic tokens only. Semantic tokens resolve to primitives. This allows theme switching (light/dark) by swapping the semantic layer.
