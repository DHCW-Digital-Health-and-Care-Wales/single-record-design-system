#!/usr/bin/env node
/**
 * Builds a `use_figma` script that runs the content rules INSIDE Figma and
 * returns only the findings, for pages too big to export whole. It is
 * content-rules.mjs plus the role guessing from export-text.js, so the rules
 * are the same ones the site build runs, with no copy to drift.
 *
 *   node scripts/figma/build-check-in-figma.mjs 5443:23237 [more ids…] > check.js
 *
 * Paste the output into use_figma. Output: { checked, findings: [{ id, path, role, rule, severity, found, fix }] }
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ids = process.argv.slice(2);
if (!ids.length) { console.error('Pass one or more Figma node ids.'); process.exit(2); }

const rules = readFileSync(join(here, '..', 'content-rules.mjs'), 'utf8').replace(/^export /gm, '');
const exporter = readFileSync(join(here, 'export-text.js'), 'utf8');
const roleFns = exporter.slice(exporter.indexOf('const styleName'), exporter.indexOf('const out = [];'));
const today = new Date().toISOString().slice(0, 10);

process.stdout.write(`${rules}
figma.skipInvisibleInstanceChildren = true;
${roleFns}
const findings = [];
let checked = 0;
for (const id of ${JSON.stringify(ids)}) {
  const root = await figma.getNodeByIdAsync(id);
  if (!root) continue;
  if (root.type === 'PAGE') await root.loadAsync();
  const texts = root.type === 'TEXT' ? [root] : root.findAllWithCriteria({ types: ['TEXT'] }).filter((n) => n.visible);
  for (const t of texts) {
    const s = t.characters.trim();
    if (!s) continue;
    checked++;
    const role = await roleOf(t);
    for (const f of checkText(s, { role, today: new Date('${today}') })) {
      const path = ancestors(t).reverse().map((a) => a.name).slice(-3).join(' / ');
      findings.push({ id: t.id, path, role, rule: f.rule, severity: f.severity, found: f.found.slice(0, 80), fix: String(f.fix).slice(0, 80) });
    }
  }
}
// Group repeats (the same text and rule in many layers) so the result stays
// small enough to come back through use_figma.
const groups = {};
for (const f of findings) {
  const k = f.rule + '|' + f.found;
  (groups[k] ||= { ...f, count: 0, ids: [] }).count++;
  if (groups[k].ids.length < 3) groups[k].ids.push(f.id);
}
const rows = Object.values(groups).sort((a, b) => (a.severity === b.severity ? b.count - a.count : a.severity === 'error' ? -1 : 1))
  .map(({ id, ...g }) => g);
return { checked, findings: findings.length, groups: rows.length, rows: rows.slice(0, 150) };
`);
