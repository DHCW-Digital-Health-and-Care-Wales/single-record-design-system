import React from 'react';
import '@dhcw/sr-web/src/footer/footer.css';
import Button from '../button/Button.jsx';

/**
 * Footer — DHCW Single Record Design System
 * Figma: Footer Nav (665:16525), Type=Desktop
 *
 * The bar at the bottom of every screen. It carries two things: the version,
 * which staff read out when reporting a fault, and the screen's committing
 * actions. **A screen with no committing action still gets the bar** — the
 * version has to be reachable everywhere, and a bar that appears and
 * disappears between screens reads as a layout bug rather than a rule.
 *
 * `sticky` (default) pins it to the bottom of the viewport. See the note in
 * footer.css for what the page has to do for that to work in both directions.
 *
 * Actions: the guidelines require labels to name the specific action of the
 * screen ("Mark as complete", not "Submit"), so they cannot be fixed by the
 * component — pass `actions`. Passing `onSave`/`onComplete` instead keeps the
 * original Save / Mark-as-complete pair for the common save-a-unit-of-work
 * case. Passing neither renders the bar with the version alone, which is the
 * correct result for a read-only screen, not an oversight.
 *
 * Whatever is passed must keep to the pattern the guidelines set: exactly one
 * primary action — the one that commits — and no destructive action, which
 * should not sit under the cursor all day in persistent chrome.
 */
export default function Footer({
  version,
  actions,
  onSave,
  onComplete,
  sticky = true,
  className,
  ...rest
}) {
  const classes = ['sr-footer', sticky && 'sr-footer--sticky', className]
    .filter(Boolean)
    .join(' ');

  // Only fall back to the default pair when a caller actually wired it up.
  // Treating "no actions" as "give me Save / Mark as complete" would put two
  // buttons that do nothing on every read-only screen.
  const defaultPair = onSave || onComplete;

  return (
    <footer className={classes} {...rest}>
      <span className="sr-footer__version">{version}</span>
      <div className="sr-footer__actions">
        {actions ||
          (defaultPair ? (
            <>
              <Button type="secondary" size="small" onClick={onSave}>
                Save changes
              </Button>
              <Button type="primary" size="small" onClick={onComplete}>
                Mark as complete
              </Button>
            </>
          ) : null)}
      </div>
    </footer>
  );
}
