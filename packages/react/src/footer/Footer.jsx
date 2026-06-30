import React from 'react';
import '@dhcw/sr-web/src/footer/footer.css';
import Button from '../button/Button.jsx';

/**
 * Footer — DHCW Single Record Design System
 * Figma: Footer Nav (665:16525), Type=Desktop
 */
export default function Footer({ version, onSave, onComplete, className, ...rest }) {
  const classes = ['sr-footer', className].filter(Boolean).join(' ');

  return (
    <footer className={classes} {...rest}>
      <span className="sr-footer__version">{version}</span>
      <div className="sr-footer__actions">
        <Button type="secondary" size="small" onClick={onSave}>
          Save changes
        </Button>
        <Button type="primary" size="small" onClick={onComplete}>
          Mark as complete
        </Button>
      </div>
    </footer>
  );
}
