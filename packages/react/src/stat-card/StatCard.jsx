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
 *   accent      'none' | 'primary' | 'warning' | 'critical'. Default 'primary'.
 */
export function StatCard({
  label,
  value,
  icon,
  support,
  delta,
  deltaTone,
  layout = 'stacked',
  accent = 'primary',
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
    accent === 'primary' && 'sr-stat-card--accent',
    accent === 'warning' && 'sr-stat-card--accent-warning',
    accent === 'critical' && 'sr-stat-card--accent-critical',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...rest}>
      <div className="sr-stat-card__head">
        <p className="sr-stat-card__label">{label}</p>
        {icon && layout !== 'inline' && (
          <span className="sr-stat-card__icon" aria-hidden="true">
            <Icon name={icon} size="md" color="inherit" />
          </span>
        )}
      </div>
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
    </div>
  );
}

/** A row of stat cards. Provided so the grid is written once, not per screen. */
export function StatCards({ children, className = '', ...rest }) {
  return (
    <div className={`sr-stat-cards ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}

export default StatCard;
