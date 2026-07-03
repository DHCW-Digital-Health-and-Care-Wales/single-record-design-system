import './table.css';
import '@dhcw/sr-tokens/build/css/tokens.css';
import { iconMarkup } from '@dhcw/sr-icons/build/icons.js';

/**
 * Data table — DHCW Single Record Design System
 *
 * Tabular clinical/administrative data. Square corners (data grids are
 * full-bleed), compact cell density, and a trailing actions column of
 * icon-only buttons.
 *
 * Row action icons render in Interactive/Primary (brand blue) — NOT the
 * default black icon colour — because a row action is an interactive
 * affordance. Destructive actions (delete/remove) opt into red.
 */

/** One icon-only row action button. `variant` = 'default' (blue) | 'destructive' (red). */
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

const COLUMNS = ['Patient', 'NHS number', 'Date of birth', 'Ward', ''];

const ROWS = [
  ['Jones, Alis', '943 476 5919', '12 Mar 1958', 'Aneurin'],
  ['Owen, Rhys', '620 154 3357', '04 Aug 1972', 'Glyndŵr'],
  ['Davies, Megan', '401 023 2137', '29 Nov 1990', 'Tawe'],
];

const buildTable = ({ selectedIndex } = {}) => {
  const wrap = document.createElement('div');
  wrap.className = 'sr-table-wrap';

  const table = document.createElement('table');
  table.className = 'sr-table';

  // Head
  const thead = document.createElement('thead');
  thead.className = 'sr-table__head';
  const headRow = document.createElement('tr');
  COLUMNS.forEach((col, i) => {
    const th = document.createElement('th');
    th.scope = 'col';
    if (i === COLUMNS.length - 1) {
      th.className = 'sr-table__head--actions';
      th.innerHTML = '<span class="sr-visually-hidden">Actions</span>';
    } else {
      th.textContent = col;
    }
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
    row.forEach((value) => {
      const td = document.createElement('td');
      td.className = 'sr-table__cell';
      td.textContent = value;
      tr.appendChild(td);
    });
    // Actions cell
    const actions = document.createElement('td');
    actions.className = 'sr-table__actions';
    actions.appendChild(actionButton('action/eye', `View ${row[0]}`));
    actions.appendChild(actionButton('action/edit', `Edit ${row[0]}`));
    actions.appendChild(actionButton('action/delete', `Delete ${row[0]}`, 'destructive'));
    tr.appendChild(actions);
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
    selectedIndex: {
      control: { type: 'number' },
      description: 'Index of the selected row (highlighted). Leave blank for none.',
    },
  },
  args: { selectedIndex: undefined },
};

/** Default data table with view / edit (blue) and delete (red) row actions. */
export const Default = {};

/** A selected row, highlighted with Surface/Accent. */
export const SelectedRow = { args: { selectedIndex: 1 } };

/**
 * Focus on the row-action icons: view and edit render in Interactive/Primary
 * (brand blue), never black. Delete is the sole destructive (red) action.
 */
export const RowActions = {
  render: () => {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex; gap:8px; align-items:center; padding:8px;';
    wrap.appendChild(actionButton('action/eye', 'View'));
    wrap.appendChild(actionButton('action/edit', 'Edit'));
    wrap.appendChild(actionButton('action/print', 'Print'));
    wrap.appendChild(actionButton('action/delete', 'Delete', 'destructive'));
    return wrap;
  },
};
