import React from 'react';
import { createRoot } from 'react-dom/client';
import '@dhcw/sr-tokens/build/css/tokens.css';
import '@dhcw/sr-web/src/button/button.css';
import Footer from './Footer.jsx';

const render = (args) => {
  const container = document.createElement('div');
  const root = createRoot(container);
  root.render(<Footer version={args.version} />);
  return container;
};

export default {
  title: 'React/Footer',
  tags: ['autodocs'],
  render,
  argTypes: {
    version: { control: 'text' },
  },
  args: {
    version: 'v 0.1.0.1112',
  },
};

export const Default = {};
