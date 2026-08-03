/**
 * Mock data only. There is no API, no auth and no persistence in this prototype.
 * Dates use the short form `10 Mar 2026` (space-constrained UI) per DESIGN-SYSTEM.md.
 */
export const PATIENT = {
  name: 'JOHN, Elvet George (Mr)',
  flag: 'Deceased',
  nhsNumber: '000 111 2222',
  crn: 'M8046459',
  address: 'Penrhiw, Gwynfe Llangadog, Dyfed, SA19 9PU',
  postcode: 'SA19 9PU',
  dob: '15 Dec 1992 (33y)',
  dod: '23 Jun 2025',
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
  { id: 1, caseNo: PATIENT.crn, nhs: PATIENT.nhsNumber, surname: 'JOHN', forenames: 'Elvet George', status: 'Deceased', statusType: 'red', dob: '15 Dec 1992', dod: '23 Jun 2025', sex: 'Male', postcode: PATIENT.postcode },
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
