#!/usr/bin/env node
/**
 * check-content.mjs
 *
 * Checks UI copy and patient data against docs/content/data-standards.md, using
 * the rules in scripts/content-rules.mjs.
 *
 *   node scripts/check-content.mjs --site                 the built website (run build:site first)
 *   node scripts/check-content.mjs --prototype            products/[name]/prototype/src
 *   node scripts/check-content.mjs --figma texts.json     text exported from Figma by the content-checker agent
 *
 *   --out report.md   write the report to a file as well as a summary to the console
 *   --strict          exit 1 on any error (for use as a build gate once the baseline is clean)
 *
 * Figma export format: [{ "id": "12:34", "text": "…", "role": "heading", "path": "Page / Frame / Layer" }]
 *
 * What it cannot judge (plain language, whether a heading says the right
 * thing, whether a name is a proper noun it has not heard of) is left to the
 * content-checker agent and to people. See .claude/agents/content-checker.md.
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkText } from './content-rules.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const arg = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };

const walk = (dir, ext) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  if (f === 'node_modules' || f.startsWith('.')) return [];
  return statSync(p).isDirectory() ? walk(p, ext) : ext.test(f) ? [p] : [];
});
const decode = (t) => t.replace(/&nbsp;/g, ' ').replace(/&mdash;/g, '—').replace(/&ndash;/g, '–').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;|&rsquo;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n)).replace(/\s+/g, ' ').trim();

// ── HTML: text runs with a role taken from the element they sit in ───────────
// Skips code, and table columns headed as the wrong example ("Not", "Don't"),
// because the website shows mistakes on purpose to teach the rule.
const SKIP_TAGS = new Set(['script', 'style', 'code', 'pre', 'svg', 'kbd', 'samp', 'template']);
const ROLE_OF = { h1: 'heading', h2: 'heading', h3: 'heading', h4: 'heading', h5: 'heading', h6: 'heading', button: 'button', a: 'link', label: 'label', th: 'column', summary: 'heading', legend: 'label' };
const WRONG_COLUMN = /^(not|don'?t|do not|do not use|avoid|wrong|before|instead of)\b/i;

function htmlTexts(html) {
  const out = [];
  const stack = [];
  let text = '';
  const flush = () => {
    const t = decode(text);
    text = '';
    if (!t || stack.some((e) => e.skip)) return;
    const el = [...stack].reverse().find((e) => ROLE_OF[e.tag] || e.roleAttr === 'tab');
    const role = el ? (el.roleAttr === 'tab' ? 'tab' : ROLE_OF[el.tag]) : 'body';
    out.push({ text: t, role });
  };
  for (const m of html.matchAll(/<(\/?)([a-zA-Z][\w-]*)([^>]*)>|([^<]+)/g)) {
    if (m[4] !== undefined) { text += m[4]; continue; }
    const [, close, rawTag, attrs] = m;
    const tag = rawTag.toLowerCase();
    if (['br', 'img', 'input', 'meta', 'link', 'hr', 'source', 'wbr', 'path', 'circle', 'rect', 'line', 'polyline'].includes(tag)) continue;
    flush();
    if (!close) {
      const classes = (attrs.match(/class="([^"]*)"/) || [])[1] || '';
      const skip = SKIP_TAGS.has(tag) || /\bsr-visually-hidden\b|\bcode-panel\b|\bdont\b/.test(classes) || /data-content-ignore/.test(attrs);
      stack.push({ tag, skip, roleAttr: (attrs.match(/role="([^"]*)"/) || [])[1] });
    } else {
      // Pop to the matching tag; HTML from our build is well formed.
      const i = stack.map((e) => e.tag).lastIndexOf(tag);
      if (i >= 0) stack.length = i;
    }
  }
  flush();
  return out;
}

// Column headings need to be known before cells are judged, so headings are
// collected up front per table and fed back in.
function siteTexts(html) {
  const withHeads = html.replace(/<table\b[\s\S]*?<\/table>/g, (t) => {
    const heads = [...(t.match(/<thead[\s\S]*?<\/thead>/) || [t])[0].matchAll(/<th\b[^>]*>([\s\S]*?)<\/th>/g)].map((h) => decode(h[1].replace(/<[^>]+>/g, '')));
    let n = 0;
    return t.replace(/<tr\b[^>]*>/g, '<tr>').replace(/<(td)\b([^>]*)>/g, (_, td, a) => `<td${a} data-col="${n++}">`)
      .replace(/<tr>/g, () => { n = 0; return '<tr>'; })
      .replace(/<td([^>]*) data-col="(\d+)">/g, (_, a, c) => (WRONG_COLUMN.test(heads[Number(c)] || '') ? `<td${a} data-content-ignore>` : `<td${a}>`));
  });
  return htmlTexts(withHeads);
}

// ── JSX: text between tags, and string props that are UI copy ──────────────
function jsxTexts(src) {
  const out = [];
  for (const m of src.matchAll(/<(h[1-6]|button|Button|a|Link|label|th|Tab)\b[^>]*>([^<{}]+)<\//g)) {
    const tag = m[1].toLowerCase();
    out.push({ text: decode(m[2]), role: tag.startsWith('h') ? 'heading' : tag === 'link' || tag === 'a' ? 'link' : tag === 'tab' ? 'tab' : tag === 'th' ? 'column' : tag === 'label' ? 'label' : 'button' });
  }
  for (const m of src.matchAll(/\b(label|title|heading|buttonLabel|submitLabel|cta)=["']([^"']+)["']/g)) {
    out.push({ text: m[2], role: m[1] === 'title' || m[1] === 'heading' ? 'heading' : m[1].toLowerCase().includes('label') && m[1] !== 'label' ? 'button' : 'label' });
  }
  for (const m of src.matchAll(/>([^<>{}]*\d[^<>{}]*)</g)) out.push({ text: decode(m[1]), role: 'body' });
  for (const m of src.matchAll(/(['"`])((?:(?!\1)[^\\\n])*\d(?:(?!\1)[^\\\n])*)\1/g)) out.push({ text: m[2], role: 'body' });
  return out;
}

// ── Run ──────────────────────────────────────────────────────────────────────
const items = [];   // { where, text, role }
if (args.includes('--site')) {
  const dist = join(ROOT, 'packages', 'website', 'dist');
  for (const f of walk(dist, /\.html$/)) {
    for (const t of siteTexts(readFileSync(f, 'utf8'))) items.push({ where: `website/${relative(dist, f)}`, ...t });
  }
}
if (args.includes('--prototype')) {
  const products = join(ROOT, 'products');
  for (const p of readdirSync(products)) {
    const dir = join(products, p, 'prototype', 'src');
    try { statSync(dir); } catch { continue; }
    for (const f of walk(dir, /\.(jsx?|tsx?)$/)) {
      // ISO dates in source are stored values, formatted before display.
      for (const t of jsxTexts(readFileSync(f, 'utf8'))) items.push({ where: relative(ROOT, f), skip: ['date-iso'], ...t });
    }
  }
}
if (arg('--figma')) {
  for (const n of JSON.parse(readFileSync(arg('--figma'), 'utf8'))) items.push({ where: `figma ${n.id} ${n.path || ''}`.trim(), text: n.text, role: n.role || 'body' });
}
if (!items.length) {
  console.error('Nothing to check. Pass --site, --prototype or --figma <file>. (--site needs npm run build:site first.)');
  process.exit(2);
}

const today = arg('--today') ? new Date(arg('--today')) : new Date();
const seen = new Set();
const findings = [];
for (const it of items) {
  for (const f of checkText(it.text, { role: it.role, today })) {
    if (it.skip?.includes(f.rule)) continue;
    const key = `${it.where}|${f.rule}|${f.found}`;
    if (seen.has(key)) continue;
    seen.add(key);
    findings.push({ ...f, where: it.where, role: it.role });
  }
}

const errors = findings.filter((f) => f.severity === 'error');
const warnings = findings.filter((f) => f.severity === 'warning');
const esc = (s) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
const byRule = Object.entries(findings.reduce((a, f) => ({ ...a, [f.rule]: (a[f.rule] || 0) + 1 }), {})).sort((a, b) => b[1] - a[1]);

const report = `# Content check

${items.length} text runs checked. **${errors.length} errors, ${warnings.length} warnings.**
Rules: \`docs/content/data-standards.md\`. Checker: \`scripts/check-content.mjs\`.

| Rule | Count |
|---|---|
${byRule.map(([r, n]) => `| ${r} | ${n} |`).join('\n')}

| Severity | Where | Role | Found | Problem | Suggested fix |
|---|---|---|---|---|---|
${[...errors, ...warnings].map((f) => `| ${f.severity} | ${esc(f.where)} | ${f.role} | ${esc(f.found)} | ${esc(f.message)} | ${esc(f.fix)} |`).join('\n')}
`;

if (arg('--out')) writeFileSync(arg('--out'), report);
console.log(`check-content: ${items.length} text runs, ${errors.length} errors, ${warnings.length} warnings`);
for (const [r, n] of byRule) console.log(`  ${String(n).padStart(4)}  ${r}`);
if (!arg('--out')) console.log(`\n${report}`);
if (args.includes('--strict') && errors.length) process.exit(1);
