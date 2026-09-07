// Fails if the icon catalogue and its generator disagree, if any icon carries
// baked colour, or if one Lucide glyph has quietly acquired two meanings.
//
// Why this exists — three defects, all of which were live in the repository and
// none of which any existing check could see:
//
//   1. `fetch-icons.js` was CommonJS in a `"type": "module"` root (DDR-007), so
//      it threw `require is not defined` on every run. It had been unrunnable
//      for months. Four icons — action/send, action/star, action/bookmark,
//      file/pin — had been added to svg/ by hand to work around it, with no
//      generator entry and no recorded Lucide provenance. Re-running the
//      generator would not have reproduced them.
//
//   2. The generator fetched Lucide's `main` branch, so the icon set was
//      whatever `main` held on the day it ran. It is now pinned to an exact
//      lucide-static version, and this check enforces that the SVGs on disk
//      match what that version produces.
//
//   3. "One glyph, one meaning" (DDR-029) was already violated: `triangle-alert`
//      served both status/alert and status/warning. Nothing said so.
//
// Run via `npm run check:icons`, and as part of `npm run check`.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SVG_DIR = resolve(ROOT, 'foundations/iconography/svg');
const GENERATOR = resolve(ROOT, 'foundations/iconography/fetch-icons.mjs');

// ---------------------------------------------------------------------------
// One glyph, one meaning (DDR-029).
//
// A Lucide glyph mapped to two SR names means a reader sees the same picture
// for two different things. Each entry here is a duplicate that has been looked
// at and consciously left in place; anything NOT listed fails the build.
//
// `open` entries are defects with an owner and a route to resolution — they are
// listed so they are visible and testable, not so they are forgotten. Do not
// add an entry to silence a build; add it because someone decided.
const ACCEPTED_DUPLICATES = [
  {
    glyph: 'file-text',
    names: ['clinical/record', 'file/pdf'],
    status: 'accepted',
    why: 'Deliberate: a clinical record and a PDF are the same document mark in '
       + 'different domains, and the domain prefix disambiguates at the call site. '
       + 'Both readings are the same object, which is what separates this from the '
       + 'seven duplicates resolved on 2026-09-07.',
  },
];

// ---------------------------------------------------------------------------

const problems = [];
const warnings = [];

// Parse the generator's ICONS array. Reading the source rather than importing
// it keeps this check free of the generator's own side effects (it writes 146
// files when it runs).
const src = readFileSync(GENERATOR, 'utf8');
const entries = [...src.matchAll(
  /\{\s*domain:\s*'([a-z-]+)',\s*name:\s*'([a-z0-9-]+)',\s*lucide:\s*'([a-z0-9-]+)'/g,
)].map((m) => ({ domain: m[1], name: m[2], lucide: m[3] }));

if (entries.length === 0) {
  console.error('check:icons — could not parse the ICONS array; has the generator changed shape?');
  process.exit(1);
}

// --- 1. The generator and the SVG directory must describe the same catalogue.
const declared = new Set(entries.map((e) => `${e.domain}/${e.name}`));
const onDisk = [];
for (const domain of readdirSync(SVG_DIR, { withFileTypes: true })) {
  if (!domain.isDirectory()) continue;
  for (const f of readdirSync(resolve(SVG_DIR, domain.name))) {
    if (f.endsWith('.svg')) onDisk.push(`${domain.name}/${f.replace(/\.svg$/, '')}`);
  }
}

for (const icon of onDisk) {
  if (!declared.has(icon)) {
    problems.push(
      `${icon}.svg exists but has no entry in fetch-icons.mjs — its Lucide `
      + 'provenance is unrecorded and regenerating will not reproduce it',
    );
  }
}
for (const icon of declared) {
  if (!onDisk.includes(icon)) {
    problems.push(
      `${icon} is declared in fetch-icons.mjs but ${icon}.svg is missing — `
      + 'run `node foundations/iconography/fetch-icons.mjs`',
    );
  }
}

// --- 2. No baked colour, anywhere (DDR-028).
//
// Colour is applied at the point of use through color.* tokens. An SVG that
// carries its own fill or stroke cannot be rethemed, and in particular cannot
// follow a dark-mode token swap.
const COLOUR = /(?:fill|stroke|stop-color|flood-color|lighting-color)\s*=\s*"([^"]*)"/gi;
const ALLOWED = new Set(['none', 'currentcolor', 'inherit', 'transparent']);

for (const icon of onDisk) {
  const file = resolve(SVG_DIR, `${icon}.svg`);
  if (!existsSync(file)) continue;
  const svg = readFileSync(file, 'utf8');

  for (const m of svg.matchAll(COLOUR)) {
    const value = m[1].trim();
    if (!ALLOWED.has(value.toLowerCase())) {
      problems.push(`${icon}.svg has baked colour: ${m[0]} — must be currentColor or none`);
    }
  }
  // A `style="fill:#f00"` would slip past the attribute matcher above.
  const style = svg.match(/style\s*=\s*"([^"]*)"/i);
  if (style && /(?:fill|stroke|color)\s*:/i.test(style[1])) {
    problems.push(`${icon}.svg carries colour in a style attribute: ${style[0]}`);
  }

  // --- 3. Stroke weight is 1, not Lucide's 2 (DDR-023).
  const sw = svg.match(/stroke-width\s*=\s*"([^"]*)"/i);
  if (!sw) {
    problems.push(`${icon}.svg has no stroke-width — DDR-023 requires an explicit 1`);
  } else if (sw[1].trim() !== '1') {
    problems.push(
      `${icon}.svg has stroke-width="${sw[1]}" — DDR-023 pins 1 (Lucide ships 2; `
      + 'do not restore it)',
    );
  }
}

