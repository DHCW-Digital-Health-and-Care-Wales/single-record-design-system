/**
 * Mock data only. There is no API, no auth and no persistence in this prototype.
 * Dates use the short form `10 Mar 2026` (space-constrained UI) per DESIGN-SYSTEM.md.
 */
// Alive. `flag` and `dod` are omitted rather than set to falsy values —
// PatientBanner only renders either when present, and the deceased flag/date
// pairing is the one status this prototype currently models. Other non-alive
// statuses (e.g. discharged) are potential future work, not implemented here.
export const PATIENT = {
  name: 'JOHN, Elvet George (Mr)',
  nhsNumber: '000 111 2222',
  crn: 'M8046459',
  address: 'Penrhiw, Gwynfe Llangadog, Dyfed, SA19 9PU',
  postcode: 'SA19 9PU',
  dob: '15 Dec 1992 (33y)',
  sex: 'Male',
};

export const REACTIONS = [
  { substance: 'Peanut', reaction: 'Anaphylaxis' },
  { substance: 'Benzylpenicilloyl polylysine', reaction: 'Anaphylaxis' },
];

export const SITES = [
  { value: 'all', label: 'All Sites' },
  { value: 'ggh', label: 'Glangwili General Hospital' },
  { value: 'wgh', label: 'Withybush General Hospital' },
];

export const NOTE_TYPES = [
  { value: 'general', label: 'General notes' },
  { value: 'maternity', label: 'Maternity notes' },
  { value: 'oncology', label: 'Oncology notes' },
];

// Flat list, no section groups — matches Figma's sidebar on the dashboard
// screen (2:3875), which is Type=Linear, not Sectioned.
export const NAV_SECTIONS = [
  {
    label: 'Primary',
    items: [
      { icon: 'nav/dashboard', label: 'Dashboard' },
      { icon: 'nav/search', label: 'Patient Search' },
      { icon: 'nav/sort', label: 'My Requests' },
      { icon: 'action/send', label: 'SendIT' },
      { icon: 'action/download', label: 'ReceiveIT' },
      { icon: 'file/attachment', label: 'TagIT' },
    ],
  },
];

export const NAV_FOOTER = [
  { icon: 'nav/settings', label: 'Settings' },
  { icon: 'clinical/discharge', label: 'Log Out' },
];

export const STATS = [
  { label: 'Patients on System', value: '24', icon: 'clinical/vitals', accent: 'blue', note: '+10% This month', noteAccent: 'success' },
  { label: 'Total Casenotes', value: '8', icon: 'nav/sort', accent: 'blue', note: 'In all sites', noteAccent: 'neutral' },
  { label: 'In Transit', value: '42', icon: 'action/send', accent: 'warning', note: 'Pending Receipt', noteAccent: 'warning' },
  { label: 'Missing / Escalated', value: '24', icon: 'status/warning', accent: 'critical', note: 'Requires attention', noteAccent: 'critical' },
];

// Descriptions stay to a single short line — Figma draws these cards at 64px
// with one line of supporting text, and a wrapped second line breaks the row.
export const QUICK_ACTIONS = [
  { icon: 'nav/search', label: 'Patient Search', description: 'Find a patient', view: 'patient-search' },
  { icon: 'action/add', label: 'Create Case Note', description: 'Register a new volume' },
  { icon: 'action/send', label: 'Batch SendIT', description: 'Send a batch' },
  { icon: 'action/download', label: 'Batch ReceiveIT', description: 'Receive a batch' },
];

export const NEEDS_ATTENTION = [
  { volume: 'General notes Vol 4', patient: 'GARETH, EVANS JAMES', location: 'Madog Suite-GGH', weeks: '32 weeks', status: 'Missing', statusType: 'red' },
  { volume: 'General notes Vol 3', patient: 'ADE, LOLADE', location: 'Madog Suite-GGH', weeks: '32 weeks', status: 'Delayed', statusType: 'yellow' },
  { volume: 'General notes Vol 3', patient: 'ADE, LOLADE', location: 'Madog Suite-GGH', weeks: '32 weeks', status: 'Delayed', statusType: 'yellow' },
  { volume: 'General notes Vol 4', patient: 'ADAMS, AMY TINA', location: 'Madog Suite-GGH', weeks: '32 weeks', status: 'Missing', statusType: 'red' },
];

