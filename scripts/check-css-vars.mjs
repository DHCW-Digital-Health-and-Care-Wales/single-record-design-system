#!/usr/bin/env node
/**
 * Every `var(--x)` in the component stylesheets must resolve to something.
 *
 * Why this exists: `.sr-notification-banner` shipped with
 * `padding: var(--spacing-3) var(--spacing-4)` and `gap: var(--spacing-3)`.
 * None of those custom properties exist — the scale is `--space-N`, and
 * `--spacing-*` is a different, sparser set (`--spacing-component-md`,
 * `--spacing-form-field-gap`). The banner therefore rendered with **no padding
 * and no gap**, and every existing check passed:
 *
 *   - check:ds      looks for literal values, and a var() is not a literal
 *   - check:type    looks at typography declarations
 *   - check:contrast resolves colours, and these were spacing
 *   - check:snippets resolves CLASSES against the built CSS, not properties
 *
 * An undefined custom property is silently invalid in CSS: the declaration is
 * dropped at computed-value time and nothing anywhere reports it. That is
 * exactly the shape of defect a build gate is for.
 *
 * What counts as resolving:
 *   1. defined in the built token CSS (light or dark), or
 *   2. defined somewhere in the component stylesheets themselves, or
 *   3. given an inline fallback — `var(--x, 8px)` is deliberate.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'packages/web/src');
const TOKEN_CSS = [
  'packages/tokens/build/css/tokens.css',
  'packages/tokens/build/css/tokens-dark.css',
  'packages/tokens/build/css/typography.css',
].map((p) => join(ROOT, p));

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith('.css')) out.push(p);
  }
  return out;
}

const DEFINE = /(--[A-Za-z0-9_-]+)\s*:/g;
/** `var(--x)` with no comma — a fallback is a deliberate choice, so it passes. */
const USE_NO_FALLBACK = /var\(\s*(--[A-Za-z0-9_-]+)\s*\)/g;

const defined = new Set();
for (const f of TOKEN_CSS) {
  const css = readFileSync(f, 'utf8');
  for (const m of css.matchAll(DEFINE)) defined.add(m[1]);
}

const files = walk(SRC);
for (const f of files) {
  const css = readFileSync(f, 'utf8');
  for (const m of css.matchAll(DEFINE)) defined.add(m[1]);
}

const problems = [];
for (const f of files) {
  const css = readFileSync(f, 'utf8');
  const lines = css.split('\n');
  lines.forEach((line, i) => {
    for (const m of line.matchAll(USE_NO_FALLBACK)) {
      if (!defined.has(m[1])) {
        problems.push(`  ${f.slice(ROOT.length + 1)}:${i + 1} — var(${m[1]}) is not defined anywhere`);
      }
    }
  });
}

if (problems.length) {
  console.error(`check:css-vars — ${problems.length} unresolved custom propert${problems.length === 1 ? 'y' : 'ies'}:\n`);
  console.error(problems.join('\n'));
  console.error(
    '\nAn undefined custom property makes the whole declaration invalid and it is\n'
    + 'dropped silently — no error, no warning, just a component with no padding.\n'
    + 'Check the scale you meant: spacing is --space-N; --spacing-* is the sparser\n'
    + 'component set. Use a fallback, var(--x, 8px), only when that is deliberate.'
  );
  process.exit(1);
}

console.log(`check:css-vars — ${files.length} stylesheets, every var() resolves against ${defined.size} known properties.`);
