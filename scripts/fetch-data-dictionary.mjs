#!/usr/bin/env node
/**
 * fetch-data-dictionary.mjs
 *
 * Saves a plain-text copy of the NHS Wales Data Dictionary pages that the
 * content rules (docs/content/data-standards.md) cite, so every rule can be
 * traced to the exact wording and version it was written from.
 *
 *   node scripts/fetch-data-dictionary.mjs          fetch the PAGES below
 *   node scripts/fetch-data-dictionary.mjs --follow also fetch pages they link to
 *
 * Source: https://www.datadictionary.wales.nhs.uk/ (Doc-To-Help; each page is a
 * static file under WordDocuments/). The site says v4.25 (3 June 2025) is the
 * last version on this platform; later changes are published as DSCNs on
 * dhcw.nhs.wales until the new platform launches. Uses curl, as fetch-icons
 * does, so the session's HTTPS proxy applies.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = 'https://www.datadictionary.wales.nhs.uk/WordDocuments/';
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'reference', 'data-dictionary');

// The items behind demo content: identity, demographics, contact, GP.
const PAGES = [
  'addressographlabelsstandard1', 'corereferencedatastandards1', 'nameformatcode',
  'nhsnumber', 'nhsnumberstatusindicator', 'caserecordnumber', 'localpatientidentifier',
  'patientsname', 'patientsnamesurname', 'patientsnameforename',
  'dateofbirth', 'birthdate', 'birthdatestatus', 'age', 'deathdate',
  'sex', 'gender', 'maritalstatus', 'ethnicgroup',
  'preferredspokenlanguage', 'interpreterlanguage',
  'patientsusualaddress', 'postcode', 'postcodeofusualaddress', 'postcodes',
  'gppractice', 'gppracticecode', 'codeofregisteredgppractice', 'gpcode',
  'carersupportindicator', 'nhswalesdocumentmetadatastandard1',
];

const get = (url) => execFileSync('curl', ['-sfL', '-m', '60', url], { encoding: 'utf8', maxBuffer: 64 << 20 });

function toText(html) {
  return html
    .replace(/\s+/g, ' ')
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
    .replace(/<\/(p|div|h\d|li|tr|table)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/t[dh]>/gi, ' | ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n))
    .replace(/&rsquo;|&lsquo;/g, "'").replace(/&ldquo;|&rdquo;/g, '"').replace(/&ndash;/g, '-')
    .replace(/[ \t]+/g, ' ').replace(/ ?\n ?/g, '\n').replace(/(\| *)+\n/g, '|\n')
    .replace(/\n{3,}/g, '\n\n').trim();
}

const today = new Date().toISOString().slice(0, 10);
const queue = [...PAGES];
const done = new Set();
const dscns = new Set();
const follow = process.argv.includes('--follow');
mkdirSync(OUT, { recursive: true });

while (queue.length) {
  const page = queue.shift();
  if (done.has(page)) continue;
  done.add(page);
  let html;
  try { html = get(`${BASE}${page}.htm`); } catch { console.error(`  ✗ ${page}`); continue; }
  const title = (html.match(/<title>([^<]*)<\/title>/i) || [])[1]?.trim() || page;
  writeFileSync(join(OUT, `${page}.txt`),
    `Source: ${BASE}${page}.htm\nTitle: ${title}\nRetrieved: ${today} (NHS Wales Data Dictionary v4.25)\n\n${toText(html)}\n`);
  console.log(`  ✓ ${page}  ${title}`);
  // A standard's own scope and specification are separate pages; always take
  // them. Other linked items only with --follow.
  for (const [, next] of html.matchAll(/href="(?:\.\.\/WordDocuments\/)?([a-z0-9]+)\.htm/g)) {
    if (/^(scope|informationspecification|format|notes|definition)\d*$/.test(next) || (follow && PAGES.includes(page))) queue.push(next);
  }
  // DSCN PDFs it cites, for the change history behind each rule.
  for (const [, pdf] of html.matchAll(/href="(https:\/\/[^"]*dscn[^"]*-pdf\/?)"/gi)) dscns.add(pdf.replace('nwis.nhs.wales', 'dhcw.nhs.wales'));
}
writeFileSync(join(OUT, 'dscn-links.txt'), [...dscns].sort().join('\n') + '\n');
console.log(`\n${done.size} page(s) → docs/reference/data-dictionary/, ${dscns.size} DSCN link(s) → dscn-links.txt`);
