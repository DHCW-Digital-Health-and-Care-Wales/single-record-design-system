import React from 'react';
import { createRoot } from 'react-dom/client';
import '@dhcw/sr-tokens/build/css/tokens.css';
import Breadcrumbs from './Breadcrumbs.jsx';

const render = (args) => {
  const container = document.createElement('div');
  const root = createRoot(container);
  root.render(<Breadcrumbs items={args.items} />);
  return container;
};

export default {
  title: 'React/Breadcrumbs',
  tags: ['autodocs'],
  render,
  argTypes: {
    items: { control: 'object' },
  },
  args: {
    items: [
      { label: 'Home', href: '#' },
      { label: 'Level two', href: '#' },
      { label: 'Level three', href: '#' },
      { label: 'Level four' },
    ],
  },
};

export const Levels4 = {};
export const Levels3 = {
  args: { items: [{ label: 'Home', href: '#' }, { label: 'Level two', href: '#' }, { label: 'Level three' }] },
};
export const Levels2 = {
  args: { items: [{ label: 'Home', href: '#' }, { label: 'Level two' }] },
};
export const Levels1 = {
  args: { items: [{ label: 'Home' }] },
};
