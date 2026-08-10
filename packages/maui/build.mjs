// Generates Colors.xaml from the @dhcw/sr-tokens XAML output, then validates
// that every {StaticResource ...} in Styles.xaml resolves against it.
//
// Why this file exists rather than consuming Tokens.xaml directly:
//
//   @dhcw/sr-tokens emits Tokens.xaml and Tokens.Dark.xaml with the SAME key
//   names and different values. That shape suits a runtime dictionary swap, but
//   the Single Record mobile app themes with AppThemeBinding — which needs both
//   values reachable at once, under different keys. Merging both files would be
//   a key collision.
//
//   So Colors.xaml carries every key once, plus a `...Dark` twin for the 16
//   semantic tokens whose value actually differs between modes. Primitives are
//   identical in both modes and are not duplicated.
//
// DDR-021: MAUI is native XAML, and this package is its token and style layer.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const TOKENS = resolve(here, '../tokens/build/xaml');

const LIGHT = resolve(TOKENS, 'Tokens.xaml');
const DARK = resolve(TOKENS, 'Tokens.Dark.xaml');
for (const f of [LIGHT, DARK]) {
  if (!existsSync(f)) {
    throw new Error(`${f} is missing. Run \`npm run build -w @dhcw/sr-tokens\` first.`);
  }
}

/**
 * Every keyed resource in a dictionary, as { tag, value, block }.
 *
 * `value` is the text content of a simple one-line element and is what the
 * light/dark comparison works on. `block` is the element's full source, carried
 * through verbatim so multi-line and self-closing elements survive.
 *
 * The earlier version of this matched line-anchored patterns only, which meant
 * <Shadow x:Key="ElevationRaised" ... /> — written across five lines and
 * self-closing — matched nothing and was dropped without a word. Both elevation
 * tokens went missing from Colors.xaml that way.
 */
function parseDictionary(path) {
  const src = readFileSync(path, 'utf8');
  const out = new Map();

  // Opening tags, allowed to span lines. `[\s\S]*?` is lazy, so the first `>`
  // that is not inside an attribute value ends the tag.
  for (const m of src.matchAll(/<([\w:.]+)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g)) {
    const [, tag, attrText, selfClosing] = m;
    const keyMatch = attrText.match(/\bx:Key="([^"]+)"/);
    if (!keyMatch) continue;
    const key = keyMatch[1];

    // Column the opening tag sits at, so multi-line blocks can be re-indented
    // without losing the alignment of their attributes.
    const sourceIndent = m.index - (src.lastIndexOf("\n", m.index) + 1);

    if (selfClosing) {
      out.set(key, { tag, value: null, block: m[0], sourceIndent });
      continue;
    }

    // Find this element's matching close tag, counting nested same-name opens.
    const closeTag = `</${tag}>`;
    let depth = 1;
    let cursor = m.index + m[0].length;
    let end = -1;
    while (cursor < src.length) {
      const nextOpen = src.indexOf(`<${tag}`, cursor);
      const nextClose = src.indexOf(closeTag, cursor);
      if (nextClose === -1) break;
      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth++;
        cursor = nextOpen + tag.length + 1;
        continue;
      }
      depth--;
      if (depth === 0) { end = nextClose + closeTag.length; break; }
      cursor = nextClose + closeTag.length;
    }
    if (end === -1) throw new Error(`${path}: <${tag} x:Key="${key}"> is never closed.`);

    const block = src.slice(m.index, end);
    // A simple element is one whose content holds no further markup — that
    // content is the value the light/dark comparison needs.
    const inner = block.slice(m[0].length, block.length - closeTag.length);
    out.set(key, { tag, value: inner.includes('<') ? null : inner, block, sourceIndent });
  }

  return out;
}

/**
 * Re-indent a carried-through block into the output, preserving the relative
 * indentation of its continuation lines — a multi-line element aligns its
 * attributes under the tag name, and flattening that makes it unreadable.
 */
function reindent(block, sourceIndent = 0, indent = '    ') {
  const lines = block.split('\n');
  if (lines.length === 1) return indent + lines[0].trim();

  // The block starts at its `<`, so its own leading whitespace is not part of
  // it — the opening tag's column comes from the source separately.
  const firstIndent = sourceIndent;
  return [
    indent + lines[0].trim(),
    ...lines.slice(1).map((l) => {
      if (!l.trim()) return '';
      const own = l.match(/^\s*/)[0].length;
      return indent + ' '.repeat(Math.max(0, own - firstIndent)) + l.trim();
    }),
  ].join('\n');
}

const light = parseDictionary(LIGHT);
const dark = parseDictionary(DARK);

const differing = [...light.keys()].filter(
  (k) => dark.has(k) && light.get(k).value !== null && light.get(k).value !== dark.get(k).value
);

