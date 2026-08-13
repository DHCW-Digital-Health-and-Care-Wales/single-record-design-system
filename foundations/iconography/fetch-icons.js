#!/usr/bin/env node
/**
 * fetch-icons.js
 * Fetches Lucide SVGs via curl, normalises them to the SR visual spec, and
 * writes them to foundations/iconography/svg/{domain}/{sr-name}.svg
 *
 * Repeat workflow:
 *   1. Add new icons to the ICONS array below.
 *   2. Run: node foundations/iconography/fetch-icons.js
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
 */

'use strict';

const { writeFileSync, mkdirSync, existsSync } = require('fs');
const { join } = require('path');
const { execSync } = require('child_process');

const SVG_DIR  = join(__dirname, 'svg');
const BASE_URL = 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons';

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
  { domain: 'nav', name: 'more',           lucide: 'ellipsis' },
  { domain: 'nav', name: 'clear',          lucide: 'circle-x' },
  { domain: 'nav', name: 'dashboard',      lucide: 'layout-grid' },
  { domain: 'nav', name: 'menu2',          lucide: 'ellipsis-vertical' },

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
  { domain: 'action', name: 'edit2',    lucide: 'square-pen' },
  { domain: 'action', name: 'eye',      lucide: 'eye' },
  { domain: 'action', name: 'eye-off',  lucide: 'eye-off' },
  { domain: 'action', name: 'hold',     lucide: 'pause' },
  { domain: 'action', name: 'scan',     lucide: 'barcode' },

  // Status & feedback (9)
  { domain: 'status', name: 'success',  lucide: 'circle-check' },
  { domain: 'status', name: 'error-circle', lucide: 'circle-alert' },
  { domain: 'status', name: 'alert',    lucide: 'triangle-alert' },
  { domain: 'status', name: 'warning',  lucide: 'triangle-alert' },
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

  // Clinical records & data (18)
  // Note: clinical/record and file/pdf both map to file-text — distinct SR aliases, same Lucide source
  { domain: 'clinical', name: 'record',      lucide: 'file-text' },
  { domain: 'clinical', name: 'observation', lucide: 'activity' },
  { domain: 'clinical', name: 'vitals',      lucide: 'heart-pulse' },
  { domain: 'clinical', name: 'medication',  lucide: 'pill' },
  { domain: 'clinical', name: 'allergy',     lucide: 'shield-alert' },
  { domain: 'clinical', name: 'diagnosis',   lucide: 'clipboard-list' },
  { domain: 'clinical', name: 'lab-result',  lucide: 'flask-conical' },
  { domain: 'clinical', name: 'imaging',     lucide: 'scan' },
  { domain: 'clinical', name: 'procedure',   lucide: 'syringe' },
  { domain: 'clinical', name: 'note',        lucide: 'notebook-pen' },
  { domain: 'clinical', name: 'history',     lucide: 'history' },
  { domain: 'clinical', name: 'consent',     lucide: 'file-pen',     note: 'file-check-2 not found in current Lucide; file-pen (signed document) used instead' },
  { domain: 'clinical', name: 'referral',    lucide: 'send' },
  { domain: 'clinical', name: 'discharge',   lucide: 'log-out' },
  { domain: 'clinical', name: 'admission',   lucide: 'log-in' },
  { domain: 'clinical', name: 'blood',       lucide: 'droplet' },
  { domain: 'clinical', name: 'cross',       lucide: 'cross' },
  { domain: 'clinical', name: 'dna',         lucide: 'dna' },

  // Scheduling & appointments (10)
  { domain: 'schedule', name: 'appointment',        lucide: 'calendar' },
  { domain: 'schedule', name: 'add-appointment',    lucide: 'calendar-plus' },
  { domain: 'schedule', name: 'cancel-appointment', lucide: 'calendar-x' },
  { domain: 'schedule', name: 'time',               lucide: 'clock-3' },
  { domain: 'schedule', name: 'recurring',          lucide: 'repeat' },
  { domain: 'schedule', name: 'ward-round',         lucide: 'route' },
  { domain: 'schedule', name: 'waiting-list',       lucide: 'list-ordered' },
  { domain: 'schedule', name: 'duration',           lucide: 'timer' },
  { domain: 'schedule', name: 'overnight',          lucide: 'moon' },
  { domain: 'schedule', name: 'urgent',             lucide: 'calendar-clock' },

  // Location & organisation (11)
  { domain: 'location', name: 'ward',         lucide: 'building-2' },
  { domain: 'location', name: 'hospital',     lucide: 'hospital' },
  { domain: 'location', name: 'gp-practice',  lucide: 'house-plus' },
  { domain: 'location', name: 'bed',          lucide: 'bed' },
  { domain: 'location', name: 'room',         lucide: 'door-open' },
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

  // Data & analytics (8)
  { domain: 'data', name: 'chart',      lucide: 'chart-line' },
  { domain: 'data', name: 'table',      lucide: 'table-2' },
  { domain: 'data', name: 'trend-up',   lucide: 'trending-up' },
  { domain: 'data', name: 'trend-down', lucide: 'trending-down' },
  { domain: 'data', name: 'export',     lucide: 'file-down' },
  { domain: 'data', name: 'audit',      lucide: 'shield-check' },
  { domain: 'data', name: 'grid-2x2',   lucide: 'grid-2x2' },
  { domain: 'data', name: 'grid-3x3',   lucide: 'grid-3x3' },
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

for (const { domain, name, lucide, note } of ICONS) {
  const url     = `${BASE_URL}/${lucide}.svg`;
  const outDir  = join(SVG_DIR, domain);
  const outFile = join(outDir, `${name}.svg`);

  try {
    const raw = execSync(`curl -sf --max-time 15 "${url}"`, { encoding: 'utf8' });
    if (!raw.trim().startsWith('<svg') && !raw.trim().startsWith('<?xml')) {
      failed.push({ domain, name, lucide, reason: 'Unexpected content' });
      continue;
    }
    mkdirSync(outDir, { recursive: true });
    writeFileSync(outFile, normaliseSvg(raw), 'utf8');
    succeeded.push({ domain, name, lucide });
    if (note) notes.push(`  ${domain}/${name}: ${note}`);
  } catch (err) {
    failed.push({ domain, name, lucide, reason: err.message.split('\n')[0] });
  }
}

console.log(`\n✓ ${succeeded.length} icons written to foundations/iconography/svg/`);

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
