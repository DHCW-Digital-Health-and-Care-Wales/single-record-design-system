/**
 * Sync the Figma colour-guide plugin's data to the token JSON.
 *
 * `figma/plugins/colour-guide/code.js` rebuilds the "Colour Guide" frame on the
 * Colours page inside Figma. It runs in the Figma sandbox, so it cannot read the
 * repo at runtime: its colour data has to be inlined. That inlined copy had
 * drifted badly from the tokens, to the point where running the plugin would have
 * rebuilt the frame with a focus primitive that no longer exists and with the
 * pre-reconciliation status colours.
 *
 * This regenerates the data block between the generated markers in code.js from
 * the same source of truth the build and the website use. Everything outside the
 * markers (the layout and rendering code) is hand-maintained and left alone.
 *
 *   node scripts/sync-figma-colour-guide.mjs           rewrite the data block
 *   node scripts/sync-figma-colour-guide.mjs --check    exit 1 if it is out of date
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');
const PLUGIN = 'figma/plugins/colour-guide/code.js';

const readJson = (p) => JSON.parse(readFileSync(resolve(ROOT, p), 'utf8'));
const primitives = readJson('foundations/tokens/primitives/color.json').color;
const semantic = readJson('foundations/tokens/semantic/color.json').sr.color;

// ── contrast ────────────────────────────────────────────────────────────────
// Used only to pick legible on-swatch label text, the same job the hand-written
// `text` field used to do. Not a compliance check.

const INK = '#212B32'; // grey.900
const PAPER = '#FFFFFF';

function luminance(hex) {
  const c = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

function ratio(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

// Pick whichever of ink/paper reads better on the swatch.
const onColour = (hex) => (ratio(hex, PAPER) >= ratio(hex, INK) ? PAPER : INK);

// White needs a border or it disappears against the page.
const strokeFor = (hex) => (ratio(hex, PAPER) < 1.2 ? '#D8DDE0' : null);

// ── primitives ──────────────────────────────────────────────────────────────

const FAMILIES = [
  ['blue', 'NHS Wales Blue — primary brand'],
  ['cyan', 'DHCW Blue — secondary / accent'],
  ['navy', 'DHCW Navy'],
  ['red', 'Critical and destructive'],
  ['green', 'Success'],
  ['yellow', 'Warning'],
  ['info-blue', 'Information and links'],
  ['grey', 'UI grey palette'],
  ['white', 'Base'],
];

// Roles worth calling out on the swatch itself. Derived from the semantic layer
// below where it is unambiguous, hand-named where the role is a brand statement.
const TAGS = {
  '#325083': 'Brand primary',
  '#12A3C9': 'Brand secondary',
};

function steps(family) {
  const fam = primitives[family];
  if (!fam) return [];
  const order = (k) => (k === 'default' ? Number.POSITIVE_INFINITY : Number(k));
  return Object.entries(fam)
    .filter(([k, v]) => !k.startsWith('$') && v && typeof v === 'object' && '$value' in v)
    .sort((a, b) => order(b[0]) - order(a[0]))
    .map(([k, v]) => {
      const hex = v.$value.toUpperCase();
      const s = { scale: k === 'default' ? family : k, hex, text: onColour(hex), tag: TAGS[hex] || '' };
      const stroke = strokeFor(hex);
      if (stroke) s.stroke = stroke;
      return s;
    });
}

const primitiveGroups = FAMILIES
  .filter(([f]) => primitives[f])
  .map(([label, desc]) => ({
    label: label === 'info-blue' ? 'Info Blue' : label[0].toUpperCase() + label.slice(1),
    desc,
    swatches: steps(label),
  }));

// ── semantic ────────────────────────────────────────────────────────────────

// `{color.blue.800}` -> `blue-800`, and -> the hex it resolves to.
const refPath = (ref) => ref.replace(/[{}]/g, '').split('.');

function resolve$(ref) {
  const [, ...rest] = refPath(ref); // drop the leading "color"
  let node = primitives;
  for (const part of rest) node = node?.[part];
  if (!node || !('$value' in node)) throw new Error(`Unresolved token reference: ${ref}`);
  return node.$value.toUpperCase();
}

function aliasName(ref) {
  const [, ...rest] = refPath(ref);
  const name = rest.join('-');
  return name.replace(/-default$/, '');
}

const GROUP_ORDER = ['interactive', 'surface', 'text', 'border', 'brand', 'status'];

const semanticGroups = GROUP_ORDER
  .filter((g) => semantic[g])
  .map((g) => ({
    label: g[0].toUpperCase() + g.slice(1),
    rows: Object.entries(semantic[g])
      .filter(([k, v]) => !k.startsWith('$') && v && typeof v === 'object' && '$value' in v)
      .map(([k, v]) => {
        const hex = resolve$(v.$value);
        const row = {
          token: `sr.color.${g}.${k}`,
          hex,
          text: onColour(hex),
          alias: aliasName(v.$value),
          usage: v.$description || '',
        };
        const stroke = strokeFor(hex);
        if (stroke) row.stroke = stroke;
        return row;
      }),
  }));

// ── emit ────────────────────────────────────────────────────────────────────

// Compact one-object-per-line printing, so the generated block stays reviewable
// in a diff rather than collapsing into a single unreadable line.
const obj = (o) =>
  `{ ${Object.entries(o).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(', ')} }`;

const groupBlock = (g, key) =>
  [
    '  {',
    `    label: ${JSON.stringify(g.label)}, desc: ${JSON.stringify(g.desc)},`,
    `    ${key}: [`,
    ...g[key].map((s) => `      ${obj(s)},`),
    '    ],',
    '  },',
  ].join('\n');

const semanticBlock = (g) =>
  [
    '  {',
    `    label: ${JSON.stringify(g.label)},`,
    '    rows: [',
    ...g.rows.map((r) => `      ${obj(r)},`),
    '    ],',
    '  },',
  ].join('\n');

const generated = [
  'const PRIMITIVE_GROUPS = [',
  ...primitiveGroups.map((g) => groupBlock(g, 'swatches')),
  '];',
  '',
  'const SEMANTIC_GROUPS = [',
  ...semanticGroups.map(semanticBlock),
  '];',
].join('\n');

const START = '// <generated:colour-data>';
const END = '// </generated:colour-data>';

const source = readFileSync(resolve(ROOT, PLUGIN), 'utf8');
const start = source.indexOf(START);
const end = source.indexOf(END);

if (start === -1 || end === -1) {
  console.error(`${PLUGIN}: missing the ${START} / ${END} markers.`);
  process.exit(1);
}

const banner =
  `${START}\n` +
  '// Generated by scripts/sync-figma-colour-guide.mjs from foundations/tokens/.\n' +
  '// Do not edit by hand: run `npm run build:tokens` after changing the tokens.\n\n';

const next = source.slice(0, start) + banner + generated + '\n\n' + source.slice(end);

if (CHECK) {
  if (next !== source) {
    console.error(`OUT OF DATE: ${PLUGIN}`);
    process.exitCode = 1;
  } else {
    console.log('Figma colour-guide plugin is in sync with the token JSON.');
  }
} else {
  writeFileSync(resolve(ROOT, PLUGIN), next);
  const swatches = primitiveGroups.reduce((n, g) => n + g.swatches.length, 0);
  const rows = semanticGroups.reduce((n, g) => n + g.rows.length, 0);
  console.log(`Figma colour-guide plugin synced: ${swatches} primitives, ${rows} semantic tokens.`);
}
