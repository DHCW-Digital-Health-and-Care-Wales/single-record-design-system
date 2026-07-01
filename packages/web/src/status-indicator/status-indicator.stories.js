import './status-indicator.css';
import '@dhcw/sr-tokens/build/css/tokens.css';

/**
 * Status indicator (filled) — DHCW Single Record Design System
 * Figma warnings/* group. See DDR-013.
 */

const GLYPHS = {
  success:
    '<circle cx="12" cy="12" r="10" fill="currentColor"/>' +
    '<path d="M8 12.5l2.6 2.6 5.4-6" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  error:
    '<circle cx="12" cy="12" r="10" fill="currentColor"/>' +
    '<line x1="12" y1="7" x2="12" y2="13" stroke="#fff" stroke-width="2" stroke-linecap="round"/>' +
    '<circle cx="12" cy="16.5" r="1.15" fill="#fff"/>',
  warning:
    '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" fill="currentColor"/>' +
    '<line x1="12" y1="9.5" x2="12" y2="14" stroke="#212b32" stroke-width="2" stroke-linecap="round"/>' +
    '<circle cx="12" cy="17" r="1.15" fill="#212b32"/>',
};

const buildOne = (status, size, label) => {
  const span = document.createElement('span');
  span.className = `sr-status-indicator sr-status-indicator--${status} sr-status-indicator--${size}`;
  if (label) {
    span.setAttribute('role', 'img');
    span.setAttribute('aria-label', label);
  } else {
    span.setAttribute('aria-hidden', 'true');
  }
  span.innerHTML = `<svg viewBox="0 0 24 24" width="100%" height="100%" focusable="false">${GLYPHS[status]}</svg>`;
  return span;
};

const render = ({ status, size, label }) => buildOne(status, size, label);

export default {
  title: 'Components/Status indicator',
  tags: ['autodocs'],
  render,
  argTypes: {
    status: { control: 'inline-radio', options: ['success', 'error', 'warning'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    label: { control: 'text' },
  },
  args: { status: 'success', size: 'lg', label: 'Success' },
};

export const Success = { args: { status: 'success', label: 'Success' } };
export const Error = { args: { status: 'error', label: 'Error' } };
export const Warning = { args: { status: 'warning', label: 'Warning' } };

export const AllStatuses = {
  render: () => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex; gap:16px; align-items:center;';
    row.appendChild(buildOne('success', 'lg', 'Success'));
    row.appendChild(buildOne('error', 'lg', 'Error'));
    row.appendChild(buildOne('warning', 'lg', 'Warning'));
    return row;
  },
};
