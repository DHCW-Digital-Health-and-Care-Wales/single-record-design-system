import React from 'react';
import { createRoot } from 'react-dom/client';
import '@dhcw/sr-tokens/build/css/tokens.css';
import { logoFullSrc, logoSymbolSrc } from '@dhcw/sr-web/src/assets/logo.js';
import Header from './Header.jsx';

const render = (args) => {
  const isMobile = args.variant === 'mobile';
  const logo = isMobile ? (
    <img src={logoSymbolSrc} alt="DHCW Single Record" style={{ height: 32 }} />
  ) : (
    <img src={logoFullSrc} alt="DHCW Single Record" style={{ height: 40 }} />
  );

  const container = document.createElement('div');
  if (isMobile) {
    container.style.cssText = 'max-width: 390px; border: 1px solid #d8dde0;';
  }
  const root = createRoot(container);
  root.render(
    <Header
      logo={logo}
      variant={args.variant}
      showMenu={args.menu}
      initials={args.initials}
      searchPlaceholder={args.searchPlaceholder}
    />
  );
  return container;
};

export default {
  title: 'React/Header',
  tags: ['autodocs'],
  render,
  argTypes: {
    variant: { control: 'inline-radio', options: ['desktop', 'desktop-2', 'mobile'] },
    menu: { control: 'boolean', description: 'Mobile: show leading hamburger (Mobile 1).' },
    initials: { control: 'text' },
    searchPlaceholder: { control: 'text' },
  },
  args: {
    variant: 'desktop',
    menu: true,
    initials: 'AB',
    searchPlaceholder: 'Type here to begin search',
  },
};

export const Desktop = { args: { variant: 'desktop' } };
export const Desktop2 = {
  name: 'Desktop 2 (org selector)',
  args: { variant: 'desktop-2' },
};
export const MobileWithMenu = {
  name: 'Mobile 1 (hamburger)',
  args: { variant: 'mobile', menu: true },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};
export const MobileCompact = {
  name: 'Mobile 2 (no hamburger)',
  args: { variant: 'mobile', menu: false },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};