// Elements with no simple text value (shadows) are emitted once, unified. That
// is only correct while they are genuinely identical in both modes — so check,
// rather than assume it stays true.
const unifiedButDiffering = [...light.keys()].filter(
  (k) => dark.has(k) && light.get(k).value === null
    && light.get(k).block.replace(/\s+/g, ' ') !== dark.get(k).block.replace(/\s+/g, ' ')
);
if (unifiedButDiffering.length) {
  console.error(
    `\n@dhcw/sr-maui: these resources differ between light and dark but have no simple\n`
    + `value, so the generator cannot emit a Dark twin for them:\n\n`
    + unifiedButDiffering.map((k) => `  ${k}`).join('\n')
    + `\n\nTeach build.mjs how to split them before shipping a dictionary that is wrong\n`
    + `in one of the two modes.\n`
  );
  process.exit(1);
}

const lines = [];
lines.push('<?xml version="1.0" encoding="utf-8"?>');
lines.push('<!--');
lines.push('    AUTO-GENERATED by packages/maui/build.mjs — do not edit by hand.');
lines.push('    Source of truth: foundations/tokens/**, via @dhcw/sr-tokens.');
lines.push('');
lines.push('    Every design value the Single Record mobile app should use, as XAML');
lines.push('    resources. Semantic tokens that change between light and dark carry a');
lines.push('    `Dark` twin, so a style can bind both at once:');
lines.push('');
lines.push('        {AppThemeBinding Light={StaticResource SrColorTextPrimary},');
lines.push('                         Dark={StaticResource SrColorTextPrimaryDark}}');
lines.push('');
lines.push('    Reach for the semantic names (SrColor…). The primitives below them');
lines.push('    (ColorBlue800 and friends) exist so the semantics have something to');
lines.push('    resolve to; binding a component straight to a primitive skips the layer');
lines.push('    that carries the meaning, and it will not follow a token change.');
lines.push('-->');
lines.push('<ResourceDictionary xmlns="http://schemas.microsoft.com/dotnet/2021/maui"');
lines.push('                    xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml">');
lines.push('');
lines.push('    <!-- ── Light mode, and every value that does not change with the theme ── -->');
for (const [key, entry] of light) {
  lines.push(reindent(entry.block, entry.sourceIndent));
}
lines.push('');
lines.push(`    <!-- ── Dark-mode overrides (${differing.length} semantic tokens) ────────────────────── -->`);
for (const key of differing) {
  const d = dark.get(key);
  lines.push(`    <${d.tag} x:Key="${key}Dark">${d.value}</${d.tag}>`);
}
lines.push('');
lines.push('</ResourceDictionary>');

const outPath = resolve(here, 'Colors.xaml');
writeFileSync(outPath, lines.join('\n') + '\n');

// ─── Validate Styles.xaml against what we just emitted ───────────────────────
const known = new Set([...light.keys(), ...differing.map((k) => `${k}Dark`)]);
const stylesPath = resolve(here, 'Styles.xaml');
let problems = [];

if (existsSync(stylesPath)) {
  const styles = readFileSync(stylesPath, 'utf8');

  // Every resource this file defines itself is also legitimately referenceable.
  for (const m of styles.matchAll(/x:Key="([^"]+)"/g)) known.add(m[1]);

  const seen = new Set();
  for (const m of styles.matchAll(/\{StaticResource\s+([^}]+?)\s*\}/g)) {
    const name = m[1].trim();
    if (seen.has(name)) continue;
    seen.add(name);
    if (!known.has(name)) problems.push(name);
  }

  // A style that hard-codes a colour has skipped the token layer entirely.
  //
  // In XAML the value almost always arrives as `<Setter Value="..." />` rather
  // than on a named colour attribute, so both forms are checked. Transparent is
  // not a colour choice — it is the absence of one — and stays allowed.
  const NAMED = 'Red|Blue|Green|Maroon|Navy|Teal|Olive|Purple|Silver|Black|White'
    + '|Gray|Grey|DarkGray|DarkGrey|LightGray|LightGrey|Orange|Yellow|Pink|Brown|Cyan|Magenta';
  const literalValue = new RegExp(`(?:Value|Color|BackgroundColor|TextColor|Stroke|Fill|BorderColor|PlaceholderColor|ThumbColor|OnColor|TitleColor)\\s*=\\s*"(#[0-9A-Fa-f]{3,8}|${NAMED})"`, 'g');
  for (const m of styles.matchAll(literalValue)) {
    problems.push(`literal colour "${m[1]}" — every colour must come from a token`);
  }
}

if (problems.length) {
  console.error(`\n@dhcw/sr-maui: ${problems.length} problem(s) in Styles.xaml:\n`);
  for (const p of problems) console.error(`  ${p}`);
  console.error('\nEvery colour must come from Colors.xaml. Add the token, or fix the reference.\n');
  process.exit(1);
}

console.log(
  `@dhcw/sr-maui: Colors.xaml written — ${light.size} resources, `
  + `${differing.length} with dark-mode twins.`
  + (existsSync(stylesPath) ? ' Styles.xaml references all resolve.' : ' (Styles.xaml not present yet.)')
);
