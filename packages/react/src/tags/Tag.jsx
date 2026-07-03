import React, { forwardRef } from 'react';
import '@dhcw/sr-web/src/tags/tags.css';
import Icon from '../icon/Icon.jsx';

/**
 * Tag — DHCW Single Record Design System (React)
 * Wraps the shared @dhcw/sr-web tags.css.
 * Figma: Tags/status (399:7984) and Tags/filter (3229:71674).
 *
 * Props:
 *   variant  'status' (filled label) | 'filter' (outline + close). Default 'status'.
 *   type     status: Blue|Green|Red|Yellow|Grey|Outline
 *            filter: Blue|Green|Red|Yellow|Black
 *   size     'default' | 'small'
 *   onClose  filter tags: called when the close button is pressed.
 *   closeLabel  accessible name for the close button (e.g. "Remove Ward: Aneurin").
 */
const Tag = forwardRef(function Tag(
  { variant = 'status', type = 'blue', size = 'default', onClose, closeLabel, children, className, ...rest },
  ref
) {
  const isFilter = variant === 'filter';
  const classes = [
    'sr-tag',
    `sr-tag--${variant}`,
    `sr-tag--${type}`,
    `sr-tag--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span ref={ref} className={classes} {...rest}>
      <span>{children}</span>
      {isFilter && (
        <button
          type="button"
          className="sr-tag__close"
          aria-label={closeLabel || 'Remove'}
          onClick={onClose}
        >
          <Icon name="nav/close" size="xs" color="inherit" />
        </button>
      )}
    </span>
  );
});

export default Tag;
