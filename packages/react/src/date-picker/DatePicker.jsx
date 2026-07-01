import React, { useEffect, useRef, useState } from 'react';
import '@dhcw/sr-web/src/date-picker/date-picker.css';
import Icon from '../icon/Icon.jsx';

/**
 * DatePicker — DHCW Single Record Design System
 * Custom calendar popover (no date library — DDR-012). For CHOOSING dates
 * (scheduling, availability). For known dates (DOB, admission) use DateInput.
 *
 * Controlled (`value` = Date | null + `onChange`) or uncontrolled
 * (`defaultValue`). Week starts Monday (UK). Full keyboard grid navigation.
 */

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const pad = (n) => String(n).padStart(2, '0');
const fmt = (d) => (d ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}` : '');
const sameDay = (a, b) =>
  a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const addDays = (d, n) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};
// Monday-first index (0=Mon … 6=Sun)
const mondayIndex = (d) => (d.getDay() + 6) % 7;

function buildWeeks(year, month) {
  const first = new Date(year, month, 1);
  const start = addDays(first, -mondayIndex(first));
  const weeks = [];
  let cursor = start;
  for (let w = 0; w < 6; w += 1) {
    const days = [];
    for (let i = 0; i < 7; i += 1) {
      days.push(cursor);
      cursor = addDays(cursor, 1);
    }
    weeks.push(days);
  }
  return weeks;
}

export default function DatePicker({
  value,
  defaultValue = null,
  onChange,
  label = 'Choose date',
  placeholder = 'DD/MM/YYYY',
  disabled = false,
  className,
  ...rest
}) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue);
  const selected = isControlled ? value : internal;

  const today = new Date();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => {
    const base = selected || today;
    return { year: base.getFullYear(), month: base.getMonth() };
  });
  const [focusDate, setFocusDate] = useState(selected || today);

  const rootRef = useRef(null);
  const gridRef = useRef(null);
  const triggerRef = useRef(null);

  // Close on outside click.
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  // Move DOM focus to the focused day when navigating.
  useEffect(() => {
    if (!open || !gridRef.current) return;
    const el = gridRef.current.querySelector('[data-focused="true"]');
    if (el) el.focus();
  }, [open, focusDate]);

  const openWith = (d) => {
    setView({ year: d.getFullYear(), month: d.getMonth() });
    setFocusDate(d);
    setOpen(true);
  };

  const commit = (d) => {
    if (!isControlled) setInternal(d);
    if (onChange) onChange(d);
    setOpen(false);
    if (triggerRef.current) triggerRef.current.focus();
  };

  const moveFocus = (d) => {
    setFocusDate(d);
    if (d.getMonth() !== view.month || d.getFullYear() !== view.year) {
      setView({ year: d.getFullYear(), month: d.getMonth() });
    }
  };

  const onGridKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowLeft': e.preventDefault(); moveFocus(addDays(focusDate, -1)); break;
      case 'ArrowRight': e.preventDefault(); moveFocus(addDays(focusDate, 1)); break;
      case 'ArrowUp': e.preventDefault(); moveFocus(addDays(focusDate, -7)); break;
      case 'ArrowDown': e.preventDefault(); moveFocus(addDays(focusDate, 7)); break;
      case 'PageUp': e.preventDefault(); moveFocus(new Date(focusDate.getFullYear(), focusDate.getMonth() - 1, focusDate.getDate())); break;
      case 'PageDown': e.preventDefault(); moveFocus(new Date(focusDate.getFullYear(), focusDate.getMonth() + 1, focusDate.getDate())); break;
      case 'Enter':
      case ' ': e.preventDefault(); commit(focusDate); break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        if (triggerRef.current) triggerRef.current.focus();
        break;
      default: break;
    }
  };

  const shiftMonth = (delta) => setView((v) => {
    const m = new Date(v.year, v.month + delta, 1);
    return { year: m.getFullYear(), month: m.getMonth() };
  });

  const weeks = buildWeeks(view.year, view.month);
  const classes = ['sr-datepicker', className].filter(Boolean).join(' ');

  return (
    <div className={classes} ref={rootRef} {...rest}>
      <div className="sr-datepicker__field">
        <input
          className="sr-datepicker__input"
          type="text"
          inputMode="numeric"
          placeholder={placeholder}
          aria-label={label}
          disabled={disabled}
          value={fmt(selected)}
          readOnly
        />
        <button
          type="button"
          ref={triggerRef}
          className="sr-datepicker__trigger"
          aria-label={label}
          aria-haspopup="dialog"
          aria-expanded={open}
          disabled={disabled}
          onClick={() => (open ? setOpen(false) : openWith(selected || today))}
        >
          <Icon name="schedule/appointment" size="sm" color="inherit" />
        </button>
      </div>

      {open && (
        <div className="sr-datepicker__popover" role="dialog" aria-label={label} aria-modal="false">
          <div className="sr-datepicker__header">
            <button type="button" className="sr-datepicker__nav" aria-label="Previous month" onClick={() => shiftMonth(-1)}>
              <Icon name="nav/chevron-left" size="sm" color="inherit" />
            </button>
            <span className="sr-datepicker__title" aria-live="polite">
              {MONTHS[view.month]} {view.year}
            </span>
            <button type="button" className="sr-datepicker__nav" aria-label="Next month" onClick={() => shiftMonth(1)}>
              <Icon name="nav/chevron-right" size="sm" color="inherit" />
            </button>
          </div>

          <div className="sr-datepicker__grid" role="grid" aria-label={`${MONTHS[view.month]} ${view.year}`} ref={gridRef} onKeyDown={onGridKeyDown}>
            <div className="sr-datepicker__weekdays" role="row">
              {WEEKDAYS.map((wd) => (
                <span key={wd} className="sr-datepicker__weekday" role="columnheader" aria-label={wd}>
                  {wd}
                </span>
              ))}
            </div>
            {weeks.map((week) => (
              <div className="sr-datepicker__week" role="row" key={week[0].toISOString()}>
                {week.map((day) => {
                  const outside = day.getMonth() !== view.month;
                  const isSelected = Boolean(sameDay(day, selected));
                  const isFocused = Boolean(sameDay(day, focusDate));
                  const isToday = Boolean(sameDay(day, today));
                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      role="gridcell"
                      className={[
                        'sr-datepicker__day',
                        outside ? 'sr-datepicker__day--outside' : '',
                        isToday ? 'sr-datepicker__day--today' : '',
                      ].filter(Boolean).join(' ')}
                      aria-selected={isSelected}
                      aria-label={`${day.getDate()} ${MONTHS[day.getMonth()]} ${day.getFullYear()}`}
                      data-focused={isFocused ? 'true' : undefined}
                      tabIndex={isFocused ? 0 : -1}
                      onClick={() => commit(day)}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
