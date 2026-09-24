import React from 'react';

/**
 * Avatar — DHCW Single Record Design System
 *
 * A person, as a circle. Matched to the Figma `Avatar` set (414:834) and to
 * `packages/web/src/avatar/avatar.css`.
 *
 * An avatar identifies a PERSON — a clinician, a user, an author. It is not a
 * patient identifier: a patient is identified by the patient banner, with the
 * NHS number and the details that make identification safe. A face in a circle
 * is not safe identification.
 *
 * Contrast note: the initials sit on `interactive/primary` with
 * `text/on-fill` (8.04:1). Do not restyle them onto `text/inverse` — that
 * token flips to near-black in dark mode, and the fill does not.
 *
 * Props
 *   name      string  — the person's full name. Used for the accessible name,
 *                       and to derive initials when none are given.
 *   initials  string  — override the derived initials. Two characters.
 *   src       string  — a photo. Falls back to initials if it fails to load.
 *   alt       string  — alt text for the photo. Defaults to `name`.
 *   icon      node    — a generic mark, used when there is no name and no photo.
 *   size      'sm'|'md'|'lg'  — 32 / 40 / 48px. Default 'sm'.
 *   status    'active'|null   — presence. See the guidelines before using it:
 *                       presence must never be the only carrier of meaning.
 *   statusLabel string — what the dot means, for screen readers.
 *                        Default 'Active'.
 *   decorative boolean — true when a visible name sits beside the avatar, so
 *                        the avatar repeats information already on screen and
 *                        should be hidden from assistive tech.
 *
 * Everything else spreads onto the element.
 */

/** First letters of the first and last words — "Anwen Bowen" → "AB". */
export function initialsFrom(name) {
  if (!name) return '';
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  const first = parts[0][0] || '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] || '' : '';
  return (first + last).toUpperCase();
}

export function Avatar({
  name,
  initials,
  src,
  alt,
  icon,
  size = 'sm',
  status = null,
  statusLabel = 'Active',
  decorative = false,
  className = '',
  ...rest
}) {
  const [imageFailed, setImageFailed] = React.useState(false);
  const showImage = Boolean(src) && !imageFailed;
  const text = initials || initialsFrom(name);
  const showIcon = !showImage && !text;

  const classes = [
    'sr-avatar',
    size !== 'sm' ? `sr-avatar--${size}` : '',
    showIcon ? 'sr-avatar--icon' : '',
    className,
  ].filter(Boolean).join(' ');

  // A decorative avatar sits next to a visible name, so announcing it repeats
  // what the reader already has. Otherwise it must name the person itself.
  const a11y = decorative
    ? { 'aria-hidden': 'true' }
    : { role: 'img', 'aria-label': [name, status ? statusLabel : null].filter(Boolean).join(', ') };

  return (
    <span className={classes} {...a11y} {...rest}>
      {showImage && (
        <img
          className="sr-avatar__image"
          src={src}
          alt={decorative ? '' : alt || name || ''}
          onError={() => setImageFailed(true)}
        />
      )}
      {!showImage && text && <span className="sr-avatar__initials">{text}</span>}
      {showIcon && <span className="sr-avatar__icon">{icon}</span>}
      {status && <span className="sr-avatar__status" />}
    </span>
  );
}

/**
 * AvatarGroup — overlapping avatars for "these people".
 *
 * `max` caps how many are drawn; the rest are summarised as "+n". The count is
 * real text, not a decorative badge, because "and four others" is information.
 */
export function AvatarGroup({ children, max = 4, className = '', ...rest }) {
  const items = React.Children.toArray(children);
  const shown = items.slice(0, max);
  const overflow = items.length - shown.length;
  return (
    <span className={['sr-avatar-group', className].filter(Boolean).join(' ')} {...rest}>
      {shown}
      {overflow > 0 && <span className="sr-avatar-group__overflow">{`+${overflow}`}</span>}
    </span>
  );
}

export default Avatar;
