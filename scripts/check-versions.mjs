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

// ---------------------------------------------------------------------------
// The lock file has to agree with the manifests, not just the manifests with
// each other.
//
// Everything above passed while CI was red for two days. Adding
// packages/blazor to the root `workspaces` array without regenerating the lock
// left `npm ci` refusing to install at all — "Missing: @dhcw/sr-blazor from
// lock file" — which is the FIRST step of every workflow, so the hourly Pages
// deploy failed before it built anything, and the failure said nothing about
// Blazor's absence from a list.
//
// Nothing local catches this: `npm install` fixes the lock as a side effect of
// running, and every build here uses an already-linked node_modules. Only a
// clean `npm ci` sees it, and the cheapest place to run one of those was CI.
// So the drift gets checked directly, offline, in milliseconds.

const lock = read('package-lock.json');
const lockRoot = lock.packages?.[''] ?? {};

const lockWorkspaces = new Set(lockRoot.workspaces ?? []);
for (const w of root.workspaces) {
  if (!lockWorkspaces.has(w)) {
    problems.push(
      `package-lock.json\n    workspace "${w}" is in package.json but not in the lock file`
    );
  }
}
for (const w of lockWorkspaces) {
  if (!root.workspaces.includes(w)) {
    problems.push(
      `package-lock.json\n    workspace "${w}" is in the lock file but no longer in package.json`
    );
  }
}

for (const f of manifests) {
  const dir = dirname(f);
  const d = read(f);
  const entry = lock.packages?.[dir];

  if (!entry) {
    problems.push(
      `package-lock.json\n    no entry for "${dir}" (${d.name}) — a clean install cannot resolve it`
    );
    continue;
  }

  // A version bump that never reached the lock is the same class of bug as a
  // missing workspace, and produces the same EUSAGE refusal.
  if (entry.version && d.version && entry.version !== d.version) {
    problems.push(
      `package-lock.json\n    "${dir}" is ${entry.version} in the lock but `
      + `${d.version} in ${f}`
    );
  }

  // And the internal ranges are recorded in both places, so they can drift in
  // both places.
  for (const section of ['dependencies', 'peerDependencies', 'devDependencies']) {
    for (const [name, range] of Object.entries(d[section] ?? {})) {
      if (!name.startsWith('@dhcw/')) continue;
      const locked = entry[section]?.[name];
      if (locked !== undefined && locked !== range) {
        problems.push(
          `package-lock.json\n    "${dir}" ${section} "${name}": lock says `
          + `"${locked}", ${f} says "${range}"`
        );
      }
    }
  }
}

if (problems.length) {
  console.error(
    `\ncheck:versions — ${problems.length} problem(s):\n\n  `
    + problems.join('\n\n  ')
    + '\n\nA clean `npm ci` will fail on these — which means every workflow fails at\n'
    + 'its install step, before it builds or tests anything.\n'
    + 'Fix the ranges, then run `npm install --package-lock-only` and commit the lock.\n'
  );
  process.exit(1);
}

console.log(
  `check:versions — ${versions.size} workspaces, internal ranges consistent, `
  + 'lock file in sync.'
);
