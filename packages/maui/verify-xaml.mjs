// Validates consuming XAML against what @dhcw/sr-maui actually ships.
//
// Nothing here compiles MAUI. What it does catch is the class of mistake that
// survives a careful read and then fails at runtime on a device:
//
//   * malformed XAML — an unclosed or mismatched element
//   * {StaticResource Foo} where Foo does not exist in Colors/Styles/Icons or
//     the file's own resources
//   * StyleClass="Caption,Muted" where one of those class styles is not defined
//   * a hard-coded colour, which means the token layer was skipped
//
// Usage:  node verify-xaml.mjs <file-or-dir> [...]
// Default target is testbed/ when no argument is given.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const repoRoot = resolve(here, '../..');

// ── The dictionaries a consumer can rely on ─────────────────────────────────
const DICTS = ['Colors.xaml', 'Styles.xaml', 'Icons.xaml'].map((f) => resolve(here, f));
for (const d of DICTS) {
  if (!existsSync(d)) throw new Error(`${d} is missing. Run \`npm run build:maui\` first.`);
}

const shipped = new Set();
const shippedClasses = new Set();
for (const d of DICTS) {
  const src = readFileSync(d, 'utf8');
  for (const m of src.matchAll(/x:Key="([^"]+)"/g)) shipped.add(m[1]);
  // Class styles are addressed through StyleClass, not x:Key.
  for (const m of src.matchAll(/<Style\b[^>]*\bClass="([^"]+)"/g)) {
    for (const c of m[1].split(',')) shippedClasses.add(c.trim());
  }
}

// ── A small XAML well-formedness check ──────────────────────────────────────
// Not a conforming XML parser. It looks for the failure that actually happens
// in hand-written XAML: elements that do not close, or close in the wrong order.
/**
 * Blank out comments, CDATA and processing instructions, replacing them with
 * spaces so every remaining offset — and therefore every reported line number —
 * still matches the original file.
 *
 * Every check runs on this, not on the raw source. These files document their
 * own conventions in comments, and those comments quote resource names and
 * colours as examples; scanning them would report the documentation as defects.
 */
function stripNonMarkup(src) {
  const blank = (m) => m.replace(/[^\n]/g, ' ');
  return src
    .replace(/<!--[\s\S]*?-->/g, blank)
    .replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, blank)
    .replace(/<\?[\s\S]*?\?>/g, blank);
}

/**
 * XML forbids `--` anywhere inside a comment, and forbids a comment body ending
 * in `-`. Both are easy to write by accident the moment a comment quotes a
 * command line, because almost every CLI flag is a double hyphen.
 *
 * This is not a nitpick: it stops the file being parsed at all. MSBuild rejects
 * the project with MSB4025 and the XAML compiler rejects the page, so the error
 * arrives as a build failure a long way from the comment that caused it.
 */
function checkComments(raw, label, problems) {
  for (const m of raw.matchAll(/<!--([\s\S]*?)-->/g)) {
    const body = m[1];
    const line = raw.slice(0, m.index).split('\n').length;
    if (body.includes('--')) {
      problems.push(`${label}:${line} — XML comment contains "--", which is not legal (MSB4025)`);
    }
    if (body.endsWith('-')) {
      problems.push(`${label}:${line} — XML comment body ends with "-", which is not legal`);
    }
  }
}

function checkWellFormed(stripped, label, problems) {
  const stack = [];
  const tag = /<(\/?)([\w:.]+)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g;

  for (const m of stripped.matchAll(tag)) {
    const [, closing, name, , selfClosing] = m;
    const line = stripped.slice(0, m.index).split('\n').length;

    if (closing) {
      const open = stack.pop();
      if (!open) {
        problems.push(`${label}:${line} — </${name}> with nothing open`);
      } else if (open.name !== name) {
        problems.push(`${label}:${line} — </${name}> closes <${open.name}> opened at line ${open.line}`);
      }
    } else if (!selfClosing) {
      stack.push({ name, line });
    }
  }

  for (const open of stack) {
    problems.push(`${label}:${open.line} — <${open.name}> is never closed`);
  }
}

