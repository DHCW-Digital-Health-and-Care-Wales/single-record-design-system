// Load the generated design tokens globally so every story renders with the
// real CSS custom properties. Run `npm run build:tokens` (from the repo root)
// before starting Storybook so this file exists.
import '@dhcw/sr-tokens/build/css/tokens.css';

/** @type { import('@storybook/html').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'SR Background',
      values: [
        { name: 'SR Background', value: '#f4f5f8' },
        { name: 'White', value: '#ffffff' },
        { name: 'Dark', value: '#1b294a' },
      ],
    },
    a11y: {
      // Surface violations in the panel rather than failing silently.
      test: 'todo',
    },
  },
};

export default preview;
