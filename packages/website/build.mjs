/**
 * DHCW Single Record Design System — website build (Phase A).
 *
 * Proves the Figma -> tokens -> website pipeline for two foundations
 * (Typography, Colour). It consumes the BUILT token artifact
 * (packages/tokens/build) and the single-source guideline docs — it never
 * hardcodes a colour or size. Change a token, rebuild tokens, rebuild the site,
 * and these pages change. Zero runtime dependencies (CLAUDE.md: deps need a DDR).
 */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const TOKENS = resolve(ROOT, 'packages', 'tokens', 'build');
const DIST = resolve(__dirname, 'dist');

// ─── tiny, self-contained Markdown → HTML (subset used by our guideline docs) ──
function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function inline(s) {
  // order matters: code, links, bold, then escape is applied per-segment
  let out = esc(s);
  out = out.replace(/`([^`]+)`/g, (_, c) => `<code>${c}</code>`);
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, h) => `<a href="${h}">${t}</a>`);
  out = out.replace(/\*\*([^*]+)\*\*/g, (_, b) => `<strong>${b}</strong>`);
  return out;
}
function renderMarkdown(md) {
  const lines = md.replace(/\r/g, '').split('\n');
  const html = [];
  let i = 0;
  const flushList = (items, ordered) => {
    const tag = ordered ? 'ol' : 'ul';
    html.push(`<${tag}>${items.map((it) => `<li>${inline(it)}</li>`).join('')}</${tag}>`);
  };
  while (i < lines.length) {
    let line = lines[i];
    if (!line.trim()) { i++; continue; }
    // heading
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) { const lvl = h[1].length; html.push(`<h${lvl}>${inline(h[2])}</h${lvl}>`); i++; continue; }
    // hr
    if (/^---+\s*$/.test(line)) { html.push('<hr>'); i++; continue; }
    // blockquote (collect consecutive)
    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, '')); i++; }
      html.push(`<blockquote>${renderMarkdown(buf.join('\n'))}</blockquote>`);
      continue;
    }
    // table (pipe rows with a separator line)
    if (/^\|/.test(line) && i + 1 < lines.length && /^\|[\s:|-]+\|?\s*$/.test(lines[i + 1])) {
      const parseRow = (r) => r.replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      const head = parseRow(lines[i]); i += 2;
      const body = [];
      while (i < lines.length && /^\|/.test(lines[i])) { body.push(parseRow(lines[i])); i++; }
      const thead = `<thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join('')}</tr></thead>`;
      const tbody = `<tbody>${body.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody>`;
      html.push(`<div class="table-wrap"><table>${thead}${tbody}</table></div>`);
      continue;
    }
    // list (- or • bullets), with soft-wrapped continuation lines
    if (/^\s*([-•])\s+/.test(line)) {
      const items = [];
      while (i < lines.length) {
        if (/^\s*([-•])\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*([-•])\s+/, '')); i++; continue; }
        // indented, non-blank, non-block continuation of the current item
        if (items.length && /^\s+\S/.test(lines[i]) && !/^\s*[-•]\s/.test(lines[i])) {
          items[items.length - 1] += ' ' + lines[i].trim(); i++; continue;
        }
        break;
      }
      flushList(items, false);
      continue;
    }
    // paragraph (collect until blank / block)
    const buf = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|>\s?|\||\s*[-•]\s|---+\s*$)/.test(lines[i])) {
      buf.push(lines[i]); i++;
    }
    html.push(`<p>${inline(buf.join(' '))}</p>`);
  }
  return html.join('\n');
}

// ─── token data (from the build artifact) ─────────────────────────────────────
const flat = JSON.parse(readFileSync(resolve(TOKENS, 'json', 'tokens-flat.json'), 'utf8'));
const colourEntries = Object.entries(flat).filter(([k, v]) => typeof v === 'string' && /^#/.test(v));

function swatchGrid(filterFn, opts = {}) {
  const items = colourEntries.filter(([k]) => filterFn(k));
  return `<div class="swatches">${items.map(([k, v]) => {
    const cssVar = '--' + k;
    return `<figure class="swatch">
      <div class="swatch__chip" style="background: var(${cssVar}, ${v})"></div>
      <figcaption><code>${cssVar}</code><span class="hex">${v}</span></figcaption>
    </figure>`;
  }).join('')}</div>`;
}

const typeSamples = ['heading-xl', 'heading-l', 'heading-m', 'heading-s', 'heading-xs', 'body-m', 'body-s', 'label', 'caption']
  .map((t) => `<div class="type-row">
    <span class="type-row__meta"><code>.sr-type-${t}</code></span>
    <span class="sr-type-${t}">The patient record is clear and legible</span>
  </div>`).join('');

// ─── page shell ───────────────────────────────────────────────────────────────
const NAV = [
  { href: 'index.html', label: 'Overview' },
  { href: 'foundations/typography.html', label: 'Typography' },
  { href: 'foundations/colour.html', label: 'Colour' },
  { href: 'storybook/index.html', label: 'Catalogue' },
];
function shell({ title, prefix, activeHref, body }) {
  const nav = NAV.map((n) => {
    const href = prefix + n.href;
    const active = n.href === activeHref ? ' aria-current="page"' : '';
    return `<a href="${href}"${active}>${n.label}</a>`;
  }).join('');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} — SR Design System</title>
<link rel="stylesheet" href="${prefix}assets/tokens.css">
<link rel="stylesheet" href="${prefix}assets/typography.css">
<link rel="stylesheet" href="${prefix}assets/tokens-dark.css">
<link rel="stylesheet" href="${prefix}assets/site.css">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="masthead">
  <div class="masthead__inner">
    <span class="masthead__brand">Single Record Design System</span>
    <button id="theme" class="theme-toggle" type="button" aria-pressed="false">Dark mode</button>
  </div>
  <nav class="primary-nav" aria-label="Primary">${nav}</nav>
</header>
<main id="main" class="content">
${body}
</main>
<footer class="site-footer">
  <p>DHCW Single Record Design System · Phase A pipeline preview · pages rendered from the built design tokens.</p>
</footer>
<script>
  const btn = document.getElementById('theme');
  const root = document.documentElement;
  btn.addEventListener('click', () => {
    const dark = root.getAttribute('data-theme') === 'dark';
    root.setAttribute('data-theme', dark ? 'light' : 'dark');
    btn.setAttribute('aria-pressed', String(!dark));
    btn.textContent = dark ? 'Dark mode' : 'Light mode';
  });
</script>
</body>
</html>`;
}

