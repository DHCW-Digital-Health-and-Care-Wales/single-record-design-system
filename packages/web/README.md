# @dhcw/sr-web

Canonical HTML/CSS components for the DHCW Single Record Design System.

Framework-agnostic reference implementation following the GOV.UK Frontend model. Blazor and React packages wrap these components. Consumes `@dhcw/sr-tokens` CSS custom properties.

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

**Status:** In progress — Button is the first reference component. Remaining specs are in `/components/`.
