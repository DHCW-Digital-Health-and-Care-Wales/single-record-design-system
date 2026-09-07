import './search.css';
import '@dhcw/sr-tokens/build/css/tokens.css';
import { iconMarkup } from '@dhcw/sr-icons/build/icons.js';

/**
 * Search — DHCW Single Record Design System
 * Figma: "Search" (1715:375) and "Search Suggestions" (1716:238) on page
 * 1701:17851.
 *
 * This is the reference implementation, including the combobox keyboard
 * behaviour for Typeahead, because the keyboard behaviour is the part people
 * leave out. A suggestions list you can only reach with a mouse is not a
 * combobox.
 */

const uid = (() => { let n = 0; return () => `sr-search-${++n}`; })();

const CLINICIANS = [
  { label: 'Dr A Cardew', meta: 'Cardiology · Consultant' },
  { label: 'Dr J Cardiff-Jones', meta: 'Emergency Medicine · Registrar' },
  { label: 'Cardiology Department', meta: 'Service area' },
  { label: 'Dr M Prothero', meta: 'Respiratory · Consultant' },
  { label: 'Dr S Llewelyn', meta: 'General Surgery · Registrar' },
];

const icon = (name) => iconMarkup(name);

/** Bold the matched run of `label`, leaving the rest as plain text. */
const highlight = (label, query) => {
  if (!query) return document.createTextNode(label);
  const i = label.toLowerCase().indexOf(query.toLowerCase());
  if (i === -1) return document.createTextNode(label);
  const frag = document.createDocumentFragment();
  frag.append(document.createTextNode(label.slice(0, i)));
  const mark = document.createElement('span');
  mark.className = 'sr-search__match';
  mark.textContent = label.slice(i, i + query.length);
  frag.append(mark, document.createTextNode(label.slice(i + query.length)));
  return frag;
};

