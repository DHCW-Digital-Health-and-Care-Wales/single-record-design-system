#!/usr/bin/env node
/**
 * push-variables.js  v3
 *
 * Pushes DHCW design tokens to Figma as Variables via the REST API.
 *
 * v3 changes:
 *   - Dark mode added: Single Record collection now has two modes — Light and Dark.
 *     All colour semantic tokens carry both mode values. Spacing and typography
 *     tokens carry the same value for both modes (they don't change with theme).
 *   - SR initial mode renamed from "Default" → "Light" (upsert handles transition).
 *
 * v2 changes:
 *   - Upsert support: fetches existing variables first, UPDATEs matching
 *     ones, CREATEs new ones. Safe to re-run without deleting collections.
 *   - Spacing tokens added: primitives (space.*) + semantic (spacing.*)
 *
 * Collections in the target Figma file:
 *   "Primitives"    — raw values. Hidden from publishing. One mode: Default.
 *   "Single Record" — semantic aliases. Published to library. Two modes: Light | Dark.
 *
 * Usage:
 *   FIGMA_TOKEN=<token> FIGMA_FILE_KEY=<key> node figma/scripts/push-variables.js
 *
 * Notes:
 *   - Composite typography tokens are flattened into individual property variables.
 *   - em-based letter-spacing values are pushed as STRING variables.
 *   - Spacing/breakpoint FLOAT variables scoped to GAP + WIDTH_HEIGHT only.
 *   - resolvedType and variableCollectionId are omitted from UPDATE payloads
 *     (Figma API treats these as immutable).
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ─── Environment ───────────────────────────────────────────────────────────────

const FIGMA_TOKEN    = process.env.FIGMA_TOKEN;
const FIGMA_FILE_KEY = process.env.FIGMA_FILE_KEY;

if (!FIGMA_TOKEN || !FIGMA_FILE_KEY) {
  console.error('Error: required environment variables are not set.\n');
  console.error('  FIGMA_TOKEN     — Personal access token with Variables Read + Write scope');
  console.error('  FIGMA_FILE_KEY  — Key from the Figma file URL\n');
  console.error('  FIGMA_TOKEN=figd_xxx FIGMA_FILE_KEY=AbCdEf node figma/scripts/push-variables.js');
  process.exit(1);
}

// ─── Load token files ──────────────────────────────────────────────────────────

const ROOT = path.resolve(__dirname, '../..');
const load = rel => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));

const colourPrimTokens     = load('foundations/tokens/primitives/color.json');
const colourSemTokens      = load('foundations/tokens/semantic/color.json');
const colourSemDarkTokens  = load('foundations/tokens/semantic/color.dark.json');
const typoPrimTokens       = load('foundations/tokens/primitives/typography.json');
const typoSemTokens        = load('foundations/tokens/semantic/typography.json');
const spacingPrimTokens    = load('foundations/tokens/primitives/spacing.json');
const spacingSemTokens     = load('foundations/tokens/semantic/spacing.json');
const breakpointTokens     = load('foundations/tokens/breakpoints.json');

// ─── Value helpers ─────────────────────────────────────────────────────────────

function hexToRgba(hex) {
  const h = hex.replace('#', '');
  if (h.length !== 6) throw new Error(`Unexpected hex value: ${hex}`);
  return {
    r: parseInt(h.slice(0, 2), 16) / 255,
    g: parseInt(h.slice(2, 4), 16) / 255,
    b: parseInt(h.slice(4, 6), 16) / 255,
    a: 1,
  };
}

function figmaResolvedType(dtcgType, value) {
  if (dtcgType === 'fontFamily') return 'STRING';
  if (dtcgType === 'fontWeight') return 'FLOAT';
  if (dtcgType === 'dimension')  return (typeof value === 'string' && value.includes('em')) ? 'STRING' : 'FLOAT';
  if (dtcgType === 'color')      return 'COLOR';
  return 'STRING';
}

function toFigmaValue(resolvedType, value) {
  if (resolvedType === 'FLOAT') {
    if (value === '0' || value === '0px') return 0;
    const n = parseFloat(value);
    if (isNaN(n)) throw new Error(`Cannot convert "${value}" to FLOAT`);
    return n;
  }
  if (resolvedType === 'STRING') return Array.isArray(value) ? value.join(', ') : String(value);
  if (resolvedType === 'COLOR')  return hexToRgba(value);
  return value;
}

function figmaScopes(resolvedType, hint) {
  if (resolvedType === 'COLOR')  return ['ALL_SCOPES'];
  if (resolvedType === 'STRING') return hint === 'fontFamily' ? ['FONT_FAMILY'] : ['ALL_SCOPES'];
  if (resolvedType === 'FLOAT') {
    if (hint === 'fontSize')      return ['FONT_SIZE'];
    if (hint === 'lineHeight')    return ['LINE_HEIGHT'];
    if (hint === 'letterSpacing') return ['LETTER_SPACING'];
    if (hint === 'spacing')       return ['GAP', 'WIDTH_HEIGHT'];
    if (hint === 'breakpoint')    return ['WIDTH_HEIGHT'];
    return ['ALL_SCOPES'];
  }
  return ['ALL_SCOPES'];
}

// ─── ID helpers ────────────────────────────────────────────────────────────────

function tempId(ns, tokenPath) {
  return `${ns}__${tokenPath.replace(/[^a-z0-9]/gi, '_')}`;
}

// ─── Token flatteners ──────────────────────────────────────────────────────────

function flattenTokens(obj, prefix = '') {
  const out = [];
  for (const [key, val] of Object.entries(obj)) {
    if (key.startsWith('$')) continue;
    const tp = prefix ? `${prefix}.${key}` : key;
    if (val && typeof val === 'object' && '$value' in val) {
      out.push({ path: tp, value: val.$value, dtcgType: val.$type || null });
    } else if (val && typeof val === 'object') {
      out.push(...flattenTokens(val, tp));
    }
  }
  return out;
}

function flattenTypographyComposites(obj, prefix = '') {
  const out = [];
  for (const [key, val] of Object.entries(obj)) {
    if (key.startsWith('$')) continue;
    const tp = prefix ? `${prefix}.${key}` : key;
    if (val?.$type === 'typography' && typeof val.$value === 'object') {
      for (const [propKey, ref] of Object.entries(val.$value)) {
        out.push({ compositePath: tp, propKey, ref });
      }
    } else if (val && typeof val === 'object') {
      out.push(...flattenTypographyComposites(val, tp));
    }
  }
  return out;
}

// ─── Naming conventions ────────────────────────────────────────────────────────

const ABBR = new Set(['xs', 'sm', 'md', 'lg', 'xl']);

function titleCase(str) {
  return str.split('-').map(w =>
    ABBR.has(w.toLowerCase()) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)
  ).join(' ');
}

function colourPrimToFigmaName(p) {
  return p.replace(/^color\./, '').split('.').filter(s => s !== 'default').map(titleCase).join('/');
}

function colourSemToFigmaName(p) {
  return p.replace(/^sr\.color\./, '').split('.').map(titleCase).join('/');
}

function genericPrimToFigmaName(p) {
  return p.split('.').map(titleCase).join('/');
}

function typoSemToFigmaName(compositePath, propKey) {
  const labels = {
    fontFamily: 'Font Family', fontSize: 'Font Size', lineHeight: 'Line Height',
    fontWeight: 'Font Weight', letterSpacing: 'Letter Spacing',
  };
  const parts = compositePath.replace(/^sr\.typography\./, '').split('.').map(titleCase);
  return `Typography/${parts.join('/')}/${labels[propKey] || titleCase(propKey)}`;
}

function spacingPrimToFigmaName(p) { return p.split('.').map(titleCase).join('/'); }
function spacingSemToFigmaName(p)  { return p.split('.').map(titleCase).join('/'); }

// ─── Flatten all token sources ─────────────────────────────────────────────────

const colourPrimEntries     = flattenTokens(colourPrimTokens);
const colourSemEntries      = flattenTokens(colourSemTokens);         // light mode
const colourSemDarkEntries  = flattenTokens(colourSemDarkTokens);     // dark mode
const typoPrimEntries       = flattenTokens(typoPrimTokens);
const typoSemEntries        = flattenTypographyComposites(typoSemTokens);
const spacingPrimEntries    = flattenTokens(spacingPrimTokens);
const spacingSemEntries     = flattenTokens(spacingSemTokens);
const bpEntries             = flattenTokens(breakpointTokens);

// ─── Fetch existing Figma variables ────────────────────────────────────────────

async function fetchExisting() {
  const res = await fetch(
    `https://api.figma.com/v1/files/${FIGMA_FILE_KEY}/variables/local`,
    { headers: { 'X-Figma-Token': FIGMA_TOKEN } }
  );

  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    console.warn(`  ⚠  Could not fetch existing variables (HTTP ${res.status}${j.message ? ': ' + j.message : ''}) — all will be CREATEd.`);
    return { collections: {}, variables: {} };
  }

  const json        = await res.json();
  const collections = {};
  const variables   = {};

  for (const coll of Object.values(json.meta?.variableCollections ?? {})) {
    const modes = {};
    for (const m of coll.modes ?? []) modes[m.name] = m.modeId;
    collections[coll.name] = { id: coll.id, modes };
  }

  for (const v of Object.values(json.meta?.variables ?? {})) {
    if (!v.remote) variables[`${v.variableCollectionId}/${v.name}`] = v.id;
  }

  const collCount = Object.keys(collections).length;
  const varCount  = Object.keys(variables).length;
  if (collCount) {
    console.log(`  Found ${varCount} existing variable(s) across ${collCount} collection(s)`);
    console.log(`  → Matching variables will be UPDATEd; new variables will be CREATEd.\n`);
  } else {
    console.log(`  No existing SR collections found — all variables will be CREATEd.\n`);
  }

  return { collections, variables };
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function push() {
  console.log('\nSingle Record Design System — Figma Variable Push  v3');
  console.log('─'.repeat(54));
  console.log(`  File key : ${FIGMA_FILE_KEY}\n`);

  const existing = await fetchExisting();

  // ── Resolve collection and mode IDs ──────────────────────────────────────────

  const existingPrimColl = existing.collections['Primitives'];
  const existingSemColl  = existing.collections['Single Record'];

  const COLL_PRIM_ID = existingPrimColl?.id ?? 'coll__primitives';
  const COLL_SEM_ID  = existingSemColl?.id  ?? 'coll__sr';

  // Primitives: one mode (Default)
  const MODE_PRIM_ID = existingPrimColl?.modes?.['Default'] ?? 'mode__prim_default';

  // Single Record: two modes — Light and Dark.
  // Fall back to 'Default' for Light to handle upgrading from v2 deployments.
  const MODE_SEM_LIGHT_ID = existingSemColl?.modes?.['Light']
    ?? existingSemColl?.modes?.['Default']
    ?? 'mode__sr_light';
  const MODE_SEM_DARK_ID  = existingSemColl?.modes?.['Dark'] ?? 'mode__sr_dark';

  const darkModeIsNew = !existingSemColl?.modes?.['Dark'];

  // ── Helper: resolve variable ID ───────────────────────────────────────────────

  function resolveVarId(collId, figmaName, ns, tokenPath) {
    const existId = existing.variables[`${collId}/${figmaName}`];
    return { id: existId ?? tempId(ns, tokenPath), isExisting: !!existId };
  }

  // ── Build primitive lookup ────────────────────────────────────────────────────

  const primLookup = {};

  function registerPrim(collId, figmaName, ns, tokenPath, resolvedType) {
    const { id } = resolveVarId(collId, figmaName, ns, tokenPath);
    primLookup[tokenPath] = { id, resolvedType };
  }

  for (const { path: p } of colourPrimEntries)
    registerPrim(COLL_PRIM_ID, colourPrimToFigmaName(p), 'prim', p, 'COLOR');

  for (const { path: p, value, dtcgType } of typoPrimEntries)
    registerPrim(COLL_PRIM_ID, genericPrimToFigmaName(p), 'prim', p, figmaResolvedType(dtcgType, value));

  for (const { path: p } of spacingPrimEntries)
    registerPrim(COLL_PRIM_ID, spacingPrimToFigmaName(p), 'prim_sp', p, 'FLOAT');

  for (const { path: p } of bpEntries)
    registerPrim(COLL_PRIM_ID, genericPrimToFigmaName(p), 'prim', p, 'FLOAT');

  // ── Collections ──────────────────────────────────────────────────────────────

  const variableCollections = [
    {
      action:               existingPrimColl ? 'UPDATE' : 'CREATE',
      id:                   COLL_PRIM_ID,
      name:                 'Primitives',
      hiddenFromPublishing: true,
      ...(existingPrimColl ? {} : { initialModeId: MODE_PRIM_ID }),
    },
    {
      action:               existingSemColl ? 'UPDATE' : 'CREATE',
      id:                   COLL_SEM_ID,
      name:                 'Single Record',
      hiddenFromPublishing: false,
      ...(existingSemColl ? {} : { initialModeId: MODE_SEM_LIGHT_ID }),
    },
  ];

  // ── Modes ────────────────────────────────────────────────────────────────────
  // Rename any legacy "Default" mode to "Light"; CREATE Dark if it doesn't exist.

  const variableModes = [
    { action: 'UPDATE', id: MODE_PRIM_ID,       name: 'Default', variableCollectionId: COLL_PRIM_ID },
    { action: 'UPDATE', id: MODE_SEM_LIGHT_ID,  name: 'Light',   variableCollectionId: COLL_SEM_ID  },
    { action: darkModeIsNew ? 'CREATE' : 'UPDATE', id: MODE_SEM_DARK_ID, name: 'Dark', variableCollectionId: COLL_SEM_ID },
  ];

  // ── Variable builder ─────────────────────────────────────────────────────────

  const variables          = [];
  const variableModeValues = [];
  const warnings           = [];

  function addVar({ collId, figmaName, ns, tokenPath, resolvedType, hidden, scopes, modeValues }) {
    const { id, isExisting } = resolveVarId(collId, figmaName, ns, tokenPath);

    const entry = { action: isExisting ? 'UPDATE' : 'CREATE', id, name: figmaName, hiddenFromPublishing: hidden, scopes };
    if (!isExisting) { entry.variableCollectionId = collId; entry.resolvedType = resolvedType; }
    variables.push(entry);

    for (const { modeId, value } of modeValues) {
      variableModeValues.push({ variableId: id, modeId, value });
    }
  }

  // ── Primitives: colour ───────────────────────────────────────────────────────

  for (const { path: p, value } of colourPrimEntries) {
    addVar({
      collId: COLL_PRIM_ID, figmaName: colourPrimToFigmaName(p), ns: 'prim', tokenPath: p,
      resolvedType: 'COLOR', hidden: true, scopes: ['ALL_SCOPES'],
      modeValues: [{ modeId: MODE_PRIM_ID, value: hexToRgba(value) }],
    });
  }

  // ── Primitives: typography ───────────────────────────────────────────────────

  for (const { path: p, value, dtcgType } of typoPrimEntries) {
    const resolvedType = figmaResolvedType(dtcgType, value);
    let hint = 'other';
    if (p.includes('size'))                                          hint = 'fontSize';
    else if (p.includes('line-height'))                              hint = 'lineHeight';
    else if (p.includes('letter-spacing') && resolvedType === 'FLOAT') hint = 'letterSpacing';
    else if (p.includes('family'))                                   hint = 'fontFamily';

    addVar({
      collId: COLL_PRIM_ID, figmaName: genericPrimToFigmaName(p), ns: 'prim', tokenPath: p,
      resolvedType, hidden: true, scopes: figmaScopes(resolvedType, hint),
      modeValues: [{ modeId: MODE_PRIM_ID, value: toFigmaValue(resolvedType, value) }],
    });
  }

  // ── Primitives: spacing ──────────────────────────────────────────────────────

  for (const { path: p, value } of spacingPrimEntries) {
    addVar({
      collId: COLL_PRIM_ID, figmaName: spacingPrimToFigmaName(p), ns: 'prim_sp', tokenPath: p,
      resolvedType: 'FLOAT', hidden: true, scopes: figmaScopes('FLOAT', 'spacing'),
      modeValues: [{ modeId: MODE_PRIM_ID, value: toFigmaValue('FLOAT', value) }],
    });
  }

  // ── Primitives: breakpoints ──────────────────────────────────────────────────

  for (const { path: p, value } of bpEntries) {
    addVar({
      collId: COLL_PRIM_ID, figmaName: genericPrimToFigmaName(p), ns: 'prim', tokenPath: p,
      resolvedType: 'FLOAT', hidden: true, scopes: figmaScopes('FLOAT', 'breakpoint'),
      modeValues: [{ modeId: MODE_PRIM_ID, value: toFigmaValue('FLOAT', value) }],
    });
  }

  // ── Build dark mode alias lookup ─────────────────────────────────────────────
  // Maps token path → primitive alias ID for the dark mode value.

  const darkAliasMap = {};
  for (const { path: p, value: aliasRef } of colourSemDarkEntries) {
    const match = aliasRef.match(/^\{(.+)\}$/);
    if (!match) { warnings.push(`Dark sem "${p}": "${aliasRef}" not an alias — skipped.`); continue; }
    const prim = primLookup[match[1]];
    if (!prim)  { warnings.push(`Dark sem "${p}": no primitive for "${match[1]}" — skipped.`); continue; }
    darkAliasMap[p] = { type: 'VARIABLE_ALIAS', id: prim.id };
  }

  // ── Semantic: colour (Light + Dark modes) ────────────────────────────────────

  for (const { path: p, value: aliasRef } of colourSemEntries) {
    const match = aliasRef.match(/^\{(.+)\}$/);
    if (!match) { warnings.push(`Light sem "${p}": "${aliasRef}" not an alias — skipped.`); continue; }
    const prim = primLookup[match[1]];
    if (!prim)  { warnings.push(`Light sem "${p}": no primitive for "${match[1]}" — skipped.`); continue; }

    const lightValue = { type: 'VARIABLE_ALIAS', id: prim.id };
    const darkValue  = darkAliasMap[p] ?? lightValue; // fall back to light if no dark override

    addVar({
      collId: COLL_SEM_ID, figmaName: colourSemToFigmaName(p), ns: 'sem', tokenPath: p,
      resolvedType: 'COLOR', hidden: false, scopes: ['ALL_SCOPES'],
      modeValues: [
        { modeId: MODE_SEM_LIGHT_ID, value: lightValue },
        { modeId: MODE_SEM_DARK_ID,  value: darkValue  },
      ],
    });
  }

  // ── Semantic: typography — same value in both modes ──────────────────────────

  for (const { compositePath, propKey, ref } of typoSemEntries) {
    const match = ref.match(/^\{(.+)\}$/);
    if (!match) { warnings.push(`Typo sem "${compositePath}.${propKey}": not alias — skipped.`); continue; }
    const prim = primLookup[match[1]];
    if (!prim)  { warnings.push(`Typo sem "${compositePath}.${propKey}": no primitive for "${match[1]}" — skipped.`); continue; }

    const alias = { type: 'VARIABLE_ALIAS', id: prim.id };
    addVar({
      collId: COLL_SEM_ID, figmaName: typoSemToFigmaName(compositePath, propKey),
      ns: 'sem', tokenPath: `${compositePath}.${propKey}`,
      resolvedType: prim.resolvedType, hidden: false, scopes: figmaScopes(prim.resolvedType, propKey),
      modeValues: [
        { modeId: MODE_SEM_LIGHT_ID, value: alias },
        { modeId: MODE_SEM_DARK_ID,  value: alias },  // typography unchanged across modes
      ],
    });
  }

  // ── Semantic: spacing — same value in both modes ─────────────────────────────

  for (const { path: p, value: aliasRef } of spacingSemEntries) {
    const match = aliasRef.match(/^\{(.+)\}$/);
    if (!match) { warnings.push(`Spacing sem "${p}": not alias — skipped.`); continue; }
    const prim = primLookup[match[1]];
    if (!prim)  { warnings.push(`Spacing sem "${p}": no primitive for "${match[1]}" — skipped.`); continue; }

    const alias = { type: 'VARIABLE_ALIAS', id: prim.id };
    addVar({
      collId: COLL_SEM_ID, figmaName: spacingSemToFigmaName(p), ns: 'sem_sp', tokenPath: p,
      resolvedType: 'FLOAT', hidden: false, scopes: figmaScopes('FLOAT', 'spacing'),
      modeValues: [
        { modeId: MODE_SEM_LIGHT_ID, value: alias },
        { modeId: MODE_SEM_DARK_ID,  value: alias },  // spacing unchanged across modes
      ],
    });
  }

  // ── Warnings ─────────────────────────────────────────────────────────────────

  if (warnings.length) {
    console.warn('Warnings:');
    warnings.forEach(w => console.warn('  ⚠ ', w));
    console.warn('');
  }

  // ── Summary ──────────────────────────────────────────────────────────────────

  const creates = variables.filter(v => v.action === 'CREATE').length;
  const updates = variables.filter(v => v.action === 'UPDATE').length;

  console.log('  Primitives collection (1 mode: Default)');
  console.log(`    Colour        ${colourPrimEntries.length}`);
  console.log(`    Typography    ${typoPrimEntries.length}`);
  console.log(`    Spacing       ${spacingPrimEntries.length}`);
  console.log(`    Breakpoints   ${bpEntries.length}`);
  console.log(`    Subtotal      ${colourPrimEntries.length + typoPrimEntries.length + spacingPrimEntries.length + bpEntries.length}`);
  console.log('');
  console.log('  Single Record collection (2 modes: Light | Dark)');
  console.log(`    Colour        ${colourSemEntries.length}  (${colourSemEntries.length * 2} mode values)`);
  console.log(`    Typography    ${typoSemEntries.length}  (same value both modes)`);
  console.log(`    Spacing       ${spacingSemEntries.length}   (same value both modes)`);
  console.log(`    Subtotal      ${colourSemEntries.length + typoSemEntries.length + spacingSemEntries.length}`);
  console.log('');
  console.log(`  Mode change: "Default" → "Light"  |  Dark mode: ${darkModeIsNew ? 'CREATE (new)' : 'UPDATE (exists)'}`);
  console.log(`  Variables: ${creates} CREATE  ${updates} UPDATE`);
  console.log(`  Mode values to set: ${variableModeValues.length}`);
  console.log('');

  // ── POST to Figma API ─────────────────────────────────────────────────────────

  const payload = { variableCollections, variableModes, variables, variableModeValues };
  const url     = `https://api.figma.com/v1/files/${FIGMA_FILE_KEY}/variables`;

  const res = await fetch(url, {
    method:  'POST',
    headers: { 'X-Figma-Token': FIGMA_TOKEN, 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  });

  const json = await res.json();

  if (!res.ok) {
    console.error(`Figma API error (HTTP ${res.status}):`);
    console.error(JSON.stringify(json, null, 2));
    process.exit(1);
  }

  console.log('✓ Done. Open Figma → Local variables to verify.');
  console.log('');
  console.log('  Primitives (hidden, 1 mode)');
  console.log('    Blue/ Cyan/ Navy/ Red/ Green/ Yellow/ Grey/ White/ Focus Yellow/ Info Blue/');
  console.log('    Font/ Space/ Breakpoint/');
  console.log('');
  console.log('  Single Record (published, Light | Dark modes)');
  console.log('    Interactive/ Surface/ Text/ Border/ Status/  ← colour changes per mode');
  console.log('    Typography/ Spacing/                         ← same value both modes');
}

push().catch(err => {
  console.error('Unexpected error:', err.message);
  process.exit(1);
});
