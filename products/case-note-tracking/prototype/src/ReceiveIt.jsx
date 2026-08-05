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
  Autocomplete,
  Icon,
} from '@dhcw/sr-react';

import { ConfirmModal } from './shared/RowActions.jsx';

import {
  SITES,
  SEND_RECIPIENTS,
  SELECTION_METHODS,
  ADD_INFO_METHODS,
  CASENO_SORTS,
  SEND_CASE_NOTE_TYPES,
  BATCH_REFERENCE,
  SEND_SEARCH_GROUPS,
  OPEN_BATCHES,
} from './data.js';

/**
 * Approve-and-receive modal — the ReceiveIT counterpart of SendIT's
 * ApproveBatchModal (Figma 279:22906). Same mechanism, receive-facing
 * wording: the gate between "I have assembled a batch" and "the notes have
 * been receipted in". Every volume is listed with its own status and warning
 * count; the primary action is disabled until warnings are acknowledged, and
 * its label carries the count that will actually be received.
 */
function ApproveReceiveModal({ open, rows, onClose, onReceive }) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [openWarningsFor, setOpenWarningsFor] = useState(null);
  const [removed, setRemoved] = useState(() => new Set());

  // Reset only on the false->true transition, not on every render the modal
  // is open for. `rows` (the caller's pendingRows) is a new array reference
  // on every parent render, so depending on it here re-fired this effect on
  // every re-render while open — including the one caused by clicking a
  // different row — snapping the selection straight back to row 0 and making
  // row selection look broken.
  const wasOpen = React.useRef(false);
  React.useEffect(() => {
    if (open && !wasOpen.current) {
      setAcknowledged(false);
      setRemoved(new Set());
      setOpenWarningsFor(rows[0]?.id ?? null);
    }
    wasOpen.current = open;
  }, [open, rows]);

  const live = rows.filter((r) => !removed.has(r.id));
  const withWarnings = live.filter((r) => r.warnings.length > 0);
  const warningCount = withWarnings.reduce((n, r) => n + r.warnings.length, 0);
  const blocked = warningCount > 0 && !acknowledged;
  // A volume is verified when it has no warnings, or its warnings have been
  // acknowledged. Only verified volumes are received.
  const receivable = live.filter((r) => r.warnings.length === 0 || acknowledged);
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
      // panel below has a "no warnings" state, so clicking a clean row is a
      // real answer — "this one is fine" — rather than a dead click that
      // leaves the previous row's warnings on screen.
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
      title="Approve and receive batch"
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
            disabled={blocked || receivable.length === 0}
            onClick={() => onReceive(receivable.map((r) => r.id))}
          >
            Receive verified ({receivable.length})
          </Button>
        </>
      }
    >
      {/* Two variants: amber and leading with the instruction while
          unacknowledged warnings block the receive, green and leading with
          the state once they are all acknowledged. */}
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
              : `Ready to receive - 0 errors, ${warningCount} ${
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

      {/* Both states. The panel keeps its place whichever row is selected,
          so choosing a clean row answers the question instead of collapsing
          the panel and shifting everything under it. */}
      {detail && (
        <div className="send-warnings" aria-live="polite">
          {detail.warnings.length > 0 ? (
            <>
              <p className="send-warnings__title">
                Warnings for {detail.caseNo} · {detail.volume}
              </p>
              <ul className="send-warnings__list">
                {detail.warnings.map((w) => (
                  <li key={w}>
                    <Icon name="status/warning" size="xs" color="inherit" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="send-warnings__none">
              <span>No errors or warnings for {detail.caseNo} · {detail.volume}</span>
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}

/**
 * ReceiveIT — batch receive. A near-replica of SendIT (SendIt.jsx): same
 * mechanism (find volumes on the left, build the batch on the right, approve
 * from the footer), receive-facing wording throughout. SendIT is left
 * untouched; this is the "ReceiveIT" nav entry's own screen, not a
 * replacement.
 */
export default function ReceiveIt() {
  const [mode, setMode] = useState('new');
  const [recipient, setRecipient] = useState('howarth');
  const [location, setLocation] = useState('all');
  const [noteType, setNoteType] = useState('all');
  const [selectionMethod, setSelectionMethod] = useState('last');
  const [addInfoMethod, setAddInfoMethod] = useState('batch');
  const [sortBy, setSortBy] = useState('caseno');
  const [printLabel, setPrintLabel] = useState(false);

  // The batch reference, and the gate for everything below the settings card.
  // Null until "Create new batch" or "Open batch" is pressed: the number is
  // assigned by that press, so there is nothing to show a batch reference for
  // before it, and no batch to add case notes to.
  const [batchRef, setBatchRef] = useState(null);
  const [existingBatch, setExistingBatch] = useState('');

  // Which patient the finder is showing. One at a time: a new search replaces
  // the previous patient rather than stacking, so the checkbox list can never
  // span two people and "Select all" always means one patient's volumes.
  const [groupIndex, setGroupIndex] = useState(null);
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState(() => new Set());
  const [batch, setBatch] = useState([]);
  const [hideReceived, setHideReceived] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [confirmNewOpen, setConfirmNewOpen] = useState(false);

  const group = groupIndex === null ? null : SEND_SEARCH_GROUPS[groupIndex];
  const searched = groupIndex !== null;

  // Mock lookup: any search lands on the next patient in the fixture, so the
  // "one patient at a time, replaced by the next search" rule is visible
  // without needing real matching.
  const findNextGroup = () =>
    setGroupIndex((prev) =>
      prev === null ? 0 : (prev + 1) % SEND_SEARCH_GROUPS.length
    );

  const runSearch = (e) => {
    e?.preventDefault();
    setPicked(new Set());
    findNextGroup();
  };

  // A scan is the same search a clinician would type, minus the typing — it
  // populates the field and runs, rather than jumping straight into a batch.
  const simulateScan = () => {
    setQuery('000 111 2222');
    setPicked(new Set());
    findNextGroup();
  };

  const nextBatchNumber = () =>
    `210-${Math.floor(100000 + Math.random() * 900000)}`;

  const createBatch = () => {
    setBatchRef({ ...BATCH_REFERENCE, number: nextBatchNumber() });
    setBatch([]);
    setGroupIndex(null);
    setPicked(new Set());
    setQuery('');
  };

  const openBatch = (e) => {
    e?.preventDefault();
    if (!existingBatch.trim()) return;
    setBatchRef({ ...BATCH_REFERENCE, number: existingBatch.trim() });
    // An existing batch opens with the work already in it. The fixture stands
    // in for what the service would return.
    setBatch(
      SEND_SEARCH_GROUPS[0].volumes.slice(0, 2).map((v) => ({
        id: v.id,
        caseNo: SEND_SEARCH_GROUPS[0].crn,
        volume: v.volume,
        location: 'All sites',
        patient: SEND_SEARCH_GROUPS[0].patient,
        warnings: v.warnings,
        status: 'Pending',
        statusType: 'yellow',
      }))
    );
    setGroupIndex(null);
    setPicked(new Set());
    setQuery('');
  };

  const togglePick = (id) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const addSelectedToBatch = () => {
    if (!group) return;
    const additions = group.volumes
      .filter((v) => picked.has(v.id) && !batch.some((b) => b.id === v.id))
      .map((v) => ({
        id: v.id,
        caseNo: group.crn,
        volume: v.volume,
        location: 'All sites',
        patient: group.patient,
        warnings: v.warnings,
        status: 'Pending',
        statusType: 'yellow',
      }));
    setBatch((prev) => [...prev, ...additions]);
    setPicked(new Set());
  };

  const receiveBatch = (ids) => {
    const received = new Set(ids);
    setBatch((prev) =>
      prev.map((row) =>
        received.has(row.id) ? { ...row, status: 'Received', statusType: 'green' } : row
      )
    );
    setApproveOpen(false);
  };

  const visibleBatch = useMemo(
    () => (hideReceived ? batch.filter((r) => r.status !== 'Received') : batch),
    [batch, hideReceived]
  );

  const pendingRows = batch.filter((r) => r.status !== 'Received');

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
          <h1 className="page__title">ReceiveIT</h1>
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
            onChange={(next) => {
              setMode(next);
              // Switching mode abandons whatever was open: the two modes
              // reach different batches, so carrying one's state into the
              // other would show a batch reference the mode cannot explain.
              setBatchRef(null);
              setBatch([]);
              setGroupIndex(null);
              setPicked(new Set());
            }}
          />

          {/* Existing Batch asks one question — which batch — and nothing
              else. The settings below govern what gets added to a batch, so
              they only appear once there is one. */}
          {mode === 'existing' && !batchRef && (
            <form className="send-open-batch" onSubmit={openBatch}>
              <Autocomplete
                label="Open existing batch"
                required
                options={OPEN_BATCHES}
                value={existingBatch}
                onChange={setExistingBatch}
                onQueryChange={setExistingBatch}
                placeholder="Enter or select a batch number"
              />
              <Button type="secondary" htmlType="submit" disabled={!existingBatch.trim()}>
                Open batch
              </Button>
            </form>
          )}

          {(mode === 'new' || batchRef) && (
            <>
              <div className="send-setup__fields">
                <Select label="Receiving from" required options={SEND_RECIPIENTS} value={recipient} onChange={setRecipient} />
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
            </>
          )}

          {/* Creating is what assigns the batch number, so this is the gate:
              nothing below the settings card exists until it is pressed. It
              stays available afterwards so a second batch can be started —
              but starting one over a batch that still has unreceived notes
              discards them, so that case asks first. */}
          {mode === 'new' && (
            <Button
              type="secondary"
              size="small"
              onClick={() =>
                pendingRows.length > 0 ? setConfirmNewOpen(true) : createBatch()
              }
            >
              Create new batch
            </Button>
          )}
        </section>

        {batchRef && (
          <p className="send-batch-ref">
            <strong>Batch Details:</strong> {batchRef.number} | User{' '}
            {batchRef.user} at {batchRef.location}
          </p>
        )}

        {batchRef && (
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
              {!group ? (
                <p className="send-empty">
                  Search or scan a barcode to find case notes to add to this batch.
                </p>
              ) : (
                (() => {
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
                            setGroupIndex(null);
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
                })()
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
                  label="Hide received case notes"
                  checked={hideReceived}
                  onChange={() => setHideReceived((v) => !v)}
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
                  : 'Every case note in this batch has been received.'}
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
        )}
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

      <ApproveReceiveModal
        open={approveOpen}
        rows={pendingRows}
        onClose={() => setApproveOpen(false)}
        onReceive={receiveBatch}
      />

      <ConfirmModal
        open={confirmNewOpen}
        title="Start a new batch?"
        body={`Batch ${batchRef?.number ?? ''} still has ${pendingRows.length} case ${
          pendingRows.length === 1 ? 'note' : 'notes'
        } that have not been received. Starting a new batch discards them.`}
        confirmLabel="Discard and start new"
        onConfirm={() => {
          setConfirmNewOpen(false);
          createBatch();
        }}
        onClose={() => setConfirmNewOpen(false)}
      />
    </>
  );
}
