import React from 'react';
import { createRoot } from 'react-dom/client';
import '@dhcw/sr-tokens/build/css/tokens.css';
import SegmentedControl from './SegmentedControl.jsx';

const render = (args) => {
  const container = document.createElement('div');
  const root = createRoot(container);
  root.render(
    <SegmentedControl
      options={args.options}
      defaultValue={args.selected}
      disabled={args.disabled}
      ariaLabel={args.ariaLabel}
    />
  );
  return container;
};

export default {
  title: 'React/Segmented control',
  tags: ['autodocs'],
  render,
  argTypes: {
    selected: { control: 'text' },
    disabled: { control: 'boolean' },
    ariaLabel: { control: 'text' },
  },
  args: {
    options: [
      { label: 'Quick search', value: 'quick' },
      { label: 'Advanced', value: 'advanced' },
    ],
    selected: 'quick',
    disabled: false,
    ariaLabel: 'Search mode',
  },
};

export const TwoOption = {};
export const ThreeOption = {
  args: {
    options: [
      { label: 'Day', value: 'day' },
      { label: 'Week', value: 'week' },
      { label: 'Month', value: 'month' },
    ],
    selected: 'week',
    ariaLabel: 'Calendar view',
  },
};
export const Disabled = { args: { disabled: true } };
