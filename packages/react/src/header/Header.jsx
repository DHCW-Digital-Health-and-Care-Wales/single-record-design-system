import React from 'react';
import '@dhcw/sr-web/src/header/header.css';
import Icon from '../icon/Icon.jsx';

/**
 * Header — DHCW Single Record Design System
 * Figma: Header bar (475:19980), Type=Desktop 1
 */
export default function Header({
  logo,
  initials = '',
  searchPlaceholder = 'Type here to begin search',
  onSearch,
  onReportIssue,
  onLanguageToggle,
  onNotificationClick,
  className,
  ...rest
}) {
  const classes = ['sr-header', className].filter(Boolean).join(' ');

  return (
    <header className={classes} {...rest}>
      <div className="sr-header__utility">
        <a className="sr-header__utility-link" href="#" onClick={onReportIssue}>
          Report an issue
        </a>
        <a className="sr-header__utility-link" href="#" onClick={onLanguageToggle}>
          Cymraeg
        </a>
      </div>

      <div className="sr-header__main">
        <span className="sr-header__logo">{logo}</span>

        <div className="sr-header__search">
          <Icon name="nav/search" size="sm" className="sr-header__search-icon" />
          <input
            className="sr-header__search-input"
            type="search"
            placeholder={searchPlaceholder}
            onChange={onSearch}
          />
        </div>

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
