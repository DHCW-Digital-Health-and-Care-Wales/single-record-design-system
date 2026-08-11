/**
 * DHCW Single Record Design System: website build.
 *
 * A real implementation of the design system: every page consumes the BUILT
 * token artifact (packages/tokens/build) and the actual reference component CSS
 * (packages/web/src). No colour/size/space is ever hardcoded. Zero runtime deps.
 *
 * Chrome follows the approved Figma page template:
 *   Masthead  utility row (Report an issue, Cymraeg) + main row (logo, nav, search)
 *   Layout    per-section sidebar + content column
 *
 * The published site is documentation plus copyable code. It carries no trace of
 * how the system is built or governed: no decision-record references, no source
 * file paths, no internal standards documents.
 */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { posix as posixPath } from 'node:path';
import { iconMarkup, iconNames } from '../icons/build/icons.js';
import { logoFullSrc } from '../web/src/assets/logo.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const TOKENS = resolve(ROOT, 'packages', 'tokens', 'build');
const DIST = resolve(__dirname, 'dist');

// ── Intake URLs. Replace when the final forms are supplied. ───────────────────
const REPORT_ISSUE_URL = 'https://forms.office.com/REPLACE-with-report-an-issue-form'; // Microsoft Forms
const CONTRIBUTION_URL = 'https://dev.azure.com/REPLACE-with-azure-devops-intake';     // component / change requests
const STORYBOOK_URL = 'storybook/index.html'; // reachable, not in the primary nav

// ── Prototypes ────────────────────────────────────────────────────────────────
// Prototypes are embedded live via Sandpack (DDR-019), not StackBlitz: Sandpack
// takes files directly rather than cloning a GitHub repo, so the embed has no
// dependency on repo visibility at all. The files it runs are assembled below
// from this repo's REAL source at every site build — never hand-copied — so
// there is no vendored code to drift out of sync.
const REACT_SRC = resolve(ROOT, 'packages', 'react', 'src');
const WEB_SRC = resolve(ROOT, 'packages', 'web', 'src');
const ICONS_PKG = resolve(ROOT, 'packages', 'icons');

// packages/react's own package.json "exports" map is the existing source of
// truth for componentName → file path (the package.json "exports" map predates
// several components — Tag, Select, Autocomplete — and is missing entries, so
// it isn't reliable here).
/* Counted from the source, not typed in, so the "get the files" page cannot
   claim a component count the bundle does not have. */
const WEB_COMPONENT_COUNT = readdirSync(WEB_SRC, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(resolve(WEB_SRC, d.name, `${d.name}.css`))).length;

const REACT_INDEX_SRC = readFileSync(resolve(REACT_SRC, 'index.js'), 'utf8');
const REACT_FILE_BY_NAME = {};
for (const m of REACT_INDEX_SRC.matchAll(/export\s*\{\s*default as (\w+)\s*\}\s*from\s*['"](\.\/[\w./-]+\.jsx)['"]/g)) {
  const [, name, relPath] = m;
  REACT_FILE_BY_NAME[name] = resolve(REACT_SRC, relPath.replace(/^\.\//, ''));
}

/**
 * Walk the real dependency graph starting from a set of top-level component
 * names, following relative `.jsx` imports and inlining every `@dhcw/sr-web`
 * CSS import and the `@dhcw/sr-icons` runtime it needs. Returns a flat map of
 * Sandpack file path → contents, plus the top-level component names actually
 * reachable (for the generated barrel).
 */
function assembleDesignSystemFiles(componentNames) {
  const files = {};
  const seenReact = new Set();
  const queue = [...componentNames];
  let needsIcons = false;

  while (queue.length) {
    const name = queue.pop();
    if (seenReact.has(name)) continue;
    seenReact.add(name);
    const abs = REACT_FILE_BY_NAME[name];
    if (!abs) throw new Error(`Prototype embed: no @dhcw/sr-react export found for "${name}"`);
    let src = readFileSync(abs, 'utf8');

    // @dhcw/sr-web/src/{x}/{y}.css  ->  ../web/{y}.css   (flattened, one dir up)
    src = src.replace(/@dhcw\/sr-web\/src\/[\w-]+\/([\w.-]+\.css)/g, (_, css) => {
      files[`web/${css}`] = readFileSync(findWebCss(css), 'utf8');
      return `../web/${css}`;
    });

    // @dhcw/sr-icons runtime (markup lookup + its own CSS)
    if (/@dhcw\/sr-icons/.test(src)) {
      needsIcons = true;
      src = src
        .replace(/@dhcw\/sr-icons\/src\/icon\.css/g, '../icons/icon.css')
        .replace(/@dhcw\/sr-icons\/build\/icons\.js/g, '../icons/icons.js');
    }

    // Sibling react component imports, e.g. '../icon/Icon.jsx', './checkbox/Checkbox.jsx'
    src = src.replace(/from\s+['"](\.\.?\/[\w./-]+\.jsx)['"]/g, (whole, relImport) => {
      const importedAbs = resolve(dirname(abs), relImport);
      const importedName = importedAbs.split('/').pop().replace(/\.jsx$/, '');
      queue.push(importedName);
      return `from './${importedName}.jsx'`;
    });

    files[`react/${name}.jsx`] = src;
  }

  if (needsIcons) {
    files['icons/icon.css'] = readFileSync(resolve(ICONS_PKG, 'src', 'icon.css'), 'utf8');
    files['icons/icons.js'] = readFileSync(resolve(ICONS_PKG, 'build', 'icons.js'), 'utf8');
  }

  // Roboto, embedded as a data URI. The sandbox cannot resolve a relative font
  // URL and CSP blocks a remote one, so the face has to travel in the bundle —
  // otherwise the embed silently falls back and stops being a faithful preview.
  files['tokens/fonts.css'] = readFileSync(resolve(TOKENS, 'css', 'fonts.css'), 'utf8');
  files['tokens/tokens.css'] = readFileSync(resolve(TOKENS, 'css', 'tokens.css'), 'utf8');
  files['tokens/typography.css'] = readFileSync(resolve(TOKENS, 'css', 'typography.css'), 'utf8');

  // Generated barrel: only the components this prototype actually imports —
  // never the full library — so the sandbox stays proportional to what's used.
  files['react/index.js'] = componentNames
    .map((n) => `export { default as ${n} } from './${n}.jsx';`)
    .join('\n') + '\n';

  return files;
}

function findWebCss(filename) {
  // web CSS lives at packages/web/src/{component}/{component}.css — search
  // rather than guess the folder name, since it doesn't always match the file
  // stem exactly (e.g. checkbox.css also used by table.css's own import).
  const stem = filename.replace(/\.css$/, '');
  const candidate = resolve(WEB_SRC, stem, filename);
  try { readFileSync(candidate); return candidate; } catch { /* fall through */ }
  // Fallback: linear search (cheap — this runs a handful of times per build).
  for (const dir of readdirSync(WEB_SRC)) {
    const p = resolve(WEB_SRC, dir, filename);
    try { readFileSync(p); return p; } catch { /* keep looking */ }
  }
  throw new Error(`Prototype embed: could not locate web CSS file "${filename}"`);
}

/**
 * Full Sandpack `files` object for one prototype: its own App/data/styles,
 * the real design-system source it depends on (via assembleDesignSystemFiles),
 * and a generated mount file. Everything is read from source at build time —
 * nothing here is a hand-maintained copy.
 */
function buildSandpackFiles(p) {
  const dsFiles = assembleDesignSystemFiles(p.components);

  // Walk the entry file's own local imports — siblings (e.g. App.jsx importing
  // './Dashboard.jsx') and subdirectories (e.g. './shared/RowActions.jsx') —
  // so a prototype can be split across more than one folder, same
  // "read from real source, don't hand-copy" principle as
  // assembleDesignSystemFiles, just scoped to the prototype's own tree.
  // `name` is always a posix path relative to entryDir, no extension (e.g.
  // 'App', 'shared/RowActions'), so it doubles as both the queue de-dupe key
  // and the flattened Sandpack file path — directory structure is preserved,
  // not flattened to one level, so relative specifiers never need rewriting
  // beyond the .jsx -> .js extension swap.
  const files = {};
  const seenLocal = new Set();
  const queue = [p.entryFile.replace(/\.jsx$/, '')];
  // Every design-system component the prototype actually imports, collected
  // as we walk. Checked against the generated barrel below.
  const usedComponents = new Set();
  while (queue.length) {
    const name = queue.pop();
    if (seenLocal.has(name)) continue;
    seenLocal.add(name);
    let src = readFileSync(resolve(p.entryDir, `${name}.jsx`), 'utf8');
    const curDir = posixPath.dirname(name); // '.' at the top, 'shared' one level in
    const depth = curDir === '.' ? 0 : curDir.split('/').length;
    const dsPrefix = '../'.repeat(depth) || './';
    src = src.replace(
      /import\s*\{([^}]*)\}\s*from\s*['"]@dhcw\/sr-react['"]/g,
      (whole, named) => {
        named
          .split(',')
          .map((s) => s.trim().split(/\s+as\s+/)[0].trim())
          .filter(Boolean)
          .forEach((n) => usedComponents.add(n));
        return `import {${named}} from '${dsPrefix}design-system/react/index.js'`;
      }
    );
    src = src.replace(/from\s+['"](\.\.?\/[\w./-]+)\.jsx['"]/g, (whole, relImport) => {
      const resolved = posixPath.normalize(posixPath.join(curDir, relImport));
      queue.push(resolved);
      return `from '${relImport}.js'`;
    });
    files[`/${name}.js`] = src;
  }

  // The component list on each PROTOTYPES entry is hand-maintained, so it
  // drifts the moment a prototype starts using a component nobody added to
  // it. The embed then builds cleanly and fails at runtime in the browser,
  // on the published site, with an undefined component — which is how a
  // missing Footer shipped. Fail the build here instead.
  const missing = [...usedComponents].filter((n) => !dsFiles[`react/${n}.jsx`]);
  if (missing.length > 0) {
    throw new Error(
      `Prototype "${p.slug}" imports ${missing.join(', ')} from @dhcw/sr-react, but `
      + `${missing.length === 1 ? 'it is' : 'they are'} not in its \`components\` list in `
      + `PROTOTYPES. Add ${missing.length === 1 ? 'it' : 'them'} so the embed ships the source.`
    );
  }

  files['/data.js'] = readFileSync(resolve(p.entryDir, 'data.js'), 'utf8');
  files['/styles.css'] = readFileSync(resolve(p.entryDir, 'app.css'), 'utf8');
  files['/index.js'] = `import React from 'react';
import { createRoot } from 'react-dom/client';
import './design-system/tokens/fonts.css';
import './design-system/tokens/tokens.css';
import './design-system/tokens/typography.css';
import './styles.css';
import App from './App.js';

createRoot(document.getElementById('root')).render(<App />);
`;
  for (const [key, contents] of Object.entries(dsFiles)) {
    files[`/design-system/${key}`] = contents;
  }
  return files;
}

const PROTOTYPES = [
  {
    slug: 'case-note-tracking',
    title: 'Case Note Tracking',
    // One sentence: what the product is, not what has been built of it. The
    // build state is the Status line beneath it, and the detail of which
    // screens exist belongs in the handoff, not on a card.
    summary: 'The Welsh Patient Administration System module that tracks the storage, request and '
      + 'transfer of patient case notes across NHS Wales health boards.',
    status: 'In progress',
    entryDir: resolve(ROOT, 'products', 'case-note-tracking', 'prototype', 'src'),
    entryFile: 'App.jsx',
    components: ['Navigation', 'Header', 'Footer', 'PatientBanner', 'Autocomplete', 'Table', 'Modal', 'Button', 'Select', 'Input', 'Checkbox', 'SegmentedControl', 'RadioGroup', 'Radio', 'Tag', 'Icon'],
    startScript: 'dev:prototype',
  },
];

// ─── Markdown → HTML (subset used by our guideline docs) ──────────────────────
function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function inline(s) {
  let out = esc(s);
  out = out.replace(/`([^`]+)`/g, (_, c) => `<code>${c}</code>`);
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, h) => `<a href="${h}">${t}</a>`);
  out = out.replace(/\*\*([^*]+)\*\*/g, (_, b) => `<strong>${b}</strong>`);
  // Emphasis. Must run after bold so `**x**` is already consumed. Without it the
  // asterisks printed literally on the page — "To *submit* a choice".
  out = out.replace(/(^|[^*\w])\*([^*\n]+)\*(?!\*)/g, (_, pre, e) => `${pre}<em>${e}</em>`);
  return out;
}
function renderMarkdown(md) {
  const lines = md.replace(/\r/g, '').split('\n');
  const html = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) { html.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`); i++; continue; }
    if (/^---+\s*$/.test(line)) { html.push('<hr>'); i++; continue; }
    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, '')); i++; }
      html.push(`<blockquote>${renderMarkdown(buf.join('\n'))}</blockquote>`);
      continue;
    }
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
    if (/^\s*([-•])\s+/.test(line)) {
      const items = [];
      while (i < lines.length) {
        if (/^\s*([-•])\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*([-•])\s+/, '')); i++; continue; }
        if (items.length && /^\s+\S/.test(lines[i]) && !/^\s*[-•]\s/.test(lines[i])) { items[items.length - 1] += ' ' + lines[i].trim(); i++; continue; }
        break;
      }
      html.push(`<ul>${items.map((it) => `<li>${inline(it)}</li>`).join('')}</ul>`);
      continue;
    }
    const buf = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|>\s?|\||\s*[-•]\s|---+\s*$)/.test(lines[i])) { buf.push(lines[i]); i++; }
    html.push(`<p>${inline(buf.join(' '))}</p>`);
  }
  return html.join('\n');
}

/**
 * Drop a guidelines document's leading `# Title`.
 *
 * Every guidelines.md opens with the component's name. On a page that already
 * carries that name as its own h1 — which is now every component and pattern
 * page — rendering it again puts two h1s on the document and repeats the title
 * halfway down. The rest of the document's headings start at h2, so they nest
 * correctly under the page title once this one is removed.
 */
