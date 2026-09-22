#!/usr/bin/env node
/**
 * guidelines.md → Figma "Guidelines" panel sections.
 *
 * The `guidelines.md` for a topic is the SINGLE SOURCE for two surfaces: the DS
 * website page and the Figma "Guidelines / Usage notes" frame (CLAUDE.md).
 * The website reads the markdown directly. Figma cannot, so the panel used to be
 * transcribed by hand — and a hand transcription is a fork the moment the
 * markdown changes. This script does the transcription mechanically instead, so
 * rebuilding a panel after an edit is one command rather than a careful re-read.
 *
 * Usage:
 *   node scripts/guidelines-to-figma.mjs components/tabs/guidelines.md
 *   node scripts/guidelines-to-figma.mjs components/tabs/guidelines.md --pretty
 *
 * Output: JSON `{ title, sections: [{ heading, lines: [...] }] }`, ready to be
 * pasted into a `use_figma` script. One section per `##`/`###` heading; each
 * section's body is a list of already-prefixed lines ("•  …"), because the Figma
 * panel has no list primitive — a bullet block is one TEXT node of "\n"-joined
 * lines, exactly as the existing Guidelines/* frames are built.
 *
 * What is dropped, and why:
 *   - the H1 and the metadata table  — the frame's header bar carries the name,
 *     and status/reference/Figma-node rows are repo bookkeeping, not guidance.
 *   - Frameworks / Related / Engineering — engineering surfaces. A designer
 *     reading the Figma panel cannot act on them; they stay on the website page.
 * Everything else is carried across verbatim, minus markdown syntax.
 */

import { readFileSync } from 'node:fs';

/** Sections that belong on the website page but not in the Figma panel. */
const SKIP_SECTIONS = new Set(['frameworks', 'related', 'engineering']);

/** Strip inline markdown. The panel has no rich text, so emphasis is dropped
 *  rather than approximated — a stray `**` in a Figma text node reads as a typo. */
const inline = (s) =>
  s
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // [text](link) → text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1$2')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const splitRow = (row) =>
  row
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => inline(c));

const isSeparator = (row) => /^\s*\|?[\s:|-]*-[\s:|-]*\|?\s*$/.test(row) && row.includes('-');

/**
 * A table becomes bullets, because the panel is a single narrow column and a
 * 4-column table at 575px is unreadable. A Do/Don't table is the one shape worth
 * special-casing: its two columns are opposites, not a row of one thing.
 */
function tableToLines(rows) {
  const header = splitRow(rows[0]);
  const body = rows.slice(2).filter((r) => r.trim());
  const isDoDont =
    header.length === 2 && /^do$/i.test(header[0]) && /^don.?t$/i.test(header[1]);

  const lines = [];
  for (const row of body) {
    const cells = splitRow(row);
    if (isDoDont) {
      if (cells[0]) lines.push(`•  Do — ${cells[0]}`);
      if (cells[1]) lines.push(`•  Don't — ${cells[1]}`);
      continue;
    }
    // A leading empty header cell means the first column is the row's label.
    const parts = cells
      .map((c, i) => (header[i] && cells.length > 2 && i > 0 ? `${header[i]}: ${c}` : c))
      .filter(Boolean);
    if (parts.length) lines.push(`•  ${parts.join(' — ')}`);
  }
  return lines;
}

