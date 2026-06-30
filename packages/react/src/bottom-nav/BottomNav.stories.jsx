import React from 'react';
import { createRoot } from 'react-dom/client';
import '@dhcw/sr-tokens/build/css/tokens.css';
import BottomNav from './BottomNav.jsx';

const ITEMS = [
  { icon: 'nav/home', label: 'Home', href: '#' },
  { icon: 'schedule/appointment', label: 'Diary', href: '#' },
  { icon: 'people/patient', label: 'Patients', href: '#' },
  { icon: 'comms/message', label: 'Messages', href: '#' },
  { icon: 'nav/more', label: 'More', href: '#' },
];

const render = (args) => {
  const container = document.createElement('div');
  container.style.maxWidth = '390px';
  const root = createRoot(container);
  root.render(<BottomNav items={ITEMS} current={args.current} />);
  return container;
};

export default {
  title: 'React/Bottom navigation',
  tags: ['autodocs'],
  render,
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  argTypes: {
    current: { control: 'text', description: 'Label of the active tab.' },
  },
  args: {
    current: 'Home',
  },
};

export const Default = {};
