import React from 'react';
import '@dhcw/sr-web/src/progress-indicators/progress-indicators.css';
import Tag from '../tags/Tag.jsx';

/**
 * Timeline — DHCW Single Record Design System
 * Figma: Progress/Timeline (1747:149) on page 1736:12775.
 *
 * What has happened, oldest first — a referral's history, an audit trail. It
 * is read-only and anchored to times. A sequence the user is working through
 * is a Stepper, not a Timeline.
 *
 * Props
 *   items  [{ time, datetime, title, description, state, tag }]
 *          time:     the visible time ("08-Apr-2024 15:30", "Now"). Line
 *                    breaks in the string are kept.
 *          datetime: ISO value for <time datetime>. Give it even when the
 *                    visible time is "Now".
 *          state:    'complete' | 'current' | 'alert' | 'pending'
 *          tag:      optional status word under the description
 *                    ("Complete", "In progress"). Rendered as a small Tag in
 *                    the state's colour.
 *   ariaLabel  names the list ("Referral history").
 *
 * An alert item's title is red, and it is also prefixed "Alert:" for screen
 * readers — the dot and the colour are never the only signal.
 *
 * Everything else spreads onto the <ol>.
 */

const TAG_TYPE = { complete: 'green', current: 'blue', alert: 'red', pending: 'grey' };

export default function Timeline({ items = [], ariaLabel = 'Timeline', className, ...rest }) {
  const classes = ['sr-timeline', className].filter(Boolean).join(' ');
  return (
    <ol className={classes} aria-label={ariaLabel} {...rest}>
      {items.map((item, i) => {
        const state = item.state ?? 'complete';
        return (
          <li key={item.id ?? i} className={`sr-timeline__item sr-timeline__item--${state}`}>
            {item.datetime
              ? <time className="sr-timeline__time" dateTime={item.datetime}>{item.time}</time>
              : <span className="sr-timeline__time">{item.time}</span>}
            <span className="sr-timeline__dot" aria-hidden="true" />
            <div className="sr-timeline__body">
              <p className="sr-timeline__title">
                {state === 'alert' && <span className="sr-visually-hidden">Alert: </span>}
                {item.title}
              </p>
              {item.description && <p className="sr-timeline__description">{item.description}</p>}
              {item.tag && <Tag type={TAG_TYPE[state]} size="small">{item.tag}</Tag>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
