import React from 'react';
import { createRoot } from 'react-dom/client';
import '@dhcw/sr-tokens/build/css/tokens.css';
import Button from './Button.jsx';
import Icon from '../icon/Icon.jsx';

// color="inherit" — these icons sit inside .sr-button__icon and must inherit
// the button's own text colour (currentColor) so they stay readable across
// Type (white on Primary/Destructive, blue on Secondary/Ghost).
// Leading icon: generic stand-in (nav/home) — callers choose their own.
const leadingIconEl = <Icon name="nav/home" size="xs" color="inherit" />;
// Trailing icon: the standard "opens/reveals" affordance.
const trailingIconEl = <Icon name="nav/chevron-down" size="xs" color="inherit" />;

const render = (args) => {
  const container = document.createElement('div');
  const root = createRoot(container);
  root.render(
    <Button
      type={args.type}
      size={args.size}
      disabled={args.state === 'disabled'}
      leadingIcon={args.leadingIcon ? leadingIconEl : undefined}
      trailingIcon={args.trailingIcon ? trailingIconEl : undefined}
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
    leadingIcon: { control: 'boolean', description: 'nav/home — generic stand-in.' },
    trailingIcon: { control: 'boolean', description: 'nav/chevron-down — the "opens/reveals" affordance.' },
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

/** Trailing-chevron menu-button pattern — Change patient, filter, sort triggers. */
export const TrailingChevron = {
  args: { label: 'Change patient', leadingIcon: false, trailingIcon: true },
};

export const Matrix = {
  render: () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    root.render(
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {['primary', 'secondary', 'ghost', 'destructive'].map((type) => (
          <div key={type} style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            {['large', 'default', 'small'].map((size) => (
              <Button key={`${type}-${size}`} type={type} size={size} leadingIcon={leadingIconEl} trailingIcon={trailingIconEl}>
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
