import React from 'react';
import { createRoot } from 'react-dom/client';
import '@dhcw/sr-tokens/build/css/tokens.css';
import TimeSelect from './TimeSelect.jsx';

const render = (args) => {
  const container = document.createElement('div');
  const root = createRoot(container);
  root.render(
    <TimeSelect
      label={args.label}
      start={args.start}
      end={args.end}
      interval={args.interval}
      placeholder={args.placeholder}
      disabled={args.disabled}
    />
  );
  return container;
};

export default {
  title: 'React/Time select',
  tags: ['autodocs'],
  render,
  argTypes: {
    label: { control: 'text' },
    start: { control: 'text' },
    end: { control: 'text' },
    interval: { control: 'number' },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Appointment time',
    start: '08:00',
    end: '18:00',
    interval: 30,
    placeholder: 'Select a time',
    disabled: false,
  },
};

export const Default = {};
export const Disabled = { args: { disabled: true } };
