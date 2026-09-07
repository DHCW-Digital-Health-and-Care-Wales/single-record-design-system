import './tabs.css';
import '@dhcw/sr-tokens/build/css/tokens.css';

/**
 * Tabs — DHCW Single Record Design System
 * Figma: Menu Tab (817:7219) on page 1753:21420.
 *
 * This is the reference implementation of the WAI-ARIA tabs pattern, including
 * the keyboard behaviour, because the keyboard behaviour is the part people
 * leave out. A tablist that only responds to clicks is not a tablist.
 */

const uid = (() => { let n = 0; return () => `sr-tabs-${++n}`; })();

const render = ({ tabs, selectedIndex = 0, orientation = 'horizontal', ariaLabel }) => {
  const root = document.createElement('div');
  const id = uid();
  const vertical = orientation === 'vertical';

  // Vertical tabs sit beside their panel; horizontal ones above it.
  const wrap = document.createElement('div');
  wrap.style.display = vertical ? 'flex' : 'block';
  wrap.style.gap = vertical ? '24px' : '0';

  const list = document.createElement('div');
  list.className = `sr-tabs${vertical ? ' sr-tabs--vertical' : ''}`;
  list.setAttribute('role', 'tablist');
  list.setAttribute('aria-label', ariaLabel || 'Patient record sections');
  if (vertical) list.setAttribute('aria-orientation', 'vertical');

  const panels = document.createElement('div');
  const buttons = [];

  tabs.forEach((tab, i) => {
    const selected = i === selectedIndex;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sr-tabs__tab';
    btn.id = `${id}-tab-${i}`;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', String(selected));
    btn.setAttribute('aria-controls', `${id}-panel-${i}`);
    // Roving tabindex: one stop for the whole tablist, then arrow keys inside.
    btn.tabIndex = selected ? 0 : -1;
    btn.dataset.label = tab.label;
    btn.textContent = tab.label;

    if (tab.disabled) {
      btn.disabled = true;
      btn.setAttribute('aria-disabled', 'true');
    }

    if (tab.count !== undefined) {
      const badge = document.createElement('span');
      badge.className = 'sr-tabs__badge';
      badge.textContent = String(tab.count);
      // The badge is decorative; the count belongs in the accessible name too,
      // or a screen reader hears "Results" and never learns there are 20.
      badge.setAttribute('aria-hidden', 'true');
      btn.append(badge);
      btn.setAttribute('aria-label', `${tab.label}, ${tab.count} items`);
    }

    const panel = document.createElement('div');
    panel.className = 'sr-tabs__panel';
    panel.id = `${id}-panel-${i}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', btn.id);
    panel.tabIndex = 0;
    panel.hidden = !selected;
    panel.textContent = tab.panel || `${tab.label} content`;

    list.append(btn);
    panels.append(panel);
    buttons.push({ btn, panel, disabled: !!tab.disabled });
  });

  const select = (i) => {
    buttons.forEach((b, j) => {
      const on = i === j;
      b.btn.setAttribute('aria-selected', String(on));
      b.btn.tabIndex = on ? 0 : -1;
      b.panel.hidden = !on;
    });
    buttons[i].btn.focus();
  };

  const step = (from, dir) => {
    const n = buttons.length;
    let i = from;
    // Skip disabled tabs, and wrap — the pattern expects Right on the last tab
    // to land on the first.
    for (let k = 0; k < n; k += 1) {
      i = (i + dir + n) % n;
      if (!buttons[i].disabled) return i;
    }
    return from;
  };

  list.addEventListener('click', (e) => {
    const i = buttons.findIndex((b) => b.btn === e.target.closest('.sr-tabs__tab'));
    if (i >= 0 && !buttons[i].disabled) select(i);
  });

  list.addEventListener('keydown', (e) => {
    const current = buttons.findIndex((b) => b.btn === document.activeElement);
    if (current < 0) return;
    const next = vertical ? 'ArrowDown' : 'ArrowRight';
    const prev = vertical ? 'ArrowUp' : 'ArrowLeft';
    let target = null;
    if (e.key === next) target = step(current, 1);
    else if (e.key === prev) target = step(current, -1);
    else if (e.key === 'Home') target = buttons.findIndex((b) => !b.disabled);
    else if (e.key === 'End') target = buttons.map((b) => !b.disabled).lastIndexOf(true);
    if (target === null || target < 0) return;
    e.preventDefault();
    select(target);
  });

  wrap.append(list, panels);
  root.append(wrap);
  return root;
};

export default {
  title: 'Components/Tabs',
  tags: ['autodocs'],
  render,
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    selectedIndex: { control: { type: 'number', min: 0 } },
  },
  args: {
    orientation: 'horizontal',
    selectedIndex: 0,
    tabs: [
      { label: 'Summary', panel: 'Patient summary content.' },
      { label: 'Results', panel: 'Results content.' },
      { label: 'Medication', panel: 'Medication content.' },
      { label: 'Documents', panel: 'Documents content.' },
    ],
  },
};

export const Horizontal = {};

export const Vertical = { args: { orientation: 'vertical' } };

export const WithCounts = {
  args: {
    tabs: [
      { label: 'Summary', panel: 'Patient summary content.' },
      { label: 'Results', count: 20, panel: 'Twenty results.' },
      { label: 'Tasks', count: 3, panel: 'Three tasks.' },
      { label: 'Documents', panel: 'Documents content.' },
    ],
  },
};

/** A disabled tab is skipped by the arrow keys rather than trapping focus. */
export const WithDisabled = {
  args: {
    tabs: [
      { label: 'Summary', panel: 'Patient summary content.' },
      { label: 'Results', panel: 'Results content.' },
      { label: 'Imaging', disabled: true, panel: 'No imaging on file.' },
      { label: 'Documents', panel: 'Documents content.' },
    ],
  },
};

/**
 * Selecting changes the label to Medium weight. Every tab reserves that width
 * up front, so the strip does not shift as you move along it — click through
 * these and watch that nothing moves.
 */
export const NoLayoutShift = {
  args: {
    tabs: [
      { label: 'Correspondence', panel: 'Correspondence.' },
      { label: 'Investigations', panel: 'Investigations.' },
      { label: 'Observations', panel: 'Observations.' },
    ],
  },
};