function stripLeadingH1(md) {
  return md.replace(/^\s*#\s+.*(\r?\n)+/, '');
}

/**
 * publicise(md)
 *
 * Guideline documents are written for the team and cite decision records, source
 * files and internal standards. None of that belongs on the published site, so it
 * is stripped here rather than duplicating every document in two versions.
 */
function publicise(md) {
  const out = [];
  const lines = md.replace(/\r/g, '').split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // Drop the document metadata table (Type / Status / Reference / Figma / Last updated).
    if (/^\|\s*\|\s*\|\s*$/.test(line)) {
      while (i < lines.length && /^\|/.test(lines[i])) i++;
      continue;
    }
    // Drop any table row that only exists to point at internal sources.
    if (/^\|\s*\*\*(Reference|Figma|Related standards|Status|Type|Last updated)\*\*/.test(line)) { i++; continue; }
    out.push(line);
    i++;
  }

  let text = out.join('\n');

  // Nothing below may consume a newline: removals use [ \t]* so neighbouring list
  // items and paragraphs never get merged together.

  // 0. Unwrap links to internal source files first, so later rules see plain text.
  text = text.replace(/\[([^\]]+)\]\([^)]*\.(?:md|json)(?:#[^)]*)?\)/g, '$1');

  // 1. List items that are nothing but a pointer, i.e. the reference is the item's
  //    subject. An item with real content that merely ends in a pointer is kept;
  //    rule 2 trims the pointer sentence off it.
  text = text.replace(/^[ \t]*[-•][ \t]*\[?DDR-\d+[^\n]*\n?/gm, '');
  text = text.replace(/^[ \t]*[-•][ \t]*`?[\w/.-]*\.(?:md|json)`?[^\n]*\n?/gm, '');

  // 2. Whole sentences that exist only to cite a decision record or a source file.
  text = text.replace(/[ \t]*\bSee\b[^.\n]*(?:DDR-\d+|\.(?:md|json))[^.\n]*\.?/gi, '');
  text = text.replace(/^[ \t]*Full [^\n]*\.(?:md|json)[^\n]*\n?/gm, '');

  // 3. Remaining citations, keeping the prose they sit inside.
  text = text.replace(/[ \t]*\((?:see[ \t]+)?DDR-\d+[^)]*\)/gi, '');
  text = text.replace(/[ \t]*\(UI Standards #\d+\)/g, '');
  text = text.replace(/[ \t]*\bDDR-\d+[ \t]*/g, ' ');
  text = text.replace(/[ \t]*\bUI Standards #\d+[ \t]*/g, ' ');
  // A page-anchor citation like "p.63" or "(p.63, p.71)" contains a period that is not
  // a sentence end, so a lone period followed by a digit must not stop this match.
  text = text.replace(/[ \t]*·?[ \t]*DHCW UI Standards(?:[^.\n]|\.(?=\d))*/g, '');

  // 4. Leftover inline file references.
  text = text.replace(/[ \t]*`[^`\n]*\.(?:md|json)`/g, '');

  // 5. Em dashes are not used anywhere on this site.
  text = text.replace(/[ \t]*—[ \t]*/g, ', ');

  // 6. Tidy the punctuation left behind by the removals.
  text = text.replace(/\(\s*\)/g, '');
  // A whole sentence stripped down to nothing leaves an orphan line with just its
  // trailing punctuation (e.g. a lone "." paragraph); drop those lines entirely.
  text = text.replace(/^[ \t]*[.,;:][ \t]*$/gm, '');
  text = text.replace(/[ \t]+([.,;:])/g, '$1');
  text = text.replace(/,[ \t]*,/g, ',');
  text = text.replace(/([.,;:])[ \t]*\1/g, '$1');
  text = text.replace(/\bthe[ \t]+(?=[.,])/g, '');
  text = text.replace(/[ \t]{2,}/g, ' ');
  text = text.replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n');

  // Sections whose only content was internal references are now empty headings. Drop them,
  // along with any trailing rule that used to separate them.
  const kept = [];
  const src = text.split('\n');
  for (let j = 0; j < src.length; j++) {
    const h = src[j].match(/^(#{1,6})\s/);
    if (h) {
      let k = j + 1;
      while (k < src.length && (!src[k].trim() || /^---+\s*$/.test(src[k]))) k++;
      // Nothing under it at all, or the next thing is a heading at the same or
      // higher level. A heading followed by a *deeper* one still has content —
      // it is a parent section, and dropping it silently removed "Type: Switch"
      // and "Type: Segmented control" from the Toggles page.
      const next = k < src.length ? src[k].match(/^(#{1,6})\s/) : null;
      if (k >= src.length || (next && next[1].length <= h[1].length)) continue;
    }
    kept.push(src[j]);
  }
  return kept.join('\n').replace(/\n{3,}/g, '\n\n').replace(/(?:\n---+\s*)+$/, '\n');
}

// ─── token data (from the build artifact) ─────────────────────────────────────
const flat = JSON.parse(readFileSync(resolve(TOKENS, 'json', 'tokens-flat.json'), 'utf8'));
const colourEntries = Object.entries(flat).filter(([k, v]) => typeof v === 'string' && /^#/.test(v));
const toPx = (v) => {
  if (typeof v === 'number') return v;
  const s = String(v).trim();
  if (s.endsWith('rem')) return Math.round(parseFloat(s) * 16);
  if (s.endsWith('px')) return parseFloat(s);
  const n = parseFloat(s); return Number.isFinite(n) ? (n <= 8 ? Math.round(n * 16) : n) : null;
};
const spaceEntries = Object.entries(flat)
  .filter(([k]) => /^space-\d+$/.test(k))
  .map(([k, v]) => [k, toPx(v)])
  .filter(([, px]) => px != null)
  .sort((a, b) => a[1] - b[1]);
const radiusEntries = Object.entries(flat).filter(([k]) => /^radius-\d+$/.test(k)).map(([k, v]) => [k, toPx(v)]);

// Elevation specimens, rendered from the built tokens so the page cannot drift
// from what products actually consume.
const elevationEntries = Object.entries(flat)
  .filter(([k]) => /^elevation-/.test(k))
  .map(([k, v]) => [k.replace(/^elevation-/, ''), v]);
const ELEVATION_USE = {
  raised: 'Cards and panels. Use only where a border alone will not separate a surface from its background.',
  overlay: 'Anything that floats above the page: modals, drawers, dropdown menus, tooltips.',
};
const elevationSamples = elevationEntries.map(([name, value]) => `
  <figure class="elevation">
    <div class="elevation__chip" style="box-shadow: var(--elevation-${name})"></div>
    <figcaption>
      <code>--elevation-${name}</code>
      <span class="elevation__value">${value}</span>
      <span class="elevation__use">${ELEVATION_USE[name] || ''}</span>
    </figcaption>
  </figure>`).join('');

function swatchGrid(filterFn) {
  return `<div class="swatches">${colourEntries.filter(([k]) => filterFn(k)).map(([k, v]) =>
    `<figure class="swatch"><div class="swatch__chip" style="background: var(--${k}, ${v})"></div>
     <figcaption><code>--${k}</code><span class="hex">${v}</span></figcaption></figure>`).join('')}</div>`;
}
const typeSamples = ['heading-xl', 'heading-l', 'heading-m', 'heading-s', 'heading-xs', 'body-m', 'body-s', 'label', 'caption']
  .map((t) => `<div class="type-row"><span class="type-row__meta"><code>.sr-type-${t}</code></span>
    <span class="sr-type-${t}">The patient record is clear and legible</span></div>`).join('');
const spacingScale = spaceEntries.map(([k, px]) =>
  `<div class="space-row"><span class="space-row__meta"><code>--${k}</code> · ${px}px</span>
   <span class="space-bar" style="width: var(--${k}, ${px}px)"></span></div>`).join('');
const radiusSamples = radiusEntries.map(([k, px]) =>
  `<figure class="radius"><div class="radius__box" style="border-radius: var(--${k}, ${px}px)"></div>
   <figcaption><code>--${k}</code><span class="hex">${px}px</span></figcaption></figure>`).join('');

// ─── Navigation model ─────────────────────────────────────────────────────────
/**
 * Component stylesheets the site loads so previews render as the real component.
 *
 * ONE list, used for both the <link> tags in the shells and the copy step at the
 * bottom. These used to be three hand-maintained lists that had to agree; they
 * drifted, and the Input page shipped with every preview unstyled because
 * input.css was in none of them. Adding a component here is now the only step.
 */
const SITE_COMPONENT_CSS = [
  'button', 'table', 'patient-banner', 'header', 'footer', 'bottom-nav',
  'breadcrumbs', 'switch', 'segmented-control', 'navigation', 'input',
];
const COMPONENT_CSS_LINKS = (prefix) =>
  SITE_COMPONENT_CSS.map((c) => `<link rel="stylesheet" href="${prefix}assets/${c}.css">`).join('\n');

const SECTIONS = [
  {
    id: 'get-started', label: 'Get Started', href: 'index.html',
    side: [
      { href: 'index.html', label: 'SR Design System' },
      { href: 'how-to-use.html', label: 'How to use' },
      { href: 'get-the-files.html', label: 'Get the files' },
      { href: 'figma.html', label: 'Using Figma' },
      { href: 'storybook.html', label: 'Using Storybook' },
    ],
  },
  {
    id: 'styles', label: 'Styles', href: 'styles/typography.html',
    side: [
      { href: 'styles/typography.html', label: 'Typography' },
      { href: 'styles/colour.html', label: 'Colour' },
      { href: 'styles/spacing.html', label: 'Spacing & Elevation' },
      { href: 'styles/icons.html', label: 'Icons' },
      { href: 'styles/grids.html', label: 'Grids' },
      { href: 'styles/token-translator.html', label: 'Token Translator' },
    ],
  },
  {
    // Alphabetical. With six entries and more coming, "the order they were
    // built in" stops being findable; the section link opens the first one.
    id: 'components', label: 'Components', href: 'components/breadcrumbs.html',
    side: [
      { href: 'components/breadcrumbs.html', label: 'Breadcrumbs' },
      { href: 'components/button.html', label: 'Buttons' },
      { href: 'components/footer.html', label: 'Footer' },
      { href: 'components/header.html', label: 'Header' },
      { href: 'components/input.html', label: 'Input' },
      { href: 'components/navigation.html', label: 'Navigation' },
      { href: 'components/table.html', label: 'Tables' },
      { href: 'components/toggles.html', label: 'Toggles' },
    ],
  },
  {
    // Patterns behaves like Components: the nav entry opens the first pattern
    // directly. No overview page — with one pattern it was a card pointing at
    // the only sibling in the sidebar.
    id: 'patterns', label: 'Patterns', href: 'patterns/patient-banner.html',
    side: [
      { href: 'patterns/patient-banner.html', label: 'Patient Banner' },
    ],
  },
  {
    id: 'prototypes', label: 'Prototypes', href: 'prototypes.html',
    side: [
      { href: 'prototypes.html', label: 'Overview' },
      ...PROTOTYPES.map((p) => ({ href: `prototypes/${p.slug}.html`, label: p.title })),
    ],
  },
  { id: 'contributions', label: 'Contributions', href: 'contributions.html' },
];

const ICON_GLOBE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18"/></svg>';
const ICON_SEARCH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';

function shell({ title, prefix, sectionId, activeHref, body, extraHead = '', extraScript = '' }) {
  const section = SECTIONS.find((s) => s.id === sectionId);
  const topnav = SECTIONS.map((s) =>
    `<a href="${prefix + s.href}"${s.id === sectionId ? ' aria-current="page"' : ''}>${s.label}</a>`).join('');
  const sidebar = section && section.side
    ? `<nav class="sidebar" aria-label="${section.label}">
        <div class="sidebar__inner">
          <p class="sidebar__title">${section.label}</p>
          ${section.side.map((n) =>
            `<a href="${prefix + n.href}"${n.href === activeHref ? ' aria-current="page"' : ''}>${n.label}</a>`).join('')}
        </div>
       </nav>`
    : '';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} | Single Record Design System</title>
<link rel="stylesheet" href="${prefix}assets/fonts.css">
<link rel="stylesheet" href="${prefix}assets/tokens.css">
<link rel="stylesheet" href="${prefix}assets/typography.css">
${COMPONENT_CSS_LINKS(prefix)}
<link rel="stylesheet" href="${prefix}assets/icon.css">
<link rel="stylesheet" href="${prefix}assets/site.css">
${extraHead}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="masthead">
  <div class="masthead__row masthead__utility">
    <a href="${REPORT_ISSUE_URL}" target="_blank" rel="noopener">Report an issue</a>
    <button id="lang" class="lang-toggle" type="button" aria-pressed="false" data-en="Cymraeg" data-cy="English">${ICON_GLOBE}<span>Cymraeg</span></button>
  </div>
  <div class="masthead__row masthead__main">
    <a class="masthead__brand" href="${prefix}index.html">
      <img src="${prefix}assets/dhcw-logo-white.png" alt="GIG Cymru NHS Wales, Digital Health and Care Wales" width="155" height="48">
    </a>
    <nav class="primary-nav" aria-label="Primary">${topnav}</nav>
    <div class="search">
      <label class="sr-only" for="site-search">Search the design system</label>
      <div class="search__field">
        <span class="search__icon">${ICON_SEARCH}</span>
        <input id="site-search" class="search__input" type="search" autocomplete="off"
               role="combobox" aria-expanded="false" aria-controls="search-results" aria-autocomplete="list"
               placeholder="Type here to begin search">
      </div>
      <div id="search-results" class="search__panel" role="listbox" aria-label="Search results" hidden></div>
    </div>
  </div>
</header>
<div class="layout${sidebar ? '' : ' layout--nosidebar'}">
  ${sidebar}
  <main id="main" class="content">
${body}
  </main>
</div>
<footer class="site-footer">
  <p>DHCW Single Record Design System. Rendered from the built design tokens and reference components.
     <a href="${REPORT_ISSUE_URL}" target="_blank" rel="noopener">Report an issue</a>.</p>
</footer>
<script>window.__PREFIX__=${JSON.stringify(prefix)};</script>
<script src="${prefix}assets/search-index.js"></script>
<script src="${prefix}assets/site.js"></script>
${extraScript}
</body>
</html>`;
}

/**
 * Minimal page shell with no masthead, primary nav, sidebar or footer — just
 * the token/component CSS and the body. Used for prototype embeds: the point
 * of their own bar (back-link, title, Preview/Code toggle) is to BE the only
 * navigation chrome, filling the browser viewport the way the real product
 * eventually will, not to sit inside another layer of site navigation.
 */
function bareShell({ title, prefix, body, extraHead = '', extraScript = '' }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} | Single Record Design System</title>
<link rel="stylesheet" href="${prefix}assets/fonts.css">
<link rel="stylesheet" href="${prefix}assets/tokens.css">
<link rel="stylesheet" href="${prefix}assets/typography.css">
${COMPONENT_CSS_LINKS(prefix)}
<link rel="stylesheet" href="${prefix}assets/icon.css">
<link rel="stylesheet" href="${prefix}assets/site.css">
${extraHead}
</head>
<body class="bare">
${body}
<script>window.__PREFIX__=${JSON.stringify(prefix)};</script>
${extraScript}
</body>
</html>`;
}

// ─── shared building blocks ───────────────────────────────────────────────────
// Framework tabs: one order and one treatment on every page.
const FRAMEWORKS = ['HTML', 'React', 'Blazor', 'MAUI'];

/** JSON for embedding inside a <script> block: `<` is escaped so a snippet
 *  containing `</script>` can never terminate the tag early. */
const jsonForScript = (v) => JSON.stringify(v).replace(/</g, '\\u003c');

/**
 * Build-time check: every React snippet on this site must use props the React
 * component actually has.
 *
 * These snippets are written by hand next to the preview, and a component's
 * props move. The Button page said `<Button variant="primary">` while the
 * component's prop is `type` — copying that snippet gave you a button that
 * silently ignored the variant. A doc snippet that does not work is worse than
 * no snippet, because the reader has no reason to doubt it.
 *
 * The check is deliberately shallow: it reads the destructured parameter names
 * out of the component's own source and compares them with the attribute names
 * in the snippet. It cannot tell you a value is wrong, only that a prop does
 * not exist. That is the failure that actually happens.
 */
const REACT_PROPS_CACHE = {};
function reactPropsOf(name) {
  if (name in REACT_PROPS_CACHE) return REACT_PROPS_CACHE[name];
  const file = REACT_FILE_BY_NAME[name];
  if (!file || !existsSync(file)) return (REACT_PROPS_CACHE[name] = null);
  const src = readFileSync(file, 'utf8');
  const sig = new RegExp(`function\\s+${name}\\s*\\(`).exec(src);
  if (!sig) return (REACT_PROPS_CACHE[name] = null);
  // Walk from the first "{" after the signature to its matching "}".
  const open = src.indexOf('{', sig.index + sig[0].length);
  if (open === -1) return (REACT_PROPS_CACHE[name] = null);
  let depth = 0, end = -1;
  for (let i = open; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) { end = i; break; } }
  }
  if (end === -1) return (REACT_PROPS_CACHE[name] = null);
  const block = src.slice(open + 1, end);
  // Top-level keys only: skip anything nested inside a default value.
  const props = new Set();
  let d = 0, token = '';
  for (const ch of block) {
    if ('{[('.includes(ch)) d++;
    else if ('}])'.includes(ch)) d--;
    if (d === 0) {
      if (ch === ',' || ch === '=' || ch === '\n') {
        const t = token.trim();
        if (/^\w+$/.test(t)) props.add(t);
        if (ch !== '=') token = '';
        else token = '';
        continue;
      }
      token += ch;
    }
  }
  const t = token.trim();
  if (/^\w+$/.test(t)) props.add(t);
  return (REACT_PROPS_CACHE[name] = props);
}

/**
 * The MAUI counterpart of the React prop check below.
 *
 * A MAUI snippet is XAML, and the thing that silently rots in XAML is a
 * `{StaticResource ...}` naming a key that no longer exists — it throws at page
 * parse time in the consuming app, long after anyone copied it from here. So
 * every resource a MAUI snippet references must resolve against what
 * @dhcw/sr-maui actually ships (DDR-021).
 *
 * Deliberately shallow, same as the React check: it cannot tell you a value is
 * wrong, only that a name does not exist. That is the failure that happens.
 */
const MAUI_RESOURCES = (() => {
  const known = new Set();
  // Icons.xaml is part of the contract too — it was added after this check was
  // written, so every SrIcon… reference read as a missing resource until it was
  // listed here.
  for (const f of ['Colors.xaml', 'Styles.xaml', 'Icons.xaml']) {
    const p = resolve(ROOT, 'packages', 'maui', f);
    if (!existsSync(p)) return null; // package not built yet — skip rather than fail
    for (const m of readFileSync(p, 'utf8').matchAll(/x:Key="([^"]+)"/g)) known.add(m[1]);
  }
  return known;
})();

function checkMauiSnippet(panelId, code) {
  if (!MAUI_RESOURCES) return;
  const seen = new Set();
  for (const m of code.matchAll(/\{StaticResource\s+([^}]+?)\s*\}/g)) {
    const name = m[1].trim();
    if (seen.has(name) || MAUI_RESOURCES.has(name)) continue;
    seen.add(name);
    snippetProblems.push(
      `${panelId}: {StaticResource ${name}} — no such resource in @dhcw/sr-maui. `
      + `Add the token or style, or fix the snippet.`
    );
  }
  // Same rule the MAUI package enforces on itself: no literal colours.
  for (const m of code.matchAll(/(?:Value|Color|BackgroundColor|TextColor|Stroke|Fill|BorderColor)\s*=\s*"(#[0-9A-Fa-f]{3,8}|Red|Blue|Green|Maroon|Black|White|Gray|Grey)"/g)) {
    snippetProblems.push(`${panelId}: literal colour "${m[1]}" in a MAUI snippet — use a token.`);
  }
}

const snippetProblems = [];
function checkReactSnippet(panelId, code) {
  const open = /^\s*<([A-Z]\w*)([\s>])/.exec(code.replace(/^(\s*\/\/[^\n]*\n)+/, ''));
  if (!open) return;
  const name = open[1];
  const known = reactPropsOf(name);
  if (!known) return; // not one of ours, or an unparseable signature
  // Attributes on the opening tag only, so children and nested JSX are ignored.
  const tagEnd = code.indexOf('>', open.index);
  const attrs = code.slice(open.index, tagEnd === -1 ? code.length : tagEnd);
  for (const m of attrs.matchAll(/(?:^|\s)([a-z]\w*)\s*(?:=|\s*\/?>|$)/g)) {
    const prop = m[1];
    if (!known.has(prop) && !prop.startsWith('aria') && !prop.startsWith('data')) {
      snippetProblems.push(`${panelId}: <${name} ${prop}=…> — ${name} has no prop "${prop}". `
        + `It takes: ${[...known].sort().join(', ')}`);
    }
  }
}

/**
 * Icon for a navigation card. Decorative: the card's own heading and paragraph
 * carry the meaning, so it is hidden from assistive technology rather than
 * given a name that would be read out twice.
 *
 * Icons come from the real set (`foundations/iconography/svg/`), so a name that
 * does not exist fails the build rather than rendering an empty box.
 */
function cardIcon(name) {
  if (!iconNames.includes(name)) {
    throw new Error(`cardIcon("${name}") — no such icon. See foundations/iconography/svg/.`);
  }
  return `<span class="card__icon sr-icon sr-icon--md" aria-hidden="true">${iconMarkup(name)}</span>`;
}

/** Dark code panel with framework tabs and a copy button. */
function codePanel(id, snippets) {
  if (snippets.React) checkReactSnippet(id, snippets.React);
  if (snippets.MAUI) checkMauiSnippet(id, snippets.MAUI);
  const tabs = FRAMEWORKS.map((f, idx) =>
    `<button class="codepanel__tab${idx === 0 ? ' is-active' : ''}" type="button" role="tab"
       aria-selected="${idx === 0}" data-fw="${f}" data-target="${id}">${f}</button>`).join('');
  return `<div class="codepanel" data-panel="${id}">
  <div class="codepanel__bar">
    <div class="codepanel__tabs" role="tablist" aria-label="Framework">${tabs}</div>
    <button class="codepanel__copy" type="button" data-copy="${id}">Copy code</button>
  </div>
  <pre><code id="${id}-code">${esc(snippets.HTML)}</code></pre>
</div>
<script>window.__snips=window.__snips||{};window.__snips[${jsonForScript(id)}]=${jsonForScript(snippets)};</script>`;
}

/**
 * White preview area with the dark code panel attached beneath it.
 *
 * Aligned with the content column by default, like every other block on the
 * page. Pass `{ bleed: true }` only where column width would misrepresent the
 * component — see `.showcase--bleed` in site.css.
 */
function showcase(previewHtml, id, snippets, { bleed = false } = {}) {
  return `<section class="showcase${bleed ? ' showcase--bleed' : ''}">
  <div class="showcase__preview">${previewHtml}</div>
  ${codePanel(id, snippets)}
</section>`;
}

// Accessibility table: locked column structure, SR-specific content per row.
function accessibilityTable(rows) {
  const head = `<thead><tr><th>Requirement</th><th>WCAG SC</th><th>How Single Record meets it</th><th>Test method</th></tr></thead>`;
  const body = rows.map((r) =>
    `<tr><td>${inline(r.req)}</td><td>${inline(r.sc)}</td><td>${inline(r.how)}</td><td>${inline(r.test)}</td></tr>`).join('');
  // "Accessibility requirements", not "Accessibility": every guidelines.md
  // already carries a prose "## Accessibility" section, and two identical h2s
  // on one page is just confusing. This is the testable requirements matrix.
  return `<h2>Accessibility requirements</h2><div class="table-wrap"><table class="a11y-table">${head}<tbody>${body}</tbody></table></div>`;
}

// ─── Components: Header and Footer ───────────────────────────────────────────
const HDR_ICON_SEARCH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.34-4.34"/></svg>';
const HDR_ICON_GLOBE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15 15 0 0 1 0 20a15 15 0 0 1 0-20"/></svg>';
const HDR_ICON_BELL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/></svg>';
const HDR_ICON_MENU = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
// Text lockup, not the real NHS/GIG asset (trademarked raster) — same
// placeholder approach as the Case Note Tracking prototype's BRAND_LOCKUP.
const HDR_LOGO = `<span style="font: var(--sr-type-heading-xs-font); letter-spacing: var(--sr-type-heading-xs-letter-spacing); color: var(--sr-color-interactive-primary);">Single Record</span>`;

function headerBody() {
  const md = stripLeadingH1(publicise(readFileSync(resolve(ROOT, 'components', 'header', 'guidelines.md'), 'utf8')));
  const desktop1 = `<header class="sr-header">
  <div class="sr-header__utility">
    <a class="sr-header__utility-link" href="#">Report an issue</a>
    <a class="sr-header__utility-link" href="#"><span class="sr-header__utility-icon sr-icon sr-icon--xs">${HDR_ICON_GLOBE}</span><span>Cymraeg</span></a>
  </div>
  <div class="sr-header__main">
    <span class="sr-header__logo">${HDR_LOGO}</span>
    <div class="sr-header__search">
      <span class="sr-header__search-icon sr-icon sr-icon--sm">${HDR_ICON_SEARCH}</span>
      <input class="sr-header__search-input" type="search" placeholder="Type here to begin search">
    </div>
    <div class="sr-header__actions">
      <button type="button" class="sr-header__notification" aria-label="Notifications"><span class="sr-icon sr-icon--md">${HDR_ICON_BELL}</span></button>
      <div class="sr-header__avatar"><span class="sr-header__avatar-initials">AB</span><span class="sr-header__avatar-status"></span></div>
    </div>
  </div>
</header>`;
  const bar = `<header class="sr-header sr-header--bar">
  <div class="sr-header__main">
    <div class="sr-header__search">
      <span class="sr-header__search-icon sr-icon sr-icon--sm">${HDR_ICON_SEARCH}</span>
      <input class="sr-header__search-input" type="search" placeholder="Type here to begin search">
    </div>
    <div class="sr-header__cluster">
      <button type="button" class="sr-header__lang"><span class="sr-icon sr-icon--xs">${HDR_ICON_GLOBE}</span><span>Cymraeg</span></button>
      <button type="button" class="sr-header__notification" aria-label="Notifications"><span class="sr-icon sr-icon--md">${HDR_ICON_BELL}</span></button>
      <div class="sr-header__avatar"><span class="sr-header__avatar-initials">AB</span><span class="sr-header__avatar-status"></span></div>
    </div>
  </div>
</header>`;
  const mobile = `<header class="sr-header sr-header--mobile sr-header--centered">
  <div class="sr-header__main">
    <button type="button" class="sr-header__menu" aria-label="Open menu"><span class="sr-icon sr-icon--md">${HDR_ICON_MENU}</span></button>
    <span class="sr-header__logo">${HDR_LOGO}</span>
    <div class="sr-header__actions">
      <button type="button" class="sr-header__notification" aria-label="Notifications"><span class="sr-icon sr-icon--md">${HDR_ICON_BELL}</span></button>
      <div class="sr-header__avatar"><span class="sr-header__avatar-initials">AB</span><span class="sr-header__avatar-status"></span></div>
    </div>
  </div>
</header>`;
  const desktop1Snippets = {
    HTML: '<header class="sr-header">\n  <div class="sr-header__utility">…</div>\n  <div class="sr-header__main">\n    <span class="sr-header__logo">…</span>\n    <div class="sr-header__search">…</div>\n    <div class="sr-header__actions">…</div>\n  </div>\n</header>',
    React: '<Header\n  variant="desktop"   // "desktop" | "desktop-2" | "mobile"\n  logo={<LogoLockup />}\n  initials="AB"\n  onSearch={handleSearch}\n  onReportIssue={openIssueForm}\n  onLanguageToggle={toggleWelsh}\n/>',
    Blazor: '<SrHeader Variant="Desktop" Initials="AB" />',
    MAUI: '<!-- Desktop 1 pairs with a browser-width layout MAUI does not have —\n     MAUI is mobile only (phone, tablet); see foundations/grid-and-layout.md.\n     Use the mobile type below for the MAUI header instead. -->',
  };
  const barSnippets = {
    HTML: '<header class="sr-header sr-header--bar">\n  <div class="sr-header__main">\n    <div class="sr-header__search">…</div>\n    <div class="sr-header__cluster">…</div>\n  </div>\n</header>',
    React: '<Header\n  variant="desktop-2"   // "desktop" | "desktop-2" | "mobile"\n  initials="AB"\n  org="Cardiff and Vale UHB"\n  onSearch={handleSearch}\n  onLanguageToggle={toggleWelsh}\n/>',
    Blazor: '<SrHeader Variant="Desktop2" Initials="AB" />',
    MAUI: '<!-- Desktop 2 pairs with the sidebar Navigation, a browser-width pattern —\n     MAUI is mobile only (phone, tablet); see foundations/grid-and-layout.md.\n     Use the mobile type below for the MAUI header instead. -->',
  };
  const mobileSnippets = {
    HTML: '<header class="sr-header sr-header--mobile sr-header--centered">\n  <div class="sr-header__main">\n    <button class="sr-header__menu">…</button>\n    <span class="sr-header__logo">…</span>\n    <div class="sr-header__actions">…</div>\n  </div>\n</header>',
    React: '<Header\n  variant="mobile"\n  showMenu\n  logo={<LogoMark />}\n  initials="AB"\n  onMenuClick={openDrawer}\n/>',
    Blazor: '<SrHeader Variant="Mobile" ShowMenu="true" Initials="AB" />',
    MAUI: `<Grid BackgroundColor="{AppThemeBinding Light={StaticResource SrColorSurfaceSectionCards}, Dark={StaticResource SrColorSurfaceSectionCardsDark}}"
      ColumnDefinitions="Auto,*,Auto" Padding="16,12" MinimumHeightRequest="64">

    <Path Data="{StaticResource SrIconNavMenu}"
          Aspect="Uniform" HeightRequest="24" WidthRequest="24"
          StrokeThickness="2" StrokeLineCap="Round" StrokeLineJoin="Round"
          Stroke="{AppThemeBinding Light={StaticResource SrColorTextPrimary}, Dark={StaticResource SrColorTextPrimaryDark}}"
          SemanticProperties.Description="Menu" />

    <Label Grid.Column="1" Text="Single Record" StyleClass="HeadingXs"
           HorizontalOptions="Center" VerticalOptions="Center" />

    <Path Grid.Column="2" Data="{StaticResource SrIconNavSearch}"
          Aspect="Uniform" HeightRequest="24" WidthRequest="24"
          StrokeThickness="2" StrokeLineCap="Round" StrokeLineJoin="Round"
          Stroke="{AppThemeBinding Light={StaticResource SrColorTextPrimary}, Dark={StaticResource SrColorTextPrimaryDark}}"
          SemanticProperties.Description="Search" />
</Grid>`,
  };
  // Each variant is introduced before it is shown — heading, then what it is
  // and when to reach for it, then the example. The previous order (example
  // first, explanation after) left the reader looking at three near-identical
  // bars with no way to tell which one they were being shown.
  return `
<p class="breadcrumbs">Components</p>
<h1>Header</h1>
<p class="lede">The top bar of every product: identity, search, language and the user's own
controls. Three variants — two desktop, one mobile — and a product uses exactly one of them.</p>

<h2>Type: Desktop 1</h2>
<p class="muted">The full bar — utility strip ("Report an issue", Cymraeg), logo, search,
notification and avatar. The default variant, for products with no sidebar of their own. Code
value <code>desktop</code>.</p>
${showcase(desktop1, 'header-desktop', desktop1Snippets)}

<h2>Type: Desktop 2</h2>
<p class="muted">A single 80px bar, which pairs with the sidebar Navigation. It carries no logo,
because the sidebar does — and it is 64px so its bottom rule continues the sidebar's. Code value
<code>desktop-2</code>.</p>
${showcase(bar, 'header', barSnippets)}

<h2>Type: Mobile</h2>
<p class="muted">A compact 56px bar: hamburger, logo, and a reduced action cluster. No utility strip
and no search field; <code>showMenu</code> centres the logo between the hamburger and the actions,
matching Mobile 1. This is the only variant MAUI renders — MAUI is mobile only (phone, tablet), so
Desktop 1 and Desktop 2 have no MAUI equivalent (see foundations/grid-and-layout.md). Code value
<code>mobile</code>.</p>
${showcase(mobile, 'header-mobile', mobileSnippets)}
<hr>
${renderMarkdown(md)}
${accessibilityTable([
    { req: 'One header landmark per page', sc: '1.3.1', how: 'Renders a real <header> element; products must not nest a second.', test: 'Landmark review' },
    { req: 'Icon-only controls are named', sc: '4.1.2', how: 'Notification and avatar controls carry an accessible name describing the action, not the glyph.', test: 'Screen reader announce' },
    { req: 'Search field has a label', sc: '3.3.2', how: 'A real label, visually hidden via hideLabel where the design shows none — a placeholder is not an accessible name and disappears on typing.', test: 'Screen reader, type into field' },
    { req: 'Language toggle survives narrow viewports', sc: '1.4.10', how: 'Below 768px the word is dropped but the globe icon remains, so the control stays recognisable rather than becoming an empty button.', test: 'Resize to 390px' },
    { req: 'Focus visible', sc: '2.4.7', how: 'SR cyan ring on every control, offset from the bar edge so it is not clipped.', test: 'Keyboard tab' },
  ])}`;
}

function footerBody() {
  const md = stripLeadingH1(publicise(readFileSync(resolve(ROOT, 'components', 'footer', 'guidelines.md'), 'utf8')));
  const demo = `<footer class="sr-footer">
  <span class="sr-footer__version">v 0.1.0.1112</span>
  <div class="sr-footer__actions">
    <button type="button" class="sr-button sr-button--secondary sr-button--small">Save changes</button>
    <button type="button" class="sr-button sr-button--primary sr-button--small">Mark as complete</button>
  </div>
</footer>`;
  const snippets = {
    HTML: '<footer class="sr-footer">\n  <span class="sr-footer__version">v 0.1.0.1112</span>\n  <div class="sr-footer__actions">…</div>\n</footer>',
    React: '<Footer\n  version="v 0.1.0.1112"\n  onSave={handleSave}\n  onComplete={handleComplete}\n/>',
    Blazor: '<SrFooter Version="v 0.1.0.1112" />',
    // This is the Desktop type (Figma 3015:24776) only — Footer's Mobile type
    // (665:16526) isn't a scaled-down version of this bar, see the note below.
    // A version-and-actions strip is a browser-width pattern MAUI has no
    // equivalent surface for.
    MAUI: '<!-- Desktop Footer has no MAUI equivalent — MAUI is mobile only\n     (phone, tablet); see foundations/grid-and-layout.md. Its persistent\n     bottom bar is the BottomNav component, not this Footer. -->',
  };
  // Footer's Mobile type (Figma 665:16526, on the same Footer page as the
  // desktop bar). Shown at 390px because that is the width it is designed for
  // — stretched to the full content column it reads as a desktop toolbar.
  const navItems = [
    { icon: 'nav/home', label: 'Home', current: true },
    { icon: 'schedule/appointment', label: 'Diary' },
    { icon: 'people/patient', label: 'Patients' },
    { icon: 'comms/message', label: 'Messages' },
    { icon: 'nav/more', label: 'More' },
  ];
  const bottomNav = `<nav class="sr-bottom-nav" aria-label="Primary" style="max-width:390px;margin:0 auto">
${navItems.map((n) => `  <a class="sr-bottom-nav__item" href="#"${n.current ? ' aria-current="page"' : ''}>
    <span class="sr-bottom-nav__icon">${iconMarkup(n.icon)}</span>
    <span class="sr-bottom-nav__label">${n.label}</span>
  </a>`).join('\n')}
</nav>`;
  const bottomNavSnippets = {
    HTML: '<nav class="sr-bottom-nav" aria-label="Primary">\n  <a class="sr-bottom-nav__item" href="/home" aria-current="page">\n    <span class="sr-bottom-nav__icon">…</span>\n    <span class="sr-bottom-nav__label">Home</span>\n  </a>\n  …\n</nav>',
    React: '<BottomNav\n  items={[\n    { icon: "nav/home", label: "Home", href: "/home" },\n    { icon: "schedule/appointment", label: "Diary", href: "/diary" },\n    …\n  ]}\n  current="Home"\n/>',
    Blazor: '<SrBottomNav Items="@navItems" Current="Home" />',
    MAUI: `<!-- Icon above label, centred. The current destination takes
     Interactive/Primary; the rest take Text/Secondary. -->
<Grid ColumnDefinitions="*,*,*,*,*"
      BackgroundColor="{AppThemeBinding Light={StaticResource SrColorSurfaceSectionCards}, Dark={StaticResource SrColorSurfaceSectionCardsDark}}">

    <VerticalStackLayout Grid.Column="0" Padding="4,8" Spacing="4" MinimumHeightRequest="60">
        <Path Data="{StaticResource SrIconNavHome}"
              Aspect="Uniform" HeightRequest="24" WidthRequest="24" HorizontalOptions="Center"
              StrokeThickness="2" StrokeLineCap="Round" StrokeLineJoin="Round"
              Stroke="{AppThemeBinding Light={StaticResource SrColorInteractivePrimary}, Dark={StaticResource SrColorInteractivePrimaryDark}}" />
        <Label Text="Home" StyleClass="Caption" HorizontalTextAlignment="Center"
               TextColor="{AppThemeBinding Light={StaticResource SrColorInteractivePrimary}, Dark={StaticResource SrColorInteractivePrimaryDark}}" />
    </VerticalStackLayout>

    <!-- Diary, Patients, Messages and More follow the same shape with
         Text/Secondary. MinimumHeightRequest, never HeightRequest: the bar
         grows at 200% font scale rather than cropping its labels. -->
</Grid>`,
  };
  return `
<p class="breadcrumbs">Components</p>
<h1>Footer</h1>
<p class="lede">The pinned bottom bar. It carries the build version on every screen, and the
screen's committing action where there is one.</p>

<h2>Type: Desktop</h2>
<p class="muted">Version left, actions right. Exactly one primary action — the one that commits.</p>
${showcase(demo, 'footer', snippets)}

<h2>Type: Mobile</h2>
<p class="muted">The mobile type in the same Figma frame (<code>665:16526</code>) is not a scaled-down
version of the desktop bar: it is the persistent bottom tab bar. It is shown here because that is
where the design file puts it — Footer is the surface, and a product picks the type that suits its
platform — but it is implemented as its own component, <code>BottomNav</code>, because it behaves as
primary navigation rather than a page-level action bar. Take the labels from the product's own top
five destinations; five is the maximum that stays legible at 390px.</p>
${showcase(bottomNav, 'footer-mobile', bottomNavSnippets)}
<div class="callout"><p><strong>A screen has one or the other, never both.</strong> Desktop carries
the committing action; mobile carries navigation, and its committing action belongs in the screen
itself.</p></div>
<hr>
${renderMarkdown(md)}
${accessibilityTable([
    { req: 'One footer landmark per page', sc: '1.3.1', how: 'Renders a real <footer> element.', test: 'Landmark review' },
    { req: 'Version is selectable text', sc: '1.3.1', how: 'Plain text, not an image or pseudo-element, so staff can copy it into a fault report.', test: 'Select and copy' },
    { req: 'Action order matches visual order', sc: '2.4.3', how: 'DOM order is the visual order, so keyboard order is not surprising.', test: 'Keyboard tab' },
    { req: 'Single primary action', sc: '3.2.4', how: 'One primary button identifies the committing action; siblings are secondary.', test: 'Visual review' },
    { req: 'Focus visible', sc: '2.4.7', how: 'SR cyan ring, DDR-006.', test: 'Keyboard tab' },
  ])}`;
}

// ─── Styles: Grids ────────────────────────────────────────────────────────────
/**
 * Synced from Figma "SR Grid & Layout System" (289:301). The breakpoint values
 * are read from the built tokens rather than retyped, so the page cannot drift
 * from --breakpoint-*; columns/gutter/margin come from the Figma table and are
 * mirrored in foundations/grid-and-layout.md.
 */
const GRID_ROWS = [
  { name: 'Mobile',  range: '0 – 767px',      cols: 4,  gutter: '16px', margin: '16px', token: '--breakpoint-mobile-max',  platform: 'MAUI mobile · web mobile' },
  { name: 'Tablet',  range: '768 – 1023px',   cols: 8,  gutter: '24px', margin: '32px', token: '--breakpoint-tablet-min',  platform: 'MAUI tablet · web tablet' },
  { name: 'Desktop', range: '1024 – 1279px',  cols: 12, gutter: '24px', margin: '40px', token: '--breakpoint-desktop-min', platform: 'Blazor web' },
  { name: 'Large',   range: '1280 – 1439px',  cols: 12, gutter: '24px', margin: '64px', token: '--breakpoint-large-min',   platform: 'Blazor web (standard)' },
  { name: 'XLarge',  range: '1440px +',       cols: 12, gutter: '32px', margin: '80px', token: '--breakpoint-xlarge-min',  platform: 'Blazor web (wide)' },
];

const EPR_ROWS = [
  ['Full width (no sidebar)', '1440px', '—', '1440px', '12', '32px', '80px'],
  ['EPR with sidebar', '1440px', '248px', '1192px', '12', '24px', '32px'],
  ['EPR with sidebar', '1280px', '248px', '1032px', '12', '20px', '24px'],
];

const SPACING_ROWS = [
  ['Mobile — gutter & margin', '16px', 'Space/4', 'Spacing/Layout/XS'],
  ['Tablet — gutter', '24px', 'Space/6', 'Spacing/Layout/SM'],
  ['Tablet — margin', '32px', 'Space/8', 'Spacing/Layout/MD'],
  ['Desktop — gutter', '24px', 'Space/6', 'Spacing/Layout/SM'],
  ['Desktop — margin (1024px)', '40px', 'Space/10', '—'],
  ['Desktop — margin (1280px)', '64px', 'Space/16', 'Spacing/Layout/Page'],
  ['Desktop — margin (1440px)', '80px', 'Space/20', '—'],
];

function gridsBody(breakpointValues) {
  const demo = (cols) =>
    `<div class="grid-demo" style="--cols:${cols}">${
      Array.from({ length: cols }, () => '<span></span>').join('')}</div>`;

  const cards = [
    { name: 'Mobile', title: '4-Column Fluid', cols: 4, gutter: '16px', margin: '16px', range: '0 – 767px' },
    { name: 'Tablet', title: '8-Column Fluid', cols: 8, gutter: '24px', margin: '32px', range: '768 – 1023px' },
    { name: 'Desktop', title: '12-Column Fixed', cols: 12, gutter: '24–32px', margin: '40–80px', range: '1024px +' },
  ].map((c) => `
<div class="grid-card">
  ${demo(c.cols)}
  <h3>${c.name}</h3>
  <p class="muted">${c.title}</p>
  <dl class="grid-card__meta">
    <div><dt>Columns</dt><dd>${c.cols}</dd></div>
    <div><dt>Gutter</dt><dd>${c.gutter}</dd></div>
    <div><dt>Margin</dt><dd>${c.margin}</dd></div>
  </dl>
  <p class="grid-card__range">${c.range}</p>
</div>`).join('');

  const bpRows = GRID_ROWS.map((r) => {
    const live = breakpointValues[r.token.replace(/^--/, '')];
    return `<tr><td><strong>${r.name}</strong></td><td>${r.range}</td><td>${r.cols}</td><td>${r.gutter}</td><td>${r.margin}</td><td><code>${r.token}</code>${live ? ` = ${live}` : ''}</td><td>${r.platform}</td></tr>`;
  }).join('');

  const eprRows = EPR_ROWS.map((r) =>
    `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('');

  const spacingRows = SPACING_ROWS.map((r) =>
    `<tr><td>${r[0]}</td><td>${r[1]}</td><td><code>${r[2]}</code></td><td>${r[3] === '—' ? '—' : `<code>${r[3]}</code>`}</td></tr>`).join('');

  return `
<p class="breadcrumbs">Styles</p>
<h1>Grid and layout</h1>
<p class="lede">Column grids, breakpoints, gutter and margin tokens for Blazor web, .NET MAUI
and EPR application layouts.</p>

<h2>Breakpoint system</h2>
<p>Five breakpoints define how layouts adapt. All five exist as tokens — the value shown beside
each token name is read from the built tokens at build time, so this table cannot drift from
what ships.</p>
<div class="table-wrap"><table>
<thead><tr><th>Breakpoint</th><th>Width range</th><th>Columns</th><th>Gutter</th><th>Margin</th><th>Token</th><th>Platform</th></tr></thead>
<tbody>${bpRows}</tbody></table></div>
<p class="muted"><code>--breakpoint-desktop-min</code> also switches the typography scale from the
mobile to the desktop values. Changing it moves both.</p>

<h2>Grid types</h2>
<p>Mobile and tablet grids are fluid — columns scale to fill. Desktop is 12-column with fixed
margins.</p>
<div class="grid-cards">${cards}</div>

<h2>EPR application grid</h2>
<p>When the EPR navigation sidebar is visible the content zone is reduced. <strong>Design against
the content zone, not the full frame width.</strong></p>
<div class="table-wrap"><table>
<thead><tr><th>Context</th><th>Frame</th><th>Sidebar</th><th>Content zone</th><th>Columns</th><th>Gutter</th><th>Margin</th></tr></thead>
<tbody>${eprRows}</tbody></table></div>
<p class="muted">Sidebar is 248px, matching the <code>Navigation</code> component and the Figma
grid frame. The component had shipped at 220px, leaving these content zones 28px out against it;
both were reconciled to 248px together in 2026-08.</p>

<h2>Spacing token reference</h2>
<p>Gutter and margin values map directly to the Space scale in Primitives.</p>
<div class="table-wrap"><table>
<thead><tr><th>Usage</th><th>Value</th><th>Primitive</th><th>Semantic</th></tr></thead>
<tbody>${spacingRows}</tbody></table></div>
<p class="muted">The 40px and 80px desktop margins have no semantic layout token. Use the
primitive until one exists.</p>

<h2>Platform guidance</h2>
<div class="grid-cards grid-cards--two">
  <div class="grid-card">
    <h3>Web — Blazor</h3>
    <p class="muted">Targets Desktop and Tablet. The sidebar reduces content width — design in the content zone.</p>
    <ul>
      <li>Desktop XLarge (1440px) — 12 col, 32px gutter, 80px margin</li>
      <li>Desktop Large (1280px) — 12 col, 24px gutter, 64px margin</li>
      <li>Desktop (1024px) — 12 col, 24px gutter, 40px margin</li>
      <li>Tablet (768px) — 8 col, 24px gutter, 32px margin</li>
    </ul>
  </div>
  <div class="grid-card">
    <h3>.NET MAUI</h3>
    <p class="muted">Mobile only — phone and tablet. MAUI has no desktop target in this system; Blazor web covers Desktop/Large/XLarge. Drive layout switches with breakpoint token values, not hardcoded numbers.</p>
    <ul>
      <li>Phone (&lt; 768px) — 4 col, 16px gutter, 16px margin</li>
      <li>Tablet (768–1023px) — 8 col, 24px gutter, 32px margin</li>
      <li>Use <code>OnIdiom</code> / <code>AdaptiveTrigger</code> with <code>Breakpoint/*</code> tokens</li>
    </ul>
  </div>
</div>`;
}

// ─── Patterns: Patient Banner ─────────────────────────────────────────────────
/**
 * Demo markup mirrors the class contract in
 * packages/web/src/patient-banner/patient-banner.css, which is the same
 * contract @dhcw/sr-react's <PatientBanner> renders. The four previews are the
 * four Figma variants (1711:15585): Fill/Border x Expanded/Collapsed.
 */
const PB_ICON_EDIT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
const PB_ICON_COPY = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
const PB_ICON_UP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m18 15-6-6-6 6"/></svg>';
const PB_ICON_DOWN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

function pbAlerts() {
  return `<div class="sr-patient-banner__alerts">
  <div class="sr-patient-banner__alert sr-patient-banner__alert--reactions">
    <div class="sr-patient-banner__alert-head"><span id="pb-r">Adverse Reactions</span>
      <button type="button" class="sr-patient-banner__alert-edit" aria-label="Edit adverse reactions">${PB_ICON_EDIT}</button></div>
    <ul class="sr-patient-banner__alert-list" aria-labelledby="pb-r">
      <li>Peanut: <span class="sr-patient-banner__alert-value">Anaphylaxis</span></li>
      <li>Benzylpenicilloyl polylysine: <span class="sr-patient-banner__alert-value">Anaphylaxis</span></li>
    </ul>
  </div>
  <div class="sr-patient-banner__alert sr-patient-banner__alert--warnings">
    <div class="sr-patient-banner__alert-head"><span>Warnings</span>
      <button type="button" class="sr-patient-banner__alert-edit" aria-label="Edit warnings">${PB_ICON_EDIT}</button></div>
    <p class="sr-patient-banner__alert-text">3 warnings recorded</p>
  </div>
</div>`;
}

function pbExpanded(type) {
  const mod = type === 'border' ? ' sr-patient-banner--border' : '';
  return `<section class="sr-patient-banner${mod}" aria-label="Patient: JOHN, Elvet George (Mr)">
${pbAlerts()}
  <div class="sr-patient-banner__identity">
    <div class="sr-patient-banner__name-row">
      <h2 class="sr-patient-banner__name">JOHN, Elvet George (Mr)</h2>
      <span class="sr-patient-banner__flag">Deceased</span>
      <button type="button" class="sr-patient-banner__toggle" aria-expanded="true"><span>Hide Details</span>${PB_ICON_UP}</button>
    </div>
    <dl class="sr-patient-banner__details">
      <div class="sr-patient-banner__col">
        <div class="sr-patient-banner__field"><dt>NHS:</dt><dd>000 111 2222<button type="button" class="sr-patient-banner__copy" aria-label="Copy NHS number">${PB_ICON_COPY}</button></dd></div>
        <div class="sr-patient-banner__field"><dt>Address:</dt><dd>Penrhiw, Gwynfe Llangadog, Dyfed, SA19 9PU</dd></div>
        <div class="sr-patient-banner__field"><dt>Postcode:</dt><dd>SA19 9PU</dd></div>
      </div>
      <div class="sr-patient-banner__col">
        <div class="sr-patient-banner__field"><dt>CRN:</dt><dd>M8046459<button type="button" class="sr-patient-banner__copy" aria-label="Copy CRN">${PB_ICON_COPY}</button></dd></div>
        <div class="sr-patient-banner__field"><dt>DOB:</dt><dd>15 Dec 1992 (33y)</dd></div>
        <div class="sr-patient-banner__field sr-patient-banner__field--deceased"><dt>DOD:</dt><dd>23 Jun 2025</dd></div>
        <div class="sr-patient-banner__field"><dt>Sex:</dt><dd>Male</dd></div>
      </div>
    </dl>
  </div>
  <div class="sr-patient-banner__actions">
    <button type="button" class="sr-button sr-button--primary sr-button--small">Change Patient</button>
    <button type="button" class="sr-button sr-button--secondary sr-button--small">Open WCP record</button>
    <button type="button" class="sr-button sr-button--secondary sr-button--small">Print Patient label</button>
  </div>
</section>`;
}

function pbCollapsed(type) {
  const mod = type === 'border' ? ' sr-patient-banner--border' : '';
  return `<section class="sr-patient-banner sr-patient-banner--collapsed${mod}" aria-label="Patient: JOHN, Elvet George (Mr)">
  <div class="sr-patient-banner__summary">
    <span class="sr-patient-banner__pill sr-patient-banner__pill--reactions">2 reactions</span>
    <span class="sr-patient-banner__pill sr-patient-banner__pill--warnings">3 warnings</span>
  </div>
  <div class="sr-patient-banner__identity">
    <div class="sr-patient-banner__name-row"><h2 class="sr-patient-banner__name">JOHN, Elvet George (Mr)</h2></div>
    <dl class="sr-patient-banner__details">
      <div class="sr-patient-banner__field"><dt>NHS:</dt><dd>000 111 2222<button type="button" class="sr-patient-banner__copy" aria-label="Copy NHS number">${PB_ICON_COPY}</button></dd></div>
      <div class="sr-patient-banner__field"><dt>DOB:</dt><dd>15 Dec 1992 (33y)</dd></div>
    </dl>
    <button type="button" class="sr-patient-banner__toggle" aria-expanded="false"><span>Show Details</span>${PB_ICON_DOWN}</button>
  </div>
</section>`;
}

function patientBannerBody() {
  const md = stripLeadingH1(publicise(readFileSync(resolve(ROOT, 'components', 'patient-banner', 'guidelines.md'), 'utf8')));
  const snippets = {
    HTML: '<section class="sr-patient-banner" aria-label="Patient: JOHN, Elvet George (Mr)">\n  <div class="sr-patient-banner__alerts">…</div>\n  <div class="sr-patient-banner__identity">…</div>\n  <div class="sr-patient-banner__actions">…</div>\n</section>\n\n<!-- Border type -->\n<section class="sr-patient-banner sr-patient-banner--border">…</section>\n<!-- Collapsed state -->\n<section class="sr-patient-banner sr-patient-banner--collapsed">…</section>',
    React: '<PatientBanner\n  patient={patient}\n  reactions={reactions}\n  warnings={3}\n  type="fill"          // "fill" | "border"\n  expanded={expanded}  // false renders the collapsed row\n  onToggle={() => setExpanded((v) => !v)}\n  onCopy={(v) => navigator.clipboard?.writeText(v)}\n  actions={<>…</>}\n/>',
    Blazor: '<SrPatientBanner Patient="@patient" Type="Fill" Expanded="@expanded" />',
    MAUI: `<!-- A native composite, not a stock control. Surfaces, rules and status
     colours all come from the token layer. -->
<Border BackgroundColor="{AppThemeBinding Light={StaticResource SrColorSurfaceSectionCards}, Dark={StaticResource SrColorSurfaceSectionCardsDark}}">
    <Grid RowDefinitions="Auto,Auto" RowSpacing="8">

        <!-- Fill type tints the alert cards. For the Border type, drop the
             background and keep the 2px coloured Stroke. -->
        <HorizontalStackLayout Grid.Row="0" Spacing="8">
            <Border Style="{StaticResource CardCritical}">
                <Label Text="Adverse reactions" StyleClass="Caption" />
            </Border>
            <Border Style="{StaticResource CardWarning}">
                <Label Text="3 warnings" StyleClass="Caption" />
            </Border>
        </HorizontalStackLayout>

        <Label Grid.Row="1" Text="JOHN, Elvet George (Mr)" StyleClass="HeadingM" />
    </Grid>
</Border>`,
  };
  return `
<p class="breadcrumbs">Patterns</p>
<h1>Patient Banner</h1>
<p class="lede">The persistent identity strip at the top of every patient-context screen: alerts
first, then who the patient is, then the actions that can be taken on them. Two types, each with an
expanded and a collapsed state.</p>
<h2>Type: Fill</h2>
<p class="muted">The alert cards are tinted. This is the default — the tint carries further in
peripheral vision on a busy screen.</p>
${showcase(pbExpanded('fill'), 'pb-fill', snippets, { bleed: true })}
<div class="showcase showcase--bleed"><div class="showcase__preview">${pbCollapsed('fill')}</div></div>
<h2>Type: Border</h2>
<p class="muted">The alert cards stay white with a coloured rule. Use where the screen is already
colour-heavy, or where the view is likely to be printed.</p>
<div class="showcase showcase--bleed"><div class="showcase__preview">${pbExpanded('border')}</div></div>
<div class="showcase showcase--bleed"><div class="showcase__preview">${pbCollapsed('border')}</div></div>
<p class="muted"><strong>Both types are live.</strong> Neither has been retired, and this page will say
so plainly if one ever is. Pick one per product and stay with it — switching between screens makes
the alert cards look like they mean different things.</p>
<hr>
${renderMarkdown(md)}
${accessibilityTable([
    { req: 'Patient identity always available', sc: '3.2.3', how: 'Name, NHS number and DOB survive collapse; the banner is persistent and cannot be dismissed.', test: 'Collapse and re-read' },
    { req: 'Alerts precede demographics in reading order', sc: '1.3.2', how: 'The alerts block is first in the DOM, so it is reached before the identity block regardless of visual layout.', test: 'Screen reader, tab order' },
    { req: 'Alerts are not live regions', sc: '4.1.3', how: 'Alerts are present on load rather than announced changes; marking them live would interrupt every screen entry.', test: 'Screen reader announce' },
    { req: 'Collapse control names its action', sc: '4.1.2', how: 'A real button with aria-expanded, labelled "Hide Details" / "Show Details" rather than "toggle".', test: 'Screen reader, keyboard' },
    { req: 'Icon-only actions name their subject', sc: '4.1.2', how: 'Collapsed actions read "Print label for JOHN, Elvet George", not "Print".', test: 'Screen reader announce' },
    { req: 'Deceased status not colour alone', sc: '1.4.1', how: 'A Deceased flag beside the name and a date-of-death field, two independent signals.', test: 'Greyscale review' },
    { req: 'Reaction severity not colour alone', sc: '1.4.1', how: 'Severity is stated in the text; the critical colour reinforces but never carries it.', test: 'Greyscale review' },
  ])}`;
}

// ─── page registry (drives both the output files and the search index) ────────
const pages = [];
function addPage({ file, url, title, section, sectionId, activeHref, prefix, body, extraScript = '', bare = false }) {
  pages.push({ file, url, title, section, sectionId, activeHref, prefix, body, extraScript, bare });
}

// ─── Styles: Typography ───────────────────────────────────────────────────────
function typographyBody() {
  const headingSpecimen = `
<div class="sr-type-heading-xl">Heading XL, 36px</div>
<div class="sr-type-heading-l">Heading L, 28px</div>
<div class="sr-type-heading-m">Heading M, 24px</div>
<div class="sr-type-heading-s">Heading S, 20px</div>
<div class="sr-type-heading-xs">Heading XS, 16px</div>`;
  const headingSnippets = {
    HTML: `<h1 class="sr-type-heading-xl">Patient summary</h1>
<h2 class="sr-type-heading-l">Current medication</h2>
<h3 class="sr-type-heading-m">Repeat prescriptions</h3>
<h4 class="sr-type-heading-s">Issued in the last 6 months</h4>
<h5 class="sr-type-heading-xs">Dosage changes</h5>`,
    React: `<Heading size="xl" as="h1">Patient summary</Heading>
<Heading size="l"  as="h2">Current medication</Heading>
<Heading size="m"  as="h3">Repeat prescriptions</Heading>
<Heading size="s"  as="h4">Issued in the last 6 months</Heading>
<Heading size="xs" as="h5">Dosage changes</Heading>`,
    Blazor: `<SrHeading Size="HeadingSize.Xl" Level="1">Patient summary</SrHeading>
<SrHeading Size="HeadingSize.L"  Level="2">Current medication</SrHeading>
<SrHeading Size="HeadingSize.M"  Level="3">Repeat prescriptions</SrHeading>
<SrHeading Size="HeadingSize.S"  Level="4">Issued in the last 6 months</SrHeading>
<SrHeading Size="HeadingSize.Xs" Level="5">Dosage changes</SrHeading>`,
    MAUI: `<!-- The type scale is StyleClass, so a Label carries its role, not its size. -->
<Label StyleClass="HeadingXl" Text="Patient summary" />
<Label StyleClass="HeadingL"  Text="Current medication" />
<Label StyleClass="HeadingM"  Text="Repeat prescriptions" />
<Label StyleClass="HeadingS"  Text="Issued in the last 6 months" />
<Label StyleClass="HeadingXs" Text="Dosage changes" />`,
  };

  const labelSpecimen = `
<div class="sr-type-label" style="margin:0 0 4px">NHS number</div>
<div class="sr-type-body-m" style="margin:0 0 16px">485 777 3456</div>
<div class="sr-type-label" style="margin:0 0 4px">Date of birth</div>
<div class="sr-type-caption" style="margin:0">Use the format 06 Dec 1974</div>`;
  const labelSnippets = {
    HTML: `<label class="sr-type-label" for="nhs-number">NHS number</label>
<span class="sr-type-caption" id="nhs-number-hint">10 digits, spaced in groups of 3, 3 and 4</span>
<input class="sr-input" id="nhs-number" aria-describedby="nhs-number-hint">

<fieldset>
  <legend class="sr-type-heading-s">Contact preferences</legend>
</fieldset>`,
    React: `<Label htmlFor="nhs-number">NHS number</Label>
<Hint id="nhs-number-hint">10 digits, spaced in groups of 3, 3 and 4</Hint>
<Input id="nhs-number" aria-describedby="nhs-number-hint" />

<Fieldset legend="Contact preferences" legendSize="s" />`,
    Blazor: `<SrLabel For="nhs-number">NHS number</SrLabel>
<SrHint Id="nhs-number-hint">10 digits, spaced in groups of 3, 3 and 4</SrHint>
<SrInput Id="nhs-number" DescribedBy="nhs-number-hint" />

<SrFieldset Legend="Contact preferences" LegendSize="HeadingSize.S" />`,
    MAUI: `<Label StyleClass="FieldLabel" Text="NHS number" />
<Label Text="485 777 3456" />
<Label StyleClass="Caption" Text="Use the format 06 Dec 1974" />`,
  };

  const bodySpecimen = `
<div class="sr-type-body-m">Body M, 16px. Use for long-form reading and clinical notes, where the
text is meant to be read in full rather than scanned.</div>
<div class="sr-type-body-s">Body S, 14px. The primary content size in tables and other data-dense
views, and for supporting text and form values.</div>
<div class="sr-type-caption">Caption, 12px. Hints, timestamps and metadata only.</div>`;
  const bodySnippets = {
    HTML: `<p class="sr-type-body-m">Long-form reading and clinical notes.</p>
<p class="sr-type-body-s">Primary content in tables and data-dense views.</p>
<p class="sr-type-caption">Last updated 06 Dec 2024 at 14:22</p>`,
    React: `<Text size="m">Long-form reading and clinical notes.</Text>
<Text size="s">Primary content in tables and data-dense views.</Text>
<Text size="caption">Last updated 06 Dec 2024 at 14:22</Text>`,
    Blazor: `<SrText Size="TextSize.M">Long-form reading and clinical notes.</SrText>
<SrText Size="TextSize.S">Primary content in tables and data-dense views.</SrText>
<SrText Size="TextSize.Caption">Last updated 06 Dec 2024 at 14:22</SrText>`,
    MAUI: `<Label Text="Long-form reading and clinical notes." StyleClass="BodyM" />
<Label Text="Primary content in tables and data-dense views." StyleClass="BodyS" />
<Label Text="Last updated 06 Dec 2024 at 14:22" StyleClass="Caption" />`,
  };

  const overrideSnippets = {
    HTML: `<!-- Correct: a heading that needs to look smaller takes a smaller style,
     and the heading level still reflects the document structure. -->
<h2 class="sr-type-heading-s">Allergies and adverse reactions</h2>

<!-- Wrong: never hardcode type values on a component. -->
<h2 style="font-size: 21px; font-weight: 600">Allergies and adverse reactions</h2>`,
    React: `{/* The heading level and the visual size are separate props. */}
<Heading as="h2" size="s">Allergies and adverse reactions</Heading>`,
    Blazor: `@* The heading level and the visual size are separate parameters. *@
<SrHeading Level="2" Size="HeadingSize.S">Allergies and adverse reactions</SrHeading>`,
    MAUI: `<!-- Correct: a heading that needs to look smaller takes a smaller class. -->
<Label Text="Allergies and adverse reactions" StyleClass="HeadingS" />

<!-- Wrong: never set the type values on the control itself. -->
<Label Text="Allergies and adverse reactions" FontSize="18" FontAttributes="Bold" />`,
  };

  const linkSnippets = {
    HTML: `<p class="sr-type-body-m">
  Review the <a href="/medication">current medication list</a> before prescribing.
</p>

<!-- Opening a new tab must be announced in the link text. -->
<a href="https://www.nhs.uk/" target="_blank" rel="noopener">
  NHS.UK guidance (opens in a new tab)
</a>`,
    React: `<Text size="m">
  Review the <Link href="/medication">current medication list</Link> before prescribing.
</Text>`,
    Blazor: `<SrText Size="TextSize.M">
  Review the <SrLink Href="/medication">current medication list</SrLink> before prescribing.
</SrText>`,
    MAUI: `<!-- MAUI has no link control. A Label with the link colour, an underline and
     a tap gesture is the equivalent. Keep the underline: colour alone is not a
     reliable signal (WCAG 1.4.1). -->
<Label Text="Current medication list" StyleClass="BodyM"
       TextDecorations="Underline"
       TextColor="{AppThemeBinding Light={StaticResource SrColorInteractiveLink}, Dark={StaticResource SrColorInteractiveLinkDark}}">
    <Label.GestureRecognizers>
        <TapGestureRecognizer Command="{Binding OpenMedicationListCommand}" />
    </Label.GestureRecognizers>
</Label>`,
  };

  // Specimens render exactly what the HTML tab prints, so the preview is the
  // snippet rather than an illustration of it.
  const linkSpecimen = `<p class="sr-type-body-m">
  Review the <a href="#">current medication list</a> before prescribing.
</p>
<p class="sr-type-body-m" style="margin-bottom:0">
  <a href="https://www.nhs.uk/" target="_blank" rel="noopener">NHS.UK guidance (opens in a new tab)</a>
</p>`;

  const listSpecimen = `<ul class="sr-type-body-m">
  <li>Aspirin 75mg, once daily</li>
  <li>Atorvastatin 20mg, once daily at night</li>
</ul>
<ol class="sr-type-body-m" style="margin-bottom:0">
  <li>Confirm the patient identity</li>
  <li>Check for recorded allergies</li>
</ol>`;

  const breakSpecimen = `<p class="sr-type-body-m">Patient banner sits above the rule.</p>
<hr>
<p class="sr-type-body-m" style="margin-bottom:0">The record begins below it.</p>`;

  const alignSpecimen = `<table class="sr-table" style="width:100%">
  <thead><tr>
    <th scope="col" class="sr-table__cell">Medication</th>
    <th scope="col" class="sr-table__cell sr-table__cell--numeric">Dose (mg)</th>
  </tr></thead>
  <tbody>
    <tr><td class="sr-table__cell">Atorvastatin</td><td class="sr-table__cell sr-table__cell--numeric">20</td></tr>
    <tr><td class="sr-table__cell">Aspirin</td><td class="sr-table__cell sr-table__cell--numeric">75</td></tr>
    <tr><td class="sr-table__cell">Levothyroxine</td><td class="sr-table__cell sr-table__cell--numeric">125</td></tr>
  </tbody>
</table>`;

  const listSnippets = {
    HTML: `<ul class="sr-type-body-m">
  <li>Aspirin 75mg, once daily</li>
  <li>Atorvastatin 20mg, once daily at night</li>
</ul>

<ol class="sr-type-body-m">
  <li>Confirm the patient identity</li>
  <li>Check for recorded allergies</li>
</ol>`,
    React: `<List size="m" items={medications} />
<List as="ol" size="m" items={steps} />`,
    Blazor: `<SrList Size="TextSize.M" Items="@medications" />
<SrList Ordered Size="TextSize.M" Items="@steps" />`,
    MAUI: `<!-- A list is layout in MAUI, not a text style. Bind the collection and let
     the item template carry the body class. -->
<VerticalStackLayout Spacing="8" BindableLayout.ItemsSource="{Binding Medications}">
    <BindableLayout.ItemTemplate>
        <DataTemplate>
            <Grid ColumnDefinitions="Auto,*" ColumnSpacing="8">
                <Label Grid.Column="0" Text="&#8226;" StyleClass="BodyM" />
                <Label Grid.Column="1" Text="{Binding .}" StyleClass="BodyM" />
            </Grid>
        </DataTemplate>
    </BindableLayout.ItemTemplate>
</VerticalStackLayout>`,
  };

  return `
<p class="breadcrumbs">Styles</p>
<h1>Typography</h1>
<p class="lede">Our fonts and typographic styles, and how to apply them.</p>

<h2>Font</h2>

<h3>Roboto</h3>
<p>Roboto is the primary typeface across every Single Record product. It is an open-source
typeface, freely available from Google Fonts, and it is supported on web, Blazor, React and
.NET MAUI. Using one typeface everywhere keeps clinical and administrative screens consistent
for staff who move between products during a shift.</p>
<p>Roboto is set at four weights: Regular 400 for body text, Medium 500 for labels and smaller
headings, Bold 700 for headings, and Light 300 where a large heading needs to feel less dense.</p>

<h3>Fallback font</h3>
<p>Default to Arial when Roboto is not available. Arial is present on every managed NHS Wales
device, has closely matching metrics, and so avoids a visible layout shift while Roboto loads.
Set the stack once, at the root, and let every component inherit it.</p>
${codePanel('type-font', {
    HTML: `:root {\n  font-family: Roboto, Arial, sans-serif;\n}`,
    React: `// Set once in the app shell, not per component.\n<div style={{ fontFamily: 'Roboto, Arial, sans-serif' }}>{children}</div>`,
    Blazor: `/* wwwroot/css/app.css */\n:root {\n  font-family: Roboto, Arial, sans-serif;\n}`,
    MAUI: `<!-- Resources/Styles/Styles.xaml -->\n<Setter Property="FontFamily" Value="Roboto" />\n<!-- Arial is the platform fallback when Roboto is unavailable. -->`,
  })}

<h2>Headings</h2>
<p>Use heading tags such as <code>&lt;h1&gt;</code> and <code>&lt;h2&gt;</code> to mark up the
headings on a page, then apply a heading class such as <code>sr-type-heading-l</code> to style
them. Applying headings consistently gives every screen a clear content structure that both
sighted users and screen reader users can navigate.</p>
<p>Use one <code>&lt;h1&gt;</code> per page and do not skip levels to reach a size you like.
The heading level describes the structure of the page; the class controls how it looks. When a
heading needs to be visually smaller, change the class, not the level.</p>
${showcase(headingSpecimen, 'type-headings', headingSnippets)}

<h3>Headings on record and dashboard screens</h3>
<p>Single Record screens are denser than a public-facing service, so the top of the scale is
used sparingly. Heading XL is reserved for the page title. Within a patient record, Heading M
and Heading S carry most of the section structure, which keeps a long record scannable without
the headings crowding out the content.</p>

<h2>Labels and legends as headings</h2>
<p>On a form where a single question fills the page, the label or legend is the page heading.
Wrap it in the heading tag and apply the heading class to the label or legend itself, so the
question is announced once rather than twice.</p>
<p>On the multi-question forms that are more common in Single Record, keep labels as labels.
Use <code>sr-type-label</code> at 14px Medium, which pairs with the 14px data values used
across tables and record views.</p>
${showcase(labelSpecimen, 'type-labels', labelSnippets)}

<h2>Paragraphs</h2>
<p>Body text has two sizes and the choice between them is about content type, not about fitting
more on screen.</p>
<ul>
  <li><strong>Body M, 16px</strong> for long-form reading: clinical notes, guidance, letters and
  anything the user reads start to finish.</li>
  <li><strong>Body S, 14px</strong> for data-dense content: table cells, record fields, supporting
  text and form values.</li>
  <li><strong>Caption, 12px</strong> for hints, timestamps and metadata. Never use Caption for
  primary content.</li>
</ul>
<p>Body S at 14px is a deliberate divergence from the 16px default that public-facing NHS and
GOV.UK guidance uses. Single Record is a clinical, table-heavy system where a clinician needs to
compare many values at once, and 14px keeps a usable number of rows in view. This still meets
WCAG 2.2 AA: there is no minimum font size criterion, and resize to 200%, reflow and contrast
are all met at this size.</p>
${showcase(bodySpecimen, 'type-body', bodySnippets)}

<h2>Font size and weight overrides</h2>
<p>There are no override utilities in this system, and that is deliberate. If a size or weight
you need is not in the scale, that is a decision about the scale, not something to patch in a
single component.</p>
<p>Two rules cover almost every case:</p>
<ul>
  <li>Pick the style by role: heading, body, label or caption. Do not pick it by the size you
  want the text to be.</li>
  <li>Never set <code>font-size</code>, <code>font-weight</code> or <code>line-height</code>
  directly on a component. Change the class instead.</li>
</ul>
<p>If you find yourself needing a value the scale does not have, request the change so it can be
assessed once and applied everywhere.</p>
${codePanel('type-overrides', overrideSnippets)}

<h2>Links</h2>
<p>Links are underlined and use the link colour token, which meets AA contrast against every
surface in the system. Keep the underline. In a dense clinical interface, colour alone is not a
reliable signal, and removing the underline fails WCAG 1.4.1.</p>
<p>Write link text that makes sense on its own, because screen reader users often navigate by
pulling up a list of links. Use "current medication list" rather than "click here". Where a link
opens in a new tab, say so in the link text.</p>
${showcase(linkSpecimen, 'type-links', linkSnippets)}

<h2>Lists</h2>
<p>Lists inherit the body styles, so pick the body size that matches the surrounding content and
apply it to the list. Use an unordered list where the order does not matter, such as a list of
current medications, and an ordered list for steps that must happen in sequence.</p>
<p>Keep list items short. If an item runs past two lines, it is usually a paragraph or a
sub-heading with content under it, not a list item.</p>
${showcase(listSpecimen, 'type-lists', listSnippets)}

<h2>Section break</h2>
<p>Use a horizontal rule to separate distinct groups of content, for example between a patient
banner and the record beneath it. The rule uses the default border token so it stays quiet
against the page.</p>
<p>Use section breaks sparingly. In a record view, whitespace and headings usually do the job
better, and too many rules make a screen look busier than it is.</p>
${showcase(breakSpecimen, 'type-section-break', {
    HTML: `<hr>\n\n<!-- Where the break is structural but should not be seen,\n     use spacing instead of a visible rule. -->\n<div style="margin-block: var(--space-6)"></div>`,
    React: `<Divider />\n<Divider visible={false} />`,
    Blazor: `<SrDivider />\n<SrDivider Visible="false" />`,
    MAUI: `<!-- The same Divider class every separator in the system uses. -->
<BoxView StyleClass="Divider" />

<!-- Structural break that should not be seen: use spacing, not an
     invisible rule. -->
<ContentView HeightRequest="24" />`,
  })}

<h2>Text alignment</h2>
<p>Align text left. Left-aligned text gives every line the same starting point, which is what
makes a column of text or a table of values quick to scan, and it is easier to read for users
with dyslexia. Do not justify text: justification creates uneven word spacing and rivers of
white space that make reading harder.</p>
<p>The one exception is numeric table columns, where right-aligning the values lets users
compare magnitudes down the column. Right-align the column heading to match the values beneath
it. Never centre body text or table content.</p>
${showcase(alignSpecimen, 'type-alignment', {
    HTML: `<!-- Text columns: left aligned, which is the default. -->\n<td class="sr-table__cell">Atorvastatin 20mg</td>\n\n<!-- Numeric columns: right aligned, heading matches the values. -->\n<th scope="col" class="sr-table__cell--numeric">Dose (mg)</th>\n<td class="sr-table__cell sr-table__cell--numeric">20</td>`,
    React: `<Table.Column field="medication" />\n<Table.Column field="dose" align="right" />`,
    Blazor: `<SrTableColumn Field="medication" />\n<SrTableColumn Field="dose" Align="Align.Right" />`,
    MAUI: `<!-- Text columns are left aligned, which is the default. -->
<Label Text="Atorvastatin 20mg" StyleClass="BodyS" />

<!-- Numeric columns are right aligned, and the heading matches the values. -->
<Label Text="Dose (mg)" StyleClass="FieldLabel" HorizontalTextAlignment="End" />
<Label Text="20" StyleClass="BodyS" HorizontalTextAlignment="End" />`,
  })}

<hr>
<h2>The type scale</h2>
<p>Every style below is rendered live from the built tokens, so what you see is what ships.</p>
<div class="table-wrap"><table>
<thead><tr><th>Class</th><th>Desktop</th><th>Mobile</th><th>Weight</th><th>Use when</th></tr></thead>
<tbody>
<tr><td><code>sr-type-heading-xl</code></td><td>36/44</td><td>28/36</td><td>Bold</td><td>Page title, one per page</td></tr>
<tr><td><code>sr-type-heading-l</code></td><td>28/36</td><td>24/32</td><td>Bold</td><td>Major section</td></tr>
<tr><td><code>sr-type-heading-m</code></td><td>24/32</td><td>20/28</td><td>Bold</td><td>Sub-section</td></tr>
<tr><td><code>sr-type-heading-s</code></td><td>20/28</td><td>18/24</td><td>Bold</td><td>Card or group heading</td></tr>
<tr><td><code>sr-type-heading-xs</code></td><td>16/24</td><td>16/24</td><td>Medium</td><td>Smallest heading</td></tr>
<tr><td><code>sr-type-body-m</code></td><td>16/24</td><td>16/24</td><td>Regular</td><td>Long-form reading, clinical notes</td></tr>
<tr><td><code>sr-type-body-s</code></td><td>14/20</td><td>14/20</td><td>Regular</td><td>Primary content in tables and data-dense views</td></tr>
<tr><td><code>sr-type-label</code></td><td>14/20</td><td>14/20</td><td>Medium</td><td>Form labels, column headers</td></tr>
<tr><td><code>sr-type-caption</code></td><td>12/16</td><td>12/16</td><td>Regular</td><td>Hints, timestamps, metadata</td></tr>
</tbody></table></div>
<div>${typeSamples}</div>

${accessibilityTable([
    { req: 'Text resizes to 200% without loss of content', sc: '1.4.4', how: 'All sizes are set in relative units, so the whole scale grows with the browser text size.', test: 'Browser zoom to 200%' },
    { req: 'Content reflows to a single column', sc: '1.4.10', how: 'Line lengths are capped and layouts reflow at 320px with no horizontal scrolling.', test: 'Resize to 320px' },
    { req: 'Body text meets contrast', sc: '1.4.3', how: 'Text colours are checked against every surface token they can sit on before release.', test: 'Automated contrast' },
    { req: 'Headings describe the structure', sc: '1.3.1 / 2.4.6', how: 'Heading level follows the document outline; the class only controls the visual size.', test: 'Heading map, screen reader' },
    { req: 'Links identifiable without colour', sc: '1.4.1', how: 'Links keep their underline in body content rather than relying on colour alone.', test: 'Greyscale review' },
    { req: 'Text spacing can be overridden', sc: '1.4.12', how: 'Line heights sit on the 4px grid and are set in relative units, so user stylesheets apply cleanly.', test: 'Text spacing bookmarklet' },
  ])}`;
}

// ─── Styles: Colour ───────────────────────────────────────────────────────────
/** WCAG relative luminance and contrast, computed at build time so every ratio
 *  shown on the page is derived from the token that ships, not typed by hand. */
function luminance(hex) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}
const hexOf = (name) => flat[name] || null;

function ramp(family) {
  const steps = Object.entries(flat)
    .filter(([k, v]) => new RegExp(`^color-${family}-(\\d+|default)$`).test(k) && /^#/.test(v))
    .sort((a, b) => (Number(b[0].split('-').pop()) || 0) - (Number(a[0].split('-').pop()) || 0));
  return `<div class="ramp">${steps.map(([k, v]) => {
    const step = k.split('-').pop();
    const onWhite = contrast(v, '#ffffff');
    return `<figure class="ramp__step">
      <div class="ramp__chip" style="background: var(--${k}, ${v}); color: ${onWhite >= 4.5 ? '#fff' : '#212b32'}">${step}</div>
      <figcaption><code>--${k}</code><span class="hex">${v}</span></figcaption>
    </figure>`;
  }).join('')}</div>`;
}

function semanticTable(prefix, rows) {
  const body = rows.map(([token, use]) => {
    const v = hexOf(token);
    return `<tr>
      <td><span class="dot" style="background: var(--${token}, ${v})"></span><code>--${token}</code></td>
      <td><span class="hex">${v || 'n/a'}</span></td>
      <td>${use}</td>
    </tr>`;
  }).join('');
  return `<div class="table-wrap"><table><thead><tr><th>Token</th><th>Value</th><th>Use for</th></tr></thead><tbody>${body}</tbody></table></div>`;
}

function colourBody() {
  const statusRows = [
    ['sr-color-status-critical', 'sr-color-status-critical-surface', 'Critical'],
    ['sr-color-status-success', 'sr-color-status-success-surface', 'Success'],
    ['sr-color-status-warning', 'sr-color-status-warning-surface', 'Warning'],
    ['sr-color-status-info', 'sr-color-status-info-surface', 'Information'],
  ].map(([fg, bg, label]) => {
    const f = hexOf(fg), b = hexOf(bg);
    const onWhite = contrast(f, '#ffffff').toFixed(2);
    const onSurface = contrast(f, b).toFixed(2);
    return `<tr>
      <td><strong>${label}</strong></td>
      <td><span class="dot" style="background:${f}"></span><code>--${fg}</code></td>
      <td>${onWhite}:1</td>
      <td><span class="dot" style="background:${b}"></span><code>--${bg}</code></td>
      <td>${onSurface}:1</td>
    </tr>`;
  }).join('');

  const focusHex = hexOf('sr-color-border-focus');
  const focusOnPrimary = contrast(focusHex, hexOf('sr-color-interactive-primary')).toFixed(2);
  const focusOnBg = contrast(focusHex, hexOf('sr-color-surface-background')).toFixed(2);

  return `
<p class="breadcrumbs">Styles</p>
<h1>Colour</h1>
<p class="lede">How we use colour so it carries meaning consistently, meets accessibility, and works
in light and dark across every Single Record product.</p>

<h2>How colour is organised</h2>
<p>Colour is held in three tiers, and which tier you are allowed to touch depends on what you are
doing.</p>
<ul>
  <li><strong>Primitives</strong> are the raw palette, for example <code>--color-blue-800</code>.
  They carry no meaning. Never reference a primitive from a component.</li>
  <li><strong>Semantic tokens</strong> carry the meaning, for example
  <code>--sr-color-interactive-primary</code>. This is the tier you build with.</li>
  <li><strong>Component tokens</strong> exist only where one part of a component needs a value that
  cannot be expressed semantically.</li>
</ul>
<p>Picking by role rather than by hue is what makes dark mode and future palette changes possible.
A component that asks for "the primary interactive colour" keeps working when that colour changes.
A component that asks for "Blue 800" does not.</p>
${codePanel('colour-usage', {
    HTML: `/* Correct: ask for the role. */\n.sr-panel {\n  background: var(--sr-color-surface-section-cards);\n  border: 1px solid var(--sr-color-border-default);\n  color: var(--sr-color-text-primary);\n}\n\n/* Wrong: a primitive, and a raw hex. */\n.sr-panel {\n  background: var(--color-blue-50);\n  border: 1px solid #d8dde0;\n}`,
    React: `<Panel\n  surface="section-cards"\n  border="default"\n/>\n\n// Token values are never passed as props; the component\n// resolves them from the semantic layer.`,
    Blazor: `<SrPanel Surface="Surface.SectionCards" Border="Border.Default" />\n\n@* app.css consumes the published token stylesheet: *@\n@* @import "@dhcw/sr-tokens/build/css/tokens.css"; *@`,
    MAUI: `<!-- Native MAUI XAML. The same semantic names, as XAML resources -->\n<!-- from Tokens.xaml. Never a literal colour, and never a primitive. -->\n<Setter Property="BackgroundColor" Value="{StaticResource SrColorSurfaceSectionCards}" />\n<Setter Property="Stroke" Value="{StaticResource SrColorBorderDefault}" />\n<Setter Property="TextColor" Value="{StaticResource SrColorTextPrimary}" />`,
  })}

<h2>Semantic tokens</h2>
<p>These are the tokens to build with. Every value below is read from the published token artifact,
so this table cannot drift from what ships.</p>

<h3>Interactive</h3>
${semanticTable('interactive', [
    ['sr-color-interactive-primary', 'Primary actions and the main brand fill'],
    ['sr-color-interactive-primary-hover', 'Hover step for the primary fill'],
    ['sr-color-interactive-secondary', 'Secondary emphasis and dark chrome such as the masthead'],
    ['sr-color-interactive-link', 'Text links in body content'],
    ['sr-color-interactive-destructive', 'Irreversible actions, paired with a confirmation step'],
    ['sr-color-interactive-disabled', 'Disabled control fills'],
  ])}

<h3>Surface</h3>
${semanticTable('surface', [
    ['sr-color-surface-background', 'The page itself'],
    ['sr-color-surface-section-cards', 'Large panels and page sections'],
    ['sr-color-surface-small-cards', 'Cards, menus and popovers'],
    ['sr-color-surface-accent', 'Selected rows and highlighted regions'],
    ['sr-color-surface-subtle', 'Hover surfaces and quiet fills'],
  ])}

<h3>Text</h3>
${semanticTable('text', [
    ['sr-color-text-primary', 'Body copy, headings and data values'],
    ['sr-color-text-secondary', 'Supporting text, hints and metadata'],
    ['sr-color-text-inverse', 'Text on a saturated or dark fill'],
    ['sr-color-text-disabled', 'Text in a disabled control'],
  ])}

<h3>Border</h3>
${semanticTable('border', [
    ['sr-color-border-subtle', 'Row dividers and quiet separators'],
    ['sr-color-border-default', 'Standard component and panel borders'],
    ['sr-color-border-strong', 'Emphasis borders and table header rules'],
    ['sr-color-border-focus', 'The focus ring, in both light and dark mode'],
    ['sr-color-border-disabled', 'Borders on disabled controls'],
  ])}

<h2>Contrast</h2>
<p>Body text and essential UI must meet WCAG 2.2 AA: 4.5:1 for text, and 3:1 for large text, icons
and borders. We target AAA where the pairing allows it. Validate a token against the surface it will
actually sit on, not against white by default.</p>
<div class="table-wrap"><table>
<thead><tr><th>Role</th><th>Foreground</th><th>On white</th><th>Paired surface</th><th>On that surface</th></tr></thead>
<tbody>${statusRows}</tbody>
</table></div>
<p class="muted">Ratios are computed at build time from the published token values.</p>

<h3>Accents are not text colours</h3>
<p>The brand accent <code>--sr-color-brand-accent</code> is an accent only. It does not carry white
text at body size, so never use it to fill a button or any surface that needs white text on it. Use
<code>--sr-color-interactive-primary</code> for that.</p>

<h2>Never colour alone</h2>
<p>Colour is never the only signal. This is a hard requirement, not a preference: it is WCAG 1.4.1,
and in a clinical context a status that only reads as "red" is a patient-safety problem.</p>
<ul>
  <li>Pair a status colour with text, and usually an icon as well.</li>
  <li>A selected table row carries a non-colour signal too, such as a selection control or a left
  accent border.</li>
  <li>Form validation states pair the colour with an error message tied to the field.</li>
  <li>Review screens in greyscale. If you cannot tell the states apart, it fails.</li>
</ul>

<h2>Focus</h2>
<p>The focus ring is <code>--sr-color-border-focus</code> at ${focusHex}, and it is the same colour
in light and dark mode so that focus behaves predictably wherever a control appears. It scores
${focusOnBg}:1 against the page background and ${focusOnPrimary}:1 against the primary fill, so it
stays visible on both.</p>
<p>There is no separate focus primitive. An earlier yellow focus colour was replaced by this one and
has been removed from the palette, so if you find a yellow focus ring anywhere it is stale code.</p>
${codePanel('colour-focus', {
    HTML: `.sr-button:focus-visible {\n  outline: 3px solid var(--sr-color-border-focus);\n  outline-offset: 2px;\n}`,
    React: `// Focus styling comes from the component stylesheet.\n// Do not re-implement it per component.`,
    Blazor: `/* Provided by the shared component stylesheet. */\n.sr-button:focus-visible {\n  outline: 3px solid var(--sr-color-border-focus);\n  outline-offset: 2px;\n}`,
    MAUI: `<!-- Native MAUI XAML: focus is a visual state, not a CSS pseudo-class, -->\n<!-- but it reads the same focus token. -->\n<VisualState x:Name="Focused">\n  <VisualState.Setters>\n    <Setter Property="Stroke" Value="{StaticResource SrColorBorderFocus}" />\n    <Setter Property="StrokeThickness" Value="3" />\n  </VisualState.Setters>\n</VisualState>`,
  })}

<h2>Dark mode</h2>
<p>Dark mode is a second set of values behind the same semantic names. A component written against
semantic tokens needs no dark-mode code of its own. Because the names do not change, the rule stays
the same: never reach past the semantic layer to a primitive, or the component will not follow the
theme.</p>
<div class="callout"><p>The dark theme is built and published, but the theme switch on this site is
turned off while the colour work is being finalised.</p></div>

<hr>
<h2>The palette</h2>
<p>The raw primitives, rendered live from the published tokens. Reference these from semantic tokens
only, never from a component. The number on each swatch is its step.</p>

<h3>Blue, NHS Wales blue and the primary brand</h3>
${ramp('blue')}
<h3>Cyan, DHCW blue, used for the accent and the focus ring</h3>
${ramp('cyan')}
<h3>Navy</h3>
<p>Navy is deliberately a short ramp. It is a narrow utility family used for dark surfaces, disabled
borders and disabled text, and steps are added only when a semantic token needs one.</p>
${ramp('navy')}
<h3>Grey, the neutral UI ramp</h3>
${ramp('grey')}
<h3>Red, critical and destructive</h3>
${ramp('red')}
<h3>Green, success</h3>
${ramp('green')}
<h3>Yellow, warning</h3>
${ramp('yellow')}
<h3>Info blue</h3>
${ramp('info-blue')}

${accessibilityTable([
    { req: 'Text meets contrast against its surface', sc: '1.4.3', how: 'Every text and surface pairing is checked before a token ships; the ratios are published on this page.', test: 'Automated contrast' },
    { req: 'Non-text UI meets contrast', sc: '1.4.11', how: 'Borders, icons and control boundaries are checked at 3:1 against adjacent colours.', test: 'Automated contrast' },
    { req: 'Colour is not the only signal', sc: '1.4.1', how: 'Status colours pair with text and an icon; selected rows carry a non-colour indicator.', test: 'Greyscale review' },
    { req: 'Focus is visible on every surface', sc: '2.4.7 / 1.4.11', how: 'One focus colour in both modes, checked against page, card and saturated fills.', test: 'Keyboard tab, contrast check' },
    { req: 'Meaning survives a theme change', sc: '1.4.1', how: 'Light and dark are two value sets behind one set of semantic names, so meaning is carried by the name.', test: 'Theme switch review' },
    { req: 'Users can override colours', sc: '1.4.12 / 1.4.8', how: 'Colours are CSS custom properties, so forced-colours and user stylesheets apply cleanly.', test: 'Forced colours mode' },
  ])}`;
}

// ─── Component: Button (playground: variant, size and framework) ──────────────
function buttonBody() {
  const variants = [
    { id: 'primary', label: 'Primary', cls: 'sr-button--primary' },
    { id: 'secondary', label: 'Secondary', cls: 'sr-button--secondary' },
    { id: 'ghost', label: 'Ghost', cls: 'sr-button--ghost' },
    { id: 'destructive', label: 'Destructive', cls: 'sr-button--destructive' },
  ];
  const sizes = [
    { id: 'small', label: 'Small', cls: 'sr-button--small' },
    { id: 'default', label: 'Default', cls: 'sr-button--default' },
    { id: 'large', label: 'Large', cls: 'sr-button--large' },
  ];
  return `
<p class="breadcrumbs">Components</p>
<h1>Buttons</h1>
<p class="lede">Buttons let users take an action, such as submitting a form or confirming a
patient. Pick the variant, size and framework; the preview and the code update together.</p>

<section class="showcase">
  <div class="showcase__toolbar">
    <div class="switch" role="group" aria-label="Variant">
      ${variants.map((v, idx) => `<button class="switch__btn${idx === 0 ? ' is-active' : ''}" type="button" data-variant="${v.id}" data-cls="${v.cls}">${v.label}</button>`).join('')}
    </div>
    <div class="switch" role="group" aria-label="Size">
      ${sizes.map((s) => `<button class="switch__btn${s.id === 'default' ? ' is-active' : ''}" type="button" data-size="${s.id}" data-cls="${s.cls}">${s.label}</button>`).join('')}
    </div>
  </div>
  <div class="showcase__preview" style="text-align:center">
    <button id="preview-btn" class="sr-button sr-button--primary sr-button--default">Confirm patient</button>
  </div>
  <div id="btn-fw"></div>
</section>

<h2>When to use</h2>
<ul>
  <li>One <strong>Primary</strong> action per view, such as submit or confirm.</li>
  <li><strong>Secondary</strong> for supporting actions alongside the primary one.</li>
  <li><strong>Ghost</strong> for low-emphasis actions such as cancel or back.</li>
  <li><strong>Destructive</strong> for permanent deletion. Always pair it with a confirmation dialog.</li>
</ul>

<h2>Placement</h2>
<p>Forms and page-level sections align their actions left, with the primary action first and the
cancel action as a text link after it. Modals and dialogs group their actions at the bottom
right, with the primary action last and cancel as an equal-weight button to its left.</p>

<p>For general button guidance such as grouping and ordering, follow
<a href="https://design-system.service.gov.uk/components/button/" target="_blank" rel="noopener">GDS</a> and
<a href="https://service-manual.nhs.uk/design-system/components/buttons" target="_blank" rel="noopener">NHS England</a>.</p>

${accessibilityTable([
    { req: 'Every button has a visible, descriptive label', sc: '2.4.6 / 4.1.2', how: 'Labels name the action and its subject, for example "Confirm patient" rather than "OK".', test: 'Manual review, screen reader' },
    { req: 'Focus is clearly visible', sc: '2.4.7', how: 'A focus ring sits outside the element, paired with a 2px border so it reads on every surface.', test: 'Keyboard tab, contrast check' },
    { req: 'Target size adequate', sc: '2.5.8', how: 'Default height is 40px; Small stays at or above 24×24px with spacing. Touch controls use 44px.', test: 'Measure, touch device' },
    { req: 'Not colour alone', sc: '1.4.1', how: 'Destructive pairs red with an explicit label and a confirmation step.', test: 'Greyscale review' },
    { req: 'Contrast', sc: '1.4.3', how: 'White on the primary interactive colour is 7.1:1, which passes AAA. Validated per variant.', test: 'Automated contrast' },
  ])}`;
}

// The Button page builds its snippet in the browser from the variant/size
// switches, so it never passes through codePanel() and the check above cannot
// see it. Assert the shape it generates here instead — this is the only
// snippet on the site that is assembled client-side.
checkReactSnippet('btn (generated in BUTTON_SCRIPT)', '<Button type="primary" size="small">Confirm patient</Button>');
// Assert the generated MAUI XAML too: the switcher builds it in the browser, so
// it never reaches codePanel()'s check. Every keyed style it can emit is listed.
checkMauiSnippet('btn (generated in BUTTON_SCRIPT)',
  '<Button Style="{StaticResource ButtonSecondary}" /><Button Style="{StaticResource ButtonGhost}" />'
  + '<Button Style="{StaticResource ButtonDestructive}" />');

const BUTTON_SCRIPT = `<script>
(function(){
  var preview=document.getElementById('preview-btn');
  if(!preview) return;
  var container=document.getElementById('btn-fw');
  var state={variant:'primary',variantCls:'sr-button--primary',size:'default',sizeCls:'sr-button--default'};
  function snippets(){
    var v=state.variant, size=state.size;
    var cls='sr-button sr-button--'+v+(state.sizeCls?' '+state.sizeCls:'');
    var T=v.charAt(0).toUpperCase()+v.slice(1);
    var S=size!=='default'?size.charAt(0).toUpperCase()+size.slice(1):'';
    return {
      HTML:'<button class="'+cls+'">Confirm patient</button>',
      React:'<Button type="'+v+'"'+(size!=='default'?' size="'+size+'"':'')+'>Confirm patient</Button>',
      Blazor:'<SrButton Type="ButtonType.'+T+'"'+(S?' Size="ButtonSize.'+S+'"':'')+'>Confirm patient</SrButton>',
      MAUI:(function(){
        var style={primary:'',secondary:'ButtonSecondary',ghost:'ButtonGhost',destructive:'ButtonDestructive'}[v];
        var note=v==='primary'
          ? '<!-- Primary is the implicit Button style: no Style attribute needed. -->'
          : (v==='destructive'
             ? '<!-- Destructive is permanent deletion, and always behind a confirmation. -->'
             : '<!-- Intent is a keyed style; size comes from the type scale and padding. -->');
        return note+'\\n<Button Text="Confirm patient"'+(style?' Style="{StaticResource '+style+'}"':'')+' />';
      })()
    };
  }
  var FW=['HTML','React','Blazor','MAUI'];
  function renderFw(){
    var snips=snippets();
    window.__snips=window.__snips||{}; window.__snips['btn']=snips;
    var activeTab=container.querySelector('.codepanel__tab.is-active');
    var fw=(activeTab&&activeTab.dataset.fw)||'HTML';
    container.innerHTML='<div class="codepanel" data-panel="btn"><div class="codepanel__bar">'+
      '<div class="codepanel__tabs" role="tablist" aria-label="Framework">'+
      FW.map(function(f){return '<button class="codepanel__tab'+(f===fw?' is-active':'')+'" type="button" role="tab" aria-selected="'+(f===fw)+'" data-fw="'+f+'" data-target="btn">'+f+'</button>';}).join('')+
      '</div><button class="codepanel__copy" type="button" data-copy="btn">Copy code</button></div>'+
      '<pre><code id="btn-code"></code></pre></div>';
    document.getElementById('btn-code').textContent=snips[fw];
    if(window.__wireCode) window.__wireCode(container);
  }
  function apply(){ preview.className='sr-button '+state.variantCls+(state.sizeCls?' '+state.sizeCls:''); renderFw(); }
  document.querySelectorAll('[data-variant]').forEach(function(b){b.addEventListener('click',function(){
    b.parentNode.querySelectorAll('.switch__btn').forEach(function(x){x.classList.remove('is-active');});
    b.classList.add('is-active'); state.variant=b.dataset.variant; state.variantCls=b.dataset.cls; apply();});});
  document.querySelectorAll('[data-size]').forEach(function(b){b.addEventListener('click',function(){
    b.parentNode.querySelectorAll('.switch__btn').forEach(function(x){x.classList.remove('is-active');});
    b.classList.add('is-active'); state.size=b.dataset.size; state.sizeCls=b.dataset.cls; apply();});});
  apply();
})();
</script>`;

// ─── Component: Table ─────────────────────────────────────────────────────────
function tableBody() {
  const tableMd = stripLeadingH1(publicise(readFileSync(resolve(ROOT, 'components', 'table', 'guidelines.md'), 'utf8')));
  const demo = `
<div class="sr-table-wrap">
  <table class="sr-table">
    <thead class="sr-table__head"><tr>
      <th scope="col">No.</th><th scope="col">Patient</th><th scope="col">NHS number</th><th scope="col">DoB</th><th scope="col">Status</th>
    </tr></thead>
    <tbody>
      <tr class="sr-table__row"><td class="sr-table__cell">1</td><td class="sr-table__cell">JONES, Alis</td><td class="sr-table__cell">123 456 7890</td><td class="sr-table__cell">06 Dec 1974</td><td class="sr-table__cell">Confirmed</td></tr>
      <tr class="sr-table__row sr-table__row--selected"><td class="sr-table__cell">2</td><td class="sr-table__cell">OWEN, Rhys</td><td class="sr-table__cell">234 567 8901</td><td class="sr-table__cell">14 Mar 1988</td><td class="sr-table__cell">In review</td></tr>
      <tr class="sr-table__row"><td class="sr-table__cell">3</td><td class="sr-table__cell">PATEL, Nia</td><td class="sr-table__cell">345 678 9012</td><td class="sr-table__cell">02 Jul 1991</td><td class="sr-table__cell">Draft</td></tr>
    </tbody>
  </table>
</div>`;
  const snippets = {
    HTML: '<div class="sr-table-wrap">\n  <table class="sr-table">\n    <thead class="sr-table__head">…</thead>\n    <tbody>\n      <tr class="sr-table__row sr-table__row--selected">…</tr>\n    </tbody>\n  </table>\n</div>',
    React: '<Table\n  columns={columns}\n  rows={rows}\n  selectable\n  selectedIds={selectedIds}\n  onSelectionChange={setSelectedIds}\n/>',
    Blazor: '<SrTable Items="@patients" SelectedId="@activePatientId" />',
    MAUI: `<!-- CollectionView, not a table control. The header is a Grid above it using
     the same column definitions, so the columns line up. -->
<Grid RowDefinitions="Auto,*">

    <Grid Grid.Row="0" ColumnDefinitions="2*,*,*" Padding="12,8"
          BackgroundColor="{AppThemeBinding Light={StaticResource SrColorSurfaceSubtle}, Dark={StaticResource SrColorSurfaceSubtleDark}}">
        <Label Grid.Column="0" Text="Patient" StyleClass="FieldLabel" />
        <Label Grid.Column="1" Text="NHS number" StyleClass="FieldLabel" />
        <Label Grid.Column="2" Text="Dose (mg)" StyleClass="FieldLabel"
               HorizontalTextAlignment="End" />
    </Grid>

    <CollectionView Grid.Row="1" ItemsSource="{Binding Patients}"
                    SelectionMode="Single" SelectedItem="{Binding ActivePatient}">
        <CollectionView.ItemTemplate>
            <DataTemplate>
                <Grid ColumnDefinitions="2*,*,*" Padding="12,8">
                    <Label Grid.Column="0" Text="{Binding Name}" StyleClass="BodyS" />
                    <Label Grid.Column="1" Text="{Binding NhsNumber}" StyleClass="BodyS" />
                    <Label Grid.Column="2" Text="{Binding Dose}" StyleClass="BodyS"
                           HorizontalTextAlignment="End" />
                </Grid>
            </DataTemplate>
        </CollectionView.ItemTemplate>
    </CollectionView>
</Grid>`,
  };
  return `
<p class="breadcrumbs">Components</p>
<h1>Tables</h1>
<p class="lede">Tabular clinical and administrative data. A tinted header row, a subtle divider
between rows, and no rule under the header — the tint is what separates it.</p>
${showcase(demo, 'table', snippets)}
<p class="muted">Row 2 shows the selected state; hover any row to see the hover surface. Dates use
the <code>d Mmm yyyy</code> format, and the header uses the <code>No.</code> abbreviation exception.</p>
<hr>
${renderMarkdown(tableMd)}
${accessibilityTable([
    { req: 'Semantic table structure', sc: '1.3.1', how: 'Real table, thead and th elements with a scope; a row-header layout adds a row-scoped header cell.', test: 'Markup review, screen reader' },
    { req: 'Icon-only row actions are named', sc: '4.1.2', how: 'Each action names the action and its subject, for example "Edit Jones, Alis". Icons are hidden from assistive technology.', test: 'Screen reader announce' },
    { req: 'Selected row not colour alone', sc: '1.4.1', how: 'Selected rows carry a non-colour signal such as a selection control or a left accent.', test: 'Greyscale review' },
    { req: 'Target size for dense actions', sc: '2.5.8', how: '32×32px is a documented dense-desktop exception, promoted to full size on touch and mobile.', test: 'Measure, touch device' },
    { req: 'Focus visible', sc: '2.4.7', how: 'A focus ring sits outside the action buttons so it is never clipped by the row.', test: 'Keyboard tab' },
  ])}`;
}

// ─── Components: Breadcrumbs and Toggle switch ───────────────────────────────
// The published icon, not a hand-drawn chevron — same source as the React
// component's <Icon name="nav/chevron-left">.
const BC_CHEVRON = iconMarkup('nav/chevron-left');

function breadcrumbsBody() {
  const md = stripLeadingH1(publicise(readFileSync(resolve(ROOT, 'components', 'breadcrumbs', 'guidelines.md'), 'utf8')));
  const trail = [
    { label: 'Home', href: '#' },
    { label: 'Patient search', href: '#' },
    { label: 'JOHN, Elvet George', href: '#' },
    { label: 'Case note volume 3' },
  ];
  const multilevel = `<nav aria-label="Breadcrumb">
  <ol class="sr-breadcrumbs">
${trail.map((c, i) => (i === trail.length - 1
    ? `    <li class="sr-breadcrumbs__item"><span class="sr-breadcrumbs__current" aria-current="page">${c.label}</span></li>`
    : `    <li class="sr-breadcrumbs__item"><a class="sr-breadcrumbs__link" href="${c.href}">${c.label}</a><span class="sr-breadcrumbs__separator" aria-hidden="true">/</span></li>`)).join('\n')}
  </ol>
</nav>`;
  const back = `<nav aria-label="Breadcrumb">
  <ol class="sr-breadcrumbs sr-breadcrumbs--back">
    <li class="sr-breadcrumbs__item">
      <span class="sr-icon sr-icon--sm sr-breadcrumbs__back-icon">${BC_CHEVRON}</span>
      <a class="sr-breadcrumbs__link" href="#">Back to JOHN, Elvet George</a>
    </li>
  </ol>
</nav>`;
  const multiSnippets = {
    HTML: '<nav aria-label="Breadcrumb">\n  <ol class="sr-breadcrumbs">\n    <li class="sr-breadcrumbs__item">\n      <a class="sr-breadcrumbs__link" href="/">Home</a>\n      <span class="sr-breadcrumbs__separator" aria-hidden="true">/</span>\n    </li>\n    …\n    <li class="sr-breadcrumbs__item">\n      <span class="sr-breadcrumbs__current" aria-current="page">Case note volume 3</span>\n    </li>\n  </ol>\n</nav>',
    React: '<Breadcrumbs\n  items={[\n    { label: "Home", href: "/" },\n    { label: "Patient search", href: "/search" },\n    { label: "JOHN, Elvet George", href: "/patients/1" },\n    { label: "Case note volume 3" },\n  ]}\n/>',
    Blazor: '<SrBreadcrumbs Items="@trail" />',
    MAUI: `<!-- FlexLayout so a long trail wraps rather than truncating. -->
<FlexLayout Wrap="Wrap" AlignItems="Center">
    <Label Text="Home" StyleClass="Caption" TextDecorations="Underline" TextColor="{AppThemeBinding Light={StaticResource SrColorInteractiveLink}, Dark={StaticResource SrColorInteractiveLinkDark}}" />
    <Label Text="/" StyleClass="Caption" Margin="8,0" />
    <Label Text="Case notes" StyleClass="Caption" TextDecorations="Underline" TextColor="{AppThemeBinding Light={StaticResource SrColorInteractiveLink}, Dark={StaticResource SrColorInteractiveLinkDark}}" />
    <Label Text="/" StyleClass="Caption" Margin="8,0" />

    <!-- The current page is not a link, and names itself for screen readers. -->
    <Label Text="Case note volume 3" StyleClass="Caption"
           TextColor="{AppThemeBinding Light={StaticResource SrColorTextPrimary}, Dark={StaticResource SrColorTextPrimaryDark}}"
           SemanticProperties.Description="Case note volume 3, current page" />
</FlexLayout>`,
  };
  const backSnippets = {
    HTML: '<nav aria-label="Breadcrumb">\n  <ol class="sr-breadcrumbs sr-breadcrumbs--back">\n    <li class="sr-breadcrumbs__item">\n      <span class="sr-breadcrumbs__back-icon">…</span>\n      <a class="sr-breadcrumbs__link" href="/patients/1">Back to JOHN, Elvet George</a>\n    </li>\n  </ol>\n</nav>',
    React: '<Breadcrumbs type="back" items={trail} />\n\n// Same items array as the multilevel type — the component takes\n// the item before the current page and names it.',
    Blazor: '<SrBreadcrumbs Items="@trail" Type="Back" />',
    MAUI: `<!-- The Back type is one destination, not a trail. 44px minimum target. -->
<HorizontalStackLayout Spacing="8" MinimumHeightRequest="44">
    <Path Data="{StaticResource SrIconNavBack}"
          Aspect="Uniform" HeightRequest="16" WidthRequest="16" VerticalOptions="Center"
          StrokeThickness="2" StrokeLineCap="Round" StrokeLineJoin="Round"
          Stroke="{AppThemeBinding Light={StaticResource SrColorInteractiveLink}, Dark={StaticResource SrColorInteractiveLinkDark}}" />
    <Label Text="Back to case notes" StyleClass="FieldLabel" VerticalOptions="Center"
           TextDecorations="Underline" TextColor="{AppThemeBinding Light={StaticResource SrColorInteractiveLink}, Dark={StaticResource SrColorInteractiveLinkDark}}" />
    <HorizontalStackLayout.GestureRecognizers>
        <TapGestureRecognizer Command="{Binding BackCommand}" />
    </HorizontalStackLayout.GestureRecognizers>
</HorizontalStackLayout>`,
  };
  return `
<p class="breadcrumbs">Components</p>
<h1>Breadcrumbs</h1>
<p class="lede">Where the current screen sits in the product's hierarchy, and the way back up it.
Two types from one set of items — the full trail, or a single step back.</p>

<h2>Type: Multilevel</h2>
<p class="muted">The full trail, separated by <code>/</code>. The current page is the last item and
is never a link. Four levels is the practical maximum.</p>
${showcase(multilevel, 'breadcrumbs', multiSnippets)}

<h2>Type: Back</h2>
<p class="muted">One chevron-left link to the level immediately above. For narrow screens and deep
hierarchies, where the full trail would wrap onto a second line. It names its destination rather
than saying "Back", because the component does not control browser history and cannot promise
where "back" goes.</p>
${showcase(back, 'breadcrumbs-back', backSnippets)}
<hr>
${renderMarkdown(md)}
${accessibilityTable([
    { req: 'Trail is a navigation landmark', sc: '1.3.1', how: 'A nav element labelled "Breadcrumb" wrapping an ordered list, so position and order are both conveyed.', test: 'Landmark review, screen reader' },
    { req: 'Current page is identified', sc: '4.1.2', how: 'The last item carries aria-current="page" and is plain text, not a link to the page already open.', test: 'Screen reader announce' },
    { req: 'Separators are not announced', sc: '1.3.1', how: 'The "/" and the back chevron are aria-hidden — visual punctuation only.', test: 'Screen reader read-through' },
    { req: 'Link purpose is clear from the text', sc: '2.4.4', how: 'Each crumb uses its destination’s own page heading; the back link names the destination rather than saying "Back".', test: 'Links-list review' },
    { req: 'Focus visible', sc: '2.4.7', how: 'SR cyan ring on every link, DDR-006.', test: 'Keyboard tab' },
  ])}`;
}

function togglesBody() {
  const md = stripLeadingH1(publicise(readFileSync(resolve(ROOT, 'components', 'toggles', 'guidelines.md'), 'utf8')));
  const sw = (label, on, disabled) =>
    `<button type="button" role="switch" aria-checked="${on}" class="sr-switch"${disabled ? ' disabled' : ''}>
  <span class="sr-switch__track"><span class="sr-switch__thumb"></span></span>
  <span class="sr-switch__label">${label}</span>
</button>`;
  const demo = `<div style="display:flex;flex-direction:column;gap:16px;align-items:flex-start">
${sw('Show archived requests', true, false)}
${sw('Include discharged patients', false, false)}
</div>`;
  const states = `<div style="display:flex;flex-direction:column;gap:16px;align-items:flex-start">
${sw('On', true, false)}
${sw('Off', false, false)}
${sw('On, unavailable', true, true)}
${sw('Off, unavailable', false, true)}
</div>`;
  const snippets = {
    HTML: '<button type="button" role="switch" aria-checked="true" class="sr-switch">\n  <span class="sr-switch__track"><span class="sr-switch__thumb"></span></span>\n  <span class="sr-switch__label">Show archived requests</span>\n</button>',
    React: '<Switch\n  label="Show archived requests"\n  checked={showArchived}\n  onChange={setShowArchived}\n/>',
    Blazor: '<SrSwitch Label="Show archived requests" @bind-Checked="showArchived" />',
    MAUI: '<!-- The thumb position carries the state as well as the colour, so it\n     survives greyscale and low-vision viewing. -->\n<HorizontalStackLayout Spacing="8">\n  <Switch IsToggled="{Binding ShowArchived}" />\n  <Label Text="Show archived requests" VerticalOptions="Center" />\n</HorizontalStackLayout>',
  };
  // Type: Segmented control (Figma 2752:40 segment block, 2770:55996 two-option
  // example). Grouped with the switch because the Figma "Toggles" page
  // (1414:16858) groups them: both change state immediately, and the choice
  // between them is the first decision a designer makes.
  const seg = (options, selectedIdx, disabled) =>
    `<div class="sr-segmented" role="group" aria-label="Search mode">
${options.map((o, i) => `  <button type="button" class="sr-segmented__option" aria-pressed="${i === selectedIdx}"${disabled ? ' disabled' : ''}>${o}</button>`).join('\n')}
</div>`;
  const segDemo = seg(['Quick search', 'Advanced'], 0, false);
  const segStates = `<div style="display:flex;flex-direction:column;gap:16px;align-items:flex-start">
${seg(['Quick search', 'Advanced'], 0, false)}
${seg(['All', 'Sent', 'Received'], 1, false)}
${seg(['Quick search', 'Advanced'], 0, true)}
</div>`;
  const segSnippets = {
    HTML: '<div class="sr-segmented" role="group" aria-label="Search mode">\n  <button type="button" class="sr-segmented__option" aria-pressed="true">Quick search</button>\n  <button type="button" class="sr-segmented__option" aria-pressed="false">Advanced</button>\n</div>',
    React: '<SegmentedControl\n  ariaLabel="Search mode"\n  options={["Quick search", "Advanced"]}\n  value={mode}\n  onChange={setMode}\n/>',
    Blazor: '<SrSegmentedControl Options="@modes" @bind-Value="mode" />',
    MAUI: `<!-- No stock segmented control. Two buttons in a bordered row: the selected
     one takes the accent surface, and both hold a 44px target. -->
<Border Padding="2" StrokeThickness="1" Stroke="{AppThemeBinding Light={StaticResource SrColorBorderDefault}, Dark={StaticResource SrColorBorderDefaultDark}}">
    <Grid ColumnDefinitions="*,*" ColumnSpacing="2">
        <Button Grid.Column="0" Text="Quick search" MinimumHeightRequest="44"
                BackgroundColor="{AppThemeBinding Light={StaticResource SrColorSurfaceAccent}, Dark={StaticResource SrColorSurfaceAccentDark}}"
                TextColor="{AppThemeBinding Light={StaticResource SrColorTextPrimary}, Dark={StaticResource SrColorTextPrimaryDark}}"
                SemanticProperties.Description="Quick search, selected" />
        <Button Grid.Column="1" Text="Advanced" Style="{StaticResource ButtonGhost}"
                MinimumHeightRequest="44" />
    </Grid>
</Border>`,
  };
  return `
<p class="breadcrumbs">Components</p>
<h1>Toggles</h1>
<p class="lede">Two controls, one decision between them. A <strong>switch</strong> answers "is this
on?"; a <strong>segmented control</strong> answers "which of these?". Both take effect immediately,
so neither belongs in a form with a Save button.</p>

<h2>Type: Switch</h2>
<p class="muted">One setting, on or off. The off state has no label of its own — if you need to name
it, you need the segmented control below.</p>
${showcase(demo, 'switch', snippets)}
<p class="muted">The thumb's position, not only the track colour, carries the state — so it survives
greyscale and low-vision viewing.</p>
<p class="muted"><strong>States.</strong> Default, and disabled in both positions. A disabled switch
still announces whether it is on: "off and unavailable" is different information from "off".</p>
<div class="showcase"><div class="showcase__preview">${states}</div></div>

<h2>Type: Segmented control</h2>
<p class="muted">Two to four mutually exclusive views of the same screen, all labelled and all
visible at once. Exactly one is selected at all times — there is no empty state.</p>
${showcase(segDemo, 'segmented', segSnippets)}
<p class="muted"><strong>States.</strong> Two options, three options, and the disabled control.
Disabled-and-selected is a muted outline rather than a faded blue fill, because a greyed blue still
reads as "on and available".</p>
<div class="showcase"><div class="showcase__preview">${segStates}</div></div>
<hr>
${renderMarkdown(md)}
${accessibilityTable([
    { req: 'Role and state are exposed', sc: '4.1.2', how: 'Switch is a real button with role="switch" and aria-checked; each segment is a button with aria-pressed inside a role="group". Both update in place so a change is re-announced.', test: 'Screen reader announce, toggle' },
    { req: 'Exactly one segment is selected', sc: '4.1.2', how: 'The segmented control has no empty state; one option always carries aria-pressed="true", so the group never announces as "none selected".', test: 'Screen reader, cycle options' },
    { req: 'Accessible name', sc: '2.4.6', how: 'The visible label names the setting; where no label is shown, aria-label is required.', test: 'Screen reader announce' },
    { req: 'Operable from the keyboard', sc: '2.1.1', how: 'Tab to reach, Space or Enter to toggle — the native button behaviour, not re-implemented.', test: 'Keyboard only' },
    { req: 'State not signalled by colour alone', sc: '1.4.1', how: 'Thumb position differs between on and off, and the label states what "on" means.', test: 'Greyscale review' },
    { req: 'Target size', sc: '2.5.8', how: 'The 24px track is below the touch minimum on its own; touch layouts give the label-and-track control a 44px row.', test: 'Measure, touch device' },
    { req: 'Focus visible', sc: '2.4.7', how: 'SR cyan ring around the track and around each segment, outside them so it is not clipped. DDR-006.', test: 'Keyboard tab' },
  ])}`;
}

// ─── Components: Input ────────────────────────────────────────────────────────
/**
 * Input. One anatomy — label, hint, field, error — across six types, driven by
 * a switcher rather than a page of near-identical static examples, matching the
 * Buttons page. That is the convention for any component whose variants
 * multiply: type x state x options is 60+ permutations, and printing them all
 * documents nothing.
 *
 * The preview renders the same markup Input.jsx produces, so what a reader
 * copies is what the component emits. States are real: focus is browser focus,
 * disabled is the native attribute, invalid is aria-invalid.
 */
const INPUT_TYPES = [
  { id: 'text',     label: 'Text',       field: 'Full name',        ph: 'Enter value',        hint: 'As it appears on the referral letter', err: 'Enter a full name',        html: 'text' },
  { id: 'password', label: 'Password',   field: 'Password',         ph: '',                   hint: 'Must be 8 or more characters',         err: 'Enter 8 or more characters', html: 'password' },
  { id: 'phone',    label: 'Phone',      field: 'Phone number',     ph: 'e.g. 07700 900000',  hint: 'Include the area code',                err: 'Enter a valid phone number', html: 'tel' },
  { id: 'calendar', label: 'Date',       field: 'Date of birth',    ph: 'Add date',           hint: 'For example, 06 Dec 1974',             err: 'Enter a valid date',       html: 'text' },
  { id: 'time',     label: 'Time',       field: 'Appointment time', ph: 'Add time',           hint: 'Clinic hours are 08:00 to 18:00',      err: 'Enter a valid time',       html: 'text' },
  { id: 'textarea', label: 'Multi-line', field: 'Notes',            ph: 'Enter value',        hint: 'Keep this brief',                      err: 'Enter some detail',        html: 'text' },
];

// Icons come from the generated set, never hand-drawn inline (CLAUDE.md).
const INPUT_ICONS = {
  eye: iconMarkup('action/eye'),
  calendar: iconMarkup('schedule/appointment'),
};

// The switcher builds its React snippet in the browser, so it never passes
// through codePanel()'s prop check. Assert the shape here instead — same guard
// the Buttons page uses.
checkMauiSnippet('input (generated in INPUT_SCRIPT)',
  '<Label StyleClass="FieldLabel" /><Label StyleClass="Caption" /><Label StyleClass="Error" />'
  + '<Border Style="{StaticResource FieldBox}" /><Border Style="{StaticResource FieldBoxError}" />');
checkReactSnippet('input (generated in INPUT_SCRIPT)',
  '<Input type="password" label="Password" hint="Must be 8 or more characters" required disabled hideLabel placeholder="Enter value" error="Enter a valid value" />');

function inputBody() {
  const md = stripLeadingH1(publicise(readFileSync(resolve(ROOT, 'components', 'input', 'guidelines.md'), 'utf8')));
  const states = [
    { id: 'default',  label: 'Default' },
    { id: 'error',    label: 'Error' },
    { id: 'disabled', label: 'Disabled' },
  ];
  return `
<p class="breadcrumbs">Components</p>
<h1>Input</h1>
<p class="lede">A field for typing a single value. Pick the type, the state and the options;
the preview and the code update together.</p>

<section class="showcase">
  <div class="showcase__toolbar">
    <div class="switch" role="group" aria-label="Type">
      ${INPUT_TYPES.map((t, i) => `<button class="switch__btn${i === 0 ? ' is-active' : ''}" type="button" data-itype="${t.id}">${t.label}</button>`).join('')}
    </div>
    <div class="switch" role="group" aria-label="State">
      ${states.map((s, i) => `<button class="switch__btn${i === 0 ? ' is-active' : ''}" type="button" data-istate="${s.id}">${s.label}</button>`).join('')}
    </div>
    <div class="switch switch--toggles" role="group" aria-label="Options">
      <button class="switch__btn" type="button" aria-pressed="false" data-iopt="hint">Hint</button>
      <button class="switch__btn" type="button" aria-pressed="false" data-iopt="required">Required</button>
      <button class="switch__btn" type="button" aria-pressed="false" data-iopt="hideLabel">Hidden label</button>
    </div>
  </div>
  <div class="showcase__preview">
    <div id="input-preview" style="max-width:320px;margin:0 auto"></div>
  </div>
  <div id="inp-fw"></div>
</section>
<p class="muted">Tab into the field to see the focus state: it is the browser's own focus, not a
class, so it behaves the same in your application as it does here.</p>

<hr>
${renderMarkdown(md)}
${accessibilityTable([
    { req: 'Label is programmatically associated', sc: '1.3.1, 4.1.2', how: 'A real label element bound to the control, present even when visually hidden. A placeholder never stands in for it.', test: 'Screen reader announce' },
    { req: 'Hint and error are announced with the field', sc: '1.3.1', how: 'Both are referenced from the control, so they are read as part of it rather than as loose text nearby.', test: 'Screen reader announce' },
    { req: 'Invalid state is exposed programmatically', sc: '3.3.1, 4.1.2', how: 'The field is marked invalid and the message names what to do, so the error reaches someone who cannot see the red border.', test: 'Screen reader, greyscale review' },
    { req: 'Required state is conveyed in more than a symbol', sc: '3.3.2', how: 'The asterisk is decorative; the field also announces that it is required.', test: 'Screen reader announce' },
    { req: 'Disabled fields leave the tab order', sc: '2.1.1', how: 'The native disabled attribute, so the field is skipped and omitted from submission rather than only greyed.', test: 'Keyboard tab, submit' },
    { req: 'Password reveal names its action', sc: '4.1.2', how: 'The control is labelled "Show password" or "Hide password", not by its icon.', test: 'Screen reader announce' },
    { req: 'Focus is visible and does not move the layout', sc: '2.4.7, 1.4.11', how: 'An inset focus ring on the field border, drawn inside the existing box so nothing shifts.', test: 'Keyboard tab' },
    { req: 'Text resizes to 200%', sc: '1.4.4', how: 'The field sizes from its content and has no fixed height, so it grows with the text.', test: 'Browser zoom to 200%' },
  ])}`;
}

const INPUT_SCRIPT = `<script>
(function(){
  var host=document.getElementById('input-preview');
  if(!host) return;
  var container=document.getElementById('inp-fw');
  var TYPES=${jsonForScript(INPUT_TYPES)};
  var ICONS=${jsonForScript(INPUT_ICONS)};
  var state={type:'text',state:'default',hint:false,required:false,hideLabel:false};

  function cfg(){ for(var i=0;i<TYPES.length;i++){ if(TYPES[i].id===state.type) return TYPES[i]; } return TYPES[0]; }

  function markup(){
    var c=cfg(), id='demo-'+c.id;
    var err=state.state==='error', dis=state.state==='disabled';
    var isArea=c.id==='textarea', isPw=c.id==='password';
    var cls='sr-input'+(err?' sr-input--error':'')+(dis?' sr-input--disabled':'');
    var describedBy=[]; if(state.hint) describedBy.push(id+'-hint'); if(err) describedBy.push(id+'-error');
    var db=describedBy.length?' aria-describedby="'+describedBy.join(' ')+'"':'';
    var val=isPw?'••••••••':'';
    var ctrl=isArea
      ? '<textarea id="'+id+'" class="sr-input__control" placeholder="'+c.ph+'"'+(dis?' disabled':'')+(err?' aria-invalid="true"':'')+db+' rows="3"></textarea>'
      : '<input id="'+id+'" type="'+(isPw?'password':c.html)+'" class="sr-input__control"'+(val?' value="'+val+'"':'')+' placeholder="'+c.ph+'"'+(dis?' disabled':'')+(err?' aria-invalid="true"':'')+db+'>';
    var trailing='';
    if(isPw) trailing='<button type="button" class="sr-input__toggle" aria-label="Show password"'+(dis?' disabled':'')+'><span class="sr-icon sr-icon--sm sr-icon--inherit">'+ICONS.eye+'</span></button>';
    else if(c.id==='calendar') trailing='<span class="sr-input__icon">'+ICONS.calendar+'</span>';
    else if(c.id==='time') trailing='<span class="sr-input__trailing"><button type="button" class="link-action"'+(dis?' disabled':'')+'>Set now</button></span>';
    return '<div class="'+cls+'">'
      +'<label class="sr-input__label'+(state.hideLabel?' sr-visually-hidden':'')+'" for="'+id+'">'+c.field
        +(state.required?'<span class="sr-input__required" aria-hidden="true">*</span><span class="sr-visually-hidden"> required</span>':'')+'</label>'
      +(state.hint?'<span class="sr-input__hint" id="'+id+'-hint">'+c.hint+'</span>':'')
      +'<div class="sr-input__field'+(isArea?' sr-input__field--textarea':'')+'">'+ctrl+trailing+'</div>'
      +(err?'<span class="sr-input__error" id="'+id+'-error">'+c.err+'</span>':'')
      +'</div>';
  }

  function attr(n,v){ return v?' '+n+'="'+v+'"':''; }
  function snippets(){
    var c=cfg(), err=state.state==='error', dis=state.state==='disabled';
    var reactType=c.id==='text'?'':' type="'+c.id+'"';
    var react='<Input'+reactType+' label="'+c.field+'"'
      +(c.ph?' placeholder="'+c.ph+'"':'')
      +(state.hint?' hint="'+c.hint+'"':'')
      +(state.required?' required':'')
      +(state.hideLabel?' hideLabel':'')
      +(err?' error="'+c.err+'"':'')
      +(dis?' disabled':'')+' />';
    var T=c.id.charAt(0).toUpperCase()+c.id.slice(1);
    var blazor='<SrInput Type="InputType.'+T+'" Label="'+c.field+'"'
      +(c.ph?' Placeholder="'+c.ph+'"':'')
      +(state.hint?' Hint="'+c.hint+'"':'')
      +(state.required?' Required="true"':'')
      +(state.hideLabel?' HideLabel="true"':'')
      +(err?' Error="'+c.err+'"':'')
      +(dis?' Disabled="true"':'')+' @bind-Value="value" />';
    // Hand-shaped rather than a dump of the live preview markup: the real thing
    // inlines a full SVG for the password and date icons, which buries the six
    // lines a reader actually needs under forty lines of path data.
    var id=c.id, isArea=c.id==='textarea', isPw=c.id==='password';
    var db=[]; if(state.hint) db.push(id+'-hint'); if(err) db.push(id+'-error');
    var h=[];
    h.push('<div class="sr-input'+(err?' sr-input--error':'')+(dis?' sr-input--disabled':'')+'">');
    h.push('  <label class="sr-input__label'+(state.hideLabel?' sr-visually-hidden':'')+'" for="'+id+'">'+c.field
      +(state.required?'<span class="sr-input__required" aria-hidden="true">*</span><span class="sr-visually-hidden"> required</span>':'')+'</label>');
    if(state.hint) h.push('  <span class="sr-input__hint" id="'+id+'-hint">'+c.hint+'</span>');
    h.push('  <div class="sr-input__field'+(isArea?' sr-input__field--textarea':'')+'">');
    var a=(c.ph?' placeholder="'+c.ph+'"':'')+(dis?' disabled':'')+(err?' aria-invalid="true"':'')
      +(db.length?' aria-describedby="'+db.join(' ')+'"':'');
    h.push(isArea
      ? '    <textarea id="'+id+'" class="sr-input__control"'+a+'></textarea>'
      : '    <input id="'+id+'" type="'+(isPw?'password':c.html)+'" class="sr-input__control"'+a+'>');
    if(isPw) h.push('    <button type="button" class="sr-input__toggle" aria-label="Show password">…</button>');
    else if(c.id==='calendar') h.push('    <span class="sr-input__icon">…</span>');
    else if(c.id==='time') h.push('    <span class="sr-input__trailing"><button type="button">Set now</button></span>');
    h.push('  </div>');
    if(err) h.push('  <span class="sr-input__error" id="'+id+'-error">'+c.err+'</span>');
    h.push('</div>');
    return {
      HTML: h.join('\\n'),
      React: react,
      Blazor: blazor,
      MAUI:(function(){
        var box=err?'FieldBoxError':'FieldBox';
        var L=[];
        L.push('<!-- A field is a composition: label, optional hint, the bordered box,');
        L.push('     and an error message. Styles.xaml ships the pieces. -->');
        L.push('<VerticalStackLayout Spacing="4">');
        L.push('  <Label StyleClass="FieldLabel" Text="'+c.field+(state.required?' *':'')+'" />');
        if(state.hint) L.push('  <Label StyleClass="Caption" Text="'+c.hint+'" />');
        L.push('  <Border Style="{StaticResource '+box+'}">');
        L.push(isArea
          ? '    <Editor Placeholder="'+c.ph+'"'+(dis?' IsEnabled="False"':'')+' />'
          : '    <Entry Placeholder="'+c.ph+'"'+(isPw?' IsPassword="True"':'')+(dis?' IsEnabled="False"':'')+' />');
        L.push('  </Border>');
        if(err) L.push('  <Label StyleClass="Error" Text="'+c.err+'" />');
        L.push('</VerticalStackLayout>');
        return L.join('\\n');
      })()
    };
  }

  var FW=['HTML','React','Blazor','MAUI'];
  function renderFw(){
    var snips=snippets();
    window.__snips=window.__snips||{}; window.__snips['inp']=snips;
    var activeTab=container.querySelector('.codepanel__tab.is-active');
    var fw=(activeTab&&activeTab.dataset.fw)||'HTML';
    container.innerHTML='<div class="codepanel" data-panel="inp"><div class="codepanel__bar">'+
      '<div class="codepanel__tabs" role="tablist" aria-label="Framework">'+
      FW.map(function(f){return '<button class="codepanel__tab'+(f===fw?' is-active':'')+'" type="button" role="tab" aria-selected="'+(f===fw)+'" data-fw="'+f+'" data-target="inp">'+f+'</button>';}).join('')+
      '</div><button class="codepanel__copy" type="button" data-copy="inp">Copy code</button></div>'+
      '<pre><code id="inp-code"></code></pre></div>';
    document.getElementById('inp-code').textContent=snips[fw];
    if(window.__wireCode) window.__wireCode(container);
  }
  function apply(){ host.innerHTML=markup(); renderFw(); }

  document.querySelectorAll('[data-itype]').forEach(function(b){b.addEventListener('click',function(){
    b.parentNode.querySelectorAll('.switch__btn').forEach(function(x){x.classList.remove('is-active');});
    b.classList.add('is-active'); state.type=b.dataset.itype; apply();});});
  document.querySelectorAll('[data-istate]').forEach(function(b){b.addEventListener('click',function(){
    b.parentNode.querySelectorAll('.switch__btn').forEach(function(x){x.classList.remove('is-active');});
    b.classList.add('is-active'); state.state=b.dataset.istate; apply();});});
  document.querySelectorAll('[data-iopt]').forEach(function(b){b.addEventListener('click',function(){
    var k=b.dataset.iopt; state[k]=!state[k]; b.setAttribute('aria-pressed',String(state[k])); apply();});});
  apply();
})();
</script>`;

// ─── Components: Navigation ──────────────────────────────────────────────────
/**
 * Sidebar navigation (Figma 1307:16983). The component is `height: 100vh` and
 * `position: sticky` by design — Figma draws it full-frame in every variant.
 * Neither survives a documentation page, so each preview is wrapped in
 * `.nav-frame`, which lets the nav take its height from its own menu. That
 * override is the only thing the site does to this component, and the page
 * says so in a callout.
 */
function navigationBody() {
  const md = stripLeadingH1(publicise(readFileSync(resolve(ROOT, 'components', 'navigation', 'guidelines.md'), 'utf8')));
  const SECTIONS_NAV = [
    { label: 'Home', items: [{ icon: 'nav/dashboard', label: 'Dashboard', current: true }] },
    { label: 'Patients', items: [
      { icon: 'nav/search', label: 'Patient Search' },
      { icon: 'nav/sort', label: 'Referrals', badge: '20', children: true },
      { icon: 'schedule/appointment', label: 'Appointments', badge: '20', children: true },
      { icon: 'schedule/waiting-list', label: 'Watchlists' },
    ] },
    { label: 'Clinical', items: [
      { icon: 'people/specialist', label: 'Specialists' },
      { icon: 'clinical/lab-result', label: 'Tests' },
    ] },
    { label: 'Nursing', items: [
      { icon: 'people/patient', label: 'Adults' },
      { icon: 'people/contact', label: 'Paediatrics' },
    ] },
  ];
  const FOOTER_NAV = [
    { icon: 'nav/settings', label: 'Settings' },
    { icon: 'clinical/discharge', label: 'Log Out' },
  ];
  const navItem = (it) => `<button type="button" class="sr-nav__item" aria-label="${it.label}"${
    it.current ? ' aria-current="page"' : ''}${it.children ? ' aria-expanded="false"' : ''}>
  <span class="sr-nav__item-main">
    <span class="sr-nav__item-icon">${iconMarkup(it.icon)}</span>
    <span class="sr-nav__item-label">${it.label}</span>
    ${it.badge ? `<span class="sr-nav__item-badge">${it.badge}</span>` : ''}
  </span>
  ${it.children ? `<span class="sr-nav__item-chevron">${iconMarkup('nav/chevron-down')}</span>` : ''}
</button>`;
  const nav = (mod) => `<nav class="sr-nav${mod}" aria-label="Primary">
  <div class="sr-nav__header">
    <span class="sr-nav__logo"><img src="${logoFullSrc}" alt="DHCW Single Record" height="40"></span>
    <button type="button" class="sr-nav__collapse" aria-label="Collapse navigation">
      <span class="sr-nav__item-icon">${iconMarkup('nav/chevron-left')}</span>
    </button>
  </div>
  <div class="sr-nav__body">
${SECTIONS_NAV.map((s) => `    <div class="sr-nav__section">
      <span class="sr-nav__section-label">${s.label}</span>
      <div class="sr-nav__list">${s.items.map(navItem).join('')}</div>
    </div>`).join('\n')}
  </div>
  <div class="sr-nav__footer">${FOOTER_NAV.map(navItem).join('')}</div>
</nav>`;
  const frame = (mod) => `<div class="nav-frame">${nav(mod)}</div>`;
  const snippets = {
    HTML: '<nav class="sr-nav" aria-label="Primary">\n  <div class="sr-nav__header">…</div>\n  <div class="sr-nav__body">\n    <div class="sr-nav__section">\n      <span class="sr-nav__section-label">Patients</span>\n      <div class="sr-nav__list">\n        <button class="sr-nav__item" aria-label="Patient Search">…</button>\n      </div>\n    </div>\n  </div>\n  <div class="sr-nav__footer">…</div>\n</nav>\n\n<!-- Collapsed states -->\n<nav class="sr-nav sr-nav--rail">…</nav>       <!-- 108px, labels kept -->\n<nav class="sr-nav sr-nav--collapsed">…</nav>  <!-- 48px, icon only -->',
    React: '<Navigation\n  type="sectioned"          // "sectioned" | "linear"\n  collapsed={navState}      // false (220px) | "rail" (108px) | "icon" (48px)\n  sections={sections}\n  footerItems={footerItems}\n  current="Dashboard"\n  onCollapseToggle={cycleNavState}\n/>',
    Blazor: '<SrNavigation Sections="@sections" State="Expanded" Current="Dashboard" />',
    MAUI: '<!-- No MAUI equivalent. A 248px persistent rail is a browser-width\n     pattern; MAUI is mobile only (phone, tablet). Mobile primary\n     navigation is BottomNav — see the Footer page, Type: Mobile. -->',
  };
  return `
<p class="breadcrumbs">Components</p>
<h1>Navigation</h1>
<p class="lede">The persistent list down the left of an application: where staff are, and everywhere
else they can go. Two types — Sectioned and Linear — and three widths.</p>
<div class="callout"><p>The component is full height and sticky, because Figma draws it that way in
every variant. The previews below take their height from the menu instead, so every destination is
visible without scrolling a sidebar inside a page; that framing is the only thing this site changes
about it.</p></div>

<h2>Type: Sectioned — expanded</h2>
<p class="muted">248px. Icon and label, with named groups a user would recognise (Patients, Clinical,
Nursing). Use Sectioned only when those labels do real work — do not invent groups to justify it.
A parent with children is a button with <code>aria-expanded</code>; a leaf is a link. Badges count
things to act on, and nothing else.</p>
${showcase(frame(''), 'navigation', snippets)}

<h2>Collapsed — rail</h2>
<p class="muted">108px. <strong>Not a truncated expanded row</strong>: the icon moves above the
label, both centre, and the label drops to caption (12px) so "Patient Search" fits without
truncating. Section labels, badges and chevrons are dropped — the rail is for recognition, not
detail.</p>
<div class="showcase"><div class="showcase__preview">${frame(' sr-nav--rail')}</div></div>

<h2>Collapsed — icon only</h2>
<p class="muted">48px. No persistent label; the label is revealed on hover <em>and</em> on
focus-visible. Both, not just hover — a keyboard user can reach an item but can never trigger hover,
so hover alone fails SC 1.4.13. Products need not adopt every width: Case Note Tracking ships
expanded and rail only.</p>
<div class="showcase"><div class="showcase__preview">${frame(' sr-nav--collapsed')}</div></div>
<hr>
${renderMarkdown(md)}
${accessibilityTable([
    { req: 'Navigation landmark with a name', sc: '1.3.1', how: 'A real nav element labelled "Primary", once per page — the sidebar, not the header, is the primary navigation when both are present.', test: 'Landmark review' },
    { req: 'Current destination is marked', sc: '4.1.2', how: 'aria-current="page" on the active item, not a bespoke active class, so it is announced and not only coloured.', test: 'Screen reader announce' },
    { req: 'Collapsed items keep their name', sc: '4.1.2', how: 'Every item carries aria-label whatever the width, so the icon-only rail is never a set of unlabelled buttons.', test: 'Screen reader, collapse first' },
    { req: 'Hidden labels reveal on focus, not only hover', sc: '1.4.13 / 2.1.1', how: 'The icon-only label appears on :hover AND :focus-visible. Hover alone is unreachable from the keyboard.', test: 'Keyboard tab through collapsed nav' },
    { req: 'Expandable parents announce their state', sc: '4.1.2', how: 'Parents are buttons with aria-expanded; the submenu is hidden, not merely off-screen.', test: 'Screen reader, expand and collapse' },
    { req: 'Collapse control says what it will do', sc: '2.4.6', how: '"Expand navigation" / "Collapse navigation" — the outcome, not the glyph.', test: 'Screen reader announce' },
    { req: 'Focus visible', sc: '2.4.7', how: 'SR cyan ring, inset so the rail edge cannot clip it. DDR-006.', test: 'Keyboard tab at every width' },
  ])}`;
}

// ─── Styles: token translator ─────────────────────────────────────────────────
const TRANSLATOR_SCRIPT = (colourData, spaceData) => `<script>
(function(){
  var COLOURS = ${JSON.stringify(colourData)};
  var SPACES = ${JSON.stringify(spaceData)};
  function hexToRgb(h){ h=h.replace('#',''); if(h.length===3){h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];} return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]; }
  function rgbToLab(rgb){
    var r=rgb.map(function(c){ c/=255; return c>0.04045?Math.pow((c+0.055)/1.055,2.4):c/12.92; });
    var x=(r[0]*0.4124+r[1]*0.3576+r[2]*0.1805)/0.95047,
        y=(r[0]*0.2126+r[1]*0.7152+r[2]*0.0722),
        z=(r[0]*0.0193+r[1]*0.1192+r[2]*0.9505)/1.08883;
    function f(t){ return t>0.008856?Math.cbrt(t):(7.787*t+16/116); }
    x=f(x);y=f(y);z=f(z);
    return [116*y-16, 500*(x-y), 200*(y-z)];
  }
  function dE(a,b){ var la=rgbToLab(a),lb=rgbToLab(b); return Math.sqrt(Math.pow(la[0]-lb[0],2)+Math.pow(la[1]-lb[1],2)+Math.pow(la[2]-lb[2],2)); }
  var LABS = COLOURS.map(function(c){ return { n:c.n, hex:c.hex, rgb:hexToRgb(c.hex) }; });
  function matchColour(hex){
    var rgb=hexToRgb(hex), best=null, bd=1e9;
    LABS.forEach(function(c){ var d=dE(rgb,c.rgb); if(d<bd){bd=d;best=c;} });
    return { token:best, dE:bd };
  }
  function matchSpace(px){
    var best=null,bd=1e9; SPACES.forEach(function(s){ var d=Math.abs(s.px-px); if(d<bd){bd=d;best=s;} });
    return { token:best, diff:bd };
  }
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }
  function run(){
    var src=document.getElementById('src').value;
    var hexes=(src.match(/#[0-9a-fA-F]{3,6}\\b/g)||[]);
    var pxs=(src.match(/\\b\\d+(?:\\.\\d+)?px\\b/g)||[]).map(function(p){return parseFloat(p);});
    var exact=[], close=[], none=[];
    hexes.forEach(function(h){
      var m=matchColour(h);
      var row={ kind:'colour', input:h, token:m.token.n, tokenHex:m.token.hex, note:'ΔE '+m.dE.toFixed(1) };
      if(m.dE<1) exact.push(row); else if(m.dE<10) close.push(row); else none.push(row);
    });
    pxs.forEach(function(p){
      var m=matchSpace(p);
      var row={ kind:'space', input:p+'px', token:m.token.n, tokenHex:null, note:(m.diff===0?'exact':'nearest, off-grid by '+m.diff+'px') };
      if(m.diff===0) exact.push(row); else if(m.diff<=2) close.push(row); else none.push(row);
    });
    render(exact, close, none, hexes.length+pxs.length);
  }
  function bucket(title, rows, cls){
    if(!rows.length) return '';
    return '<h3><span class="bucket bucket--'+cls+'">'+title+' ('+rows.length+')</span></h3><div class="table-wrap"><table><thead><tr><th>Input</th><th>Nearest token</th><th>Note</th></tr></thead><tbody>'+
      rows.map(function(r){
        var sw = r.tokenHex ? '<span class="dot" style="background:'+r.tokenHex+'"></span>' : '';
        return '<tr><td><code>'+esc(r.input)+'</code></td><td>'+sw+'<code>'+esc(r.token)+'</code></td><td>'+esc(r.note)+'</td></tr>';
      }).join('')+'</tbody></table></div>';
  }
  function render(exact, close, none, total){
    var el=document.getElementById('report');
    if(!total){ el.innerHTML='<p>No hex colours or px values found.</p>'; return; }
    el.innerHTML = bucket('Exact', exact, 'exact') + bucket('Close, review', close, 'close') +
      bucket('No match', none, 'none') +
      '<p class="muted">Anything with no match should go through a component or token request. The translator never changes your code.</p>';
  }
  document.getElementById('run').addEventListener('click', run);
  document.getElementById('sample').addEventListener('click', function(){
    document.getElementById('src').value = 'color: #325083;\\nbackground: #f4f5f8;\\nborder: 1px solid #d9dde0;\\npadding: 15px 16px;\\ncolor: #ff4400;';
    run();
  });
})();
</script>`;

// ─── Styles: Icons ────────────────────────────────────────────────────────────
// Every icon on this page is rendered from the built icon set, so the gallery can
// never fall out of step with what products actually consume.
const ICON_DOMAINS = {
  nav: 'Navigation and UI chrome',
  action: 'Actions and editing',
  status: 'Status and feedback',
  people: 'Patients and people',
  clinical: 'Clinical records and data',
  schedule: 'Scheduling and appointments',
  location: 'Location and organisation',
  comms: 'Communication and messaging',
  file: 'Documents and files',
  data: 'Data and analytics',
};

function iconsBody() {
  const byDomain = new Map(Object.keys(ICON_DOMAINS).map((d) => [d, []]));
  for (const name of iconNames) {
    const domain = name.split('/')[0];
    if (!byDomain.has(domain)) byDomain.set(domain, []);
    byDomain.get(domain).push(name);
  }

  const tile = (name) =>
    `<button class="icon-tile" type="button" data-name="${name}" title="Copy ${name}">
       <span class="sr-icon sr-icon--lg sr-icon--default">${iconMarkup(name)}</span>
       <span class="icon-tile__name">${name}</span>
     </button>`;

  const gallery = [...byDomain.entries()].map(([domain, names]) =>
    `<section class="icon-group" data-domain="${domain}">
       <h3>${ICON_DOMAINS[domain] || domain} <span class="icon-group__count">${names.length}</span></h3>
       <div class="icon-grid">${names.sort().map(tile).join('')}</div>
     </section>`).join('');

  const sizeSpecimen = ['xs', 'sm', 'md', 'lg'].map((s) =>
    `<figure class="icon-spec">
       <span class="sr-icon sr-icon--${s} sr-icon--default">${iconMarkup('clinical/vitals')}</span>
       <figcaption><code>sr-icon--${s}</code></figcaption>
     </figure>`).join('');

  const colourRoles = [
    ['default', 'Default icon colour, matched to body text'],
    ['subtle', 'Supporting icons that must not compete with the label'],
    ['interactive', 'Icons inside links and interactive controls'],
    ['critical', 'Errors, invalid fields, critical alerts'],
    ['warning', 'Attention required, unverified data'],
    ['success', 'Confirmed and completed states'],
    ['info', 'Informational and in-progress states'],
  ];
  const colourSpecimen = colourRoles.map(([role]) =>
    `<figure class="icon-spec">
       <span class="sr-icon sr-icon--lg sr-icon--${role}">${iconMarkup('status/info')}</span>
       <figcaption><code>sr-icon--${role}</code></figcaption>
     </figure>`).join('');
  const colourTable = `<div class="table-wrap"><table>
    <thead><tr><th>Class</th><th>Colour token</th><th>Use for</th></tr></thead>
    <tbody>${colourRoles.map(([role, use]) => {
      const token = { default: 'sr.color.text.primary', subtle: 'sr.color.text.secondary',
        interactive: 'sr.color.interactive.primary', critical: 'sr.color.status.critical',
        warning: 'sr.color.status.warning', success: 'sr.color.status.success',
        info: 'sr.color.status.info' }[role];
      return `<tr><td><code>sr-icon--${role}</code></td><td><code>${token}</code></td><td>${use}</td></tr>`;
    }).join('')}
    <tr><td><code>sr-icon--inverse</code></td><td><code>sr.color.text.inverse</code></td><td>Icons on a dark or saturated fill</td></tr>
    <tr><td><code>sr-icon--inherit</code></td><td>Inherited</td><td>Icons inside a coloured component, such as a button, that must track the component colour</td></tr>
    </tbody></table></div>`;

  const basicSnippets = {
    HTML: `<!-- Decorative: the visible text carries the meaning. -->
<span class="sr-icon sr-icon--md sr-icon--default">
  <svg aria-hidden="true" focusable="false"><!-- clinical/vitals --></svg>
</span>
<span>Observations</span>`,
    React: `import { Icon } from '@dhcw/sr-react';

<Icon name="clinical/vitals" size="md" color="default" />
<span>Observations</span>`,
    Blazor: `<SrIcon Name="clinical/vitals" Size="IconSize.Md" Color="IconColor.Default" />
<span>Observations</span>`,
    MAUI: `<!-- Icons ship as geometry in Icons.xaml, so the stroke is a token and
     follows the theme. Leave Fill unset: these are outlines, and filling them
     closes shapes meant to read as strokes. -->
<Path Data="{StaticResource SrIconClinicalVitals}"
      Aspect="Uniform" HeightRequest="24" WidthRequest="24"
      StrokeThickness="2" StrokeLineCap="Round" StrokeLineJoin="Round"
      Stroke="{AppThemeBinding Light={StaticResource SrColorTextPrimary}, Dark={StaticResource SrColorTextPrimaryDark}}" />`,
  };

  const a11ySnippets = {
    HTML: `<!-- Decorative. Paired with visible text, so the icon is hidden from
     assistive technology and the text is announced on its own. -->
<button class="sr-button sr-button--secondary" type="button">
  <span class="sr-icon sr-icon--sm sr-icon--inherit"><svg aria-hidden="true" focusable="false"></svg></span>
  Print summary
</button>

<!-- Meaningful. No visible text, so the control carries the name. -->
<button class="sr-button sr-button--secondary" type="button" aria-label="Print summary">
  <span class="sr-icon sr-icon--sm sr-icon--inherit"><svg aria-hidden="true" focusable="false"></svg></span>
</button>`,
    React: `{/* Decorative: the button text is the accessible name. */}
<Button variant="secondary">
  <Icon name="action/print" size="sm" color="inherit" />
  Print summary
</Button>

{/* Meaningful: name the control, not the icon. */}
<Button variant="secondary" aria-label="Print summary">
  <Icon name="action/print" size="sm" color="inherit" />
</Button>`,
    Blazor: `@* Decorative: the button text is the accessible name. *@
<SrButton Variant="ButtonVariant.Secondary">
  <SrIcon Name="action/print" Size="IconSize.Sm" Color="IconColor.Inherit" />
  Print summary
</SrButton>

@* Meaningful: name the control, not the icon. *@
<SrButton Variant="ButtonVariant.Secondary" AriaLabel="Print summary">
  <SrIcon Name="action/print" Size="IconSize.Sm" Color="IconColor.Inherit" />
</SrButton>`,
    MAUI: `<!-- Decorative: the visible label carries the meaning, so the icon is kept
     out of the accessibility tree. -->
<HorizontalStackLayout Spacing="8">
    <Path Data="{StaticResource SrIconActionPrint}"
          Aspect="Uniform" HeightRequest="16" WidthRequest="16" VerticalOptions="Center"
          StrokeThickness="2" StrokeLineCap="Round" StrokeLineJoin="Round"
          Stroke="{AppThemeBinding Light={StaticResource SrColorTextPrimary}, Dark={StaticResource SrColorTextPrimaryDark}}"
          AutomationProperties.IsInAccessibleTree="False" />
    <Label Text="Print record" StyleClass="FieldLabel" VerticalOptions="Center" />
</HorizontalStackLayout>

<!-- Icon-only: it must carry its own accessible name. -->
<Path Data="{StaticResource SrIconActionDelete}"
      Aspect="Uniform" HeightRequest="24" WidthRequest="24"
      StrokeThickness="2" StrokeLineCap="Round" StrokeLineJoin="Round"
      Stroke="{AppThemeBinding Light={StaticResource SrColorTextPrimary}, Dark={StaticResource SrColorTextPrimaryDark}}"
      SemanticProperties.Description="Delete note" />`,
  };

  const statusSnippets = {
    HTML: `<!-- Correct: colour and icon reinforce a label that already says it. -->
<p>
  <span class="sr-icon sr-icon--sm sr-icon--critical"><svg aria-hidden="true" focusable="false"></svg></span>
  Allergy: penicillin
</p>

<!-- Wrong: a bare red icon leaves the meaning to colour and shape alone. -->
<span class="sr-icon sr-icon--sm sr-icon--critical"><svg aria-hidden="true"></svg></span>`,
    React: `<Text size="s">
  <Icon name="status/warning" size="sm" color="critical" />
  Allergy: penicillin
</Text>`,
    Blazor: `<SrText Size="TextSize.S">
  <SrIcon Name="status/warning" Size="IconSize.Sm" Color="IconColor.Critical" />
  Allergy: penicillin
</SrText>`,
    MAUI: `<!-- A status icon takes the status token and is always paired with text.
     Colour is never the only signal (WCAG 1.4.1). -->
<HorizontalStackLayout Spacing="8">
    <Path Data="{StaticResource SrIconStatusWarning}"
          Aspect="Uniform" HeightRequest="16" WidthRequest="16" VerticalOptions="Center"
          StrokeThickness="2" StrokeLineCap="Round" StrokeLineJoin="Round"
          Stroke="{StaticResource SrColorStatusWarning}"
          AutomationProperties.IsInAccessibleTree="False" />
    <Label Text="Result outside reference range" StyleClass="BodyS"
           VerticalOptions="Center" />
</HorizontalStackLayout>`,
  };

  const buttonRow = `
<button class="sr-button sr-button--secondary" type="button">
  <span class="sr-icon sr-icon--sm sr-icon--inherit">${iconMarkup('action/print')}</span>
  Print summary
</button>
<button class="sr-button sr-button--secondary" type="button" aria-label="Print summary">
  <span class="sr-icon sr-icon--sm sr-icon--inherit">${iconMarkup('action/print')}</span>
</button>`;

  const statusRow = ['critical', 'warning', 'success', 'info'].map((role) => {
    const [name, label] = { critical: ['status/warning', 'Allergy: penicillin'],
      warning: ['status/pending', 'Result not yet verified'],
      success: ['status/success', 'Discharge summary sent'],
      info: ['status/info', 'Referral in progress'] }[role];
    return `<p class="icon-status-row">
      <span class="sr-icon sr-icon--sm sr-icon--${role}">${iconMarkup(name)}</span>
      <span>${label}</span>
    </p>`;
  }).join('');

  return `
<p class="breadcrumbs">Styles</p>
<h1>Icons</h1>
<p class="lede">The Single Record icon set, and the size and colour rules that keep it legible in
dense clinical screens.</p>

<h2>The set</h2>
<p>Single Record uses <a href="https://lucide.dev" target="_blank" rel="noopener">Lucide</a>, an
open-source icon set published under the ISC licence. Every icon is drawn on a 24 by 24 grid with a
2px stroke, round caps and round joins, so icons sit together evenly whatever the mix on screen.</p>
<p>${iconNames.length} icons are published, grouped into ${byDomain.size} domains that follow how
clinical and administrative staff talk about their work: navigation, actions, status, people,
clinical records, scheduling, location, communication, files and data.</p>
<p>Icons are referenced by their Single Record name, such as <code>clinical/medication</code>, not by
the underlying Lucide file name. The Single Record name is stable: if an upstream drawing is renamed
or replaced, the name your product uses does not change.</p>

<h2>Using an icon</h2>
<p>An icon is a <code>sr-icon</code> wrapper around an inline SVG. The wrapper carries the size and
the colour role; the SVG itself is drawn with <code>currentColor</code> and inherits from it.</p>
${showcase(`<div class="icon-specs">${sizeSpecimen}</div>`, 'icon-basic', basicSnippets)}

<h2>Sizes</h2>
<p>Four sizes are published. Stroke weight is reduced slightly at the two smallest sizes so the
drawing does not fill in at low pixel densities.</p>
<div class="table-wrap"><table>
<thead><tr><th>Class</th><th>Size</th><th>Use for</th></tr></thead>
<tbody>
<tr><td><code>sr-icon--xs</code></td><td>16px</td><td>Inline within dense content, such as a table cell</td></tr>
<tr><td><code>sr-icon--sm</code></td><td>20px</td><td>Standard inline icons, including icons inside buttons</td></tr>
<tr><td><code>sr-icon--md</code></td><td>24px</td><td>Default size</td></tr>
<tr><td><code>sr-icon--lg</code></td><td>32px</td><td>Prominent icons, empty states, feature panels</td></tr>
</tbody></table></div>
<p>An icon that is itself a control needs a target of at least 44 by 44px. Keep the icon at its
published size and add padding to the button around it, rather than scaling the drawing up.</p>

<h2>Colour</h2>
<p>Icons take their colour from a role, not from a value. Roles map onto the same semantic colour
tokens the rest of the interface uses, so an icon shifts with the theme without being re-specified.</p>
<div class="icon-specs">${colourSpecimen}</div>
${colourTable}
<p>Inside a component that already sets a colour, such as a button, use
<code>sr-icon--inherit</code> so the icon tracks the component rather than fighting it.</p>
<div class="callout"><p><strong>The warning role is an exception.</strong> Every colour role above
clears 3:1 against a light surface except <code>sr-icon--warning</code>, which is a fill colour
rather than a stroke colour and reaches only 1.6:1 on white. Never let a warning icon carry the
message on its own: give it a text label, and where the icon has to read on its own use
<code>sr-icon--critical</code> or the warning surface behind a labelled banner. A darker warning
value is under review.</p></div>

<h2>Icons with text</h2>
<p>Most icons in Single Record sit next to a label. In that pairing the text carries the meaning and
the icon is decorative, so it is hidden from screen readers. When an icon stands alone, the control
around it must be named instead.</p>
${showcase(buttonRow, 'icon-a11y', a11ySnippets)}

<h2>Status icons</h2>
<p>Clinical status must never be carried by colour or by icon shape alone. Every status icon needs a
text label next to it. Staff working at speed, on varied screens, in varied light, read the label.</p>
${showcase(statusRow, 'icon-status', statusSnippets)}

<h2>When not to use an icon</h2>
<ul>
<li>In dense data views, where a decorative icon in every row adds noise and no meaning.</li>
<li>As the only signal for a state, an action, or a piece of clinical information.</li>
<li>To replace a word that is short and unambiguous. A labelled control is faster to read than an
icon a member of staff has to learn.</li>
<li>Alongside icons from another set. Mixing sets breaks the shared stroke and grid, and the result
reads as two different products.</li>
</ul>
<p>Do not redraw or edit the SVG paths, and do not rotate an icon to mean something new. If the set
does not cover what you need, request the icon rather than improvising one.</p>

<h2>Browse the set</h2>
<p>Select an icon to copy its name.</p>
<div class="icon-browser">
  <label class="sr-only" for="icon-filter">Filter icons by name</label>
  <input id="icon-filter" class="icon-filter" type="search" autocomplete="off"
         placeholder="Filter, for example medication or chevron">
  <p class="icon-browser__status" id="icon-count" role="status"></p>
</div>
<div id="icon-gallery">${gallery}</div>

${accessibilityTable([
    { req: 'Decorative icons are not announced', sc: '1.1.1', how: 'Icons paired with visible text ship with `aria-hidden="true"` and `focusable="false"`, so the label is announced once.', test: 'Screen reader, NVDA and VoiceOver' },
    { req: 'Standalone icons have an accessible name', sc: '4.1.2', how: 'An icon-only control is named on the button or link with `aria-label`, describing the action rather than the drawing.', test: 'Screen reader, accessibility inspector' },
    { req: 'Meaning is not carried by colour alone', sc: '1.4.1', how: 'Status icons are always paired with a text label. Colour and shape reinforce the label, they do not replace it.', test: 'Greyscale review' },
    { req: 'Icons meet non-text contrast', sc: '1.4.11', how: 'Icon colour roles resolve to semantic tokens checked at 3:1 against the surface behind them. The warning role is the one exception and must always be paired with a text label.', test: 'Automated contrast' },
    { req: 'Icon controls are large enough to hit', sc: '2.5.8', how: 'Icon-only controls use a 44 by 44px target, with the drawing kept at its published size and padding added around it.', test: 'Measure, touch device' },
    { req: 'Icons scale with text', sc: '1.4.4', how: 'Icons are drawn at 1em and sized from the type scale, so they enlarge with the surrounding text at 200% zoom.', test: 'Browser zoom to 200%' },
  ])}`;
}

const ICONS_JS = `<script>
(function(){
  var input = document.getElementById('icon-filter');
  var gallery = document.getElementById('icon-gallery');
  var count = document.getElementById('icon-count');
  if(!input || !gallery) return;
  var tiles = [].slice.call(gallery.querySelectorAll('.icon-tile'));
  var groups = [].slice.call(gallery.querySelectorAll('.icon-group'));

  function filter(){
    var q = input.value.trim().toLowerCase();
    var shown = 0;
    tiles.forEach(function(t){
      var match = !q || t.getAttribute('data-name').indexOf(q) !== -1;
      t.hidden = !match;
      if(match) shown++;
    });
    groups.forEach(function(g){
      g.hidden = !g.querySelector('.icon-tile:not([hidden])');
    });
    count.textContent = q ? shown + ' of ' + tiles.length + ' icons' : '';
  }
  input.addEventListener('input', filter);

  gallery.addEventListener('click', function(e){
    var tile = e.target.closest ? e.target.closest('.icon-tile') : null;
    if(!tile) return;
    var name = tile.getAttribute('data-name');
    var done = function(){
      tile.classList.add('is-copied');
      setTimeout(function(){ tile.classList.remove('is-copied'); }, 1200);
    };
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(name).then(done, function(){});
    }
  });
})();
</script>`;

// ─── "Planned" page: honest status plus upstream links ────────────────────────
function plannedBody({ title, crumb, intro, links = [], prefix = '' }) {
  links = links.map((l) => (/^https?:/.test(l.href) ? l : { ...l, href: prefix + l.href }));
  return `
