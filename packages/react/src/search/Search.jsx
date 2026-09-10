import React, { useId, useMemo, useRef, useState } from 'react';
import '@dhcw/sr-web/src/search/search.css';
import Icon from '../icon/Icon.jsx';

/**
 * Search — DHCW Single Record Design System (React)
 * Figma: "Search" (1715:375), "Search Suggestions" (1716:238) on page
 * 1701:17851.
 *
 * The system's only search field. Input's `Type=Search` variants were removed
 * on 2026-06-04 — to put a search inside a labelled form field, pass `label`,
 * `hint` and `required` here rather than wrapping an Input around it.
 *
 * Props:
 *   type          'basic' | 'with-button' | 'with-icon-button' | 'typeahead'
 *   value/onChange   controlled query (uncontrolled if `value` omitted)
 *   onSubmit(query)  with-button / with-icon-button
 *   suggestions   [{ label, value, meta }] — typeahead
 *   onSelect(option) typeahead: a suggestion was chosen
 *   filter        false to disable local filtering (server already filtered)
 *   loading, error, disabled, label, hideLabel, hint, required, placeholder
 *
 * Implements the WAI-ARIA combobox pattern for `typeahead` — ↓ ↑ Home End
 * Enter Esc, aria-activedescendant, and focus returned to the input after a
 * choice. That behaviour is the reason this wrapper exists.
 */

/** Bold the matched run of a label, leaving the rest plain. */
function Highlight({ label, query }) {
  if (!query) return label;
  const i = label.toLowerCase().indexOf(query.toLowerCase());
  if (i === -1) return label;
  return (
    <>
      {label.slice(0, i)}
      <span className="sr-search__match">{label.slice(i, i + query.length)}</span>
      {label.slice(i + query.length)}
    </>
  );
}

