import './tags.css';
import '@dhcw/sr-tokens/build/css/tokens.css';

/**
 * Tag — DHCW Single Record Design System
 * Figma: Tags set (399:7984)
 *
 * Pill-shaped status/label tags. Six colour types × two sizes. Colour is a
 * secondary signal — the text always carries the meaning (WCAG 1.4.1).
 */

const TYPES = ['blue', 'green', 'red', 'yellow', 'grey', 'outline'];

/** Build one tag element. */
const buildTag = (label, type = 'blue', size = 'default') => {
  const span = document.createElement('span');
  span.className = `sr-tag sr-tag--${type} sr-tag--${size}`;
  span.textContent = label;
  return span;
};

const render = ({ label, type, size }) => buildTag(label, type, size);

export default {
  title: 'Components/Tag',
  tags: ['autodocs'],
  render,
  argTypes: {
    label: { control: 'text', description: 'Tag text — carries the meaning; keep it short.' },
    type: { control: { type: 'select' }, options: TYPES, description: 'Figma: Type.' },
    size: { control: { type: 'inline-radio' }, options: ['default', 'small'], description: 'Figma: Size.' },
  },
  args: { label: 'Status', type: 'blue', size: 'default' },
};

export const Blue = {};
export const Green = { args: { type: 'green', label: 'Active' } };
export const Red = { args: { type: 'red', label: 'Critical' } };
export const Yellow = { args: { type: 'yellow', label: 'Pending' } };
export const Grey = { args: { type: 'grey', label: 'Inactive' } };
export const Outline = { args: { type: 'outline', label: 'Draft' } };
export const Small = { args: { size: 'small' } };

/** Full Type × Size matrix, mirroring the Figma component set. */
export const Matrix = {
  render: () => {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;flex-direction:column;gap:16px;';
    ['default', 'small'].forEach((size) => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;gap:12px;align-items:center;flex-wrap:wrap;';
      TYPES.forEach((type) => row.appendChild(buildTag('Status', type, size)));
      wrap.appendChild(row);
    });
    return wrap;
  },
};
