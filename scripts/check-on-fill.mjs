#!/usr/bin/env node
/**
 * Text on a saturated fill must use `text/on-fill`, never `text/inverse`.
 *
 * Why this exists: `.sr-nav__item-badge` painted `interactive/primary` and set
 * its text to `text/inverse`. `text/inverse` flips with the mode — white in
 * light, #212b32 in dark — while the saturated fill does not flip. Dark-mode
 * navigation counts were 2.26:1 against the 4.5:1 SC 1.4.3 requires.
 * The Figma avatar had made the same mistake (2.95:1, 2026-09-22).
 *
 * check:contrast could not see it: it asserts TOKEN pairs, and the pair
 * `text/on-fill` on `interactive/primary` passes. What was wrong was which
 * token the CSS reached for. This check reads the CSS.
 *
 * Rule: within one declaration block, a background taken from a saturated
 * fill token (interactive/primary, interactive/destructive, or a status fill
 * without `-surface`) must not be paired with `color: var(--sr-color-text-inverse)`.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'packages/web/src');

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith('.css')) out.push(p);
  }
  return out;
}

const SATURATED = /background(?:-color)?\s*:[^;]*var\(--sr-color-(interactive-primary|interactive-destructive|status-(?:error|success|info|warning)(?!-surface)(?:-on-page)?)\b/;
const INVERSE_TEXT = /(?:^|[;{\s])color\s*:\s*var\(--sr-color-text-inverse\)/;

const failures = [];
for (const file of walk(SRC)) {
  const css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(css))) {
    const [, selector, body] = m;
    const fill = body.match(SATURATED);
    if (fill && INVERSE_TEXT.test(body)) {
      failures.push(`${relative(ROOT, file)}: ${selector.trim()} — text/inverse on ${fill[1]}`);
    }
  }
}

if (failures.length) {
  console.error('check:on-fill — text/inverse on a saturated fill (use text/on-fill):');
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log('check:on-fill — no text/inverse on a saturated fill.');
