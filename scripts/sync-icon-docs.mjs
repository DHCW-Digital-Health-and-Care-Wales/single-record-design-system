/**
 * Sync the icon catalogue tables to the generator.
 *
 * `foundations/iconography/fetch-icons.mjs` is the source of truth: its ICONS
 * array is what produces every SVG, and therefore what the sprite, the website
 * icon browser, and every framework wrapper ultimately serve.
 *
 * The catalogue tables used to be maintained by hand alongside it, with a count
 * written into each domain heading. They drifted, exactly as you would expect:
 * before this script the file claimed "Total SR aliases: 119 across 10 domains"
 * while 123 SVGs sat on disk, and four of those had no generator entry at all.
 * A count that is typed is a count that goes stale.
 *
 * So the tables and every count are generated, and the hand-written prose around
 * them is preserved. Notes written against an icon are carried over by SR alias,
 * so editorial content survives a regeneration.
 *
 *   node scripts/sync-icon-docs.mjs           rewrite the tables
 *   node scripts/sync-icon-docs.mjs --check   exit 1 if they are out of date
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');

const CATALOGUE = resolve(ROOT, 'foundations/iconography/catalogue.md');
const GENERATOR = resolve(ROOT, 'foundations/iconography/fetch-icons.mjs');

const BEGIN = '<!-- BEGIN GENERATED CATALOGUE — edit fetch-icons.mjs, then run npm run sync:icons -->';
const END = '<!-- END GENERATED CATALOGUE -->';

// Domain display names. A domain with no entry here still renders, under its
// own key — an unnamed domain is a missing label, not a reason to drop icons.
const DOMAIN_TITLES = {
  nav: 'Navigation & UI chrome',
  action: 'Actions & editing',
  status: 'Status & feedback',
  people: 'Patients & people',
  clinical: 'Clinical records & data',
  schedule: 'Scheduling & appointments',
  location: 'Location & organisation',
  comms: 'Communication & messaging',
  file: 'Documents & files',
  data: 'Data & analytics',
  device: 'Device & hardware',
};

const src = readFileSync(GENERATOR, 'utf8');
const entries = [...src.matchAll(
  /\{\s*domain:\s*'([a-z-]+)',\s*name:\s*'([a-z0-9-]+)',\s*lucide:\s*'([a-z0-9-]+)'(?:[^}]*?note:\s*'((?:[^'\\]|\\.)*)')?/g,
)].map((m) => ({
  domain: m[1],
  name: m[2],
  lucide: m[3],
  note: m[4] ? m[4].replace(/\\'/g, "'") : '',
}));

if (entries.length === 0) {
  console.error('sync:icons — could not parse the ICONS array from fetch-icons.mjs');
  process.exit(1);
}

// PascalCase component name, e.g. action/edit-note -> ActionEditNote
const componentName = (domain, name) =>
  (domain + '-' + name)
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('');

const current = readFileSync(CATALOGUE, 'utf8');

// Preserve any hand-written Notes already in the catalogue, keyed by SR alias,
// so editorial content is not lost when the tables are regenerated. A note in
// the generator wins — it travels with the decision.
// The note is always the LAST cell, whatever the column count — the catalogue
// used to carry a "Filled variant" column that this script drops. Matching a
// fixed number of columns silently lost every note the first time this ran.
const existingNotes = new Map();
for (const m of current.matchAll(/^\|\s*([a-z-]+\/[a-z0-9-]+)\s*\|(.*)\|\s*$/gm)) {
  const cells = m[2].split('|').map((c) => c.trim());
  const note = cells[cells.length - 1];
  if (note) existingNotes.set(m[1], note);
}

const byDomain = new Map();
for (const e of entries) {
  if (!byDomain.has(e.domain)) byDomain.set(e.domain, []);
  byDomain.get(e.domain).push(e);
}

const domains = [...byDomain.keys()].sort(
  (a, b) => Object.keys(DOMAIN_TITLES).indexOf(a) - Object.keys(DOMAIN_TITLES).indexOf(b),
);

const lines = [];
lines.push(BEGIN);
lines.push('');
lines.push(`**${entries.length} SR aliases across ${domains.length} domains.**`);
lines.push('');
lines.push(
  'Every row below is generated from the `ICONS` array in `fetch-icons.mjs`. '
  + 'Do not edit this section by hand — add the icon to the generator, run '
  + '`npm run sync:icons`, and the table follows.',
);
lines.push('');

for (const domain of domains) {
  const icons = byDomain.get(domain);
  const title = DOMAIN_TITLES[domain] || domain;
  lines.push(`### ${title} (${icons.length})`);
  lines.push('');
  lines.push('| SR alias | Lucide glyph | Component name | Notes |');
  lines.push('|---|---|---|---|');
  for (const e of icons) {
    const alias = `${e.domain}/${e.name}`;
    const note = e.note || existingNotes.get(alias) || '';
    lines.push(
      `| ${alias} | ${e.lucide} | ${componentName(e.domain, e.name)} | ${note} |`,
    );
  }
  lines.push('');
}

lines.push(END);

const generated = lines.join('\n');

const beginAt = current.indexOf(BEGIN);
const endAt = current.indexOf(END);
if (beginAt === -1 || endAt === -1) {
  console.error(
    `sync:icons — markers not found in ${CATALOGUE}.\n`
    + `Add these two lines around the generated section:\n  ${BEGIN}\n  ${END}`,
  );
  process.exit(1);
}

const next = current.slice(0, beginAt) + generated + current.slice(endAt + END.length);

if (next === current) {
  console.log(`sync:icons — catalogue up to date (${entries.length} aliases, ${domains.length} domains).`);
  process.exit(0);
}

if (CHECK) {
  console.error(
    '\nsync:icons — the icon catalogue is out of date with fetch-icons.mjs.\n'
    + 'Run `npm run sync:icons` and commit the result.\n',
  );
  process.exit(1);
}

writeFileSync(CATALOGUE, next, 'utf8');
console.log(`sync:icons — catalogue rewritten (${entries.length} aliases, ${domains.length} domains).`);
