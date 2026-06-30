import React from 'react';
import '@dhcw/sr-web/src/breadcrumbs/breadcrumbs.css';

/**
 * Breadcrumbs — DHCW Single Record Design System
 * Figma: Breadcrumbs (1307:19303), Device=Desktop, Levels=One..Four
 */
export default function Breadcrumbs({ items = [], className, ...rest }) {
  const classes = ['sr-breadcrumbs', className].filter(Boolean).join(' ');

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
