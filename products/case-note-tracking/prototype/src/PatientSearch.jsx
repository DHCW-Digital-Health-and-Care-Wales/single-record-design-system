import React, { useState } from 'react';
import {
  Header,
  Footer,
  SegmentedControl,
  Input,
  RadioGroup,
  Table,
  Button,
  Tag,
  Icon,
} from '@dhcw/sr-react';

import { SEARCH_RESULTS, MATCH_METHODS } from './data.js';

/**
 * Patient Search — quick / advanced search row and results.
 * Figma: U0Ugs6bG1KLzrrWdnxqcZO — 2:4437 (quick, empty), 2:3927 (advanced),
 * 2:4068 (quick, with results).
 *
 * Quick vs Advanced is a SegmentedControl, not a link or a disclosure: it
 * switches between two ways of doing the same task, both of which stay on the
 * page. Advanced *adds* fields below the shared search bar rather than
 * replacing it, so a user who has already typed an identifier does not lose it
 * when they widen the search.
 */
// The barcode banner teaches a one-time fact, so dismissing it has to stick —
// a banner that returns on every visit is not really dismissible, it just
// wastes a click. Persisted rather than held in state for that reason.
// (Storage is wrapped because a sandboxed iframe can throw on access.)
const BANNER_KEY = 'sr-cnt-barcode-banner-dismissed';
const bannerDismissed = () => {
  try { return localStorage.getItem(BANNER_KEY) === '1'; } catch { return false; }
};
const rememberBannerDismissed = () => {
  try { localStorage.setItem(BANNER_KEY, '1'); } catch { /* non-fatal */ }
};

