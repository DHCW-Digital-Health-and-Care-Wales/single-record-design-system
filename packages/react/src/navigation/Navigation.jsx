import React from 'react';
import '@dhcw/sr-web/src/navigation/navigation.css';
import Icon from '../icon/Icon.jsx';

/**
 * Navigation / Sidebar — DHCW Single Record Design System
 * Figma: Navigation/Sidebar/Desktop (725:8903), Type=Sectioned, State=Expanded
 *
 * `sections` shape: [{ label, items: [{ icon, label, href, badge, submenu }] }]
 * `current` matches an item's `label` and renders aria-current="page".
 */

function NavItem({ icon, label, href, badge, submenu, current, onSelect }) {
  const Tag = href ? 'a' : 'button';
  const isCurrent = current === label;
  return (
    <Tag
      type={href ? undefined : 'button'}
      href={href}
      className="sr-nav__item"
      aria-current={isCurrent ? 'page' : undefined}
      onClick={onSelect ? () => onSelect(label) : undefined}
    >
      <span className="sr-nav__item-main">
        <Icon name={icon} size="xs" color="inherit" className="sr-nav__item-icon" />
        <span className="sr-nav__item-label">{label}</span>
        {badge && <span className="sr-nav__item-badge">{badge}</span>}
      </span>
      {submenu && <Icon name="nav/chevron-down" size="xs" className="sr-nav__item-chevron" />}
    </Tag>
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
