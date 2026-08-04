import React, { useId, useMemo, useRef, useState } from 'react';
import '@dhcw/sr-web/src/input/input.css';
import '@dhcw/sr-web/src/select/select.css';
import '@dhcw/sr-web/src/autocomplete/autocomplete.css';
import Icon from '../icon/Icon.jsx';

/**
 * Autocomplete — DHCW Single Record Design System (React)
 * Searchable select (combobox). Composed from the Input search field and the
 * Select listbox (shared CSS). See packages/web/src/autocomplete.
 *
 * Props:
 *   options   [{ label, value }]
 *   value / onChange   controlled selected value (option value)
 *   onQueryChange(query)  optional — for async/service-backed lookups
 *   label, hint, placeholder
 */

/** Split a label around the matched query for bold highlighting. */
function Highlight({ label, query }) {
  if (!query) return label;
  const i = label.toLowerCase().indexOf(query.toLowerCase());
  if (i === -1) return label;
  return (
    <>
      {label.slice(0, i)}
      <span className="sr-autocomplete__match">{label.slice(i, i + query.length)}</span>
      {label.slice(i + query.length)}
    </>
  );
}

export default function Autocomplete({
  options = [],
  value,
  onChange,
  onQueryChange,
  label,
  hint,
  // Every other form field in the system can be marked required; this one
  // could not, so a required combobox had no way to say so — visually or to
  // a screen reader.
  required = false,
  placeholder = 'Search…',
  className,
  ...rest
}) {
  const rid = useId();
  const isControlled = value !== undefined;
  const selectedOpt = options.find((o) => o.value === value);
  const [query, setQuery] = useState(selectedOpt ? selectedOpt.label : '');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);

  const matches = useMemo(
    () => options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase())),
    [options, query]
  );

  const commitQuery = (q) => {
    setQuery(q);
    if (onQueryChange) onQueryChange(q);
  };

  const choose = (i) => {
    const opt = matches[i];
    if (!opt) return;
    commitQuery(opt.label);
    if (!isControlled) { /* uncontrolled: query is the state */ }
    if (onChange) onChange(opt.value);
    setOpen(false);
    inputRef.current?.focus();
  };

  const onKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!open) setOpen(true);
        setActiveIndex((i) => Math.min(i + 1, matches.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        if (open && activeIndex >= 0) { e.preventDefault(); choose(activeIndex); }
        break;
      case 'Escape':
        if (open) { e.preventDefault(); setOpen(false); }
        break;
      default:
    }
  };

  return (
    <div className={['sr-autocomplete', className].filter(Boolean).join(' ')} {...rest}>
      {label && (
        <label className="sr-input__label" htmlFor={`${rid}-input`}>
          {label}
          {required && (
            <span className="sr-input__required" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {hint && (
        <div className="sr-input__hint" id={`${rid}-hint`}>
          {hint}
        </div>
      )}

      <div className="sr-autocomplete__control">
        <div className="sr-input__field">
          <span className="sr-input__icon">
            <Icon name="nav/search" size="sm" color="inherit" />
          </span>
          <input
            ref={inputRef}
            className="sr-input__control"
            id={`${rid}-input`}
            type="text"
            autoComplete="off"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls={`${rid}-menu`}
            aria-activedescendant={open && activeIndex >= 0 ? `${rid}-opt-${activeIndex}` : undefined}
            aria-describedby={hint ? `${rid}-hint` : undefined}
            aria-required={required || undefined}
            placeholder={placeholder}
            value={query}
            onChange={(e) => {
              commitQuery(e.target.value);
              setActiveIndex(-1);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            onKeyDown={onKeyDown}
          />
          {query && (
            <button
              type="button"
              className="sr-autocomplete__clear"
              aria-label="Clear search"
              onClick={() => {
                commitQuery('');
                setOpen(false);
                if (onChange) onChange(undefined);
                inputRef.current?.focus();
              }}
            >
              <Icon name="nav/close" size="xs" color="inherit" />
            </button>
          )}
          {/* Without this the field looks like a plain search box and the
              options can only be discovered by typing — no use to someone who
              does not already know what is in the list. Same glyph Select
              uses, so the two read as the same kind of control.
              `tabIndex={-1}`: the input is the combobox and already opens the
              list with ArrowDown, so a second tab stop here would be a
              keyboard detour to somewhere the user has just been. */}
          <button
            type="button"
            className="sr-autocomplete__toggle"
            tabIndex={-1}
            aria-label={open ? 'Hide options' : 'Show options'}
            // mousedown would blur the input and close the menu before the
            // click landed, so the chevron would look broken on the way open.
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setOpen((o) => !o);
              setActiveIndex(-1);
              inputRef.current?.focus();
            }}
          >
            <Icon
              name={open ? 'nav/chevron-up' : 'nav/chevron-down'}
              size="sm"
              color="inherit"
            />
          </button>
        </div>

        {open && (
          <ul className="sr-select__menu" id={`${rid}-menu`} role="listbox">
            {matches.length === 0 ? (
              <li className="sr-autocomplete__empty" role="presentation">
                No matches
              </li>
            ) : (
              matches.map((opt, i) => (
                <li
                  key={opt.value}
                  id={`${rid}-opt-${i}`}
                  role="option"
                  className={`sr-select__option${i === activeIndex ? ' is-active' : ''}`}
                  aria-selected={opt.value === value}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(i)}
                >
                  <span>
                    <Highlight label={opt.label} query={query} />
                  </span>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
