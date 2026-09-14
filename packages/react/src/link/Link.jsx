import React from 'react';
import Icon from '../icon/Icon.jsx';

/**
 * Link — DHCW Single Record Design System
 *
 * Navigation, not action. Matched to the Figma "Link" set (1636:21236) and to
 * `packages/web/src/link/link.css`.
 *
 * Props
 *   href        string  — required. A link without a destination is a Button.
 *   children    node    — the label. Describe the destination, not the gesture.
 *   size        'inherit' | 'lg' | 'md' | 'sm'. Default 'inherit', which is what
 *                         a link inside a sentence wants.
 *   type        'default' | 'destructive'. Default 'default'.
 *   icon        string  — an optional leading icon name. Decorative.
 *   newTab      boolean — adds target and rel, and appends a visible
 *                         "(opens in a new tab)" so the behaviour is not carried
 *                         by an icon alone.
 *   disabled    boolean — renders without an href and with aria-disabled.
 *                         Usually the wrong pattern; prefer plain text.
 */
export function Link({
  href,
  children,
  size = 'inherit',
  type = 'default',
  icon,
  newTab = false,
  disabled = false,
  className = '',
  ...rest
}) {
  const classes = [
    'sr-link',
    size !== 'inherit' && `sr-link--${size}`,
    type === 'destructive' && 'sr-link--destructive',
    icon && 'sr-link--icon',
    className,
  ].filter(Boolean).join(' ');

  // A disabled link keeps no href, so it leaves the tab order the way the
  // browser intends rather than by a tabindex we have to remember to remove.
  const anchorProps = disabled
    ? { 'aria-disabled': 'true', role: 'link' }
    : { href, ...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {}) };

  return (
    <a className={classes} {...anchorProps} {...rest}>
      {icon && (
        <span className="sr-link__icon" aria-hidden="true">
          <Icon name={icon} size={size === 'sm' ? 'sm' : 'md'} color="inherit" />
        </span>
      )}
      <span>
        {children}
        {newTab && <span> (opens in a new tab)</span>}
      </span>
    </a>
  );
}

export default Link;
