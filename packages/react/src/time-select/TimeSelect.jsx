import React, { useId } from 'react';
import '@dhcw/sr-web/src/time-select/time-select.css';

/**
 * TimeSelect — DHCW Single Record Design System
 * Constrained time entry as a native <select> of slots (DDR-012). For free
 * time entry use Input type="time".
 *
 * Slots are generated from `start`..`end` in `interval`-minute steps, or pass
 * an explicit `options` array of "HH:MM" strings.
 */

const pad = (n) => String(n).padStart(2, '0');

function buildSlots(start, end, interval) {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  const out = [];
  for (let m = startMin; m <= endMin; m += interval) {
    out.push(`${pad(Math.floor(m / 60))}:${pad(m % 60)}`);
  }
  return out;
}

export default function TimeSelect({
  label,
  value,
  defaultValue,
  onChange,
  options,
  start = '08:00',
  end = '18:00',
  interval = 30,
  placeholder = 'Select a time',
  disabled = false,
  id,
  className,
  ...rest
}) {
  const reactId = useId();
  const selectId = id || reactId;
  const slots = options || buildSlots(start, end, interval);
  const classes = ['sr-time-select', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {label && (
        <label className="sr-time-select__label" htmlFor={selectId}>
          {label}
        </label>
      )}
      <select
        id={selectId}
        className="sr-time-select__control"
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        {...rest}
      >
        <option value="">{placeholder}</option>
        {slots.map((slot) => (
          <option key={slot} value={slot}>
            {slot}
          </option>
        ))}
      </select>
    </div>
  );
}
