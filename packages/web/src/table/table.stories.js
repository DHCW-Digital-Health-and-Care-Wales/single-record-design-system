import './table.css';
import '@dhcw/sr-tokens/build/css/tokens.css';
import { iconMarkup } from '@dhcw/sr-icons/build/icons.js';

/**
 * Data table — DHCW Single Record Design System
 * Figma: Table set (1363:22598)
 *
 * Tabular clinical/administrative data. Info Blue/50 header row, compact cell
 * density, Border/Subtle dividers.
 *
 * The `layout` toggle switches how per-row actions / headers are presented:
 *   plain        — column headers only, no row actions.
 *   kebab-left   — leading column of kebab (nav/menu2) row-menu buttons.
 *   icons-left   — leading column of direct row-action icon buttons.
 *   row-headers  — column headers on top AND a row-header cell down the left.
 *
 * Row action / menu icons render in Interactive/Primary (brand blue), NOT the
 * default black icon colour, because a row action is an interactive
 * affordance. Destructive actions (delete/remove) opt into red.
 */

const COLUMNS = ['NHS number', 'Date of birth', 'Ward'];
const ROWS = [
  { head: 'Jones, Alis', cells: ['943 476 5919', '12 Mar 1958', 'Aneurin'] },
  { head: 'Owen, Rhys', cells: ['620 154 3357', '04 Aug 1972', 'Glyndŵr'] },
  { head: 'Davies, Megan', cells: ['401 023 2137', '29 Nov 1990', 'Tawe'] },
];

/** One icon-only action/menu button. `variant` = 'default' (blue) | 'destructive' (red). */
const actionButton = (iconName, label, variant = 'default') => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className =
    variant === 'destructive'
      ? 'sr-table__action sr-table__action--destructive'
      : 'sr-table__action';
  btn.setAttribute('aria-label', label);
  const icon = document.createElement('span');
  icon.className = 'sr-button__icon';
  icon.innerHTML = iconMarkup(iconName);
  btn.appendChild(icon);
  return btn;
};

/** The leading action cell for a row, per layout. */
const leadingActionCell = (layout, subject) => {
  const td = document.createElement('td');
  td.className = 'sr-table__actions';
  if (layout === 'kebab-left') {
    td.appendChild(actionButton('nav/menu2', `Actions for ${subject}`));
  } else if (layout === 'icons-left') {
    td.appendChild(actionButton('action/eye', `View ${subject}`));
    td.appendChild(actionButton('action/edit', `Edit ${subject}`));
  }
  return td;
};

const buildTable = ({ layout, selectedIndex } = {}) => {
  const hasLeadingActions = layout === 'kebab-left' || layout === 'icons-left';
  const hasRowHeaders = layout === 'row-headers';

  const wrap = document.createElement('div');
  wrap.className = 'sr-table-wrap';
  const table = document.createElement('table');
  table.className = `sr-table sr-table--${layout}`;

  // Head
  const thead = document.createElement('thead');
  thead.className = 'sr-table__head';
  const headRow = document.createElement('tr');
  if (hasLeadingActions) {
    const th = document.createElement('th');
    th.className = 'sr-table__head--actions';
    th.innerHTML = '<span class="sr-visually-hidden">Actions</span>';
    headRow.appendChild(th);
  }
  ['Patient', ...COLUMNS].forEach((col) => {
    const th = document.createElement('th');
    th.scope = 'col';
    th.textContent = col;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  // Body
  const tbody = document.createElement('tbody');
  ROWS.forEach((row, rowIndex) => {
    const tr = document.createElement('tr');
    tr.className =
      rowIndex === selectedIndex ? 'sr-table__row sr-table__row--selected' : 'sr-table__row';

    if (hasLeadingActions) tr.appendChild(leadingActionCell(layout, row.head));

    // First column: a row-header <th> in the row-headers layout, else a cell.
    if (hasRowHeaders) {
      const th = document.createElement('th');
      th.scope = 'row';
      th.className = 'sr-table__rowhead';
      th.textContent = row.head;
      tr.appendChild(th);
    } else {
      const td = document.createElement('td');
      td.className = 'sr-table__cell';
      td.textContent = row.head;
      tr.appendChild(td);
    }

    row.cells.forEach((value) => {
      const td = document.createElement('td');
      td.className = 'sr-table__cell';
      td.textContent = value;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  wrap.appendChild(table);
  return wrap;
};

export default {
  title: 'Components/Table',
  tags: ['autodocs'],
  render: (args) => buildTable(args),
  argTypes: {
    layout: {
      control: { type: 'inline-radio' },
      options: ['plain', 'kebab-left', 'icons-left', 'row-headers'],
      description:
        'Row action / header presentation. kebab-left & icons-left add a leading action column; row-headers adds a left row-header column.',
    },
    selectedIndex: {
      control: { type: 'number' },
      description: 'Index of the selected (highlighted) row. Leave blank for none.',
    },
  },
  args: { layout: 'kebab-left', selectedIndex: undefined },
};

/** Kebab (nav/menu2) row-menu button in a leading column — matches the Figma default. */
export const KebabLeft = { args: { layout: 'kebab-left' } };

/** Direct row-action icons (view / edit) in a leading column. */
export const IconsLeft = { args: { layout: 'icons-left' } };

/** Column headers on top AND a row-header cell down the left edge. */
export const RowAndColumnHeaders = { args: { layout: 'row-headers' } };

/** Plain table — column headers only, no row actions. */
export const Plain = { args: { layout: 'plain' } };

/** A selected row, highlighted with Surface/Accent. */
export const SelectedRow = { args: { layout: 'kebab-left', selectedIndex: 1 } };
