import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@dhcw/sr-tokens/build/css/tokens.css';
import DateInput from './DateInput.jsx';

const Demo = (args) => {
  const [value, setValue] = useState({ day: '', month: '', year: '' });
  return <DateInput {...args} value={value} onChange={setValue} />;
};

const render = (args) => {
  const container = document.createElement('div');
  const root = createRoot(container);
  root.render(<Demo {...args} />);
  return container;
};

export default {
  title: 'React/Date input',
  tags: ['autodocs'],
  render,
  argTypes: {
    legend: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    autoComplete: { control: 'select', options: ['', 'bday'] },
  },
  args: {
    legend: 'Date of birth',
    hint: 'For example, 27 3 1958',
    error: '',
    required: false,
    disabled: false,
    autoComplete: 'bday',
  },
};

export const DateOfBirth = {};
export const WithError = {
  args: { error: 'Date of birth must be a real date', hint: 'For example, 27 3 1958' },
};
export const Disabled = { args: { disabled: true } };
