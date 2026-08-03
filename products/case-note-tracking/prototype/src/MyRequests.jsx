import React, { useMemo, useState } from 'react';
import { Header, Table, Input, Tag, Icon } from '@dhcw/sr-react';

import { MY_REQUESTS } from './data.js';
import { RowActionMenu, NoteActionModal, ConfirmModal } from './shared/RowActions.jsx';

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'sent', label: 'Sent' },
  { value: 'received', label: 'Received' },
];

/**
 * My Requests (Figma 127:4813) — cross-patient view of every case note this
 * user has sent or received, filtered by the All/Sent/Received tabs. Distinct
 * from CaseNotes.jsx, which is one patient's casenote table reached from
 * Patient Search — the two were previously conflated behind the same nav
 * item.
 *
 * No Tabs component exists in the design system yet (same gap noted for the
 * row action menu in DESIGN-SYSTEM.md) — this is a local, token-only stand-in.
 */
export default function MyRequests() {
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [requests, setRequests] = useState(MY_REQUESTS);
  const [noteAction, setNoteAction] = useState({ kind: null, row: null });
  const [confirmAction, setConfirmAction] = useState({ kind: null, row: null });

  const handleRowAction = (kind, row) => {
    if (kind === 'send' || kind === 'receive' || kind === 'tag') {
      setNoteAction({ kind, row });
    } else if (kind === 'deactivate' || kind === 'delete') {
      setConfirmAction({ kind, row });
    }
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
      setRequests((prev) =>
        prev.map((r) =>
          r.id === confirmAction.row.id
            ? { ...r, status: 'Deactivated', statusType: 'red' }
            : r
        )
      );
    } else if (confirmAction.kind === 'delete') {
      setRequests((prev) => prev.filter((r) => r.id !== confirmAction.row.id));
    }
    setConfirmAction({ kind: null, row: null });
  };

  const rows = useMemo(() => {
    let out = requests;
    if (tab !== 'all') out = out.filter((r) => r.tab === tab);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      out = out.filter(
        (r) =>
          r.volume.toLowerCase().includes(q) ||
          r.patient.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q)
      );
    }
    return out;
  }, [requests, tab, search]);

  const columns = [
    {
      key: 'volume',
      header: 'Volume',
      render: (row) => (
        <>
          <div>{row.volume}</div>
          <div className="my-requests__patient">{row.patient}</div>
        </>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Tag type={row.statusType} size="small">
          {row.status}
        </Tag>
      ),
    },
    { key: 'location', header: 'Location' },
    { key: 'activity', header: 'Last Activity' },
    { key: 'moved', header: 'Movement Date' },
    { key: 'clinicDate', header: 'Clinic Date' },
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
        <div className="page__heading">
          <h1 className="page__title">My Requests</h1>
          <p className="page__subtitle">Search for a patient to view their casenotes</p>
        </div>

        <div className="my-requests__tabs" role="tablist" aria-label="Request status">
          {TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              role="tab"
              aria-selected={tab === t.value}
              className={`my-requests__tab${tab === t.value ? ' is-selected' : ''}`}
              onClick={() => setTab(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <section className="results" aria-label="My requests">
          <div className="results__bar">
            <p className="results__count">
              <strong>{rows.length}</strong> Case notes
            </p>
            <div className="results__filter">
              <Input
                type="text"
                label="Search"
                hideLabel
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                leadingIcon={<Icon name="nav/search" size="sm" />}
              />
            </div>
          </div>

          <Table
            caption="My requests"
            columns={columns}
            rows={rows}
            stickyHead
            rowActions={(row) => (
              <RowActionMenu row={row} onAction={handleRowAction} />
            )}
          />

          {rows.length === 0 && (
            <p className="results__empty">
              No requests match that search or filter.
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
    </>
  );
}
