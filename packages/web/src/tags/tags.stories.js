import './tags.css';
import '@dhcw/sr-tokens/build/css/tokens.css';
import { iconMarkup } from '@dhcw/sr-icons/build/icons.js';

/**
 * Tag — DHCW Single Record Design System
 * Figma: Tags set (399:7984)
 *
 * Pill-shaped status/label tags. Six colour types × two sizes, with an
 * optional close button for dismissible filter tags. Colour is a secondary
 * signal — the text always carries the meaning (WCAG 1.4.1).
 */

const TYPES = ['blue', 'green', 'red', 'yellow', 'grey', 'outline'];

/** Build one tag element. Pass `closable` for a dismissible filter tag. */
const buildTag = (label, type = 'blue', size = 'default', closable = false) => {
  const span = document.createElement('span');
  span.className = `sr-tag sr-tag--${type} sr-tag--${size}${closable ? ' sr-tag--closable' : ''}`;
  const text = document.createElement('span');
  text.textContent = label;
  span.appendChild(text);
  if (closable) {
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'sr-tag__close';
    close.setAttribute('aria-label', `Remove ${label}`);
    close.innerHTML = iconMarkup('nav/close');
    span.appendChild(close);
  }
  return span;
};

const render = ({ label, type, size, closable }) => buildTag(label, type, size, closable);

export default {
  title: 'Components/Tag',
  tags: ['autodocs'],
  render,
  argTypes: {
    label: { control: 'text', description: 'Tag text — carries the meaning; keep it short.' },
    type: { control: { type: 'select' }, options: TYPES, description: 'Figma: Type.' },
    size: { control: { type: 'inline-radio' }, options: ['default', 'small'], description: 'Figma: Size.' },
    closable: { control: 'boolean', description: 'Figma: Close icon. Adds a dismiss button — use for filter tags.' },
  },
  args: { label: 'Status', type: 'blue', size: 'default', closable: false },
};

export const Blue = {};
export const Green = { args: { type: 'green', label: 'Active' } };
export const Red = { args: { type: 'red', label: 'Critical' } };
export const Yellow = { args: { type: 'yellow', label: 'Pending' } };
export const Grey = { args: { type: 'grey', label: 'Inactive' } };
export const Outline = { args: { type: 'outline', label: 'Draft' } };
export const Small = { args: { size: 'small' } };

/** Dismissible filter tag with a close button. */
export const Closable = { args: { closable: true, label: 'Ward: Aneurin' } };

/** A row of active filter tags, as used above a filtered list or table. */
export const FilterTags = {
  render: () => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:8px;align-items:center;flex-wrap:wrap;';
    [
      ['Ward: Aneurin', 'blue'],
      ['Status: Active', 'green'],
      ['Priority: Urgent', 'red'],
    ].forEach(([label, type]) => row.appendChild(buildTag(label, type, 'default', true)));
    return row;
  },
};

/** Full Type × Size × Close matrix, mirroring the Figma component set. */
export const Matrix = {
  render: () => {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;flex-direction:column;gap:16px;';
    ['default', 'small'].forEach((size) => {
      [false, true].forEach((closable) => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;gap:12px;align-items:center;flex-wrap:wrap;';
        TYPES.forEach((type) => row.appendChild(buildTag('Status', type, size, closable)));
        wrap.appendChild(row);
      });
    });
    return wrap;
  },
};
