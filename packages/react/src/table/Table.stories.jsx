import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@dhcw/sr-tokens/build/css/tokens.css';
import Table from './Table.jsx';
import Tag from '../tags/Tag.jsx';
import Icon from '../icon/Icon.jsx';

/**
 * Modelled on the Case Note Tracking patient casenote view (U0Ugs6bG1KLzrrWdnxqcZO,
 * node 2:4386) — the screen this wrapper was built for.
 */
const NOTES = [
  { id: 1, volume: 'General notes vol 4', status: 'Registered', statusType: 'blue', location: 'Madog Suite-GGH', activity: 'Registered by Gadgil, AA(Mr)', moved: '09/06/2026 15:25', batch: '50381858' },
  { id: 2, volume: 'General notes vol 3', status: 'Sent', statusType: 'grey', location: 'Teifi Ward-GGH', activity: 'Registered by Gadgil, AA(Mr)', moved: '05/06/2026 17:40', batch: '-' },
  { id: 3, volume: 'General notes vol 2', status: 'Received', statusType: 'green', location: 'Cleddau Ward-GGH', activity: 'Registered by Gadgil, AA(Mr)', moved: '05/06/2026 17:40', batch: '-' },
  { id: 4, volume: 'General notes vol 2', status: 'Tagged', statusType: 'yellow', location: 'A&E Dept-GGH', activity: 'Registered by Gadgil, AA(Mr)', moved: '05/06/2026 17:40', batch: '-' },
  { id: 5, volume: 'General notes vol 1', status: 'Inactive', statusType: 'red', location: 'A&E Dept-GGH', activity: 'Registered by Gadgil, AA(Mr)', moved: '05/06/2026 17:40', batch: '-' },
];

const COLUMNS = [
  { key: 'volume', header: 'Volume', sortable: true },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <Tag type={row.statusType} size="small">{row.status}</Tag>,
  },
  { key: 'location', header: 'Location', sortable: true },
  { key: 'activity', header: 'Last Activity' },
  { key: 'moved', header: 'Movement Date', sortable: true },
  { key: 'batch', header: 'Batch no.' },
];

// Volume names repeat across rows, so the location is needed to keep each
// checkbox's accessible name unique.
const rowLabel = (row) => `Select ${row.volume} at ${row.location}`;

function Demo({ selectable = true, sortable = true, stickyHead = false }) {
  const [selected, setSelected] = useState(() => new Set([1, 2, 3]));
  const [sort, setSort] = useState({ key: 'volume', direction: 'ascending' });

  // Sorting is controlled: the component reports intent, the caller reorders.
  const rows = useMemo(() => {
    if (!sortable || !sort) return NOTES;
    const dir = sort.direction === 'ascending' ? 1 : -1;
    return [...NOTES].sort((a, b) =>
      String(a[sort.key]).localeCompare(String(b[sort.key])) * dir
    );
  }, [sort, sortable]);

  return (
    <div style={{ maxWidth: 1000 }}>
      <p style={{ font: '500 14px/20px Roboto, sans-serif', color: '#212b32' }}>
        {selected.size} notes selected
      </p>
      <Table
        caption="Case notes for JOHN, Elvet George"
        columns={COLUMNS}
        rows={rows}
        selectable={selectable}
        selectedIds={selected}
        onSelectionChange={setSelected}
        getRowLabel={rowLabel}
        selectAllLabel="Select all case notes"
        sort={sortable ? sort : undefined}
        onSortChange={sortable ? setSort : undefined}
        stickyHead={stickyHead}
        rowActions={(row) => (
          <button type="button" className="sr-table__action" aria-label={`Actions for ${row.volume}`}>
            <Icon name="nav/menu2" size="sm" color="inherit" />
          </button>
        )}
      />
    </div>
  );
}

const render = (args) => {
  const container = document.createElement('div');
  createRoot(container).render(<Demo {...args} />);
  return container;
};

export default {
  title: 'React/Table',
  tags: ['autodocs'],
  render,
  argTypes: {
    selectable: { control: 'boolean' },
    sortable: { control: 'boolean' },
    stickyHead: { control: 'boolean' },
  },
};

export const CaseNotes = { args: { selectable: true, sortable: true } };
export const PlainNoSelection = { args: { selectable: false, sortable: false } };
export const SortableOnly = { args: { selectable: false, sortable: true } };