export const IN_TRANSIT = [
  {
    group: 'Today',
    rows: [
      { volume: 'General notes Vol 4', location: 'Madog Suite-GGH', clinician: 'Dr. Abigail Rufus', time: '12:00pm' },
      { volume: 'General notes Vol 4', location: 'Madog Suite-GGH', clinician: 'Dr. Abigail Rufus', time: '12:00pm' },
    ],
  },
  {
    group: 'Yesterday',
    rows: [
      { volume: 'General notes Vol 4', location: 'Madog Suite-GGH', clinician: 'Dr. Abigail Rufus', time: '12:00pm' },
    ],
  },
  {
    group: 'April 16, 2026',
    rows: [
      { volume: 'General notes Vol 4', location: 'Madog Suite-GGH', clinician: 'Dr. Abigail Rufus', time: '12:00pm' },
      { volume: 'General notes Vol 4', location: 'Madog Suite-GGH', clinician: 'Dr. Abigail Rufus', time: '12:00pm' },
    ],
  },
];

/**
 * Patient search results (Figma 2:4068).
 *
 * Two corrections to the Figma mock, both flagged in decisions/handoff.md:
 *  - The results table there has two columns both headed "Birth date". The
 *    second only carries a value on the Deceased row, so it is Date of death.
 *  - Surname/Forenames are transposed in several rows (e.g. Surname "JANE",
 *    Forenames "DOE"), and every row reads Sex "Male" including AVA and JANE.
 *
 * Row 1 is deliberately the same person as PATIENT (data.js) — "View" always
 * opens the one casenote screen this prototype has, so the row it opens from
 * should read as the same patient rather than a different one.
 */
export const SEARCH_RESULTS = [
  { id: 1, caseNo: PATIENT.crn, nhs: PATIENT.nhsNumber, surname: 'JOHN', forenames: 'Elvet George', status: 'Active', statusType: 'green', dob: '15 Dec 1992', dod: '-', sex: 'Male', postcode: PATIENT.postcode },
  { id: 2, caseNo: 'NN54242', nhs: '098 765 4321', surname: 'DAVIS',    forenames: 'JONATHAN PAUL', status: 'Active',   statusType: 'green', dob: '14 Jan 2000', dod: '-',           sex: 'Male',   postcode: 'M1 1AE' },
  { id: 3, caseNo: 'NN24312', nhs: '098 765 4321', surname: 'NOAH',     forenames: 'DAVIS',         status: 'Active',   statusType: 'green', dob: '28 Jun 1988', dod: '-',           sex: 'Male',   postcode: 'G1 2FF' },
  { id: 4, caseNo: 'CN032412', nhs: '098 765 4321', surname: 'MARTINEZ', forenames: 'AVA',          status: 'Active',   statusType: 'green', dob: '21 Sep 1969', dod: '-',           sex: 'Female', postcode: 'BT7 1NN' },
  { id: 5, caseNo: 'CN723283', nhs: '098 765 4321', surname: 'DOE',      forenames: 'JANE',         status: 'Deceased', statusType: 'red',   dob: '30 Apr 1995', dod: '15 Nov 2025', sex: 'Female', postcode: 'W1A 0AX' },
];

/**
 * Surname and forename each get their own matching mode. Figma labels the
 * second group "Forename Searching Methods" but lists See and treat / Rapid
 * assessment / Triage — triage categories pasted in from another screen. The
 * surname options are used for both here; flagged in the handoff.
 */
export const MATCH_METHODS = [
  { value: 'containing', label: 'Containing' },
  { value: 'exact', label: 'Exact Match' },
  { value: 'sounds', label: 'Sounds Like' },
];

