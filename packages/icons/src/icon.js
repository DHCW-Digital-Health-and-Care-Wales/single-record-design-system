import './icon.css';
import { iconMarkup, iconNames } from '../build/icons.js';

export { iconNames };

/**
 * Build an <span class="sr-icon"> element wrapping the named icon's inline
 * SVG. Framework-agnostic — used directly by @dhcw/sr-web components and
 * wrapped by @dhcw/sr-react's <Icon>.
 *
 * @param {string} name   icon name, e.g. "nav/chevron-down"
 * @param {object} [opts]
 * @param {'xs'|'sm'|'md'|'lg'} [opts.size='md']
 * @param {'default'|'subtle'|'inverse'|'interactive'|'critical'|'warning'|'success'|'info'} [opts.color='default']
 * @param {string} [opts.label] accessible name — renders the icon as meaningful (role="img"). Omit for decorative icons paired with visible text.
 */
export function icon(name, { size = 'md', color = 'default', label } = {}) {
  const span = document.createElement('span');
  span.className = `sr-icon sr-icon--${size} sr-icon--${color}`;
  span.innerHTML = iconMarkup(name, { label });
  return span;
}
