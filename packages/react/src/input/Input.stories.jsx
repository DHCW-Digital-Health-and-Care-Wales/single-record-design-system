import React from 'react';
import { createRoot } from 'react-dom/client';
import '@dhcw/sr-tokens/build/css/tokens.css';
import Input from './Input.jsx';

const render = (args) => {
  const container = document.createElement('div');
  container.style.maxWidth = '280px';
  const root = createRoot(container);
  root.render(<Input {...args} />);
  return container;
};

export default {
  title: 'React/Input',
  tags: ['autodocs'],
  render,
  argTypes: {
    type: { control: 'select', options: ['text', 'password', 'phone', 'calendar', 'time', 'textarea'] },
    label: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
  args: {
    type: 'text',
    label: 'Field label',
    hint: '',
    error: '',
    required: false,
    disabled: false,
    placeholder: 'Placeholder text',
  },
};

export const Default = {};
export const WithHint = { args: { hint: 'Hint text goes here' } };
export const Required = { args: { required: true, hint: 'Hint text goes here' } };
export const Error = {
  args: { error: 'Enter a valid value', hint: 'Hint text goes here', placeholder: 'Invalid entry' },
};
export const Disabled = { args: { disabled: true } };
export const Password = { args: { type: 'password', label: 'Password', placeholder: 'Enter password' } };
export const Phone = { args: { type: 'phone', label: 'Phone number', placeholder: '07000 000000' } };
export const Calendar = { args: { type: 'calendar', label: 'Date of birth', placeholder: 'DD/MM/YYYY' } };
export const Time = { args: { type: 'time', label: 'Appointment time', placeholder: 'HH:MM' } };
export const Textarea = {
  args: { type: 'textarea', label: 'Notes', hint: 'Add any relevant details', placeholder: 'Type here…' },
};
