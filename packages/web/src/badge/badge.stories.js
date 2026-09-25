import './badge.css';
import '@dhcw/sr-tokens/build/css/tokens.css';

/**
 * Badge — DHCW Single Record Design System
 *
 * A count, as a pill. The same badge the navigation item and the tab render.
 * It is aria-hidden: the host puts the count in its own accessible name.
 */

const badge = ({ count = '20' } = {}) => {
  const el = document.createElement('span');
  el.className = 'sr-badge';
  el.setAttribute('aria-hidden', 'true');
  el.textContent = count;
  return el;
};

export default {
  title: 'Components/Badge',
  render: badge,
  argTypes: {
    count: { control: 'text', description: 'The count. A number or a short string.' },
  },
};

export const Default = { args: { count: '20' } };
export const SingleDigit = { args: { count: '3' } };
