import React from 'react';
import '@dhcw/sr-web/src/badge/badge.css';

/**
 * Badge — DHCW Single Record Design System
 *
 * A count, as a pill. Matched to `packages/web/src/badge/badge.css`; the same
 * badge the navigation item and the tab render.
 *
 * Always `aria-hidden`. The count belongs in the accessible name of whatever
 * the badge sits on — "Referrals, 20 items" — and the host is responsible for
 * putting it there. Navigation and Tabs already do.
 *
 * A badge is a quantity. Not a status (Tag, StatusIndicator), not an alert
 * (NotificationBanner).
 *
 * Props
 *   children  node     — the count. A number, as text ("20").
 *   max       number   — a numeric count above this shows as "99+", so the pill
 *                        stops growing. Default 99. The host's accessible name
 *                        still carries the real number.
 *
 * Everything else spreads onto the element.
 */

/** "99+" above `max`; anything that is not a number passes through unchanged. */
export function formatCount(count, max = 99) {
  return typeof count === 'number' && count > max ? `${max}+` : count;
}

export function Badge({ children, max = 99, className = '', ...rest }) {
  const classes = ['sr-badge', className].filter(Boolean).join(' ');
  return (
    <span className={classes} aria-hidden="true" {...rest}>{formatCount(children, max)}</span>
  );
}

export default Badge;