<p class="breadcrumbs">${crumb}</p>
<h1>${title}</h1>
<p class="lede">${intro}</p>
<div class="callout"><p><strong>Status: planned.</strong> This page is part of the design system
structure but its content is not yet written. It is listed so the structure is visible and
reviewable, rather than shipping an empty page or invented guidance.</p></div>
${links.length ? `<h2>In the meantime</h2><ul>${links.map((l) => `<li><a href="${l.href}"${/^https?:/.test(l.href) ? ' target="_blank" rel="noopener"' : ''}>${l.label}</a>: ${l.note}</li>`).join('')}</ul>` : ''}`;
}

// ─── read guideline sources ───────────────────────────────────────────────────
const spacingMd = publicise(readFileSync(resolve(ROOT, 'foundations', 'tokens', 'spacing.guidelines.md'), 'utf8'));

// ─── register pages ───────────────────────────────────────────────────────────
addPage({
  file: 'index.html', url: 'index.html', title: 'Single Record Design System', section: 'Get Started',
  sectionId: 'get-started', activeHref: 'index.html', prefix: '',
  body: `
<h1>Single Record Design System</h1>
<p class="lede">The design system for the Single Record programme in NHS Wales (DHCW). It supports
clinical and administrative products across web, Blazor/.NET, React and .NET MAUI. Every page here
is a real implementation of the system, rendered from the built design tokens and the actual
reference components, not a mockup.</p>
<div class="cards">
  <a class="card" href="styles/typography.html">${cardIcon('action/edit')}<h3>Styles</h3><p>Typography, colour, spacing, and the token translator.</p></a>
  <a class="card" href="components/button.html">${cardIcon('clinical/record')}<h3>Components</h3><p>Buttons and tables, with live previews and framework code.</p></a>
  <a class="card" href="figma.html">${cardIcon('nav/dashboard')}<h3>Figma &amp; catalogue</h3><p>The Figma library and the component catalogue.</p></a>
  <a class="card" href="contributions.html">${cardIcon('action/send')}<h3>Contribute</h3><p>Report an issue or request a component or change.</p></a>
