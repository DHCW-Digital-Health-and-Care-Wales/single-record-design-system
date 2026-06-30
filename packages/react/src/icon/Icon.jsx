import React from 'react';
import '@dhcw/sr-icons/src/icon.css';
import { iconMarkup } from '@dhcw/sr-icons/build/icons.js';

/**
 * Icon — DHCW Single Record Design System (React)
 * Wraps the generated @dhcw/sr-icons SVG markup. Decorative by default
 * (aria-hidden); pass `label` for a standalone meaningful icon.
 */
export default function Icon({ name, size = 'md', color = 'default', label, className, ...rest }) {
  const classes = ['sr-icon', `sr-icon--${size}`, `sr-icon--${color}`, className].filter(Boolean).join(' ');
  return (
    <span
      className={classes}
      // eslint-disable-next-line react/no-danger -- trusted, build-time-generated SVG source
      dangerouslySetInnerHTML={{ __html: iconMarkup(name, { label }) }}
      {...rest}
    />
  );
}
