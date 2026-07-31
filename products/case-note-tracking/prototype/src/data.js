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

export const NAV_SECTIONS = [
  { label: 'Home', items: [{ icon: 'nav/dashboard', label: 'Dashboard' }] },
  {
    label: 'Patients',
    items: [
      { icon: 'nav/search', label: 'Patient Search' },
      { icon: 'clinical/record', label: 'Case Note Tracking' },
      { icon: 'schedule/waiting-list', label: 'Watchlists' },
    ],
  },
];

export const NAV_FOOTER = [
  { icon: 'nav/settings', label: 'Settings' },
  { icon: 'clinical/discharge', label: 'Log Out' },
];

export const NOTES = [
  { id: 1, siteId: 'ggh', volume: 'General notes vol 4', status: 'Registered', statusType: 'blue',  location: 'Madog Suite-GGH',   activity: 'Registered by Gadgil, AA(Mr)', moved: '09 Jun 2026 15:25', batch: '50381858' },
  { id: 2, siteId: 'ggh', volume: 'General notes vol 3', status: 'Sent',       statusType: 'grey',  location: 'Teifi Ward-GGH',    activity: 'Sent by Gadgil, AA(Mr)',       moved: '05 Jun 2026 17:40', batch: '-' },
  { id: 3, siteId: 'ggh', volume: 'General notes vol 2', status: 'Received',   statusType: 'green', location: 'Cleddau Ward-GGH',  activity: 'Received by Gadgil, AA(Mr)',   moved: '05 Jun 2026 17:40', batch: '-' },
  { id: 4, siteId: 'wgh', volume: 'General notes vol 2', status: 'Tagged',     statusType: 'yellow',location: 'A&E Dept-GGH',      activity: 'Tagged by Gadgil, AA(Mr)',     moved: '05 Jun 2026 17:40', batch: '-' },
  { id: 5, siteId: 'wgh', volume: 'General notes vol 1', status: 'Inactive',   statusType: 'red',   location: 'A&E Dept-GGH',      activity: 'Archived by Gadgil, AA(Mr)',   moved: '02 Jun 2026 09:10', batch: '-' },
];
