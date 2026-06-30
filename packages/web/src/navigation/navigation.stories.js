import './navigation.css';
import '@dhcw/sr-tokens/build/css/tokens.css';
import { iconMarkup } from '@dhcw/sr-icons/build/icons.js';

/**
 * Navigation / Sidebar — DHCW Single Record Design System
 * Figma: Navigation/Sidebar/Desktop (725:8903), Type=Sectioned, State=Expanded
 *
 * Icon mapping note: the source Figma instance references a handful of
 * Lucide icons not yet in @dhcw/sr-icons (e.g. "dashboard"). Where no
 * direct equivalent exists, the closest semantic icon from the existing
 * 106-icon set is used instead (e.g. data/table for the dashboard grid).
 */

const LOGO_SRC =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="129" height="40" viewBox="0 0 129 40"><rect width="129" height="40" rx="4" fill="%23325083"/><text x="10" y="25" font-family="Roboto, sans-serif" font-size="13" fill="white">DHCW Single Record</text></svg>'
  );

const SECTIONS = [
  {
    label: 'Home',
    items: [{ icon: 'data/table', label: 'Dashboard' }],
  },
  {
    label: 'Patients',
    items: [
      { icon: 'nav/search', label: 'Patient Search' },
      { icon: 'nav/sort', label: 'Referrals', badge: '20', submenu: true },
      { icon: 'schedule/appointment', label: 'Appointments', badge: '20', submenu: true },
      { icon: 'schedule/waiting-list', label: 'Watchlists', submenu: true },
    ],
  },
  {
    label: 'Clinical',
    items: [
      { icon: 'people/specialist', label: 'Specialists', submenu: true },
      { icon: 'clinical/lab-result', label: 'Tests', submenu: true },
    ],
  },
  {
    label: 'Nursing',
    items: [
      { icon: 'people/patient', label: 'Adults', submenu: true },
      { icon: 'people/contact', label: 'Paediatrics', submenu: true },
    ],
  },
  {
    label: 'Urgent & Emergency',
    items: [
      { icon: 'location/bed', label: 'Nursing', submenu: true },
      { icon: 'clinical/cross', label: 'Urgent & Emergency', submenu: true },
    ],
  },
];

const FOOTER_ITEMS = [
  { icon: 'nav/settings', label: 'Settings' },
  { icon: 'clinical/discharge', label: 'Log Out' },
];

const buildIcon = (name, className) => {
  const span = document.createElement('span');
  span.className = className;
  span.innerHTML = iconMarkup(name);
  return span;
};

const buildItem = ({ icon, label, badge, submenu }, { current }) => {
  const item = document.createElement('button');
  item.type = 'button';
  item.className = 'sr-nav__item';
  if (current === label) item.setAttribute('aria-current', 'page');

  const main = document.createElement('span');
  main.className = 'sr-nav__item-main';
  main.appendChild(buildIcon(icon, 'sr-nav__item-icon'));
  const labelEl = document.createElement('span');
  labelEl.className = 'sr-nav__item-label';
  labelEl.textContent = label;
  main.appendChild(labelEl);
  if (badge) {
    const badgeEl = document.createElement('span');
    badgeEl.className = 'sr-nav__item-badge';
    badgeEl.textContent = badge;
    main.appendChild(badgeEl);
  }
  item.appendChild(main);

  if (submenu) {
    item.appendChild(buildIcon('nav/chevron-down', 'sr-nav__item-chevron'));
  }
  return item;
};

const buildSection = (section, opts) => {
  const wrap = document.createElement('div');
  wrap.className = 'sr-nav__section';

  const label = document.createElement('span');
  label.className = 'sr-nav__section-label';
  label.textContent = section.label;
  wrap.appendChild(label);

  const list = document.createElement('div');
  list.className = 'sr-nav__list';
  section.items.forEach((item) => list.appendChild(buildItem(item, opts)));
  wrap.appendChild(list);

  return wrap;
};

/** Build a Navigation sidebar element from args. */
const render = ({ collapsed, current }) => {
  const nav = document.createElement('nav');
  nav.className = `sr-nav${collapsed ? ' sr-nav--collapsed' : ''}`;
  nav.setAttribute('aria-label', 'Primary');

  const header = document.createElement('div');
  header.className = 'sr-nav__header';
  const logo = document.createElement('span');
  logo.className = 'sr-nav__logo';
  const img = document.createElement('img');
  img.src = LOGO_SRC;
  img.alt = 'DHCW Single Record';
  logo.appendChild(img);
  header.appendChild(logo);
  const collapseBtn = document.createElement('button');
  collapseBtn.type = 'button';
  collapseBtn.className = 'sr-nav__collapse';
  collapseBtn.setAttribute('aria-label', collapsed ? 'Expand navigation' : 'Collapse navigation');
  collapseBtn.appendChild(buildIcon('nav/chevron-left', 'sr-nav__item-icon'));
  header.appendChild(collapseBtn);
  nav.appendChild(header);

  const body = document.createElement('div');
  body.className = 'sr-nav__body';
  SECTIONS.forEach((section) => body.appendChild(buildSection(section, { current })));
  nav.appendChild(body);

  const footer = document.createElement('div');
  footer.className = 'sr-nav__footer';
  FOOTER_ITEMS.forEach((item) => footer.appendChild(buildItem(item, { current })));
  nav.appendChild(footer);

  const frame = document.createElement('div');
  frame.style.cssText = 'height: 832px; display: flex;';
  frame.appendChild(nav);
  return frame;
};

export default {
  title: 'Components/Navigation',
  tags: ['autodocs'],
  render,
  argTypes: {
    collapsed: { control: 'boolean' },
    current: { control: 'text', description: 'Label of the currently active nav item.' },
  },
  args: {
    collapsed: false,
    current: 'Patient Search',
  },
};

export const Expanded = {};
export const Collapsed = { args: { collapsed: true } };
