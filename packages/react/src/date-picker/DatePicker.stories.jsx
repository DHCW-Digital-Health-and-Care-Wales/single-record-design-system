import React from 'react';
import { createRoot } from 'react-dom/client';
import '@dhcw/sr-tokens/build/css/tokens.css';
import DatePicker from './DatePicker.jsx';

const render = (args) => {
  const container = document.createElement('div');
  container.style.minHeight = '380px';
  const root = createRoot(container);
  root.render(<DatePicker label={args.label} placeholder={args.placeholder} />);
  return container;
};

export default {
  title: 'React/Date picker',
  tags: ['autodocs'],
  render,
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
  },
  args: {
    label: 'Choose date',
    placeholder: 'DD/MM/YYYY',
  },
};

export const Default = {};
