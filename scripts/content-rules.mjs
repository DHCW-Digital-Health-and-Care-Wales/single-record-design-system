/**
 * content-rules.mjs
 *
 * The content checker's rules, as plain functions with no dependencies, so the
 * same file can run in Node (scripts/check-content.mjs), in a Claude agent
 * checking Figma, and later inside a Figma plugin.
 *
 * Every rule cites the section of docs/content/data-standards.md it enforces.
 * That file cites the Data Dictionary, DSCN or style guide behind the rule.
 *
 *   checkText(text, { role, today })  →  [{ rule, severity, found, message, fix, source }]
 *
 * role says what the text is, because some rules only apply to some text:
 *   'heading' | 'button' | 'link' | 'label' | 'tab' | 'column'  (UI copy: casing rules)
 *   'name'    a patient name                                     (name format)
 *   'value'   a field value                                      (empty-value wording)
 *   'body'    anything else                                      (data format rules only)
 *
 * Severity: 'error' breaks a Sourced rule; 'warning' breaks an Adapted or
 * Unverified one, or is a heuristic that needs a person to look.
 */

const RULES_DOC = 'docs/content/data-standards.md';
const src = (section) => `${RULES_DOC} § ${section}`;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_RE = '(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*';

/** Modulus 11 check digit (data-dictionary/nhsnumber.txt). null when the base is invalid. */
export function nhsCheckDigit(nine) {
  const sum = [...nine].reduce((s, d, i) => s + Number(d) * (10 - i), 0);
  const c = 11 - (sum % 11);
  return c === 11 ? 0 : c === 10 ? null : c;
}
export const nhsNumberValid = (ten) => /^\d{10}$/.test(ten) && nhsCheckDigit(ten.slice(0, 9)) === Number(ten[9]);

/**
 * Words that keep a capital in sentence case. Acronyms (2+ capitals) are
 * allowed automatically. Add proper nouns here when the checker flags one
 * wrongly; keep it to names of places, organisations, systems and languages.
 */
export const PROPER_NOUNS = new Set([
  'I', 'Wales', 'Welsh', 'England', 'English', 'Scotland', 'Scottish', 'Ireland', 'Irish', 'British', 'UK',
  'Cymru', 'Cymraeg', 'Cardiff', 'Swansea', 'Newport', 'Bridgend', 'Aberystwyth', 'Brecon', 'Wrexham', 'Bangor',
  'Vale', 'Glamorgan', 'Powys', 'Gwent', 'Betsi', 'Cadwaladr', 'Aneurin', 'Bevan', 'Cwm', 'Taf', 'Morgannwg',
  'Hywel', 'Dda', 'Velindre', 'University', 'Health', 'Board', 'Trust',   // only inside a named organisation; see note below
  'Single', 'Record', 'Clinical', 'Portal', 'Figma', 'Storybook', 'React', 'Blazor', 'MAUI', 'Bootstrap', 'Lucide', 'Claude', 'Copilot', 'ChatGPT', 'Android', 'Windows',
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
  ...MONTHS, 'January', 'February', 'March', 'April', 'June', 'July', 'August', 'September', 'October', 'November', 'December',
  'Dr', 'Mr', 'Mrs', 'Miss', 'Ms', 'Mx', 'Prof', 'Rev',
]);
// Note: 'Health', 'Board', 'University', 'Single', 'Record', 'Clinical' are
// allowed because they appear inside proper nouns ("Cardiff and Vale University
// Health Board", "Single Record"). The cost is that "View Health Record" passes
// on those words; the other capitals in such a heading still get caught.

/**
 * Multi-word proper names: names of systems, products and organisations. They
 * are removed before the casing check, so their capitals are not flagged.
 */
export const PROPER_PHRASES = [
  'Single Record Design System', 'SR Design System', 'Single Record', 'Welsh Clinical Portal',
  'Welsh Patient Administration System', 'Welsh Reference Data Service', 'Data Standards Change Notice',
  'Welsh Information Standards Board', 'NHS Wales Data Dictionary', 'Data Dictionary',
  'Digital Health and Care Wales', 'NHS Wales', 'Common User Interface',
];

const CASING_ROLES = new Set(['heading', 'button', 'link', 'label', 'tab', 'column']);
const GENERIC_BUTTONS = /^(ok|okay|submit|yes|no|click here|go|continue\.\.\.|here)$/i;

const finding = (rule, severity, found, message, fix, source) => ({ rule, severity, found, message, fix, source });

/** Age in whole years on `today` (data-dictionary/age.txt). */
function ageOn(d, m, y, today) {
  const t = today;
  return t.getFullYear() - y - ((t.getMonth() + 1 < m || (t.getMonth() + 1 === m && t.getDate() < d)) ? 1 : 0);
}

