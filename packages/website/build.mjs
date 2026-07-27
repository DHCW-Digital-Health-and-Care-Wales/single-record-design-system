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
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const TOKENS = resolve(ROOT, 'packages', 'tokens', 'build');
const DIST = resolve(__dirname, 'dist');

// ── Intake URLs. Replace when the final forms are supplied. ───────────────────
const REPORT_ISSUE_URL = 'https://forms.office.com/REPLACE-with-report-an-issue-form'; // Microsoft Forms
const CONTRIBUTION_URL = 'https://dev.azure.com/REPLACE-with-azure-devops-intake';     // component / change requests
const STORYBOOK_URL = 'storybook/index.html'; // reachable, not in the primary nav

// ─── Markdown → HTML (subset used by our guideline docs) ──────────────────────
function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function inline(s) {
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
  text = text.replace(/[ \t]*·?[ \t]*DHCW UI Standards[^.\n]*/g, '');

  // 4. Leftover inline file references.
  text = text.replace(/[ \t]*`[^`\n]*\.(?:md|json)`/g, '');

  // 5. Em dashes are not used anywhere on this site.
  text = text.replace(/[ \t]*—[ \t]*/g, ', ');

  // 6. Tidy the punctuation left behind by the removals.
  text = text.replace(/\(\s*\)/g, '');
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
    const isHeading = /^#{1,6}\s/.test(src[j]);
    if (isHeading) {
      let k = j + 1;
      while (k < src.length && (!src[k].trim() || /^---+\s*$/.test(src[k]))) k++;
      if (k >= src.length || /^#{1,6}\s/.test(src[k])) continue; // nothing under it
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
const SECTIONS = [
  {
    id: 'get-started', label: 'Get Started', href: 'index.html',
    side: [
      { href: 'index.html', label: 'SR Design System' },
      { href: 'how-to-use.html', label: 'How to use' },
      { href: 'figma.html', label: 'Using figma' },
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
    id: 'components', label: 'Components', href: 'components/button.html',
    side: [
      { href: 'components/button.html', label: 'Buttons' },
      { href: 'components/table.html', label: 'Tables' },
    ],
  },
  { id: 'patterns', label: 'Patterns', href: 'patterns.html' },
  { id: 'pages', label: 'Pages', href: 'pages.html' },
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
        <p class="sidebar__title">${section.label}</p>
        ${section.side.map((n) =>
          `<a href="${prefix + n.href}"${n.href === activeHref ? ' aria-current="page"' : ''}>${n.label}</a>`).join('')}
       </nav>`
    : '';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} | Single Record Design System</title>
<link rel="stylesheet" href="${prefix}assets/tokens.css">
<link rel="stylesheet" href="${prefix}assets/typography.css">
<link rel="stylesheet" href="${prefix}assets/button.css">
<link rel="stylesheet" href="${prefix}assets/table.css">
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

// ─── shared building blocks ───────────────────────────────────────────────────
// Framework tabs: one order and one treatment on every page.
const FRAMEWORKS = ['HTML', 'React', 'Blazor', 'MAUI'];

/** JSON for embedding inside a <script> block: `<` is escaped so a snippet
 *  containing `</script>` can never terminate the tag early. */
const jsonForScript = (v) => JSON.stringify(v).replace(/</g, '\\u003c');

