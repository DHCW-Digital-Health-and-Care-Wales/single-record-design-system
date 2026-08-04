import React, { useMemo, useState } from 'react';
import {
  Header,
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
import { RowActionMenu, NoteActionModal, ConfirmModal, AdditionalInfoField } from './shared/RowActions.jsx';

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

      <AdditionalInfoField />
    </Modal>
  );
}

/**
 * Case Note Tracking — patient casenote view.
 * Figma: U0Ugs6bG1KLzrrWdnxqcZO, node 2:4386.
 *
 * Reachable only from Patient Search's "View" action — this is one patient's
 * casenotes, not the cross-patient My Requests screen (127:4813), which is a
 * separate component.
 *
 * Every component here comes from @dhcw/sr-react. Nothing is restyled locally —
 * if something looks wrong, the design system is wrong, and that is the point of
 * this prototype.
 */
export default function CaseNotes() {
  const [bannerExpanded, setBannerExpanded] = useState(true);
  const [notes, setNotes] = useState(NOTES);
  const [sort, setSort] = useState({ key: 'volume', direction: 'ascending' });
  const [site, setSite] = useState('all');
  const [noteType, setNoteType] = useState('general');
  const [showInactive, setShowInactive] = useState(false);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [noteAction, setNoteAction] = useState({ kind: null, row: null });
  const [confirmAction, setConfirmAction] = useState({ kind: null, row: null });

  const handleRowAction = (kind, row) => {
    if (kind === 'send' || kind === 'receive' || kind === 'tag') {
      setNoteAction({ kind, row });
    } else if (kind === 'deactivate' || kind === 'delete') {
      setConfirmAction({ kind, row });
    }
    // Merge has no Figma-designed flow yet — no-op.
  };

  const confirmCopy = {
    deactivate: {
      title: 'Deactivate this case note?',
      body: 'This marks the volume as inactive. It can be reactivated later from the same menu.',
      confirmLabel: 'Deactivate note',
    },
    delete: {
      title: 'Delete this case note?',
      body: 'This permanently deletes the case note record and cannot be undone.',
      confirmLabel: 'Delete note',
    },
  }[confirmAction.kind];

  const runConfirm = () => {
    if (confirmAction.kind === 'deactivate') {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === confirmAction.row.id
            ? { ...n, status: 'Inactive', statusType: 'red' }
            : n
        )
      );
    } else if (confirmAction.kind === 'delete') {
      setNotes((prev) => prev.filter((n) => n.id !== confirmAction.row.id));
    }
    setConfirmAction({ kind: null, row: null });
  };

  const rows = useMemo(() => {
    let out = notes;
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
  }, [notes, showInactive, site, search, sort]);

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

  return (
    <>
      <Header
        variant="desktop-2"
        org=""
        initials="AB"
        onLanguageToggle={() => {}}
        onNotificationClick={() => {}}
      />

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
              {rows.length} {rows.length === 1 ? 'note' : 'notes'}
            </p>
            <div className="notes__bar-actions">
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

      <NoteActionModal
        kind={noteAction.kind}
        row={noteAction.row}
        onClose={() => setNoteAction({ kind: null, row: null })}
      />

      <ConfirmModal
        open={Boolean(confirmAction.kind)}
        title={confirmCopy?.title}
        body={confirmCopy?.body}
        confirmLabel={confirmCopy?.confirmLabel}
        onConfirm={runConfirm}
        onClose={() => setConfirmAction({ kind: null, row: null })}
      />

      <CreateNoteModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}
