import './select.css';
import '@dhcw/sr-tokens/build/css/tokens.css';
import { iconMarkup } from '@dhcw/sr-icons/build/icons.js';

/**
 * Select — DHCW Single Record Design System
 * Figma: Select set (building blocks 1517:14820, options 1517:14856,
 * composed 1517:14471).
 *
 * A custom-styled single-select. The trigger is a real <button>
 * (aria-haspopup="listbox"); the menu is role="listbox" with role="option"
 * items. Keyboard: Enter/Space/Arrow to open, Up/Down to move, Enter to
 * choose, Esc to close. Selected + hover + keyboard-active options share the
 * brand-blue fill.
 */

let uid = 0;

const OPTIONS = [
  { value: 'aneurin', label: 'Aneurin' },
  { value: 'glyndwr', label: 'Glyndŵr' },
  { value: 'tawe', label: 'Tawe' },
  { value: 'cynon', label: 'Cynon' },
];

/** Build a fully wired select. */
const buildSelect = ({
  label,
  hint,
  error,
  required,
  disabled,
  placeholder = 'Select an option',
  options = OPTIONS,
  value,
} = {}) => {
  const id = `sel-${(uid += 1)}`;
  const hasError = Boolean(error);

  const root = document.createElement('div');
  root.className = ['sr-select', hasError && 'sr-select--error', disabled && 'sr-select--disabled']
    .filter(Boolean)
    .join(' ');

  // Label
  if (label) {
    const lab = document.createElement('label');
    lab.className = 'sr-select__label';
    lab.id = `${id}-label`;
    lab.textContent = label;
    if (required) {
      const star = document.createElement('span');
      star.className = 'sr-select__required';
      star.setAttribute('aria-hidden', 'true');
      star.textContent = '*';
      lab.appendChild(star);
    }
    root.appendChild(lab);
  }

  // Hint
  if (hint) {
    const h = document.createElement('div');
    h.className = 'sr-select__hint';
    h.id = `${id}-hint`;
    h.textContent = hint;
    root.appendChild(h);
  }

  // Control (trigger + menu)
  const control = document.createElement('div');
  control.className = 'sr-select__control';

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'sr-select__trigger';
  trigger.id = `${id}-trigger`;
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');
  if (label) trigger.setAttribute('aria-labelledby', `${id}-label ${id}-trigger`);
  const describedBy = [];
  if (hint) describedBy.push(`${id}-hint`);
  if (hasError) describedBy.push(`${id}-error`);
  if (describedBy.length) trigger.setAttribute('aria-describedby', describedBy.join(' '));
  if (hasError) trigger.setAttribute('aria-invalid', 'true');
  if (disabled) trigger.disabled = true;

  const valueEl = document.createElement('span');
  valueEl.className = 'sr-select__value';
  const chosen = options.find((o) => o.value === value);
  valueEl.textContent = chosen ? chosen.label : placeholder;
  trigger.dataset.placeholder = chosen ? 'false' : 'true';

  const chevron = document.createElement('span');
  chevron.className = 'sr-select__chevron';
  chevron.innerHTML = iconMarkup('nav/chevron-down');

  trigger.append(valueEl, chevron);

  const menu = document.createElement('ul');
  menu.className = 'sr-select__menu';
  menu.id = `${id}-menu`;
  menu.setAttribute('role', 'listbox');
  if (label) menu.setAttribute('aria-labelledby', `${id}-label`);
  menu.hidden = true;

  let activeIndex = chosen ? options.indexOf(chosen) : -1;

  const optionEls = options.map((opt, i) => {
    const li = document.createElement('li');
    li.className = 'sr-select__option';
    li.id = `${id}-opt-${i}`;
    li.setAttribute('role', 'option');
    li.setAttribute('aria-selected', String(opt.value === value));
    if (opt.disabled) li.setAttribute('aria-disabled', 'true');
    const text = document.createElement('span');
    text.textContent = opt.label;
    li.appendChild(text);
    if (opt.childMenu) {
      const c = document.createElement('span');
      c.className = 'sr-select__option-chevron';
      c.innerHTML = iconMarkup('nav/chevron-right');
      li.appendChild(c);
    }
    li.addEventListener('click', () => {
      if (opt.disabled) return;
      choose(i);
    });
    menu.appendChild(li);
    return li;
  });

  const setActive = (i) => {
    optionEls.forEach((el, idx) => el.classList.toggle('is-active', idx === i));
    activeIndex = i;
    if (i >= 0) {
      trigger.setAttribute('aria-activedescendant', `${id}-opt-${i}`);
      optionEls[i].scrollIntoView({ block: 'nearest' });
    } else {
      trigger.removeAttribute('aria-activedescendant');
    }
  };

  const open = () => {
    if (disabled) return;
    menu.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    setActive(activeIndex >= 0 ? activeIndex : 0);
    document.addEventListener('click', onOutside, true);
  };
  const close = () => {
    menu.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.removeAttribute('aria-activedescendant');
    document.removeEventListener('click', onOutside, true);
  };
  const onOutside = (e) => {
    if (!control.contains(e.target)) close();
  };
  const choose = (i) => {
    const opt = options[i];
    valueEl.textContent = opt.label;
    trigger.dataset.placeholder = 'false';
    optionEls.forEach((el, idx) => el.setAttribute('aria-selected', String(idx === i)));
    close();
    trigger.focus();
  };

  trigger.addEventListener('click', () => (menu.hidden ? open() : close()));
  trigger.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (menu.hidden) open();
        else setActive(Math.min(activeIndex + 1, options.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (menu.hidden) open();
        else setActive(Math.max(activeIndex - 1, 0));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (menu.hidden) open();
        else if (activeIndex >= 0 && !options[activeIndex].disabled) choose(activeIndex);
        break;
      case 'Escape':
        if (!menu.hidden) { e.preventDefault(); close(); }
        break;
      default:
    }
  });

  control.append(trigger, menu);
  root.appendChild(control);

  // Error
  if (hasError) {
    const err = document.createElement('div');
    err.className = 'sr-select__error';
    err.id = `${id}-error`;
    const icon = document.createElement('span');
    icon.className = 'sr-select__error-icon';
    icon.innerHTML = iconMarkup('status/error-circle');
    const msg = document.createElement('span');
    msg.textContent = error;
    err.append(icon, msg);
    root.appendChild(err);
  }

  return root;
};

