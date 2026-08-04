import React, { useMemo, useState } from 'react';
import {
  Header,
  Footer,
  SegmentedControl,
  Select,
  Input,
  Checkbox,
  Button,
  Table,
  Tag,
  Modal,
  Icon,
} from '@dhcw/sr-react';

import {
  SITES,
  SEND_RECIPIENTS,
  SELECTION_METHODS,
  ADD_INFO_METHODS,
  CASENO_SORTS,
  SEND_CASE_NOTE_TYPES,
  BATCH_REFERENCE,
  SEND_SEARCH_GROUPS,
} from './data.js';

/**
 * Approve-and-send modal (Figma 279:22906).
 *
 * The gate between "I have assembled a batch" and "the notes have moved".
 * Every volume is listed with its own status and warning count; the primary
 * action is disabled until warnings are acknowledged, and its label carries
 * the count that will actually be sent — a batch of five where two are
 * unverified sends three, and the button says so rather than saying "Send".
 */
function ApproveBatchModal({ open, rows, onClose, onSend }) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [openWarningsFor, setOpenWarningsFor] = useState(null);
  const [removed, setRemoved] = useState(() => new Set());

  // Reset per-opening, so a previous acknowledgement can't carry over into a
  // later batch that has warnings of its own.
  React.useEffect(() => {
    if (open) {
      setAcknowledged(false);
      setRemoved(new Set());
      setOpenWarningsFor(rows[0]?.id ?? null);
    }
  }, [open, rows]);

  const live = rows.filter((r) => !removed.has(r.id));
  const withWarnings = live.filter((r) => r.warnings.length > 0);
  const warningCount = withWarnings.reduce((n, r) => n + r.warnings.length, 0);
  const blocked = warningCount > 0 && !acknowledged;
  // A volume is verified when it has no warnings, or its warnings have been
  // acknowledged. Only verified volumes are sent.
  const sendable = live.filter((r) => r.warnings.length === 0 || acknowledged);
  const detail = live.find((r) => r.id === openWarningsFor);

  const columns = [
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const verified = row.warnings.length === 0 || acknowledged;
        return (
          <Tag type={verified ? 'green' : 'yellow'} size="small">
            {verified ? 'Verified' : 'Pending'}
          </Tag>
        );
      },
    },
    { key: 'caseNo', header: 'Case no.' },
    { key: 'volume', header: 'Volume' },
    { key: 'patient', header: 'Patient Details' },
    {
      key: 'warnings',
      header: 'Warnings',
      // Every row is clickable, not just the ones carrying warnings: the
      // panel below has a "no warnings" state (Figma 445:8402), so clicking a
      // clean row is a real answer — "this one is fine" — rather than a dead
      // click that leaves the previous row's warnings on screen.
      render: (row) => {
        const has = row.warnings.length > 0;
        return (
          <button
            type="button"
            className={`link-action send-warning-count${has ? '' : ' send-warning-count--none'}`}
            aria-expanded={openWarningsFor === row.id}
            onClick={() => setOpenWarningsFor(row.id)}
          >
            {has && <Icon name="status/warning" size="xs" color="inherit" />}
            <span>{row.warnings.length}</span>
            <span className="sr-visually-hidden">
              {` ${row.warnings.length === 1 ? 'warning' : 'warnings'} for ${row.volume}`}
              {has ? ', show them' : ''}
            </span>
          </button>
        );
      },
    },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Approve and send batch"
      size="large"
      footer={
        <>
          {/* The reason the primary is disabled sits next to it, not in a
              toast that has already gone by the time the user looks. */}
          {blocked && (
            <span className="send-modal__blocked" role="status">
              Warnings not yet acknowledged
            </span>
          )}
          {warningCount > 0 && (
            <Button
              type="secondary"
              onClick={() => setAcknowledged(true)}
              disabled={acknowledged}
            >
              {acknowledged ? 'Warnings acknowledged' : 'Acknowledge warnings'}
            </Button>
          )}
          <Button type="secondary" onClick={onClose}>Cancel</Button>
          <Button
            type="primary"
            disabled={blocked || sendable.length === 0}
            onClick={() => onSend(sendable.map((r) => r.id))}
          >
            Send verified ({sendable.length})
          </Button>
        </>
      }
    >
      {/* Two variants, per Figma 445:8419: amber and leading with the
          instruction while unacknowledged warnings block the send, green and
          leading with the state once they are all acknowledged. */}
      <div
        className={`send-banner${blocked ? ' send-banner--warning' : ' send-banner--success'}`}
        role="status"
      >
        <Icon
          name={blocked ? 'status/warning' : 'status/success'}
          size="sm"
          color="inherit"
          className="send-banner__icon"
        />
        <p className="send-banner__text">
          {live.length === 0
            ? 'No volumes left in this batch.'
            : blocked
              ? `Acknowledge warnings to continue - 0 errors, ${warningCount} ${
                  warningCount === 1 ? 'warning' : 'warnings'
                } across all volumes.`
              : `Ready to send - 0 errors, ${warningCount} ${
                  warningCount === 1 ? 'warning' : 'warnings'
                } across all volumes.${
                  warningCount > 0 ? ' All warnings acknowledged' : ''
                }`}
        </p>
      </div>

      <Table
        caption="Volumes in this batch"
        columns={columns}
        rows={live}
        rowActionsPosition="trailing"
        actionsLabel="Remove from batch"
        rowActions={(row) => (
          <button
            type="button"
            className="sr-table__action send-remove"
            aria-label={`Remove ${row.volume} for ${row.patient} from this batch`}
            onClick={() => setRemoved((prev) => new Set(prev).add(row.id))}
          >
            <Icon name="action/delete" size="sm" color="inherit" />
          </button>
        )}
      />

      {/* Both states, per Figma 445:8402. The panel keeps its place whichever
          row is selected, so choosing a clean row answers the question
          instead of collapsing the panel and shifting everything under it. */}
      {detail && (
        <div className="send-warnings" aria-live="polite">
          <p className="send-warnings__title">
            {detail.warnings.length > 0 ? 'Warnings for' : 'No warnings for'}{' '}
            {detail.caseNo} · {detail.volume}
          </p>
          {detail.warnings.length > 0 && (
            <ul className="send-warnings__list">
              {detail.warnings.map((w) => (
                <li key={w}>
                  <Icon name="status/warning" size="xs" color="inherit" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Modal>
  );
}

/**
 * SendIT — batch send (Figma 192:4901 empty, 341:9165 search results,
 * 341:9673 volumes added, 279:22906 approval modal, 287:23848 sent).
 *
 * Two panels working as one task: find volumes on the left, build the batch on
 * the right, approve and send from the footer. The batch is only real once the
 * modal's Send is confirmed — everything before that is an editable list, which
 * is why rows sit at `Pending` until then.
 */
export default function SendIt() {
  const [mode, setMode] = useState('new');
  const [recipient, setRecipient] = useState('howarth');
  const [location, setLocation] = useState('all');
  const [noteType, setNoteType] = useState('all');
  const [selectionMethod, setSelectionMethod] = useState('last');
  const [addInfoMethod, setAddInfoMethod] = useState('batch');
  const [sortBy, setSortBy] = useState('caseno');
  const [printLabel, setPrintLabel] = useState(false);

  const [searched, setSearched] = useState(false);
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState(() => new Set());
  const [batch, setBatch] = useState([]);
  const [hideSent, setHideSent] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);

  const groups = searched ? SEND_SEARCH_GROUPS : [];

  const runSearch = (e) => {
    e?.preventDefault();
    setSearched(true);
  };

  // A scan is the same search a clinician would type, minus the typing — it
  // populates the field and runs, rather than jumping straight into a batch.
  const simulateScan = () => {
    setQuery('000 111 2222');
    setSearched(true);
  };

  const togglePick = (id) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const addSelectedToBatch = () => {
    const additions = [];
    for (const group of groups) {
      for (const v of group.volumes) {
        if (!picked.has(v.id)) continue;
        if (batch.some((b) => b.id === v.id)) continue;
        additions.push({
          id: v.id,
          caseNo: group.crn,
          volume: v.volume,
          location: 'All sites',
          patient: group.patient,
          warnings: v.warnings,
          status: 'Pending',
          statusType: 'yellow',
        });
      }
    }
    setBatch((prev) => [...prev, ...additions]);
    setPicked(new Set());
  };

  const sendBatch = (ids) => {
    const sent = new Set(ids);
    setBatch((prev) =>
      prev.map((row) =>
        sent.has(row.id) ? { ...row, status: 'Sent', statusType: 'green' } : row
      )
    );
    setApproveOpen(false);
  };

  const visibleBatch = useMemo(
    () => (hideSent ? batch.filter((r) => r.status !== 'Sent') : batch),
    [batch, hideSent]
  );

  const pendingRows = batch.filter((r) => r.status !== 'Sent');

  const batchColumns = [
    { key: 'caseNo', header: 'Case note' },
    { key: 'volume', header: 'Volume' },
    { key: 'location', header: 'Location' },
    { key: 'patient', header: 'Patient Details' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Tag type={row.statusType} size="small">{row.status}</Tag>
      ),
    },
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
        <div className="page__bar">
          <h1 className="page__title">SendIT</h1>
          <Button
            type="secondary"
            size="small"
            leadingIcon={<Icon name="action/print" size="xs" color="inherit" />}
          >
            Print Patient label
          </Button>
        </div>

        <section className="send-setup" aria-label="Batch settings">
          <SegmentedControl
            ariaLabel="Batch type"
            options={[
              { label: 'New Batch', value: 'new' },
              { label: 'Existing Batch', value: 'existing' },
            ]}
            value={mode}
            onChange={setMode}
          />

          <div className="send-setup__fields">
            <Select label="Sending to" required options={SEND_RECIPIENTS} value={recipient} onChange={setRecipient} />
            <Select label="Location" required options={SITES} value={location} onChange={setLocation} />
            <Input type="calendar" label="Clinic date" placeholder="Add Date" />
            <Select label="Case note type" required options={SEND_CASE_NOTE_TYPES} value={noteType} onChange={setNoteType} />
            <Select label="Selection method" required options={SELECTION_METHODS} value={selectionMethod} onChange={setSelectionMethod} />
            <Select label="Add info method" required options={ADD_INFO_METHODS} value={addInfoMethod} onChange={setAddInfoMethod} />
            <Select label="Caseno (sort)" options={CASENO_SORTS} value={sortBy} onChange={setSortBy} />
          </div>

          <Checkbox
            label="Print label"
            checked={printLabel}
            onChange={() => setPrintLabel((v) => !v)}
          />

          <Button type="secondary" size="small">
            {mode === 'new' ? 'Create new batch' : 'Open batch'}
          </Button>
        </section>

        <p className="send-batch-ref">
          <strong>Batch Details:</strong> {BATCH_REFERENCE.number} | User{' '}
          {BATCH_REFERENCE.user} at {BATCH_REFERENCE.location}
        </p>

        <div className="send-panels">
          <section className="panel send-find" aria-label="Find case notes">
            <h2 className="panel__title">Find case notes</h2>

            <form className="send-find__search" onSubmit={runSearch}>
              <Input
                type="text"
                label="Search for case notes"
                hideLabel
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                leadingIcon={<Icon name="nav/search" size="sm" />}
                trailingAction={
                  <button type="button" className="scan-trigger" onClick={simulateScan}>
                    <Icon name="action/scan" size="sm" color="inherit" />
                    <span className="scan-trigger__label">Scan Barcode</span>
                  </button>
                }
              />
              <Button type="primary" htmlType="submit">Search</Button>
            </form>

            <div className="send-find__results">
              {groups.length === 0 ? (
                <p className="send-empty">
                  {searched
                    ? 'No case notes match that search.'
                    : 'Search or scan a barcode to find case notes to add to this batch.'}
                </p>
              ) : (
                groups.map((group) => {
                  const ids = group.volumes.map((v) => v.id);
                  const allPicked = ids.every((id) => picked.has(id));
                  return (
                    <div className="send-group" key={group.id}>
                      <h3 className="send-group__patient">{group.patient}</h3>
                      <p className="send-group__meta">
                        NHS: {group.nhs} &nbsp;|&nbsp; DOB: {group.dob} &nbsp;|&nbsp; CRN: {group.crn}
                      </p>
                      <p className="send-group__links">
                        <button
                          type="button"
                          className="link-action"
                          onClick={() =>
                            setPicked((prev) => {
                              const next = new Set(prev);
                              ids.forEach((id) => (allPicked ? next.delete(id) : next.add(id)));
                              return next;
                            })
                          }
                        >
                          {allPicked ? 'Clear all' : 'Select all'}
                        </button>
                        <button
                          type="button"
                          className="link-action"
                          onClick={() => {
                            setSearched(false);
                            setQuery('');
                            setPicked(new Set());
                          }}
                        >
                          Clear search
                        </button>
                      </p>

                      <ul className="send-volumes">
                        {group.volumes.map((v) => {
                          const inBatch = batch.some((b) => b.id === v.id);
                          return (
                            <li className="send-volume" key={v.id}>
                              <Checkbox
                                label={
                                  <span className="send-volume__body">
                                    <span className="send-volume__name">{v.volume}</span>
                                    <span className="send-volume__meta">
                                      {v.location} | {v.moved}
                                    </span>
                                  </span>
                                }
                                checked={picked.has(v.id)}
                                disabled={inBatch}
                                onChange={() => togglePick(v.id)}
                              />
                              <Tag type={v.statusType} size="small">
                                {inBatch ? 'In batch' : v.status}
                              </Tag>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })
              )}
            </div>

            <div className="send-find__foot">
              <Button
                type="secondary"
                size="small"
                disabled={picked.size === 0}
                onClick={addSelectedToBatch}
              >
                Add selected to batch
              </Button>
              <span className="send-find__count">
                {picked.size} {picked.size === 1 ? 'volume' : 'volumes'} selected
              </span>
            </div>
          </section>

          <section className="panel send-summary" aria-label="Batch summary">
            <div className="send-summary__head">
              <h2 className="panel__title">Batch Summary</h2>
              <div className="send-summary__controls">
                <Checkbox
                  label="Hide sent case notes"
                  checked={hideSent}
                  onChange={() => setHideSent((v) => !v)}
                />
                <Button
                  type="secondary"
                  size="small"
                  disabled={batch.length === 0}
                  onClick={() => setBatch([])}
                >
                  Clear all
                </Button>
              </div>
            </div>

            {visibleBatch.length === 0 ? (
              <p className="send-empty">
                {batch.length === 0
                  ? 'Nothing in this batch yet. Add volumes from the search on the left.'
                  : 'Every case note in this batch has been sent.'}
              </p>
            ) : (
              <Table
                caption="Case notes in this batch"
                columns={batchColumns}
                rows={visibleBatch}
                rowActionsPosition="trailing"
                actionsLabel="Remove from batch"
                rowActions={(row) => (
                  <button
                    type="button"
                    className="sr-table__action send-remove"
                    aria-label={`Remove ${row.volume} for ${row.patient} from this batch`}
                    onClick={() => setBatch((prev) => prev.filter((b) => b.id !== row.id))}
                  >
                    <Icon name="action/delete" size="sm" color="inherit" />
                  </button>
                )}
              />
            )}
          </section>
        </div>
      </main>

      <Footer
        version="v 0.1.0.1112"
        actions={
          <>
            <Button
              type="secondary"
              size="small"
              disabled={batch.length === 0}
              leadingIcon={<Icon name="action/print" size="xs" color="inherit" />}
            >
              Print Labels
            </Button>
            <Button
              type="primary"
              size="small"
              disabled={pendingRows.length === 0}
              onClick={() => setApproveOpen(true)}
            >
              Approve Summary list
            </Button>
          </>
        }
      />

      <ApproveBatchModal
        open={approveOpen}
        rows={pendingRows}
        onClose={() => setApproveOpen(false)}
        onSend={sendBatch}
      />
    </>
  );
}
