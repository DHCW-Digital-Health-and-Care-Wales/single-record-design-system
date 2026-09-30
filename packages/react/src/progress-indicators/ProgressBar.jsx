import React, { useId } from 'react';
import '@dhcw/sr-web/src/progress-indicators/progress-indicators.css';

/**
 * ProgressBar — DHCW Single Record Design System
 * Figma: Progress/Bar (1746:37) on page 1736:12775.
 *
 * How much of ONE task is done. For a sequence of stages use Stepper; for
 * what has already happened use Timeline.
 *
 * Props
 *   variant    'determinate' | 'segmented' | 'indeterminate'. Default determinate.
 *   value      determinate: 0–100.
 *   completed  segmented: sections done.
 *   total      segmented: sections in all.
 *   showCurrent segmented: draw the section after the last done one as current.
 *              Default true.
 *   caption    visible text before the bar ("Form completion"). It becomes the
 *              bar's accessible name.
 *   label      accessible name when there is no caption. One of the two is
 *              required — a progressbar with no name is announced as "progress
 *              bar, 65%", which says nothing about what is progressing.
 *
 * The number beside a determinate or segmented bar is always shown. Done and
 * current segments are 1.13:1 apart, so the text is what carries the value.
 *
 * Everything else spreads onto the wrapper.
 */
export default function ProgressBar({
  variant = 'determinate',
  value = 0,
  completed = 0,
  total = 1,
  showCurrent = true,
  caption,
  label,
  className,
  style,
  ...rest
}) {
  const captionId = useId();
  const classes = ['sr-progress', variant === 'indeterminate' && 'sr-progress--indeterminate', className].filter(Boolean).join(' ');
  const naming = caption ? { 'aria-labelledby': captionId } : { 'aria-label': label };

  if (variant === 'segmented') {
    const done = Math.max(0, Math.min(completed, total));
    return (
      <div className={classes} style={style} {...rest}>
        {caption && <span className="sr-progress__caption" id={captionId}>{caption}</span>}
        <div
          className="sr-progress__segments"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={done}
          aria-valuetext={`${done} of ${total} sections complete`}
          {...naming}
        >
          {Array.from({ length: total }, (_, i) => {
            let state = '';
            if (i < done) state = 'sr-progress__segment--done';
            else if (showCurrent && i === done) state = 'sr-progress__segment--current';
            return <span key={i} className={['sr-progress__segment', state].filter(Boolean).join(' ')} />;
          })}
        </div>
        <span className="sr-progress__value" aria-hidden="true">{`${done}/${total}`}</span>
      </div>
    );
  }

  if (variant === 'indeterminate') {
    return (
      <div className={classes} style={style} aria-busy="true" {...rest}>
        {caption && <span className="sr-progress__caption" id={captionId}>{caption}</span>}
        <div className="sr-progress__track" role="progressbar" {...naming}>
          <span className="sr-progress__fill" />
        </div>
      </div>
    );
  }

  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={classes} style={{ ...style, '--sr-progress-value': `${pct}%` }} {...rest}>
      {caption && <span className="sr-progress__caption" id={captionId}>{caption}</span>}
      <div
        className="sr-progress__track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        {...naming}
      >
        <span className="sr-progress__fill" />
      </div>
      <span className="sr-progress__value" aria-hidden="true">{`${pct}%`}</span>
    </div>
  );
}
