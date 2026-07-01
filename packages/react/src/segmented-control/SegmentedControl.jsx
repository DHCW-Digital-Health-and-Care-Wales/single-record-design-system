import React, { useState } from 'react';
import '@dhcw/sr-web/src/segmented-control/segmented-control.css';

/**
 * Segmented control — DHCW Single Record Design System
 * Figma: Toggle/Segmented Control (2752:40) and two-option Toggle (2770:55996).
 *
 * Single-select. Controlled (`value` + `onChange`) or uncontrolled
 * (`defaultValue`). `options`: [{ label, value, disabled }].
 */
export default function SegmentedControl({
  options = [],
  value,
  defaultValue,
  onChange,
  disabled = false,
  ariaLabel = 'View',
  className,
  ...rest
}) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue ?? options[0]?.value);
  const selected = isControlled ? value : internal;

  const select = (v) => {
    if (disabled) return;
    if (!isControlled) setInternal(v);
    if (onChange) onChange(v);
  };

  const classes = ['sr-segmented', className].filter(Boolean).join(' ');

  return (
    <div className={classes} role="group" aria-label={ariaLabel} {...rest}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className="sr-segmented__option"
          aria-pressed={selected === opt.value}
          disabled={disabled || opt.disabled}
          onClick={() => select(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