</div>
<h2>Principles</h2>
<ul>
  <li><strong>Accessibility is a hard requirement.</strong> WCAG 2.2 AA is the minimum, AAA where feasible.</li>
  <li><strong>Consistency over novelty.</strong> Align with GDS and NHS England before inventing.</li>
  <li><strong>Tokens are the source of truth.</strong> Figma variables build to the same tokens this site consumes.</li>
</ul>
<h2>How content works here</h2>
<p>For general UX guidance we link out to <a href="https://www.nhs.uk/" target="_blank" rel="noopener">NHS.UK</a> and
<a href="https://www.gov.uk/" target="_blank" rel="noopener">GOV.UK</a> rather than duplicate content that is
maintained upstream. We write original guidance only for Single Record specifics: tokens, clinical
rationale, and how our components behave.</p>`,
});

addPage({
  file: 'how-to-use.html', url: 'how-to-use.html', title: 'How to use', section: 'Get Started',
  sectionId: 'get-started', activeHref: 'how-to-use.html', prefix: '',
  body: `
<p class="breadcrumbs">Get Started</p>
<h1>How to use</h1>
<p class="lede">How to pick up the design system, whether you are designing a screen or building one.</p>

<h2>If you are designing</h2>
<ul>
  <li>Start from the Figma library. Its variables are the same tokens this site publishes, so a
  screen built from the library is already using real values.</li>
  <li>Choose styles by role rather than by size. A heading is a heading because of where it sits in
  the page structure, not because of how big you want it.</li>
  <li>Check whether a component already exists before drawing a new one. Most needs are a variant of
  something the system already has.</li>
