#!/usr/bin/env node
/**
 * demo-patients.mjs
 *
 * The fictional patients every Single Record design, prototype and demo uses,
 * and the checks that keep them correct. Writes:
 *
 *   docs/content/demo-patients.json   for prototypes and code
 *   docs/content/demo-patients.md     for designers (display-ready values)
 *
 *   node scripts/demo-patients.mjs          check, then write both files
 *   node scripts/demo-patients.mjs --check  check, and fail if the files are stale
 *
 * Every rule checked here comes from docs/content/data-standards.md, which
 * cites its source. A patient that breaks a rule fails the build, so demo data
 * cannot drift the way hand-typed Figma text does.
 *
 * Ages are worked out from AS_OF, not from today, so the files do not change
 * every day. Move AS_OF forward when the demo data is refreshed.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'content');
const AS_OF = '2026-10-30';

// ── The patients ─────────────────────────────────────────────────────────────
// Stored as the dictionary stores them (codes, ISO dates); displayed by the
// formatters below. nhsBase is the first nine digits: the check digit is
// computed, never typed. All start 999, the range the NHS service manual says
// is never given to real patients.
//
// Each patient exists to test something a design must cope with: see `tests`.
const PATIENTS = [
  {
    id: 'ruby-adams', nhsBase: '999000001', crn: 'A000101A',
    title: 'Miss', surname: 'ADAMS', forenames: 'Ruby',
    dob: '2014-10-03', sex: 'F', gender: 'F', marital: null, ethnicity: 'A',
    language: 'English', interpreter: false,
    address: ['7 Pearse Close', 'Bullion Drive', 'Cardiff'], postcode: 'CF14 2AB',
    phones: { mobile: '07700 900123', home: '029 2018 0001' }, email: null,
    gp: 'practice-llandaff',
    tests: 'Child. The patient already used in the mobile designs.',
  },
  {
    id: 'llyr-ap-gruffudd', nhsBase: '999000002', crn: 'B000202B',
    title: 'Mr', surname: 'ap GRUFFUDD', forenames: 'Llŷr Owain',
    dob: '1958-02-14', sex: 'M', gender: 'M', marital: '21', ethnicity: 'A',
    language: 'Welsh', interpreter: false,
    address: ['Bryn Teg', 'Ffordd y Môr', 'Aberystwyth'], postcode: 'SY23 1AB',
    phones: { mobile: '07700 900234', home: null }, email: null,
    gp: 'practice-aber',
    tests: 'Welsh name with a lower-case particle and a circumflex. Welsh as preferred language. House name with no number.',
  },
  {
    id: 'sian-obrien', nhsBase: '999000003', crn: 'C000303C',
    title: 'Mrs', surname: "O'BRIEN", forenames: 'Siân',
    dob: '1979-07-22', sex: 'F', gender: 'F', marital: '21', ethnicity: 'A',
    language: 'English', interpreter: false,
    address: ['14 Heol y Coed', 'Newport'], postcode: 'NP20 4AB',
    phones: { mobile: '07700 900345', home: '029 2018 0003' }, email: 'sian.obrien@example.com',
    gp: 'practice-newport',
    tests: 'Apostrophe in the surname and an accent in the forename, both kept on screen.',
  },
  {
    id: 'mari-jones-davies', nhsBase: '999000004', crn: 'D000404D',
    title: 'Ms', surname: 'JONES-DAVIES', forenames: 'Mari Elin',
    dob: '1990-01-01', sex: 'F', gender: 'F', marital: '11', ethnicity: 'A',
    language: 'English', interpreter: false,
    address: ['Flat 3', '22 Walter Road', 'Swansea'], postcode: 'SA1 5AB',
    phones: { mobile: '07700 900456', home: null }, email: null,
    gp: 'practice-swansea',
    tests: 'Double-barrelled surname. Flat as the first address line.',
  },
  {
    id: 'thi-lan-nguyen', nhsBase: '999000005', crn: 'A000505A',
    title: 'Mrs', surname: 'NGUYEN', forenames: 'Thi Lan',
    dob: '1966-09-09', sex: 'F', gender: 'F', marital: '41', ethnicity: 'L',
    language: 'Vietnamese', interpreter: true,
    address: ['31 Clifton Street', 'Cardiff'], postcode: 'CF24 1AB',
    phones: { mobile: '07700 900567', home: null }, email: null,
    gp: 'practice-llandaff',
    tests: 'Needs an interpreter. Widowed.',
  },
  {
    id: 'imran-khan', nhsBase: '999000006', crn: 'A000606A',
    title: 'Mr', surname: 'KHAN', forenames: 'Imran',
    dob: '1984-11-30', sex: 'M', gender: 'M', marital: '21', ethnicity: 'J',
    language: 'English', interpreter: false,
    address: ['5 Queen Street', 'Cardiff'], postcode: 'CF10 2AB',
    phones: { mobile: '07700 900678', home: '029 2018 0006' }, email: 'imran.khan@example.com',
    gp: 'practice-llandaff',
    tests: 'Short name, every field filled: the control case.',
  },
  {
    id: 'alex-morgan', nhsBase: '999000008', crn: 'D000808D',
    title: 'Mx', surname: 'MORGAN', forenames: 'Alex',
    dob: '2001-05-17', sex: null, gender: 'N', marital: '11', ethnicity: 'D',
    language: 'English', interpreter: false,
    address: ['9 High Street', 'Bridgend'], postcode: 'CF31 1AB',
    phones: { mobile: '07700 900789', home: null }, email: null,
    gp: 'practice-swansea',
    tests: 'Non-binary gender identity, title Mx. Sex is not held in the demographic record (Core Reference Data: stored separately).',
  },
  {
    id: 'gwyneth-price', nhsBase: '999000009', crn: 'B000909B',
    title: 'Mrs', surname: 'PRICE', forenames: 'Gwyneth',
    dob: '1931-03-02', sex: 'F', gender: 'F', marital: '41', ethnicity: 'A',
    language: 'Welsh', interpreter: false,
    address: ['Ty Gwyn', 'Heol Llanfaes', 'Brecon'], postcode: 'LD3 8AB',
    phones: { mobile: null, home: '029 2018 0009' }, email: null,
    gp: 'practice-aber',
    tests: 'Aged over 90. No mobile number.',
  },
  {
    id: 'elizabeth-hughes-ap-rhys', nhsBase: '999000010', crn: 'C001010C',
    title: 'Dr', surname: 'HUGHES-AP RHYS', forenames: 'Elizabeth Anne Gwenllian Margaret',
    dob: '1962-12-12', sex: 'F', gender: 'F', marital: '31', ethnicity: 'A',
    language: 'English', interpreter: false,
    address: ['Apartment 12', 'Celestia', 'Mermaid Quay', 'Cardiff Bay', 'Cardiff'], postcode: 'CF10 5AB',
    phones: { mobile: '07700 900890', home: null }, email: 'e.hughes-aprhys@example.com',
    gp: 'practice-llandaff',
    tests: 'Long name: tests wrapping and truncation (truncate forenames, never the surname). Five address lines, the maximum.',
  },
  {
    id: 'daniel-evans', nhsBase: '999000011', crn: 'A001111A',
    title: null, surname: 'EVANS', forenames: 'Daniel',
    dob: null, sex: 'M', gender: 'Z', marital: '91', ethnicity: 'Z',
    language: null, interpreter: false,
    address: [], postcode: 'ZZ99 3VZ',
    phones: { mobile: null, home: null }, email: null,
    gp: null,
    tests: 'Unknowns: no fixed abode, date of birth not known, no GP, no title, nothing to contact. Every empty value must read "Not known" or "Not recorded", never a blank.',
  },
];

const GP_PRACTICES = {
  'practice-llandaff': { code: 'W99001', name: 'Llandaff North Medical Centre', gp: 'Dr Sian JONES', phone: '029 2018 0100', address: ['12 Station Road', 'Cardiff'], postcode: 'CF14 2FB' },
  'practice-aber':     { code: 'W99002', name: 'Canolfan Iechyd Aberystwyth', gp: 'Dr Rhodri LEWIS', phone: '029 2018 0200', address: ['Ffordd y Parc', 'Aberystwyth'], postcode: 'SY23 2AB' },
  'practice-newport':  { code: 'W99003', name: 'Malpas Road Surgery', gp: 'Dr Amira HASSAN', phone: '029 2018 0300', address: ['80 Malpas Road', 'Newport'], postcode: 'NP20 5AB' },
  'practice-swansea':  { code: 'W99004', name: 'Uplands Health Centre', gp: 'Dr Tom WATKINS', phone: '029 2018 0400', address: ['3 Gwydr Square', 'Swansea'], postcode: 'SA2 0AB' },
};

// ── Value sets (docs/content/data-standards.md, with its sources) ────────────
const SEX = { F: 'Female', M: 'Male', U: 'Indeterminate', Z: 'Not disclosed or unknown' };
const GENDER = { F: 'Female', M: 'Male', N: 'Non-binary', Z: 'Not disclosed or unknown' };
const MARITAL = { 11: 'Single', 12: 'Cohabiting', 21: 'Married', 22: 'Civil partner', 31: 'Divorced', 32: 'Person whose civil partnership has been dissolved', 41: 'Widowed', 42: 'Surviving civil partner', 51: 'Separated', 91: 'Not disclosed or unknown' };
const ETHNICITY = { A: 'White: Welsh, English, Scottish, Northern Irish, British or Irish', B: 'Gypsy or Irish Traveller', D: 'White and Black Caribbean', E: 'White and Black African', F: 'White and Asian', G: 'Any other mixed or multiple ethnic background', H: 'Indian', J: 'Pakistani', K: 'Bangladeshi', R: 'Chinese', L: 'Any other Asian background', M: 'Caribbean', N: 'African', P: 'Any other Black background', T: 'Arab', S: 'Any other ethnic group', Z: 'Not stated' };
const TITLES = ['Admr', 'Baron', 'Brig', 'Bshp', 'Can', 'Capt', 'Col', 'Dame', 'Dr', 'Ftr', 'Lady', 'Lord', 'Miss', 'Mjr', 'Mr', 'Mrs', 'Ms', 'Mstr', 'Mx', 'Prof', 'Rev', 'Sgt', 'Sir', 'Sstr'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ── Rules ────────────────────────────────────────────────────────────────────
/** Modulus 11 check digit (data-dictionary/nhsnumber.txt). null = invalid base. */
export function nhsCheckDigit(nine) {
  const sum = [...nine].reduce((s, d, i) => s + Number(d) * (10 - i), 0);
  const c = 11 - (sum % 11);
  return c === 11 ? 0 : c === 10 ? null : c;
}
const POSTCODE = /^(?:[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}|ZZ99 \d[A-Z]Z)$/;
const PHONE = /^(?:07700 900\d{3}|029 2018 0\d{3})$/;   // Ofcom drama ranges (Unverified in data-standards.md)
const CRN = /^[A-Z0-9]{1,10}$/;

