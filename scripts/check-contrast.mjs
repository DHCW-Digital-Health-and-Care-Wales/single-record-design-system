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
const TOKENS = resolve(ROOT, 'packages', 'tokens', 'build', 'json', 'tokens-flat.json');

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

/**
 * Each entry: [foreground token, background token, minimum, what asserts it].
 * `#fff` and `#000` are allowed as literals — they are not design decisions.
 */
const PAIRS = [
  // --- Form control boundaries. SC 1.4.11 non-text contrast, 3:1. ---
  ['sr-color-border-strong', 'sr-color-surface-small-cards', 3,
    'Checkbox and Radio rest border (checkbox.css, radio.css)'],
  ['sr-color-border-strong', 'sr-color-surface-background', 3,
    'Checkbox and Radio rest border on the page background'],
  ['sr-color-interactive-primary', 'sr-color-surface-small-cards', 3,
    'Checkbox and Radio checked fill, and their hover border'],

  // --- Status text on its own surface. SC 1.4.3 normal text, 4.5:1. ---
  ['sr-color-status-critical', 'sr-color-status-critical-surface', 4.5,
    'Critical text on the critical surface'],
  ['sr-color-status-success', 'sr-color-status-success-surface', 4.5,
    'Success text on the success surface'],
  ['sr-color-status-info', 'sr-color-status-info-surface', 4.5,
    'Info text on the info surface'],

  // --- Body and interactive text. SC 1.4.3, 4.5:1. ---
  ['sr-color-text-primary', 'sr-color-surface-background', 4.5, 'Body text on the page'],
  ['sr-color-text-primary', 'sr-color-surface-small-cards', 4.5, 'Body text on a card'],
  ['sr-color-text-secondary', 'sr-color-surface-background', 4.5,
    'Secondary and placeholder text (the 2026-07-09 placeholder decision)'],
  ['sr-color-interactive-link', 'sr-color-surface-background', 4.5, 'Links on the page'],
  ['sr-color-text-inverse', 'sr-color-interactive-primary', 4.5,
    'White label on a primary button'],
];

/**
 * Pairs below their ratio that the build does not fail on. Two kinds, and the
 * difference matters:
 *
 *   'accepted' — a decision has been taken and written down. It is not a bug.
 *   'open'     — a real defect nobody has signed off a fix for yet. Colour
 *                changes need sign-off (CLAUDE.md), so this script reports it
 *                loudly rather than quietly correcting it.
 *
 * An 'open' entry is debt with a name on it, not an exemption. Nothing may be
 * added here without a line saying who has to decide and what the options are.
 */
const KNOWN = [
  {
    fg: 'sr-color-status-warning', bg: 'sr-color-status-warning-surface', min: 4.5,
    status: 'accepted',
    note: 'Yellow/500 is a fill colour, not a text colour. The warning role always '
      + 'carries a text label rather than standing alone, so the pair is never load-'
      + 'bearing. Recorded on the Icons page.',
  },
  {
    fg: 'sr-color-border-focus', bg: 'sr-color-surface-small-cards', min: 3,
    status: 'open',
    note: 'Focus ring (Cyan/700, DDR-006) on a card. SC 1.4.11 wants 3:1 for a focus '
      + 'indicator and this is 2.95:1 — a miss by 0.05, but a miss. Affects every '
      + 'focusable component in the system.',
  },
  {
    fg: 'sr-color-border-focus', bg: 'sr-color-surface-background', min: 3,
    status: 'open',
    note: 'The same ring on the page background, at 2.71:1. Design lead to decide: '
      + 'Cyan/850 #0C7B99 clears both surfaces at 4.87 and 4.47 and is already in the '
      + 'palette, or keep Cyan/700 and record the exception in a DDR amending DDR-006.',
  },
];

const tokens = JSON.parse(readFileSync(TOKENS, 'utf8'));

function value(name) {
  if (/^#[0-9a-f]{6}$/i.test(name)) return name;
  const v = tokens[name];
  if (!v) throw new Error(`No such token: ${name}. Run "npm run build:tokens" first.`);
  if (!/^#[0-9a-f]{6}$/i.test(v)) throw new Error(`${name} is not a plain hex: ${v}`);
  return v;
}

const failures = [];
const lines = [];

for (const [fg, bg, min, why] of PAIRS) {
  const r = ratio(value(fg), value(bg));
  const ok = r >= min;
  if (!ok) failures.push({ fg, bg, min, why, r });
  lines.push(`  ${ok ? 'ok  ' : 'FAIL'}  ${r.toFixed(2).padStart(5)}:1  (needs ${min})  ${why}`);
}

const open = KNOWN.filter((k) => k.status === 'open');
const accepted = KNOWN.filter((k) => k.status === 'accepted');

const report = (list, heading) => {
  if (!list.length) return;
  lines.push('', `  ${heading}`);
  for (const k of list) {
    const r = ratio(value(k.fg), value(k.bg));
    lines.push(`  --    ${r.toFixed(2).padStart(5)}:1  (needs ${k.min})  ${k.fg} on ${k.bg}`);
    lines.push(`        ${k.note}`);
  }
};

report(accepted, 'Accepted exceptions — decided and written down:');
report(open, 'OPEN FINDINGS — real defects, awaiting a colour decision:');

console.log(lines.join('\n'));

if (failures.length) {
  console.error(`\ncheck:contrast — ${failures.length} asserted pair(s) below the required ratio.\n`);
  for (const f of failures) {
    console.error(`  ${f.fg} on ${f.bg}`);
    console.error(`    ${f.r.toFixed(2)}:1, needs ${f.min}:1 — ${f.why}\n`);
  }
  console.error('Colour changes need sign-off (CLAUDE.md). If the new value is');
  console.error('intended, the pair or its threshold has to move with it.\n');
  process.exit(1);
}

console.log(`\ncheck:contrast — ${PAIRS.length} asserted pairs pass, `
  + `${accepted.length} accepted exception(s), ${open.length} open finding(s).`);
if (open.length) {
  console.log('Open findings are pre-existing and do not fail the build. They are');
  console.log('waiting on a colour decision, which needs sign-off — not on code.');
}
