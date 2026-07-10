/**
 * DHCW Single Record Design System — website build (Concept B, growing).
 *
 * Consumes the BUILT token artifact (packages/tokens/build) and the single-source
 * guideline docs. Never hardcodes a colour/size/space. Proves the
 * Figma -> tokens -> website pipeline. Zero runtime dependencies.
 *
 * Pages: Overview · Foundations (Typography, Colour, Spacing) ·
 *        Components (Button — variant + framework switchers) · Tools (Translator).
 */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const TOKENS = resolve(ROOT, 'packages', 'tokens', 'build');
const DIST = resolve(__dirname, 'dist');

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

// ─── page shell ───────────────────────────────────────────────────────────────
const NAV = [
  { href: 'index.html', label: 'Overview' },
  { href: 'foundations/typography.html', label: 'Typography' },
  { href: 'foundations/colour.html', label: 'Colour' },
  { href: 'foundations/spacing.html', label: 'Spacing' },
  { href: 'components/button.html', label: 'Button' },
  { href: 'tools/translator.html', label: 'Translator' },
  { href: 'storybook/index.html', label: 'Catalogue' },
];
function shell({ title, prefix, activeHref, body, extraHead = '', extraScript = '' }) {
  const nav = NAV.map((n) => {
    const active = n.href === activeHref ? ' aria-current="page"' : '';
    return `<a href="${prefix + n.href}"${active}>${n.label}</a>`;
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
<link rel="stylesheet" href="${prefix}assets/button.css">
<link rel="stylesheet" href="${prefix}assets/site.css">
${extraHead}
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
  <p>DHCW Single Record Design System · Concept B preview · pages rendered from the built design tokens.</p>
</footer>
<script>
  const btn = document.getElementById('theme'), root = document.documentElement;
  btn.addEventListener('click', () => {
    const dark = root.getAttribute('data-theme') === 'dark';
    root.setAttribute('data-theme', dark ? 'light' : 'dark');
    btn.setAttribute('aria-pressed', String(!dark));
    btn.textContent = dark ? 'Dark mode' : 'Light mode';
  });
</script>
${extraScript}
</body>
</html>`;
}

const SITE_CSS = readFileSync(resolve(__dirname, 'site.css'), 'utf8');

// ─── Button component page (variant + framework switchers) ────────────────────
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
  const frameworks = ['Web (HTML)', 'React', 'Blazor', 'MAUI'];
  const body = `
<h1>Button</h1>
<p>Triggers an action. Pick the variant, size and framework — the preview and code
update live. Preview and code are driven by the built <code>button.css</code> and tokens.</p>

<section class="demo">
  <div class="demo__toolbar">
    <div class="switch" role="group" aria-label="Variant">
      ${variants.map((v, idx) => `<button class="switch__btn${idx === 0 ? ' is-active' : ''}" data-variant="${v.id}" data-cls="${v.cls}">${v.label}</button>`).join('')}
    </div>
    <div class="switch" role="group" aria-label="Size">
      ${sizes.map((s) => `<button class="switch__btn${s.id === 'default' ? ' is-active' : ''}" data-size="${s.id}" data-cls="${s.cls}">${s.label}</button>`).join('')}
    </div>
  </div>
  <div class="demo__preview"><button id="preview-btn" class="sr-button sr-button--primary">Save record</button></div>
</section>

<section>
  <div class="switch switch--tabs" role="tablist" aria-label="Framework">
    ${frameworks.map((f, idx) => `<button class="switch__btn${idx === 0 ? ' is-active' : ''}" role="tab" data-fw="${f}">${f}</button>`).join('')}
  </div>
  <div class="code"><button class="code__copy" type="button">Copy</button><pre><code id="code-block"></code></pre></div>
</section>

<h2>When to use</h2>
<ul>
  <li>One <strong>Primary</strong> action per view (submit, confirm).</li>
  <li><strong>Secondary</strong> for supporting actions alongside primary.</li>
  <li><strong>Ghost</strong> for low-emphasis actions (cancel, back).</li>
  <li><strong>Destructive</strong> for permanent deletion — pair with a confirmation dialog.</li>
</ul>
<p>Full contract: <code>components/button/spec.md</code>. Focus ring is <code>Border/Focus</code> (Cyan/700, DDR-006).</p>`;

  const script = `<script>
(function(){
  var preview = document.getElementById('preview-btn');
  var codeEl = document.getElementById('code-block');
  var state = { variant:'primary', variantCls:'sr-button--primary', size:'default', sizeCls:'', fw:'Web (HTML)' };
  function labelFor(){ return state.variant.charAt(0).toUpperCase()+state.variant.slice(1); }
  function apply(){
    preview.className = 'sr-button ' + state.variantCls + (state.sizeCls ? ' ' + state.sizeCls : '');
    codeEl.textContent = snippet();
  }
  function snippet(){
    var v = state.variant, size = state.size;
    var cls = 'sr-button sr-button--' + v + (state.sizeCls ? ' ' + state.sizeCls : '');
    if(state.fw === 'Web (HTML)') return '<button class="' + cls + '">Save record</button>';
    if(state.fw === 'React'){ var props = 'variant="' + v + '"' + (size!=='default'?' size="'+size+'"':''); return '<Button ' + props + '>Save record</Button>'; }
    if(state.fw === 'Blazor'){ var t = v.charAt(0).toUpperCase()+v.slice(1); var s = size!=='default'?(' Size="ButtonSize.'+size.charAt(0).toUpperCase()+size.slice(1)+'"'):''; return '<SrButton Type="ButtonType.' + t + '"' + s + '>Save record</SrButton>'; }
    // MAUI
    return '<!-- MAUI renders the Blazor component via Blazor Hybrid (DDR-011). -->\\n<SrButton Type="ButtonType.' + (v.charAt(0).toUpperCase()+v.slice(1)) + '">Save record</SrButton>';
  }
  function wire(group, keyCls, keyId){
    document.querySelectorAll(group).forEach(function(b){
      b.addEventListener('click', function(){
        b.parentNode.querySelectorAll('.switch__btn').forEach(function(x){ x.classList.remove('is-active'); });
        b.classList.add('is-active');
        if(keyId==='variant'){ state.variant = b.dataset.variant; state.variantCls = b.dataset.cls; }
        if(keyId==='size'){ state.size = b.dataset.size; state.sizeCls = b.dataset.cls; }
        if(keyId==='fw'){ state.fw = b.dataset.fw; }
        apply();
      });
    });
  }
  wire('[data-variant]', 'cls', 'variant');
  wire('[data-size]', 'cls', 'size');
  wire('[data-fw]', 'fw', 'fw');
  document.querySelector('.code__copy').addEventListener('click', function(e){
    navigator.clipboard && navigator.clipboard.writeText(codeEl.textContent);
    e.target.textContent = 'Copied'; setTimeout(function(){ e.target.textContent = 'Copy'; }, 1200);
  });
  apply();
})();
</script>`;
  return shell({ title: 'Button', prefix: '../', activeHref: 'components/button.html', body, extraScript: script });
}

// ─── Token translator (Tools) — deterministic, client-side, no external calls ──
function translatorPage() {
  const colourData = colourEntries.map(([k, v]) => ({ n: '--' + k, hex: v }));
  const spaceData = spaceEntries.map(([k, px]) => ({ n: '--' + k, px }));
  const body = `
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
      '<p class="muted">No-match items should go to a component/token request (GitHub issue on the org repo). The translator never changes your code.</p>';
  }
  document.getElementById('run').addEventListener('click', run);
  document.getElementById('sample').addEventListener('click', function(){
    document.getElementById('src').value = 'color: #325083;\\nbackground: #f4f5f8;\\nborder: 1px solid #d9dde0;\\npadding: 15px 16px;\\ncolor: #ff4400;';
    run();
  });
})();
</script>`;
  return shell({ title: 'Token translator', prefix: '../', activeHref: 'tools/translator.html', body, extraScript: script });
}

// ─── read guideline sources ───────────────────────────────────────────────────
const typoMd = readFileSync(resolve(ROOT, 'foundations', 'tokens', 'typography.guidelines.md'), 'utf8');
const colourMd = readFileSync(resolve(ROOT, 'foundations', 'tokens', 'colour', 'colour.guidelines.md'), 'utf8');
const spacingMd = readFileSync(resolve(ROOT, 'foundations', 'tokens', 'spacing.guidelines.md'), 'utf8');

// ─── build ────────────────────────────────────────────────────────────────────
rmSync(DIST, { recursive: true, force: true });
mkdirSync(resolve(DIST, 'assets'), { recursive: true });
mkdirSync(resolve(DIST, 'foundations'), { recursive: true });
mkdirSync(resolve(DIST, 'components'), { recursive: true });
mkdirSync(resolve(DIST, 'tools'), { recursive: true });

for (const f of ['tokens.css', 'tokens-dark.css', 'typography.css']) copyFileSync(resolve(TOKENS, 'css', f), resolve(DIST, 'assets', f));
copyFileSync(resolve(ROOT, 'packages', 'web', 'src', 'button', 'button.css'), resolve(DIST, 'assets', 'button.css'));
writeFileSync(resolve(DIST, 'assets', 'site.css'), SITE_CSS);

const overview = `
<h1>Single Record Design System</h1>
<p>Reference site (Concept B, in progress). Pages are generated from the single-source
guideline documents and the <strong>built design tokens</strong> — the same artifact the Figma
variables feed. Foundations, a first component with framework switchers, and the token
translator are wired.</p>
<div class="cards">
  <a class="card" href="foundations/typography.html"><h3>Typography</h3><p>Type scale, weights, usage.</p></a>
  <a class="card" href="foundations/colour.html"><h3>Colour</h3><p>Semantic tokens and the grey ramp.</p></a>
  <a class="card" href="foundations/spacing.html"><h3>Spacing</h3><p>The 4px grid and scale.</p></a>
  <a class="card" href="components/button.html"><h3>Button</h3><p>Variant + framework switchers, live.</p></a>
  <a class="card" href="tools/translator.html"><h3>Token translator</h3><p>Match product values to tokens, in-browser.</p></a>
  <a class="card" href="storybook/index.html"><h3>Catalogue</h3><p>Storybook component catalogue.</p></a>
