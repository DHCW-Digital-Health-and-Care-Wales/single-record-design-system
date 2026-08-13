// Generates Icons.xaml — the Single Record icon set as XAML path geometry.
//
// Why geometry rather than images:
//
//   MAUI can rasterise an SVG at build time via <MauiImage>, but the colour is
//   baked into the PNG it produces. These icons are stroke="currentColor"
//   outlines that have to take their colour from a token and follow the theme,
//   so a bitmap is the wrong container for them. As geometry on a Path, the
//   stroke is a normal bindable property:
//
//       <Path Data="{StaticResource SrIconNavSearch}"
//             Stroke="{AppThemeBinding Light={StaticResource SrColorTextPrimary},
//                                      Dark={StaticResource SrColorTextPrimaryDark}}" />
//
//   Same source SVGs as the web icon set (foundations/iconography/svg/), so the
//   two cannot drift.
//
// Every icon is a 24x24 viewBox, stroke-width 1 (DDR-023), round caps and joins. Consumers
// set Aspect="Uniform" and a Width/HeightRequest; the stroke scales with it.

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const SVG_ROOT = resolve(here, '../../foundations/iconography/svg');

if (!existsSync(SVG_ROOT)) {
  throw new Error(`${SVG_ROOT} is missing — the icon source of truth.`);
}

/** `nav/chevron-down` -> `SrIconNavChevronDown` */
function keyFor(group, name) {
  const pascal = (s) => s.split('-').map((p) => p[0].toUpperCase() + p.slice(1)).join('');
  return `SrIcon${pascal(group)}${pascal(name)}`;
}

const num = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) throw new Error(`non-numeric attribute value "${v}"`);
  // Trim float noise so the emitted geometry stays readable.
  return String(Math.round(n * 1000) / 1000);
};

function attrs(tag) {
  const out = {};
  // Digits belong in the name pattern: <line> carries x1/y1/x2/y2.
  for (const m of tag.matchAll(/([a-zA-Z][a-zA-Z0-9-]*)\s*=\s*"([^"]*)"/g)) out[m[1]] = m[2];
  return out;
}

// ── SVG shape -> path data ───────────────────────────────────────────────────
// XAML's path mini-language is a superset of what these icons use, so `d` is
// taken verbatim. The other three primitives have no XAML equivalent and are
// converted to equivalent path geometry.

function circleToPath({ cx, cy, r }) {
  const [x, y, rad] = [Number(cx), Number(cy), Number(r)];
  // Two half-arcs: a single arc cannot express a full circle unambiguously.
  return `M ${num(x - rad)},${num(y)} `
    + `a ${num(rad)},${num(rad)} 0 1,0 ${num(rad * 2)},0 `
    + `a ${num(rad)},${num(rad)} 0 1,0 ${num(-rad * 2)},0 Z`;
}

function rectToPath({ x = 0, y = 0, width, height, rx, ry }) {
  const [X, Y, W, H] = [Number(x), Number(y), Number(width), Number(height)];
  let RX = rx === undefined ? (ry === undefined ? 0 : Number(ry)) : Number(rx);
  let RY = ry === undefined ? RX : Number(ry);
  RX = Math.min(RX, W / 2);
  RY = Math.min(RY, H / 2);

  if (RX === 0 || RY === 0) {
    return `M ${num(X)},${num(Y)} H ${num(X + W)} V ${num(Y + H)} H ${num(X)} Z`;
  }
  return `M ${num(X + RX)},${num(Y)} `
    + `H ${num(X + W - RX)} A ${num(RX)},${num(RY)} 0 0,1 ${num(X + W)},${num(Y + RY)} `
    + `V ${num(Y + H - RY)} A ${num(RX)},${num(RY)} 0 0,1 ${num(X + W - RX)},${num(Y + H)} `
    + `H ${num(X + RX)} A ${num(RX)},${num(RY)} 0 0,1 ${num(X)},${num(Y + H - RY)} `
    + `V ${num(Y + RY)} A ${num(RX)},${num(RY)} 0 0,1 ${num(X + RX)},${num(Y)} Z`;
}

function lineToPath({ x1, y1, x2, y2 }) {
  return `M ${num(x1)},${num(y1)} L ${num(x2)},${num(y2)}`;
}

/**
 * Make a path's opening moveto absolute, without changing anything else.
 *
 * Each <path> element starts its own coordinate context at the origin, so a
 * leading relative `m x y` is equivalent to absolute `M x y`. Once several
 * elements become subpaths of ONE geometry that stops holding: a relative
 * moveto is measured from the previous subpath's end point, which displaces
 * the shape instead of failing.
 *
 * Simply upper-casing the `m` is wrong. In `m12 5 7 7-7 7` the trailing pairs
 * are IMPLICIT RELATIVE linetos inherited from the lowercase moveto; an
 * absolute `M` would make them absolute too and draw a different shape. So the
 * moveto is rewritten absolute and the remainder is re-attached under an
 * explicit relative `l`, preserving it exactly.
 */
