// Load the generated design tokens globally so every story renders with the
// real CSS custom properties. Run `npm run build:tokens` (from the repo root)
// before starting Storybook so these files exist.
import '@dhcw/sr-tokens/build/css/tokens.css';
// Dark-mode token overrides — scoped to [data-theme="dark"], activated by the
// Theme toolbar toggle below (see DDR-011: theme is a token-driven axis).
import '@dhcw/sr-tokens/build/css/tokens-dark.css';
// Responsive typography utility classes (.sr-type-*) — mobile-first with a
// desktop override at 1024px. Lets stories show real form-factor behaviour
// when combined with the SR viewports below.
import '@dhcw/sr-tokens/build/css/typography.css';

// SR form-factor viewports, driven by foundations/tokens/breakpoints.json.
// Use the Viewport toolbar to preview any story at each breakpoint. Desktop
// typography tokens apply at >= 1024px (mobile-first), so the typography scale
// visibly changes between the mobile/tablet and desktop+ viewports.
const srViewports = {
  mobile:  { name: 'SR Mobile (=< 767)',      styles: { width: '375px',  height: '812px' } },
  tablet:  { name: 'SR Tablet (768-1023)',    styles: { width: '768px',  height: '1024px' } },
  desktop: { name: 'SR Desktop (>= 1024)',    styles: { width: '1024px', height: '768px' } },
  large:   { name: 'SR Large (>= 1280)',      styles: { width: '1280px', height: '800px' } },
  xlarge:  { name: 'SR X-Large (>= 1440)',    styles: { width: '1440px', height: '900px' } },
};

// Theme toolbar toggle. Drives the real token theme: sets data-theme="dark" on
// the document root (which activates tokens-dark.css) and paints the canvas from
// the surface/text tokens so the background flips with the theme automatically.
// axe-core (addon-a11y) then runs contrast checks against the active theme.
export const globalTypes = {
  theme: {
    description: 'SR colour theme (light / dark)',
    toolbar: {
      title: 'Theme',
      icon: 'contrast',
      items: [
        { value: 'light', title: 'Light', icon: 'sun' },
        { value: 'dark', title: 'Dark', icon: 'moon' },
      ],
      dynamicTitle: true,
    },
  },
};

const applyTheme = (theme) => {
  const root = document.documentElement;
  if (theme === 'dark') root.setAttribute('data-theme', 'dark');
  else root.removeAttribute('data-theme'); // light = :root default
  // Paint the canvas from tokens so it tracks the theme (replaces the old
  // hard-coded "Dark" background swatch, which never activated dark tokens).
  document.body.style.background = 'var(--sr-color-surface-background)';
  document.body.style.color = 'var(--sr-color-text-primary)';
};

/** @type { import('@storybook/html-vite').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    viewport: {
      options: srViewports,
    },
    a11y: {
      // Surface violations in the panel rather than failing silently.
      test: 'todo',
    },
  },
  initialGlobals: {
    theme: 'light',
    viewport: { value: 'desktop', isRotated: false },
  },
  decorators: [
    (story, context) => {
      applyTheme(context.globals.theme);
      return story();
    },
  ],
};

export default preview;
