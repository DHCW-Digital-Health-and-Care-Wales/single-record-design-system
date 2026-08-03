import React, { useId, useState } from 'react';
import '@dhcw/sr-web/src/input/input.css';
import Icon from '../icon/Icon.jsx';
import DatePicker from '../date-picker/DatePicker.jsx';
import TimeSelect from '../time-select/TimeSelect.jsx';

/**
 * Input — DHCW Single Record Design System
 * Figma: Input set (840:14593). Types: text | password | phone | calendar |
 * time | textarea. States: default, focus (:focus-within), error, disabled.
 *
 * Calendar delegates to the DatePicker (calendar popover) and Time to the
 * TimeSelect (slot select), wrapped in the shared label/hint/error scaffold —
 * see DDR-012 for when to prefer the 3-field DateInput instead.
 */

const HTML_TYPE = { text: 'text', password: 'password', phone: 'tel' };

export default function Input({
  type = 'text',
  label,
  hint,
  error,
  required = false,
  disabled = false,
  placeholder,
  leadingIcon,
  // A control rendered inside the field at the trailing edge — a scan trigger,
  // a unit toggle, a clear button. Sits inside the border so it reads as part
  // of the field rather than a separate adjacent button. Ignored by the
  // calendar/time variants, which own their own trailing control.
  trailingAction,
  // Renders the label visually-hidden instead of dropping it. Use where the
  // design shows no label (a search bar whose placeholder carries the meaning)
  // — a placeholder is not an accessible name, and it disappears on typing,
  // so the label must still exist for screen readers. Never omit `label`.
  hideLabel = false,
  id,
  className,
  ...rest
}) {
  const reactId = useId();
  const inputId = id || reactId;
  const isTextarea = type === 'textarea';
  const isPassword = type === 'password';
  const [reveal, setReveal] = useState(false);

  const isCalendar = type === 'calendar';
  const isTime = type === 'time';
  const hasError = Boolean(error);
  const errorText = typeof error === 'string' ? error : null;

  const classes = [
    'sr-input',
    hasError ? 'sr-input--error' : '',
    disabled ? 'sr-input--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const describedBy =
    [hint ? `${inputId}-hint` : null, errorText ? `${inputId}-error` : null]
      .filter(Boolean)
      .join(' ') || undefined;

  const controlProps = {
    id: inputId,
    className: 'sr-input__control',
    placeholder,
    disabled,
    'aria-invalid': hasError || undefined,
    'aria-describedby': describedBy,
    ...rest,
  };

  return (
    <div className={classes}>
      {label && (
        <label
          className={`sr-input__label${hideLabel ? ' sr-visually-hidden' : ''}`}
          htmlFor={inputId}
        >
          {label}
          {required && (
            <span className="sr-input__required" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {hint && (
        <span className="sr-input__hint" id={`${inputId}-hint`}>
          {hint}
        </span>
      )}

      {isCalendar ? (
        <DatePicker id={inputId} label={label || 'Choose date'} placeholder={placeholder} disabled={disabled} invalid={hasError} />
      ) : isTime ? (
        <TimeSelect id={inputId} placeholder={placeholder} disabled={disabled} invalid={hasError} />
      ) : (
        <div className={`sr-input__field${isTextarea ? ' sr-input__field--textarea' : ''}`}>
          {leadingIcon && <span className="sr-input__icon">{leadingIcon}</span>}

          {isTextarea ? (
            <textarea {...controlProps} />
          ) : (
            <input type={isPassword ? (reveal ? 'text' : 'password') : HTML_TYPE[type]} {...controlProps} />
          )}

          {isPassword && (
            <button
              type="button"
              className="sr-input__toggle"
              aria-label={reveal ? 'Hide password' : 'Show password'}
              onClick={() => setReveal((r) => !r)}
              disabled={disabled}
            >
              <Icon name={reveal ? 'action/eye-off' : 'action/eye'} size="sm" color="inherit" />
            </button>
          )}

          {trailingAction && !isPassword && (
            <span className="sr-input__trailing">{trailingAction}</span>
          )}
        </div>
      )}

      {errorText && (
        <span className="sr-input__error" id={`${inputId}-error`}>
          {errorText}
        </span>
      )}
    </div>
  );
}
