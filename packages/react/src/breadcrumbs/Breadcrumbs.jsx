import React from 'react';
import '@dhcw/sr-web/src/breadcrumbs/breadcrumbs.css';
import Icon from '../icon/Icon.jsx';

/**
 * Breadcrumbs — DHCW Single Record Design System
 * Figma: Breadcrumbs (1307:19303), Type=Multilevel|Back, Levels=One..Four
 *
 * `type="multilevel"` renders the full trail. `type="back"` renders a single
 * chevron-left link to the item before the current page — for narrow screens
 * and deep hierarchies where the trail would wrap. Both take the same `items`
 * array, so a product can switch type by breakpoint without restructuring its
 * data.
 */

export default function Breadcrumbs({ items = [], type = 'multilevel', className, ...rest }) {
  const classes = ['sr-breadcrumbs', type === 'back' && 'sr-breadcrumbs--back', className]
    .filter(Boolean).join(' ');

  if (type === 'back') {
    // The parent, not the current page: "Back to <where this returns you>".
    // With a single item there is no parent, so nothing renders rather than a
    // link pointing at the page the user is already on.
    const parent = items[items.length - 2];
    if (!parent) return null;
    return (
      <nav aria-label="Breadcrumb" {...rest}>
        <ol className={classes}>
          <li className="sr-breadcrumbs__item">
            <Icon name="nav/chevron-left" size="sm" className="sr-breadcrumbs__back-icon" />
            <a className="sr-breadcrumbs__link" href={parent.href || '#'}>
              {`Back to ${parent.label}`}
            </a>
          </li>
        </ol>
      </nav>
    );
  }

  return (
    <nav aria-label="Breadcrumb" {...rest}>
      <ol className={classes}>
        {items.map((crumb, index) => {
          const isLast = index === items.length - 1;
          return (
            <li className="sr-breadcrumbs__item" key={`${crumb.label}-${index}`}>
              {isLast ? (
                <span className="sr-breadcrumbs__current" aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <>
                  <a className="sr-breadcrumbs__link" href={crumb.href || '#'}>
                    {crumb.label}
                  </a>
                  <span className="sr-breadcrumbs__separator" aria-hidden="true">
                    /
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
