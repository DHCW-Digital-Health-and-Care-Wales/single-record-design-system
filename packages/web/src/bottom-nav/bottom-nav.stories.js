import './bottom-nav.css';
import '@dhcw/sr-tokens/build/css/tokens.css';
import { iconMarkup } from '@dhcw/sr-icons/build/icons.js';

/**
 * Bottom navigation (mobile) — DHCW Single Record Design System
 * Figma: Footer Nav (665:16526), Type=Mobile
 */

const ITEMS = [
  { icon: 'nav/home', label: 'Home', href: '#' },
  { icon: 'schedule/appointment', label: 'Diary', href: '#' },
  { icon: 'people/patient', label: 'Patients', href: '#' },
  { icon: 'comms/message', label: 'Messages', href: '#' },
  { icon: 'nav/more', label: 'More', href: '#' },
];

const render = ({ current }) => {
  const nav = document.createElement('nav');
  nav.className = 'sr-bottom-nav';
  nav.setAttribute('aria-label', 'Primary');
  nav.style.maxWidth = '390px';

  ITEMS.forEach(({ icon, label, href }) => {
    const item = document.createElement('a');
    item.className = 'sr-bottom-nav__item';
    item.href = href;
    if (current === label) item.setAttribute('aria-current', 'page');

    const iconEl = document.createElement('span');
    iconEl.className = 'sr-bottom-nav__icon';
    iconEl.innerHTML = iconMarkup(icon);
    item.appendChild(iconEl);

    const labelEl = document.createElement('span');
    labelEl.className = 'sr-bottom-nav__label';
    labelEl.textContent = label;
    item.appendChild(labelEl);

    nav.appendChild(item);
  });

  return nav;
};

export default {
  title: 'Components/Bottom navigation',
  tags: ['autodocs'],
  render,
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  argTypes: {
    current: { control: 'text', description: 'Label of the active tab.' },
  },
  args: {
    current: 'Home',
  },
};

export const Default = {};
