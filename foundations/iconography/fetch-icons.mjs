#!/usr/bin/env node
/**
 * fetch-icons.mjs
 * Fetches Lucide SVGs via curl, normalises them to the SR visual spec, and
 * writes them to foundations/iconography/svg/{domain}/{sr-name}.svg
 *
 * ESM, and named .mjs, because the repo root is `"type": "module"` (DDR-007).
 * As CommonJS named .js this script threw `require is not defined` on every
 * invocation — so it had been unrunnable for months, and four icons had been
 * added to svg/ by hand with no entry here and no recorded Lucide provenance.
 * `npm run check:icons` now fails on exactly that drift.
 *
 * Repeat workflow:
 *   1. Add new icons to the ICONS array below.
 *   2. Run: node foundations/iconography/fetch-icons.mjs
 *
 * SR SVG spec applied to every icon:
 *   - width / height  → 1em  (scales with font-size / size tokens)
 *   - fill            → none
 *   - stroke          → currentColor
 *   - stroke-width    → 1  (DDR-023 — Lucide ships 2; do not restore it)
 *   - stroke-linecap  → round
 *   - stroke-linejoin → round
 *   - aria-hidden     → true
 *   - focusable       → false
 *
 * Substitutions (original Lucide name no longer exists):
 *   nav/filter      — filter       → list-filter   (renamed in Lucide)
 *   clinical/consent — file-check-2 → file-pen      (not found; file-pen = consent/signed document)
 *
 * Both substitutions predate the version pin below and are kept as recorded.
 * Verify them against the pinned version before adding more: several names that
 * appear "renamed" are only absent from Lucide's `main` branch, not from the
 * release this repository builds against.
 */

import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const HERE     = dirname(fileURLToPath(import.meta.url));
const SVG_DIR  = join(HERE, 'svg');

// Read from the pinned `lucide-static` package, not from the Lucide repo's
// `main` branch over the network.
//
// This script used to curl
// `raw.githubusercontent.com/lucide-icons/lucide/main/icons/{name}.svg`, so the
// icon set was sourced from whatever `main` happened to be on the day it ran —
// unpinnable, unreproducible, and needing network access to build. `main` has
// since moved ahead of the published release: `trash-2`, `history` and
// `circle-help` all 404 there while all three are present in 1.41.0. Fetching
// `main` therefore reported working icons as missing, and would silently have
// swapped geometry under us whenever Lucide redrew a glyph.
//
// The version below is pinned exactly (no caret) and carried in the lock file,
// so the same input produces the same 144 SVGs on every machine and in CI.
// To take a newer Lucide, bump it deliberately and review the resulting diff.
const require = createRequire(import.meta.url);
const ICON_DIR = join(dirname(require.resolve('lucide-static/package.json')), 'icons');