// ── Per-file checks ─────────────────────────────────────────────────────────
const NAMED_COLOURS = 'Red|Blue|Green|Maroon|Navy|Teal|Olive|Purple|Silver|Black|White'
  + '|Gray|Grey|DarkGray|DarkGrey|LightGray|LightGrey|Orange|Yellow|Pink|Brown|Cyan|Magenta';

function checkFile(path, problems) {
  const label = relative(repoRoot, path);
  const raw = readFileSync(path, 'utf8');
  const src = stripNonMarkup(raw);

  // Every XML file this project builds, not just the XAML.
  checkComments(raw, label, problems);
  checkWellFormed(src, label, problems);

  // The rest is about design-system references, which only XAML carries.
  if (!path.endsWith('.xaml')) return;

  // Keys and classes this file defines itself are legitimately referenceable.
  const local = new Set();
  for (const m of src.matchAll(/x:Key="([^"]+)"/g)) local.add(m[1]);
  const localClasses = new Set();
  for (const m of src.matchAll(/<Style\b[^>]*\bClass="([^"]+)"/g)) {
    for (const c of m[1].split(',')) localClasses.add(c.trim());
  }

  const lineOf = (index) => src.slice(0, index).split('\n').length;

  // {StaticResource Foo}
  for (const m of src.matchAll(/\{StaticResource\s+([^}]+?)\s*\}/g)) {
    const name = m[1].trim();
    if (!shipped.has(name) && !local.has(name)) {
      problems.push(`${label}:${lineOf(m.index)} — {StaticResource ${name}} does not exist`);
    }
  }

  // StyleClass="A,B"
  for (const m of src.matchAll(/\bStyleClass="([^"]+)"/g)) {
    for (const raw of m[1].split(',')) {
      const cls = raw.trim();
      if (!cls) continue;
      if (!shippedClasses.has(cls) && !localClasses.has(cls)) {
        problems.push(`${label}:${lineOf(m.index)} — StyleClass "${cls}" is not defined anywhere`);
      }
    }
  }

  // Hard-coded colours. Transparent is the absence of a colour, not a choice of
  // one, and stays allowed.
  const literal = new RegExp(
    `(?:Value|Color|BackgroundColor|TextColor|Stroke|Fill|BorderColor|PlaceholderColor`
    + `|ThumbColor|OnColor|TitleColor|Brush)\\s*=\\s*"(#[0-9A-Fa-f]{3,8}|${NAMED_COLOURS})"`,
    'g'
  );
  for (const m of src.matchAll(literal)) {
    problems.push(
      `${label}:${lineOf(m.index)} — literal colour "${m[1]}" — every colour must come from a token`
    );
  }
}

// ── Walk targets ────────────────────────────────────────────────────────────
const XML_BUILD_FILES = ['.xaml', '.csproj', '.props', '.targets'];

function xamlUnder(target) {
  const out = [];
  const walk = (p) => {
    const s = statSync(p);
    if (s.isDirectory()) {
      for (const entry of readdirSync(p)) {
        if (entry === 'bin' || entry === 'obj') continue;
        walk(join(p, entry));
      }
    } else if (XML_BUILD_FILES.some((e) => p.endsWith(e))) {
      out.push(p);
    }
  };
  walk(target);
  return out.sort();
}

const args = process.argv.slice(2);
const targets = (args.length ? args : ['testbed']).map((a) => resolve(here, a));

const files = targets.flatMap(xamlUnder);
if (!files.length) {
  console.error('verify-xaml: no XAML or project files found in the given target(s).');
  process.exit(1);
}

const problems = [];
for (const f of files) checkFile(f, problems);

if (problems.length) {
  console.error(`\n@dhcw/sr-maui: ${problems.length} problem(s) in consuming XAML:\n`);
  for (const p of problems) console.error(`  ${p}`);
  console.error('');
  process.exit(1);
}

console.log(
  `@dhcw/sr-maui: ${files.length} file(s) verified — well-formed XML with legal `
  + `comments; every StaticResource and StyleClass resolves; no literal colours.`
);
