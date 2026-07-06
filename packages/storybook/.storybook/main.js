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
};

export default config;
