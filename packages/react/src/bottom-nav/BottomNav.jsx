import React from 'react';
import '@dhcw/sr-web/src/bottom-nav/bottom-nav.css';
import Icon from '../icon/Icon.jsx';

/**
 * Bottom navigation (mobile) — DHCW Single Record Design System
 * Figma: Footer Nav (665:16526), Type=Mobile
 *
 * `items` shape: [{ icon, label, href }]. `current` matches an item's `label`
 * and renders aria-current="page".
 */
export default function BottomNav({ items = [], current, onSelect, className, ...rest }) {
  const classes = ['sr-bottom-nav', className].filter(Boolean).join(' ');

  return (
    <nav className={classes} aria-label="Primary" {...rest}>
      {items.map(({ icon, label, href }) => {
        const Tag = href ? 'a' : 'button';
        return (
          <Tag
            key={label}
            type={href ? undefined : 'button'}
            href={href}
            className="sr-bottom-nav__item"
            aria-current={current === label ? 'page' : undefined}
            onClick={onSelect ? () => onSelect(label) : undefined}
          >
            <span className="sr-bottom-nav__icon">
              <Icon name={icon} size="md" color="inherit" />
            </span>
            <span className="sr-bottom-nav__label">{label}</span>
          </Tag>
        );
      })}
    </nav>
  );
}
