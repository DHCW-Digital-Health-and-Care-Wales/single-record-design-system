import './link.css';
import '@dhcw/sr-tokens/build/css/tokens.css';
import { iconMarkup } from '@dhcw/sr-icons/build/icons.js';

/**
 * Link — DHCW Single Record Design System
 *
 * Navigation, not action. A link goes somewhere; a Button does something.
 */

const link = ({
  label = 'Patient summary', size = 'inherit', type = 'default',
  icon = '', newTab = false, disabled = false,
} = {}) => {
  const a = document.createElement('a');
  a.className = [
    'sr-link',
    size !== 'inherit' && `sr-link--${size}`,
    type === 'destructive' && 'sr-link--destructive',
    icon && 'sr-link--icon',
  ].filter(Boolean).join(' ');
  if (disabled) {
    a.setAttribute('aria-disabled', 'true');
    a.setAttribute('role', 'link');
  } else {
    a.href = '#';
    if (newTab) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
  }
  if (icon) {
    const s = document.createElement('span');
    s.className = 'sr-link__icon';
    s.setAttribute('aria-hidden', 'true');
    s.innerHTML = iconMarkup(icon);
    a.appendChild(s);
  }
  const span = document.createElement('span');
  span.textContent = newTab ? `${label} (opens in a new tab)` : label;
  a.appendChild(span);
  return a;
};

export default {
  title: 'Components/Link',
  tags: ['autodocs'],
  render: (args) => {
    const wrap = document.createElement('div');
    wrap.appendChild(link(args));
    return wrap;
  },
  argTypes: {
    label: { control: 'text' },
    size: { control: 'radio', options: ['inherit', 'lg', 'md', 'sm'] },
    type: { control: 'radio', options: ['default', 'destructive'] },
    icon: { control: 'text' },
    newTab: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: { label: 'Patient summary', size: 'inherit', type: 'default', icon: '', newTab: false, disabled: false },
};

export const Default = {};

/** The common case: a link inside a sentence, at the sentence's own size. */
export const InProse = {
  render: () => {
    const p = document.createElement('p');
    p.style.cssText = 'max-width:46ch; font:var(--sr-type-body-m-font);';
    p.append(
      'The record was last updated by another team. Open the ',
      link({ label: 'full audit history' }),
      ' to see who changed what, and when.',
    );
    return p;
  },
};

/** Standalone links, at the three sizes. */
export const Sizes = {
  render: () => {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex; flex-direction:column; gap:12px; align-items:flex-start;';
    ['lg', 'md', 'sm'].forEach((size) => wrap.appendChild(link({ size, label: `Patient summary (${size})` })));
    return wrap;
  },
};

/** The leading icon is decorative, so "opens in a new tab" is written out. */
export const WithIcon = {
  render: () => {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex; flex-direction:column; gap:12px; align-items:flex-start;';
    wrap.appendChild(link({ size: 'lg', icon: 'action/download', label: 'Download the discharge summary' }));
    wrap.appendChild(link({ size: 'lg', icon: 'action/send', label: 'Open in Welsh Clinical Portal', newTab: true }));
    return wrap;
  },
};

/** Destructive opens a flow; it never performs the act. Light mode only until
 *  the dark-mode red is settled — see the open finding in check-contrast. */
export const Destructive = {
  args: { type: 'destructive', size: 'lg', label: 'Remove this patient from the list' },
};

/** Usually the wrong pattern. Prefer removing the link and leaving plain text. */
export const Disabled = { args: { disabled: true, size: 'lg' } };