</ul>

<h2>If you are building</h2>
<ul>
  <li>Consume the published token stylesheet and reference the semantic custom properties, for
  example <code>var(--sr-color-interactive-primary)</code>. Do not copy hex values into your code.</li>
  <li>Use the component classes shown on each page. Every code sample here is copyable and matches
  the live preview above it.</li>
  <li>On legacy .NET Framework screens, the tokens are still available as CSS custom properties even
  where the components are not.</li>
</ul>

<h2>Getting the actual files</h2>
<p>Every code sample on this site assumes the design system's stylesheet is already loaded. See
<a href="get-the-files.html">Get the files</a> for the one CSS file to download and link, the icon
sprite, and what does and does not need JavaScript.</p>

<h2>Check your work against the tokens</h2>
<p>If you are bringing an existing screen into the system, paste its CSS into the
<a href="styles/token-translator.html">token translator</a>. It matches the colours and spacing you
already use against the published tokens and shows you what is an exact match, what is close enough
to review, and what has no equivalent yet.</p>

<h2>Frameworks</h2>
<p>Every code sample is shown for the four supported targets, in the same order: HTML, React, Blazor
and MAUI. HTML is the reference implementation; React and Blazor wrap the same markup and tokens.</p>
<p><strong>MAUI is different, and deliberately so.</strong> It is a native platform with its own
layout engine, so it does not share markup with the web: there is no web view and no shared HTML.
What it does share is the layer that keeps things consistent, the design tokens, delivered as XAML
resource dictionaries generated from the same source as the web stylesheet. Native MAUI styles are
in progress, so a MAUI tab currently either shows real XAML or says plainly that it does not exist
yet.</p>

