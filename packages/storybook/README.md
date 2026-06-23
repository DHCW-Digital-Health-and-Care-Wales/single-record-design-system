# @dhcw/sr-storybook

Storybook component catalogue for the DHCW Single Record Design System.

**Dev-only — not published.** It consumes the other packages (`@dhcw/sr-web`, `@dhcw/sr-tokens`) and renders their components and tokens as a browsable catalogue.

## What it is

Storybook is a small local web server that produces a browsable website of every component. There is nothing to install per-user — developers run it locally and view it in a browser; everyone else (designers, reviewers, clinical staff) views the **published** version at a URL.

## Running it locally

From the **repo root**:

```bash
npm install            # first time only — installs all workspaces
npm run build:tokens   # generates @dhcw/sr-tokens/build/css/tokens.css
npm run storybook      # starts Storybook, opens http://localhost:6006
```

It live-reloads as you edit component CSS or stories.

## Building the static site

```bash
npm run build-storybook   # builds tokens, then outputs packages/storybook/storybook-static/
```

That folder is a plain static website — host it anywhere (GitHub Pages, Netlify, an internal DHCW server). The repo's `deploy-storybook` GitHub Action publishes it to GitHub Pages automatically on every push to `main`.

## Where stories live

Stories live **next to the components they document**, not in this package:

```
packages/web/src/button/button.stories.js
packages/web/src/foundations/colours.stories.js
```

`.storybook/main.js` globs the sibling packages to find them. When `@dhcw/sr-react` gains components, uncomment its glob in `main.js`.

## Accessibility

`@storybook/addon-a11y` runs axe-core against every story and reports issues in the **Accessibility** panel — aligning with the project's WCAG 2.2 AA requirement.
