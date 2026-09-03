// Fails if the workspaces disagree about versions.
//
// Why this exists: bumping the five published packages to 0.2.0 left the
// internal cross-dependency ranges at "^0.1.1". A caret range on a 0.x version
// is confined to that minor, so ^0.1.1 does not accept 0.2.0 — npm stopped
// treating them as workspace links, went to the public registry for
// @dhcw/sr-icons, and got a 404. Every local build kept working, because
// node_modules was already linked; only a clean `npm ci` failed, which meant
// finding out from CI.
//
// The bug is cheap to make (one manifest was missed — the prototype under
// products/, which is a workspace but does not live in packages/) and slow to
// diagnose from a 404 for a package that was never meant to be on npmjs.org.
// So it gets a check that runs in milliseconds, before the two-minute CI trip.
//
// Run via `npm run check:versions`, and as part of `npm run check`.

import { readFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => JSON.parse(readFileSync(resolve(ROOT, p), 'utf8'));

const root = read('package.json');

// Drive off the declared workspaces, not a glob. A hand-written
// `packages/*/package.json` is exactly what missed the prototype.
const manifests = root.workspaces.flatMap((w) =>
  globSync(`${w}/package.json`, { cwd: ROOT })
);

const versions = new Map();
for (const f of manifests) {
  const d = read(f);
  if (d.name) versions.set(d.name, { version: d.version, file: f });
}

const problems = [];

for (const f of manifests) {
  const d = read(f);
  for (const section of ['dependencies', 'peerDependencies', 'devDependencies']) {
    for (const [name, range] of Object.entries(d[section] ?? {})) {
      if (!name.startsWith('@dhcw/')) continue;
      const target = versions.get(name);
      if (!target) continue; // not a workspace — e.g. a tarball URL in a product

      // Only caret ranges are checked; a tarball URL or "*" is a deliberate
      // choice. The prerelease part is matched too, so `^0.2.1-rc.0` is
      // inspected rather than silently skipped — see below for why that
      // matters.
      if (!/^\^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(range)) continue;

      // The rule is exact agreement, not semver satisfaction: a caret range on
      // an internal package must name that package's current version exactly.
      //
      // This is stricter than semver, deliberately. The five packages are
      // versioned in lockstep and released together, so any drift between a
      // range and its target is a mistake rather than a decision — and the
      // alternative is reimplementing semver here, which would need a
      // dependency (CLAUDE.md: not without a DDR) or a hand-rolled comparator
      // that is exactly the kind of thing that looks right and is not.
      //
      // It catches both traps this repo has actually hit:
      //
      //   ^0.1.1 against 0.2.0      caret on 0.x is minor-locked, so this does
      //                             not resolve, and only a clean npm ci says so
      //   ^0.2.0 against 0.2.1-rc.0 a prerelease satisfies a range only when
      //                             the range carries a prerelease at the same
      //                             version, so this does not resolve either.
      //                             Verified with semver.satisfies: false.
      const expected = `^${target.version}`;

      if (range !== expected) {
        problems.push(
          `${f}\n    ${section} "${name}": "${range}" should be "${expected}" `
          + `(${target.file} is ${target.version})`
        );
      }
    }
  }
}

if (problems.length) {
  console.error(
    `\ncheck:versions — ${problems.length} internal range(s) out of step:\n\n  `
    + problems.join('\n\n  ')
    + '\n\nA clean `npm ci` will fail on these: npm stops linking the workspace and\n'
    + 'tries the public registry, where these packages do not exist.\n'
    + 'Fix the ranges, then run `npm install --package-lock-only`.\n'
  );
  process.exit(1);
}

console.log(
  `check:versions — ${versions.size} workspaces, all internal ranges consistent.`
);
