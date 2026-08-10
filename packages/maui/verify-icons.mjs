// Verifies Icons.xaml is geometrically equivalent to its source SVGs.
//
// Icons.xaml concatenates each SVG's several <path>/<circle>/<rect>/<line>
// elements into ONE geometry string. That is only safe if every subpath opens
// with an absolute moveto — a relative one is measured from the previous
// subpath's end point and silently displaces the shape.
//
// Reading the output cannot tell you whether that held. So this walks both
// forms and compares the absolute points they visit:
//
//   * the source, evaluating each element independently from the origin, and
//   * the emitted geometry, evaluated as one continuous path.
//
// Equal point sequences mean the concatenation preserved the drawing.

import { readFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const SVG_ROOT = resolve(here, '../../foundations/iconography/svg');

/** Absolute points a path visits, in order. Curve control points included. */
function walk(d) {
  const tokens = d.match(/[MmLlHhVvCcSsQqTtAaZz]|-?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/g) || [];
  const pts = [];
  let i = 0, cur = [0, 0], start = [0, 0], cmd = null;
  const n = () => Number(tokens[i++]);
  const push = (x, y) => { pts.push([Math.round(x * 1e4) / 1e4, Math.round(y * 1e4) / 1e4]); };

  while (i < tokens.length) {
    if (/[A-Za-z]/.test(tokens[i])) cmd = tokens[i++];
    const rel = cmd === cmd.toLowerCase();
    const C = cmd.toUpperCase();
    const bx = rel ? cur[0] : 0;
    const by = rel ? cur[1] : 0;

    if (C === 'M') {
      cur = [bx + n(), by + n()];
      start = [...cur];
      push(...cur);
      // Subsequent implicit pairs are linetos, inheriting this command's case.
      cmd = rel ? 'l' : 'L';
    } else if (C === 'L') {
      cur = [bx + n(), by + n()]; push(...cur);
    } else if (C === 'H') {
      cur = [bx + n(), cur[1]]; push(...cur);
    } else if (C === 'V') {
      cur = [cur[0], by + n()]; push(...cur);
    } else if (C === 'C') {
      push(bx + n(), by + n()); push(bx + n(), by + n());
      cur = [bx + n(), by + n()]; push(...cur);
    } else if (C === 'S' || C === 'Q') {
      push(bx + n(), by + n());
      cur = [bx + n(), by + n()]; push(...cur);
    } else if (C === 'T') {
      cur = [bx + n(), by + n()]; push(...cur);
    } else if (C === 'A') {
      const rx = n(), ry = n(), rot = n(), large = n(), sweep = n();
      cur = [bx + n(), by + n()];
      // Radii and flags are part of the shape, not just the endpoint.
      pts.push([`arc:${rx},${ry},${rot},${large},${sweep}`]);
      push(...cur);
    } else if (C === 'Z') {
      cur = [...start]; push(...cur);
    } else {
      throw new Error(`unknown command "${cmd}"`);
    }
  }
  return pts;
}

const fmt = (pts) => pts.map((p) => (p.length === 1 ? p[0] : `${p[0]},${p[1]}`)).join(' ');

// ── Rebuild the expected geometry, element by element, from the SVGs ─────────
const attrs = (t) => {
  const o = {};
  for (const m of t.matchAll(/([a-zA-Z][a-zA-Z0-9-]*)\s*=\s*"([^"]*)"/g)) o[m[1]] = m[2];
  return o;
};

const emitted = new Map();
const xaml = readFileSync(resolve(here, 'Icons.xaml'), 'utf8');
for (const m of xaml.matchAll(/<x:String x:Key="([^"]+)">([^<]*)<\/x:String>/g)) {
  emitted.set(m[1], m[2]);
}

const pascal = (s) => s.split('-').map((p) => p[0].toUpperCase() + p.slice(1)).join('');

let checked = 0;
const problems = [];

for (const group of readdirSync(SVG_ROOT, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)) {
  for (const file of readdirSync(join(SVG_ROOT, group)).filter((f) => f.endsWith('.svg'))) {
    const name = file.replace(/\.svg$/, '');
    const key = `SrIcon${pascal(group)}${pascal(name)}`;
    const src = readFileSync(join(SVG_ROOT, group, file), 'utf8');

    if (!emitted.has(key)) { problems.push(`${key}: missing from Icons.xaml`); continue; }

    // Expected: each element evaluated on its own, from the origin.
    const expected = [];
    for (const m of src.matchAll(/<(path|circle|rect|line)\b([^>]*)>/g)) {
      const a = attrs(m[2]);
      let d;
      if (m[1] === 'path') d = a.d;
      else if (m[1] === 'circle') {
        const [cx, cy, r] = [+a.cx, +a.cy, +a.r];
        d = `M ${cx - r},${cy} a ${r},${r} 0 1,0 ${r * 2},0 a ${r},${r} 0 1,0 ${-r * 2},0 Z`;
      } else if (m[1] === 'rect') {
        const [x, y, w, h] = [+(a.x ?? 0), +(a.y ?? 0), +a.width, +a.height];
        let rx = a.rx !== undefined ? +a.rx : (a.ry !== undefined ? +a.ry : 0);
        let ry = a.ry !== undefined ? +a.ry : rx;
        rx = Math.min(rx, w / 2); ry = Math.min(ry, h / 2);
        d = (rx === 0 || ry === 0)
          ? `M ${x},${y} H ${x + w} V ${y + h} H ${x} Z`
          : `M ${x + rx},${y} H ${x + w - rx} A ${rx},${ry} 0 0,1 ${x + w},${y + ry} `
            + `V ${y + h - ry} A ${rx},${ry} 0 0,1 ${x + w - rx},${y + h} `
            + `H ${x + rx} A ${rx},${ry} 0 0,1 ${x},${y + h - ry} `
            + `V ${y + ry} A ${rx},${ry} 0 0,1 ${x + rx},${y} Z`;
      } else {
        d = `M ${a.x1},${a.y1} L ${a.x2},${a.y2}`;
      }
      expected.push(...walk(d));
    }

    const actual = walk(emitted.get(key));
    if (fmt(expected) !== fmt(actual)) {
      problems.push(
        `${key}: geometry differs\n    source:  ${fmt(expected).slice(0, 150)}\n    emitted: ${fmt(actual).slice(0, 150)}`
      );
    }
    checked++;
  }
}

if (problems.length) {
  console.error(`\n@dhcw/sr-maui: ${problems.length} icon(s) do not match their source:\n`);
  for (const p of problems) console.error(`  ${p}`);
  console.error('');
  process.exit(1);
}

console.log(`@dhcw/sr-maui: ${checked} icons verified geometrically identical to their source SVGs.`);