export function parseGuidelines(md) {
  const lines = md.split('\n');
  const title = (lines.find((l) => l.startsWith('# ')) || '# Untitled').slice(2).trim();

  const sections = [];
  let current = null;
  let table = null;
  let paragraph = [];

  /**
   * Inline markdown is stripped only once a line is whole. A bullet wrapped in
   * the source splits `**emphasis like this**` across two physical lines, and
   * stripping each half on its own leaves both `**` markers behind — which is
   * how `**The Figma set should be normalised to 20px**` reached a Figma panel.
   */
  const pushLine = (prefix, raw) => current.lines.push({ prefix, raw });

  const flushParagraph = () => {
    if (!paragraph.length) return;
    if (current) pushLine('', paragraph.join(' '));
    paragraph = [];
  };
  const flushTable = () => {
    if (!table) return;
    // Table cells never wrap in the source, so they are safe to strip immediately.
    if (current && table.length >= 3) {
      for (const l of tableToLines(table)) current.lines.push({ prefix: '', raw: l, done: true });
    }
    table = null;
  };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');

    const heading = /^(#{2,3})\s+(.*)$/.exec(line);
    if (heading) {
      flushParagraph();
      flushTable();
      const name = inline(heading[2]);
      current = SKIP_SECTIONS.has(name.toLowerCase()) ? null : { heading: name, lines: [] };
      if (current) sections.push(current);
      continue;
    }
    if (!current) continue;

    if (line.startsWith('|')) {
      flushParagraph();
      (table ??= []).push(line);
      continue;
    }
    flushTable();

    if (!line.trim() || line.startsWith('<!--') || /^-{3,}$/.test(line)) {
      flushParagraph();
      continue;
    }
    if (line.startsWith('>')) {
      paragraph.push(line.replace(/^>\s?/, ''));
      continue;
    }

    const bullet = /^(\s*)[-*]\s+(.*)$/.exec(line);
    if (bullet) {
      flushParagraph();
      pushLine(bullet[1].length >= 2 ? '    –  ' : '•  ', bullet[2]);
      continue;
    }

    // A continuation line of the bullet above, or a paragraph of its own.
    //
    // The `>` is stripped here as well as in the branch above, because a
    // blockquote nested inside a list item is INDENTED — so it never reaches
    // that branch, and the marker rode into the panel as literal text
    // ("The line to hold is: > Inset text is part of the page").
    const last = current.lines[current.lines.length - 1];
    const text = line.trim().replace(/^>\s?/, '');
    if (!text) continue;
    if (/^\s{2,}\S/.test(line) && last && last.prefix && !last.done) {
      last.raw += ` ${text}`;
      continue;
    }
    paragraph.push(text);
  }
  flushParagraph();
  flushTable();

  for (const s of sections) s.lines = s.lines.map((l) => l.prefix + inline(l.raw));
  return { title, sections: sections.filter((s) => s.lines.length) };
}

/**
 * Refuse to emit markdown syntax. A Figma text node has no rich text, so a
 * surviving `**` or backtick renders literally on the canvas and reads as a
 * typo — and nobody proof-reads a panel they just generated. This caught the
 * emphasis-across-a-line-break bug in known-issues.md; it stays because the
 * next such bug will look exactly as plausible.
 */