// ─── site CSS (uses tokens only; no hardcoded palette) ────────────────────────
const SITE_CSS = `
:root { color-scheme: light dark; }
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: Roboto, Arial, sans-serif;
  color: var(--sr-color-text-primary);
  background: var(--sr-color-surface-background);
}
.skip { position: absolute; left: -999px; }
.skip:focus { left: 8px; top: 8px; background: var(--sr-color-surface-small-cards); padding: 8px 12px; z-index: 10; }
.masthead { background: var(--sr-color-surface-header, var(--color-navy-900)); color: var(--sr-color-text-inverse); }
.masthead__inner { max-width: 1100px; margin: 0 auto; padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; }
.masthead__brand { font-weight: 500; font-size: 18px; }
.theme-toggle {
  font: inherit; color: var(--sr-color-text-inverse); background: transparent;
  border: 2px solid currentColor; border-radius: 6px; padding: 6px 12px; cursor: pointer;
}
.primary-nav { max-width: 1100px; margin: 0 auto; padding: 0 24px; display: flex; gap: 4px; flex-wrap: wrap; }
.primary-nav a {
  color: var(--sr-color-text-inverse); text-decoration: none; padding: 10px 14px;
  border-bottom: 3px solid transparent; opacity: .85;
}
.primary-nav a:hover { opacity: 1; }
.primary-nav a[aria-current="page"] { opacity: 1; border-bottom-color: var(--sr-color-border-focus); }
.content { max-width: 860px; margin: 0 auto; padding: 40px 24px 64px; }
.content h1 { font-size: 36px; line-height: 44px; margin: 0 0 8px; }
.content h2 { font-size: 24px; line-height: 32px; margin: 40px 0 12px; }
.content h3 { font-size: 20px; line-height: 28px; margin: 28px 0 8px; }
.content p, .content li { font-size: 16px; line-height: 24px; }
.content a { color: var(--sr-color-interactive-link, var(--color-info-blue-700)); }
.content code { font-family: "Roboto Mono", ui-monospace, monospace; font-size: .9em; background: var(--sr-color-surface-subtle); padding: 1px 5px; border-radius: 4px; }
.content blockquote { margin: 16px 0; padding: 12px 16px; border-left: 4px solid var(--sr-color-border-focus); background: var(--sr-color-surface-accent); border-radius: 0 6px 6px 0; }
.content blockquote p { margin: 6px 0; }
.content hr { border: none; border-top: 1px solid var(--sr-color-border-default); margin: 32px 0; }
.table-wrap { overflow-x: auto; }
.content table { border-collapse: collapse; width: 100%; margin: 12px 0; font-size: 14px; }
.content th, .content td { text-align: left; padding: 8px 12px; border-bottom: 1px solid var(--sr-color-border-subtle, var(--color-grey-100)); vertical-align: top; }
.content th { color: var(--sr-color-text-secondary); font-weight: 500; }
.cards { display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); margin: 16px 0; }
.card { background: var(--sr-color-surface-small-cards); border: 1px solid var(--sr-color-border-default); border-radius: 8px; padding: 16px; }
.swatches { display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); margin: 16px 0; }
.swatch { margin: 0; border: 1px solid var(--sr-color-border-default); border-radius: 8px; overflow: hidden; background: var(--sr-color-surface-small-cards); }
.swatch__chip { height: 64px; }
.swatch figcaption { padding: 8px 10px; display: flex; flex-direction: column; gap: 2px; font-size: 12px; }
.swatch .hex { color: var(--sr-color-text-secondary); font-family: "Roboto Mono", monospace; }
.type-row { display: flex; align-items: baseline; gap: 16px; padding: 10px 0; border-bottom: 1px solid var(--sr-color-border-subtle, var(--color-grey-100)); }
.type-row__meta { flex: 0 0 140px; color: var(--sr-color-text-secondary); }
.site-footer { border-top: 1px solid var(--sr-color-border-default); }
.site-footer p { max-width: 1100px; margin: 0 auto; padding: 24px; color: var(--sr-color-text-secondary); font-size: 14px; }
`;

