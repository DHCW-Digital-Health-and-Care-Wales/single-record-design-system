import React, { useId } from 'react';
import '@dhcw/sr-web/src/checkbox/checkbox.css';
import Icon from '../icon/Icon.jsx';

/**
 * CheckboxGroup — DHCW Single Record Design System (React)
 *
 * Fieldset wrapper for a set of related Checkbox options, matched to the Figma
 * Checkbox set (1517:13764): Orientation × Legend × Hint × Error × Required.
 *
 * Renders a real <fieldset>/<legend> so screen readers announce the group name
 * with each option. The required asterisk sits on the legend and is decorative
 * (components/form-fields.md) — `required` also sets aria-required on the group.
 *
 * Children are the individual <Checkbox> options. When `error` is set, pass
 * `error` to each child too so the boxes render red alongside the group rule.
 */
export default function CheckboxGroup({
  legend,
  hint,
  error,
  required = false,
  orientation = 'vertical',
  children,
  className,
  ...rest
}) {
  const reactId = useId();
  const hintId = hint ? `sr-checkbox-group-hint-${reactId}` : undefined;
  const errorId = error ? `sr-checkbox-group-error-${reactId}` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  const classes = [
    'sr-checkbox-group',
    error && 'sr-checkbox-group--error',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const optionsClasses = [
    'sr-checkbox-group__options',
    orientation === 'horizontal' && 'sr-checkbox-group__options--horizontal',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <fieldset
      className={classes}
      aria-describedby={describedBy}
      aria-required={required || undefined}
      aria-invalid={error ? true : undefined}
      {...rest}
    >
      {legend && (
        <legend className="sr-checkbox-group__legend">
          <span>{legend}</span>
          {required && (
            <span className="sr-checkbox-group__required" aria-hidden="true">
              *
            </span>
          )}
        </legend>
      )}

      {hint && (
        <p className="sr-checkbox-group__hint" id={hintId}>
          {hint}
        </p>
      )}

      {error && (
        <div className="sr-checkbox-group__error" id={errorId}>
          <span className="sr-checkbox-group__error-icon">
            <Icon name="status/error-circle" size="xs" color="inherit" />
          </span>
          <span>{error}</span>
        </div>
      )}

      <div className={optionsClasses}>{children}</div>
    </fieldset>
  );
}
