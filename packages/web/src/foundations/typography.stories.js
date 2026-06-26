/**
 * Foundations — Typography
 * Renders the responsive typography utility classes (.sr-type-*) straight from
 * the generated @dhcw/sr-tokens `typography.css`, so the specimens stay in sync
 * with the token build (no hard-coded sizes here).
 *
 * The scale is mobile-first: the base rule is the mobile scale and the desktop
 * scale applies at >= 1024px. Use the Viewport toolbar (SR Mobile / Tablet /
 * Desktop) to watch the headings resize between form factors. See DDR-011.
 */

const SPECIMENS = [
  ['sr-type-heading-xl', 'Heading XL', 'mobile 28/36 · desktop 36/44'],
  ['sr-type-heading-l', 'Heading L', 'mobile 24/32 · desktop 28/36'],
  ['sr-type-heading-m', 'Heading M', 'mobile 20/28 · desktop 24/32'],
  ['sr-type-heading-s', 'Heading S', 'mobile 18/24 · desktop 20/28'],
  ['sr-type-heading-xs', 'Heading XS', '16/24 (no change)'],
  ['sr-type-body-m', 'Body M — the quick brown fox jumps over the lazy dog', '16/24'],
  ['sr-type-body-s', 'Body S — the quick brown fox jumps over the lazy dog', '14/20'],
  ['sr-type-label', 'Label', '14/20 medium, wide tracking'],
  ['sr-type-caption', 'Caption', '12/16, caption tracking'],
];

const row = ([cls, sample, note]) => {
  const cell = document.createElement('div');
  cell.style.cssText =
    'display:flex;flex-direction:column;gap:4px;padding:12px 0;border-bottom:1px solid var(--sr-color-border-subtle);';

  const specimen = document.createElement('div');
  specimen.className = cls;
  specimen.style.color = 'var(--sr-color-text-primary)';
  specimen.textContent = sample;

  const meta = document.createElement('div');
  meta.style.cssText =
    'display:flex;gap:12px;font-family:system-ui,sans-serif;';
  const token = document.createElement('code');
  token.textContent = '.' + cls;
  token.style.cssText = 'font-size:11px;color:var(--sr-color-text-disabled);';
  const desc = document.createElement('span');
  desc.textContent = note;
  desc.style.cssText = 'font-size:11px;color:var(--sr-color-text-secondary);';
  meta.append(token, desc);

  cell.append(specimen, meta);
  return cell;
};

const scale = () => {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'max-width:720px;padding:8px;';
  SPECIMENS.forEach((s) => wrap.appendChild(row(s)));
  return wrap;
};

export default {
  title: 'Foundations/Typography',
  tags: ['autodocs'],
};

export const Scale = {
  render: scale,
};

/** Defaults to the mobile viewport to show the smaller end of the scale. */
export const MobileScale = {
  render: scale,
  globals: { viewport: { value: 'mobile' } },
};
