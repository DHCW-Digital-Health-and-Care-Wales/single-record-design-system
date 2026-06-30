import React, { useState } from 'react';
import '@dhcw/sr-web/src/navigation/navigation.css';
import Icon from '../icon/Icon.jsx';

/**
 * Navigation / Sidebar — DHCW Single Record Design System
 * Figma: Navigation/Sidebar/Desktop (725:8903), Type=Sectioned, State=Expanded
 *
 * `sections` shape:
 *   [{ label, items: [{ icon, label, href, badge, children: [{ label, href }] }] }]
 * Items with a non-empty `children` array render an expandable submenu; the
 * chevron and aria-expanded reflect open state. `current` matches an item's
 * (or child's) `label` and renders aria-current="page".
 */

function NavItem({ icon, label, href, badge, children, current, onSelect }) {
  const [open, setOpen] = useState(false);
  const hasChildren = Array.isArray(children) && children.length > 0;
  const isCurrent = current === label;
  // A parent with children is always a button (it toggles); otherwise it links.
  const Tag = href && !hasChildren ? 'a' : 'button';

  const handleClick = () => {
    if (hasChildren) setOpen((o) => !o);
    else if (onSelect) onSelect(label);
  };

  return (
    <>
      <Tag
        type={Tag === 'button' ? 'button' : undefined}
        href={Tag === 'a' ? href : undefined}
        className="sr-nav__item"
        aria-label={label}
        aria-current={isCurrent ? 'page' : undefined}
        aria-expanded={hasChildren ? open : undefined}
        onClick={handleClick}
      >
        <span className="sr-nav__item-main">
          <Icon name={icon} size="xs" color="inherit" className="sr-nav__item-icon" />
          <span className="sr-nav__item-label">{label}</span>
          {badge && <span className="sr-nav__item-badge">{badge}</span>}
        </span>
        {hasChildren && (
          <Icon
            name="nav/chevron-down"
            size="xs"
            className={`sr-nav__item-chevron${open ? ' sr-nav__item-chevron--open' : ''}`}
          />
        )}
      </Tag>

      {hasChildren && open && (
        <ul className="sr-nav__submenu">
          {children.map((child) => (
            <li key={child.label}>
              <a
                className="sr-nav__subitem"
                href={child.href || '#'}
                aria-current={current === child.label ? 'page' : undefined}
                onClick={onSelect ? () => onSelect(child.label) : undefined}
              >
                {child.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function Navigation({
  sections,
  footerItems,
  current,
  collapsed = false,
  onCollapseToggle,
  onSelect,
  logo,
  className,
  ...rest
}) {
  const classes = ['sr-nav', collapsed ? 'sr-nav--collapsed' : '', className].filter(Boolean).join(' ');

  return (
    <nav className={classes} aria-label="Primary" {...rest}>
      <div className="sr-nav__header">
        <span className="sr-nav__logo">{logo}</span>
        <button
          type="button"
          className="sr-nav__collapse"
          aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
          onClick={onCollapseToggle}
        >
          <Icon name="nav/chevron-left" size="xs" color="inherit" />
        </button>
      </div>

      <div className="sr-nav__body">
        {sections.map((section) => (
          <div className="sr-nav__section" key={section.label}>
            <span className="sr-nav__section-label">{section.label}</span>
            <div className="sr-nav__list">
              {section.items.map((item) => (
                <NavItem key={item.label} {...item} current={current} onSelect={onSelect} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {footerItems && footerItems.length > 0 && (
        <div className="sr-nav__footer">
          {footerItems.map((item) => (
            <NavItem key={item.label} {...item} current={current} onSelect={onSelect} />
          ))}
        </div>
      )}
    </nav>
  );
}