export const NOTES = [
  { id: 1, siteId: 'ggh', volume: 'General notes vol 4', status: 'Registered', statusType: 'blue',  location: 'Madog Suite-GGH',   activity: 'Registered by Gadgil, AA(Mr)', moved: '09 Jun 2026 15:25', batch: '50381858' },
  { id: 2, siteId: 'ggh', volume: 'General notes vol 3', status: 'Sent',       statusType: 'grey',  location: 'Teifi Ward-GGH',    activity: 'Sent by Gadgil, AA(Mr)',       moved: '05 Jun 2026 17:40', batch: '-' },
  { id: 3, siteId: 'ggh', volume: 'General notes vol 2', status: 'Received',   statusType: 'green', location: 'Cleddau Ward-GGH',  activity: 'Received by Gadgil, AA(Mr)',   moved: '05 Jun 2026 17:40', batch: '-' },
  { id: 4, siteId: 'wgh', volume: 'General notes vol 2', status: 'Tagged',     statusType: 'yellow',location: 'A&E Dept-GGH',      activity: 'Tagged by Gadgil, AA(Mr)',     moved: '05 Jun 2026 17:40', batch: '-' },
  { id: 5, siteId: 'wgh', volume: 'General notes vol 1', status: 'Inactive',   statusType: 'red',   location: 'A&E Dept-GGH',      activity: 'Archived by Gadgil, AA(Mr)',   moved: '02 Jun 2026 09:10', batch: '-' },
];

/**
 * My Requests (Figma 127:4813) — cross-patient, unlike NOTES which is scoped
 * to one patient's casenote view. `tab` groups rows under the All/Sent/
 * Received filter on that screen. Patient names reuse the ones already on
 * the dashboard's Needs Attention list where they overlap (Gareth Evans James,
 * Ade Lolade, Adams Amy) rather than inventing a second spelling of the same
 * person.
 */
export const MY_REQUESTS = [
  { id: 1, volume: 'General notes vol 4', patient: 'GARETH, Evans James', status: 'Sent', statusType: 'grey', tab: 'sent', location: 'Madog Suite-GGH', activity: 'Sent to Tarnia Warlow at Madog Suite-GGH (Carmarthen Locality)', moved: '09 Jun 2026 15:25', clinicDate: '03 Jul 2026', batch: '50381858' },
  { id: 2, volume: 'General notes vol 4', patient: 'ADE, Lolade', status: 'Sent', statusType: 'grey', tab: 'sent', location: 'Teifi Ward-GGH', activity: 'Sent to Tarnia Warlow at Teifi Ward-GGH (Carmarthen Locality)', moved: '05 Jun 2026 17:40', clinicDate: '03 Jul 2026', batch: '-' },
  { id: 3, volume: 'General notes vol 4', patient: 'PRICE, Carys', status: 'Received', statusType: 'green', tab: 'received', location: 'Cleddau Ward-GGH', activity: 'Received by Gadgil, AA(Mr) at Cleddau Ward-GGH', moved: '05 Jun 2026 17:40', clinicDate: '03 Jul 2026', batch: '-' },
  { id: 4, volume: 'General notes vol 4', patient: 'ADAMS, Amy Tina', status: 'Received', statusType: 'green', tab: 'received', location: 'A&E Dept-GGH', activity: 'Registered by Gadgil, AA(Mr) at A&E Dept-GGH', moved: '05 Jun 2026 17:40', clinicDate: '03 Jul 2026', batch: '-' },
  { id: 5, volume: 'General notes vol 4', patient: 'OWEN, Rhys', status: 'Sent', statusType: 'grey', tab: 'sent', location: 'A&E Dept-GGH', activity: 'Registered by Gadgil, AA(Mr) at A&E Dept-GGH', moved: '05 Jun 2026 17:40', clinicDate: '03 Jul 2026', batch: '-' },
];

/* ─── SendIT batch (Figma 192:4901, 341:9165, 341:9673, 279:22906, 287:23848) ─── */

export const SEND_RECIPIENTS = [
  { value: 'howarth', label: 'Howarth, AJ' },
  { value: 'warlow', label: 'Warlow, Tarnia' },
  { value: 'gadgil', label: 'Gadgil, AA (Mr)' },
];

export const SELECTION_METHODS = [
  { value: 'last', label: 'Last' },
  { value: 'all', label: 'All' },
  { value: 'earliest', label: 'Earliest' },
];

