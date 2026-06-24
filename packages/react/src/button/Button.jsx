import React, { forwardRef } from 'react';
import '@dhcw/sr-web/src/button/button.css';

const Button = forwardRef(function Button(
  {
    type = 'primary',
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
      type="button"
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
