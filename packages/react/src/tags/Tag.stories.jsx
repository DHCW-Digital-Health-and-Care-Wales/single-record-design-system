import React from 'react';
import { createRoot } from 'react-dom/client';
import '@dhcw/sr-tokens/build/css/tokens.css';
import Tag from './Tag.jsx';

const STATUS_TYPES = ['blue', 'green', 'red', 'yellow', 'grey', 'outline'];
const FILTER_TYPES = ['blue', 'green', 'red', 'yellow', 'black'];

const render = ({ label, variant, type, size }) => {
  const container = document.createElement('div');
  createRoot(container).render(
    <Tag variant={variant} type={type} size={size} onClose={() => {}} closeLabel={`Remove ${label}`}>
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
    variant: { control: { type: 'inline-radio' }, options: ['status', 'filter'] },
    type: { control: { type: 'select' }, options: [...new Set([...STATUS_TYPES, ...FILTER_TYPES])] },
    size: { control: { type: 'inline-radio' }, options: ['default', 'small'] },
  },
  args: { label: 'Status', variant: 'status', type: 'blue', size: 'default' },
};

export const Status = {};
export const StatusOutline = { args: { variant: 'status', type: 'outline', label: 'Draft' } };
export const Filter = { args: { variant: 'filter', type: 'blue', label: 'Ward: Aneurin' } };

/** A row of active filter tags. */
export const FilterTags = {
  render: () => {
    const container = document.createElement('div');
    createRoot(container).render(
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <Tag variant="filter" type="blue" onClose={() => {}} closeLabel="Remove Ward: Aneurin">Ward: Aneurin</Tag>
        <Tag variant="filter" type="green" onClose={() => {}} closeLabel="Remove Status: Active">Status: Active</Tag>
        <Tag variant="filter" type="red" onClose={() => {}} closeLabel="Remove Priority: Urgent">Priority: Urgent</Tag>
        <Tag variant="filter" type="black" onClose={() => {}} closeLabel="Remove Coded">Coded</Tag>
      </div>
    );
    return container;
  },
};
