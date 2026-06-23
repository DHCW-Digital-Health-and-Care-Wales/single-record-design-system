/** @type { import('@storybook/html-vite').StorybookConfig } */
const config = {
  // Stories live next to the components they document, in the sibling packages.
  stories: [
    '../../web/src/**/*.stories.@(js|mdx)',
    // React stories can be added here once @dhcw/sr-react has components:
    // '../../react/src/**/*.stories.@(js|jsx|ts|tsx|mdx)',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y', // axe-core accessibility checks on every story (WCAG 2.2)
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
