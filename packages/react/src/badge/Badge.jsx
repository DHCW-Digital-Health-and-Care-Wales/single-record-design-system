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
 *
 * Everything else spreads onto the element.
 */
export function Badge({ children, className = '', ...rest }) {
  const classes = ['sr-badge', className].filter(Boolean).join(' ');
  return (
    <span className={classes} aria-hidden="true" {...rest}>{children}</span>
  );
}

export default Badge;
