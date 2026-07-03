import '@dhcw/sr-web/src/input/input.css';
import '@dhcw/sr-web/src/select/select.css';
import './autocomplete.css';
import '@dhcw/sr-tokens/build/css/tokens.css';
import { iconMarkup } from '@dhcw/sr-icons/build/icons.js';

/**
 * Autocomplete — DHCW Single Record Design System
 *
 * A searchable select (combobox): type to filter a long, known option list.
 * Composed from the Input search field and the Select listbox — reuses their
 * classes so it reads as one system. Input is role="combobox"; results are
 * role="listbox"/role="option" with the same ARIA and keyboard model as
 * Select (Up/Down move, Enter select, Esc close).
 */

let uid = 0;

const WARDS = [
  'Aneurin', 'Glyndŵr', 'Tawe', 'Cynon', 'Rhondda', 'Taf', 'Cleddau',
  'Preseli', 'Gwaun', 'Teifi', 'Ystwyth', 'Cothi',
].map((w) => ({ value: w.toLowerCase(), label: `${w} Ward` }));

/** Highlight the matched substring of `label` for `query`. */
const highlight = (label, query) => {
  if (!query) return document.createTextNode(label);
  const i = label.toLowerCase().indexOf(query.toLowerCase());
  const frag = document.createDocumentFragment();
  if (i === -1) return document.createTextNode(label);
  frag.appendChild(document.createTextNode(label.slice(0, i)));
  const mark = document.createElement('span');
  mark.className = 'sr-autocomplete__match';
  mark.textContent = label.slice(i, i + query.length);
  frag.appendChild(mark);
  frag.appendChild(document.createTextNode(label.slice(i + query.length)));
  return frag;
};

const buildAutocomplete = ({ label, hint, placeholder = 'Search…', options = WARDS } = {}) => {
  const id = `ac-${(uid += 1)}`;
  const root = document.createElement('div');
  root.className = 'sr-autocomplete';

  if (label) {
    const lab = document.createElement('label');
    lab.className = 'sr-input__label';
    lab.htmlFor = `${id}-input`;
    lab.textContent = label;
    root.appendChild(lab);
  }
  if (hint) {
    const h = document.createElement('div');
    h.className = 'sr-input__hint';
    h.id = `${id}-hint`;
    h.textContent = hint;
    root.appendChild(h);
  }

  const control = document.createElement('div');
  control.className = 'sr-autocomplete__control';

  const field = document.createElement('div');
  field.className = 'sr-input__field';

  const leading = document.createElement('span');
  leading.className = 'sr-input__icon';
  leading.innerHTML = iconMarkup('nav/search');

  const input = document.createElement('input');
  input.className = 'sr-input__control';
  input.id = `${id}-input`;
  input.type = 'text';
  input.autocomplete = 'off';
  input.placeholder = placeholder;
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-expanded', 'false');
  input.setAttribute('aria-controls', `${id}-menu`);
  if (hint) input.setAttribute('aria-describedby', `${id}-hint`);

  const clear = document.createElement('button');
  clear.type = 'button';
  clear.className = 'sr-autocomplete__clear';
  clear.setAttribute('aria-label', 'Clear search');
  clear.innerHTML = iconMarkup('nav/close');
  clear.hidden = true;

  field.append(leading, input, clear);

  const menu = document.createElement('ul');
  menu.className = 'sr-select__menu';
  menu.id = `${id}-menu`;
  menu.setAttribute('role', 'listbox');
  menu.hidden = true;

  let matches = [];
  let activeIndex = -1;

  const renderMenu = (query) => {
    menu.innerHTML = '';
    matches = options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()));
    activeIndex = -1;
    if (matches.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'sr-autocomplete__empty';
      empty.setAttribute('role', 'presentation');
      empty.textContent = 'No matches';
      menu.appendChild(empty);
      return;
    }
    matches.forEach((opt, i) => {
      const li = document.createElement('li');
      li.className = 'sr-select__option';
      li.id = `${id}-opt-${i}`;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', 'false');
      const text = document.createElement('span');
      text.appendChild(highlight(opt.label, query));
      li.appendChild(text);
      li.addEventListener('mousedown', (e) => e.preventDefault()); // keep input focus
      li.addEventListener('click', () => choose(i));
      menu.appendChild(li);
    });
  };

  const optionEl = (i) => menu.querySelector(`#${id}-opt-${i}`);

  const setActive = (i) => {
    menu.querySelectorAll('.sr-select__option').forEach((el, idx) =>
      el.classList.toggle('is-active', idx === i)
    );
    activeIndex = i;
    if (i >= 0) {
      input.setAttribute('aria-activedescendant', `${id}-opt-${i}`);
      optionEl(i)?.scrollIntoView({ block: 'nearest' });
    } else {
      input.removeAttribute('aria-activedescendant');
    }
  };

  const open = () => {
    menu.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  };
  const close = () => {
    menu.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
  };
  const choose = (i) => {
    const opt = matches[i];
    if (!opt) return;
    input.value = opt.label;
    clear.hidden = false;
    close();
    input.focus();
  };

  input.addEventListener('input', () => {
    clear.hidden = input.value.length === 0;
    renderMenu(input.value);
    open();
  });
  input.addEventListener('focus', () => {
    if (input.value) { renderMenu(input.value); open(); }
  });
  input.addEventListener('blur', () => close());
  input.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (menu.hidden) { renderMenu(input.value); open(); }
        setActive(Math.min(activeIndex + 1, matches.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActive(Math.max(activeIndex - 1, 0));
        break;
      case 'Enter':
        if (!menu.hidden && activeIndex >= 0) { e.preventDefault(); choose(activeIndex); }
        break;
      case 'Escape':
        if (!menu.hidden) { e.preventDefault(); close(); }
        break;
      default:
    }
  });

  clear.addEventListener('click', () => {
    input.value = '';
    clear.hidden = true;
    close();
    input.focus();
  });

  control.append(field, menu);
  root.appendChild(control);
  return root;
};

const render = (args) => {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'max-width:320px; padding-bottom:220px;';
  wrap.appendChild(buildAutocomplete(args));
  return wrap;
};

export default {
  title: 'Components/Autocomplete',
  tags: ['autodocs'],
  render,
  argTypes: {
    label: { control: 'text' },
    hint: { control: 'text' },
    placeholder: { control: 'text' },
  },
  args: {
    label: 'Ward',
    hint: 'Start typing to search wards',
    placeholder: 'Search wards…',
  },
};

export const Default = {};
export const NoHint = { args: { hint: '' } };
