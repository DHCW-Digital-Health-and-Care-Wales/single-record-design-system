import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@dhcw/sr-tokens/build/css/tokens.css';
import Checkbox from './Checkbox.jsx';
import CheckboxGroup from './CheckboxGroup.jsx';

const NOTES = [
  { id: 'v1', label: 'General notes vol 1' },
  { id: 'v2', label: 'General notes vol 2' },
  { id: 'v3', label: 'General notes vol 3' },
];

function GroupDemo(args) {
  const [selected, setSelected] = useState(() => new Set(['v2']));
  const toggle = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div style={{ maxWidth: 360 }}>
      <CheckboxGroup {...args}>
        {NOTES.map((n) => (
          <Checkbox
            key={n.id}
            label={n.label}
            checked={selected.has(n.id)}
            error={!!args.error}
            onChange={() => toggle(n.id)}
          />
        ))}
      </CheckboxGroup>
    </div>
  );
}

const render = (args) => {
  const container = document.createElement('div');
  createRoot(container).render(<GroupDemo {...args} />);
  return container;
};

export default {
  title: 'React/Checkbox',
  tags: ['autodocs'],
  render,
  argTypes: {
    legend: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    required: { control: 'boolean' },
    orientation: { control: { type: 'inline-radio' }, options: ['vertical', 'horizontal'] },
  },
};

export const Default = {
  args: { legend: 'Case note type', hint: 'Select all that apply' },
};

export const Required = {
  args: { legend: 'Case note type', hint: 'Select all that apply', required: true },
};

export const WithError = {
  args: {
    legend: 'Case note type',
    hint: 'Select all that apply',
    required: true,
    error: 'Select at least one option',
  },
};

export const Horizontal = {
  args: { legend: 'Sites', orientation: 'horizontal' },
};

/**
 * Select-all driving an indeterminate parent — the pattern the case-notes table
 * uses for bulk row selection.
 */
function SelectAllDemo() {
  const [selected, setSelected] = useState(() => new Set(['v2']));
  const all = selected.size === NOTES.length;
  const some = selected.size > 0 && !all;

  const toggleAll = () =>
    setSelected(all ? new Set() : new Set(NOTES.map((n) => n.id)));

  const toggle = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div style={{ maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Checkbox
        label={`Select all notes${some ? ` (${selected.size} of ${NOTES.length})` : ''}`}
        checked={all}
        indeterminate={some}
        onChange={toggleAll}
      />
      <div style={{ paddingLeft: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {NOTES.map((n) => (
          <Checkbox
            key={n.id}
            label={n.label}
            checked={selected.has(n.id)}
            onChange={() => toggle(n.id)}
          />
        ))}
      </div>
    </div>
  );
}

export const SelectAll = {
  render: () => {
    const container = document.createElement('div');
    createRoot(container).render(<SelectAllDemo />);
    return container;
  },
};