// ── Icon catalogue ─────────────────────────────────────────────────────────────
const ICONS = [
  // Navigation & UI chrome (17)
  { domain: 'nav', name: 'home',           lucide: 'house' },
  { domain: 'nav', name: 'menu',           lucide: 'menu' },
  { domain: 'nav', name: 'back',           lucide: 'arrow-left' },
  { domain: 'nav', name: 'forward',        lucide: 'arrow-right' },
  { domain: 'nav', name: 'chevron-right',  lucide: 'chevron-right' },
  { domain: 'nav', name: 'chevron-left',   lucide: 'chevron-left' },
  { domain: 'nav', name: 'chevron-down',   lucide: 'chevron-down' },
  { domain: 'nav', name: 'chevron-up',     lucide: 'chevron-up' },
  { domain: 'nav', name: 'close',          lucide: 'x' },
  { domain: 'nav', name: 'search',         lucide: 'search' },
  { domain: 'nav', name: 'settings',       lucide: 'settings' },
  { domain: 'nav', name: 'filter',         lucide: 'list-filter',  note: 'filter renamed to list-filter in current Lucide' },
  { domain: 'nav', name: 'sort',           lucide: 'arrow-up-down' },
  { domain: 'nav', name: 'more-horizontal', lucide: 'ellipsis',      note: 'renamed from nav/more — disambiguates now both orientations exist' },
  { domain: 'nav', name: 'clear',          lucide: 'circle-x' },
  { domain: 'nav', name: 'dashboard',      lucide: 'layout-grid' },
  { domain: 'nav', name: 'menu-kebab',     lucide: 'ellipsis-vertical', note: 'renamed from nav/menu2 — pairs with nav/menu (burger)' },
  { domain: 'nav', name: 'log-out',        lucide: 'log-out' },
  { domain: 'nav', name: 'account',        lucide: 'circle-user' },
  { domain: 'nav', name: 'support',        lucide: 'circle-help' },
  { domain: 'nav', name: 'feedback',       lucide: 'message-square-text' },

  // Actions & editing (20)
  { domain: 'action', name: 'add',      lucide: 'plus' },
  { domain: 'action', name: 'remove',   lucide: 'minus' },
  { domain: 'action', name: 'edit',     lucide: 'pencil' },
  { domain: 'action', name: 'delete',   lucide: 'trash-2' },
  { domain: 'action', name: 'save',     lucide: 'save' },
  { domain: 'action', name: 'download', lucide: 'download' },
  { domain: 'action', name: 'upload',   lucide: 'upload' },
  { domain: 'action', name: 'copy',     lucide: 'copy' },
  { domain: 'action', name: 'print',    lucide: 'printer' },
  { domain: 'action', name: 'share',    lucide: 'share-2' },
  { domain: 'action', name: 'link',     lucide: 'link' },
  { domain: 'action', name: 'refresh',  lucide: 'refresh-cw' },
  { domain: 'action', name: 'undo',     lucide: 'undo-2' },
  { domain: 'action', name: 'lock',     lucide: 'lock' },
  { domain: 'action', name: 'check',    lucide: 'check' },
  { domain: 'action', name: 'edit-note', lucide: 'file-pen',  note: 'renamed from action/edit2; glyph moved square-pen -> file-pen (pencil on document)' },
  { domain: 'action', name: 'eye',      lucide: 'eye' },
  { domain: 'action', name: 'eye-off',  lucide: 'eye-off' },
  { domain: 'action', name: 'hold',     lucide: 'pause' , note: 'Hold is the label used across SR apps; there is no media-pause use case, so this glyph carries one meaning (DDR-029)'},
  { domain: 'action', name: 'scan',     lucide: 'scan-barcode', note: 'scan-barcode (framed scanner), NOT barcode. The entry said barcode for months but never took effect because the generator could not run; the committed artwork was always scan-barcode. Fixing the generator briefly "corrected" the icon to the wrong glyph.' },
  // Previously present as SVG files with no generator entry, so their Lucide
  // provenance was unrecorded and re-running this script would not reproduce
  // them. Adopted here and given the meanings assigned in DDR-029.
  { domain: 'action', name: 'send',     lucide: 'send' },
  { domain: 'action', name: 'star',     lucide: 'star' },
  { domain: 'action', name: 'bookmark', lucide: 'bookmark', note: 'moved from schedule/ — bookmarking is not a scheduling concept' },
  // Additions
  { domain: 'action', name: 'play',      lucide: 'play' },
  { domain: 'action', name: 'expand',    lucide: 'maximize-2' },
  { domain: 'action', name: 'collapse',  lucide: 'minimize-2' },
  { domain: 'action', name: 'unlock',    lucide: 'lock-open', note: 'pairs with action/lock; a lock state with no unlock counterpart is incomplete' },
  { domain: 'action', name: 'watchlist', lucide: 'binoculars', note: 'under active monitoring; distinct from bookmark (save) and star (personal attention)' },

  // Status & feedback (9)
  { domain: 'status', name: 'success',  lucide: 'circle-check' },
  { domain: 'status', name: 'error-circle', lucide: 'circle-alert' },
  { domain: 'status', name: 'warning',  lucide: 'triangle-alert', note: 'Sole owner of the triangle. status/alert was retired as an undifferentiated duplicate; comms/alert (bell-ring) covers "needs attention" (DDR-029)' },
  { domain: 'status', name: 'info',     lucide: 'info' },
  { domain: 'status', name: 'critical', lucide: 'siren' },
  { domain: 'status', name: 'pending',  lucide: 'clock' },
  { domain: 'status', name: 'loading',  lucide: 'loader-circle' },
  { domain: 'status', name: 'flagged',  lucide: 'flag' },

  // Patient & people (10)
  { domain: 'people', name: 'patient',     lucide: 'user' },
  { domain: 'people', name: 'clinician',   lucide: 'user-round-check' },
  { domain: 'people', name: 'team',        lucide: 'users' },
  { domain: 'people', name: 'contact',     lucide: 'contact' },
  { domain: 'people', name: 'carer',       lucide: 'heart-handshake' },
  { domain: 'people', name: 'next-of-kin', lucide: 'users-round' },
  { domain: 'people', name: 'gp',          lucide: 'stethoscope' },
  { domain: 'people', name: 'specialist',  lucide: 'microscope' },
  { domain: 'people', name: 'admin-staff', lucide: 'user-cog' },
  { domain: 'people', name: 'anonymous',   lucide: 'user-x' },
  { domain: 'people', name: 'demographics',   lucide: 'id-card' },
  { domain: 'people', name: 'patient-search', lucide: 'user-round-search' },

  // Clinical records & data (18)
  // Note: clinical/record and file/pdf both map to file-text — distinct SR aliases, same Lucide source
  { domain: 'clinical', name: 'record',      lucide: 'file-text' },
  { domain: 'clinical', name: 'observation', lucide: 'activity' },
  { domain: 'clinical', name: 'vitals',      lucide: 'heart-pulse' },
  { domain: 'clinical', name: 'medication',  lucide: 'pill' },
  { domain: 'clinical', name: 'allergy',     lucide: 'shield-alert' },
  { domain: 'clinical', name: 'test',        lucide: 'flask-conical', note: 'renamed from clinical/lab-result — the flask is an ordered test, not the returned finding' },
  { domain: 'clinical', name: 'imaging',     lucide: 'scan' },
  { domain: 'clinical', name: 'procedure',   lucide: 'syringe' },
  { domain: 'clinical', name: 'note',        lucide: 'notebook-pen' },
  { domain: 'clinical', name: 'history',     lucide: 'history' },
  { domain: 'clinical', name: 'referral',    lucide: 'file-output', note: 'reassigned from send — the paper plane belongs to action/send (DDR-029); a referral is a letter sent onward' },
  { domain: 'clinical', name: 'discharge',   lucide: 'arrow-right-from-line', note: 'Was log-out, which now belongs to nav/log-out. A departure across a boundary, rather than a session metaphor (DDR-029)' },
  { domain: 'clinical', name: 'admission',   lucide: 'log-in' },
  { domain: 'clinical', name: 'blood',       lucide: 'droplet' },
  { domain: 'clinical', name: 'treatment',   lucide: 'cross', note: 'renamed from clinical/cross — the glyph was previously unassigned; now means care delivered' },
  { domain: 'clinical', name: 'dna',         lucide: 'dna' },
  // Additions — the order/finding and ask/sign-off splits (DDR-029)
  { domain: 'clinical', name: 'result',      lucide: 'clipboard-list', note: 'Replaces clinical/diagnosis, which had no observed label use — result is the concept products actually surface (DDR-029)' },
  { domain: 'clinical', name: 'request',     lucide: 'file-plus', note: 'not file/signed — a request is an outbound ask, signed is a completed sign-off' },
  { domain: 'clinical', name: 'assessment',  lucide: 'clipboard-pen', note: 'broad clinical judgement; deliberately not merged into clinical/vitals' },
  { domain: 'clinical', name: 'attendance',  lucide: 'door-open', note: 'urgent and emergency care arrival; distinct from clinical/admission (taken onto a ward)' },

  // Scheduling & appointments (10)
  { domain: 'schedule', name: 'add-appointment',    lucide: 'calendar-plus' },
  { domain: 'schedule', name: 'cancel-appointment', lucide: 'calendar-x' },
  { domain: 'schedule', name: 'time',               lucide: 'clock-3' },
  { domain: 'schedule', name: 'recurring',          lucide: 'repeat' },
  { domain: 'schedule', name: 'ward-round',         lucide: 'route' },
  { domain: 'schedule', name: 'waiting-list',       lucide: 'list-ordered' },
  { domain: 'schedule', name: 'duration',           lucide: 'timer' },
  { domain: 'schedule', name: 'overnight',          lucide: 'moon' },
  { domain: 'schedule', name: 'appointment',        lucide: 'calendar-clock', note: 'A booked event: a calendar carrying a time. Was schedule/urgent, briefly schedule/priority — both read as severity, which collides with clinical urgency (status/critical)' },
  { domain: 'schedule', name: 'calendar',           lucide: 'calendar', note: 'the calendar surface itself; schedule/appointment is a booked event' },
  { domain: 'schedule', name: 'events',             lucide: 'calendar-days' },

  // Location & organisation (11)
  { domain: 'location', name: 'ward',         lucide: 'building-2' },
  { domain: 'location', name: 'hospital',     lucide: 'hospital' },
  { domain: 'location', name: 'gp-practice',  lucide: 'house-plus' },
  { domain: 'location', name: 'bed',          lucide: 'bed' },
  { domain: 'location', name: 'room',         lucide: 'door-closed', note: 'Was door-open, which now means arrival (clinical/attendance). A closed door is a room; an opening door is someone arriving' },
  { domain: 'location', name: 'map-pin',      lucide: 'map-pin' },
  { domain: 'location', name: 'department',   lucide: 'landmark' },
  { domain: 'location', name: 'organisation', lucide: 'network' },
  { domain: 'location', name: 'region',       lucide: 'map' },
  { domain: 'location', name: 'ambulance',    lucide: 'ambulance' },
  { domain: 'location', name: 'language',     lucide: 'globe' },

  // Communication & messaging (8)
  { domain: 'comms', name: 'message',      lucide: 'message-square' },
  { domain: 'comms', name: 'notification', lucide: 'bell' },
  { domain: 'comms', name: 'alert',        lucide: 'bell-ring' },
  { domain: 'comms', name: 'email',        lucide: 'mail' },
  { domain: 'comms', name: 'phone',        lucide: 'phone' },
  { domain: 'comms', name: 'letter',       lucide: 'mail-open' },
  { domain: 'comms', name: 'unread',       lucide: 'message-square-dot' },
  { domain: 'comms', name: 'task',         lucide: 'square-check' },

  // Documents & files (8)
  // Note: file/pdf and clinical/record both use file-text — distinct SR aliases
  { domain: 'file', name: 'document',   lucide: 'file' },
  { domain: 'file', name: 'pdf',        lucide: 'file-text' },
  { domain: 'file', name: 'image',      lucide: 'image' },
  { domain: 'file', name: 'attachment', lucide: 'paperclip' },
  { domain: 'file', name: 'folder',     lucide: 'folder' },
  { domain: 'file', name: 'archive',    lucide: 'archive' },
  { domain: 'file', name: 'form',       lucide: 'clipboard' },
  { domain: 'file', name: 'signed',     lucide: 'file-check' },
  { domain: 'file', name: 'pin',        lucide: 'pin', note: 'adopted — was an SVG file with no generator entry' },

  // Data & analytics (8)
  { domain: 'data', name: 'chart',      lucide: 'chart-line' },
  { domain: 'data', name: 'table',      lucide: 'table-2' },
  { domain: 'data', name: 'trend-up',   lucide: 'trending-up' },
  { domain: 'data', name: 'trend-down', lucide: 'trending-down' },
  { domain: 'data', name: 'export',     lucide: 'file-down' },
  { domain: 'data', name: 'audit',      lucide: 'shield-check' },
  { domain: 'data', name: 'grid-2x2',   lucide: 'grid-2x2' },
  { domain: 'data', name: 'grid-3x3',   lucide: 'grid-3x3' },

  // Device & hardware (5)
  //
  // A domain of its own rather than entries in action/, because these are
  // hardware affordances surfaced by the .NET MAUI mobile work, not editing
  // actions. They are platform-conditional and absent on web surfaces; filing
  // them under action/ would hide that.
  { domain: 'device', name: 'camera',      lucide: 'camera' },
  { domain: 'device', name: 'camera-swap', lucide: 'switch-camera' },
  { domain: 'device', name: 'video',       lucide: 'video' },
  { domain: 'device', name: 'torch-on',    lucide: 'flashlight' },
  { domain: 'device', name: 'torch-off',   lucide: 'flashlight-off' },
];