function absoluteLeadingMoveto(d) {
  const s = d.trim();
  if (!s.startsWith('m')) return s;

  const NUM = /^[\s,]*(-?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)/;
  let rest = s.slice(1);
  const pair = [];
  for (let i = 0; i < 2; i++) {
    const m = NUM.exec(rest);
    if (!m) throw new Error(`malformed relative moveto in "${s.slice(0, 24)}…"`);
    pair.push(m[1]);
    rest = rest.slice(m[0].length);
  }
  rest = rest.replace(/^[\s,]+/, '');

  const moveto = `M${pair[0]},${pair[1]}`;
  if (rest === '') return moveto;
  // A letter next is an explicit command and keeps its own relativity. A bare
  // number is an implicit relative lineto that must be spelled out.
  return /^[a-zA-Z]/.test(rest) ? `${moveto} ${rest}` : `${moveto} l ${rest}`;
}

function svgToGeometry(src, label) {
  const parts = [];
  for (const m of src.matchAll(/<(path|circle|rect|line)\b([^>]*)>/g)) {
    const [, tag, rest] = m;
    const a = attrs(rest);
    try {
      if (tag === 'path') {
        if (!a.d) throw new Error('<path> with no d');
        // 30 of the 120 icons depend on this normalisation — see the function.
        parts.push(absoluteLeadingMoveto(a.d.replace(/\s+/g, ' ').trim()));
      } else if (tag === 'circle') parts.push(circleToPath(a));
      else if (tag === 'rect') parts.push(rectToPath(a));
      else if (tag === 'line') parts.push(lineToPath(a));
    } catch (e) {
      throw new Error(`${label}: ${e.message}`);
    }
  }
  if (!parts.length) throw new Error(`${label}: no drawable elements found`);

  // Every subpath must open with an ABSOLUTE moveto. A relative one would be
  // measured from the previous subpath's end point, which silently displaces
  // the shape rather than failing — so assert it rather than trusting it.
  for (const [i, p] of parts.entries()) {
    if (!p.startsWith('M')) {
      throw new Error(`${label}: subpath ${i + 1} opens with "${p.slice(0, 12)}…" — must be an absolute M`);
    }
  }

  // Concatenated subpaths: each begins with its own move command, which is
  // exactly how a multi-element icon becomes one geometry.
  return parts.join(' ');
}

// ── Walk the source tree ─────────────────────────────────────────────────────
const groups = readdirSync(SVG_ROOT, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

const icons = [];
for (const group of groups) {
  const files = readdirSync(join(SVG_ROOT, group)).filter((f) => f.endsWith('.svg')).sort();
  for (const file of files) {
    const name = file.replace(/\.svg$/, '');
    const src = readFileSync(join(SVG_ROOT, group, file), 'utf8');
    icons.push({
      group,
      name,
      key: keyFor(group, name),
      data: svgToGeometry(src, `${group}/${file}`),
    });
  }
}

const dupes = icons.map((i) => i.key).filter((k, i, a) => a.indexOf(k) !== i);
if (dupes.length) {
  throw new Error(`Icon key collision: ${[...new Set(dupes)].join(', ')}`);
}

// ── Emit ─────────────────────────────────────────────────────────────────────
const lines = [];
lines.push('<?xml version="1.0" encoding="utf-8"?>');
lines.push('<!--');
lines.push('    AUTO-GENERATED by packages/maui/build-icons.mjs — do not edit by hand.');
lines.push('    Source of truth: foundations/iconography/svg/ — the same SVGs the web');
lines.push('    icon set is built from, so the two cannot drift.');
lines.push('');
lines.push(`    ${icons.length} icons, each a 24x24 geometry drawn with stroke-width 1 and`);
lines.push('    round caps and joins. The geometry carries no colour: set Stroke from a');
lines.push('    token so the icon follows the theme.');
lines.push('');
lines.push('        <Path Data="{StaticResource SrIconNavSearch}"');
lines.push('              Stroke="{AppThemeBinding Light={StaticResource SrColorTextPrimary},');
lines.push('                                       Dark={StaticResource SrColorTextPrimaryDark}}"');
lines.push('              StrokeThickness="1" StrokeLineCap="Round" StrokeLineJoin="Round"');
lines.push('              Aspect="Uniform" HeightRequest="16" WidthRequest="16" />');
lines.push('');
lines.push('    Fill is deliberately unset. These are outline icons; filling them closes');
lines.push('    shapes that are meant to read as strokes.');
lines.push('-->');
lines.push('<ResourceDictionary xmlns="http://schemas.microsoft.com/dotnet/2021/maui"');
lines.push('                    xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml">');

let currentGroup = null;
for (const icon of icons) {
  if (icon.group !== currentGroup) {
    currentGroup = icon.group;
    const bar = '─'.repeat(Math.max(2, 62 - currentGroup.length));
    lines.push('');
    lines.push(`    <!-- ── ${currentGroup} ${bar} -->`);
  }
  // Path data contains no XML-special characters, but escape defensively.
  const safe = icon.data.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  lines.push(`    <x:String x:Key="${icon.key}">${safe}</x:String>`);
}

lines.push('');
lines.push('</ResourceDictionary>');

writeFileSync(resolve(here, 'Icons.xaml'), lines.join('\n') + '\n');

const byGroup = groups.map((g) => `${g} ${icons.filter((i) => i.group === g).length}`).join(', ');
console.log(`@dhcw/sr-maui: Icons.xaml written — ${icons.length} icons (${byGroup}).`);
