/**
 * Foundations — Colour
 * Renders the semantic Single Record colour tokens straight from the
 * generated @dhcw/sr-tokens CSS custom properties, so the swatches are
 * always in sync with the token build (no hard-coded hex here).
 */

const swatch = (varName, label) => {
  const cell = document.createElement('div');
  cell.style.cssText =
    'display:flex;flex-direction:column;gap:8px;font-family:system-ui,sans-serif;';

  const chip = document.createElement('div');
  chip.style.cssText = `height:64px;border-radius:var(--radius-md);background:var(${varName});border:1px solid var(--sr-color-surface-subtle);`;

  const name = document.createElement('code');
  name.textContent = label;
  name.style.cssText = 'font-size:12px;color:var(--sr-color-text-secondary);';

  const token = document.createElement('code');
  token.textContent = varName;
  token.style.cssText = 'font-size:11px;color:var(--sr-color-text-disabled);';

  cell.append(chip, name, token);
  return cell;
};

const grid = (entries) => {
  const g = document.createElement('div');
  g.style.cssText =
    'display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:16px;padding:8px;';
  entries.forEach(([varName, label]) => g.appendChild(swatch(varName, label)));
  return g;
};

export default {
  title: 'Foundations/Colour',
  tags: ['autodocs'],
};

export const Interactive = {
  render: () =>
    grid([
      ['--sr-color-interactive-primary', 'Interactive / Primary'],
      ['--sr-color-interactive-primary-hover', 'Interactive / Primary Hover'],
      ['--sr-color-interactive-secondary', 'Interactive / Secondary'],
      ['--sr-color-interactive-link', 'Interactive / Link'],
      ['--sr-color-interactive-destructive', 'Interactive / Destructive'],
      ['--sr-color-interactive-disabled', 'Interactive / Disabled'],
    ]),
};

export const Surface = {
  render: () =>
    grid([
      ['--sr-color-surface-background', 'Surface / Background'],
      ['--sr-color-surface-small-cards', 'Surface / Small Cards'],
      ['--sr-color-surface-accent', 'Surface / Accent'],
      ['--sr-color-surface-subtle', 'Surface / Subtle'],
    ]),
};

export const Status = {
  render: () =>
    grid([
      ['--sr-color-status-info-surface', 'Status / Info Surface'],
      ['--sr-color-status-success-surface', 'Status / Success Surface'],
      ['--sr-color-status-warning-surface', 'Status / Warning Surface'],
      ['--sr-color-status-critical-surface', 'Status / Critical Surface'],
    ]),
};

export const Text = {
  render: () =>
    grid([
      ['--sr-color-text-primary', 'Text / Primary'],
      ['--sr-color-text-secondary', 'Text / Secondary'],
      ['--sr-color-text-disabled', 'Text / Disabled'],
      ['--sr-color-brand-accent', 'Brand / Accent'],
    ]),
};
