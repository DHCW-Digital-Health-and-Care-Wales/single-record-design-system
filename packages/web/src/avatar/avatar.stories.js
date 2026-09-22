import './avatar.css';
import '@dhcw/sr-tokens/build/css/tokens.css';

/**
 * Avatar — DHCW Single Record Design System
 *
 * A person, as a circle. An avatar identifies a COLLEAGUE; it never identifies
 * a patient — that is the patient banner's job, with the NHS number.
 *
 * The initials sit on interactive/primary with text/on-fill (8.04:1). Figma
 * drew them on Cyan/700 with text/inverse (2.95:1) until 2026-09-22; see
 * components/avatar/spec.md.
 */

const SIZES = { sm: '', md: 'sr-avatar--md', lg: 'sr-avatar--lg' };

const avatar = ({ initials = 'AB', name = 'Dr Anwen Bowen', size = 'sm', status = null, icon = false, decorative = false } = {}) => {
  const el = document.createElement('span');
  el.className = ['sr-avatar', SIZES[size], icon ? 'sr-avatar--icon' : ''].filter(Boolean).join(' ');
  if (decorative) {
    el.setAttribute('aria-hidden', 'true');
  } else {
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', [name, status ? 'active' : null].filter(Boolean).join(', '));
  }
  if (icon) {
    const i = document.createElement('span');
    i.className = 'sr-avatar__icon';
    i.textContent = '•';
    el.appendChild(i);
  } else {
    const t = document.createElement('span');
    t.className = 'sr-avatar__initials';
    t.textContent = initials;
    el.appendChild(t);
  }
  if (status) {
    const dot = document.createElement('span');
    dot.className = 'sr-avatar__status';
    el.appendChild(dot);
  }
  return el;
};

const row = (nodes) => {
  const wrap = document.createElement('div');
  wrap.style.display = 'flex';
  wrap.style.alignItems = 'center';
  wrap.style.gap = '16px';
  nodes.forEach((n) => wrap.appendChild(n));
  return wrap;
};

export default { title: 'Components/Avatar' };

export const Sizes = () =>
  row([avatar({ size: 'sm' }), avatar({ size: 'md' }), avatar({ size: 'lg' })]);

export const WithStatus = () =>
  row([avatar({ size: 'sm', status: 'active' }), avatar({ size: 'md', status: 'active' }), avatar({ size: 'lg', status: 'active' })]);

export const GenericMark = () =>
  row([avatar({ icon: true, size: 'sm', name: 'Unknown user' }), avatar({ icon: true, size: 'md', name: 'Unknown user' })]);

/** Beside a visible name the avatar is decorative, so the name is not read twice. */
export const BesideAName = () => {
  const wrap = document.createElement('div');
  wrap.style.display = 'flex';
  wrap.style.alignItems = 'center';
  wrap.style.gap = '8px';
  wrap.appendChild(avatar({ decorative: true }));
  const label = document.createElement('span');
  label.textContent = 'Dr Anwen Bowen';
  wrap.appendChild(label);
  return wrap;
};

export const Group = () => {
  const g = document.createElement('span');
  g.className = 'sr-avatar-group';
  ['AB', 'CD', 'EF'].forEach((i) => g.appendChild(avatar({ initials: i, decorative: true })));
  const more = document.createElement('span');
  more.className = 'sr-avatar-group__overflow';
  more.textContent = '+4';
  g.appendChild(more);
  return g;
};