/** Dark code panel with framework tabs and a copy button. */
function codePanel(id, snippets) {
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

/** White preview area with the dark code panel attached beneath it. */
function showcase(previewHtml, id, snippets) {
  return `<section class="showcase">
  <div class="showcase__preview">${previewHtml}</div>
  ${codePanel(id, snippets)}
</section>`;
}

// Accessibility table: locked column structure, SR-specific content per row.
function accessibilityTable(rows) {
  const head = `<thead><tr><th>Requirement</th><th>WCAG SC</th><th>How Single Record meets it</th><th>Test method</th></tr></thead>`;
  const body = rows.map((r) =>
    `<tr><td>${inline(r.req)}</td><td>${inline(r.sc)}</td><td>${inline(r.how)}</td><td>${inline(r.test)}</td></tr>`).join('');
  return `<h2>Accessibility</h2><div class="table-wrap"><table class="a11y-table">${head}<tbody>${body}</tbody></table></div>`;
}

// ─── page registry (drives both the output files and the search index) ────────
const pages = [];
function addPage({ file, url, title, section, sectionId, activeHref, prefix, body, extraScript = '' }) {
  pages.push({ file, url, title, section, sectionId, activeHref, prefix, body, extraScript });
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
    MAUI: `<!-- MAUI renders the Blazor component through Blazor Hybrid. -->
<SrHeading Size="HeadingSize.Xl" Level="1">Patient summary</SrHeading>`,
  };

  const labelSpecimen = `
<div class="sr-type-label" style="margin:0 0 4px">NHS number</div>
<div class="sr-type-body-m" style="margin:0 0 16px">485 777 3456</div>
<div class="sr-type-label" style="margin:0 0 4px">Date of birth</div>
<div class="sr-type-caption" style="margin:0">Use the format 06-Dec-1974</div>`;
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
    MAUI: `<!-- MAUI renders the Blazor component through Blazor Hybrid. -->
<SrLabel For="nhs-number">NHS number</SrLabel>`,
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
<p class="sr-type-caption">Last updated 06-Dec-2024 at 14:22</p>`,
    React: `<Text size="m">Long-form reading and clinical notes.</Text>
<Text size="s">Primary content in tables and data-dense views.</Text>
<Text size="caption">Last updated 06-Dec-2024 at 14:22</Text>`,
    Blazor: `<SrText Size="TextSize.M">Long-form reading and clinical notes.</SrText>
<SrText Size="TextSize.S">Primary content in tables and data-dense views.</SrText>
<SrText Size="TextSize.Caption">Last updated 06-Dec-2024 at 14:22</SrText>`,
    MAUI: `<!-- MAUI renders the Blazor component through Blazor Hybrid. -->
<SrText Size="TextSize.S">Primary content in tables and data-dense views.</SrText>`,
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
    MAUI: `<!-- MAUI renders the Blazor component through Blazor Hybrid. -->
<SrHeading Level="2" Size="HeadingSize.S">Allergies and adverse reactions</SrHeading>`,
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
    MAUI: `<!-- MAUI renders the Blazor component through Blazor Hybrid. -->
<SrLink Href="/medication">current medication list</SrLink>`,
  };

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
    MAUI: `<!-- MAUI renders the Blazor component through Blazor Hybrid. -->
<SrList Size="TextSize.M" Items="@medications" />`,
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
${codePanel('type-links', linkSnippets)}

<h2>Lists</h2>
<p>Lists inherit the body styles, so pick the body size that matches the surrounding content and
apply it to the list. Use an unordered list where the order does not matter, such as a list of
current medications, and an ordered list for steps that must happen in sequence.</p>
<p>Keep list items short. If an item runs past two lines, it is usually a paragraph or a
sub-heading with content under it, not a list item.</p>
${codePanel('type-lists', listSnippets)}

<h2>Section break</h2>
<p>Use a horizontal rule to separate distinct groups of content, for example between a patient
banner and the record beneath it. The rule uses the default border token so it stays quiet
against the page.</p>
<p>Use section breaks sparingly. In a record view, whitespace and headings usually do the job
better, and too many rules make a screen look busier than it is.</p>
${codePanel('type-section-break', {
    HTML: `<hr>\n\n<!-- Where the break is structural but should not be seen,\n     use spacing instead of a visible rule. -->\n<div style="margin-block: var(--space-6)"></div>`,
    React: `<Divider />\n<Divider visible={false} />`,
    Blazor: `<SrDivider />\n<SrDivider Visible="false" />`,
    MAUI: `<!-- MAUI renders the Blazor component through Blazor Hybrid. -->\n<SrDivider />`,
  })}

<h2>Text alignment</h2>
<p>Align text left. Left-aligned text gives every line the same starting point, which is what
makes a column of text or a table of values quick to scan, and it is easier to read for users
with dyslexia. Do not justify text: justification creates uneven word spacing and rivers of
white space that make reading harder.</p>
<p>The one exception is numeric table columns, where right-aligning the values lets users
compare magnitudes down the column. Right-align the column heading to match the values beneath
it. Never centre body text or table content.</p>
${codePanel('type-alignment', {
    HTML: `<!-- Text columns: left aligned, which is the default. -->\n<td class="sr-table__cell">Atorvastatin 20mg</td>\n\n<!-- Numeric columns: right aligned, heading matches the values. -->\n<th scope="col" class="sr-table__cell--numeric">Dose (mg)</th>\n<td class="sr-table__cell sr-table__cell--numeric">20</td>`,
    React: `<Table.Column field="medication" />\n<Table.Column field="dose" align="right" />`,
    Blazor: `<SrTableColumn Field="medication" />\n<SrTableColumn Field="dose" Align="Align.Right" />`,
    MAUI: `<!-- MAUI renders the Blazor component through Blazor Hybrid. -->\n<SrTableColumn Field="dose" Align="Align.Right" />`,
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
    MAUI: `<!-- MAUI renders the Blazor component through Blazor Hybrid. -->\n<!-- XAML resources map to the same semantic names. -->\n<Setter Property="BackgroundColor" Value="{StaticResource SrColorSurfaceSectionCards}" />`,
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
    MAUI: `<!-- MAUI renders the Blazor component through Blazor Hybrid, -->\n<!-- so it inherits the same focus treatment. -->`,
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
      React:'<Button variant="'+v+'"'+(size!=='default'?' size="'+size+'"':'')+'>Confirm patient</Button>',
      Blazor:'<SrButton Type="ButtonType.'+T+'"'+(S?' Size="ButtonSize.'+S+'"':'')+'>Confirm patient</SrButton>',
      MAUI:'<!-- MAUI renders the Blazor component through Blazor Hybrid. -->\\n<SrButton Type="ButtonType.'+T+'">Confirm patient</SrButton>'
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
  const tableMd = publicise(readFileSync(resolve(ROOT, 'components', 'table', 'guidelines.md'), 'utf8'));
  const demo = `
<div class="sr-table-wrap">
  <table class="sr-table">
    <thead class="sr-table__head"><tr>
      <th scope="col">No.</th><th scope="col">Patient</th><th scope="col">NHS number</th><th scope="col">DoB</th><th scope="col">Status</th>
    </tr></thead>
    <tbody>
      <tr class="sr-table__row"><td class="sr-table__cell">1</td><td class="sr-table__cell">JONES, Alis</td><td class="sr-table__cell">123 456 7890</td><td class="sr-table__cell">06-Dec-1974</td><td class="sr-table__cell">Confirmed</td></tr>
      <tr class="sr-table__row sr-table__row--selected"><td class="sr-table__cell">2</td><td class="sr-table__cell">OWEN, Rhys</td><td class="sr-table__cell">234 567 8901</td><td class="sr-table__cell">14-Mar-1988</td><td class="sr-table__cell">In review</td></tr>
      <tr class="sr-table__row"><td class="sr-table__cell">3</td><td class="sr-table__cell">PATEL, Nia</td><td class="sr-table__cell">345 678 9012</td><td class="sr-table__cell">02-Jul-1991</td><td class="sr-table__cell">Draft</td></tr>
    </tbody>
  </table>
</div>`;
  const snippets = {
    HTML: '<div class="sr-table-wrap">\n  <table class="sr-table">\n    <thead class="sr-table__head">…</thead>\n    <tbody>\n      <tr class="sr-table__row sr-table__row--selected">…</tr>\n    </tbody>\n  </table>\n</div>',
    React: '<SrTable\n  columns={columns}\n  rows={rows}\n  selectedId={activePatientId}\n/>',
    Blazor: '<SrTable Items="@patients" SelectedId="@activePatientId" />',
    MAUI: '<!-- MAUI renders the Blazor component through Blazor Hybrid. -->\n<SrTable Items="@patients" SelectedId="@activePatientId" />',
  };
  return `
<p class="breadcrumbs">Components</p>
${showcase(demo, 'table', snippets)}
<p class="muted">Row 2 shows the selected state; hover any row to see the hover surface. Dates use
the <code>dd-Mmm-yyyy</code> format, and the header uses the <code>No.</code> abbreviation exception.</p>
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
  <a class="card" href="styles/typography.html"><h3>Styles</h3><p>Typography, colour, spacing, and the token translator.</p></a>
  <a class="card" href="components/button.html"><h3>Components</h3><p>Buttons and tables, with live previews and framework code.</p></a>
  <a class="card" href="figma.html"><h3>Figma &amp; catalogue</h3><p>The Figma library and the component catalogue.</p></a>
  <a class="card" href="contributions.html"><h3>Contribute</h3><p>Report an issue or request a component or change.</p></a>
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

<h2>Check your work against the tokens</h2>
<p>If you are bringing an existing screen into the system, paste its CSS into the
<a href="styles/token-translator.html">token translator</a>. It matches the colours and spacing you
already use against the published tokens and shows you what is an exact match, what is close enough
to review, and what has no equivalent yet.</p>

<h2>Frameworks</h2>
<p>Every code sample is shown for the four supported targets, in the same order: HTML, React, Blazor
and MAUI. HTML is the reference implementation; the others wrap the same markup and tokens. MAUI
renders the Blazor components through Blazor Hybrid, so a component behaves the same on desktop and
mobile as it does on the web.</p>

<h2>If something is missing or wrong</h2>
<p>Use <a href="${REPORT_ISSUE_URL}" target="_blank" rel="noopener">Report an issue</a> for anything
broken, incorrect or inaccessible. Use
<a href="contributions.html">Contributions</a> if you need a component, variant or token that does
not exist yet.</p>`,
});

addPage({
  file: 'figma.html', url: 'figma.html', title: 'Using figma', section: 'Get Started',
  sectionId: 'get-started', activeHref: 'figma.html', prefix: '',
  body: `
<p class="breadcrumbs">Get Started</p>
<h1>Using figma</h1>
<p class="lede">The Single Record Figma library is the canonical source for variables, components and
usage notes. Its variables build to the same tokens this website consumes.</p>
<div class="cards">
  <a class="card" href="${STORYBOOK_URL}"><h3>Component catalogue</h3><p>Every reference component, rendered with all of its variants and controls.</p></a>
</div>
<h2>Working with the library</h2>
<ul>
  <li>Design in Figma first, and document the component before it is built.</li>
  <li>Use the existing icon components rather than pasting in vector shapes, so icons stay
  consistent and can be restyled from tokens.</li>
  <li>Bind colour, spacing and type to variables. A value typed in by hand will not survive a token
  change.</li>
  <li>Token names follow <code>{tier}.{category}.{variant}</code>, for example
  <code>color.interactive.primary</code>.</li>
</ul>
<h2>Keeping design and code in step</h2>
<p>Changes to variables in Figma flow into the published token artifact, and this site rebuilds from
that artifact. If a value here does not match what you see in Figma, the token has not been
published yet. Report it rather than working around it.</p>`,
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
    <h2>Radius</h2><div class="radii">${radiusSamples}</div>`,
});
addPage({
  file: 'styles/icons.html', url: 'styles/icons.html', title: 'Icons', section: 'Styles',
  sectionId: 'styles', activeHref: 'styles/icons.html', prefix: '../',
  body: plannedBody({
    title: 'Icons', crumb: 'Styles', prefix: '../',
    intro: 'The Single Record icon set and the colour and size tokens that control it.',
    links: [{ href: STORYBOOK_URL, label: 'Component catalogue', note: 'browse how icons are used inside components' }],
  }),
});
addPage({
  file: 'styles/grids.html', url: 'styles/grids.html', title: 'Grids', section: 'Styles',
  sectionId: 'styles', activeHref: 'styles/grids.html', prefix: '../',
  body: plannedBody({
    title: 'Grids', crumb: 'Styles',
    intro: 'Layout grid and breakpoints for Single Record products.',
    links: [{ href: 'https://service-manual.nhs.uk/design-system/styles/layout', label: 'NHS England layout', note: 'the upstream grid guidance we build on' }],
  }),
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
  file: 'patterns.html', url: 'patterns.html', title: 'Patterns', section: 'Patterns',
  sectionId: 'patterns', activeHref: 'patterns.html', prefix: '',
  body: plannedBody({
    title: 'Patterns', crumb: 'Patterns',
    intro: 'Composed, multi-component interactions such as the patient banner, forms, search and sign-off flows.',
    links: [{ href: 'https://service-manual.nhs.uk/design-system/patterns', label: 'NHS England patterns', note: 'the reference patterns we adapt' }],
  }),
});
addPage({
  file: 'pages.html', url: 'pages.html', title: 'Pages', section: 'Pages',
  sectionId: 'pages', activeHref: 'pages.html', prefix: '',
  body: plannedBody({
    title: 'Pages', crumb: 'Pages',
    intro: 'Whole-page templates assembled from patterns and components.',
  }),
});

