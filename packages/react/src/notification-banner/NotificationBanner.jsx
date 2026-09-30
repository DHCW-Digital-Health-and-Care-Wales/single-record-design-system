import React from 'react';
import Icon from '../icon/Icon.jsx';

/**
 * NotificationBanner — DHCW Single Record Design System
 *
 * Reports that something happened. Matched to the merged Figma
 * `Notification Banner` set (2561:21695) and to
 * `packages/web/src/notification-banner/notification-banner.css`.
 *
 *   Inset text is part of the page. A banner is an event.
 *
 * Props
 *   severity    'information'|'success'|'warning'|'error'   default 'information'
 *   placement   'inline'|'global'                            default 'inline'
 *   title       node   — optional. Every live banner in the Figma file has
 *                        none, so it is off unless you pass it.
 *   children    node   — the message.
 *   actions     node   — optional action row.
 *   onDismiss   fn     — when given, a close button is rendered.
 *   dismissLabel string — accessible name for that button. Default 'Dismiss'.
 *   icon        node   — the severity mark. Defaults to the severity's
 *                        own icon (SEVERITY_ICON below), so leave it out.
 *                        Pass another <Icon> only with a reason, never an
 *                        inline SVG — check:ds rejects those. The icon is
 *                        not optional: with the wording it is what keeps
 *                        severity from being colour alone (SC 1.4.1).
 *
 * Announcement
 *   `error` and `warning` render role="alert" (assertive): they interrupt.
 *   `information` and `success` render role="status" (polite): they do not.
 *   Pass `role` explicitly to override — a success that genuinely must
 *   interrupt is rare but real.
 *
 * Everything else spreads onto the element.
 */
/**
 * The icon Figma draws for each severity (Notification Banner, 2561:21695) —
 * except Error, where Figma reuses status/info. One glyph, one meaning
 * (DDR-029): an error takes status/error-circle.
 */
const SEVERITY_ICON = {
  information: 'status/info',
  success: 'status/success',
  warning: 'status/warning',
  error: 'status/error-circle',
};

export function NotificationBanner({
  severity = 'information',
  placement = 'inline',
  title,
  children,
  actions,
  onDismiss,
  dismissLabel = 'Dismiss',
  icon,
  role,
  className = '',
  ...rest
}) {
  const interrupts = severity === 'error' || severity === 'warning';
  const resolvedRole = role || (interrupts ? 'alert' : 'status');

  const classes = [
    'sr-notification-banner',
    `sr-notification-banner--${severity}`,
    placement === 'global' ? 'sr-notification-banner--global' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} role={resolvedRole} {...rest}>
      <span className="sr-notification-banner__icon" aria-hidden="true">
        {icon ?? <Icon name={SEVERITY_ICON[severity] ?? SEVERITY_ICON.information} size="sm" color="inherit" />}
      </span>
      <div className="sr-notification-banner__content">
        {title && <p className="sr-notification-banner__title">{title}</p>}
        {children && <p className="sr-notification-banner__body">{children}</p>}
        {actions && <div className="sr-notification-banner__actions">{actions}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          className="sr-notification-banner__dismiss"
          onClick={onDismiss}
          aria-label={dismissLabel}
        >
          <Icon name="nav/close" size="xs" color="inherit" />
        </button>
      )}
    </div>
  );
}

export default NotificationBanner;
