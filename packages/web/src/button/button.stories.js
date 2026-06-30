import './button.css';
import { iconMarkup } from '@dhcw/sr-icons/build/icons.js';

/**
 * Button — DHCW Single Record Design System
 * Figma: Button component set (1346:500)
 *
 * The reference HTML/CSS button. Blazor and React packages wrap this markup.
 *
 * Icons: the component exposes leading/trailing icon SLOTS (.sr-button__icon),
 * filled from @dhcw/sr-icons. Leading icon defaults to a generic action glyph
 * (nav/home) — callers choose whatever leading icon suits the action. Trailing
 * icon defaults to nav/chevron-down, the standard "this button opens/reveals
 * something" affordance (menus, expandable actions) — see the real Patient
 * Banner / Navigation components in Figma (1307:16983) for the same pattern.
 */

// Icon inherits the button's own text colour via currentColor — no fixed
// sr-icon colour class here, since that color must change with Type
// (white on Primary/Destructive, brand blue on Secondary/Ghost).
const iconSlot = (name) => {
  const span = document.createElement('span');
  span.className = 'sr-button__icon';
  span.innerHTML = iconMarkup(name);
  return span;
};

/** Build a button element from args. */
const render = ({ label, type, size, state, leadingIcon, trailingIcon }) => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `sr-button sr-button--${type} sr-button--${size}`;
  if (leadingIcon) btn.appendChild(iconSlot('nav/home'));
  const text = document.createElement('span');
  text.textContent = label;
  btn.appendChild(text);
  if (trailingIcon) btn.appendChild(iconSlot('nav/chevron-down'));
  if (state === 'disabled') btn.disabled = true;
  // Hover/Focus are real pseudo-classes — use the toolbar/keyboard to see them.
  return btn;
};

export default {
  title: 'Components/Button',
  tags: ['autodocs'],
  render,
  argTypes: {
    label: { control: 'text', description: 'Button text — name the action, not "OK".' },
    type: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'ghost', 'destructive'],
      description: 'Figma: Type. "destructive" renders red for irreversible actions — see DDR-008.',
    },
    size: {
      control: { type: 'inline-radio' },
      options: ['large', 'default', 'small'],
      description: 'Figma: Size.',
    },
    state: {
      control: { type: 'inline-radio' },
      options: ['default', 'disabled'],
      description: 'Hover/Focus are live CSS states — hover or tab to the button to see them.',
    },
    leadingIcon: { control: 'boolean', description: 'nav/home — generic stand-in. Callers choose their own leading icon from @dhcw/sr-icons.' },
    trailingIcon: { control: 'boolean', description: 'nav/chevron-down — the "opens/reveals" affordance.' },
  },
  args: {
    label: 'Button label',
    type: 'primary',
    size: 'large',
    state: 'default',
    leadingIcon: true,
    trailingIcon: true,
  },
};

export const Primary = {};
export const Secondary = { args: { type: 'secondary', label: 'Cancel' } };
export const Ghost = { args: { type: 'ghost', label: 'Dismiss' } };
export const Destructive = { args: { type: 'destructive', label: 'Delete record' } };

export const Disabled = { args: { state: 'disabled' } };
export const NoIcons = { args: { leadingIcon: false, trailingIcon: false } };
export const Small = { args: { size: 'small' } };

/** Trailing-chevron menu-button pattern — Change patient, filter, sort triggers. */
export const TrailingChevron = {
  args: { label: 'Change patient', leadingIcon: false, trailingIcon: true },
};

/** The full Type × Size matrix, mirroring the Figma component set. */
export const Matrix = {
  render: () => {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;flex-direction:column;gap:24px;';
    ['primary', 'secondary', 'ghost', 'destructive'].forEach((type) => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;gap:16px;align-items:center;flex-wrap:wrap;';
      ['large', 'default', 'small'].forEach((size) => {
        row.appendChild(
          render({ label: 'Button label', type, size, state: 'default', leadingIcon: true, trailingIcon: true })
        );
      });
      wrap.appendChild(row);
    });
    return wrap;
  },
};
