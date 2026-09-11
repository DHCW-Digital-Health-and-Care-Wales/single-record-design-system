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
    const last = current.lines[current.lines.length - 1];
    if (/^\s{2,}\S/.test(line) && last && last.prefix && !last.done) {
      last.raw += ` ${line.trim()}`;
      continue;
    }
    paragraph.push(line.trim());
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

const [, , file, ...flags] = process.argv;
if (!file) {
  console.error('usage: guidelines-to-figma.mjs <path/to/guidelines.md> [--pretty]');
  process.exit(2);
}
const out = parseGuidelines(readFileSync(file, 'utf8'));
try {
  assertNoMarkdown(out, file);
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
process.stdout.write(JSON.stringify(out, null, flags.includes('--pretty') ? 2 : 0) + '\n');