const render = ({
  type = 'basic',
  label,
  hint,
  required = false,
  hideLabel = false,
  placeholder = 'Search patients',
  value = '',
  state = 'default',
  error,
  suggestions = CLINICIANS,
}) => {
  const id = uid();
  const isTypeahead = type === 'typeahead';
  const disabled = state === 'disabled';

  const root = document.createElement('div');
  root.className = [
    'sr-search',
    state === 'error' && 'sr-search--error',
    disabled && 'sr-search--disabled',
  ].filter(Boolean).join(' ');

  // The label always exists. `hideLabel` moves it off-screen for a standalone
  // search bar; it does not remove it.
  if (label) {
    const lab = document.createElement('label');
    lab.className = hideLabel ? 'sr-visually-hidden' : 'sr-search__label';
    lab.htmlFor = `${id}-input`;
    lab.textContent = label;
    if (required && !hideLabel) {
      const star = document.createElement('span');
      star.className = 'sr-search__required';
      star.setAttribute('aria-hidden', 'true');
      star.textContent = '*';
      lab.append(star);
    }
    root.append(lab);
  }

  if (hint) {
    const h = document.createElement('div');
    h.className = 'sr-search__hint';
    h.id = `${id}-hint`;
    h.textContent = hint;
    root.append(h);
  }

  const row = document.createElement('div');
  row.className = 'sr-search__row';

  const control = document.createElement('div');
  control.className = 'sr-search__control';

  const field = document.createElement('div');
  field.className = 'sr-search__field';

  const lead = document.createElement('span');
  lead.className = 'sr-search__icon';
  lead.innerHTML = icon('nav/search');

  const input = document.createElement('input');
  input.type = 'search';
  input.className = 'sr-search__control-input';
  input.id = `${id}-input`;
  input.autocomplete = 'off';
  input.placeholder = placeholder;
  input.value = value;
  input.disabled = disabled;
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean);
  if (describedBy.length) input.setAttribute('aria-describedby', describedBy.join(' '));
  if (required) input.setAttribute('aria-required', 'true');
  if (state === 'error') input.setAttribute('aria-invalid', 'true');

  const menu = document.createElement('ul');
  if (isTypeahead) {
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-expanded', 'false');
    input.setAttribute('aria-controls', `${id}-menu`);
    menu.className = 'sr-search__suggestions';
    menu.id = `${id}-menu`;
    menu.setAttribute('role', 'listbox');
    menu.setAttribute('aria-label', label || placeholder);
    menu.hidden = true;
  }

  const clear = document.createElement('button');
  clear.type = 'button';
  clear.className = 'sr-search__clear';
  clear.setAttribute('aria-label', 'Clear search');
  clear.innerHTML = icon('nav/clear');
  clear.hidden = !value;

  const spinner = document.createElement('span');
  spinner.className = 'sr-search__spinner';
  spinner.innerHTML = icon('status/loading');
  spinner.hidden = state !== 'loading';

  // Loading is a state the user must be told about, not only shown.
  const live = document.createElement('span');
  live.className = 'sr-visually-hidden';
  live.setAttribute('role', 'status');
  live.textContent = state === 'loading' ? 'Searching…' : '';

  field.append(lead, input);
  if (state === 'loading') field.append(spinner);
  else field.append(clear);
  control.append(field);
  if (isTypeahead) control.append(menu);
  row.append(control);

  if (type === 'with-button' || type === 'with-icon-button') {
    const btn = document.createElement('button');
    btn.type = 'submit';
    btn.className = type === 'with-icon-button'
      ? 'sr-search__submit sr-search__submit--icon'
      : 'sr-search__submit';
    // Empty query means nothing to submit — the Figma Default state ships the
    // button already disabled for exactly this reason.
    btn.disabled = disabled || !input.value;
    if (type === 'with-icon-button') {
      btn.innerHTML = icon('nav/search');
      btn.setAttribute('aria-label', 'Search');
    } else {
      btn.textContent = 'Search';
    }
    row.append(btn);
    input.addEventListener('input', () => { btn.disabled = !input.value; });
  }

  root.append(row, live);

  if (error) {
    const err = document.createElement('div');
    err.className = 'sr-search__error';
    err.id = `${id}-error`;
    const ei = document.createElement('span');
    ei.className = 'sr-search__error-icon';
    ei.innerHTML = icon('status/error-circle');
    err.append(ei, document.createTextNode(error));
    root.append(err);
  }

  // ── Behaviour shared by every type ──────────────────────────────────────
  input.addEventListener('input', () => { clear.hidden = !input.value; });
  clear.addEventListener('click', () => {
    input.value = '';
    clear.hidden = true;
    input.dispatchEvent(new Event('input'));
    // Focus returns to the input: clearing is a step in searching, not the end
    // of it, and leaving focus on a button that has just vanished strands the
    // keyboard user.
    input.focus();
  });

  if (!isTypeahead) return root;

  // ── Typeahead: the WAI-ARIA combobox keyboard model ─────────────────────
  let rows = [];
  let active = -1;
  let open = false;

  const setOpen = (next) => {
    open = next;
    menu.hidden = !next;
    input.setAttribute('aria-expanded', String(next));
    if (!next) {
      active = -1;
      input.removeAttribute('aria-activedescendant');
    }
  };

  const paint = () => {
    rows.forEach((r, i) => {
      r.classList.toggle('is-active', i === active);
      r.setAttribute('aria-selected', String(i === active));
    });
    if (active >= 0) {
      input.setAttribute('aria-activedescendant', rows[active].id);
      rows[active].scrollIntoView({ block: 'nearest' });
    } else {
      input.removeAttribute('aria-activedescendant');
    }
  };

  const choose = (i) => {
    if (!rows[i]) return;
    input.value = rows[i].dataset.label;
    clear.hidden = false;
    setOpen(false);
    input.focus();
  };

  const build = () => {
    const q = input.value.trim();
    const matches = q
      ? suggestions.filter((s) => s.label.toLowerCase().includes(q.toLowerCase()))
      : suggestions;
    menu.replaceChildren();
    rows = [];
    active = -1;

    if (!matches.length) {
      const empty = document.createElement('li');
      empty.className = 'sr-search__status-row';
      empty.setAttribute('role', 'presentation');
      // The query is quoted back so the user can see what was actually tried —
      // usually a typo they can spot instantly.
      empty.textContent = `No matches for "${q}"`;
      menu.append(empty);
      return;
    }

    matches.forEach((s, i) => {
      const li = document.createElement('li');
      li.className = 'sr-search__suggestion';
      li.id = `${id}-opt-${i}`;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', 'false');
      li.dataset.label = s.label;

      const lbl = document.createElement('span');
      lbl.className = 'sr-search__suggestion-label';
      lbl.append(highlight(s.label, q));
      li.append(lbl);

      if (s.meta) {
        const meta = document.createElement('span');
        meta.className = 'sr-search__suggestion-meta';
        meta.textContent = s.meta;
        li.append(meta);
      }

      // mousedown would blur the input and close the list before the click
      // landed, so the row would look unclickable.
      li.addEventListener('mousedown', (e) => e.preventDefault());
      li.addEventListener('click', () => choose(i));
      menu.append(li);
      rows.push(li);
    });
  };

  input.addEventListener('input', () => { build(); setOpen(true); });
  input.addEventListener('focus', () => { build(); setOpen(true); });
  input.addEventListener('blur', () => setOpen(false));

  input.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!open) { build(); setOpen(true); }
        active = Math.min(active + 1, rows.length - 1);
        paint();
        break;
      case 'ArrowUp':
        e.preventDefault();
        active = Math.max(active - 1, 0);
        paint();
        break;
      case 'Home':
        if (!open || !rows.length) return;
        e.preventDefault();
        active = 0;
        paint();
        break;
      case 'End':
        if (!open || !rows.length) return;
        e.preventDefault();
        active = rows.length - 1;
        paint();
        break;
      case 'Enter':
        if (open && active >= 0) { e.preventDefault(); choose(active); }
        break;
      case 'Escape':
        // Esc closes the list and leaves focus in the input — it does not clear
        // what was typed. Losing a long query to a stray Esc is worse than the
        // list staying open.
        if (open) { e.preventDefault(); setOpen(false); }
        break;
      default:
    }
  });

  return root;
};

