import './tags.css';
import '@dhcw/sr-tokens/build/css/tokens.css';
import { iconMarkup } from '@dhcw/sr-icons/build/icons.js';

/**
 * Tag — DHCW Single Record Design System
 * Figma: Tags/status (399:7984) and Tags/filter (3229:71674)
 *
 * Two variants:
 *   status — filled pill, non-interactive label. Blue/Green/Red/Yellow/Grey/
 *            Outline.
 *   filter — outline pill with a close button, for dismissible filters.
 *            Blue/Green/Red/Yellow/Black.
 *
 * Colour is a secondary signal — the text always carries the meaning (WCAG 1.4.1).
 */

const STATUS_TYPES = ['blue', 'green', 'red', 'yellow', 'grey', 'outline'];
const FILTER_TYPES = ['blue', 'green', 'red', 'yellow', 'black'];

/** Build one tag. variant 'status' | 'filter'; filter tags always get a close button. */
const buildTag = (label, { variant = 'status', type = 'blue', size = 'default' } = {}) => {
  const span = document.createElement('span');
  span.className = `sr-tag sr-tag--${variant} sr-tag--${type} sr-tag--${size}`;
  const text = document.createElement('span');
  text.textContent = label;
  span.appendChild(text);
  if (variant === 'filter') {
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'sr-tag__close';
    close.setAttribute('aria-label', `Remove ${label}`);
    close.innerHTML = iconMarkup('nav/close');
    span.appendChild(close);
  }
  return span;
};

const render = ({ label, variant, type, size }) => buildTag(label, { variant, type, size });

export default {
  title: 'Components/Tag',
  tags: ['autodocs'],
  render,
  argTypes: {
    label: { control: 'text', description: 'Tag text — carries the meaning; keep it short.' },
    variant: { control: { type: 'inline-radio' }, options: ['status', 'filter'], description: 'status = filled label; filter = outline + close.' },
    type: { control: { type: 'select' }, options: [...new Set([...STATUS_TYPES, ...FILTER_TYPES])], description: 'Colour. Grey/Outline are status-only; Black is filter-only.' },
    size: { control: { type: 'inline-radio' }, options: ['default', 'small'] },
  },
  args: { label: 'Status', variant: 'status', type: 'blue', size: 'default' },
};

// --- Status tags ---
export const Status = { args: { variant: 'status', type: 'blue' } };
export const StatusGreen = { args: { variant: 'status', type: 'green', label: 'Active' } };
export const StatusOutline = { args: { variant: 'status', type: 'outline', label: 'Draft' } };

/** All status types × sizes. */
export const StatusMatrix = {
  render: () => {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;flex-direction:column;gap:16px;';
    ['default', 'small'].forEach((size) => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;gap:12px;align-items:center;flex-wrap:wrap;';
      STATUS_TYPES.forEach((type) => row.appendChild(buildTag('Status', { variant: 'status', type, size })));
      wrap.appendChild(row);
    });
    return wrap;
  },
};

// --- Filter tags ---
export const Filter = { args: { variant: 'filter', type: 'blue', label: 'Ward: Aneurin' } };

/** All filter types × sizes (outline + close). */
export const FilterMatrix = {
  render: () => {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;flex-direction:column;gap:16px;';
    ['default', 'small'].forEach((size) => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;gap:12px;align-items:center;flex-wrap:wrap;';
      FILTER_TYPES.forEach((type) => row.appendChild(buildTag('Status', { variant: 'filter', type, size })));
      wrap.appendChild(row);
    });
    return wrap;
  },
};

/** A row of active filter tags, as used above a filtered list or table. */
export const FilterTags = {
  render: () => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:8px;align-items:center;flex-wrap:wrap;';
    [
      ['Ward: Aneurin', 'blue'],
      ['Status: Active', 'green'],
      ['Priority: Urgent', 'red'],
      ['Coded', 'black'],
    ].forEach(([label, type]) => row.appendChild(buildTag(label, { variant: 'filter', type })));
    return row;
  },
};