export default function PatientSearch({ onOpenPatient }) {
  const [mode, setMode] = useState('quick');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [banner, setBanner] = useState(() => !bannerDismissed());
  const [scanned, setScanned] = useState(false);
  const [surnameMethod, setSurnameMethod] = useState('containing');
  const [forenameMethod, setForenameMethod] = useState('containing');
  const [filter, setFilter] = useState('');

  const runSearch = (e) => {
    e?.preventDefault();
    setResults(SEARCH_RESULTS);
    setScanned(false);
  };

  /**
   * Real barcode scanners are HID devices: they type the number into whatever
   * field has focus and send Enter. There is no button to press — the clinician
   * scans the wristband and the search runs. So the scan path is:
   *   populate the field -> run the search -> land on results.
   *
   * It never opens a patient, even when exactly one row comes back. The
   * original system has known duplicate records, so "one result" is not proof
   * of one patient, and auto-opening would make a scan capable of putting the
   * wrong record on screen with no human step in between. Landing on the list —
   * one row or six — keeps the choice with the clinician and costs one click.
   *
   * The visible control exists because this prototype has no scanner attached;
   * it stands in for the hardware and is not the primary path.
   */
  const simulateScan = () => {
    const scan = '098 765 4321';
    setQuery(scan);
    setResults(SEARCH_RESULTS);
    setScanned(true);
  };

  const clear = () => {
    setQuery('');
    setResults(null);
    setSurnameMethod('containing');
    setForenameMethod('containing');
  };

  const rows = results
    ? results.filter((r) => {
        if (!filter.trim()) return true;
        const q = filter.trim().toLowerCase();
        return (
          r.surname.toLowerCase().includes(q) ||
          r.forenames.toLowerCase().includes(q) ||
          r.nhs.includes(q) ||
          r.caseNo.toLowerCase().includes(q)
        );
      })
    : [];

  const columns = [
    {
      key: 'action',
      header: 'Action',
      render: (row) => (
        <button
          type="button"
          className="link-action"
          onClick={() => onOpenPatient && onOpenPatient(row)}
        >
          <Icon name="action/eye" size="xs" color="inherit" />
          <span>View</span>
          <span className="visually-hidden">
            {` ${row.surname}, ${row.forenames}`}
          </span>
        </button>
      ),
    },
    { key: 'caseNo', header: 'Case no.', sortable: true },
    { key: 'nhs', header: 'NHS no.' },
    { key: 'surname', header: 'Surname', sortable: true },
    { key: 'forenames', header: 'Forenames' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Tag type={row.statusType} size="small">{row.status}</Tag>
      ),
    },
    { key: 'dob', header: 'Birth date', sortable: true },
    { key: 'dod', header: 'Date of death' },
    { key: 'sex', header: 'Sex' },
    { key: 'postcode', header: 'Postcode' },
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
        <h1 className="page__title">Patient Search</h1>

        {banner && (
          <div className="info-banner" role="region" aria-label="Barcode scanning">
            <Icon name="action/scan" size="sm" className="info-banner__icon" />
            <p className="info-banner__text">
              <strong>Barcode scanning:</strong> Scan a wristband or notes label to run
              an automatic patient search.
            </p>
            <button
              type="button"
              className="info-banner__dismiss"
              aria-label="Dismiss barcode scanning message"
              onClick={() => {
                setBanner(false);
                rememberBannerDismissed();
              }}
            >
              <Icon name="nav/close" size="sm" color="inherit" />
            </button>
          </div>
        )}

        <form className="search-panel" onSubmit={runSearch}>
          <SegmentedControl
            ariaLabel="Search mode"
            options={[
              { label: 'Quick search', value: 'quick' },
              { label: 'Advanced', value: 'advanced' },
            ]}
            value={mode}
            onChange={setMode}
          />

          <div className="search-row">
            <div className="search-row__field">
              <Input
                type="text"
                label="Search by NHS number, case number, or patient ID"
                hideLabel
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by NHS number, case number, or patient ID"
                leadingIcon={<Icon name="nav/search" size="sm" />}
                trailingAction={
                  <button type="button" className="scan-trigger" onClick={simulateScan}>
                    <Icon name="action/scan" size="sm" color="inherit" />
                    <span className="scan-trigger__label">Scan</span>
                  </button>
                }
              />
            </div>
            <Button type="primary" htmlType="submit">Search</Button>
          </div>

          {mode === 'advanced' && (
            <>
              <div className="search-fields">
                <Input type="text" label="Date of Birth" placeholder="Enter dd-mm-yy" />
                <Input type="text" label="Surname" placeholder="Enter surname" />
                <Input type="text" label="Forename" placeholder="Enter forename" />
                <Input type="text" label="Postcode" placeholder="Enter postcode" />
              </div>

              <div className="search-methods">
                <RadioGroup
                  legend="Surname Searching Methods"
                  orientation="horizontal"
                  name="surname-method"
                  options={MATCH_METHODS}
                  value={surnameMethod}
                  onChange={setSurnameMethod}
                />
                <RadioGroup
                  legend="Forename Searching Methods"
                  orientation="horizontal"
                  name="forename-method"
                  options={MATCH_METHODS}
                  value={forenameMethod}
                  onChange={setForenameMethod}
                />
              </div>

              <div className="search-actions">
                <Button type="primary" htmlType="submit">Search</Button>
                <Button type="secondary" onClick={clear}>Clear</Button>
              </div>
            </>
          )}
        </form>

        {results && (
          <section className="results" aria-label="Search results">
            {/* A scan can return several rows because of known duplicate records
                in the source system. Saying so at the point of choosing is the
                difference between "the system is broken" and "pick carefully". */}
            {rows.length > 1 && (
              <p className="results__warning">
                <Icon name="status/warning" size="sm" className="results__warning-icon" />
                <span>
                  More than one record matched. Duplicates exist in the source system —
                  check date of birth and postcode before opening a record.
                </span>
              </p>
            )}
            <div className="results__bar">
              <p className="results__count" role="status">
                <strong>{rows.length}</strong>{' '}
                {rows.length === 1 ? 'patient' : 'patients'} found
                {scanned && ' from scan'}
              </p>
              <div className="results__filter">
                <Input
                  type="text"
                  label="Filter results"
                  hideLabel
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Search"
                  leadingIcon={<Icon name="nav/search" size="sm" />}
                />
              </div>
            </div>
            <Table
              caption="Patients matching your search"
              columns={columns}
              rows={rows}
            />
            {rows.length === 0 && (
              <p className="results__empty">
                No patients match that filter. Clear it to see all results.
              </p>
            )}
          </section>
        )}
      </main>

      <Footer version="v 0.1.0.1112" />
    </>
  );
}