export default {
  title: 'Components/Search',
  tags: ['autodocs'],
  render,
  argTypes: {
    type: {
      control: 'inline-radio',
      options: ['basic', 'with-button', 'with-icon-button', 'typeahead'],
    },
    state: {
      control: 'inline-radio',
      options: ['default', 'filled', 'loading', 'disabled', 'error'],
    },
  },
  args: {
    type: 'basic',
    state: 'default',
    label: 'Search patients',
    hideLabel: true,
    placeholder: 'Search patients',
    value: '',
  },
};

/** Live inline filter. No submit step — results update as you type. */
export const Basic = {};

/** A submitted query. The button stays disabled until there is something to send. */
export const WithButton = { args: { type: 'with-button', placeholder: 'Enter NHS number or name…' } };

/** Same behaviour, 40×40 icon button, for mobile and tight toolbars. */
export const WithIconButton = { args: { type: 'with-icon-button' } };

/**
 * Typeahead. Focus the field, then use ↓ ↑ Home End Enter Esc — the whole
 * keyboard model works without touching the mouse.
 */
export const Typeahead = {
  args: { type: 'typeahead', label: 'Find a clinician', placeholder: 'Search clinicians' },
};

/** Typeahead with no matches — the failed query is quoted back. */
export const TypeaheadNoResults = {
  args: { type: 'typeahead', label: 'Find a clinician', value: 'xyzzy', suggestions: [] },
};

/** Filled: the clear affordance appears once there is a query. */
export const Filled = { args: { state: 'filled', value: 'Smith' } };

/** Loading: the spinner replaces clear, and "Searching…" reaches a live region. */
export const Loading = { args: { state: 'loading', value: 'Smith' } };

export const Disabled = { args: { state: 'disabled', value: 'Smith' } };

/** Error carries an icon and a message, not just a red border. */
export const Error = {
  args: { state: 'error', value: 'S', error: 'Enter at least 2 characters' },
};

/** As a labelled form field: Label, Hint and Required, no Input wrapper. */
export const AsFormField = {
  args: {
    label: 'Search patients',
    hideLabel: false,
    required: true,
    hint: 'Search by NHS number, name or date of birth',
  },
};
