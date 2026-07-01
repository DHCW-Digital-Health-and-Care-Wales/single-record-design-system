import './time-select.css';
import '@dhcw/sr-tokens/build/css/tokens.css';

/**
 * Time select — DHCW Single Record Design System
 * Constrained time entry (DDR-012).
 */

const pad = (n) => String(n).padStart(2, '0');

const buildSlots = (start, end, interval) => {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const out = [];
  for (let m = sh * 60 + sm; m <= eh * 60 + em; m += interval) {
    out.push(`${pad(Math.floor(m / 60))}:${pad(m % 60)}`);
  }
  return out;
};

let uid = 0;

const render = ({ label, start, end, interval, placeholder, disabled }) => {
  const id = `sr-time-${(uid += 1)}`;
  const wrap = document.createElement('div');
  wrap.className = 'sr-time-select';

  if (label) {
    const labelEl = document.createElement('label');
    labelEl.className = 'sr-time-select__label';
    labelEl.htmlFor = id;
    labelEl.textContent = label;
    wrap.appendChild(labelEl);
  }

  const select = document.createElement('select');
  select.className = 'sr-time-select__control';
  select.id = id;
  if (disabled) select.disabled = true;

  const ph = document.createElement('option');
  ph.value = '';
  ph.textContent = placeholder;
  select.appendChild(ph);

  buildSlots(start, end, interval).forEach((slot) => {
    const opt = document.createElement('option');
    opt.value = slot;
    opt.textContent = slot;
    select.appendChild(opt);
  });

  wrap.appendChild(select);
  return wrap;
};

export default {
  title: 'Components/Time select',
  tags: ['autodocs'],
  render,
  argTypes: {
    label: { control: 'text' },
    start: { control: 'text' },
    end: { control: 'text' },
    interval: { control: 'number' },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Appointment time',
    start: '08:00',
    end: '18:00',
    interval: 30,
    placeholder: 'Select a time',
    disabled: false,
  },
};

export const Default = {};
export const Disabled = { args: { disabled: true } };
