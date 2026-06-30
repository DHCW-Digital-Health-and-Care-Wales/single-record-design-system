import './header.css';
import '@dhcw/sr-tokens/build/css/tokens.css';
import { iconMarkup } from '@dhcw/sr-icons/build/icons.js';

/**
 * Header — DHCW Single Record Design System
 * Figma: Header bar (475:19980), Type=Desktop 1
 */

const LOGO_SRC =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="155" height="48" viewBox="0 0 155 48"><rect width="155" height="48" rx="4" fill="%23325083"/><text x="10" y="29" font-family="Roboto, sans-serif" font-size="14" fill="white">DHCW Single Record</text></svg>'
  );

const buildIcon = (name, className) => {
  const span = document.createElement('span');
  span.className = className;
  span.innerHTML = iconMarkup(name);
  return span;
};

const render = ({ initials, search }) => {
  const header = document.createElement('header');
  header.className = 'sr-header';

  const utility = document.createElement('div');
  utility.className = 'sr-header__utility';
  const reportLink = document.createElement('a');
  reportLink.className = 'sr-header__utility-link';
  reportLink.href = '#';
  reportLink.textContent = 'Report an issue';
  utility.appendChild(reportLink);
  const langLink = document.createElement('a');
  langLink.className = 'sr-header__utility-link';
  langLink.href = '#';
  langLink.textContent = 'Cymraeg';
  utility.appendChild(langLink);
  header.appendChild(utility);

  const main = document.createElement('div');
  main.className = 'sr-header__main';

  const logo = document.createElement('span');
  logo.className = 'sr-header__logo';
  const img = document.createElement('img');
  img.src = LOGO_SRC;
  img.alt = 'DHCW Single Record';
  logo.appendChild(img);
  main.appendChild(logo);

  const searchEl = document.createElement('div');
  searchEl.className = 'sr-header__search';
  searchEl.appendChild(buildIcon('nav/search', 'sr-header__search-icon'));
  const input = document.createElement('input');
  input.className = 'sr-header__search-input';
  input.type = 'search';
  input.placeholder = search;
  searchEl.appendChild(input);
  main.appendChild(searchEl);

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
  main.appendChild(actions);

  header.appendChild(main);
  return header;
};

export default {
  title: 'Components/Header',
  tags: ['autodocs'],
  render,
  argTypes: {
    initials: { control: 'text' },
    search: { control: 'text' },
  },
  args: {
    initials: 'AB',
    search: 'Type here to begin search',
  },
};

export const Default = {};