// --- 4. One glyph, one meaning (DDR-029).
const byGlyph = new Map();
for (const e of entries) {
  const key = e.lucide;
  if (!byGlyph.has(key)) byGlyph.set(key, []);
  byGlyph.get(key).push(`${e.domain}/${e.name}`);
}

const acceptedByGlyph = new Map(ACCEPTED_DUPLICATES.map((d) => [d.glyph, d]));

for (const [glyph, names] of byGlyph) {
  if (names.length < 2) continue;
  const accepted = acceptedByGlyph.get(glyph);
  if (!accepted) {
    problems.push(
      `Lucide "${glyph}" is mapped to ${names.length} SR names (${names.join(', ')}) `
      + '— one glyph, one meaning (DDR-029). Give one of them a different glyph, or '
      + 'record the duplicate in ACCEPTED_DUPLICATES with a reason.',
    );
    continue;
  }
  const expected = [...accepted.names].sort().join(', ');
  const actual = [...names].sort().join(', ');
  if (expected !== actual) {
    problems.push(
      `Lucide "${glyph}" duplicate has changed: recorded as [${expected}], now [${actual}]. `
      + 'Update ACCEPTED_DUPLICATES in scripts/check-icons.mjs.',
    );
  }
}

// An accepted duplicate that no longer exists is stale bookkeeping.
for (const d of ACCEPTED_DUPLICATES) {
  const names = byGlyph.get(d.glyph) ?? [];
  if (names.length < 2) {
    problems.push(
      `ACCEPTED_DUPLICATES lists "${d.glyph}" as duplicated, but it is now mapped to `
      + `${names.length} name(s). Remove the entry.`,
    );
  }
}

// --- 5. No hand-typed icon totals in prose.
//
// Every one of these had drifted: "119 icons across nine groups", "106 icons
// across 10 domains", "123 icons as XAML path geometry", "120 icons with their
// names", "106 SR aliases". Five different numbers for one catalogue, none of
// them right, spread across guidelines, a Storybook story, two MAUI READMEs and
// the reference doc.
//
// A count in prose is a count that goes stale the next time an icon is added.
// The catalogue tables are generated (npm run sync:icons); everywhere else
// should point at them rather than restate them. Where a number genuinely helps
// a reader, it has to be the right one — so it is checked.
const COUNT_PATTERNS = [
  /(\d{2,4})\s+icons?\b/gi,
  /(\d{2,4})\s+SR aliases\b/gi,
];
// Files that legitimately discuss historical counts: decision records explaining
// what changed, and the known-issues log describing past defects.
const PROSE_EXEMPT = [
  'decisions/',
  'docs/engineering/known-issues.md',
  'CHANGELOG.md',
  'scripts/check-icons.mjs',
  'scripts/sync-icon-docs.mjs',
  'foundations/iconography/fetch-icons.mjs',
];
const PROSE_FILES = [
  'foundations/iconography.md',
  'foundations/iconography/catalogue.md',
  'components/icons/guidelines.md',
  'packages/icons/src/icon.stories.js',
  'packages/icons/README.md',
  'packages/maui/README.md',
  'packages/maui/nuget/README.md',
  'packages/maui/testbed/README.md',
  'SINGLE-RECORD-DS-REFERENCE.md',
  'DESIGN-SYSTEM.md',
];

for (const rel of PROSE_FILES) {
  if (PROSE_EXEMPT.some((e) => rel.startsWith(e))) continue;
  const file = resolve(ROOT, rel);
  if (!existsSync(file)) continue;
  const text = readFileSync(file, 'utf8');
  for (const pattern of COUNT_PATTERNS) {
    for (const m of text.matchAll(pattern)) {
      const stated = Number(m[1]);
      // 24 is the grid, not a count; ignore obviously unrelated numbers.
      if (stated === 24 || stated < 50) continue;
      if (stated !== entries.length) {
        problems.push(
          `${rel} says "${m[0].trim()}" but the catalogue has ${entries.length}. `
          + 'Either correct it or, better, point at foundations/iconography/catalogue.md — '
          + 'that file is generated and cannot drift.',
        );
      }
    }
  }
}

const open = ACCEPTED_DUPLICATES.filter((d) => d.status === 'open');

// ---------------------------------------------------------------------------

if (problems.length) {
  console.error(
    `\ncheck:icons — ${problems.length} problem(s):\n\n  `
    + problems.join('\n\n  ')
    + '\n',
  );
  process.exit(1);
}

const domains = new Set(entries.map((e) => e.domain));
console.log(
  `check:icons — ${entries.length} icons across ${domains.size} domains; generator and `
  + 'SVGs agree, all currentColor, all stroke-width 1.',
);

if (open.length) {
  console.log(
    `\n  ${open.length} glyph(s) carry more than one meaning and are recorded as OPEN:\n`
    + open.map((d) => `    ${d.glyph}: ${d.names.join(' + ')}`).join('\n')
    + '\n  These are tracked defects, not accepted design. See DDR-029.',
  );
}

if (warnings.length) console.log('\n' + warnings.join('\n'));
