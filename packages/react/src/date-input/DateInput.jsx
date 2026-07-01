import React, { useId } from 'react';
import '@dhcw/sr-web/src/date-input/date-input.css';

/**
 * DateInput — DHCW Single Record Design System
 * GDS/NHS 3-field date input (day / month / year). The DEFAULT control for
 * dates the user knows (DOB, admission, onset). See DDR-012.
 *
 * Controlled via `value` = { day, month, year } + `onChange`, or uncontrolled.
 * `autoComplete="bday"` wires the three fields to bday-day/month/year.
 */
export default function DateInput({
  legend,
  hint,
  error,
  required = false,
  disabled = false,
  value,
  onChange,
  autoComplete,
  id,
  className,
  ...rest
}) {
  const reactId = useId();
  const baseId = id || reactId;
  const hasError = Boolean(error);
  const errorText = typeof error === 'string' ? error : null;
  const isDob = autoComplete === 'bday';

  const classes = [
    'sr-date-input',
    hasError ? 'sr-date-input--error' : '',
    disabled ? 'sr-date-input--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const describedBy =
    [hint ? `${baseId}-hint` : null, errorText ? `${baseId}-error` : null]
      .filter(Boolean)
      .join(' ') || undefined;

  const handle = (part) => (e) => {
    if (onChange) onChange({ ...value, [part]: e.target.value });
  };

  const parts = [
    { key: 'day', label: 'Day', width: 'day', max: 2, ac: isDob ? 'bday-day' : undefined },
    { key: 'month', label: 'Month', width: 'month', max: 2, ac: isDob ? 'bday-month' : undefined },
    { key: 'year', label: 'Year', width: 'year', max: 4, ac: isDob ? 'bday-year' : undefined },
  ];

  return (
    <fieldset className={classes} aria-describedby={describedBy} {...rest}>
      {legend && (
        <legend className="sr-date-input__legend">
          {legend}
          {required && (
            <span className="sr-date-input__required" aria-hidden="true">
              {' '}
              *
            </span>
          )}
        </legend>
      )}
      {hint && (
        <span className="sr-date-input__hint" id={`${baseId}-hint`}>
          {hint}
        </span>
      )}

      <div className="sr-date-input__fields">
        {parts.map((p) => (
          <div className="sr-date-input__item" key={p.key}>
            <label className="sr-date-input__item-label" htmlFor={`${baseId}-${p.key}`}>
              {p.label}
            </label>
            <input
              id={`${baseId}-${p.key}`}
              className={`sr-date-input__field sr-date-input__field--${p.width}`}
              type="text"
              inputMode="numeric"
              maxLength={p.max}
              autoComplete={p.ac}
              disabled={disabled}
              aria-invalid={hasError || undefined}
              value={value ? value[p.key] ?? '' : undefined}
              onChange={value || onChange ? handle(p.key) : undefined}
            />
          </div>
        ))}
      </div>

      {errorText && (
        <span className="sr-date-input__error" id={`${baseId}-error`}>
          {errorText}
        </span>
      )}
    </fieldset>
  );
}
