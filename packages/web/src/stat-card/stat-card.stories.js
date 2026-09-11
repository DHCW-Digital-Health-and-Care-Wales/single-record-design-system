import './stat-card.css';
import '@dhcw/sr-tokens/build/css/tokens.css';
import { iconMarkup } from '@dhcw/sr-icons/build/icons.js';

/**
 * Stat card — DHCW Single Record Design System
 *
 * One number, named. The card is not interactive: no role, no handler, no
 * hover. A dashboard made of these is a pattern; the card is the component.
 */

const card = ({
  label, value, icon, support, delta, deltaTone,
  layout = 'stacked', accent = 'primary',
} = {}) => {
  const tone = deltaTone || (typeof delta === 'string' && delta.trim().startsWith('-') ? 'down' : 'up');
  const cls = [
    'sr-stat-card',
    layout === 'value-first' && 'sr-stat-card--value-first',
    layout === 'inline' && 'sr-stat-card--inline',
    accent === 'primary' && 'sr-stat-card--accent',
    accent === 'warning' && 'sr-stat-card--accent-warning',
    accent === 'critical' && 'sr-stat-card--accent-critical',
  ].filter(Boolean).join(' ');

  const root = document.createElement('div');
  root.className = cls;

  const head = document.createElement('div');
  head.className = 'sr-stat-card__head';
  const lab = document.createElement('p');
  lab.className = 'sr-stat-card__label';
  lab.textContent = label;
  head.appendChild(lab);
  if (icon && layout !== 'inline') {
    const ic = document.createElement('span');
    ic.className = 'sr-stat-card__icon';
    ic.setAttribute('aria-hidden', 'true');
    ic.innerHTML = iconMarkup(icon);
    head.appendChild(ic);
  }
  root.appendChild(head);

  const val = document.createElement('p');
  val.className = 'sr-stat-card__value';
  val.textContent = value;
  root.appendChild(val);

  if (delta || support) {
    const sup = document.createElement('p');
    sup.className = 'sr-stat-card__support';
    if (delta) {
      const d = document.createElement('span');
      d.className = `sr-stat-card__delta sr-stat-card__delta--${tone}`;
      d.textContent = delta;
      sup.appendChild(d);
      sup.appendChild(document.createTextNode(' '));
    }
    if (support) sup.appendChild(document.createTextNode(support));
    root.appendChild(sup);
  }
  return root;
};

const row = (cards) => {
  const wrap = document.createElement('div');
  wrap.className = 'sr-stat-cards';
  cards.forEach((c) => wrap.appendChild(card(c)));
  return wrap;
};

export default {
  title: 'Components/Stat card',
  tags: ['autodocs'],
  render: (args) => {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'max-width:260px;';
    wrap.appendChild(card(args));
    return wrap;
  },
  argTypes: {
    label: { control: 'text' },
    value: { control: 'text' },
    icon: { control: 'text' },
    support: { control: 'text' },
    delta: { control: 'text' },
    layout: { control: 'radio', options: ['stacked', 'value-first', 'inline'] },
    accent: { control: 'radio', options: ['none', 'primary', 'warning', 'critical'] },
  },
  args: {
    label: 'Referrals',
    value: '240',
    icon: 'clinical/vitals',
    support: 'This month',
    delta: '',
    layout: 'stacked',
    accent: 'primary',
  },
};

export const Default = {};

export const WithTrend = { args: { delta: '-5%', support: 'on last month' } };

export const ValueFirst = { args: { layout: 'value-first', support: '' } };

export const Inline = {
  args: { layout: 'inline', value: '502', label: 'All', support: '' },
};

/** The shape every product has used so far: a row above the content it counts. */
export const Row = {
  render: () => row([
    { label: 'Patients on system', value: '24', icon: 'clinical/vitals', delta: '+10%', support: 'on last month' },
    { label: 'Total casenotes', value: '8', icon: 'nav/sort', support: 'In all sites' },
    { label: 'In transit', value: '42', icon: 'action/send', accent: 'warning', support: 'Pending receipt' },
    { label: 'Missing or escalated', value: '24', icon: 'status/warning', accent: 'critical', support: 'Requires attention' },
  ]),
};

/** The accent never carries the meaning on its own — the supporting line says it
 *  in words, so the card still reads correctly in greyscale. */
export const AccentWithoutColour = {
  render: () => {
    const wrap = row([
      { label: 'In transit', value: '42', accent: 'warning', support: 'Pending receipt' },
      { label: 'Missing or escalated', value: '24', accent: 'critical', support: 'Requires attention' },
    ]);
    wrap.style.filter = 'grayscale(1)';
    return wrap;
  },
};