const render = (args) => {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'max-width:320px; padding-bottom:200px;'; /* room for the open menu */
  wrap.appendChild(buildSelect(args));
  return wrap;
};

export default {
  title: 'Components/Select',
  tags: ['autodocs'],
  render,
  argTypes: {
    label: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    placeholder: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    value: { control: { type: 'select' }, options: [undefined, ...OPTIONS.map((o) => o.value)] },
  },
  args: {
    label: 'Ward',
    hint: 'Select the receiving ward',
    error: '',
    placeholder: 'Select an option',
    required: false,
    disabled: false,
    value: undefined,
  },
};

export const Default = {};
export const WithValue = { args: { value: 'glyndwr' } };
export const NoHint = { args: { hint: '' } };
export const Required = { args: { required: true } };
export const Error = { args: { error: 'Select a ward to continue', hint: '' } };
export const Disabled = { args: { disabled: true, value: 'aneurin' } };

/** Options with a trailing chevron indicate a nested child menu. */
export const NestedOptions = {
  args: {
    label: 'Category',
    hint: '',
    options: [
      { value: 'obs', label: 'Observations', childMenu: true },
      { value: 'meds', label: 'Medications', childMenu: true },
      { value: 'notes', label: 'Notes' },
    ],
  },
};

/** All states side by side (static — no interaction needed to review them). */
export const States = {
  render: () => {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex; flex-direction:column; gap:24px; max-width:320px;';
    wrap.appendChild(buildSelect({ label: 'Default', value: undefined }));
    wrap.appendChild(buildSelect({ label: 'With value', value: 'tawe' }));
    wrap.appendChild(buildSelect({ label: 'Error', error: 'Select a ward to continue' }));
    wrap.appendChild(buildSelect({ label: 'Disabled', disabled: true, value: 'aneurin' }));
    return wrap;
  },
};
