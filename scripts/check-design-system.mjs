#!/usr/bin/env node
/**
 * Design-system conformance check.
 *
 * Developers build against the prototype, so anything in it that is not from
 * the design system ships as if it were. This check makes the three ways that
 * happens fail loudly instead of silently:
 *
 *   1. COLOUR   — a literal hex / rgb() / hsl() where a token belongs.
 *   2. FONT     — a font-family declared outside the token build.
 *   3. ICONS    — an inline <svg> or <path> in product/component source,
 *                 instead of an <Icon name="…"> from @dhcw/sr-icons.
 *
 * Each has a baseline (scripts/ds-baseline.json) so pre-existing debt is
 * visible and countable while new occurrences fail. Exceptions must be
 * explicit and justified — add an `allow` entry, don't widen a pattern.
 *
 *   node scripts/check-design-system.mjs             # full report
 *   node scripts/check-design-system.mjs --baseline  # CI mode, fails on new
 *   node scripts/check-design-system.mjs --write-baseline
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BASELINE = resolve(ROOT, 'scripts', 'ds-baseline.json');

const SCAN = ['packages/web/src', 'packages/react/src', 'products'];

/**
 * Paths where a literal value is correct by construction rather than by
 * oversight. Kept deliberately short — each entry is a decision, not a
 * convenience.
 */
const ALLOW = [
  // The token build is where literal colour values are supposed to live.
  /^packages\/tokens\//,
  // Storybook stories are authoring aids, not shipped UI.
  /\.stories\.(js|jsx)$/,
  // The icon package's generated file IS the icon SVG source.
  /^packages\/icons\/build\//,
];

const RULES = [
  {
    id: 'colour',
    label: 'Hardcoded colour (use a --sr-color-* / --color-* token)',
    exts: ['.css', '.jsx', '.js'],
    // Hex literals, and rgb()/hsl() with numeric channels. `rgba(…)` wrapping
    // a var() is fine — that is a token with an alpha applied.
    test: (line) =>
      /#[0-9a-fA-F]{3,8}\b/.test(line) ||
      /\b(rgba?|hsla?)\(\s*[\d.]/.test(line),
  },
  {
    id: 'font',
    label: 'font-family outside the token build (Roboto is the only face)',
    exts: ['.css'],
    // `inherit` / `initial` / `unset` do not introduce a face; they defer to
    // one already set. Only a named family is a violation.
    test: (line) =>
      /^\s*font-family\s*:/.test(line) &&
      !/^\s*font-family\s*:\s*(inherit|initial|unset)\s*;?\s*$/.test(line),
  },
  {
    id: 'icon',
    label: 'Inline SVG (use <Icon name="…"> from @dhcw/sr-icons)',
    exts: ['.jsx'],
    test: (line) => /<svg[\s>]|<path[\s>]/.test(line),
  },
];

function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir); } catch { return out; }
  for (const entry of entries) {
    if (entry === 'node_modules' || entry === 'dist' || entry.startsWith('.')) continue;
    const full = resolve(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const counts = {};   // "ruleId::path" -> n
const detail = [];
for (const root of SCAN) {
  for (const file of walk(resolve(ROOT, root))) {
    const rel = relative(ROOT, file);
    if (ALLOW.some((re) => re.test(rel))) continue;
    const ext = rel.slice(rel.lastIndexOf('.'));
    const applicable = RULES.filter((r) => r.exts.includes(ext));
    if (!applicable.length) continue;
    const lines = readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      if (/^\s*(\/\/|\*|\/\*)/.test(line)) return;   // comments are not code
      for (const rule of applicable) {
        if (!rule.test(line)) continue;
        const key = `${rule.id}::${rel}`;
        counts[key] = (counts[key] || 0) + 1;
        detail.push(`[${rule.id}] ${rel}:${i + 1}  ${line.trim().slice(0, 110)}`);
      }
    });
  }
}

const total = Object.values(counts).reduce((a, b) => a + b, 0);
const mode = process.argv[2];

if (mode === '--write-baseline') {
  writeFileSync(BASELINE, JSON.stringify({ total, counts }, null, 2) + '\n');
  console.log(`Baseline written: ${total} findings.`);
  process.exit(0);
}

if (mode === '--baseline') {
  let base;
  try { base = JSON.parse(readFileSync(BASELINE, 'utf8')); }
  catch { console.error('No baseline. Run --write-baseline first.'); process.exit(1); }
  const regressions = [];
  for (const [key, n] of Object.entries(counts)) {
    const allowed = base.counts[key] ?? 0;
    if (n > allowed) {
      const [rule, path] = key.split('::');
      const label = RULES.find((r) => r.id === rule).label;
      regressions.push(`  ${path}: ${n} (baseline ${allowed}) — ${label}`);
    }
  }
  if (regressions.length) {
    console.error('Design-system regression:\n');
    console.error(regressions.join('\n'));
    console.error('\nRun `node scripts/check-design-system.mjs --verbose` to see the lines.');
    console.error('If a literal is genuinely required by the design, get it approved and');
    console.error('add it to the design as a token — do not widen the check.');
    process.exit(1);
  }
  const improved = base.total - total;
  console.log(`Design system OK — ${total} findings (baseline ${base.total}${improved > 0 ? `, ${improved} fixed` : ''}).`);
  process.exit(0);
}

const byRule = {};
for (const [key, n] of Object.entries(counts)) {
  const [rule] = key.split('::');
  byRule[rule] = (byRule[rule] || 0) + n;
}
console.log(`${total} findings:\n`);
for (const rule of RULES) {
  console.log(`  ${String(byRule[rule.id] || 0).padStart(3)}  ${rule.id.padEnd(7)} ${rule.label}`);
}
console.log();
for (const [key, n] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(3)}  ${key.replace('::', '  ')}`);
}
if (process.argv.includes('--verbose')) console.log('\n' + detail.join('\n'));
