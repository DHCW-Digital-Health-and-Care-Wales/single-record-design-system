import React, { forwardRef, useId } from 'react';
import '@dhcw/sr-web/src/radio/radio.css';

/**
 * Radio — DHCW Single Record Design System (React)
 *
 * A single radio option. Wraps the shared `@dhcw/sr-web` radio.css and renders
 * a real <input type="radio">, so native semantics, arrow-key roving focus and
 * form participation are preserved — none of that is reimplemented here.
 *
 * A radio is only meaningful inside a group: options sharing a `name` form one
 * choice. Use <RadioGroup> so the legend, hint, error and required marker
 * follow components/form-fields.md.
 */
const Radio = forwardRef(function Radio(
  {
    label,
    id,
    name,
    value,
    checked,
    defaultChecked,
    disabled = false,
    error = false,
    onChange,
    className,
    ...rest
  },
  ref
) {
  const reactId = useId();
  const inputId = id || `sr-radio-${reactId}`;

  const classes = ['sr-radio', error && 'sr-radio--error', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      <input
        ref={ref}
        className="sr-radio__input"
        type="radio"
        id={inputId}
        name={name}
        value={value}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onChange={onChange}
        {...rest}
      />
      <label className="sr-radio__label" htmlFor={inputId}>
        {label}
      </label>
    </div>
  );
});

export default Radio;
