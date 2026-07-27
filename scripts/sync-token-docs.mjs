/**
 * Sync the colour reference docs to the token JSON.
 *
 * The token JSON is the source of truth: it is what builds, what Storybook and the
 * website render, and what the Figma variables export to. The markdown reference
 * tables used to be maintained by hand and had drifted from it.
 *
 * This regenerates those tables from the JSON, preserving any hand-written Notes
 * against the token they belong to.
 *
 *   node scripts/sync-token-docs.mjs           rewrite the docs
 *   node scripts/sync-token-docs.mjs --check    exit 1 if the docs are out of date
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');

const readJson = (p) => JSON.parse(readFileSync(resolve(ROOT, p), 'utf8'));
const primitives = readJson('foundations/tokens/primitives/color.json').color;
const light = readJson('foundations/tokens/semantic/color.json');
const dark = readJson('foundations/tokens/semantic/color.dark.json');

// ── helpers ───────────────────────────────────────────────────────────────────
const stepOrder = (k) => (k === 'default' ? -1 : Number(k));
function familySteps(family) {
  const fam = primitives[family];
  if (!fam) return [];
  return Object.entries(fam)
    .filter(([k, v]) => !k.startsWith('$') && v && typeof v === 'object' && '$value' in v)
    .sort((a, b) => stepOrder(b[0]) - stepOrder(a[0]))
    .map(([k, v]) => ({
      token: family === 'white' && k === 'default' ? 'color.white' : `color.${family}.${k}`,
      value: v.$value.toUpperCase(),
      desc: v.$description || '',
    }));
}

function flatten(obj, out = {}, prefix = '') {
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith('$')) continue;
    if (v && typeof v === 'object' && '$value' in v) out[prefix + k] = v.$value;
    else if (v && typeof v === 'object') flatten(v, out, prefix + k + '.');
  }
  return out;
}
const lightFlat = flatten(light);
const darkFlat = flatten(dark);
const refName = (v) => String(v).replace(/[{}]/g, '').replace(/^color\./, '').replace(/\.default$/, '');

/** Existing Notes cells, keyed by token, so hand-written context survives a rewrite. */
function harvestNotes(md) {
  const notes = {};
  for (const m of md.matchAll(/^\|\s*`([^`]+)`\s*\|[^|]*\|\s*(.*?)\s*\|\s*$/gm)) notes[m[1]] = m[2];
  return notes;
}

/** Replace the markdown table that follows a heading. */
function replaceTableAfter(md, headingRe, rows) {
  const m = md.match(headingRe);
  if (!m) throw new Error(`heading not found: ${headingRe}`);
  const start = md.indexOf(m[0]) + m[0].length;
  const rest = md.slice(start);
  const tableRe = /\n\n\| Token \| Value \| Notes \|\n\|[-|]+\|\n(?:\|.*\n)*/;
  const t = rest.match(tableRe);
  if (!t) throw new Error(`table not found after: ${m[0]}`);
  const table = `\n\n| Token | Value | Notes |\n|---|---|---|\n${rows}\n`;
  return md.slice(0, start) + rest.replace(tableRe, table);
}

// ── global.md: the primitive palette ─────────────────────────────────────────
{
  const p = 'foundations/tokens/colour/global.md';
  let md = readFileSync(resolve(ROOT, p), 'utf8');
  const before = md;
  const notes = harvestNotes(md);

  const sections = [
    [/^### Blue .*$/m, 'blue'],
    [/^### Cyan .*$/m, 'cyan'],
    [/^### Navy .*$/m, 'navy'],
    [/^### Red .*$/m, 'red'],
    [/^### Green .*$/m, 'green'],
    [/^### Yellow .*$/m, 'yellow'],
    [/^### Info Blue .*$/m, 'info-blue'],
    [/^### Neutral \/ UI.*$/m, 'grey'],
  ];
  for (const [heading, family] of sections) {
    const steps = familySteps(family);
    // White lives with the neutrals rather than in a family of its own.
    if (family === 'grey') steps.push(...familySteps('white'));
    const rows = steps
      .map((r) => `| \`${r.token}\` | \`${r.value}\` | ${notes[r.token] || r.desc} |`)
      .join('\n');
    md = replaceTableAfter(md, heading, rows);
  }

  // The Focus section documented a primitive that no longer exists.
  md = md.replace(/### Focus\n\n\| Token \| Value \| Notes \|\n\|[-|]+\|\n(?:\|.*\n)*\n/,
    '### Focus\n\nThere is no separate focus primitive. The focus ring uses `color.cyan.700` in ' +
    'both light and dark mode, exposed through the `sr.color.border.focus` semantic token.\n\n');

  if (CHECK && md !== before) { console.error(`OUT OF DATE: ${p}`); process.exitCode = 1; }
  else if (!CHECK) writeFileSync(resolve(ROOT, p), md);
}

// ── semantic.md: the light/dark mapping table ────────────────────────────────
{
  const p = 'foundations/tokens/colour/semantic.md';
  let md = readFileSync(resolve(ROOT, p), 'utf8');
  const before = md;
  let fixed = 0;
  md = md.replace(/^\|\s*`(sr\.color\.[a-z.\-]+)`\s*\|\s*`([^`]+)`\s*\|\s*`([^`]+)`\s*\|/gm,
    (all, token, l, d) => {
      if (!(token in lightFlat)) return all;
      const wantL = refName(lightFlat[token]);
      const wantD = refName(darkFlat[token]);
      const gotL = refName(l);
      const gotD = refName(d);
      if (gotL === wantL && gotD === wantD) return all;
      fixed++;
      return all.replace(`\`${l}\``, `\`${wantL}\``).replace(`\`${d}\``, `\`${wantD}\``);
    });
  if (CHECK && md !== before) { console.error(`OUT OF DATE: ${p} (${fixed} rows)`); process.exitCode = 1; }
  else if (!CHECK) { writeFileSync(resolve(ROOT, p), md); if (fixed) console.log(`semantic.md: corrected ${fixed} rows`); }
}

if (CHECK && !process.exitCode) console.log('Colour docs are in sync with the token JSON.');
else if (!CHECK) console.log('Colour docs synced from the token JSON.');
