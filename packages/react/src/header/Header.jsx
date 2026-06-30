import React from 'react';
import '@dhcw/sr-web/src/header/header.css';
import Icon from '../icon/Icon.jsx';

/**
 * Header — DHCW Single Record Design System
 * Figma: Header bar set (475:19980) — Type=Desktop 1 and Type=Mobile 1/2.
 *
 * `variant`:
 *   'desktop' — utility strip + main bar (logo, search, notification, avatar)
 *   'mobile'  — single compact bar; pass the symbol logo; set `showMenu` for
 *               the leading hamburger (Mobile 1) or omit it (Mobile 2).
 */
export default function Header({
  logo,
  variant = 'desktop',
  showMenu = false,
  initials = '',
  searchPlaceholder = 'Type here to begin search',
  onSearch,
  onMenuClick,
  onReportIssue,
  onLanguageToggle,
  onNotificationClick,
  className,
  ...rest
}) {
  const isMobile = variant === 'mobile';
  const classes = [
    'sr-header',
    isMobile ? 'sr-header--mobile' : '',
    isMobile && showMenu ? 'sr-header--centered' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <header className={classes} {...rest}>
      {!isMobile && (
        <div className="sr-header__utility">
          <a className="sr-header__utility-link" href="#" onClick={onReportIssue}>
            Report an issue
          </a>
          <a className="sr-header__utility-link" href="#" onClick={onLanguageToggle}>
            <Icon name="location/language" size="xs" className="sr-header__utility-icon" />
            <span>Cymraeg</span>
          </a>
        </div>
      )}

      <div className="sr-header__main">
        {isMobile && showMenu && (
          <button
            type="button"
            className="sr-header__menu"
            aria-label="Open menu"
            onClick={onMenuClick}
          >
            <Icon name="nav/menu" size="md" color="inherit" />
          </button>
        )}

        <span className="sr-header__logo">{logo}</span>

        {!isMobile && (
          <div className="sr-header__search">
            <Icon name="nav/search" size="sm" className="sr-header__search-icon" />
            <input
              className="sr-header__search-input"
              type="search"
              placeholder={searchPlaceholder}
              onChange={onSearch}
            />
          </div>
        )}

        <div className="sr-header__actions">
          <button
            type="button"
            className="sr-header__notification"
            aria-label="Notifications"
            onClick={onNotificationClick}
          >
            <Icon name="comms/notification" size="md" color="inherit" />
          </button>
          <div className="sr-header__avatar">
            <span className="sr-header__avatar-initials">{initials}</span>
            <span className="sr-header__avatar-status" />
          </div>
        </div>
      </div>
    </header>
  );
}
