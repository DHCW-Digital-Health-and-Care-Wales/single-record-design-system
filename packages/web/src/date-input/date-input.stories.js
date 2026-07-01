import './date-input.css';
import '@dhcw/sr-tokens/build/css/tokens.css';

/**
 * Date input (3-field) — DHCW Single Record Design System
 * GDS/NHS date input pattern. See DDR-012.
 */

let uid = 0;

const render = ({ legend, hint, error, required, disabled, autoComplete }) => {
  const baseId = `sr-date-${(uid += 1)}`;
  const hasError = Boolean(error);
  const isDob = autoComplete === 'bday';

  const fieldset = document.createElement('fieldset');
  fieldset.className = ['sr-date-input', hasError ? 'sr-date-input--error' : '', disabled ? 'sr-date-input--disabled' : '']
    .filter(Boolean)
    .join(' ');

  const describedBy = [];
  if (legend) {
    const legendEl = document.createElement('legend');
    legendEl.className = 'sr-date-input__legend';
    legendEl.textContent = legend;
    if (required) {
      const req = document.createElement('span');
      req.className = 'sr-date-input__required';
      req.setAttribute('aria-hidden', 'true');
      req.textContent = ' *';
      legendEl.appendChild(req);
    }
    fieldset.appendChild(legendEl);
  }
  if (hint) {
    const hintEl = document.createElement('span');
    hintEl.className = 'sr-date-input__hint';
    hintEl.id = `${baseId}-hint`;
    hintEl.textContent = hint;
    fieldset.appendChild(hintEl);
    describedBy.push(`${baseId}-hint`);
  }
  if (hasError) describedBy.push(`${baseId}-error`);
  if (describedBy.length) fieldset.setAttribute('aria-describedby', describedBy.join(' '));

  const fields = document.createElement('div');
  fields.className = 'sr-date-input__fields';
  [
    { key: 'day', label: 'Day', max: 2, ac: isDob ? 'bday-day' : '' },
    { key: 'month', label: 'Month', max: 2, ac: isDob ? 'bday-month' : '' },
    { key: 'year', label: 'Year', max: 4, ac: isDob ? 'bday-year' : '' },
  ].forEach((p) => {
    const item = document.createElement('div');
    item.className = 'sr-date-input__item';
    const label = document.createElement('label');
    label.className = 'sr-date-input__item-label';
    label.htmlFor = `${baseId}-${p.key}`;
    label.textContent = p.label;
    const input = document.createElement('input');
    input.className = `sr-date-input__field sr-date-input__field--${p.key}`;
    input.id = `${baseId}-${p.key}`;
    input.type = 'text';
    input.inputMode = 'numeric';
    input.maxLength = p.max;
    if (p.ac) input.autocomplete = p.ac;
    if (disabled) input.disabled = true;
    if (hasError) input.setAttribute('aria-invalid', 'true');
    item.appendChild(label);
    item.appendChild(input);
    fields.appendChild(item);
  });
  fieldset.appendChild(fields);

  if (hasError) {
    const errorEl = document.createElement('span');
    errorEl.className = 'sr-date-input__error';
    errorEl.id = `${baseId}-error`;
    errorEl.textContent = error;
    fieldset.appendChild(errorEl);
  }

  return fieldset;
};

export default {
  title: 'Components/Date input',
  tags: ['autodocs'],
  render,
  argTypes: {
    legend: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    autoComplete: { control: 'select', options: ['', 'bday'] },
  },
  args: {
    legend: 'Date of birth',
    hint: 'For example, 27 3 1958',
    error: '',
    required: false,
    disabled: false,
    autoComplete: 'bday',
  },
};

export const DateOfBirth = {};
export const WithError = {
  args: { error: 'Date of birth must be a real date', hint: 'For example, 27 3 1958' },
};
export const Disabled = { args: { disabled: true } };
