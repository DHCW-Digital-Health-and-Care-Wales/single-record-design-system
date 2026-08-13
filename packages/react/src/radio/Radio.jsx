import React, { forwardRef, useId } from 'react';
import '@dhcw/sr-web/src/radio/radio.css';

/**
 * Radio — DHCW Single Record Design System (React)
 *
 * A single radio option. Wraps the shared `@dhcw/sr-web` radio.css and renders
 * a real <input type="radio">, so native semantics, arrow-key roving focus and
 * form participation are preserved — none of that is reimplemented here.
 *
 * A radio is only meaningful inside a group: options sharing a `name` form one
 * choice. Use <RadioGroup> so the legend, hint, error and required marker
 * follow components/form-fields.md.
 *
 * `type` matches the four Figma types (915:30830):
 *
 *   simple       label only — the default, and the right choice for a form
 *   card-radio   bordered box with a description; selection is the border
 *   card         bordered box with a description; selection fills the card
 *   card-icon    as `card`, with a 24px leading icon instead of the ring
 *
 * `description` only renders on the card types — a description with nowhere to
 * go is a silent no-op on `simple`, so it throws in development instead.
 */
const CARD_CLASS = {
  simple: null,
  'card-radio': 'sr-radio--card sr-radio--card-outline',
  card: 'sr-radio--card sr-radio--card-filled',
  'card-icon': 'sr-radio--card sr-radio--card-filled sr-radio--card-icon',
};

const Radio = forwardRef(function Radio(
  {
    label,
    description,
    icon,
    type = 'simple',
    id,
    name,
    value,
    checked,
    defaultChecked,
    disabled = false,
    error = false,
    onChange,
    className,
    ...rest
  },
  ref
) {
  const reactId = useId();
  const inputId = id || `sr-radio-${reactId}`;

  if (process.env.NODE_ENV !== 'production') {
    if (!(type in CARD_CLASS)) {
      throw new Error(`Radio: unknown type "${type}". Expected one of ${Object.keys(CARD_CLASS).join(', ')}.`);
    }
    if (description && type === 'simple') {
      throw new Error('Radio: `description` needs a card type — pass type="card-radio", "card" or "card-icon".');
    }
    if (icon && type !== 'card-icon') {
      throw new Error('Radio: `icon` only renders on type="card-icon".');
    }
  }

  const classes = ['sr-radio', CARD_CLASS[type], error && 'sr-radio--error', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      <input
        ref={ref}
        className="sr-radio__input"
        type="radio"
        id={inputId}
        name={name}
        value={value}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onChange={onChange}
        {...rest}
      />
      <label className="sr-radio__label" htmlFor={inputId}>
        {type === 'simple' ? label : (
          <>
            <span className="sr-radio__title">{label}</span>
            {description ? <span className="sr-radio__description">{description}</span> : null}
          </>
        )}
      </label>
      {/* After the label, not before it: the label is styled through
          `input:checked + .sr-radio__label`, and an element between the two
          would break that adjacency. Decorative — the label carries the name. */}
      {type === 'card-icon' && icon ? (
        <span className="sr-radio__icon" aria-hidden="true">{icon}</span>
      ) : null}
    </div>
  );
});

export default Radio;
