import React from 'react';
import Icon from '../icon/Icon.jsx';

/**
 * ErrorSummary — DHCW Single Record Design System
 *
 * The box at the top of a form listing every error, each one a link that moves
 * focus INTO the field it names.
 *
 * The behaviour is the component. A hand-rolled summary always renders the
 * right box and then misses one of these, and each omission is the difference
 * between a usable form and an unusable one:
 *
 *   - it takes focus when it appears, so a screen-reader user hears the problem
 *     instead of being left at the submit button;
 *   - each item is a real link to the field's id, and clicking it moves focus
 *     into the field rather than merely scrolling to it;
 *   - the wording matches the inline message exactly — two wordings for one
 *     problem is two problems;
 *   - errors are listed in the order the fields appear, not the order
 *     validation found them.
 *
 * Props
 *   errors    array   — [{ id, message }] in FIELD order. `id` is the id of the
 *                       field itself, not of its error text.
 *   title     node    — default "There is a problem".
 *   headingLevel 2|3  — the element for the title. Default 2. Match the page's
 *                       outline; do not skip a level for visual size.
 *   onNavigate fn     — optional (error, event) hook for analytics or routing.
 *
 * Renders nothing when `errors` is empty, so a caller can mount it
 * unconditionally and let it appear on failure.
 */
export function ErrorSummary({
  errors = [],
  title = 'There is a problem',
  headingLevel = 2,
  onNavigate,
  className = '',
  ...rest
}) {
  const ref = React.useRef(null);
  // Re-focus whenever the SET of errors changes, not only on first render: a
  // second failed submit with different errors is a new problem to announce.
  const signature = errors.map((e) => `${e.id}:${e.message}`).join('|');

  React.useEffect(() => {
    if (errors.length && ref.current) ref.current.focus();
  }, [signature, errors.length]);

  if (!errors.length) return null;

  const Heading = `h${headingLevel}`;

  /**
   * Move focus into the field, not just the viewport. The href alone scrolls
   * and (in some browsers) focuses; doing it explicitly is the only way it is
   * reliable across all of them. A field that cannot take focus — a fieldset of
   * radios, say — falls back to its first focusable descendant.
   */
  const go = (error) => (event) => {
    const target = document.getElementById(error.id);
    if (target) {
      event.preventDefault();
      const focusable = typeof target.focus === 'function' && target.tabIndex >= 0
        ? target
        : target.querySelector('input, select, textarea, button, [tabindex]');
      (focusable || target).scrollIntoView({ block: 'center' });
      if (focusable) focusable.focus();
    }
    if (onNavigate) onNavigate(error, event);
  };

  return (
    <div
      ref={ref}
      className={['sr-error-summary', className].filter(Boolean).join(' ')}
      role="alert"
      tabIndex={-1}
      {...rest}
    >
      <div className="sr-error-summary__header">
        <span className="sr-error-summary__icon" aria-hidden="true">
          <Icon name="status/error-circle" size="sm" color="inherit" />
        </span>
        <Heading className="sr-error-summary__title">{title}</Heading>
      </div>
      <ul className="sr-error-summary__body">
        {errors.map((error) => (
          <li className="sr-error-summary__item" key={error.id}>
            <a className="sr-error-summary__link" href={`#${error.id}`} onClick={go(error)}>
              {error.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ErrorSummary;
