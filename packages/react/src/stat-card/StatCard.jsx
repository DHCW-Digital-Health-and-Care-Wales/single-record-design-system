import React from 'react';
import Icon from '../icon/Icon.jsx';

/**
 * StatCard — DHCW Single Record Design System
 *
 * One number, named. Matched to the Figma "Stat Card" set (431:11996) and to
 * `packages/web/src/stat-card/stat-card.css`.
 *
 * The card is deliberately not interactive — no role, no handler, no hover. If
 * the number should open something, put a Link beneath it or make the tile a
 * Button. See DDR-031 and components/stat-card/guidelines.md.
 *
 * Props
 *   label       string  — what the number counts. Required.
 *   value       string|number — the number itself. Required.
 *   icon        string  — an icon name ("clinical/vitals"). Decorative, hidden
 *                         from assistive technology. Ignored when layout="inline".
 *   support     node    — one supporting line: a period, a note, a qualifier.
 *   delta       string  — a signed change ("+10%", "-5%"). Rendered before
 *                         `support` inside the same line.
 *   deltaTone   'up' | 'down' | 'neutral' — which way the change reads.
 *                         Defaults to the sign of `delta`.
 *   layout      'stacked' | 'value-first' | 'inline'. Default 'stacked'.
 *   accent      'none' | 'primary' | 'warning' | 'critical'. Default 'none' —
 *                         the bar is emphasis, and a row where every card is
 *                         emphasised has emphasised nothing.
 */
export function StatCard({
  label,
  value,
  icon,
  support,
  delta,
  deltaTone,
  layout = 'stacked',
  accent = 'none',
  className = '',
  ...rest
}) {
  // The tone follows the sign unless it is told otherwise, so the common case
  // needs one prop rather than two, and a "+" can never render red by accident.
  const tone = deltaTone || (typeof delta === 'string' && delta.trim().startsWith('-') ? 'down' : 'up');

  const classes = [
    'sr-stat-card',
    layout === 'value-first' && 'sr-stat-card--value-first',
    layout === 'inline' && 'sr-stat-card--inline',
    accent !== 'none' && `sr-stat-card--accent-${accent}`,
    className,
  ].filter(Boolean).join(' ');

  // Source order is label, value, support in every layout — the grid moves the
  // value up for `value-first` — so a screen reader always hears what the
  // number is before it hears the number.
  return (
    <div className={classes} {...rest}>
      <p className="sr-stat-card__label">{label}</p>
      <p className="sr-stat-card__value">{value}</p>
      {(delta || support) && (
        <p className="sr-stat-card__support">
          {delta && (
            <span className={`sr-stat-card__delta sr-stat-card__delta--${tone}`}>{delta}</span>
          )}
          {delta && support ? ' ' : null}
          {support}
        </p>
      )}
      {icon && layout !== 'inline' && (
        <span className="sr-stat-card__icon" aria-hidden="true">
          <Icon name={icon} size="md" color="inherit" />
        </span>
      )}
    </div>
  );
}

/**
 * A row of stat cards. Provided so the grid is written once, not per screen.
 * `inline` switches to the wrapping strip the inline layout wants, where cards
 * size to their content instead of sharing the width equally.
 */
export function StatCards({ inline = false, children, className = '', ...rest }) {
  const classes = ['sr-stat-cards', inline && 'sr-stat-cards--inline', className]
    .filter(Boolean).join(' ');
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}

export default StatCard;
