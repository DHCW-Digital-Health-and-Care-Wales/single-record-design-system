import './switch.css';
import '@dhcw/sr-tokens/build/css/tokens.css';

/**
 * Toggle switch — DHCW Single Record Design System
 * Figma: Toggle/Switch (958:10576).
 */

const render = ({ checked, disabled, label }) => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'sr-switch';
  btn.setAttribute('role', 'switch');
  btn.setAttribute('aria-checked', String(Boolean(checked)));
  if (disabled) btn.disabled = true;

  const track = document.createElement('span');
  track.className = 'sr-switch__track';
  const thumb = document.createElement('span');
  thumb.className = 'sr-switch__thumb';
  track.appendChild(thumb);
  btn.appendChild(track);

  if (label) {
    const labelEl = document.createElement('span');
    labelEl.className = 'sr-switch__label';
    labelEl.textContent = label;
    btn.appendChild(labelEl);
  }

  btn.addEventListener('click', () => {
    if (btn.disabled) return;
    const on = btn.getAttribute('aria-checked') === 'true';
    btn.setAttribute('aria-checked', String(!on));
  });

  return btn;
};

export default {
  title: 'Components/Toggle switch',
  tags: ['autodocs'],
  render,
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
  },
  args: { checked: true, disabled: false, label: 'On' },
};

export const On = { args: { checked: true, label: 'On' } };
export const Off = { args: { checked: false, label: 'Off' } };
export const Disabled = { args: { checked: true, disabled: true, label: 'On' } };