<h2>If something is missing or wrong</h2>
<p>Use <a href="${REPORT_ISSUE_URL}" target="_blank" rel="noopener">Report an issue</a> for anything
broken, incorrect or inaccessible. Use
<a href="contributions.html">Contributions</a> if you need a component, variant or token that does
not exist yet.</p>`,
});

addPage({
  file: 'get-the-files.html', url: 'get-the-files.html', title: 'Get the files',
  section: 'Get Started', sectionId: 'get-started', activeHref: 'get-the-files.html', prefix: '',
  body: `
<p class="breadcrumbs">Get Started</p>
<h1>Get the files</h1>
<p class="lede">The actual stylesheet and script to put in an application. Reading a component's
source on this site shows you what it is; these are the files that make it work.</p>

<h2>The short version</h2>
<p>Download <a href="downloads/single-record.css" download>single-record.css</a>, put it in your
project, and link it. That is the whole of the minimum.</p>
<div class="codepanel"><pre><code>&lt;link rel="stylesheet" href="/css/single-record.css"&gt;</code></pre></div>
<p>It contains the font, every design token, the typography utilities and all
${WEB_COMPONENT_COUNT} component stylesheets, so nothing else has to be fetched or configured. Now any
markup you copy from a component page on this site will look right.</p>
<div class="callout"><p><strong>No npm, no build step, no network.</strong> Roboto is embedded in the
stylesheet itself, so there is no font request to be blocked by a firewall or proxy. If
<code>npm install</code> is failing on your machine, this route works regardless &mdash; and it is
worth knowing that the design system adds no third-party dependencies of its own, so whatever is
failing is in the toolchain rather than in these packages.</p>
<p>One thing to watch: opening the page straight from disk with <code>file://</code> works for
everything except the sprite icons, where a cross-file <code>&lt;use&gt;</code> is blocked and fails
silently. Serve the folder over HTTP, or use <code>icons.js</code> instead.</p></div>

