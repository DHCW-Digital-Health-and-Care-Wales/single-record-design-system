import './button.css';

/**
 * Button — DHCW Single Record Design System
 * Figma: Button component set (1346:500)
 *
 * The reference HTML/CSS button. Blazor and React packages wrap this markup.
 */

/** Build a button element from args. */
const render = ({ label, type, size, disabled }) => {
  const btn = document.createElement('button');
  btn.className = [
    'sr-button',
    `sr-button--${type}`,
    size === 'large' ? 'sr-button--large' : '',
    size === 'small' ? 'sr-button--small' : '',
  ]
    .filter(Boolean)
    .join(' ');
  btn.textContent = label;
  if (disabled) btn.disabled = true;
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
      options: ['primary', 'secondary', 'ghost', 'warning'],
      description: 'Visual style. Figma: Type property.',
    },
    size: {
      control: { type: 'inline-radio' },
      options: ['large', 'default', 'small'],
      description: 'Figma: Size property.',
    },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Save record',
    type: 'primary',
    size: 'default',
    disabled: false,
  },
};

export const Primary = {};

export const Secondary = { args: { type: 'secondary', label: 'Cancel' } };

export const Ghost = { args: { type: 'ghost', label: 'Dismiss' } };

export const Warning = { args: { type: 'warning', label: 'Override alert' } };

export const Large = { args: { size: 'large' } };

export const Small = { args: { size: 'small' } };

export const Disabled = { args: { disabled: true } };

/** All four types side by side. */
export const AllTypes = {
  render: () => {
    const wrap = document.createElement('div');
    wrap.style.display = 'flex';
    wrap.style.gap = 'var(--space-4)';
    wrap.style.flexWrap = 'wrap';
    ['primary', 'secondary', 'ghost', 'warning'].forEach((type) => {
      wrap.appendChild(render({ label: type[0].toUpperCase() + type.slice(1), type, size: 'default' }));
    });
    return wrap;
  },
};
