import './checkbox.css';
import '@dhcw/sr-tokens/build/css/tokens.css';
import { iconMarkup } from '@dhcw/sr-icons/build/icons.js';

/**
 * Checkbox — DHCW Single Record Design System
 * Figma: Checkbox (1517:13764), Checkbox/Building blocks (843:14568).
 *
 * A real <input type="checkbox"> laid transparently over the drawn box, so
 * native semantics, keyboard behaviour and form participation are preserved.
 * The tick and the indeterminate dash are drawn in CSS — no icon asset.
 *
 * The required asterisk sits on the group legend, not on individual options
 * (components/form-fields.md), and is decorative: pair it with aria-required.
 */

let uid = 0;

/** One option. `state` may include checked / indeterminate / disabled / error. */
function option({ label = 'Option label', checked, indeterminate, disabled, error } = {}) {
  const id = `sr-cb-${++uid}`;
  const wrap = document.createElement('div');
  wrap.className = ['sr-checkbox', error && 'sr-checkbox--error'].filter(Boolean).join(' ');

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.className = 'sr-checkbox__input';
  input.id = id;
  input.checked = !!checked;
  input.disabled = !!disabled;
  if (error) input.setAttribute('aria-invalid', 'true');
  // indeterminate is a DOM property, not an attribute
  input.indeterminate = !!indeterminate;

  const lab = document.createElement('label');
  lab.className = 'sr-checkbox__label';
  lab.htmlFor = id;
  lab.textContent = label;

  wrap.append(input, lab);
  return wrap;
}

/** A full group: legend, hint, error, options. */
function group({
  legend = 'Legend',
  hint,
  error,
  required = false,
  orientation = 'vertical',
  options = [{}, {}, {}],
} = {}) {
  const id = `sr-cbg-${++uid}`;
  const fs = document.createElement('fieldset');
  fs.className = ['sr-checkbox-group', error && 'sr-checkbox-group--error']
    .filter(Boolean)
    .join(' ');

  const describedBy = [];

  if (legend) {
    const lg = document.createElement('legend');
    lg.className = 'sr-checkbox-group__legend';
    const text = document.createElement('span');
    text.textContent = legend;
    lg.appendChild(text);
    if (required) {
      const star = document.createElement('span');
      star.className = 'sr-checkbox-group__required';
      star.setAttribute('aria-hidden', 'true');
      star.textContent = '*';
      lg.appendChild(star);
      fs.setAttribute('aria-required', 'true');
    }
    fs.appendChild(lg);
  }

  if (hint) {
    const h = document.createElement('p');
    h.className = 'sr-checkbox-group__hint';
    h.id = `${id}-hint`;
    h.textContent = hint;
    describedBy.push(h.id);
    fs.appendChild(h);
  }

  if (error) {
    const e = document.createElement('div');
    e.className = 'sr-checkbox-group__error';
    e.id = `${id}-error`;
    const icon = document.createElement('span');
    icon.className = 'sr-checkbox-group__error-icon';
    icon.innerHTML = iconMarkup('status/error-circle');
    const msg = document.createElement('span');
    msg.textContent = error;
    e.append(icon, msg);
    describedBy.push(e.id);
    fs.setAttribute('aria-invalid', 'true');
    fs.appendChild(e);
  }

  if (describedBy.length) fs.setAttribute('aria-describedby', describedBy.join(' '));

  const list = document.createElement('div');
  list.className = [
    'sr-checkbox-group__options',
    orientation === 'horizontal' && 'sr-checkbox-group__options--horizontal',
  ]
    .filter(Boolean)
    .join(' ');
  options.forEach((o) => list.appendChild(option({ ...o, error: !!error })));
  fs.appendChild(list);

  return fs;
}

function row(children, gap = 32) {
  const d = document.createElement('div');
  d.style.cssText = `display:flex;gap:${gap}px;flex-wrap:wrap;align-items:flex-start`;
  children.forEach((c) => d.appendChild(c));
  return d;
}

export default {
  title: 'Components/Checkbox',
  parameters: { layout: 'padded' },
};

export const Default = () => group({ hint: 'Hint text' });

/** The 11 building-block states from the Figma set. */
export const States = () =>
  row([
    group({
      legend: 'Default',
      options: [{ label: 'Unchecked' }, { label: 'Checked', checked: true }, { label: 'Indeterminate', indeterminate: true }],
    }),
    group({
      legend: 'Error',
      error: 'Select at least one option',
      options: [{ label: 'Unchecked' }, { label: 'Checked', checked: true }],
    }),
    group({
      legend: 'Disabled',
      options: [
        { label: 'Unchecked', disabled: true },
        { label: 'Checked', checked: true, disabled: true },
        { label: 'Indeterminate', indeterminate: true, disabled: true },
      ],
    }),
  ]);

export const Required = () =>
  group({ legend: 'Case note type', required: true, hint: 'Select all that apply' });

export const Horizontal = () =>
  group({
    legend: 'Sites',
    orientation: 'horizontal',
    options: [{ label: 'All Sites' }, { label: 'GGH', checked: true }, { label: 'A&E Dept' }],
  });

export const WithError = () =>
  group({
    legend: 'Case note type',
    hint: 'Select all that apply',
    error: 'Select at least one option',
    required: true,
  });

/** Select-all driving an indeterminate parent — the table row-selection pattern. */
export const SelectAll = () => {
  const wrap = document.createElement('div');
  const parent = option({ label: 'Select all notes' });
  const children = [
    option({ label: 'General notes vol 1' }),
    option({ label: 'General notes vol 2' }),
    option({ label: 'General notes vol 3' }),
  ];

  const parentInput = parent.querySelector('input');
  const childInputs = children.map((c) => c.querySelector('input'));

  const sync = () => {
    const n = childInputs.filter((i) => i.checked).length;
    parentInput.checked = n === childInputs.length;
    parentInput.indeterminate = n > 0 && n < childInputs.length;
  };
  parentInput.addEventListener('change', () => {
    childInputs.forEach((i) => { i.checked = parentInput.checked; });
    parentInput.indeterminate = false;
  });
  childInputs.forEach((i) => i.addEventListener('change', sync));

  const list = document.createElement('div');
  list.className = 'sr-checkbox-group__options';
  list.style.paddingLeft = '28px';
  children.forEach((c) => list.appendChild(c));

  const outer = document.createElement('div');
  outer.className = 'sr-checkbox-group__options';
  outer.append(parent, list);
  wrap.appendChild(outer);
  sync();
  return wrap;
};
