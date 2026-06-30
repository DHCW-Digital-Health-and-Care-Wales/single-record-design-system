import React from 'react';
import { createRoot } from 'react-dom/client';
import '@dhcw/sr-tokens/build/css/tokens.css';
import Header from './Header.jsx';

const LOGO_SRC =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="155" height="48" viewBox="0 0 155 48"><rect width="155" height="48" rx="4" fill="%23325083"/><text x="10" y="29" font-family="Roboto, sans-serif" font-size="14" fill="white">DHCW Single Record</text></svg>'
  );

const render = (args) => {
  const container = document.createElement('div');
  const root = createRoot(container);
  root.render(
    <Header
      logo={<img src={LOGO_SRC} alt="DHCW Single Record" style={{ height: 48 }} />}
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
    initials: { control: 'text' },
    searchPlaceholder: { control: 'text' },
  },
  args: {
    initials: 'AB',
    searchPlaceholder: 'Type here to begin search',
  },
};

export const Default = {};