// ─── read guideline sources ───────────────────────────────────────────────────
const typoMd = readFileSync(resolve(ROOT, 'foundations', 'tokens', 'typography.guidelines.md'), 'utf8');
const colourMd = readFileSync(resolve(ROOT, 'foundations', 'tokens', 'colour', 'colour.guidelines.md'), 'utf8');

// ─── build ────────────────────────────────────────────────────────────────────
rmSync(DIST, { recursive: true, force: true });
mkdirSync(resolve(DIST, 'assets'), { recursive: true });
mkdirSync(resolve(DIST, 'foundations'), { recursive: true });

for (const f of ['tokens.css', 'tokens-dark.css', 'typography.css']) {
  copyFileSync(resolve(TOKENS, 'css', f), resolve(DIST, 'assets', f));
}
writeFileSync(resolve(DIST, 'assets', 'site.css'), SITE_CSS);

// Overview
const overview = `
<h1>Single Record Design System</h1>
<p>Reference site (Phase A). These pages are generated from the single-source guideline
documents and the <strong>built design tokens</strong> — the same artifact the Figma
variables feed. This proves the Figma → tokens → website pipeline end to end.</p>
<div class="cards">
  <a class="card" href="foundations/typography.html"><h3>Typography</h3><p>Type scale, weights, and usage, rendered with the live <code>.sr-type-*</code> utilities.</p></a>
  <a class="card" href="foundations/colour.html"><h3>Colour</h3><p>Semantic tokens and the full grey ramp, rendered from the token values.</p></a>
</div>
<hr>
<p>Two foundations are wired for this pipeline test. Toggle dark mode (top right) to see
the token modes switch. Everything on these pages resolves from
<code>packages/tokens/build</code>.</p>`;
writeFileSync(resolve(DIST, 'index.html'), shell({ title: 'Overview', prefix: '', activeHref: 'index.html', body: overview }));

// Typography
const typoBody = `${renderMarkdown(typoMd)}
<hr>
<h2>Live type scale (from tokens)</h2>
<p>Rendered with the built <code>.sr-type-*</code> utility classes. Resize the window past
1024px to see the desktop step change.</p>
<div class="type-scale">${typeSamples}</div>`;
writeFileSync(resolve(DIST, 'foundations', 'typography.html'), shell({ title: 'Typography', prefix: '../', activeHref: 'foundations/typography.html', body: typoBody }));

// Colour
const colourBody = `${renderMarkdown(colourMd)}
<hr>
<h2>Semantic tokens (from tokens)</h2>
${swatchGrid((k) => k.startsWith('sr-color-'))}
<h2>Grey ramp (from tokens)</h2>
<p>The full 50–900 neutral ramp, including the stops added this cycle.</p>
${swatchGrid((k) => /^color-grey-/.test(k))}`;
writeFileSync(resolve(DIST, 'foundations', 'colour.html'), shell({ title: 'Colour', prefix: '../', activeHref: 'foundations/colour.html', body: colourBody }));

console.log('Website built to', DIST);
console.log('Pages: index.html, foundations/typography.html, foundations/colour.html');
console.log('Swatches from tokens:', colourEntries.length, 'colour tokens available');
