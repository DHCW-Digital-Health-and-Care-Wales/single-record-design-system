import React, { forwardRef } from 'react';
import '@dhcw/sr-web/src/tags/tags.css';
import Icon from '../icon/Icon.jsx';

/**
 * Tag — DHCW Single Record Design System (React)
 * Wraps the shared @dhcw/sr-web tags.css. Figma Tags set (399:7984).
 *
 * Props:
 *   type   Blue | Green | Red | Yellow | Grey | Outline  (default 'blue')
 *   size   'default' | 'small'                            (default 'default')
 *   onClose  when provided, renders a dismiss button (dismissible filter tag);
 *            called with the click event. Requires `closeLabel` for the a11y name.
 *   closeLabel  accessible name for the close button (e.g. "Remove Ward: Aneurin").
 */
const Tag = forwardRef(function Tag(
  { type = 'blue', size = 'default', onClose, closeLabel, children, className, ...rest },
  ref
) {
  const closable = typeof onClose === 'function';
  const classes = [
    'sr-tag',
    `sr-tag--${type}`,
    `sr-tag--${size}`,
    closable && 'sr-tag--closable',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span ref={ref} className={classes} {...rest}>
      <span>{children}</span>
      {closable && (
        <button
          type="button"
          className="sr-tag__close"
          aria-label={closeLabel || 'Remove'}
          onClick={onClose}
        >
          <Icon name="nav/close" />
        </button>
      )}
    </span>
  );
});

export default Tag;
