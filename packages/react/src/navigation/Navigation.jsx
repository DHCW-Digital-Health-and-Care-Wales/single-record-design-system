import React, { useState } from 'react';
import '@dhcw/sr-web/src/navigation/navigation.css';
import Icon from '../icon/Icon.jsx';

/**
 * Navigation / Sidebar — DHCW Single Record Design System
 * Figma: Navigation/Sidebar/Desktop (725:8903). Two core types, each with an
 * Expanded state and two collapsed states:
 *   - Type=Sectioned (1317:24167 is Linear's Expanded; Sectioned's is 665:20955)
 *     groups items under section labels (PATIENTS, CLINICAL, ...).
 *   - Type=Linear (1317:24167) is a flat list, no section labels — for simpler,
 *     single-level navigation.
 *   - Collapsed "rail" (746:13066 / 1942:7143, 108px) stacks the icon ABOVE a
 *     permanently visible label, both centred. It is not a truncated version
 *     of the expanded row.
 *   - Collapsed "icon" (3569:15850 / 2212:7613, 48px) shows icons only.
 *
 * `sections` shape:
 *   [{ label, items: [{ icon, label, href, badge, children: [{ label, href }] }] }]
 * Items with a non-empty `children` array render an expandable submenu; the
 * chevron and aria-expanded reflect open state. `current` matches an item's
 * (or child's) `label` and renders aria-current="page". `type="linear"` flattens
 * `sections` into one list and drops the section labels/dividers.
 *
 * Icon-only collapse: the visible label becomes a tooltip revealed on
 * `:hover` AND `:focus-visible` (CSS only — see navigation.css), not hover
 * alone. A hover-only reveal fails WCAG 2.2 SC 1.4.13 and 2.1.1 for keyboard
 * users, who can tab to an item but never trigger a `:hover` state. The
 * `aria-label` on every item already gives screen readers the name regardless
 * of what's visible, so this is only about sighted keyboard users seeing the
 * same label a mouse user would.
 *
 * Note that products need not adopt every state: the Case Note Tracking
 * adaptation (U0Ugs6bG1KLzrrWdnxqcZO, 125:5362) ships Expanded and the 108px
 * rail only, and deliberately has no icon-only variant.
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
  type = 'sectioned',
  collapsed = false,
  onCollapseToggle,
  onSelect,
  logo,
  className,
  ...rest
}) {
  const isRail = collapsed === 'rail';
  const isIconOnly = collapsed === true || collapsed === 'icon';
  const classes = [
    'sr-nav',
    isIconOnly ? 'sr-nav--collapsed' : '',
    isRail ? 'sr-nav--rail' : '',
    type === 'linear' ? 'sr-nav--linear' : '',
    className,
  ].filter(Boolean).join(' ');

  const body = type === 'linear' ? (
    <div className="sr-nav__list">
      {sections.flatMap((section) => section.items).map((item) => (
        <NavItem key={item.label} {...item} current={current} onSelect={onSelect} />
      ))}
    </div>
  ) : (
    sections.map((section) => (
      <div className="sr-nav__section" key={section.label}>
        <span className="sr-nav__section-label">{section.label}</span>
        <div className="sr-nav__list">
          {section.items.map((item) => (
            <NavItem key={item.label} {...item} current={current} onSelect={onSelect} />
          ))}
        </div>
      </div>
    ))
  );

  return (
    <nav className={classes} aria-label="Primary" {...rest}>
      <div className="sr-nav__header">
        <span className="sr-nav__logo">{logo}</span>
        <button
          type="button"
          className="sr-nav__collapse"
          aria-label={(isRail || isIconOnly) ? 'Expand navigation' : 'Collapse navigation'}
          onClick={onCollapseToggle}
        >
          <Icon name="nav/chevron-left" size="xs" color="inherit" />
        </button>
      </div>

      <div className="sr-nav__body">{body}</div>

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
