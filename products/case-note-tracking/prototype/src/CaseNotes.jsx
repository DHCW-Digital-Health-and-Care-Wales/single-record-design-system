import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  PatientBanner,
  Table,
  Modal,
  Button,
  Select,
  Input,
  Checkbox,
  SegmentedControl,
  Tag,
  Icon,
} from '@dhcw/sr-react';

import { PATIENT, REACTIONS, NOTES, SITES, NOTE_TYPES } from './data.js';

/**
 * Row-level action menu (Figma 47:4041). There is no Menu/Dropdown component
 * in the design system yet — DESIGN-SYSTEM.md names this gap explicitly
 * rather than inventing one silently. This is a local, minimal stand-in built
 * from tokens only (no hardcoded colour or type), scoped to this prototype
 * until a real component exists.
 */
function RowActionMenu({ row, onAction }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('click', onOutside, true);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onOutside, true);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const items = [
    { key: 'send', label: 'Send case note' },
    { key: 'receive', label: 'Receive case note' },
    { key: 'tag', label: 'Tag case note' },
    { key: 'merge', label: 'Merge case note' },
    { key: 'deactivate', label: 'Deactivate case note', destructive: true },
    { key: 'delete', label: 'Delete case note', destructive: true },
  ];

  return (
    <div className="row-menu" ref={wrapRef}>
      <button
        type="button"
        className="sr-table__action"
        aria-label={`Actions for ${row.volume} at ${row.location}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Icon name="nav/menu2" size="sm" color="inherit" />
      </button>
      {open && (
        <ul className="row-menu__list" role="menu">
          {items.map((item) => (
            <li key={item.key} role="none">
              <button
                type="button"
                role="menuitem"
                className={`row-menu__item${item.destructive ? ' row-menu__item--destructive' : ''}`}
                onClick={() => {
                  setOpen(false);
                  onAction(item.key, row);
                }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Shared body for the three row-level workflow modals (Send/Receive/Tag —
 * Figma 26:3509, 160:7684, 308:26049). All three share the same Record
 * Details banner plus a date/time-and-sites form; only the title, primary
 * button label and the middle field (Sent date/time for Receive, a
 * required-by checkbox and date/time for Tag) differ.
 */
function NoteActionModal({ kind, row, onClose }) {
  const open = Boolean(row);
  const [requiredBy, setRequiredBy] = useState(true);

  const config = {
    send: { title: 'Send Notes', primary: 'Send note' },
    receive: { title: 'Receive Notes', primary: 'Receive note' },
    tag: { title: 'Tag Notes', primary: 'Tag note' },
  }[kind];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={config?.title}
      size="small"
      footer={
        <>
          <Button type="secondary" onClick={onClose}>Cancel</Button>
          <Button type="primary" onClick={onClose}>{config?.primary}</Button>
        </>
      }
    >
      {row && (
        <>
          <div className="modal-banner">
            <p className="modal-banner__title">
              <Icon name="status/info" size="sm" color="inherit" />
              Record Details
            </p>
            <div className="modal-banner__grid">
              <div className="modal-banner__field">
                <dt>Location</dt>
                <dd>{row.location}</dd>
              </div>
              <div className="modal-banner__field">
                <dt>Type/Volume</dt>
                <dd>{row.volume}</dd>
              </div>
              {kind === 'receive' && (
                <>
                  <div className="modal-banner__field">
                    <dt>Sent Date</dt>
                    <dd>{row.moved.split(' ').slice(0, 3).join(' ')}</dd>
                  </div>
                  <div className="modal-banner__field">
                    <dt>Sent Time</dt>
                    <dd>{row.moved.split(' ').slice(-1)[0]}</dd>
                  </div>
                </>
              )}
            </div>
          </div>

          {kind === 'tag' && (
            <Checkbox
              label="Notes required by"
              checked={requiredBy}
              onChange={() => setRequiredBy((v) => !v)}
            />
          )}

          <div className="modal-form-row">
            <Input
              type="calendar"
              label={kind === 'tag' ? 'Required by date' : `${config.title.split(' ')[0]} date`}
              required
            />
            <Input
              type="time"
              label={kind === 'tag' ? 'Required by time' : `${config.title.split(' ')[0]} time`}
              required
            />
          </div>
          <Select label="I am working with" options={SITES} defaultValue="all" required />
          <Select label="Location" options={SITES} defaultValue="all" required />
          <Select label="Holder" options={SITES} defaultValue="all" required />
          <Input type="calendar" label="Clinic/TCI date" required />

          <button type="button" className="link-action modal-add-field">
            + Add additional information
          </button>
        </>
      )}
    </Modal>
  );
}

/**
 * Create modal (Figma 2:4438 New / 2:4458 Temporary), reached from the
 * "Create" button above the table. A SegmentedControl switches between
 * registering a new type/volume and a temporary file merged later — the
 * fields differ only in the second date/time pair and whether that pair
 * (and note type) is required.
 */
function CreateNoteModal({ open, onClose }) {
  const [mode, setMode] = useState('new');
  const isNew = mode === 'new';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Register New Notes"
      size="medium"
      footer={
        <>
          <Button type="secondary" onClick={onClose}>Cancel</Button>
          <Button type="primary" onClick={onClose}>Create note</Button>
        </>
      }
    >
      <SegmentedControl
        ariaLabel="Note registration type"
        options={[
          { label: 'New Type/Volume', value: 'new' },
          { label: 'Temporary (merge later)', value: 'temp' },
        ]}
        value={mode}
        onChange={setMode}
      />

      <div className="modal-form-row">
        <Select label="Note type" options={NOTE_TYPES} required={isNew} />
        <Select
          label="Volume (auto-assigned)"
          options={[{ value: 'auto', label: isNew ? 'General notes vol 1' : 'Temporary General Notes' }]}
          defaultValue="auto"
          disabled
        />
      </div>
      <div className="modal-form-row">
        <Input type="calendar" label={isNew ? 'Registered date' : 'Temp file date'} required={isNew} />
        <Input type="time" label={isNew ? 'Registered time' : 'Temp file time'} required={isNew} />
      </div>
      <Select label="I am working with" options={SITES} defaultValue="all" required />
      <Select label="Location" options={SITES} defaultValue="all" required />
      <Select label="Holder" options={SITES} defaultValue="all" required />
      <Input type="calendar" label="Clinic/TCI date" required />

      <button type="button" className="link-action modal-add-field">
        + Add additional information
      </button>
    </Modal>
  );
}

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
  const [createOpen, setCreateOpen] = useState(false);
  const [noteAction, setNoteAction] = useState({ kind: null, row: null });

  const handleRowAction = (kind, row) => {
    if (kind === 'send' || kind === 'receive' || kind === 'tag') {
      setNoteAction({ kind, row });
    }
    // Merge, Deactivate and Delete have no Figma-designed flow yet — no-op.
  };

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
                onClick={() => setCreateOpen(true)}
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
              <RowActionMenu row={row} onAction={handleRowAction} />
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

      <NoteActionModal
        kind={noteAction.kind}
        row={noteAction.row}
        onClose={() => setNoteAction({ kind: null, row: null })}
      />

      <CreateNoteModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}
