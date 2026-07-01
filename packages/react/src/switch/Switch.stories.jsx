import React from 'react';
import { createRoot } from 'react-dom/client';
import '@dhcw/sr-tokens/build/css/tokens.css';
import Switch from './Switch.jsx';

const render = (args) => {
  const container = document.createElement('div');
  const root = createRoot(container);
  root.render(
    <Switch defaultChecked={args.checked} disabled={args.disabled} label={args.label} />
  );
  return container;
};

export default {
  title: 'React/Toggle switch',
  tags: ['autodocs'],
  render,
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
  },
  args: { checked: true, disabled: false, label: 'On' },
};

export const On = { args: { checked: true, label: 'On' } };
export const Off = { args: { checked: false, label: 'Off' } };
export const Disabled = { args: { checked: true, disabled: true, label: 'On' } };
