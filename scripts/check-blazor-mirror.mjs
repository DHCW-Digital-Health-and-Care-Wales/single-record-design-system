#!/usr/bin/env node
/**
 * The Blazor RCL serves design-system CSS from `packages/blazor/wwwroot/css/`,
 * which is a *copy* of files that live elsewhere. The copy commands are
 * documented in DHCW.SingleRecord.Components.csproj but nothing runs them, so
 * the mirror drifts silently and Blazor consumers keep rendering old values.
 *
 * That is not hypothetical. When the focus ring moved to Cyan/800 the mirror
 * still carried Cyan/700 everywhere, and `button.css` there still referenced
 * the raw `--color-cyan-700` primitive that had just been removed from source.
 * Nothing failed; Blazor would simply have shipped the old ring.
 *
 * Usage:
 *   node scripts/check-blazor-mirror.mjs           # fail if stale
 *   node scripts/check-blazor-mirror.mjs --fix     # re-copy, then report
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEST = resolve(ROOT, 'packages', 'blazor', 'wwwroot', 'css');

/** Source of truth → the copy under wwwroot. Keep in step with the csproj comment. */
const MIRRORED = [
  ['packages/tokens/build/css/tokens.css', 'tokens.css'],
  ['packages/tokens/build/css/tokens-dark.css', 'tokens-dark.css'],
  ['packages/web/src/button/button.css', 'button.css'],
];

const fix = process.argv.includes('--fix');
const stale = [];
const missing = [];

for (const [src, name] of MIRRORED) {
  const srcPath = resolve(ROOT, src);
  const destPath = resolve(DEST, name);

  if (!existsSync(srcPath)) {
    console.error(`Source missing: ${src}. Run "npm run build:tokens" first.`);
    process.exit(1);
  }
  const want = readFileSync(srcPath, 'utf8');

  if (!existsSync(destPath)) {
    missing.push(name);
    if (fix) writeFileSync(destPath, want);
    continue;
  }
  if (readFileSync(destPath, 'utf8') !== want) {
    stale.push({ name, src });
    if (fix) writeFileSync(destPath, want);
  }
}

if (fix) {
  const n = stale.length + missing.length;
  console.log(n
    ? `check:blazor-mirror — refreshed ${n} file(s): ${[...stale.map((s) => s.name), ...missing].join(', ')}`
    : 'check:blazor-mirror — already in step, nothing to copy.');
  process.exit(0);
}

if (stale.length || missing.length) {
  console.error('\ncheck:blazor-mirror — the Blazor CSS mirror is out of step.\n');
  for (const { name, src } of stale) console.error(`  stale:   wwwroot/css/${name}  (source: ${src})`);
  for (const name of missing) console.error(`  missing: wwwroot/css/${name}`);
  console.error('\nBlazor consumers would render the old values. Refresh with:\n');
  console.error('  npm run fix:blazor-mirror\n');
  process.exit(1);
}

console.log(`check:blazor-mirror — ${MIRRORED.length} mirrored file(s) in step with source.`);
