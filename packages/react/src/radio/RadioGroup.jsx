import React, { useId } from 'react';
import '@dhcw/sr-web/src/radio/radio.css';
import Icon from '../icon/Icon.jsx';
import Radio from './Radio.jsx';

/**
 * RadioGroup — DHCW Single Record Design System (React)
 *
 * Fieldset wrapper for one single-select choice, matched to the Figma Radio
 * set: Orientation × Legend × Hint × Error × Required. Structurally the twin
 * of CheckboxGroup.
 *
 * Renders a real <fieldset>/<legend> so screen readers announce the group name
 * with each option. The required asterisk sits on the legend and is decorative
 * (components/form-fields.md) — `required` also sets aria-required on the group.
 *
 * Pass `options` ([{ label, value, disabled }]) for the common case, or
 * children for full control. `name` is required so the browser knows which
 * inputs form one choice; it is generated if omitted.
 */
export default function RadioGroup({
  legend,
  hideLegend = false,
  hint,
  error,
  required = false,
  orientation = 'vertical',
  name,
  options,
  value,
  defaultValue,
  onChange,
  children,
  className,
  ...rest
}) {
  const reactId = useId();
  const groupName = name || `sr-radio-group-${reactId}`;
  const hintId = hint ? `sr-radio-group-hint-${reactId}` : undefined;
  const errorId = error ? `sr-radio-group-error-${reactId}` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  const isControlled = value !== undefined;

  const classes = ['sr-radio-group', error && 'sr-radio-group--error', className]
    .filter(Boolean)
    .join(' ');

  const optionsClasses = [
    'sr-radio-group__options',
    orientation === 'horizontal' && 'sr-radio-group__options--horizontal',
  ]
    .filter(Boolean)
    .join(' ');

  const rendered = options
    ? options.map((opt) => (
        <Radio
          key={opt.value}
          name={groupName}
          value={opt.value}
          label={opt.label}
          disabled={opt.disabled}
          error={Boolean(error)}
          {...(isControlled
            ? { checked: value === opt.value }
            : { defaultChecked: defaultValue === opt.value })}
          onChange={onChange ? () => onChange(opt.value) : undefined}
        />
      ))
    : children;

  return (
    <fieldset
      className={classes}
      aria-describedby={describedBy}
      aria-required={required || undefined}
      aria-invalid={error ? true : undefined}
      {...rest}
    >
      {legend && (
        // `hideLegend` matches Input/Checkbox's `hideLabel`: the group still
        // needs a name for screen readers even where the surrounding copy
        // already provides one visually. Dropping the legend instead would
        // leave a fieldset that announces as an unnamed group.
        <legend className={`sr-radio-group__legend${hideLegend ? ' sr-visually-hidden' : ''}`}>
          <span>{legend}</span>
          {required && (
            <span className="sr-radio-group__required" aria-hidden="true">
              *
            </span>
          )}
        </legend>
      )}

      {hint && (
        <p className="sr-radio-group__hint" id={hintId}>
          {hint}
        </p>
      )}

      {error && (
        <div className="sr-radio-group__error" id={errorId}>
          <span className="sr-radio-group__error-icon">
            <Icon name="status/error-circle" size="xs" color="inherit" />
          </span>
          <span>{error}</span>
        </div>
      )}

      <div className={optionsClasses}>{rendered}</div>
    </fieldset>
  );
}
