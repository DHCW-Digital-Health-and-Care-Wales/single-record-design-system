import React from 'react';
import '@dhcw/sr-web/src/progress-indicators/progress-indicators.css';
import StatusIndicator from '../status-indicator/StatusIndicator.jsx';

/**
 * Stepper — DHCW Single Record Design System
 * Figma: Progress/Stepper (1746:92), Progress/Vertical Step (1747:76) and
 * Progress/Tab (1746:106) on page 1736:12775.
 *
 * Where the user is in a fixed sequence of stages. An ordered list, with
 * aria-current="step" on the current stage.
 *
 * Props
 *   steps   [{ label, state, hint, description, href }]
 *           state:  'done' | 'current' | 'error' | 'upcoming'
 *           hint:   error only — the reason, shown under the label ("2 fields
 *                   missing"). Required on an error step: it is what makes
 *                   the state readable without colour.
 *           description: vertical only — the line under the title.
 *           href:   makes the label a link, for going back to a stage.
 *   layout  'horizontal' | 'vertical' | 'compact'. Default horizontal.
 *           compact is the tab-weight strip (Figma "Progress/Tab"). It looks
 *           like Tabs and is not Tabs — see DDR-036.
 *   ariaLabel  names the list ("Referral progress").
 *
 * The marker is decorative. Each step's state is spoken as visually hidden
 * text after its label, because "a green tick" is not something a screen
 * reader can say.
 *
 * Everything else spreads onto the <ol>.
 */

const SPOKEN = {
  done: 'completed',
  error: 'has errors',
  upcoming: 'not started',
};

// Status indicator sizes, matched to the marker each layout draws.
const INDICATOR_SIZE = { horizontal: 'lg', vertical: 'lg', compact: 'sm' };

function Marker({ state, number, layout }) {
  if (state === 'done' || state === 'error') {
    return (
      <span className="sr-stepper__marker" aria-hidden="true">
        <StatusIndicator status={state === 'done' ? 'success' : 'error'} size={INDICATOR_SIZE[layout]} />
      </span>
    );
  }
  // The compact marker is a 16px ring with no room for a number.
  return <span className="sr-stepper__marker" aria-hidden="true">{layout === 'compact' ? null : number}</span>;
}

export default function Stepper({
  steps = [],
  layout = 'horizontal',
  ariaLabel = 'Progress',
  className,
  ...rest
}) {
  const classes = [
    'sr-stepper',
    layout === 'vertical' && 'sr-stepper--vertical',
    layout === 'compact' && 'sr-stepper--compact',
    className,
  ].filter(Boolean).join(' ');

  return (
    <ol className={classes} aria-label={ariaLabel} {...rest}>
      {steps.map((step, i) => {
        const state = step.state ?? 'upcoming';
        const spoken = SPOKEN[state];
        const text = (
          <>
            {step.label}
            {spoken && <span className="sr-visually-hidden">{`, ${spoken}`}</span>}
          </>
        );
        const label = step.href
          ? <a className="sr-stepper__link" href={step.href}>{text}</a>
          : text;
        const hint = state === 'error' && step.hint
          ? <span className="sr-stepper__hint">{step.hint}</span>
          : null;
        const marker = <Marker state={state} number={i + 1} layout={layout} />;

        return (
          <li
            key={step.id ?? i}
            className={`sr-stepper__step sr-stepper__step--${state}`}
            aria-current={state === 'current' ? 'step' : undefined}
          >
            {layout === 'vertical' ? (
              <>
                <span className="sr-stepper__marker-column">{marker}</span>
                <span className="sr-stepper__body">
                  <span className="sr-stepper__label">{label}</span>
                  {step.description && <span className="sr-stepper__description">{step.description}</span>}
                  {hint}
                </span>
              </>
            ) : (
              <>
                {marker}
                <span className="sr-stepper__label">
                  {label}
                  {hint}
                </span>
              </>
            )}
          </li>
        );
      })}
    </ol>
  );
}
