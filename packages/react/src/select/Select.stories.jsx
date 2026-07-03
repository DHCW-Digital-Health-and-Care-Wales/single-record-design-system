import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@dhcw/sr-tokens/build/css/tokens.css';
import Select from './Select.jsx';

const OPTIONS = [
  { value: 'aneurin', label: 'Aneurin' },
  { value: 'glyndwr', label: 'Glyndŵr' },
  { value: 'tawe', label: 'Tawe' },
  { value: 'cynon', label: 'Cynon' },
];

function Demo(args) {
  const [value, setValue] = useState(args.value);
  return (
    <div style={{ maxWidth: 320, paddingBottom: 200 }}>
      <Select {...args} options={args.options || OPTIONS} value={value} onChange={setValue} />
    </div>
  );
}

const render = (args) => {
  const container = document.createElement('div');
  createRoot(container).render(<Demo {...args} />);
  return container;
};

export default {
  title: 'React/Select',
  tags: ['autodocs'],
  render,
  argTypes: {
    label: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    placeholder: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    value: { control: { type: 'select' }, options: [undefined, ...OPTIONS.map((o) => o.value)] },
  },
  args: {
    label: 'Ward',
    hint: 'Select the receiving ward',
    error: '',
    placeholder: 'Select an option',
    required: false,
    disabled: false,
    value: undefined,
  },
};

export const Default = {};
export const WithValue = { args: { value: 'glyndwr' } };
export const Required = { args: { required: true } };
export const Error = { args: { error: 'Select a ward to continue', hint: '' } };
export const Disabled = { args: { disabled: true, value: 'aneurin' } };
export const NestedOptions = {
  args: {
    label: 'Category',
    hint: '',
    options: [
      { value: 'obs', label: 'Observations', childMenu: true },
      { value: 'meds', label: 'Medications', childMenu: true },
      { value: 'notes', label: 'Notes' },
    ],
  },
};
