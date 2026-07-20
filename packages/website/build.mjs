/**
 * DHCW Single Record Design System — website build.
 *
 * A real implementation of the design system: every page consumes the BUILT
 * token artifact (packages/tokens/build) and the actual reference component CSS
 * (packages/web/src). No colour/size/space is ever hardcoded. Zero runtime deps.
 *
 * IA (DDR-016 rev.): two-level navigation —
 *   Top nav:  Get Started · Styles · Components · Patterns · Pages · Figma · Contributions
 *   Sidebar:  per-section pages (Styles, Components)
 * Header:  NHS Wales logo · Report an issue (MS Forms) · Cymraeg toggle (stub).
 * Storybook is not in the nav but stays reachable at /storybook (linked from Figma).
 */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const TOKENS = resolve(ROOT, 'packages', 'tokens', 'build');
const DIST = resolve(__dirname, 'dist');

// ── Placeholder intake URLs (point 4). Replace when supplied. ──────────────────
const REPORT_ISSUE_URL = 'https://forms.office.com/REPLACE-with-report-an-issue-form'; // MS Forms — bug / issue reports
const CONTRIBUTION_URL = 'https://dev.azure.com/REPLACE-with-azure-devops-intake';      // Azure DevOps — component / change requests
const STORYBOOK_URL = 'storybook/index.html'; // reachable, not in nav

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
// Top-level sections. `side` lists sidebar pages; `href` is the section landing.
const SECTIONS = [
  { id: 'get-started', label: 'Get Started', href: 'index.html' },
  {
    id: 'styles', label: 'Styles', href: 'styles/typography.html',
    side: [
      { href: 'styles/typography.html', label: 'Typography' },
      { href: 'styles/colour.html', label: 'Colours' },
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
  { id: 'figma', label: 'Figma', href: 'figma.html' },
  { id: 'contributions', label: 'Contributions', href: 'contributions.html' },
];

const LOGO = readFileSync(resolve(__dirname, 'static', 'nhs-wales-logo.svg'), 'utf8').replace(/\n\s*/g, '');

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
<title>${title} — Single Record Design System</title>
<link rel="stylesheet" href="${prefix}assets/tokens.css">
<link rel="stylesheet" href="${prefix}assets/typography.css">
<link rel="stylesheet" href="${prefix}assets/tokens-dark.css">
<link rel="stylesheet" href="${prefix}assets/button.css">
<link rel="stylesheet" href="${prefix}assets/table.css">
<link rel="stylesheet" href="${prefix}assets/site.css">
${extraHead}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="masthead">
  <div class="masthead__inner">
    <a class="masthead__brand" href="${prefix}index.html" aria-label="Single Record Design System — home">
      ${LOGO}
      <span class="masthead__brandtext">Single Record<br>Design System</span>
    </a>
    <div class="masthead__actions">
      <a class="masthead__link" href="${REPORT_ISSUE_URL}" target="_blank" rel="noopener">Report an issue</a>
      <button id="lang" class="lang-toggle" type="button" aria-pressed="false" data-en="Cymraeg" data-cy="English">Cymraeg</button>
      <button id="theme" class="theme-toggle" type="button" aria-pressed="false">Dark</button>
    </div>
  </div>
  <nav class="primary-nav" aria-label="Primary">${topnav}</nav>
</header>
<div class="layout">
  ${sidebar}
  <main id="main" class="content">
${body}
  </main>
</div>
<footer class="site-footer">
  <p>DHCW Single Record Design System · rendered from the built design tokens and reference components.
     <a href="${prefix}contributions.html">Contribute or request a component</a>.</p>
</footer>
<script>
  var themeBtn = document.getElementById('theme'), root = document.documentElement;
  themeBtn.addEventListener('click', function(){
    var dark = root.getAttribute('data-theme') === 'dark';
    root.setAttribute('data-theme', dark ? 'light' : 'dark');
    themeBtn.setAttribute('aria-pressed', String(!dark));
    themeBtn.textContent = dark ? 'Dark' : 'Light';
  });
  // Welsh toggle — stub. Flips the label + lang attribute; content parity is tracked
  // separately (CDPS). Falls back to English until translations land.
  var langBtn = document.getElementById('lang');
  langBtn.addEventListener('click', function(){
    var cy = root.getAttribute('lang') === 'cy';
    root.setAttribute('lang', cy ? 'en' : 'cy');
    langBtn.setAttribute('aria-pressed', String(!cy));
    langBtn.textContent = cy ? langBtn.dataset.en : langBtn.dataset.cy;
    if(!cy){ langBtn.title = 'Welsh content is in progress — showing English for now'; }
  });
</script>
${extraScript}
</body>
</html>`;
}

const SITE_CSS = readFileSync(resolve(__dirname, 'site.css'), 'utf8');

// ─── shared building blocks ───────────────────────────────────────────────────
// Framework tabs — identical order + styling everywhere (point 2).
const FRAMEWORKS = ['HTML', 'React', 'Blazor', 'MAUI'];
function frameworkTabs(id, snippets) {
  const tabs = FRAMEWORKS.map((f, idx) =>
    `<button class="switch__btn${idx === 0 ? ' is-active' : ''}" role="tab" data-fw="${f}" data-target="${id}">${f}</button>`).join('');
  return `<div class="switch switch--tabs" role="tablist" aria-label="Framework">${tabs}</div>
    <div class="code"><button class="code__copy" type="button" data-target="${id}">Copy</button>
    <pre><code id="${id}-code">${esc(snippets.HTML)}</code></pre></div>
    <script>window.__snips=window.__snips||{};window.__snips[${JSON.stringify(id)}]=${JSON.stringify(snippets)};</script>`;
}
const FRAMEWORK_SCRIPT = `<script>
(function(){
  document.querySelectorAll('[data-fw]').forEach(function(b){
    b.addEventListener('click', function(){
      var id=b.dataset.target, snips=(window.__snips||{})[id]||{};
      b.parentNode.querySelectorAll('.switch__btn').forEach(function(x){x.classList.remove('is-active');});
      b.classList.add('is-active');
      var code=document.getElementById(id+'-code');
      if(code) code.textContent = snips[b.dataset.fw]||'';
    });
  });
  document.querySelectorAll('.code__copy').forEach(function(btn){
    btn.addEventListener('click', function(){
      var code=document.getElementById(btn.dataset.target+'-code');
      if(code && navigator.clipboard) navigator.clipboard.writeText(code.textContent);
      btn.textContent='Copied'; setTimeout(function(){btn.textContent='Copy';},1200);
    });
  });
})();
</script>`;

// Accessibility table — LOCKED structure (point 5). Content is SR-specific per row.
function accessibilityTable(rows) {
  const head = `<thead><tr><th>Requirement</th><th>WCAG SC</th><th>How Single Record meets it</th><th>Test method</th></tr></thead>`;
  const body = rows.map((r) =>
    `<tr><td>${inline(r.req)}</td><td>${inline(r.sc)}</td><td>${inline(r.how)}</td><td>${inline(r.test)}</td></tr>`).join('');
  return `<h2>Accessibility</h2><div class="table-wrap"><table class="a11y-table">${head}<tbody>${body}</tbody></table></div>`;
}

// ─── Component: Button (playground — 3 axes: variant + size + framework) ───────
function buttonPage() {
  const variants = [
    { id: 'primary', label: 'Primary', cls: 'sr-button--primary' },
    { id: 'secondary', label: 'Secondary', cls: 'sr-button--secondary' },
    { id: 'ghost', label: 'Ghost', cls: 'sr-button--ghost' },
    { id: 'destructive', label: 'Destructive', cls: 'sr-button--destructive' },
  ];
  const sizes = [
    { id: 'small', label: 'Small', cls: 'sr-button--small' },
    { id: 'default', label: 'Default', cls: '' },
    { id: 'large', label: 'Large', cls: 'sr-button--large' },
  ];
  const a11y = accessibilityTable([
    { req: 'Every button has a visible, descriptive label', sc: '2.4.6 / 4.1.2', how: 'Labels name the action and subject (e.g. "Confirm patient"), not "OK".', test: 'Manual review · screen-reader announce' },
    { req: 'Focus is clearly visible', sc: '2.4.7', how: '`Border/Focus` (Cyan/700) ring outside the element, paired with a 2px border (DDR-006).', test: 'Keyboard tab · contrast check' },
    { req: 'Target size adequate', sc: '2.5.8', how: 'Default 40px tall; Small still ≥ 24×24px with spacing. Primary touch controls use 44px.', test: 'Measure · touch device' },
    { req: 'Not colour alone', sc: '1.4.1', how: 'Destructive pairs red with an explicit label and a confirmation step.', test: 'Greyscale review' },
    { req: 'Contrast', sc: '1.4.3', how: 'White on `Interactive/Primary` = 7.1:1 (AAA). Validated per variant.', test: 'Automated contrast' },
  ]);
  const body = `
<p class="breadcrumbs">Components / Buttons</p>
<h1>Buttons</h1>
<p>Buttons let users take an action — submitting a form or confirming a patient. Based on the
GDS button, themed with Single Record tokens and clinical target sizes. Pick the variant, size
and framework; the preview and code update live from the built <code>button.css</code>.</p>

<section class="demo">
  <div class="demo__toolbar">
    <div class="switch" role="group" aria-label="Type">
      ${variants.map((v, idx) => `<button class="switch__btn${idx === 0 ? ' is-active' : ''}" data-variant="${v.id}" data-cls="${v.cls}">${v.label}</button>`).join('')}
    </div>
    <div class="switch" role="group" aria-label="Size">
      ${sizes.map((s) => `<button class="switch__btn${s.id === 'default' ? ' is-active' : ''}" data-size="${s.id}" data-cls="${s.cls}">${s.label}</button>`).join('')}
    </div>
  </div>
  <div class="demo__preview"><button id="preview-btn" class="sr-button sr-button--primary">Confirm patient</button></div>
</section>

<section id="btn-fw"></section>

<h2>When to use</h2>
<ul>
  <li>One <strong>Primary</strong> action per view (submit, confirm).</li>
  <li><strong>Secondary</strong> for supporting actions alongside primary.</li>
  <li><strong>Ghost</strong> for low-emphasis actions (cancel, back).</li>
  <li><strong>Destructive</strong> for permanent deletion — pair with a confirmation dialog.</li>
</ul>
<p>For general button UX (grouping, order, one primary per page), follow
<a href="https://design-system.service.gov.uk/components/button/" target="_blank" rel="noopener">GDS</a> /
<a href="https://service-manual.nhs.uk/design-system/components/buttons" target="_blank" rel="noopener">NHS England</a>.
Single Record specifics: focus ring <code>Border/Focus</code> (Cyan/700, DDR-006); full contract in
<code>components/button/spec.md</code>.</p>
${a11y}`;

  const script = `<script>
(function(){
  var preview=document.getElementById('preview-btn');
  var state={variant:'primary',variantCls:'sr-button--primary',size:'default',sizeCls:''};
  function snippets(){
    var v=state.variant, size=state.size;
    var cls='sr-button sr-button--'+v+(state.sizeCls?' '+state.sizeCls:'');
    var T=v.charAt(0).toUpperCase()+v.slice(1);
    var S=size!=='default'?size.charAt(0).toUpperCase()+size.slice(1):'';
    return {
      HTML:'<button class="'+cls+'">Confirm patient</button>',
      React:'<Button variant="'+v+'"'+(size!=='default'?' size="'+size+'"':'')+'>Confirm patient</Button>',
      Blazor:'<SrButton Type="ButtonType.'+T+'"'+(S?' Size="ButtonSize.'+S+'"':'')+'>Confirm patient</SrButton>',
      MAUI:'<!-- MAUI renders the Blazor component via Blazor Hybrid (DDR-011). -->\\n<SrButton Type="ButtonType.'+T+'">Confirm patient</SrButton>'
    };
  }
  var container=document.getElementById('btn-fw');
  function renderFw(){
    var snips=snippets();
    window.__snips=window.__snips||{}; window.__snips['btn']=snips;
    var active=(container.querySelector('.switch__btn.is-active')||{}).dataset;
    var fw=(active&&active.fw)||'HTML';
    container.innerHTML='<div class="switch switch--tabs" role="tablist" aria-label="Framework">'+
      ['HTML','React','Blazor','MAUI'].map(function(f){return '<button class="switch__btn'+(f===fw?' is-active':'')+'" role="tab" data-fw="'+f+'" data-target="btn">'+f+'</button>';}).join('')+
      '</div><div class="code"><button class="code__copy" type="button" data-target="btn">Copy</button><pre><code id="btn-code"></code></pre></div>';
    document.getElementById('btn-code').textContent=snips[fw];
    container.querySelectorAll('[data-fw]').forEach(function(b){
      b.addEventListener('click', function(){
        container.querySelectorAll('.switch__btn').forEach(function(x){x.classList.remove('is-active');});
        b.classList.add('is-active');
        document.getElementById('btn-code').textContent=window.__snips['btn'][b.dataset.fw];
      });
    });
    container.querySelector('.code__copy').addEventListener('click', function(e){
      if(navigator.clipboard) navigator.clipboard.writeText(document.getElementById('btn-code').textContent);
      e.target.textContent='Copied'; setTimeout(function(){e.target.textContent='Copy';},1200);
    });
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
  return shell({ title: 'Buttons', prefix: '../', sectionId: 'components', activeHref: 'components/button.html', body, extraScript: script });
}

// ─── Component: Table (flat/static — a11y table reused) ────────────────────────
function tablePage() {
  const tableMd = readFileSync(resolve(ROOT, 'components', 'table', 'guidelines.md'), 'utf8');
  const demo = `
<section class="demo">
  <div class="demo__preview demo__preview--wide">
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
    </div>
  </div>
</section>
<p class="muted">Row 2 shows the selected state (<code>Surface/Accent</code>); hover any row to see <code>Surface/Subtle</code>. Dates use <code>dd-Mmm-yyyy</code>; the header uses the <code>No.</code> abbreviation exception.</p>`;
  const snippets = {
    HTML: '<div class="sr-table-wrap">\n  <table class="sr-table">\n    <thead class="sr-table__head">…</thead>\n    <tbody>\n      <tr class="sr-table__row sr-table__row--selected">…</tr>\n    </tbody>\n  </table>\n</div>',
    React: '<SrTable\n  columns={columns}\n  rows={rows}\n  selectedId={activePatientId}\n/>',
    Blazor: '<SrTable Items="@patients" SelectedId="@activePatientId" />',
    MAUI: '<!-- MAUI renders the Blazor component via Blazor Hybrid (DDR-011). -->\n<SrTable Items="@patients" SelectedId="@activePatientId" />',
  };
  const a11y = accessibilityTable([
    { req: 'Semantic table structure', sc: '1.3.1', how: 'Real `<table>`/`<thead>`/`<th scope>`; row-header layout adds `<th scope="row">`.', test: 'Markup review · screen reader' },
    { req: 'Icon-only row actions are named', sc: '4.1.2', how: 'Each action has an `aria-label` naming action + subject ("Edit Jones, Alis"); icons `aria-hidden`.', test: 'Screen-reader announce' },
    { req: 'Selected row not colour alone', sc: '1.4.1', how: 'Selected rows carry a non-colour signal (selection control / left accent), not just `Surface/Accent`.', test: 'Greyscale review' },
    { req: 'Target size for dense actions', sc: '2.5.8', how: '32×32px is a documented dense-desktop exception; promoted to full size on touch/mobile.', test: 'Measure · touch device' },
    { req: 'Focus visible', sc: '2.4.7', how: '`Border/Focus` (Cyan/700) ring on action buttons, outside the element (DDR-006).', test: 'Keyboard tab' },
  ]);
  const body = `
<p class="breadcrumbs">Components / Tables</p>
${demo}
<hr>
${renderMarkdown(tableMd)}
<hr>
<h2>Code</h2>
${frameworkTabs('table', snippets)}
${a11y}`;
  return shell({ title: 'Tables', prefix: '../', sectionId: 'components', activeHref: 'components/table.html', body, extraScript: FRAMEWORK_SCRIPT });
}

// ─── Styles: Token translator (deterministic, client-side, no external calls) ──
function translatorPage() {
  const colourData = colourEntries.map(([k, v]) => ({ n: '--' + k, hex: v }));
  const spaceData = spaceEntries.map(([k, px]) => ({ n: '--' + k, px }));
  const body = `
<p class="breadcrumbs">Styles / Token Translator</p>
<h1>Token translator</h1>
<blockquote><p>The translator matches <strong>values</strong>, not intent. It won't decide whether a
colour is "primary" or "warning" — that stays a design decision. It never changes your code,
and <strong>nothing leaves your browser</strong>. Always review flagged items before applying.</p></blockquote>
<p>Paste CSS (or any text with <code>#hex</code> colours and <code>px</code> spacing). Match against the published tokens.</p>
<textarea id="src" rows="8" placeholder="e.g.  color: #325083;  padding: 15px;  border: 1px solid #d8dde0;"></textarea>
<div class="demo__toolbar"><button id="run" class="sr-button sr-button--primary">Match to tokens</button>
<button id="sample" class="sr-button sr-button--ghost">Load sample</button></div>
<div id="report"></div>`;
  const script = `<script>
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
    return '<h3 class="bucket bucket--'+cls+'">'+title+' ('+rows.length+')</h3><div class="table-wrap"><table><thead><tr><th>Input</th><th>Nearest token</th><th>Note</th></tr></thead><tbody>'+
      rows.map(function(r){
        var sw = r.tokenHex ? '<span class="dot" style="background:'+r.tokenHex+'"></span>' : '';
        return '<tr><td><code>'+esc(r.input)+'</code></td><td>'+sw+'<code>'+esc(r.token)+'</code></td><td>'+esc(r.note)+'</td></tr>';
      }).join('')+'</tbody></table></div>';
  }
  function render(exact, close, none, total){
    var el=document.getElementById('report');
    if(!total){ el.innerHTML='<p>No <code>#hex</code> colours or <code>px</code> values found.</p>'; return; }
    el.innerHTML = bucket('Exact', exact, 'exact') + bucket('Close / review', close, 'close') +
      bucket('No match', none, 'none') +
      '<p class="muted">No-match items should go to a component/token request (Contributions → Azure DevOps). The translator never changes your code.</p>';
  }
  document.getElementById('run').addEventListener('click', run);
  document.getElementById('sample').addEventListener('click', function(){
    document.getElementById('src').value = 'color: #325083;\\nbackground: #f4f5f8;\\nborder: 1px solid #d9dde0;\\npadding: 15px 16px;\\ncolor: #ff4400;';
    run();
  });
})();
</script>`;
  return shell({ title: 'Token translator', prefix: '../', sectionId: 'styles', activeHref: 'styles/token-translator.html', body, extraScript: script });
}

// ─── "Planned" page — honest status + upstream links (not an empty placeholder) ─
function plannedPage({ title, prefix, sectionId, activeHref, crumb, intro, links = [] }) {
  const body = `
<p class="breadcrumbs">${crumb}</p>
<h1>${title}</h1>
<p>${intro}</p>
<div class="callout"><p><strong>Status: planned.</strong> This page is part of the design-system
information architecture but its content is not yet authored. It is listed here so the structure
is visible and reviewable — we don't ship empty pages with fabricated guidance.</p></div>
${links.length ? `<h2>In the meantime</h2><ul>${links.map((l) => `<li><a href="${l.href}"${/^https?:/.test(l.href) ? ' target="_blank" rel="noopener"' : ''}>${l.label}</a> — ${l.note}</li>`).join('')}</ul>` : ''}`;
  return shell({ title, prefix, sectionId, activeHref, body });
}

// ─── read guideline sources ───────────────────────────────────────────────────
const typoMd = readFileSync(resolve(ROOT, 'foundations', 'tokens', 'typography.guidelines.md'), 'utf8');
const colourMd = readFileSync(resolve(ROOT, 'foundations', 'tokens', 'colour', 'colour.guidelines.md'), 'utf8');
const spacingMd = readFileSync(resolve(ROOT, 'foundations', 'tokens', 'spacing.guidelines.md'), 'utf8');

// ─── build ────────────────────────────────────────────────────────────────────
rmSync(DIST, { recursive: true, force: true });
mkdirSync(resolve(DIST, 'assets'), { recursive: true });
mkdirSync(resolve(DIST, 'styles'), { recursive: true });
mkdirSync(resolve(DIST, 'components'), { recursive: true });

for (const f of ['tokens.css', 'tokens-dark.css', 'typography.css']) copyFileSync(resolve(TOKENS, 'css', f), resolve(DIST, 'assets', f));
copyFileSync(resolve(ROOT, 'packages', 'web', 'src', 'button', 'button.css'), resolve(DIST, 'assets', 'button.css'));
copyFileSync(resolve(ROOT, 'packages', 'web', 'src', 'table', 'table.css'), resolve(DIST, 'assets', 'table.css'));
writeFileSync(resolve(DIST, 'assets', 'site.css'), SITE_CSS);

// Get Started (home)
const getStarted = `
<h1>Single Record Design System</h1>
<p>The design system for the Single Record programme in NHS Wales (DHCW). It supports clinical
and administrative products across web, Blazor/.NET, React and .NET MAUI. Every page here is a
<strong>real implementation</strong> of the system — rendered from the built design tokens and the
actual reference components, not a mockup.</p>
<div class="cards">
  <a class="card" href="styles/typography.html"><h3>Styles</h3><p>Typography, colour, spacing, and the token translator.</p></a>
  <a class="card" href="components/button.html"><h3>Components</h3><p>Buttons, tables — live previews with framework code.</p></a>
  <a class="card" href="figma.html"><h3>Figma &amp; catalogue</h3><p>The Figma library and the Storybook component catalogue.</p></a>
  <a class="card" href="contributions.html"><h3>Contribute</h3><p>Report an issue or request a component/change.</p></a>
</div>
<h2>Principles</h2>
<ul>
  <li><strong>Accessibility is a hard requirement</strong> — WCAG 2.2 AA minimum, AAA where feasible.</li>
  <li><strong>Consistency over novelty</strong> — align with GDS and NHS England before inventing.</li>
  <li><strong>Tokens are the source of truth</strong> — Figma variables build to the same tokens this site consumes.</li>
</ul>
<h2>How content works here</h2>
<p>For general UX guidance we link out to <a href="https://www.nhs.uk/" target="_blank" rel="noopener">NHS.UK</a> /
<a href="https://www.gov.uk/" target="_blank" rel="noopener">GOV.UK</a> rather than duplicate maintained upstream content.
We write original guidance only for Single Record specifics — tokens, clinical rationale, and SR component behaviour.</p>`;
writeFileSync(resolve(DIST, 'index.html'), shell({ title: 'Get Started', prefix: '', sectionId: 'get-started', activeHref: 'index.html', body: getStarted }));

// Styles — foundations from markdown + live token specimens
writeFileSync(resolve(DIST, 'styles', 'typography.html'), shell({
  title: 'Typography', prefix: '../', sectionId: 'styles', activeHref: 'styles/typography.html',
  body: `<p class="breadcrumbs">Styles / Typography</p>${renderMarkdown(typoMd)}<hr><h2>Live type scale (from tokens)</h2>
    <p>Rendered with the built <code>.sr-type-*</code> utility classes.</p><div>${typeSamples}</div>`,
}));
writeFileSync(resolve(DIST, 'styles', 'colour.html'), shell({
  title: 'Colours', prefix: '../', sectionId: 'styles', activeHref: 'styles/colour.html',
  body: `<p class="breadcrumbs">Styles / Colours</p>${renderMarkdown(colourMd)}<hr><h2>Semantic tokens (from tokens)</h2>${swatchGrid((k) => k.startsWith('sr-color-'))}
    <h2>Grey ramp (from tokens)</h2><p>The full 50–900 neutral ramp.</p>${swatchGrid((k) => /^color-grey-/.test(k))}`,
}));
writeFileSync(resolve(DIST, 'styles', 'spacing.html'), shell({
  title: 'Spacing & Elevation', prefix: '../', sectionId: 'styles', activeHref: 'styles/spacing.html',
  body: `<p class="breadcrumbs">Styles / Spacing &amp; Elevation</p>${renderMarkdown(spacingMd)}<hr><h2>Live spacing scale (from tokens)</h2>
    <p>Bar widths are set with the built <code>--space-*</code> custom properties.</p><div class="space-scale">${spacingScale}</div>
    <h2>Radius (from tokens)</h2><div class="radii">${radiusSamples}</div>`,
}));
writeFileSync(resolve(DIST, 'styles', 'icons.html'), plannedPage({
  title: 'Icons', prefix: '../', sectionId: 'styles', activeHref: 'styles/icons.html', crumb: 'Styles / Icons',
  intro: 'The Single Record icon set (restricted, from the Figma Icons page) and its colour/size tokens.',
  links: [{ href: STORYBOOK_URL, label: 'Storybook catalogue', note: 'browse rendered icon usage in components' }],
}));
writeFileSync(resolve(DIST, 'styles', 'grids.html'), plannedPage({
  title: 'Grids', prefix: '../', sectionId: 'styles', activeHref: 'styles/grids.html', crumb: 'Styles / Grids',
  intro: 'Layout grid and breakpoints for Single Record products.',
  links: [{ href: 'https://service-manual.nhs.uk/design-system/styles/layout', label: 'NHS England layout', note: 'upstream grid guidance we build on' }],
}));
writeFileSync(resolve(DIST, 'styles', 'token-translator.html'), translatorPage());

// Components
writeFileSync(resolve(DIST, 'components', 'button.html'), buttonPage());
writeFileSync(resolve(DIST, 'components', 'table.html'), tablePage());

// Patterns / Pages — planned section indexes
writeFileSync(resolve(DIST, 'patterns.html'), plannedPage({
  title: 'Patterns', prefix: '', sectionId: 'patterns', activeHref: 'patterns.html', crumb: 'Patterns',
  intro: 'Composed, multi-component interactions — patient banner, forms, search, sign-off flows.',
  links: [{ href: 'https://service-manual.nhs.uk/design-system/patterns', label: 'NHS England patterns', note: 'reference patterns we adapt' }],
}));
writeFileSync(resolve(DIST, 'pages.html'), plannedPage({
  title: 'Pages', prefix: '', sectionId: 'pages', activeHref: 'pages.html', crumb: 'Pages',
  intro: 'Whole-page templates assembled from patterns and components.',
}));

// Figma — library link + reachable Storybook catalogue (not in nav)
writeFileSync(resolve(DIST, 'figma.html'), shell({
  title: 'Figma', prefix: '', sectionId: 'figma', activeHref: 'figma.html',
  body: `<p class="breadcrumbs">Figma</p><h1>Figma &amp; catalogue</h1>
<p>The Single Record Figma library is the canonical source for variables (tokens), components and
usage-notes panels. Variables build to the same token artifact this website consumes.</p>
<div class="cards">
  <a class="card" href="${STORYBOOK_URL}"><h3>Storybook catalogue →</h3><p>Every reference component, rendered with all variants and controls.</p></a>
</div>
<h2>Handoff conventions</h2>
<ul>
  <li>Design in Figma first; document in <code>/foundations</code> or <code>/components</code> before code.</li>
  <li>Use existing icon components from the Icons page — never inline vector placeholders.</li>
  <li>Token names follow <code>{tier}.{category}.{variant}</code> (e.g. <code>color.interactive.primary</code>).</li>
</ul>`,
}));

// Contributions — two distinct intake channels (point 4)
writeFileSync(resolve(DIST, 'contributions.html'), shell({
  title: 'Contributions', prefix: '', sectionId: 'contributions', activeHref: 'contributions.html',
  body: `<p class="breadcrumbs">Contributions</p><h1>Contributing</h1>
<p>Two separate channels — pick by intent so requests land in the right queue.</p>
<div class="cards">
  <a class="card" href="${REPORT_ISSUE_URL}" target="_blank" rel="noopener"><h3>Report an issue →</h3>
    <p>Something is broken, wrong, or inaccessible on the site, a component, or the docs. Goes to the
    Microsoft Forms intake.</p></a>
  <a class="card" href="${CONTRIBUTION_URL}" target="_blank" rel="noopener"><h3>Request a component or change →</h3>
    <p>A new component, variant, token, or a change to an existing one. Goes to the Azure DevOps
    intake for triage against the roadmap.</p></a>
</div>
<div class="callout"><p>Both links are placeholders until the final form URLs are supplied.</p></div>
<h2>Before you request a new component</h2>
<ul>
  <li>Check <a href="https://design-system.service.gov.uk/components/" target="_blank" rel="noopener">GDS</a> and
    <a href="https://service-manual.nhs.uk/design-system/components" target="_blank" rel="noopener">NHS England</a> — align before inventing.</li>
  <li>Run product values through the <a href="styles/token-translator.html">token translator</a> — many "new" needs are existing tokens.</li>
  <li>Non-trivial choices need a Design Decision Record (DDR).</li>
</ul>`,
}));

console.log('Website built to', DIST);
console.log('Sections: Get Started · Styles (5) · Components (2) · Patterns · Pages · Figma · Contributions');
console.log('Tokens available →', colourEntries.length, 'colours,', spaceEntries.length, 'space,', radiusEntries.length, 'radius');
