/** @type { import('@storybook/html-vite').StorybookConfig } */
const config = {
  // Stories live next to the components they document, in the sibling packages.
  stories: [
    '../../icons/src/**/*.stories.@(js|mdx)',
    '../../web/src/**/*.stories.@(js|mdx)',
    '../../react/src/**/*.stories.@(js|jsx|mdx)',
  ],
  addons: [
    // addon-essentials (controls, actions, viewport, backgrounds, toolbars,
    // measure, outline) is folded into Storybook core as of v9 — no longer listed.
    '@storybook/addon-a11y', // axe-core accessibility checks on every story (WCAG 2.2)
    '@storybook/addon-docs', // Documentation and code snippet display on canvas
  ],
  framework: {
    name: '@storybook/html-vite',
    options: {},
  },
  // No anonymous usage telemetry — this is an NHS / healthcare codebase.
  core: {
    disableTelemetry: true,
  },
  // Relative base so the static build can be served from a subpath: the DS site
  // serves Storybook at /storybook (DDR-016), independent of the Pages base path.
  // If a manager asset ever 404s under the subpath, replace with an absolute base
  // of the repo Pages path instead.
  async viteFinal(config) {
    config.base = './';
    return config;
  },
};

export default config;