<h2>The files</h2>
<div class="table-wrap"><table>
<thead><tr><th>File</th><th>What it is</th><th>Do you need it?</th></tr></thead>
<tbody>
<tr><td><a href="downloads/single-record.css" download><code>single-record.css</code></a></td>
    <td>Font, tokens, typography utilities and every component, in one file.</td>
    <td><strong>Yes.</strong> Start here.</td></tr>
<tr><td><a href="downloads/single-record-dark.css" download><code>single-record-dark.css</code></a></td>
    <td>Dark-mode token overrides. Load it <em>after</em> the file above.</td>
    <td>Only if your product supports dark mode. These values are still provisional.</td></tr>
<tr><td><a href="downloads/icons.js" download><code>icons.js</code></a></td>
    <td>The icon set as an ES module: <code>iconMarkup(name)</code> returns the SVG.</td>
    <td>If you are building markup in JavaScript.</td></tr>
<tr><td><a href="downloads/sprite.svg" download><code>sprite.svg</code></a></td>
    <td>The same icons as one SVG sprite, referenced with <code>&lt;use&gt;</code>.</td>
    <td>If you are writing plain HTML or Razor, with no JavaScript.</td></tr>
<tr><td><code>downloads/components/&lt;name&gt;.css</code></td>
    <td>One component's stylesheet on its own.</td>
    <td>Only if you are adopting a single component and cannot take the whole file.</td></tr>
</tbody></table></div>
<div class="callout"><p>These files are generated from the same source this website renders, every
time the site is built. There is no hand-maintained copy to fall out of date — but equally, they are
a snapshot: re-download after a release rather than assuming what you have is current.</p></div>

<h2>Using an icon</h2>
<p>Icons are the only part of the HTML layer that is not plain markup, because the set is generated.
Two ways to place one, and neither needs a build step:</p>
${codePanel('get-files-icon', {
  HTML: '<!-- With the sprite: no JavaScript at all. -->\n<span class="sr-icon sr-icon--sm">\n  <svg><use href="/assets/sprite.svg#icon-nav-search"></use></svg>\n</span>',
  React: 'import Icon from "@dhcw/sr-react/icon";\n\n<Icon name="nav/search" size="sm" />',
  Blazor: '<SrIcon Name="nav/search" Size="IconSize.Sm" />',
  MAUI: `<!-- Icons.xaml is merged once in App.xaml; after that any icon is a key. -->
<Path Data="{StaticResource SrIconNavSearch}"
      Aspect="Uniform" HeightRequest="16" WidthRequest="16"
      StrokeThickness="2" StrokeLineCap="Round" StrokeLineJoin="Round"
      Stroke="{AppThemeBinding Light={StaticResource SrColorTextPrimary}, Dark={StaticResource SrColorTextPrimaryDark}}" />`,
})}