// ── SVG normalisation ─────────────────────────────────────────────────────────
function normaliseSvg(raw) {
  return raw.replace(/<svg([^>]*)>/s, (_, attrs) => {
    const viewBoxMatch = attrs.match(/viewBox="([^"]*)"/);
    const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24';
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="${viewBox}" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">`;
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────
const succeeded = [];
const failed    = [];
const notes     = [];
const redrawn   = [];   // existing icons whose ARTWORK changed
const added     = [];

// Run with --check to fail instead of writing when artwork would change. Use it
// in CI and before a Lucide bump.
const CHECK = process.argv.includes('--check');

// Compare shape, not formatting: the drawing instructions only.
const shapeOf = (svg) => (svg.match(/<(?:path|line|rect|circle|polyline|polygon|ellipse)\b[^>]*>/g) || []).join('');

for (const { domain, name, lucide, note } of ICONS) {
  const outDir  = join(SVG_DIR, domain);
  const outFile = join(outDir, `${name}.svg`);

  try {
    // lucide-static prefixes each file with `<!-- @license lucide-static … -->`
    // and wraps the opening tag across several lines. Strip leading comments
    // before the sanity check so the guard tests the markup, not the banner.
    // Attribution lives in foundations/iconography/LICENSE-lucide.txt and the
    // catalogue, not in 144 copies of a comment.
    const raw = readFileSync(join(ICON_DIR, `${lucide}.svg`), 'utf8')
      .replace(/^\s*(?:<!--[\s\S]*?-->\s*)+/, '');
    if (!raw.trim().startsWith('<svg') && !raw.trim().startsWith('<?xml')) {
      failed.push({ domain, name, lucide, reason: 'Unexpected content' });
      continue;
    }
    const next = normaliseSvg(raw);

    // Report artwork that CHANGES, before overwriting it.
    //
    // This exists because of `action/scan`. Its entry said `barcode` while the
    // committed artwork was `scan-barcode` — a framed scanner, in use in Figma
    // prototypes. The mismatch was invisible for months because the generator
    // could not run at all, so the wrong name never took effect. The moment the
    // generator was fixed it "corrected" a working icon to the wrong glyph, and
    // the only trace was one line in `git diff --stat` among twelve others.
    //
    // A rewrite of existing artwork is exactly the change that needs a human to
    // look at it, so it is now announced rather than buried.
    let previous = null;
    try { previous = readFileSync(outFile, 'utf8'); } catch { /* new icon */ }
    if (previous === null) {
      added.push(`${domain}/${name}`);
    } else if (shapeOf(previous) !== shapeOf(next)) {
      redrawn.push({ icon: `${domain}/${name}`, lucide });
    }

    if (!CHECK) {
      mkdirSync(outDir, { recursive: true });
      writeFileSync(outFile, next, 'utf8');
    }
    succeeded.push({ domain, name, lucide });
    if (note) notes.push(`  ${domain}/${name}: ${note}`);
  } catch (err) {
    failed.push({ domain, name, lucide, reason: err.message.split('\n')[0] });
  }
}

console.log(
  `\n✓ ${succeeded.length} icons ${CHECK ? 'checked' : 'written'} `
  + '— foundations/iconography/svg/',
);

if (added.length) {
  console.log(`\n+ ${added.length} new icon(s): ${added.join(', ')}`);
}

if (redrawn.length) {
  console.log(
    `\n⚠  ${redrawn.length} EXISTING icon(s) changed artwork — these are already in\n`
    + '   use in Figma prototypes and products. Look at each one before committing:\n',
  );
  for (const r of redrawn) console.log(`     ${r.icon.padEnd(28)} (lucide: ${r.lucide})`);
  console.log(
    '\n   A change here is either an upstream Lucide redraw (usually fine, still\n'
    + '   worth a glance) or a wrong `lucide:` name in the ICONS array (not fine —\n'
    + '   it silently swaps a working icon for a different glyph).\n',
  );
  if (CHECK) {
    console.error(
      'check failed: artwork would change. Re-run without --check once you have\n'
      + 'reviewed the list above, and commit the SVGs with the reason.\n',
    );
    process.exit(1);
  }
}

if (notes.length) {
  console.log('\nSubstitution notes:');
  notes.forEach(n => console.log(n));
}

if (failed.length) {
  console.error(`\n✗ ${failed.length} failed:`);
  for (const f of failed) {
    console.error(`  ${f.domain}/${f.name} (lucide: ${f.lucide}) — ${f.reason}`);
  }
  process.exit(1);
} else {
  console.log('\nAll icons fetched successfully.\n');
}
