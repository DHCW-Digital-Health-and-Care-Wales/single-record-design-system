/**
 * Assemble the single GitHub Pages deploy directory (DDR-016):
 *   site-dist/            ← the DS website (packages/website/dist)
 *   site-dist/storybook/  ← the Storybook catalogue (packages/storybook/storybook-static)
 *
 * Run after the website and Storybook builds. Deploy `site-dist/` to Pages.
 */
import { cpSync, rmSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'site-dist');
const WEBSITE = resolve(ROOT, 'packages', 'website', 'dist');
const STORYBOOK = resolve(ROOT, 'packages', 'storybook', 'storybook-static');

if (!existsSync(WEBSITE)) {
  console.error('Missing website build at', WEBSITE, '\nRun: npm run build -w @dhcw/sr-website');
  process.exit(1);
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
cpSync(WEBSITE, OUT, { recursive: true });

if (existsSync(STORYBOOK)) {
  cpSync(STORYBOOK, resolve(OUT, 'storybook'), { recursive: true });
  console.log('Assembled site-dist/ with website (root) + storybook (/storybook)');
} else {
  console.warn('WARNING: no Storybook build at', STORYBOOK, '\nrun: npm run build-storybook -w @dhcw/sr-storybook');
  console.log('Assembled site-dist/ with website only (no /storybook)');
}