<div class="callout"><p><strong>The sprite has to be served over HTTP from your own origin.</strong>
Browsers refuse a cross-file <code>&lt;use&gt;</code> reference on a page opened straight from disk
(<code>file://</code>) or from another domain, and it fails silently — the icon is simply absent. If
your icons do not appear, check that first before checking the markup.</p></div>

<h2>Where the JavaScript is</h2>
<p>Mostly, there isn't any, and that is deliberate. The HTML layer is markup and CSS: a button is a
<code>&lt;button&gt;</code>, a table is a <code>&lt;table&gt;</code>. Behaviour that genuinely needs
code, such as opening a modal or a date picker, lives in the framework wrappers rather than in a
loose script you have to wire up:</p>
<ul>
  <li><strong>React</strong> — the components in <code>packages/react</code>. JSX source, which any
  React setup compiles as part of its own build; there is no pre-built browser file, and one is only
  needed by a project with no build step at all.</li>
  <li><strong>Blazor / .NET</strong> — the Razor Class Library in <code>packages/blazor</code>, which
  MAUI renders too.</li>
</ul>

<h2>How to install it</h2>
<p>The packages are not published to npm yet — that is a naming and governance decision with its
own record (DDR-020), not something to slip in.</p>

<div class="callout callout--warning"><p><strong>Installing this repository from GitHub does not
work, and any guide telling you to do so is out of date.</strong> This is a monorepo: the thing at
the repository root is a private workspace container, not a package. Both of these fail, and they
fail in a confusing way rather than with a clear error:</p>
<div class="codepanel"><pre><code># Installs ONE package called @dhcw/sr-design-system.
# @dhcw/sr-react is not in node_modules afterwards.
npm install github:DHCW-Digital-Health-and-Care-Wales/single-record-design-system#main

# Installs the same repository root under a different name. The package it
# fetches is private, has no entry point, and importing from it throws
# ERR_MODULE_NOT_FOUND.
"@dhcw/sr-react": "github:DHCW-Digital-Health-and-Care-Wales/single-record-design-system#main"</code></pre></div>
<p>npm has no way to install a single workspace out of a git repository. Until the packages are
published, the download route below is the supported one, and it is a complete route rather than a
stopgap.</p></div>

<h3>Route 1: Download the files (works today, no build step)</h3>
<p>Take <a href="downloads/single-record.css" download>single-record.css</a> and
<a href="downloads/sprite.svg" download>sprite.svg</a> from the table above and link them directly.
This is the route for plain HTML, Razor, ASP.NET, or a React app where you write the markup and take
the styling from the design system.</p>
<p>Everything on this site's component pages is plain markup with <code>sr-</code> classes, so the
stylesheet alone gets you a correct-looking component in any framework. What you do not get is the
React component wrappers — those need Route 2.</p>

<h3>Route 2: npm packages (once published)</h3>
<p>For a React or bundler-based project that wants the component wrappers rather than just the CSS.
When the packages are published, this is what it will look like — the import paths below are the
real ones, verified against each package's exports:</p>
${codePanel('get-files-npm-import', {
  HTML: '<!-- Route 1 (download) is the equivalent for plain HTML — see above. -->',
  React: '// Once, in your entry file — this is the whole of the styling.\nimport "@dhcw/sr-web/dist/single-record.css";\n\n// Then the components you need. The barrel carries all of them.\nimport { Button, Input, Navigation, PatientBanner, Tag } from "@dhcw/sr-react";\n\n// A single component can also be imported on its own.\nimport Icon from "@dhcw/sr-react/icon";',
  Blazor: '<!-- The Blazor Razor Class Library is distributed via NuGet, not npm. See DDR-020. -->',
  MAUI: `<!-- MAUI does not consume the npm package. Take Colors.xaml, Styles.xaml and
     Icons.xaml from packages/maui, add them as MauiXaml, and merge them in
     App.xaml. Colors must come first: Styles resolves against it. -->
<ResourceDictionary.MergedDictionaries>
    <ResourceDictionary Source="Resources/Styles/Colors.xaml" />
    <ResourceDictionary Source="Resources/Styles/Styles.xaml" />
    <ResourceDictionary Source="Resources/Styles/Icons.xaml" />
</ResourceDictionary.MergedDictionaries>`,
})}
<p>Working in a checkout of the repository itself (rather than as a dependency)? Clone
<a href="https://github.com/DHCW-Digital-Health-and-Care-Wales/single-record-design-system" target="_blank" rel="noopener">the org repo</a>, then:</p>
<div class="codepanel"><pre><code>npm install
npm run build:web    # writes packages/web/dist/</code></pre></div>

<div class="callout"><p>The package name and its contents are the same either way — installing from
GitHub today and from npm once it is published are the same package at the same version. Only the
install command changes.</p></div>`,
});

const FIGMA_LIBRARY_URL = 'https://www.figma.com/design/x5fwyefxxgD03csz8ld7SZ/SINGLE-RECORD-DESIGN-SYSTEM?node-id=1307-16983&t=eafR64jJMZD5ez6T-1';

addPage({
  file: 'figma.html', url: 'figma.html', title: 'Using Figma', section: 'Get Started',
  sectionId: 'get-started', activeHref: 'figma.html', prefix: '',
  body: `
<p class="breadcrumbs">Get Started</p>
<h1>Using Figma</h1>
<p class="lede">The Single Record Figma library is the canonical source for variables, components and
usage notes. Its variables build to the same tokens this website consumes.</p>
<div class="cards">
  <a class="card" href="${FIGMA_LIBRARY_URL}" target="_blank" rel="noopener">${cardIcon('nav/dashboard')}<h3>Figma Design System file</h3><p>The canonical library: components, variables and usage notes, authored directly in Figma.</p></a>
  <a class="card" href="components/button.html">${cardIcon('clinical/record')}<h3>Component catalogue</h3><p>Every component documented here, with anatomy, states, accessibility notes and code.</p></a>
</div>
<h2>Keeping design and code in step</h2>
<p>Changes to variables in Figma flow into the published token artifact, and this site rebuilds from
that artifact. If a value here does not match what you see in Figma, the token has not been
published yet. Report it rather than working around it.</p>
<h2>Naming</h2>
<p>Figma component and variable names match the token names this site publishes, so a name you read
in the library is the name you type in code. Where they differ, the token JSON in
<code>foundations/tokens/</code> wins and the Figma name is out of date.</p>`,
});

addPage({
  file: 'storybook.html', url: 'storybook.html', title: 'Using Storybook', section: 'Get Started',
  sectionId: 'get-started', activeHref: 'storybook.html', prefix: '',
  body: `
<p class="breadcrumbs">Get Started</p>
<h1>Using Storybook</h1>
<p class="lede">The interactive playground. Every reference component rendered with all of its
variants and controls, so you can try a component before you build with it.</p>
<div class="cards">
  <a class="card" href="${STORYBOOK_URL}">${cardIcon('action/eye')}<h3>Open Storybook</h3><p>Browse every component and change its props live.</p></a>
  <a class="card" href="get-the-files.html">${cardIcon('action/download')}<h3>Get the files</h3><p>Once you know what you need, install the packages or download the CSS.</p></a>
</div>

<h2>What it is for</h2>
<p>This website documents <em>when</em> to use a component and how it should behave. Storybook shows
you <em>what it does</em>: change a prop and the component re-renders, so you can see every variant,
size and state without writing a page first.</p>
<p>Reach for it when you are choosing between two components, checking whether a variant already
exists before building one, or confirming how a component behaves at a state you cannot easily
reproduce in your own app.</p>

<h2>How it relates to this site</h2>
<p>Both are built from the same source. A component's page here and its Storybook entry render the
same files from <code>packages/react</code> and <code>packages/web</code>, so they cannot disagree
about behaviour. If they appear to, the site build is stale &mdash; report it.</p>

<h2>What it does not cover</h2>
<p>Storybook renders the React reference implementation. It is not a Blazor or MAUI preview, and it
does not carry the usage guidance, accessibility requirements or content rules that live on the
component pages here. Use both: this site for the decision, Storybook for the behaviour.</p>

<h2>Running it locally</h2>
<p>If you are working in the repository rather than reading the published copy:</p>
${codePanel('storybook-run', {
    HTML: 'npm install\\nnpm run storybook',
    React: 'npm install\\nnpm run storybook',
    Blazor: '<!-- Storybook renders the React reference implementation.\\n     For Blazor, run the Blazor sample app in packages/blazor. -->',
    MAUI: '<!-- Storybook renders the React reference implementation.\\n     For MAUI, build packages/maui/testbed and run it on a device. -->',
  })}`,
});

addPage({
  file: 'styles/typography.html', url: 'styles/typography.html', title: 'Typography', section: 'Styles',
  sectionId: 'styles', activeHref: 'styles/typography.html', prefix: '../', body: typographyBody(),
});
addPage({
  file: 'styles/colour.html', url: 'styles/colour.html', title: 'Colour', section: 'Styles',
  sectionId: 'styles', activeHref: 'styles/colour.html', prefix: '../', body: colourBody(),
});
addPage({
  file: 'styles/spacing.html', url: 'styles/spacing.html', title: 'Spacing & Elevation', section: 'Styles',
  sectionId: 'styles', activeHref: 'styles/spacing.html', prefix: '../',
  body: `<p class="breadcrumbs">Styles</p>${renderMarkdown(spacingMd)}<hr>
    <h2>The spacing scale</h2>
    <p>Bar widths are set with the built spacing custom properties.</p><div class="space-scale">${spacingScale}</div>
    <h2>Radius</h2><div class="radii">${radiusSamples}</div>
    <h2>Elevation</h2>
    <p>Shadow separates surfaces that sit above the page. Single Record uses two
    steps and no more, both tinted from Navy 900 rather than black so they stay
    subdued on clinical displays. Buttons carry no shadow: they show affordance
    through fill, border and colour.</p>
    <div class="elevations">${elevationSamples}</div>
    <p class="muted">Do not stack elevations, and do not use shadow to signal that
    something is interactive. Focus is handled by the focus ring, not by elevation.</p>`,
});
addPage({
  file: 'styles/icons.html', url: 'styles/icons.html', title: 'Icons', section: 'Styles',
  sectionId: 'styles', activeHref: 'styles/icons.html', prefix: '../',
  body: iconsBody(),
  extraScript: ICONS_JS,
});
addPage({
  file: 'styles/grids.html', url: 'styles/grids.html', title: 'Grids', section: 'Styles',
  sectionId: 'styles', activeHref: 'styles/grids.html', prefix: '../',
  body: gridsBody(flat),
});
addPage({
  file: 'styles/token-translator.html', url: 'styles/token-translator.html', title: 'Token Translator', section: 'Styles',
  sectionId: 'styles', activeHref: 'styles/token-translator.html', prefix: '../',
  body: `
<p class="breadcrumbs">Styles</p>
<h1>Token translator</h1>
<p class="lede">Paste in CSS and see which published tokens your values already match.</p>
<blockquote><p>The translator matches <strong>values</strong>, not intent. It will not decide whether
a colour is "primary" or "warning", which stays a design decision. It never changes your code, and
<strong>nothing leaves your browser</strong>. Always review flagged items before applying them.</p></blockquote>
<p>Paste CSS, or any text containing hex colours and px spacing, then match it against the published tokens.</p>
<textarea id="src" rows="8" placeholder="e.g.  color: #325083;  padding: 15px;  border: 1px solid #d8dde0;"></textarea>
<div class="showcase__toolbar" style="border:0;background:none;padding:12px 0">
  <button id="run" class="sr-button sr-button--primary sr-button--default" type="button">Match to tokens</button>
  <button id="sample" class="sr-button sr-button--ghost sr-button--default" type="button">Load sample</button>
</div>
<div id="report"></div>`,
  extraScript: TRANSLATOR_SCRIPT(colourEntries.map(([k, v]) => ({ n: '--' + k, hex: v })), spaceEntries.map(([k, px]) => ({ n: '--' + k, px }))),
});

addPage({
  file: 'components/button.html', url: 'components/button.html', title: 'Buttons', section: 'Components',
  sectionId: 'components', activeHref: 'components/button.html', prefix: '../',
  body: buttonBody(), extraScript: BUTTON_SCRIPT,
});
addPage({
  file: 'components/table.html', url: 'components/table.html', title: 'Tables', section: 'Components',
  sectionId: 'components', activeHref: 'components/table.html', prefix: '../', body: tableBody(),
});

addPage({
  file: 'components/header.html', url: 'components/header.html', title: 'Header', section: 'Components',
  sectionId: 'components', activeHref: 'components/header.html', prefix: '../',
  body: headerBody(),
});
addPage({
  file: 'components/footer.html', url: 'components/footer.html', title: 'Footer', section: 'Components',
  sectionId: 'components', activeHref: 'components/footer.html', prefix: '../',
  body: footerBody(),
});
addPage({
  file: 'components/breadcrumbs.html', url: 'components/breadcrumbs.html', title: 'Breadcrumbs',
  section: 'Components', sectionId: 'components', activeHref: 'components/breadcrumbs.html',
  prefix: '../', body: breadcrumbsBody(),
});
addPage({
  file: 'components/toggles.html', url: 'components/toggles.html', title: 'Toggles',
  section: 'Components', sectionId: 'components', activeHref: 'components/toggles.html',
  prefix: '../', body: togglesBody(),
});
addPage({
  file: 'components/input.html', url: 'components/input.html', title: 'Input',
  section: 'Components', sectionId: 'components', activeHref: 'components/input.html',
  prefix: '../', body: inputBody(), extraScript: INPUT_SCRIPT,
});
addPage({
  file: 'components/navigation.html', url: 'components/navigation.html', title: 'Navigation',
  section: 'Components', sectionId: 'components', activeHref: 'components/navigation.html',
  prefix: '../', body: navigationBody(),
});
addPage({
  file: 'patterns/patient-banner.html', url: 'patterns/patient-banner.html',
  title: 'Patient Banner', section: 'Patterns',
  sectionId: 'patterns', activeHref: 'patterns/patient-banner.html', prefix: '../',
  body: patientBannerBody(),
});
// ─── Prototypes ───────────────────────────────────────────────────────────────
addPage({
  file: 'prototypes.html', url: 'prototypes.html', title: 'Prototypes', section: 'Prototypes',
  sectionId: 'prototypes', activeHref: 'prototypes.html', prefix: '',
  body: `
<p class="breadcrumbs">Prototypes</p>
<h1>Prototypes</h1>
<p class="lede">Working product prototypes, built entirely from this design system. Each one runs
live in your browser with its full source alongside it, so you can click the flow through and read
the code that produces it.</p>
<div class="cards">
${PROTOTYPES.map((p) => `  <a class="card" href="prototypes/${p.slug}.html"><h3>${p.title}</h3>
    <p>${p.summary}</p>
    <p><strong>Status: ${p.status}</strong></p></a>`).join('\n')}
</div>
<h2>What a prototype is</h2>
<p>A reference implementation of a product's screens, authored by design. Every control comes from
the design system — nothing here restyles a component. If something looks wrong in a prototype, the
design system is wrong, and finding that out is the point.</p>
<p>Prototypes are useful in three ways: they show the design intent running rather than as a static
picture, they give engineering a readable starting template for the UI layer, and they test the
design system against a real product before it reaches production.</p>
<h2>What a prototype is not</h2>
<div class="callout"><p><strong>Do not ship a prototype.</strong> They run on mock data held in
memory, with no API integration, no authentication or authorisation, no error or loading handling,
no tests, and no performance or security review. A prototype is a starting skeleton for the
<strong>user interface layer only</strong> — not a foundation for a deployable application.</p></div>
<h2>Using a prototype</h2>
<p>Each one opens full-screen, with no design-system navigation around it — the bar at its top is
the whole of its chrome: a link back to this page on the left, its name in the middle, and a
Preview/Code toggle on the right. The preview pane runs the prototype; the file tree and editor
behind the Code toggle hold the exact same source, generated fresh from the actual design-system
components every time this website is built. There is no hand-maintained copy to fall out of date.</p>
<h2>Running one locally instead</h2>
<p>Clone the repository and run it from the <strong>repository root</strong>, not the prototype's own
folder — its design-system dependencies are unpublished workspace members, resolved by symlink, so
installing from inside the folder alone will fail.</p>
${PROTOTYPES.map((p) => `<p><strong>${p.title}:</strong></p>
<div class="codepanel"><pre><code>npm install
npm run ${p.startScript}</code></pre></div>`).join('\n')}`,
});

for (const p of PROTOTYPES) {
  addPage({
    file: `prototypes/${p.slug}.html`, url: `prototypes/${p.slug}.html`, title: p.title,
    section: 'Prototypes', sectionId: 'prototypes', activeHref: `prototypes/${p.slug}.html`,
    prefix: '../', bare: true,
    body: `
<h1 class="sr-only">${p.title}</h1>
<div id="sandpack-${p.slug}" class="embed embed--full">
  <p class="embed__loading">Loading the prototype…</p>
</div>
<script type="importmap">
${jsonForScript({
  imports: {
    'react': 'https://esm.sh/react@18',
    'react/': 'https://esm.sh/react@18/',
    'react-dom': 'https://esm.sh/react-dom@18',
    'react-dom/': 'https://esm.sh/react-dom@18/',
    '@codesandbox/sandpack-react': 'https://esm.sh/@codesandbox/sandpack-react@2?deps=react@18,react-dom@18',
  },
})}
</script>
<script type="module">
import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  SandpackProvider, SandpackLayout, SandpackPreview, SandpackCodeEditor, SandpackFileExplorer,
} from '@codesandbox/sandpack-react';

const files = ${jsonForScript(buildSandpackFiles(p))};

function PrototypeEmbed() {
  const [view, setView] = React.useState('preview');
  // Both panels stay mounted the whole time — toggling only their visibility,
  // never unmounting SandpackPreview — because unmounting it drops Sandpack's
  // live bundler connection; remounting it later renders blank until a full
  // page reload re-establishes that connection.
  //
  // SandpackPreview is rendered on its own, outside SandpackLayout, so it can
  // take the full width of its own container: SandpackLayout applies a grid
  // that splits width evenly between however many panels it wraps, which
  // otherwise left the preview stuck at half-width even when the code panel
  // was hidden. The file explorer + editor pairing genuinely wants that grid
  // (to split file tree from code), so only those two stay inside it.
  return React.createElement('div', { className: 'embed__inner' },
    React.createElement('div', { className: 'embed__bar' },
      React.createElement('a', { className: 'embed__back', href: '../prototypes.html' },
        React.createElement('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, 'aria-hidden': 'true' },
          React.createElement('path', { d: 'M15 18l-6-6 6-6' })),
        'Back to design system'),
      React.createElement('p', { className: 'embed__title' }, ${jsonForScript(p.title)}),
      React.createElement('div', { className: 'embed__toggle', role: 'group', 'aria-label': 'View' },
        React.createElement('button', {
          type: 'button', className: view === 'preview' ? 'is-active' : '', onClick: () => setView('preview'),
        }, 'Preview'),
        React.createElement('button', {
          type: 'button', className: view === 'code' ? 'is-active' : '', onClick: () => setView('code'),
        }, 'Code'))),
    // initMode 'immediate' is required, not a preference. Sandpack defaults to
    // 'lazy', which starts the bundler only when an IntersectionObserver on
    // sandpack.lazyAnchorRef fires. That single ref is attached to every
    // SandpackLayout, so with two layouts here it ends up on whichever mounted
    // last — the hidden Code panel. An observer on a display:none element never
    // fires, so the bundler never started and Preview stayed blank until you
    // toggled to Code (making it visible) and back.
    React.createElement(SandpackProvider, {
      template: 'react', files, options: { activeFile: '/App.js', initMode: 'immediate' },
    },
      // Sizing lives entirely in site.css (.embed__panel and below) rather than
      // in inline styles here — Sandpack's height comes from its own
      // --sp-layout-height custom property, which needs a definite parent to
      // resolve against, so it can't be fixed by inline heights alone.
      // SandpackPreview stays inside its own SandpackLayout: that is where
      // --sp-layout-height takes effect. It is the sole child, so there is no
      // width-split with anything else.
      React.createElement('div', { className: 'embed__panel' + (view === 'preview' ? '' : ' is-hidden') },
        React.createElement(SandpackLayout, null,
          React.createElement(SandpackPreview, {
            showOpenInCodeSandbox: false, showRefreshButton: true,
          }))),
      React.createElement('div', { className: 'embed__panel embed__panel--code' + (view === 'code' ? '' : ' is-hidden') },
        React.createElement(SandpackLayout, null,
          React.createElement(SandpackFileExplorer, null),
          React.createElement(SandpackCodeEditor, { showTabs: true, showLineNumbers: true })))));
}

createRoot(document.getElementById('sandpack-${p.slug}')).render(React.createElement(PrototypeEmbed));
</script>`,
  });
}

addPage({
  file: 'contributions.html', url: 'contributions.html', title: 'Contributions', section: 'Contributions',
  sectionId: 'contributions', activeHref: 'contributions.html', prefix: '',
  body: `
<p class="breadcrumbs">Contributions</p>
<h1>Contributing</h1>
<p class="lede">Two separate channels. Pick by intent, so your request lands in the right queue.</p>
<div class="cards">
  <a class="card" href="${REPORT_ISSUE_URL}" target="_blank" rel="noopener">${cardIcon('status/flagged')}<h3>Report an issue</h3>
    <p>Something is broken, wrong, or inaccessible on this site, in a component, or in the
    guidance.</p></a>
  <a class="card" href="${CONTRIBUTION_URL}" target="_blank" rel="noopener">${cardIcon('action/add')}<h3>Request a component or change</h3>
    <p>A new component, variant or token, or a change to one that already exists.</p></a>
</div>
<div class="callout"><p>Both links are placeholders until the final form addresses are supplied.</p></div>
<h2>Before you request a new component</h2>
<ul>
  <li>Check <a href="https://design-system.service.gov.uk/components/" target="_blank" rel="noopener">GDS</a> and
    <a href="https://service-manual.nhs.uk/design-system/components" target="_blank" rel="noopener">NHS England</a>.
    We align with them before inventing something new.</li>
  <li>Run your product values through the <a href="styles/token-translator.html">token translator</a>.
    Many needs that look new turn out to be tokens we already publish.</li>
  <li>Describe the user need and where it occurs, not just the control you have in mind. That is what
    lets the request be assessed against everything else in the queue.</li>
</ul>`,
});

// ─── site script: search, framework tabs, copy, language toggle ───────────────
const SITE_JS = `/* Site chrome behaviour. No dependencies. */
(function(){
  var prefix = window.__PREFIX__ || '';

  /* ── framework tabs + copy ───────────────────────────────────────────── */
  function wire(scope){
    scope.querySelectorAll('.codepanel__tab').forEach(function(tab){
      if(tab.__wired) return; tab.__wired = true;
      tab.addEventListener('click', function(){
        var id = tab.dataset.target;
        var snips = (window.__snips || {})[id] || {};
        tab.parentNode.querySelectorAll('.codepanel__tab').forEach(function(t){
          t.classList.remove('is-active'); t.setAttribute('aria-selected','false');
        });
        tab.classList.add('is-active'); tab.setAttribute('aria-selected','true');
        var code = document.getElementById(id + '-code');
        if(code) code.textContent = snips[tab.dataset.fw] || '';
      });
    });
    scope.querySelectorAll('.codepanel__copy').forEach(function(btn){
      if(btn.__wired) return; btn.__wired = true;
      btn.addEventListener('click', function(){
        var code = document.getElementById(btn.dataset.copy + '-code');
        if(code && navigator.clipboard) navigator.clipboard.writeText(code.textContent);
        btn.textContent = 'Copied'; setTimeout(function(){ btn.textContent = 'Copy code'; }, 1200);
      });
    });
  }
  window.__wireCode = wire;
  wire(document);

  /* ── language toggle (stub until Welsh content lands) ────────────────── */
  var langBtn = document.getElementById('lang');
  if(langBtn){
    langBtn.addEventListener('click', function(){
      var root = document.documentElement;
      var cy = root.getAttribute('lang') === 'cy';
      root.setAttribute('lang', cy ? 'en' : 'cy');
      langBtn.setAttribute('aria-pressed', String(!cy));
      langBtn.querySelector('span').textContent = cy ? langBtn.dataset.en : langBtn.dataset.cy;
      langBtn.title = cy ? '' : 'Welsh content is in progress, showing English for now';
    });
  }

  /* ── search ──────────────────────────────────────────────────────────── */
  var input = document.getElementById('site-search');
  var panel = document.getElementById('search-results');
  var index = window.__SEARCH__ || [];
  if(!input || !panel) return;
  var results = [], cursor = -1;

  function score(entry, q){
    var t = entry.t.toLowerCase(), s = (entry.s||'').toLowerCase(), x = entry.x.toLowerCase();
    if(t === q) return 100;
    if(t.indexOf(q) === 0) return 80;
    if(t.indexOf(q) > -1) return 60;
    if(entry.h.some(function(h){ return h.toLowerCase().indexOf(q) > -1; })) return 40;
    if(s.indexOf(q) > -1) return 20;
    if(x.indexOf(q) > -1) return 10;
    return 0;
  }
  function snippet(entry, q){
    var i = entry.x.toLowerCase().indexOf(q);
    if(i < 0) return entry.s;
    var start = Math.max(0, i - 30);
    return (start ? '…' : '') + entry.x.slice(start, start + 90).trim() + '…';
  }
  function close(){
    panel.hidden = true; input.setAttribute('aria-expanded','false'); cursor = -1;
  }
  function render(q){
    if(q.length < 2){ close(); return; }
    results = index.map(function(e){ return { e: e, n: score(e, q) }; })
      .filter(function(r){ return r.n > 0; })
      .sort(function(a,b){ return b.n - a.n; })
      .slice(0, 8).map(function(r){ return r.e; });
    if(!results.length){
      panel.innerHTML = '<p class="search__empty">No results for "' +
        q.replace(/&/g,'&amp;').replace(/</g,'&lt;') + '".</p>';
    } else {
      panel.innerHTML = results.map(function(e, i){
        return '<a class="search__result" role="option" aria-selected="false" id="sr-opt-' + i + '" href="' +
          prefix + e.u + '"><strong>' + e.t + '</strong><span>' + snippet(e, q) + '</span></a>';
      }).join('');
    }
    panel.hidden = false; input.setAttribute('aria-expanded','true'); cursor = -1;
  }
  function move(step){
    var opts = panel.querySelectorAll('.search__result');
    if(!opts.length) return;
    if(cursor > -1) opts[cursor].classList.remove('is-active');
    cursor = (cursor + step + opts.length) % opts.length;
    opts[cursor].classList.add('is-active');
    opts[cursor].setAttribute('aria-selected','true');
    input.setAttribute('aria-activedescendant', opts[cursor].id);
  }
  input.addEventListener('input', function(){ render(input.value.trim().toLowerCase()); });
  input.addEventListener('keydown', function(e){
    if(e.key === 'ArrowDown'){ e.preventDefault(); move(1); }
    else if(e.key === 'ArrowUp'){ e.preventDefault(); move(-1); }
    else if(e.key === 'Enter'){
      var opts = panel.querySelectorAll('.search__result');
      if(cursor > -1 && opts[cursor]){ e.preventDefault(); window.location.href = opts[cursor].href; }
      else if(opts.length){ e.preventDefault(); window.location.href = opts[0].href; }
    }
    else if(e.key === 'Escape'){ close(); input.blur(); }
  });
  document.addEventListener('click', function(e){
    if(!e.target.closest('.search')) close();
  });
})();
`;

// ─── build ────────────────────────────────────────────────────────────────────
rmSync(DIST, { recursive: true, force: true });
mkdirSync(resolve(DIST, 'assets'), { recursive: true });
mkdirSync(resolve(DIST, 'styles'), { recursive: true });
mkdirSync(resolve(DIST, 'components'), { recursive: true });
mkdirSync(resolve(DIST, 'patterns'), { recursive: true });
mkdirSync(resolve(DIST, 'prototypes'), { recursive: true });

for (const f of ['fonts.css', 'tokens.css', 'typography.css']) copyFileSync(resolve(TOKENS, 'css', f), resolve(DIST, 'assets', f));
for (const c of SITE_COMPONENT_CSS) {
  const from = resolve(ROOT, 'packages', 'web', 'src', c, `${c}.css`);
  if (!existsSync(from)) {
    throw new Error(`SITE_COMPONENT_CSS lists "${c}" but packages/web/src/${c}/${c}.css does not exist.`);
  }
  copyFileSync(from, resolve(DIST, 'assets', `${c}.css`));
}
copyFileSync(resolve(ROOT, 'packages', 'icons', 'src', 'icon.css'), resolve(DIST, 'assets', 'icon.css'));
copyFileSync(resolve(ROOT, 'figma', 'assets', 'dhcw-logo-white.png'), resolve(DIST, 'assets', 'dhcw-logo-white.png'));

/* The distributable web assets, served from the site so a developer can take
   the files without cloning the repository or waiting on an npm registry.
   Built by packages/web/build.mjs; `npm run build:site` runs it first. */
const WEB_DIST = resolve(ROOT, 'packages', 'web', 'dist');
if (!existsSync(resolve(WEB_DIST, 'single-record.css'))) {
  throw new Error(
    'packages/web/dist is missing. Run `npm run build:web` (or `npm run build:site`, '
    + 'which runs it) before building the website.'
  );
}
mkdirSync(resolve(DIST, 'downloads', 'components'), { recursive: true });
for (const f of readdirSync(WEB_DIST)) {
  if (f === 'components') continue;
  copyFileSync(resolve(WEB_DIST, f), resolve(DIST, 'downloads', f));
}
for (const f of readdirSync(resolve(WEB_DIST, 'components'))) {
  copyFileSync(resolve(WEB_DIST, 'components', f), resolve(DIST, 'downloads', 'components', f));
}
writeFileSync(resolve(DIST, 'assets', 'site.css'), readFileSync(resolve(__dirname, 'site.css'), 'utf8'));
writeFileSync(resolve(DIST, 'assets', 'site.js'), SITE_JS);

// Search index, derived from the rendered body of every page.
const stripTags = (html) => html
  .replace(/<script[\s\S]*?<\/script>/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/\s+/g, ' ')
  .trim();

const searchIndex = pages.map((p) => ({
  t: p.title,
  s: p.section,
  u: p.url,
  h: (p.body.match(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/g) || []).map((h) => stripTags(h)),
  x: stripTags(p.body).slice(0, 1200),
}));
if (snippetProblems.length) {
  console.error(`\n${snippetProblems.length} code snippet problem(s):\n`);
  for (const p of snippetProblems) console.error(`  ${p}`);
  console.error(
    '\nReact snippets are checked against each component\'s own props; MAUI snippets\n'
    + 'against the resources @dhcw/sr-maui ships. Fix the snippet, or the component if\n'
    + 'the snippet is what we meant to ship.\n'
  );
  process.exit(1);
}

writeFileSync(resolve(DIST, "assets", "search-index.js"), `window.__SEARCH__=${jsonForScript(searchIndex)};`);

for (const p of pages) {
  const html = p.bare
    ? bareShell({ title: p.title, prefix: p.prefix, body: p.body, extraScript: p.extraScript })
    : shell({
        title: p.title, prefix: p.prefix, sectionId: p.sectionId, activeHref: p.activeHref,
        body: p.body, extraScript: p.extraScript,
      });
  writeFileSync(resolve(DIST, p.file), html);
}

console.log('Website built to', DIST);
console.log('Pages:', pages.length, '| search entries:', searchIndex.length);
console.log('Tokens available:', colourEntries.length, 'colours,', spaceEntries.length, 'space,', radiusEntries.length, 'radius');
