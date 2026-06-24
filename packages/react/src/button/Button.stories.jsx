import React from 'react';
import { createRoot } from 'react-dom/client';
import '@dhcw/sr-tokens/build/css/tokens.css';
import Button from './Button.jsx';

const homeIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const render = (args) => {
  const container = document.createElement('div');
  const root = createRoot(container);
  root.render(
    <Button
      type={args.type}
      size={args.size}
      disabled={args.state === 'disabled'}
      leadingIcon={args.leadingIcon ? homeIcon : undefined}
      trailingIcon={args.trailingIcon ? homeIcon : undefined}
    >
      {args.label}
    </Button>
  );
  return container;
};

export default {
  title: 'React/Button',
  tags: ['autodocs'],
  render,
  argTypes: {
    label: { control: 'text' },
    type: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'ghost', 'destructive'],
    },
    size: {
      control: { type: 'inline-radio' },
      options: ['large', 'default', 'small'],
    },
    state: {
      control: { type: 'inline-radio' },
      options: ['default', 'disabled'],
    },
    leadingIcon: { control: 'boolean' },
    trailingIcon: { control: 'boolean' },
  },
  args: {
    label: 'Button label',
    type: 'primary',
    size: 'large',
    state: 'default',
    leadingIcon: true,
    trailingIcon: true,
  },
};

export const Primary = {};
export const Secondary = { args: { type: 'secondary', label: 'Cancel' } };
export const Ghost = { args: { type: 'ghost', label: 'Dismiss' } };
export const Destructive = { args: { type: 'destructive', label: 'Delete record' } };
export const Disabled = { args: { state: 'disabled' } };
export const Small = { args: { size: 'small' } };

export const Matrix = {
  render: () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    root.render(
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {['primary', 'secondary', 'ghost', 'destructive'].map((type) => (
          <div key={type} style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            {['large', 'default', 'small'].map((size) => (
              <Button key={`${type}-${size}`} type={type} size={size} leadingIcon={homeIcon} trailingIcon={homeIcon}>
                Button label
              </Button>
            ))}
          </div>
        ))}
      </div>
    );
    return container;
  },
};
