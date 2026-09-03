#!/usr/bin/env node
/**
 * Contrast gate over the token pairs the design system actually asserts.
 *
 * WCAG 2.2 AA is a hard requirement (CLAUDE.md), but nothing was stopping a
 * token edit from quietly breaking it. Every pair below is a claim made
 * somewhere in the system — in a component's CSS, in a token $description, or
 * on a website page — and this fails the build when the claim stops holding.
 *
 * It deliberately does NOT sweep every possible pairing. A generic sweep
 * cannot know which colours are ever placed on which, so it produces noise
 * that gets baselined away. These are the pairs someone has committed to.
 *
 * BOTH MODES ARE CHECKED, and that is the point rather than thoroughness for
 * its own sake. The focus ring fix was nearly shipped as Cyan/850 on light-mode
 * numbers alone; dark mode's surfaces are navy, so darkening the ring helps
 * light and hurts dark, and Cyan/850 would have failed dark at 2.95:1 —
 * the same failure it was meant to fix, moved to the other mode.
 *
 * Thresholds:
 *   4.5  AA normal text (SC 1.4.3)
 *   3.0  AA large text, and non-text UI component boundaries (SC 1.4.11)
 *
 * Usage: node scripts/check-contrast.mjs
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LIGHT_JSON = resolve(ROOT, 'packages', 'tokens', 'build', 'json', 'tokens-flat.json');
const DARK_CSS = resolve(ROOT, 'packages', 'tokens', 'build', 'css', 'tokens-dark.css');

/** Relative luminance, WCAG 2.x definition. */
function luminance(hex) {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function ratio(a, b) {
  const [la, lb] = [luminance(a), luminance(b)];
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

const light = JSON.parse(readFileSync(LIGHT_JSON, 'utf8'));

/**
 * Dark values only exist in the emitted CSS — there is no dark flat-JSON
 * artifact — so parse the custom properties back out of it. Dark mode carries
 * the same key names as light with different values, which is why they cannot
 * simply be merged.
 */
const dark = Object.fromEntries(
  [...readFileSync(DARK_CSS, 'utf8').matchAll(/^\s*--([a-z0-9-]+):\s*(#[0-9a-f]{3,8})\s*;/gim)]
    .map((m) => [m[1], m[2]]),
);

/**
 * Each entry: [foreground token, background token, minimum, what asserts it,
 * modes]. `modes` defaults to 'both'; use 'light' or 'dark' where a pair only
 * exists in one. Tokens absent from dark mode fall back to their light value,
 * which is correct — the dark sheet only overrides what actually differs.
 */
const PAIRS = [
  // --- Form control boundaries. SC 1.4.11 non-text contrast, 3:1. ---
  ['sr-color-border-strong', 'sr-color-surface-small-cards', 3,
    'Checkbox and Radio rest border (checkbox.css, radio.css)', 'light'],
  ['sr-color-border-strong', 'sr-color-surface-background', 3,
    'Checkbox and Radio rest border on the page background', 'light'],
  ['sr-color-interactive-primary', 'sr-color-surface-small-cards', 3,
    'Checkbox and Radio checked fill, and their hover border', 'light'],

  // --- Focus ring. SC 1.4.11, 3:1, and it must hold in BOTH modes. ---
  ['sr-color-border-focus', 'sr-color-surface-background', 3,
    'Focus ring on the page background (DDR-025)'],
  ['sr-color-border-focus', 'sr-color-surface-section-cards', 3,
    'Focus ring on a section card (DDR-025)'],
  ['sr-color-border-focus', 'sr-color-surface-small-cards', 3,
    'Focus ring on a small card (DDR-025)'],
  ['sr-color-text-primary', 'sr-color-surface-small-cards', 4.5,
    'Body text on a small card'],

  // --- Status text on its own surface. SC 1.4.3 normal text, 4.5:1. ---
  ['sr-color-status-critical', 'sr-color-status-critical-surface', 4.5,
    'Critical text on the critical surface'],
  ['sr-color-status-success', 'sr-color-status-success-surface', 4.5,
    'Success text on the success surface'],
  ['sr-color-status-info', 'sr-color-status-info-surface', 4.5,
    'Info text on the info surface'],

  // --- Body and interactive text. SC 1.4.3, 4.5:1. ---
  ['sr-color-text-primary', 'sr-color-surface-background', 4.5, 'Body text on the page'],
  ['sr-color-text-primary', 'sr-color-surface-section-cards', 4.5, 'Body text on a section card'],
  ['sr-color-text-secondary', 'sr-color-surface-background', 4.5,
    'Secondary and placeholder text (the 2026-07-09 placeholder decision)'],
  ['sr-color-interactive-link', 'sr-color-surface-background', 4.5, 'Links on the page', 'light'],
  // --- Text on a saturated fill. Both modes: the fill stays saturated. ---
  ['sr-color-text-on-fill', 'sr-color-interactive-primary', 4.5,
    'Label on a primary button (button.css)'],
  ['sr-color-text-on-fill', 'sr-color-interactive-destructive', 4.5,
    'Label on a destructive button (button.css)'],

  // --- Interactive text ON the accent surface. Both modes, and the reason
  //     interactive/on-accent exists: interactive/primary is 2.07:1 here in
  //     dark, because both it and the surface are dark. ---
  ['sr-color-interactive-on-accent', 'sr-color-surface-accent', 4.5,
    'Current nav item (navigation.css)'],
  ['sr-color-interactive-on-accent-hover', 'sr-color-surface-accent', 4.5,
    'Row action on hover (table.css)'],

  // --- Text on the accent surface, where three components used to reach past
  //     the semantic layer to raw info-blue-50 — a light tint with no dark
  //     value, so white-on-near-white at 1.10:1 in dark mode. ---
  ['sr-color-text-primary', 'sr-color-surface-accent', 4.5,
    'Table row header (table.css)'],
  ['sr-color-text-secondary', 'sr-color-surface-accent', 4.5,
    'Select option on hover (select.css)'],
];

/**
 * Pairs below their ratio that the build does not fail on. Two kinds, and the
 * difference matters:
 *
 *   'accepted' — a decision has been taken and written down. Not a bug.
 *   'open'     — a real defect with no signed-off fix. Colour changes need
 *                sign-off (CLAUDE.md), so this reports loudly rather than
 *                quietly correcting.
 *
 * An 'open' entry is debt with a name on it, not an exemption. Nothing goes
 * here without a line saying who decides and what the options are.
 */
const KNOWN = [
  {
    fg: 'sr-color-status-warning', bg: 'sr-color-status-warning-surface', min: 4.5, mode: 'light',
    status: 'accepted',
    note: 'Yellow/500 is a fill colour, not a text colour. The warning role always '
      + 'carries a text label rather than standing alone, so the pair is never load-'
      + 'bearing. Recorded on the Icons page.',
  },
];

function value(name, mode) {
  if (/^#[0-9a-f]{6}$/i.test(name)) return name;
  const v = mode === 'dark' ? (dark[name] ?? light[name]) : light[name];
  if (!v) throw new Error(`No such token: ${name} (${mode}). Run "npm run build:tokens" first.`);
  if (!/^#[0-9a-f]{6}$/i.test(v)) throw new Error(`${name} is not a plain hex: ${v}`);
  return v;
}

const failures = [];
const lines = [];

for (const mode of ['light', 'dark']) {
  const applicable = PAIRS.filter(([, , , , m = 'both']) => m === 'both' || m === mode);
  lines.push(`  ${mode.toUpperCase()} MODE`);
  for (const [fg, bg, min, why] of applicable) {
    const r = ratio(value(fg, mode), value(bg, mode));
    const ok = r >= min;
    if (!ok) failures.push({ fg, bg, min, why, r, mode });
    lines.push(`  ${ok ? 'ok  ' : 'FAIL'}  ${r.toFixed(2).padStart(5)}:1  (needs ${min})  ${why}`);
  }
  lines.push('');
}

const report = (list, heading) => {
  if (!list.length) return;
  lines.push(`  ${heading}`);
  for (const k of list) {
    const r = ratio(value(k.fg, k.mode), value(k.bg, k.mode));
    lines.push(`  --    ${r.toFixed(2).padStart(5)}:1  (needs ${k.min})  [${k.mode}] ${k.fg} on ${k.bg}`);
    lines.push(`        ${k.note}`);
  }
  lines.push('');
};

const open = KNOWN.filter((k) => k.status === 'open');
const accepted = KNOWN.filter((k) => k.status === 'accepted');
report(accepted, 'Accepted exceptions — decided and written down:');
report(open, 'OPEN FINDINGS — real defects, awaiting a colour decision:');

console.log(lines.join('\n'));

if (failures.length) {
  console.error(`check:contrast — ${failures.length} asserted pair(s) below the required ratio.\n`);
  for (const f of failures) {
    console.error(`  [${f.mode}] ${f.fg} on ${f.bg}`);
    console.error(`    ${f.r.toFixed(2)}:1, needs ${f.min}:1 — ${f.why}\n`);
  }
  console.error('Colour changes need sign-off (CLAUDE.md). If the new value is');
  console.error('intended, the pair or its threshold has to move with it.');
  console.error('Check the other mode before settling on a fix: darkening a colour');
  console.error('to clear light mode can push it under in dark mode, and vice versa.\n');
  process.exit(1);
}

const checked = PAIRS.reduce((n, [, , , , m = 'both']) => n + (m === 'both' ? 2 : 1), 0);
console.log(`check:contrast — ${checked} asserted pair-checks pass across both modes, `
  + `${accepted.length} accepted exception(s), ${open.length} open finding(s).`);
