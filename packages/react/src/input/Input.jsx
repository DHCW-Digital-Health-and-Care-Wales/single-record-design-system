import React, { useId, useState } from 'react';
import '@dhcw/sr-web/src/input/input.css';
import Icon from '../icon/Icon.jsx';

/**
 * Input — DHCW Single Record Design System
 * Figma: Input set (840:14593). Types: text | password | phone | calendar |
 * time | textarea. States: default, focus (:focus-within), error, disabled.
 *
 * Calendar/Time render as a field with a trailing icon; the picker popover
 * (date picker) is a separate, deferred component.
 */

const TRAILING_ICON = { calendar: 'schedule/appointment', time: 'schedule/time' };
const HTML_TYPE = { text: 'text', password: 'password', phone: 'tel', calendar: 'text', time: 'text' };

export default function Input({
  type = 'text',
  label,
  hint,
  error,
  required = false,
  disabled = false,
  placeholder,
  leadingIcon,
  id,
  className,
  ...rest
}) {
  const reactId = useId();
  const inputId = id || reactId;
  const isTextarea = type === 'textarea';
  const isPassword = type === 'password';
  const [reveal, setReveal] = useState(false);

  const hasError = Boolean(error);
  const errorText = typeof error === 'string' ? error : null;
  const trailingIconName = TRAILING_ICON[type];

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
        <label className="sr-input__label" htmlFor={inputId}>
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

        {trailingIconName && !isPassword && (
          <Icon name={trailingIconName} size="sm" color="subtle" className="sr-input__icon" />
        )}
      </div>

      {errorText && (
        <span className="sr-input__error" id={`${inputId}-error`}>
          {errorText}
        </span>
      )}
    </div>
  );
}
