import './date-picker.css';
import '@dhcw/sr-tokens/build/css/tokens.css';
import { iconMarkup } from '@dhcw/sr-icons/build/icons.js';

/**
 * Date picker (calendar popover) — DHCW Single Record Design System
 * Custom calendar, no date library (DDR-012). For choosing dates.
 *
 * The React component (packages/react) carries full arrow-key grid navigation;
 * this reference renders focusable day buttons + month navigation + select.
 */

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const pad = (n) => String(n).padStart(2, '0');
const fmt = (d) => (d ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}` : '');
const sameDay = (a, b) => a && b && a.toDateString() === b.toDateString();
const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
const mondayIndex = (d) => (d.getDay() + 6) % 7;

const render = ({ label, placeholder }) => {
  const today = new Date();
  let selected = null;
  let view = { year: today.getFullYear(), month: today.getMonth() };
  let open = false;

  const root = document.createElement('div');
  root.className = 'sr-datepicker';

  const field = document.createElement('div');
  field.className = 'sr-datepicker__field';
  const input = document.createElement('input');
  input.className = 'sr-datepicker__input';
  input.type = 'text';
  input.readOnly = true;
  input.placeholder = placeholder;
  input.setAttribute('aria-label', label);
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'sr-datepicker__trigger';
  trigger.setAttribute('aria-label', label);
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.innerHTML = iconMarkup('schedule/appointment');
  field.appendChild(input);
  field.appendChild(trigger);
  root.appendChild(field);

  let popover = null;

  const close = () => {
    open = false;
    trigger.setAttribute('aria-expanded', 'false');
    if (popover) { popover.remove(); popover = null; }
  };

  const buildPopover = () => {
    popover = document.createElement('div');
    popover.className = 'sr-datepicker__popover';
    popover.setAttribute('role', 'dialog');
    popover.setAttribute('aria-label', label);

    const header = document.createElement('div');
    header.className = 'sr-datepicker__header';
    const prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'sr-datepicker__nav';
    prev.setAttribute('aria-label', 'Previous month');
    prev.innerHTML = iconMarkup('nav/chevron-left');
    prev.addEventListener('click', () => { view = { year: view.month === 0 ? view.year - 1 : view.year, month: (view.month + 11) % 12 }; rebuild(); });
    const title = document.createElement('span');
    title.className = 'sr-datepicker__title';
    title.setAttribute('aria-live', 'polite');
    title.textContent = `${MONTHS[view.month]} ${view.year}`;
    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'sr-datepicker__nav';
    next.setAttribute('aria-label', 'Next month');
    next.innerHTML = iconMarkup('nav/chevron-right');
    next.addEventListener('click', () => { view = { year: view.month === 11 ? view.year + 1 : view.year, month: (view.month + 1) % 12 }; rebuild(); });
    header.appendChild(prev);
    header.appendChild(title);
    header.appendChild(next);
    popover.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'sr-datepicker__grid';
    grid.setAttribute('role', 'grid');

    const wdRow = document.createElement('div');
    wdRow.className = 'sr-datepicker__weekdays';
    wdRow.setAttribute('role', 'row');
    WEEKDAYS.forEach((wd) => {
      const cell = document.createElement('span');
      cell.className = 'sr-datepicker__weekday';
      cell.setAttribute('role', 'columnheader');
      cell.textContent = wd;
      wdRow.appendChild(cell);
    });
    grid.appendChild(wdRow);

    const first = new Date(view.year, view.month, 1);
    let cursor = addDays(first, -mondayIndex(first));
    for (let w = 0; w < 6; w += 1) {
      const row = document.createElement('div');
      row.className = 'sr-datepicker__week';
      row.setAttribute('role', 'row');
      for (let i = 0; i < 7; i += 1) {
        const day = cursor;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.setAttribute('role', 'gridcell');
        const outside = day.getMonth() !== view.month;
        btn.className = ['sr-datepicker__day', outside ? 'sr-datepicker__day--outside' : '', sameDay(day, today) ? 'sr-datepicker__day--today' : ''].filter(Boolean).join(' ');
        btn.setAttribute('aria-selected', String(Boolean(sameDay(day, selected))));
        btn.setAttribute('aria-label', `${day.getDate()} ${MONTHS[day.getMonth()]} ${day.getFullYear()}`);
        btn.textContent = String(day.getDate());
        btn.addEventListener('click', () => {
          selected = day;
          input.value = fmt(selected);
          close();
          trigger.focus();
        });
        row.appendChild(btn);
        cursor = addDays(cursor, 1);
      }
      grid.appendChild(row);
    }
    popover.appendChild(grid);

    popover.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { close(); trigger.focus(); }
    });

    root.appendChild(popover);
  };

  const rebuild = () => { if (popover) { popover.remove(); popover = null; } buildPopover(); };

  trigger.addEventListener('click', () => {
    if (open) { close(); return; }
    open = true;
    trigger.setAttribute('aria-expanded', 'true');
    view = selected ? { year: selected.getFullYear(), month: selected.getMonth() } : { year: today.getFullYear(), month: today.getMonth() };
    buildPopover();
  });

  return root;
};

export default {
  title: 'Components/Date picker',
  tags: ['autodocs'],
  render,
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
  },
  args: {
    label: 'Choose date',
    placeholder: 'DD/MM/YYYY',
  },
};

export const Default = {};
