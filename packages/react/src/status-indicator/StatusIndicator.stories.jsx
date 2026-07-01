import React from 'react';
import { createRoot } from 'react-dom/client';
import '@dhcw/sr-tokens/build/css/tokens.css';
import StatusIndicator from './StatusIndicator.jsx';

const render = (args) => {
  const container = document.createElement('div');
  const root = createRoot(container);
  root.render(<StatusIndicator status={args.status} size={args.size} label={args.label} />);
  return container;
};

export default {
  title: 'React/Status indicator',
  tags: ['autodocs'],
  render,
  argTypes: {
    status: { control: 'inline-radio', options: ['success', 'error', 'warning'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    label: { control: 'text' },
  },
  args: { status: 'success', size: 'lg', label: 'Success' },
};

export const Success = { args: { status: 'success', label: 'Success' } };
export const Error = { args: { status: 'error', label: 'Error' } };
export const Warning = { args: { status: 'warning', label: 'Warning' } };
