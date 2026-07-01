import './input.css';
import '@dhcw/sr-tokens/build/css/tokens.css';
import { iconMarkup } from '@dhcw/sr-icons/build/icons.js';

/**
 * Input — DHCW Single Record Design System
 * Figma: Input set (840:14593).
 */

const TRAILING_ICON = { calendar: 'schedule/appointment', time: 'schedule/time' };
const HTML_TYPE = { text: 'text', password: 'password', phone: 'tel', calendar: 'text', time: 'text' };

let uid = 0;

const buildIcon = (name) => {
  const span = document.createElement('span');
  span.className = 'sr-input__icon';
  span.innerHTML = iconMarkup(name);
  return span;
};

const render = ({ type, label, hint, error, required, disabled, placeholder }) => {
  const id = `sr-input-${(uid += 1)}`;
  const isTextarea = type === 'textarea';
  const isPassword = type === 'password';
  const hasError = Boolean(error);

  const root = document.createElement('div');
  root.className = ['sr-input', hasError ? 'sr-input--error' : '', disabled ? 'sr-input--disabled' : '']
    .filter(Boolean)
    .join(' ');
  root.style.maxWidth = '280px';

  if (label) {
    const labelEl = document.createElement('label');
    labelEl.className = 'sr-input__label';
    labelEl.htmlFor = id;
    labelEl.textContent = label;
    if (required) {
      const req = document.createElement('span');
      req.className = 'sr-input__required';
      req.setAttribute('aria-hidden', 'true');
      req.textContent = '*';
      labelEl.appendChild(req);
    }
    root.appendChild(labelEl);
  }

  const describedBy = [];
  if (hint) {
    const hintEl = document.createElement('span');
    hintEl.className = 'sr-input__hint';
    hintEl.id = `${id}-hint`;
    hintEl.textContent = hint;
    root.appendChild(hintEl);
    describedBy.push(`${id}-hint`);
  }
  if (hasError) describedBy.push(`${id}-error`);

  const field = document.createElement('div');
  field.className = `sr-input__field${isTextarea ? ' sr-input__field--textarea' : ''}`;

  const control = document.createElement(isTextarea ? 'textarea' : 'input');
  control.className = 'sr-input__control';
  control.id = id;
  if (!isTextarea) control.type = isPassword ? 'password' : HTML_TYPE[type];
  if (placeholder) control.placeholder = placeholder;
  if (disabled) control.disabled = true;
  if (hasError) control.setAttribute('aria-invalid', 'true');
  if (describedBy.length) control.setAttribute('aria-describedby', describedBy.join(' '));
  field.appendChild(control);

  if (isPassword) {
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'sr-input__toggle';
    toggle.setAttribute('aria-label', 'Show password');
    toggle.innerHTML = iconMarkup('action/eye');
    toggle.disabled = Boolean(disabled);
    toggle.addEventListener('click', () => {
      const revealed = control.type === 'text';
      control.type = revealed ? 'password' : 'text';
      toggle.setAttribute('aria-label', revealed ? 'Show password' : 'Hide password');
      toggle.innerHTML = iconMarkup(revealed ? 'action/eye' : 'action/eye-off');
    });
    field.appendChild(toggle);
  } else if (TRAILING_ICON[type]) {
    field.appendChild(buildIcon(TRAILING_ICON[type]));
  }

  root.appendChild(field);

  if (hasError) {
    const errorEl = document.createElement('span');
    errorEl.className = 'sr-input__error';
    errorEl.id = `${id}-error`;
    errorEl.textContent = error;
    root.appendChild(errorEl);
  }

  return root;
};

export default {
  title: 'Components/Input',
  tags: ['autodocs'],
  render,
  argTypes: {
    type: { control: 'select', options: ['text', 'password', 'phone', 'calendar', 'time', 'textarea'] },
    label: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
  args: {
    type: 'text',
    label: 'Field label',
    hint: '',
    error: '',
    required: false,
    disabled: false,
    placeholder: 'Placeholder text',
  },
};

export const Default = {};
export const WithHint = { args: { hint: 'Hint text goes here' } };
export const Required = { args: { required: true, hint: 'Hint text goes here' } };
export const Error = {
  args: { error: 'Enter a valid value', hint: 'Hint text goes here', placeholder: 'Invalid entry' },
};
export const Disabled = { args: { disabled: true } };
export const Password = { args: { type: 'password', label: 'Password', placeholder: 'Enter password' } };
export const Phone = { args: { type: 'phone', label: 'Phone number', placeholder: '07000 000000' } };
export const Calendar = { args: { type: 'calendar', label: 'Appointment date', placeholder: 'DD/MM/YYYY' } };
export const Time = { args: { type: 'time', label: 'Appointment time', placeholder: 'HH:MM' } };
export const Textarea = {
  args: { type: 'textarea', label: 'Notes', hint: 'Add any relevant details', placeholder: 'Type here…' },
};
