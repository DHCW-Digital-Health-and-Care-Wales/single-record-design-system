import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@dhcw/sr-tokens/build/css/tokens.css';
import Autocomplete from './Autocomplete.jsx';

const WARDS = [
  'Aneurin', 'Glyndŵr', 'Tawe', 'Cynon', 'Rhondda', 'Taf', 'Cleddau',
  'Preseli', 'Gwaun', 'Teifi', 'Ystwyth', 'Cothi',
].map((w) => ({ value: w.toLowerCase(), label: `${w} Ward` }));

function Demo(args) {
  const [value, setValue] = useState();
  return (
    <div style={{ maxWidth: 320, paddingBottom: 220 }}>
      <Autocomplete {...args} options={WARDS} value={value} onChange={setValue} />
    </div>
  );
}

const render = (args) => {
  const container = document.createElement('div');
  createRoot(container).render(<Demo {...args} />);
  return container;
};

export default {
  title: 'React/Autocomplete',
  tags: ['autodocs'],
  render,
  argTypes: {
    label: { control: 'text' },
    hint: { control: 'text' },
    placeholder: { control: 'text' },
  },
  args: {
    label: 'Ward',
    hint: 'Start typing to search wards',
    placeholder: 'Search wards…',
  },
};

export const Default = {};
export const NoHint = { args: { hint: '' } };
