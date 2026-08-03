import React, { forwardRef } from 'react';
import '@dhcw/sr-web/src/button/button.css';

/**
 * `type` is the visual variant (primary / secondary / ghost / destructive),
 * which leaves no way to set the native button type — so a Button inside a
 * form could never submit it. `htmlType` carries the native attribute and
 * defaults to "button", preserving the previous behaviour.
 */
const Button = forwardRef(function Button(
  {
    type = 'primary',
    htmlType = 'button',
    size = 'default',
    disabled = false,
    leadingIcon,
    trailingIcon,
    children,
    className,
    ...rest
  },
  ref
) {
  const classes = [
    'sr-button',
    `sr-button--${type}`,
    `sr-button--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      ref={ref}
      type={htmlType}
      className={classes}
      disabled={disabled}
      {...rest}
    >
      {leadingIcon && <span className="sr-button__icon">{leadingIcon}</span>}
      <span>{children}</span>
      {trailingIcon && <span className="sr-button__icon">{trailingIcon}</span>}
    </button>
  );
});

export default Button;
