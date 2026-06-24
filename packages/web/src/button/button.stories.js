import './button.css';

/**
 * Button — DHCW Single Record Design System
 * Figma: Button component set (1346:500)
 *
 * The reference HTML/CSS button. Blazor and React packages wrap this markup.
 *
 * Icons: the component exposes leading/trailing icon SLOTS (.sr-button__icon).
 * The home glyph used in these stories is a stand-in for demonstration only —
 * production code injects an icon from @dhcw/sr-icons. The Button never
 * hardcodes an icon.
 */

// Stand-in 16px home glyph (Icon/nav/home in Figma). Demo only.
const homeIconSvg = `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
  <polyline points="9 22 9 12 15 12 15 22"/>
</svg>`;

const iconSlot = () => {
  const span = document.createElement('span');
  span.className = 'sr-button__icon';
  span.innerHTML = homeIconSvg;
  return span;
};

/** Build a button element from args. */
const render = ({ label, type, size, state, leadingIcon, trailingIcon }) => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `sr-button sr-button--${type} sr-button--${size}`;
  if (leadingIcon) btn.appendChild(iconSlot());
  const text = document.createElement('span');
  text.textContent = label;
  btn.appendChild(text);
  if (trailingIcon) btn.appendChild(iconSlot());
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
    leadingIcon: { control: 'boolean' },
    trailingIcon: { control: 'boolean' },
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
