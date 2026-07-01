import React from 'react';
import '@dhcw/sr-web/src/header/header.css';
import Icon from '../icon/Icon.jsx';

/**
 * Header — DHCW Single Record Design System
 * Figma: Header bar set (475:19980).
 *
 * `variant`:
 *   'desktop'    — Type=Desktop 1: utility strip + main bar (logo, search,
 *                  notification, avatar)
 *   'desktop-2'  — Type=Desktop 2: single 80px bar (search + org selector +
 *                  Cymraeg + notification, avatar). No logo — pairs with the
 *                  sidebar Navigation.
 *   'mobile'     — Type=Mobile 1/2: compact bar; pass the symbol logo; set
 *                  `showMenu` for the leading hamburger.
 */

function Notification({ onClick }) {
  return (
    <button type="button" className="sr-header__notification" aria-label="Notifications" onClick={onClick}>
      <Icon name="comms/notification" size="md" color="inherit" />
    </button>
  );
}

function Avatar({ initials }) {
  return (
    <div className="sr-header__avatar">
      <span className="sr-header__avatar-initials">{initials}</span>
      <span className="sr-header__avatar-status" />
    </div>
  );
}

function Search({ placeholder, onSearch }) {
  return (
    <div className="sr-header__search">
      <Icon name="nav/search" size="sm" className="sr-header__search-icon" />
      <input className="sr-header__search-input" type="search" placeholder={placeholder} onChange={onSearch} />
    </div>
  );
}

export default function Header({
  logo,
  variant = 'desktop',
  showMenu = false,
  initials = '',
  searchPlaceholder = 'Type here to begin search',
  org = 'Cardiff and Vale UHB',
  onSearch,
  onMenuClick,
  onReportIssue,
  onLanguageToggle,
  onNotificationClick,
  onOrgClick,
  className,
  ...rest
}) {
  const isMobile = variant === 'mobile';
  const isBar = variant === 'desktop-2';
  const classes = [
    'sr-header',
    isMobile ? 'sr-header--mobile' : '',
    isMobile && showMenu ? 'sr-header--centered' : '',
    isBar ? 'sr-header--bar' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <header className={classes} {...rest}>
      {variant === 'desktop' && (
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
          <button type="button" className="sr-header__menu" aria-label="Open menu" onClick={onMenuClick}>
            <Icon name="nav/menu" size="md" color="inherit" />
          </button>
        )}

        {!isBar && <span className="sr-header__logo">{logo}</span>}

        {isBar ? (
          <>
            <Search placeholder={searchPlaceholder} onSearch={onSearch} />
            <div className="sr-header__cluster">
              <button type="button" className="sr-header__org" onClick={onOrgClick}>
                <span>{org}</span>
                <Icon name="nav/chevron-down" size="xs" color="inherit" />
              </button>
              <button type="button" className="sr-header__lang" onClick={onLanguageToggle}>
                <Icon name="location/language" size="xs" color="inherit" />
                <span>Cymraeg</span>
              </button>
              <Notification onClick={onNotificationClick} />
              <Avatar initials={initials} />
            </div>
          </>
        ) : (
          <>
            {!isMobile && <Search placeholder={searchPlaceholder} onSearch={onSearch} />}
            <div className="sr-header__actions">
              <Notification onClick={onNotificationClick} />
              <Avatar initials={initials} />
            </div>
          </>
        )}
      </div>
    </header>
  );
}