export default function Search({
  type = 'basic',
  value,
  onChange,
  onSubmit,
  suggestions = [],
  onSelect,
  filter = true,
  loading = false,
  error,
  disabled = false,
  label,
  hideLabel = false,
  hint,
  required = false,
  placeholder = 'Search',
  submitLabel = 'Search',
  className,
  ...rest
}) {
  const rid = useId();
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState('');
  const query = isControlled ? value : internal;
  const isTypeahead = type === 'typeahead';
  const hasButton = type === 'with-button' || type === 'with-icon-button';

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef(null);

  const matches = useMemo(() => {
    if (!filter || !query) return suggestions;
    const q = query.toLowerCase();
    return suggestions.filter((s) => s.label.toLowerCase().includes(q));
  }, [suggestions, query, filter]);

  const setQuery = (q) => {
    if (!isControlled) setInternal(q);
    onChange?.(q);
  };

  const close = () => { setOpen(false); setActive(-1); };

  const choose = (i) => {
    const opt = matches[i];
    if (!opt) return;
    setQuery(opt.label);
    onSelect?.(opt);
    close();
    inputRef.current?.focus();
  };

  const onKeyDown = (e) => {
    if (!isTypeahead) {
      // A bare search field still submits on Enter when it has a button.
      if (e.key === 'Enter' && hasButton && query) { e.preventDefault(); onSubmit?.(query); }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!open) setOpen(true);
        setActive((i) => Math.min(i + 1, matches.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActive((i) => Math.max(i - 1, 0));
        break;
      case 'Home':
        if (!open || !matches.length) return;
        e.preventDefault();
        setActive(0);
        break;
      case 'End':
        if (!open || !matches.length) return;
        e.preventDefault();
        setActive(matches.length - 1);
        break;
      case 'Enter':
        if (open && active >= 0) { e.preventDefault(); choose(active); }
        else if (hasButton && query) { e.preventDefault(); onSubmit?.(query); }
        break;
      case 'Escape':
        // Closes the list; does NOT clear the query. Losing a long query to a
        // stray Esc is worse than the list staying open.
        if (open) { e.preventDefault(); close(); }
        break;
      default:
    }
  };

  const rootClasses = [
    'sr-search',
    error && 'sr-search--error',
    disabled && 'sr-search--disabled',
    className,
  ].filter(Boolean).join(' ');

  const describedBy = [hint && `${rid}-hint`, error && `${rid}-error`]
    .filter(Boolean).join(' ') || undefined;

  return (
    <div className={rootClasses} {...rest}>
      {/* The label always exists. `hideLabel` moves it off-screen for a
          standalone search bar; it never removes it. */}
      {label && (
        <label
          className={hideLabel ? 'sr-visually-hidden' : 'sr-search__label'}
          htmlFor={`${rid}-input`}
        >
          {label}
          {required && !hideLabel && (
            <span className="sr-search__required" aria-hidden="true">*</span>
          )}
        </label>
      )}
      {hint && <div className="sr-search__hint" id={`${rid}-hint`}>{hint}</div>}

      <div className="sr-search__row">
        <div className="sr-search__control">
          <div className="sr-search__field">
            <span className="sr-search__icon">
              <Icon name="nav/search" size="sm" color="inherit" />
            </span>
            <input
              ref={inputRef}
              type="search"
              className="sr-search__control-input"
              id={`${rid}-input`}
              autoComplete="off"
              placeholder={placeholder}
              value={query}
              disabled={disabled}
              aria-describedby={describedBy}
              aria-required={required || undefined}
              aria-invalid={error ? true : undefined}
              role={isTypeahead ? 'combobox' : undefined}
              aria-autocomplete={isTypeahead ? 'list' : undefined}
              aria-expanded={isTypeahead ? open : undefined}
              aria-controls={isTypeahead ? `${rid}-menu` : undefined}
              aria-activedescendant={
                isTypeahead && open && active >= 0 ? `${rid}-opt-${active}` : undefined
              }
              onChange={(e) => {
                setQuery(e.target.value);
                if (isTypeahead) { setActive(-1); setOpen(true); }
              }}
              onFocus={() => isTypeahead && setOpen(true)}
              onBlur={() => isTypeahead && close()}
              onKeyDown={onKeyDown}
            />

            {loading ? (
              <span className="sr-search__spinner">
                <Icon name="status/loading" size="sm" color="inherit" />
              </span>
            ) : (
              query && (
                <button
                  type="button"
                  className="sr-search__clear"
                  aria-label="Clear search"
                  disabled={disabled}
                  onClick={() => {
                    setQuery('');
                    close();
                    // Clearing is a step in searching, not the end of it —
                    // focus goes back to the input, not nowhere.
                    inputRef.current?.focus();
                  }}
                >
                  <Icon name="nav/clear" size="sm" color="inherit" />
                </button>
              )
            )}
          </div>

          {isTypeahead && open && (
            <ul
              className="sr-search__suggestions"
              id={`${rid}-menu`}
              role="listbox"
              aria-label={label || placeholder}
            >
              {matches.length === 0 ? (
                // The query is quoted back so the user can see what was
                // actually tried — usually a typo they spot instantly.
                <li className="sr-search__status-row" role="presentation">
                  {`No matches for "${query}"`}
                </li>
              ) : (
                matches.map((opt, i) => (
                  <li
                    key={opt.value ?? opt.label}
                    id={`${rid}-opt-${i}`}
                    role="option"
                    aria-selected={i === active}
                    className={`sr-search__suggestion${i === active ? ' is-active' : ''}`}
                    // mousedown would blur the input and close the list before
                    // the click landed, so the row would look unclickable.
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => choose(i)}
                  >
                    <span className="sr-search__suggestion-label">
                      <Highlight label={opt.label} query={query} />
                    </span>
                    {opt.meta && (
                      <span className="sr-search__suggestion-meta">{opt.meta}</span>
                    )}
                  </li>
                ))
              )}
            </ul>
          )}
        </div>

        {hasButton && (
          <button
            type="submit"
            className={
              type === 'with-icon-button'
                ? 'sr-search__submit sr-search__submit--icon'
                : 'sr-search__submit'
            }
            // Nothing typed means nothing to submit; the Figma Default state
            // ships this button already disabled for that reason.
            disabled={disabled || !query}
            aria-label={type === 'with-icon-button' ? submitLabel : undefined}
            onClick={() => onSubmit?.(query)}
          >
            {type === 'with-icon-button'
              ? <Icon name="nav/search" size="sm" color="inherit" />
              : submitLabel}
          </button>
        )}
      </div>

      {/* Loading is a state the user must be told about, not only shown. */}
      <span className="sr-visually-hidden" role="status">
        {loading ? 'Searching…' : ''}
      </span>

      {error && (
        <div className="sr-search__error" id={`${rid}-error`}>
          <span className="sr-search__error-icon">
            <Icon name="status/error-circle" size="xs" color="inherit" />
          </span>
          {error}
        </div>
      )}
    </div>
  );
}
