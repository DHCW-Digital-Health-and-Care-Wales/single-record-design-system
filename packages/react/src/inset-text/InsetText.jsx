import React from 'react';

/**
 * InsetText — DHCW Single Record Design System
 *
 * A block of prose held apart from the prose around it. Matched to the Figma
 * "Inset Text" component (3613:17859) as narrowed by DDR-032, and to
 * `packages/web/src/inset-text/inset-text.css`.
 *
 *   Inset text is part of the page. A banner is an event.
 *
 * There is no `severity`, no `icon`, no `heading` and no `actions` prop, and
 * that is the component rather than an omission: each one would turn this into
 * a Notification banner, which already exists. If what you are rendering
 * appeared because something happened, reach for the banner.
 *
 * Props
 *   children    node   — required. The prose. Paragraphs and lists are fine;
 *                        a heading is not.
 *   as          string — the element to render. Default 'div'. Use 'aside'
 *                        only where the content is genuinely tangential to the
 *                        surrounding text, because that is what the role says
 *                        to a screen reader.
 *
 * Everything else spreads onto the element.
 */
export function InsetText({ children, as: Element = 'div', className = '', ...rest }) {
  return (
    <Element className={['sr-inset-text', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </Element>
  );
}

export default InsetText;
