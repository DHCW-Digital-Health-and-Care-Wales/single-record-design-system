import './segmented-control.css';
import '@dhcw/sr-tokens/build/css/tokens.css';

/**
 * Segmented control — DHCW Single Record Design System
 * Figma: Toggle/Segmented Control (2752:40), two-option Toggle (2770:55996).
 */

const render = ({ options, selected, disabled, ariaLabel }) => {
  const group = document.createElement('div');
  group.className = 'sr-segmented';
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', ariaLabel || 'View');

  options.forEach((opt) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sr-segmented__option';
    btn.textContent = opt.label;
    btn.setAttribute('aria-pressed', String(opt.value === selected));
    if (disabled || opt.disabled) btn.disabled = true;
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      group
        .querySelectorAll('.sr-segmented__option')
        .forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    });
    group.appendChild(btn);
  });

  return group;
};

export default {
  title: 'Components/Segmented control',
  tags: ['autodocs'],
  render,
  argTypes: {
    selected: { control: 'text' },
    disabled: { control: 'boolean' },
    ariaLabel: { control: 'text' },
  },
  args: {
    options: [
      { label: 'Quick search', value: 'quick' },
      { label: 'Advanced', value: 'advanced' },
    ],
    selected: 'quick',
    disabled: false,
    ariaLabel: 'Search mode',
  },
};

export const TwoOption = {};
export const ThreeOption = {
  args: {
    options: [
      { label: 'Day', value: 'day' },
      { label: 'Week', value: 'week' },
      { label: 'Month', value: 'month' },
    ],
    selected: 'week',
    ariaLabel: 'Calendar view',
  },
};
export const Disabled = { args: { disabled: true } };