const LEFTOVER = [
  [/\*\*/, 'bold markers (**)'],
  [/`/, 'a backtick'],
  [/\]\(/, 'a markdown link'],
  [/\|/, 'a table pipe'],
  // A blockquote marker that survived, e.g. "The line to hold is: > …".
  // Deliberately " > " with spaces both sides, so a mention of <blockquote>
  // or an HTML tag in the guidance is not flagged.
  [/\s>\s/, 'a blockquote marker (>)'],
];

export function assertNoMarkdown({ sections }, label) {
  const bad = [];
  for (const s of sections) {
    for (const line of s.lines) {
      for (const [re, what] of LEFTOVER) {
        if (re.test(line)) bad.push(`  ${s.heading}: ${what} in "${line.slice(0, 90)}"`);
      }
    }
  }
  if (bad.length) {
    throw new Error(`${label}: markdown syntax survived the strip —\n${bad.join('\n')}`);
  }
}

/**
 * Emit the complete `use_figma` script that BUILDS the panel, not just its data.
 *
 * The JSON alone was only half the job: the builder still had to be hand-written
 * each time, and on its first hand-written run every text node collapsed to a
 * near-zero-width thread. That is the documented `textAutoResize` trap — a TEXT
 * node defaults to WIDTH_AND_HEIGHT, which IGNORES `layoutSizingHorizontal =
 * 'FILL'`. The order below is the one that works, and baking it in here is why
 * the next panel cannot repeat the mistake:
 *
 *     textAutoResize = 'NONE'  →  FIXED + resize(width)  →  'HEIGHT'  →  'FILL'
 *
 * Styling matches the existing Guidelines/* frames (header #1b294a, headings
 * #325083 Roboto Medium 16/24, body #212b32 Roboto Regular 14/20, 575px column).
 */
export function figmaScript({ title, sections }, { pageId, replaceNodeId } = {}) {
  const data = JSON.stringify({ title, sections });
  return `const DATA = ${data};
const PAGE_ID = ${JSON.stringify(pageId || 'SET-ME')};
const REPLACE_NODE_ID = ${JSON.stringify(replaceNodeId || null)};

const page = await figma.getNodeByIdAsync(PAGE_ID);
await figma.setCurrentPageAsync(page);
const MED = { family: 'Roboto', style: 'Medium' };
const REG = { family: 'Roboto', style: 'Regular' };
await figma.loadFontAsync(MED); await figma.loadFontAsync(REG);
const rgb = (h) => ({ r: parseInt(h.slice(1,3),16)/255, g: parseInt(h.slice(3,5),16)/255, b: parseInt(h.slice(5,7),16)/255 });

const frame = figma.createAutoLayout('VERTICAL', { name: 'Guidelines/' + DATA.title });
page.appendChild(frame);
frame.itemSpacing = 0; frame.cornerRadius = 4;
frame.fills = [{ type: 'SOLID', color: rgb('#ffffff') }];
frame.layoutSizingHorizontal = 'FIXED';
frame.resize(607, 100);

const hdr = figma.createAutoLayout('VERTICAL', { name: 'hdr' });
frame.appendChild(hdr);
hdr.layoutSizingHorizontal = 'FILL';
hdr.paddingTop = 12; hdr.paddingBottom = 12; hdr.paddingLeft = 16; hdr.paddingRight = 16;
hdr.cornerRadius = 4;
hdr.fills = [{ type: 'SOLID', color: rgb('#1b294a') }];
const ht = figma.createText();
hdr.appendChild(ht);
ht.fontName = MED; ht.fontSize = 16; ht.lineHeight = { unit: 'PIXELS', value: 24 };
ht.characters = DATA.title + ' \u2014 Guidelines';
ht.fills = [{ type: 'SOLID', color: rgb('#ffffff') }];

const body = figma.createAutoLayout('VERTICAL', { name: 'body' });
frame.appendChild(body);
body.layoutSizingHorizontal = 'FILL';
body.paddingTop = 16; body.paddingBottom = 16; body.paddingLeft = 16; body.paddingRight = 16;
body.itemSpacing = 11;
body.fills = [];

/** The sizing order that stops a wrapping TEXT collapsing to a thread. */
function addText(parent, chars, font, size, lh, colour) {
  const t = figma.createText();
  parent.appendChild(t);
  t.fontName = font; t.fontSize = size; t.lineHeight = { unit: 'PIXELS', value: lh };
  t.characters = chars;
  t.fills = [{ type: 'SOLID', color: rgb(colour) }];
  t.textAutoResize = 'NONE';
  t.layoutSizingHorizontal = 'FIXED';
  t.resize(575, lh);
  t.textAutoResize = 'HEIGHT';
  t.layoutSizingHorizontal = 'FILL';
  return t;
}

for (const s of DATA.sections) {
  addText(body, s.heading, MED, 16, 24, '#325083');
  addText(body, s.lines.join('\n'), REG, 14, 20, '#212b32');
  const rule = figma.createRectangle();
  body.appendChild(rule);
  rule.resize(575, 1);
  rule.layoutSizingHorizontal = 'FILL';
  rule.fills = [{ type: 'SOLID', color: rgb('#d8dde0') }];
}

if (REPLACE_NODE_ID) {
  const stale = await figma.getNodeByIdAsync(REPLACE_NODE_ID);
  if (stale) { frame.x = stale.x; frame.y = stale.y; stale.remove(); }
}
await frame.screenshot({ scale: 0.8 });
return { createdNodeIds: [frame.id], replaced: REPLACE_NODE_ID,
  widths: frame.findAllWithCriteria({ types: ['TEXT'] }).map(t => Math.round(t.width)) };`;
}

const [, , file, ...flags] = process.argv;
if (!file) {
  console.error('usage: guidelines-to-figma.mjs <path/to/guidelines.md> [--pretty] [--figma-script] [--page=<id>] [--replace=<id>]');
  process.exit(2);
}
const out = parseGuidelines(readFileSync(file, 'utf8'));
try {
  assertNoMarkdown(out, file);
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
if (flags.includes('--figma-script')) {
  const pageId = (flags.find((f) => f.startsWith('--page=')) || '').split('=')[1];
  const replaceNodeId = (flags.find((f) => f.startsWith('--replace=')) || '').split('=')[1];
  process.stdout.write(figmaScript(out, { pageId, replaceNodeId }) + '\n');
} else {
  process.stdout.write(JSON.stringify(out, null, flags.includes('--pretty') ? 2 : 0) + '\n');
}
