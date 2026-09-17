import React from 'react';
import { iconMarkup } from '@dhcw/sr-icons/build/icons.js';
import '@dhcw/sr-web/src/status-indicator/status-indicator.css';

/**
 * StatusIndicator — DHCW Single Record Design System
 * Filled status badge (Figma warnings/* group): success | error | warning,
 * plus `none` for "no status recorded".
 * Colour is semantic and driven by status tokens. Geometry derived from
 * Lucide (ISC), not traced. See DDR-013.
 *
 * Decorative by default (aria-hidden); pass `label` for a standalone
 * meaningful indicator.
 */

const GLYPHS = {
  success: (
    <>
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path d="M8 12.5l2.6 2.6 5.4-6" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  error: (
    <>
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <line x1="12" y1="7" x2="12" y2="13" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r="1.15" fill="#fff" />
    </>
  ),
  warning: (
    <>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" fill="currentColor" />
      <line x1="12" y1="9.5" x2="12" y2="14" stroke="#212b32" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1.15" fill="#212b32" />
    </>
  ),
};

/**
 * The fourth mark on the Figma Status Indicator page is the `action/remove`
 * dash, and it is the one member of this family that IS in the outline icon
 * set. So it is pulled from the set rather than hand-inlined beside the three
 * that are not — a copied path drifts the moment the icon is redrawn, and the
 * design-system check is right to flag a fourth inline SVG here.
 *
 * The stylesheet gives it the family's stroke weight; a 1px dash beside three
 * solid discs reads as a rendering fault at 16px.
 */
const NONE_MARKUP = { __html: iconMarkup('action/remove') };

export default function StatusIndicator({ status = 'success', size = 'md', label, className, ...rest }) {
  const classes = [
    'sr-status-indicator',
    `sr-status-indicator--${status}`,
    `sr-status-indicator--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true };

  if (status === 'none') {
    return (
      <span
        className={classes}
        {...a11y}
        // eslint-disable-next-line react/no-danger -- trusted, build-time-generated SVG source
        dangerouslySetInnerHTML={NONE_MARKUP}
        {...rest}
      />
    );
  }

  return (
    <span className={classes} {...a11y} {...rest}>
      <svg viewBox="0 0 24 24" width="100%" height="100%" focusable="false">
        {GLYPHS[status]}
      </svg>
    </span>
  );
}