export function checkText(text, { role = 'body', today = new Date() } = {}) {
  const out = [];
  const s = String(text ?? '').trim();
  if (!s) return out;

  // ── NHS number ───────────────────────────────────────────────────────────
  // Ten digits, optionally grouped 3 3 4 with any separator. Phone numbers are
  // 5-6 or 3-4-4 grouped, so they do not match this shape.
  for (const m of s.matchAll(/(?<![\d-])(\d{3})([ .-]?)(\d{3})\2(\d{4})(?![\d-])/g)) {
    const digits = m[1] + m[3] + m[4];
    const sep = m[2];
    if (sep !== ' ') {
      out.push(finding('nhs-number-format', 'error', m[0],
        'NHS number not in 3 3 4 groups with single spaces.',
        `${m[1]} ${m[3]} ${m[4]}`, src('2. Patient identity, NHS number')));
    }
    if (!nhsNumberValid(digits)) {
      out.push(finding('nhs-number-check-digit', 'error', m[0],
        'Fails the NHS number check digit, so it cannot be a valid NHS number. A slip like this is easy to spot in a demo.',
        'Use a demo patient (docs/content/demo-patients.md) or a 999 number that passes the check', src('2. Patient identity, NHS number')));
    } else if (!digits.startsWith('9')) {
      out.push(finding('nhs-number-real', 'warning', m[0],
        'Valid NHS number outside the test range. It could belong to a real person.',
        'Use a number starting 999 (demo patients)', src('2. Patient identity, NHS number')));
    }
  }
  if (CASING_ROLES.has(role) || role === 'body') {
    for (const m of s.matchAll(/\bNHS Number\b/g)) {
      out.push(finding('nhs-number-casing', 'error', m[0], 'In UI copy it is "NHS number", lower-case n.', 'NHS number', src('1. Writing style, Capitalisation')));
    }
  }

  // ── Dates ────────────────────────────────────────────────────────────────
  // Slash dates, or dot dates with a four-digit year: "1.4.12" is a WCAG
  // success criterion, not a date.
  for (const m of s.matchAll(/(?<![\d/.])(\d{1,2})(?:\/(\d{1,2})\/(\d{2}|\d{4})|\.(\d{1,2})\.(\d{4}))(?![\d/.])/g)) {
    const [d, mo] = [Number(m[1]), Number(m[2] ?? m[4])];
    if (d < 1 || d > 31 || mo < 1 || mo > 12) continue;
    out.push(finding('date-numeric', 'error', m[0],
      'All-numeric date. Day and month can be read either way round.',
      'A named month: 3 Oct 2014', src('2. Patient identity, Date of birth and age')));
  }
  for (const m of s.matchAll(/(?<!\d)(\d{4})-(\d{2})-(\d{2})(?!\d)/g)) {
    out.push(finding('date-iso', 'error', m[0], 'Stored date format on screen.', 'A named month: 3 Oct 2014', src('2. Patient identity, Date of birth and age')));
  }
  for (const m of s.matchAll(new RegExp(`\\b(\\d{1,2})-(${MONTH_RE})-(\\d{2}|\\d{4})\\b`, 'g'))) {
    const twoDigit = m[3].length === 2;
    out.push(finding(twoDigit ? 'date-two-digit-year' : 'date-hyphens', twoDigit ? 'error' : 'warning', m[0],
      twoDigit ? 'Two-digit year.' : 'Hyphenated date, the printed-label style. Screens use spaces (open question 1).',
      `${Number(m[1])} ${m[2].slice(0, 3)} ${twoDigit ? `19${m[3]} or 20${m[3]}` : m[3]}`, src('2. Patient identity, Date of birth and age')));
  }
  for (const m of s.matchAll(new RegExp(`\\b0(\\d) (${MONTH_RE}) (\\d{4})\\b`, 'g'))) {
    out.push(finding('date-leading-zero', 'warning', m[0], 'Leading zero on the day.', `${m[1]} ${m[2]} ${m[3]}`, src('2. Patient identity, Date of birth and age')));
  }
  // Date of birth followed by an age: is the age right today?
  for (const m of s.matchAll(new RegExp(`\\b(\\d{1,2}) (${MONTH_RE}) (\\d{4})\\s*\\((\\d{1,3})\\s*(y|yr|yrs|years?)\\)`, 'g'))) {
    const mi = MONTHS.indexOf(m[2].slice(0, 3)) + 1;
    const age = ageOn(Number(m[1]), mi, Number(m[3]), today);
    if (mi && age !== Number(m[4])) {
      out.push(finding('age-wrong', 'error', m[0], `Age does not match the date of birth: ${age} today.`,
        `${m[1]} ${m[2]} ${m[3]} (${age} years)`, src('2. Patient identity, Date of birth and age')));
    }
    if (m[5] !== 'years' && m[5] !== 'year') {
      out.push(finding('age-abbreviated', 'warning', m[0], 'Age abbreviated.', `(${m[4]} years)`, src('2. Patient identity, Date of birth and age')));
    }
  }

  // ── Postcode ─────────────────────────────────────────────────────────────
  for (const m of s.matchAll(/\b([A-Z]{1,2}\d[A-Z\d]?)(\d[A-Z]{2})\b/g)) {
    out.push(finding('postcode-space', 'error', m[0], 'Postcode without the space.', `${m[1]} ${m[2]}`, src('3. Contact and address, Postcode')));
  }

  // ── Sex and gender ───────────────────────────────────────────────────────
  if (/\bgender\b\s*:?\s*(indeterminate)\b/i.test(s)) {
    out.push(finding('gender-value', 'error', s, '"Indeterminate" is a value of Sex, not Gender.', 'Label it Sex, or use a gender value', src('2. Patient identity, Sex and gender identity')));
  }
  if (/\bsex\b\s*:?\s*(non-binary)\b/i.test(s)) {
    out.push(finding('sex-value', 'error', s, '"Non-binary" is a value of Gender, not Sex.', 'Label it Gender', src('2. Patient identity, Sex and gender identity')));
  }

  // ── Empty values ─────────────────────────────────────────────────────────
  if (role === 'value' && /^(n\/?a|-+|–|—|none|null|undefined|tbc|\?)$/i.test(s)) {
    out.push(finding('empty-value', 'warning', s, 'Empty value shown as a symbol or code.',
      '"Not recorded", or "Not known" if recorded as unknown', src('5. Empty and unknown values')));
  }

  // ── Patient name ─────────────────────────────────────────────────────────
  if (role === 'name') {
    const m = s.match(/^([^,]+),\s*(.+)$/);
    if (!m) {
      out.push(finding('name-order', 'warning', s, 'Patient name not in SURNAME, Forename order.', 'SURNAME, Forename', src('2. Patient identity, Patient name')));
    } else if (m[1].replace(/\b(ap|ab|ferch|verch)\b/g, '') !== m[1].replace(/\b(ap|ab|ferch|verch)\b/g, '').toUpperCase()) {
      out.push(finding('name-surname-caps', 'error', s, 'Surname not in capitals.', `${m[1].toUpperCase()}, ${m[2]}`, src('2. Patient identity, Patient name')));
    }
  }

  // ── Casing and wording of UI copy ────────────────────────────────────────
  // A patient name used as a heading is checked as a name, not for casing.
  if (CASING_ROLES.has(role) && /^[A-Z][A-Z' -]+, [A-Z]/.test(s)) return [...out, ...checkText(s, { role: 'name', today })];

  if (CASING_ROLES.has(role)) {
    let plain = s;
    for (const p of PROPER_PHRASES) plain = plain.split(p).join('X');
    // A capital after a colon, dash, slash or full stop starts a new phrase
    // ("Type: Fill", "Do / Don't", "It is an event. Inset text is the page.").
    plain = plain.replace(/([:—–./]|\s-)\s+[A-Z]/g, (m) => m.toLowerCase());
    // A patient name inside copy ("Back to JOHN, Elvet George") keeps its capitals.
    plain = plain.replace(/\b[A-Z][A-Z'-]+, [A-Z][a-zà-ÿ'-]+(?: [A-Z][a-zà-ÿ'-]+)*/g, 'X');
    const words = plain.replace(/[“”"()[\]:,.?!]/g, ' ').split(/\s+/).filter(Boolean);
    const letters = s.replace(/[^A-Za-z]/g, '');
    const acronymOnly = words.every((w) => /^[A-Z0-9&/.-]{1,}$/.test(w) && !/^[A-Z][A-Z]{4,}$/.test(w));
    if (letters.length > 3 && letters === letters.toUpperCase() && !acronymOnly) {
      out.push(finding('block-capitals', 'error', s, 'Block capitals. Harder to read, and reads like a surname.', sentenceCase(s), src('1. Writing style, Capitalisation')));
    } else {
      // Words with an internal capital (JavaScript, NuGet, iPhone) are brand names.
      const offenders = words.slice(1).filter((w) => /^[A-Z][a-z]/.test(w) && !/[a-z][A-Z]/.test(w)
        && !PROPER_NOUNS.has(w.replace(/['’]s$/, '')));
      if (offenders.length) {
        out.push(finding('sentence-case', role === 'heading' || role === 'button' || role === 'tab' ? 'error' : 'warning', s,
          `Not sentence case: ${offenders.join(', ')}. If one is a proper noun, add it to PROPER_NOUNS in scripts/content-rules.mjs.`,
          sentenceCase(s), src('1. Writing style, Capitalisation')));
      }
    }
    if (role === 'button' && GENERIC_BUTTONS.test(s)) {
      out.push(finding('button-generic', 'warning', s, 'Button does not say what it does.', 'A verb and its object: "Save referral"', src('1. Writing style, Buttons and links')));
    }
  }

  return out;
}

/** Best-effort sentence case: keeps acronyms and PROPER_NOUNS, lowers the rest. */
export function sentenceCase(s) {
  return s.split(/(\s+)/).map((w, i) => {
    if (/^\s+$/.test(w) || !w) return w;
    const core = w.replace(/[^A-Za-z'’-]/g, '');
    if (/^[A-Z0-9&/-]{2,}$/.test(core) && core.length <= 5) return w;          // acronym
    if (PROPER_NOUNS.has(core)) return w;
    const lower = w.toLowerCase();
    return i === 0 ? lower.charAt(0).toUpperCase() + lower.slice(1) : lower;
  }).join('');
}