addPage({
  file: 'contributions.html', url: 'contributions.html', title: 'Contributions', section: 'Contributions',
  sectionId: 'contributions', activeHref: 'contributions.html', prefix: '',
  body: `
<p class="breadcrumbs">Contributions</p>
<h1>Contributing</h1>
<p class="lede">Two separate channels. Pick by intent, so your request lands in the right queue.</p>
<div class="cards">
  <a class="card" href="${REPORT_ISSUE_URL}" target="_blank" rel="noopener"><h3>Report an issue</h3>
    <p>Something is broken, wrong, or inaccessible on this site, in a component, or in the
    guidance.</p></a>
  <a class="card" href="${CONTRIBUTION_URL}" target="_blank" rel="noopener"><h3>Request a component or change</h3>
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

for (const f of ['tokens.css', 'typography.css']) copyFileSync(resolve(TOKENS, 'css', f), resolve(DIST, 'assets', f));
copyFileSync(resolve(ROOT, 'packages', 'web', 'src', 'button', 'button.css'), resolve(DIST, 'assets', 'button.css'));
copyFileSync(resolve(ROOT, 'packages', 'web', 'src', 'table', 'table.css'), resolve(DIST, 'assets', 'table.css'));
copyFileSync(resolve(ROOT, 'figma', 'assets', 'dhcw-logo-white.png'), resolve(DIST, 'assets', 'dhcw-logo-white.png'));
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
writeFileSync(resolve(DIST, "assets", "search-index.js"), `window.__SEARCH__=${jsonForScript(searchIndex)};`);

for (const p of pages) {
  writeFileSync(resolve(DIST, p.file), shell({
    title: p.title, prefix: p.prefix, sectionId: p.sectionId, activeHref: p.activeHref,
    body: p.body, extraScript: p.extraScript,
  }));
}

console.log('Website built to', DIST);
console.log('Pages:', pages.length, '| search entries:', searchIndex.length);
console.log('Tokens available:', colourEntries.length, 'colours,', spaceEntries.length, 'space,', radiusEntries.length, 'radius');
