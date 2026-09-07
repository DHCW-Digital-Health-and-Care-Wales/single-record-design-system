import React, { useId, useRef, useState } from 'react';
import '@dhcw/sr-web/src/tabs/tabs.css';

/**
 * Tabs — DHCW Single Record Design System
 * Figma: Menu Tab (817:7219) on page 1753:21420.
 *
 * Switches the view: one tablist, one panel region, exactly one selected tab.
 * For picking a value *within* a view (a filter, a display option) use
 * SegmentedControl instead.
 *
 * Controlled (`value` + `onChange`) or uncontrolled (`defaultValue`).
 * `tabs`: [{ id, label, count, disabled, panel }].
 *
 * Implements the WAI-ARIA tabs pattern in full — roving tabindex, arrow keys,
 * Home/End, and disabled tabs skipped rather than focused. That behaviour is
 * the reason this wrapper exists; without it every consumer reimplements it,
 * and most of them stop at onClick.
 */
export default function Tabs({
  tabs = [],
  value,
  defaultValue,
  onChange,
  orientation = 'horizontal',
  ariaLabel = 'Sections',
  className,
  ...rest
}) {
  const reactId = useId();
  const isControlled = value !== undefined;
  const firstEnabled = tabs.find((t) => !t.disabled);
  const [internal, setInternal] = useState(defaultValue ?? firstEnabled?.id ?? tabs[0]?.id);
  const selected = isControlled ? value : internal;
  const vertical = orientation === 'vertical';
  const refs = useRef([]);

  const idFor = (t, i) => t.id ?? `${reactId}-${i}`;
  const selectedIndex = tabs.findIndex((t, i) => idFor(t, i) === selected);

  const select = (i) => {
    const t = tabs[i];
    if (!t || t.disabled) return;
    const id = idFor(t, i);
    if (!isControlled) setInternal(id);
    onChange?.(id);
    refs.current[i]?.focus();
  };

  // Wrap past the ends, and step over anything disabled — a disabled tab must
  // not swallow the keypress and strand focus.
  const step = (from, dir) => {
    const n = tabs.length;
    let i = from;
    for (let k = 0; k < n; k += 1) {
      i = (i + dir + n) % n;
      if (!tabs[i].disabled) return i;
    }
    return from;
  };

  const onKeyDown = (e, i) => {
    const next = vertical ? 'ArrowDown' : 'ArrowRight';
    const prev = vertical ? 'ArrowUp' : 'ArrowLeft';
    let target = null;
    if (e.key === next) target = step(i, 1);
    else if (e.key === prev) target = step(i, -1);
    else if (e.key === 'Home') target = tabs.findIndex((t) => !t.disabled);
    else if (e.key === 'End') target = tabs.map((t) => !t.disabled).lastIndexOf(true);
    if (target === null || target < 0) return;
    e.preventDefault();
    select(target);
  };

  const listClasses = ['sr-tabs', vertical && 'sr-tabs--vertical', className]
    .filter(Boolean).join(' ');

  return (
    <div style={vertical ? { display: 'flex', gap: '24px' } : undefined} {...rest}>
      <div
        role="tablist"
        aria-label={ariaLabel}
        aria-orientation={vertical ? 'vertical' : undefined}
        className={listClasses}
      >
        {tabs.map((t, i) => {
          const id = idFor(t, i);
          const isSelected = id === selected;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              id={`${reactId}-tab-${i}`}
              ref={(el) => { refs.current[i] = el; }}
              className="sr-tabs__tab"
              aria-selected={isSelected}
              aria-controls={`${reactId}-panel-${i}`}
              aria-disabled={t.disabled || undefined}
              // The count is decorative in the badge, so fold it into the name.
              aria-label={t.count !== undefined ? `${t.label}, ${t.count} items` : undefined}
              disabled={t.disabled}
              tabIndex={isSelected ? 0 : -1}
              data-label={t.label}
              onClick={() => select(i)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              {t.label}
              {t.count !== undefined && (
                <span className="sr-tabs__badge" aria-hidden="true">{t.count}</span>
              )}
            </button>
          );
        })}
      </div>

      <div>
        {tabs.map((t, i) => (
          <div
            key={idFor(t, i)}
            role="tabpanel"
            id={`${reactId}-panel-${i}`}
            aria-labelledby={`${reactId}-tab-${i}`}
            className="sr-tabs__panel"
            tabIndex={0}
            hidden={i !== selectedIndex}
          >
            {t.panel}
          </div>
        ))}
      </div>
    </div>
  );
}
