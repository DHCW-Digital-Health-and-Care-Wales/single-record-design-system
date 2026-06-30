import './breadcrumbs.css';
import '@dhcw/sr-tokens/build/css/tokens.css';

/**
 * Breadcrumbs — DHCW Single Record Design System
 * Figma: Breadcrumbs (1307:19303), Device=Desktop, Levels=One..Four
 */

/** Build a breadcrumbs nav element from a list of { label, href }. The last
 * item renders as the current page (no link, aria-current="page"). */
const render = ({ items }) => {
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');

  const list = document.createElement('ol');
  list.className = 'sr-breadcrumbs';

  items.forEach((crumb, index) => {
    const isLast = index === items.length - 1;
    const li = document.createElement('li');
    li.className = 'sr-breadcrumbs__item';

    if (isLast) {
      const span = document.createElement('span');
      span.className = 'sr-breadcrumbs__current';
      span.textContent = crumb.label;
      span.setAttribute('aria-current', 'page');
      li.appendChild(span);
    } else {
      const link = document.createElement('a');
      link.className = 'sr-breadcrumbs__link';
      link.href = crumb.href || '#';
      link.textContent = crumb.label;
      li.appendChild(link);

      const sep = document.createElement('span');
      sep.className = 'sr-breadcrumbs__separator';
      sep.setAttribute('aria-hidden', 'true');
      sep.textContent = '/';
      li.appendChild(sep);
    }
    list.appendChild(li);
  });

  nav.appendChild(list);
  return nav;
};

export default {
  title: 'Components/Breadcrumbs',
  tags: ['autodocs'],
  render,
  argTypes: {
    items: { control: 'object' },
  },
  args: {
    items: [
      { label: 'Home', href: '#' },
      { label: 'Level two', href: '#' },
      { label: 'Level three', href: '#' },
      { label: 'Level four' },
    ],
  },
};

export const Levels4 = {};
export const Levels3 = {
  args: { items: [{ label: 'Home', href: '#' }, { label: 'Level two', href: '#' }, { label: 'Level three' }] },
};
export const Levels2 = {
  args: { items: [{ label: 'Home', href: '#' }, { label: 'Level two' }] },
};
export const Levels1 = {
  args: { items: [{ label: 'Home' }] },
};
