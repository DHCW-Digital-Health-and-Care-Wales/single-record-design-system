import React, { forwardRef } from 'react';
import '@dhcw/sr-web/src/tags/tags.css';
import Icon from '../icon/Icon.jsx';

/**
 * Tag — DHCW Single Record Design System (React)
 * Wraps the shared @dhcw/sr-web tags.css.
 * Figma: Tags/status (399:7984) and Tags/filter (3229:71674).
 *
 * Props:
 *   variant  'status' (filled label) | 'filter' (outline + close)
 *            | 'count' (a 24px disc holding a number). Default 'status'.
 *   type     status: blue|green|red|yellow|grey|outline
 *            filter: blue|green|red|yellow|black
 *            count:  blue|green|red|yellow|grey|outline|dark-blue
 *   size     'default' | 'small'
 *   onClose  filter tags: called when the close button is pressed.
 *   closeLabel  accessible name for the close button (e.g. "Remove Ward: Aneurin").
 */
const Tag = forwardRef(function Tag(
  { variant = 'status', type = 'blue', size = 'default', onClose, closeLabel, children, className, ...rest },
  ref
) {
  const isFilter = variant === 'filter';
  const isCount = variant === 'count';
  // A count is a fixed 24px disc, so the size modifier does not apply to it —
  // adding it would fight the width and height the variant sets.
  const classes = [
    'sr-tag',
    `sr-tag--${variant}`,
    `sr-tag--${type}`,
    !isCount && `sr-tag--${size}`,
    // Past two digits a circle cannot hold the number, so it becomes a pill.
    isCount && String(children ?? '').length > 2 && 'sr-tag--wide',
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
