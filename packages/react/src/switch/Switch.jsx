import React, { useState } from 'react';
import '@dhcw/sr-web/src/switch/switch.css';

/**
 * Toggle switch — DHCW Single Record Design System
 * Figma: Toggle/Switch (958:10576).
 *
 * Controlled (`checked` + `onChange`) or uncontrolled (`defaultChecked`).
 * Rendered as <button role="switch">; pass `label` for the accessible name
 * (or `aria-label` via ...rest when there is no visible label).
 */
export default function Switch({
  checked,
  defaultChecked = false,
  disabled = false,
  label,
  onChange,
  className,
  ...rest
}) {
  const isControlled = checked !== undefined;
  const [internal, setInternal] = useState(defaultChecked);
  const on = isControlled ? checked : internal;

  const toggle = () => {
    if (disabled) return;
    if (!isControlled) setInternal((v) => !v);
    if (onChange) onChange(!on);
  };

  const classes = ['sr-switch', className].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      className={classes}
      disabled={disabled}
      onClick={toggle}
      {...rest}
    >
      <span className="sr-switch__track">
        <span className="sr-switch__thumb" />
      </span>
      {label && <span className="sr-switch__label">{label}</span>}
    </button>
  );
}
