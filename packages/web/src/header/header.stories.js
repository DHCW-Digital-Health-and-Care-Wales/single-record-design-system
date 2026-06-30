import './header.css';
import '@dhcw/sr-tokens/build/css/tokens.css';
import { iconMarkup } from '@dhcw/sr-icons/build/icons.js';
import { logoFullSrc, logoSymbolSrc } from '../assets/logo.js';

/**
 * Header — DHCW Single Record Design System
 * Figma: Header bar set (475:19980) — Type=Desktop 1 and Type=Mobile 1/2.
 *
 * Variants:
 *   desktop — utility strip + main bar (logo, search, notification, avatar)
 *   mobile  — single compact bar; symbol logo; optional leading hamburger
 */

const buildIcon = (name, className) => {
  const span = document.createElement('span');
  if (className) span.className = className;
  span.innerHTML = iconMarkup(name);
  return span;
};

const buildActions = (initials) => {
  const actions = document.createElement('div');
  actions.className = 'sr-header__actions';

  const notif = document.createElement('button');
  notif.type = 'button';
  notif.className = 'sr-header__notification';
  notif.setAttribute('aria-label', 'Notifications');
  notif.innerHTML = iconMarkup('comms/notification');
  actions.appendChild(notif);

  const avatar = document.createElement('div');
  avatar.className = 'sr-header__avatar';
  const avatarInitials = document.createElement('span');
  avatarInitials.className = 'sr-header__avatar-initials';
  avatarInitials.textContent = initials;
  avatar.appendChild(avatarInitials);
  const status = document.createElement('span');
  status.className = 'sr-header__avatar-status';
  avatar.appendChild(status);
  actions.appendChild(avatar);

  return actions;
};

const buildLogo = (src, alt) => {
  const logo = document.createElement('span');
  logo.className = 'sr-header__logo';
  const img = document.createElement('img');
  img.src = src;
  img.alt = alt;
  logo.appendChild(img);
  return logo;
};

const render = ({ variant, initials, search, menu }) => {
  const header = document.createElement('header');
  const isMobile = variant === 'mobile';
  header.className = `sr-header${isMobile ? ' sr-header--mobile' : ''}${
    isMobile && menu ? ' sr-header--centered' : ''
  }`;

  if (!isMobile) {
    const utility = document.createElement('div');
    utility.className = 'sr-header__utility';
    ['Report an issue', 'Cymraeg'].forEach((text) => {
      const link = document.createElement('a');
      link.className = 'sr-header__utility-link';
      link.href = '#';
      link.textContent = text;
      utility.appendChild(link);
    });
    header.appendChild(utility);
  }

  const main = document.createElement('div');
  main.className = 'sr-header__main';

  if (isMobile && menu) {
    const menuBtn = document.createElement('button');
    menuBtn.type = 'button';
    menuBtn.className = 'sr-header__menu';
    menuBtn.setAttribute('aria-label', 'Open menu');
    menuBtn.appendChild(buildIcon('nav/menu'));
    main.appendChild(menuBtn);
  }

  main.appendChild(
    buildLogo(isMobile ? logoSymbolSrc : logoFullSrc, 'DHCW Single Record')
  );

  if (!isMobile) {
    const searchEl = document.createElement('div');
    searchEl.className = 'sr-header__search';
    searchEl.appendChild(buildIcon('nav/search', 'sr-header__search-icon'));
    const input = document.createElement('input');
    input.className = 'sr-header__search-input';
    input.type = 'search';
    input.placeholder = search;
    searchEl.appendChild(input);
    main.appendChild(searchEl);
  }

  main.appendChild(buildActions(initials));
  header.appendChild(main);

  if (isMobile) {
    const frame = document.createElement('div');
    frame.style.cssText = 'max-width: 390px; border: 1px solid var(--sr-color-border-default);';
    frame.appendChild(header);
    return frame;
  }
  return header;
};

export default {
  title: 'Components/Header',
  tags: ['autodocs'],
  render,
  argTypes: {
    variant: { control: 'inline-radio', options: ['desktop', 'mobile'] },
    menu: { control: 'boolean', description: 'Mobile: show leading hamburger (Mobile 1).' },
    initials: { control: 'text' },
    search: { control: 'text' },
  },
  args: {
    variant: 'desktop',
    menu: true,
    initials: 'AB',
    search: 'Type here to begin search',
  },
};

export const Desktop = { args: { variant: 'desktop' } };
export const MobileWithMenu = {
  name: 'Mobile 1 (hamburger)',
  args: { variant: 'mobile', menu: true },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};
export const MobileCompact = {
  name: 'Mobile 2 (no hamburger)',
  args: { variant: 'mobile', menu: false },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};