function ageOn(dob, on) {
  const [y, m, d] = dob.split('-').map(Number);
  const [Y, M, D] = on.split('-').map(Number);
  return Y - y - (M < m || (M === m && D < d) ? 1 : 0);   // whole years (data-dictionary/age.txt)
}
const displayDate = (iso) => { const [y, m, d] = iso.split('-').map(Number); return `${d} ${MONTHS[m - 1]} ${y}`; };
const displayNhs = (n) => `${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}`;

const problems = [];
const fail = (p, msg) => problems.push(`${p.id}: ${msg}`);

for (const p of PATIENTS) {
  const c = nhsCheckDigit(p.nhsBase);
  if (!/^999\d{6}$/.test(p.nhsBase)) fail(p, 'NHS number must be in the 999 test range');
  if (c === null) fail(p, `NHS number base ${p.nhsBase} has no valid check digit (remainder 10); pick another`);
  if (!CRN.test(p.crn)) fail(p, `CRN "${p.crn}" is not up to 10 letters and digits`);
  if (p.title && !TITLES.includes(p.title)) fail(p, `title "${p.title}" is not a Core Reference Data title`);
  if (p.surname !== p.surname.toUpperCase() && !/^(ap|ab|ferch|verch) [A-Z' -]+$/.test(p.surname)) fail(p, 'surname must be in capitals');
  if (p.surname.length > 35 || p.forenames.length > 35) fail(p, 'surname and forenames are 35 characters at most');
  if (p.dob && (p.dob > AS_OF || Number.isNaN(Date.parse(p.dob)))) fail(p, `date of birth ${p.dob} is not a past date`);
  if (p.sex !== null && !SEX[p.sex]) fail(p, `sex "${p.sex}" is not F, M, U or Z`);
  if (p.sex === 'U' && p.dob && ageOn(p.dob, AS_OF) > 0) fail(p, 'sex U (Indeterminate) is only for a baby whose sex is not yet known');
  if (!GENDER[p.gender]) fail(p, `gender identity "${p.gender}" is not F, M, N or Z`);
  if (p.marital && !MARITAL[p.marital]) fail(p, `marital status "${p.marital}" is not a Core Reference Data code`);
  if (!ETHNICITY[p.ethnicity]) fail(p, `ethnic group "${p.ethnicity}" is not a Core Reference Data code`);
  if (!POSTCODE.test(p.postcode)) fail(p, `postcode "${p.postcode}" is not in capitals with one space`);
  if (p.address.length > 5 || p.address.some((l) => l.length > 35)) fail(p, 'address is 5 lines of 35 characters at most');
  if (p.postcode === 'ZZ99 3VZ' && p.address.length) fail(p, 'no fixed abode (ZZ99 3VZ) should have no address lines');
  for (const n of Object.values(p.phones)) if (n && !PHONE.test(n)) fail(p, `phone "${n}" is not in an Ofcom drama range`);
  if (p.email && !p.email.endsWith('@example.com')) fail(p, `email "${p.email}" must use example.com`);
  if (p.gp && !GP_PRACTICES[p.gp]) fail(p, `unknown GP practice "${p.gp}"`);
}
const nhs = PATIENTS.map((p) => p.nhsBase);
if (new Set(nhs).size !== nhs.length) problems.push('two patients share an NHS number');
for (const [k, g] of Object.entries(GP_PRACTICES)) {
  if (!/^W\d{5}$/.test(g.code)) problems.push(`${k}: practice code "${g.code}" is not W plus 5 digits`);
  if (!PHONE.test(g.phone) || !POSTCODE.test(g.postcode)) problems.push(`${k}: phone or postcode format`);
}

if (problems.length) {
  console.error(`\ndemo-patients: ${problems.length} problem(s)\n`);
  for (const m of problems) console.error(`  ✗ ${m}`);
  console.error('\nRules and sources: docs/content/data-standards.md\n');
  process.exit(1);
}

// ── Output ───────────────────────────────────────────────────────────────────
const NOT_KNOWN = 'Not known';
const NOT_RECORDED = 'Not recorded';
const records = PATIENTS.map((p) => {
  const nhsNumber = p.nhsBase + nhsCheckDigit(p.nhsBase);
  const gp = p.gp ? GP_PRACTICES[p.gp] : null;
  return {
    id: p.id,
    tests: p.tests,
    stored: { nhsNumber, crn: p.crn, title: p.title, surname: p.surname, forenames: p.forenames, dateOfBirth: p.dob, sex: p.sex, genderIdentity: p.gender, maritalStatus: p.marital, ethnicGroup: p.ethnicity, preferredLanguage: p.language, interpreterRequired: p.interpreter, address: p.address, postcode: p.postcode, phones: p.phones, email: p.email, gpPracticeCode: gp?.code ?? null },
    display: {
      name: `${p.surname}, ${p.forenames}${p.title ? ` (${p.title})` : ''}`,
      nhsNumber: displayNhs(nhsNumber),
      crn: `CRN ${p.crn}`,
      dateOfBirth: p.dob ? `${displayDate(p.dob)} (${ageOn(p.dob, AS_OF)} years)` : NOT_KNOWN,
      sex: p.sex ? SEX[p.sex] : null,
      genderIdentity: GENDER[p.gender],
      maritalStatus: p.marital ? MARITAL[p.marital] : NOT_RECORDED,
      ethnicGroup: ETHNICITY[p.ethnicity],
      preferredLanguage: p.language ?? NOT_KNOWN,
      interpreter: p.interpreter ? 'Interpreter required' : 'Not required',
      address: p.postcode === 'ZZ99 3VZ' ? ['No fixed abode'] : [...p.address, p.postcode],
      mobile: p.phones.mobile ?? NOT_RECORDED,
      homePhone: p.phones.home ?? NOT_RECORDED,
      email: p.email ?? NOT_RECORDED,
      gp: gp ? { name: gp.gp, practice: `${gp.name} (${gp.code})`, phone: gp.phone, address: [...gp.address, gp.postcode] } : NOT_RECORDED,
    },
  };
});

const json = `${JSON.stringify({ asOf: AS_OF, source: 'scripts/demo-patients.mjs', rules: 'docs/content/data-standards.md', patients: records }, null, 2)}\n`;

const row = (r) => `| ${r.display.name} | ${r.display.nhsNumber} | ${r.display.dateOfBirth} | ${r.display.sex ?? 'Not held (see note)'} | ${r.display.genderIdentity} | ${r.display.address.join(', ')} | ${r.tests} |`;
const md = `# Demo patients

Fictional patients for every Single Record design, prototype and demo. Use these instead of
making names and numbers up: each one passes the rules in
[\`data-standards.md\`](./data-standards.md), and each is there to test something a design must
cope with.

**Do not edit this file.** It is generated by \`scripts/demo-patients.mjs\`, which checks every
value; change the patients there. Ages are as at ${displayDate(AS_OF)}. The same data, with stored
codes, is in [\`demo-patients.json\`](./demo-patients.json) for prototypes.

| Name | NHS number | Date of birth | Sex | Gender | Address | Tests |
|---|---|---|---|---|---|---|
${records.map(row).join('\n')}

## What makes them safe to show

| Value | Why it cannot be a real person's | Status |
|---|---|---|
| NHS number | Starts 999. The NHS digital service manual says numbers starting with 9 are test numbers, not given to real patients. Each passes the modulus 11 check digit | Sourced (\`reference/nhs-service-manual/a-to-z-of-nhs-health-writing.txt\`, \`reference/data-dictionary/nhsnumber.txt\`) |
| Phone numbers | 07700 900xxx and 029 2018 0xxx, the Ofcom ranges kept for drama | Unverified |
| Email | example.com, a domain reserved for examples | Unverified |
| GP practice codes | W99001 to W99004. Format is right (W plus 5 digits); not checked against the real list | Unverified |
| CRN | Format only. Real CRN formats differ between health boards | Unverified |
| Postcodes | Real districts with made-up inward codes. Some may exist. Do not use them with a real-looking street and house number together | Unverified |

## Notes

- **Alex MORGAN has no sex in the demographic record.** Core Reference Data says information
  that could disclose a person's sex must be stored separately from their gender, for example in
  the clinical record. Designs should show Gender here, not Sex.
- **Daniel EVANS is the empty-state patient.** Use him to check every "Not known" and "Not
  recorded" state on a screen.
- **Ruby ADAMS was 11 in earlier designs.** On ${displayDate(AS_OF)} she is ${ageOn('2014-10-03', AS_OF)}. Ages
  in Figma are typed text and go stale; take them from this file.
`;

if (process.argv.includes('--check')) {
  const stale = [['demo-patients.json', json], ['demo-patients.md', md]]
    .filter(([f, want]) => { try { return readFileSync(join(OUT, f), 'utf8') !== want; } catch { return true; } });
  if (stale.length) {
    console.error(`demo-patients: ${stale.map(([f]) => f).join(', ')} out of date. Run: node scripts/demo-patients.mjs`);
    process.exit(1);
  }
  console.log(`demo-patients: ${records.length} patients pass every rule; files are current.`);
} else {
  mkdirSync(OUT, { recursive: true });
  writeFileSync(join(OUT, 'demo-patients.json'), json);
  writeFileSync(join(OUT, 'demo-patients.md'), md);
  console.log(`demo-patients: ${records.length} patients pass every rule → docs/content/demo-patients.{json,md}`);
}