</div>`;
writeFileSync(resolve(DIST, 'index.html'), shell({ title: 'Overview', prefix: '', activeHref: 'index.html', body: overview }));

writeFileSync(resolve(DIST, 'foundations', 'typography.html'), shell({
  title: 'Typography', prefix: '../', activeHref: 'foundations/typography.html',
  body: `${renderMarkdown(typoMd)}<hr><h2>Live type scale (from tokens)</h2>
    <p>Rendered with the built <code>.sr-type-*</code> utility classes.</p><div>${typeSamples}</div>`,
}));
writeFileSync(resolve(DIST, 'foundations', 'colour.html'), shell({
  title: 'Colour', prefix: '../', activeHref: 'foundations/colour.html',
  body: `${renderMarkdown(colourMd)}<hr><h2>Semantic tokens (from tokens)</h2>${swatchGrid((k) => k.startsWith('sr-color-'))}
    <h2>Grey ramp (from tokens)</h2><p>The full 50–900 neutral ramp.</p>${swatchGrid((k) => /^color-grey-/.test(k))}`,
}));
writeFileSync(resolve(DIST, 'foundations', 'spacing.html'), shell({
  title: 'Spacing', prefix: '../', activeHref: 'foundations/spacing.html',
  body: `${renderMarkdown(spacingMd)}<hr><h2>Live spacing scale (from tokens)</h2>
    <p>Bar widths are set with the built <code>--space-*</code> custom properties.</p><div class="space-scale">${spacingScale}</div>
    <h2>Radius (from tokens)</h2><div class="radii">${radiusSamples}</div>`,
}));
writeFileSync(resolve(DIST, 'components', 'button.html'), buttonPage());
writeFileSync(resolve(DIST, 'tools', 'translator.html'), translatorPage());

console.log('Website built to', DIST);
console.log('Pages: overview, 3 foundations, button (switchers), translator');
console.log('Tokens available →', colourEntries.length, 'colours,', spaceEntries.length, 'space,', radiusEntries.length, 'radius');
