import React from 'react';
import '@dhcw/sr-web/src/footer/footer.css';
import Button from '../button/Button.jsx';

/**
 * Footer — DHCW Single Record Design System
 * Figma: Footer Nav (665:16525), Type=Desktop
 *
 * The guidelines require action labels to name the specific action of the
 * screen ("Mark as complete", not "Submit"), so the labels cannot be fixed by
 * the component: pass `actions` to supply the screen's own buttons. The
 * Save/Mark-as-complete pair remains the default so existing callers, and the
 * common save-a-unit-of-work case, need no markup.
 *
 * Whatever is passed must keep to the pattern the guidelines set: exactly one
 * primary action — the one that commits — and no destructive action, which
 * should not sit under the cursor all day in persistent chrome.
 */
export default function Footer({ version, actions, onSave, onComplete, className, ...rest }) {
  const classes = ['sr-footer', className].filter(Boolean).join(' ');

  return (
    <footer className={classes} {...rest}>
      <span className="sr-footer__version">{version}</span>
      <div className="sr-footer__actions">
        {actions || (
          <>
            <Button type="secondary" size="small" onClick={onSave}>
              Save changes
            </Button>
            <Button type="primary" size="small" onClick={onComplete}>
              Mark as complete
            </Button>
          </>
        )}
      </div>
    </footer>
  );
}