export const ADD_INFO_METHODS = [
  { value: 'batch', label: 'Batch' },
  { value: 'individual', label: 'Individual' },
];

export const CASENO_SORTS = [
  { value: 'caseno', label: 'Caseno (sort)' },
  { value: 'volume', label: 'Volume' },
  { value: 'location', label: 'Location' },
];

export const SEND_CASE_NOTE_TYPES = [
  { value: 'all', label: 'All' },
  ...NOTE_TYPES,
];

/**
 * Batches already open for this user, offered in the Existing Batch
 * combobox (Figma 448:8420). The field is an Autocomplete, not a Select,
 * because the screen has to accept a number read off a printed label as well
 * as one picked from the list.
 */
export const OPEN_BATCHES = [
  { value: '210-792749', label: '210-792749 (5 case notes)' },
  { value: '210-792812', label: '210-792812 (2 case notes)' },
  { value: '210-793004', label: '210-793004 (8 case notes)' },
];

export const BATCH_REFERENCE = {
  number: '210-792749',
  user: 'CH252832',
  location: 'AE Department GGH',
};

/**
 * Search results in SendIT's "Find case notes" panel, grouped by patient
 * (Figma 341:9165). One group per patient; `volumes` are that patient's
 * casenote volumes, each addable to the batch.
 *
 * The case-note number belongs to the **patient**, not the volume: a patient
 * has one case record and its volumes are numbered within it. Figma's Batch
 * Summary gives every row a different case number and a different patient
 * while the search panel above it shows one patient's four volumes, which
 * cannot both be true — confirmed as placeholder data, so volumes here take
 * their patient's number and each patient's volumes stay with that patient.
 *
 * Two patients, because a batch is genuinely cross-patient: you search for
 * each in turn and add volumes from each, which is what fills the summary
 * table with more than one name.
 *
 * `warnings` drive the approval modal (279:22906): a volume with warnings
 * cannot be sent until they are acknowledged. Only the two Vol 4s carry any,
 * which is what makes the modal's "0 errors, N warnings" state reachable and
 * still leaves warning-free rows to contrast against.
 */
export const SEND_SEARCH_GROUPS = [
  {
    id: 'p1',
    patient: PATIENT.name,
    nhs: PATIENT.nhsNumber,
    dob: PATIENT.dob,
    crn: PATIENT.crn,
    volumes: [
      {
        id: 'p1-v4', volume: 'General notes vol 4',
        location: 'A&E Department-GGH', moved: '26 Jun 2026 12:02',
        status: 'Registered', statusType: 'blue',
        warnings: [
          'Temporary notes exist for this patient',
          'Case note volume is held at a different location',
        ],
      },
      {
        id: 'p1-v3', volume: 'General notes vol 3',
        location: 'Madog Suite-GGH', moved: '06 Apr 2026 12:02',
        status: 'Sent', statusType: 'grey', warnings: [],
      },
      {
        id: 'p1-v2', volume: 'General notes vol 2',
        location: 'Madog Suite-GGH', moved: '11 Mar 2026 12:02',
        status: 'Sent', statusType: 'grey', warnings: [],
      },
      {
        id: 'p1-v1', volume: 'General notes vol 1',
        location: 'Teifi Ward-GGH', moved: '02 Jan 2026 12:02',
        status: 'Sent', statusType: 'grey', warnings: [],
      },
    ],
  },
  {
    id: 'p2',
    patient: 'EVANS, Paul (Mr)',
    nhs: '098 765 4321',
    dob: '14 Jan 2000 (26y)',
    crn: 'NN90212',
    volumes: [
      {
        id: 'p2-v2', volume: 'General notes vol 2',
        location: 'Cleddau Ward-GGH', moved: '18 May 2026 09:40',
        status: 'Registered', statusType: 'blue',
        warnings: ['Case note volume is held at a different location'],
      },
      {
        id: 'p2-v1', volume: 'General notes vol 1',
        location: 'Cleddau Ward-GGH', moved: '03 Feb 2026 14:15',
        status: 'Sent', statusType: 'grey', warnings: [],
      },
    ],
  },
];
