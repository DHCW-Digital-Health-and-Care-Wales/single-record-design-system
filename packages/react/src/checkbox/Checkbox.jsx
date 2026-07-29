import React, { forwardRef, useEffect, useId, useRef } from 'react';
import '@dhcw/sr-web/src/checkbox/checkbox.css';

/**
 * Checkbox — DHCW Single Record Design System (React)
 *
 * A single checkbox option. Wraps the shared `@dhcw/sr-web` checkbox.css and
 * renders a real <input type="checkbox">, so native semantics, keyboard
 * behaviour and form participation are preserved.
 *
 * `indeterminate` is a DOM property, not an attribute, so it is applied via a
 * ref rather than JSX. Pass it for the "some but not all rows selected" state
 * on a table's select-all control.
 *
 * For a set of related options use <CheckboxGroup> so the legend, hint, error
 * and required marker follow components/form-fields.md.
 */
const Checkbox = forwardRef(function Checkbox(
  {
    label,
    id,
    checked,
    defaultChecked,
    indeterminate = false,
    disabled = false,
    error = false,
    onChange,
    className,
    ...rest
  },
  ref
) {
  const reactId = useId();
  const inputId = id || `sr-checkbox-${reactId}`;
  const innerRef = useRef(null);

  // Keep the caller's ref working while we also need our own handle.
  const setRefs = (node) => {
    innerRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  useEffect(() => {
    if (innerRef.current) innerRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const classes = ['sr-checkbox', error && 'sr-checkbox--error', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      <input
        ref={setRefs}
        className="sr-checkbox__input"
        type="checkbox"
        id={inputId}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        aria-invalid={error || undefined}
        onChange={onChange}
        {...rest}
      />
      <label className="sr-checkbox__label" htmlFor={inputId}>
        {label}
      </label>
    </div>
  );
});

export default Checkbox;
