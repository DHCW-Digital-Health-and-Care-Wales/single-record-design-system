# @dhcw/sr-web

Canonical HTML/CSS components for the DHCW Single Record Design System.

Framework-agnostic reference implementation following the GOV.UK Frontend model. Blazor and React packages wrap these components. Consumes `@dhcw/sr-tokens` CSS custom properties.

## Using it in an application

Run `npm run build:web` from the repo root. It writes `dist/`:

| File | What it is |
|---|---|
| `dist/single-record.css` | Font, all design tokens, typography utilities and every component, flattened into one file. One `<link>`, no build tooling. |
| `dist/single-record-dark.css` | Dark-mode token overrides. Load **after** the file above. Provisional — see `DESIGN-SYSTEM.md`. |
| `dist/icons.js` | The icon set as an ES module (`iconMarkup`, `iconNames`). |
| `dist/sprite.svg` | The same icons as an SVG sprite, for `<use>` with no JavaScript. Must be served over HTTP from the same origin — a cross-file `<use>` fails silently on `file://`. |
| `dist/components/*.css` | Individual component stylesheets, for taking one component at a time. |

`dist/` is generated and committed, so the files can be downloaded from the
repository (or from the design-system website's **Get the files** page) without
a checkout. Never edit it by hand — `build.mjs` overwrites it.

`src/index.css` is the same set as `@import` statements, for consumers whose
bundler resolves them.

## Structure

Each component is a folder under `src/`, containing its CSS and a Storybook story:

```
src/
  button/
    button.css            reference styles
    button.stories.js     Storybook story (Figma: 1346:500)
  foundations/
    colours.stories.js    token swatches, rendered from @dhcw/sr-tokens
```

Stories are picked up by `@dhcw/sr-storybook`. To browse, run `npm run storybook` from the repo root.

**Status:** In progress. Twenty-one components ship reference CSS; the specs and guidelines that go with them are in `/components/`, and `DESIGN-SYSTEM.md` names which have which.
