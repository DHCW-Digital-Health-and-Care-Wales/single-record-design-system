import React, { useMemo, useState } from 'react';
import {
  PatientBanner,
  Table,
  Modal,
  Button,
  Select,
  Input,
  Checkbox,
  Tag,
  Icon,
} from '@dhcw/sr-react';

import { PATIENT, REACTIONS, NOTES, SITES, NOTE_TYPES } from './data.js';

/**
 * Case Note Tracking — patient casenote view.
 * Figma: U0Ugs6bG1KLzrrWdnxqcZO, node 2:4386.
 *
 * Every component here comes from @dhcw/sr-react. Nothing is restyled locally —
 * if something looks wrong, the design system is wrong, and that is the point of
 * this prototype.
 */
export default function CaseNotes() {
  const [bannerExpanded, setBannerExpanded] = useState(true);
  const [selected, setSelected] = useState(() => new Set([1, 2, 3]));
  const [sort, setSort] = useState({ key: 'volume', direction: 'ascending' });
  const [site, setSite] = useState('all');
  const [noteType, setNoteType] = useState('general');
  const [showInactive, setShowInactive] = useState(false);
  const [search, setSearch] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const rows = useMemo(() => {
    let out = NOTES;
    if (!showInactive) out = out.filter((n) => n.status !== 'Inactive');
    if (site !== 'all') out = out.filter((n) => n.siteId === site);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      out = out.filter(
        (n) =>
          n.volume.toLowerCase().includes(q) ||
          n.location.toLowerCase().includes(q)
      );
    }
    if (sort) {
      const dir = sort.direction === 'ascending' ? 1 : -1;
      out = [...out].sort(
        (a, b) => String(a[sort.key]).localeCompare(String(b[sort.key])) * dir
      );
    }
    return out;
  }, [showInactive, site, search, sort]);

  const columns = [
    { key: 'volume', header: 'Volume', sortable: true },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Tag type={row.statusType} size="small">
          {row.status}
        </Tag>
      ),
    },
    { key: 'location', header: 'Location', sortable: true },
    { key: 'activity', header: 'Last Activity' },
    { key: 'moved', header: 'Movement Date', sortable: true },
    { key: 'batch', header: 'Batch no.' },
  ];

  const selectedNotes = NOTES.filter((n) => selected.has(n.id));

  return (
    <>
      <main className="app__main" id="main">
        {/* This screen deliberately leads with the patient banner rather than a
            visible page title — identity comes first. But a screen with no h1
            leaves screen-reader users navigating by heading with nothing to
            land on, so the title exists and is only visually hidden. */}
        <h1 className="visually-hidden">Case Note Tracking</h1>

        <PatientBanner
          patient={PATIENT}
          reactions={REACTIONS}
          warnings={3}
          type="fill"
          expanded={bannerExpanded}
          onToggle={() => setBannerExpanded((v) => !v)}
          onCopy={(v) => navigator.clipboard?.writeText(v)}
          onEditReactions={() => {}}
          onEditWarnings={() => {}}
          actions={
            bannerExpanded ? (
              <>
                <Button
                  type="primary"
                  size="small"
                  leadingIcon={<Icon name="action/refresh" size="xs" color="inherit" />}
                >
                  Change Patient
                </Button>
                <Button
                  type="secondary"
                  size="small"
                  leadingIcon={<Icon name="clinical/record" size="xs" color="inherit" />}
                >
                  Open WCP record
                </Button>
                <Button
                  type="secondary"
                  size="small"
                  leadingIcon={<Icon name="action/print" size="xs" color="inherit" />}
                >
                  Print Patient label
                </Button>
              </>
            ) : (
              <>
                <Button type="primary" size="small" aria-label="Change patient">
                  <Icon name="action/refresh" size="xs" color="inherit" />
                </Button>
                <Button type="secondary" size="small" aria-label="Open WCP record">
                  <Icon name="clinical/record" size="xs" color="inherit" />
                </Button>
                <Button type="secondary" size="small" aria-label="Print patient label">
                  <Icon name="action/print" size="xs" color="inherit" />
                </Button>
              </>
            )
          }
        />

        <section className="filters" aria-label="Filter case notes">
          <div className="filters__field">
            <Select
              label="Site"
              options={SITES}
              value={site}
              onChange={setSite}
            />
          </div>
          <div className="filters__field">
            <Select
              label="Type"
              options={NOTE_TYPES}
              value={noteType}
              onChange={setNoteType}
            />
          </div>
          <div className="filters__field filters__field--search">
            <Input
              label="Search notes"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Volume or location"
            />
          </div>
          <Checkbox
            label="Show inactive volumes"
            checked={showInactive}
            onChange={() => setShowInactive((v) => !v)}
          />
        </section>

        <section className="notes" aria-label="Case notes">
          <div className="notes__bar">
            <p className="notes__count">
              {selected.size} {selected.size === 1 ? 'note' : 'notes'} selected
            </p>
            <div className="notes__bar-actions">
              <Button
                type="secondary"
                size="small"
                disabled={selected.size === 0}
                onClick={() => setConfirmOpen(true)}
              >
                Send batch
              </Button>
              <Button
                type="primary"
                size="small"
                leadingIcon={<Icon name="action/add" size="xs" color="inherit" />}
              >
                Create
              </Button>
            </div>
          </div>

          <Table
            caption={`Case notes for ${PATIENT.name}`}
            columns={columns}
            rows={rows}
            selectable
            selectedIds={selected}
            onSelectionChange={setSelected}
            getRowLabel={(row) => `Select ${row.volume} at ${row.location}`}
            selectAllLabel="Select all case notes"
            sort={sort}
            onSortChange={setSort}
            stickyHead
            rowActions={(row) => (
              <button
                type="button"
                className="sr-table__action"
                aria-label={`Actions for ${row.volume} at ${row.location}`}
              >
                <Icon name="nav/menu2" size="sm" color="inherit" />
              </button>
            )}
          />

          {rows.length === 0 && (
            <p className="notes__empty">
              No case notes match these filters. Clear the search or show inactive
              volumes.
            </p>
          )}
        </section>
      </main>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={`Send ${selectedNotes.length} case ${
          selectedNotes.length === 1 ? 'note' : 'notes'
        }?`}
        size="small"
        footer={
          <>
            <Button type="secondary" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={() => {
                setSelected(new Set());
                setConfirmOpen(false);
              }}
            >
              Send notes
            </Button>
          </>
        }
      >
        <p>
          These case notes will be added to a new batch for {PATIENT.name}. You can
          track them from My Requests.
        </p>
        <ul className="modal-list">
          {selectedNotes.map((n) => (
            <li key={n.id}>
              {n.volume} — {n.location}
            </li>
          ))}
        </ul>
      </Modal>
    </>
  );
}
