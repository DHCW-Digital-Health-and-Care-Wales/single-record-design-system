// Load the generated design tokens globally so every story renders with the
// real CSS custom properties. Run `npm run build:tokens` (from the repo root)
// before starting Storybook so this file exists.
import '@dhcw/sr-tokens/build/css/tokens.css';

/** @type { import('@storybook/html-vite').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // Storybook 9 backgrounds API: named options + an initial global selection.
    backgrounds: {
      options: {
        sr: { name: 'SR Background', value: '#f4f5f8' },
        white: { name: 'White', value: '#ffffff' },
        dark: { name: 'Dark', value: '#1b294a' },
      },
    },
    a11y: {
      // Surface violations in the panel rather than failing silently.
      test: 'todo',
    },
  },
  initialGlobals: {
    backgrounds: { value: 'sr' },
  },
};

export default preview;
