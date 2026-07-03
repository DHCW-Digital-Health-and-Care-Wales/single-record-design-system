import React from 'react';
import { createRoot } from 'react-dom/client';
import '@dhcw/sr-tokens/build/css/tokens.css';
import Tag from './Tag.jsx';

const TYPES = ['blue', 'green', 'red', 'yellow', 'grey', 'outline'];

const render = ({ label, type, size, closable }) => {
  const container = document.createElement('div');
  createRoot(container).render(
    <Tag
      type={type}
      size={size}
      onClose={closable ? () => {} : undefined}
      closeLabel={`Remove ${label}`}
    >
      {label}
    </Tag>
  );
  return container;
};

export default {
  title: 'React/Tag',
  tags: ['autodocs'],
  render,
  argTypes: {
    label: { control: 'text' },
    type: { control: { type: 'select' }, options: TYPES },
    size: { control: { type: 'inline-radio' }, options: ['default', 'small'] },
    closable: { control: 'boolean', description: 'Renders a dismiss button (filter tag).' },
  },
  args: { label: 'Status', type: 'blue', size: 'default', closable: false },
};

export const Blue = {};
export const Green = { args: { type: 'green', label: 'Active' } };
export const Outline = { args: { type: 'outline', label: 'Draft' } };
export const Closable = { args: { closable: true, label: 'Ward: Aneurin' } };

/** A row of active filter tags. */
export const FilterTags = {
  render: () => {
    const container = document.createElement('div');
    createRoot(container).render(
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <Tag type="blue" onClose={() => {}} closeLabel="Remove Ward: Aneurin">Ward: Aneurin</Tag>
        <Tag type="green" onClose={() => {}} closeLabel="Remove Status: Active">Status: Active</Tag>
        <Tag type="red" onClose={() => {}} closeLabel="Remove Priority: Urgent">Priority: Urgent</Tag>
      </div>
    );
    return container;
  },
};
