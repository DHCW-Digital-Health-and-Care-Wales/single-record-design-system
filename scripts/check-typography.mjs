#!/usr/bin/env node
/**
 * Typography conformance check.
 *
 * The type scale is nine named styles (DDR-005). A style is only correct when
 * all four of its properties are applied together — size, line-height, weight
 * and letter-spacing. Hand-picking the raw `--font-size-*` / `--font-line-
 * height-*` / `--font-letter-spacing-*` tokens lets a stylesheet apply three of
 * the four, or pair a size with a line-height that belongs to another style.
 * That is exactly how 16px/700 and 12px/20px — neither of which is on the
 * scale — reached production.
 *
 * The supported way to apply a style in CSS that cannot add a `.sr-type-*`
 * class is the composite pair emitted by @dhcw/sr-tokens:
 *
 *   font: var(--sr-type-label-font);
 *   letter-spacing: var(--sr-type-label-letter-spacing);
 *
 * This script flags raw typography declarations and reports them per file.
 * `--baseline` compares against typography-baseline.json and fails only on
 * regressions, so the existing debt is visible and countable without blocking
 * unrelated work. Run with no flags to see the full list.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BASELINE = resolve(ROOT, 'scripts', 'typography-baseline.json');

const ROOTS = [
  'packages/web/src',
  'products',
];

// Raw typography declarations that should be a composite style instead.
// `font-size: inherit` and similar keyword resets are not scale violations.
const RAW = /^\s*(font-size|line-height|font-weight|letter-spacing)\s*:\s*(var\(--font-|[0-9])/;
// `line-height: 0` / `1` on a wrapper collapses inline-box leading around an
// icon. That is a layout reset, not a type style, and has no composite
// equivalent — excluded so the check stays about the scale.
const LAYOUT_RESET = /^\s*line-height\s*:\s*(0|1)(\s*;|\s*$)/;

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === 'dist' || entry.startsWith('.')) continue;
    const full = resolve(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (entry.endsWith('.css')) out.push(full);
  }
  return out;
}

const counts = {};
const detail = [];
for (const root of ROOTS) {
  let files = [];
  try { files = walk(resolve(ROOT, root)); } catch { continue; }
  for (const file of files) {
    const rel = relative(ROOT, file);
    const lines = readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      if (!RAW.test(line) || LAYOUT_RESET.test(line)) return;
      counts[rel] = (counts[rel] || 0) + 1;
      detail.push(`${rel}:${i + 1}  ${line.trim()}`);
    });
  }
}

const total = Object.values(counts).reduce((a, b) => a + b, 0);
const mode = process.argv[2];

if (mode === '--write-baseline') {
  writeFileSync(BASELINE, JSON.stringify({ total, counts }, null, 2) + '\n');
  console.log(`Baseline written: ${total} raw typography declarations across ${Object.keys(counts).length} files.`);
  process.exit(0);
}

if (mode === '--baseline') {
  let base;
  try { base = JSON.parse(readFileSync(BASELINE, 'utf8')); }
  catch { console.error('No baseline. Run: node scripts/check-typography.mjs --write-baseline'); process.exit(1); }

  const regressions = [];
  for (const [file, n] of Object.entries(counts)) {
    const allowed = base.counts[file] ?? 0;
    if (n > allowed) regressions.push(`  ${file}: ${n} (baseline ${allowed})`);
  }
  if (regressions.length) {
    console.error('Typography regression — new raw declarations where a composite style belongs:\n');
    console.error(regressions.join('\n'));
    console.error('\nApply a named style instead:');
    console.error('  font: var(--sr-type-<style>-font);');
    console.error('  letter-spacing: var(--sr-type-<style>-letter-spacing);');
    process.exit(1);
  }
  const improved = base.total - total;
  console.log(`Typography OK — ${total} raw declarations remain (baseline ${base.total}${improved > 0 ? `, ${improved} fixed` : ''}).`);
  process.exit(0);
}

console.log(`${total} raw typography declarations across ${Object.keys(counts).length} files:\n`);
for (const [file, n] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(3)}  ${file}`);
}
if (process.argv.includes('--verbose')) console.log('\n' + detail.join('\n'));
