import React, { useEffect, useId, useRef, useState } from 'react';
import '@dhcw/sr-web/src/select/select.css';
import Icon from '../icon/Icon.jsx';

/**
 * Select — DHCW Single Record Design System (React)
 * Wraps the shared @dhcw/sr-web select.css. Figma Select set (1517:14471).
 *
 * Single-select. Controlled (`value` + `onChange`) or uncontrolled
 * (`defaultValue`). `options`: [{ label, value, disabled, childMenu }].
 * Keyboard: Arrow/Enter/Space open, Up/Down move, Enter select, Esc close.
 */
export default function Select({
  options = [],
  value,
  defaultValue,
  onChange,
  label,
  hint,
  error,
  required = false,
  disabled = false,
  placeholder = 'Select an option',
  className,
  ...rest
}) {
  const rid = useId();
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue);
  const selected = isControlled ? value : internal;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const controlRef = useRef(null);
  const triggerRef = useRef(null);
  const hasError = Boolean(error);

  const chosen = options.find((o) => o.value === selected);

  useEffect(() => {
    if (!open) return undefined;
    const onOutside = (e) => {
      if (controlRef.current && !controlRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', onOutside, true);
    return () => document.removeEventListener('click', onOutside, true);
  }, [open]);

  const openMenu = () => {
    if (disabled) return;
    const start = chosen ? options.indexOf(chosen) : 0;
    setActiveIndex(start);
    setOpen(true);
  };
  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };
  const choose = (i) => {
    const opt = options[i];
    if (!opt || opt.disabled) return;
    if (!isControlled) setInternal(opt.value);
    if (onChange) onChange(opt.value);
    close();
  };

  const onKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!open) openMenu();
        else setActiveIndex((i) => Math.min(i + 1, options.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!open) openMenu();
        else setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!open) openMenu();
        else choose(activeIndex);
        break;
      case 'Escape':
        if (open) { e.preventDefault(); close(); }
        break;
      default:
    }
  };

  const classes = [
    'sr-select',
    hasError && 'sr-select--error',
    disabled && 'sr-select--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const describedBy = [hint && `${rid}-hint`, hasError && `${rid}-error`].filter(Boolean).join(' ');

  return (
    <div className={classes} {...rest}>
      {label && (
        <label className="sr-select__label" id={`${rid}-label`}>
          {label}
          {required && (
            <span className="sr-select__required" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {hint && (
        <div className="sr-select__hint" id={`${rid}-hint`}>
          {hint}
        </div>
      )}

      <div className="sr-select__control" ref={controlRef}>
        <button
          ref={triggerRef}
          type="button"
          className="sr-select__trigger"
          id={`${rid}-trigger`}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-labelledby={label ? `${rid}-label ${rid}-trigger` : undefined}
          aria-describedby={describedBy || undefined}
          aria-invalid={hasError || undefined}
          aria-activedescendant={open && activeIndex >= 0 ? `${rid}-opt-${activeIndex}` : undefined}
          data-placeholder={chosen ? 'false' : 'true'}
          disabled={disabled}
          onClick={() => (open ? setOpen(false) : openMenu())}
          onKeyDown={onKeyDown}
        >
          <span className="sr-select__value">{chosen ? chosen.label : placeholder}</span>
          <span className="sr-select__chevron">
            <Icon name="nav/chevron-down" size="sm" color="inherit" />
          </span>
        </button>

        <ul
          className="sr-select__menu"
          id={`${rid}-menu`}
          role="listbox"
          aria-labelledby={label ? `${rid}-label` : undefined}
          hidden={!open}
        >
          {options.map((opt, i) => (
            <li
              key={opt.value}
              id={`${rid}-opt-${i}`}
              role="option"
              className={`sr-select__option${i === activeIndex ? ' is-active' : ''}`}
              aria-selected={opt.value === selected}
              aria-disabled={opt.disabled || undefined}
              onClick={() => choose(i)}
            >
              <span>{opt.label}</span>
              {opt.childMenu && (
                <span className="sr-select__option-chevron">
                  <Icon name="nav/chevron-right" size="sm" color="inherit" />
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {hasError && (
        <div className="sr-select__error" id={`${rid}-error`}>
          <span className="sr-select__error-icon">
            <Icon name="status/error-circle" size="xs" color="inherit" />
          </span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
