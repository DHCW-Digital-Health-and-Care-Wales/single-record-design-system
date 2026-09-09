// Fails if a workflow uploads an artifact without setting retention-days.
//
// Why this exists: deploy-pages.yml ran on a `*/30 * * * *` schedule with no
// repo guard on the build job, so the personal source repo rebuilt and
// re-uploaded the whole site — website + Storybook, ~190 files — 48 times a
// day. actions/upload-artifact defaults to 90-day retention, so nothing ever
// aged out. That filled the account's 0.5 GB Actions storage quota, and once
// full, every run failed at the upload step:
//
//     Failed to CreateArtifact: Artifact storage quota has been hit.
//
// The failure is badly placed for diagnosis. It surfaces as "Deploy DS site:
// some jobs were not successful" on a *scheduled* run, so the mail arrives at
// 3am attached to a commit nobody made, and the build logs above it are a
// clean, successful Storybook build. Nothing points at retention.
//
// Retention is invisible when you write the step and only matters months
// later, which is exactly the shape of thing that should be a check rather
// than a note in a handoff. An artifact is a build output, not a record; if
// one genuinely needs the 90-day default, set `retention-days: 90` explicitly
// and this passes — the point is that the number is a decision someone made,
// not a default nobody saw.
//
// Run via `npm run check:workflows`, and as part of `npm run check`.

import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = resolve(ROOT, '.github/workflows');

// Artifacts live at most this long unless a step says why not. See the
// retention check below for how this number was arrived at.
const MAX_RETENTION_DAYS = 14;

// Deliberately not a YAML parse. The only YAML library in the tree is a
// transitive dependency of something else, and promoting it to a direct one
// needs a DDR (CLAUDE.md). These are our own workflow files in a house style,
// so an indentation-aware scan is enough and costs nothing.
const files = readdirSync(DIR).filter((f) => /\.ya?ml$/.test(f)).sort();

const problems = [];

for (const file of files) {
  const path = resolve(DIR, file);
  const lines = readFileSync(path, 'utf8').split('\n');

  for (let i = 0; i < lines.length; i++) {
    const m = /^(\s*)(- )?uses:\s*actions\/upload-artifact@/.exec(lines[i]);
    if (!m) continue;

    // `keyIndent` is the column the step's own keys sit at — the same whether
    // the step is written `- uses: ...` or `- name: ...` with `uses:` on the
    // line below. Getting this wrong is easy: reading it off the `uses:` line
    // directly treats a `- name:`-first step as ending at its own `with:`,
    // which silently reports every such step as missing retention. This check
    // did exactly that on its first run.
    const keyIndent = m[1].length + (m[2] ? m[2].length : 0);
    const dashIndent = keyIndent - 2;
    const startsStep = (line) =>
      dashIndent >= 0 && line.startsWith(`${' '.repeat(dashIndent)}- `);

    // Walk back to the top of this step, then forward to the next one.
    let start = i;
    while (start > 0 && !startsStep(lines[start])) start--;

    let found = false;
    for (let j = start + 1; j < lines.length; j++) {
      const line = lines[j];
      if (!line.trim() || line.trim().startsWith('#')) continue;

      const indent = line.search(/\S/);
      if (indent < keyIndent || startsStep(line)) break; // next step — done

      const r = line.match(/^\s*retention-days:\s*(\d+)/);
      if (r) {
        found = true;
        // Setting a number was the original bar, and it turned out to be too
        // low a one. On 2026-09-09 the account hit 90% of its 0.5 GB with every
        // upload carrying an explicit, passing retention: a 27 MB APK at 30
        // days and a 3.25 MB site at 7. Both were deliberate numbers, and
        // together they were still most of the quota.
        //
        // The quota is 0.5 GB and there is no budget for a larger plan, so a
        // ceiling is a real constraint rather than tidiness. Anything above it
        // has to say why in the workflow, next to the number.
        const days = Number(r[1]);
        if (days > MAX_RETENTION_DAYS && !/# *quota-ok\b/.test(line)) {
          problems.push(
            `${relative(ROOT, path)}:${j + 1}\n`
            + `    retention-days: ${days} exceeds the ${MAX_RETENTION_DAYS}-day ceiling.\n`
            + `    The account has 0.5 GB of Actions storage and no budget for more.\n`
            + `    Lower it, or append \`# quota-ok\` with a reason if it genuinely `
            + `has to be kept longer.`
          );
        }
        break;
      }
    }

    if (!found) {
      problems.push(
        `${relative(ROOT, path)}:${i + 1}\n`
        + `    actions/upload-artifact step has no \`retention-days\`, so it `
        + `keeps artifacts for\n    the 90-day default.`
      );
    }
  }
}

if (problems.length) {
  console.error(
    `\ncheck:workflows — ${problems.length} artifact retention problem(s):\n\n  `
    + problems.join('\n\n  ')
    + '\n\nArtifact retention is what fills the 0.5 GB Actions storage quota, and a full\n'
    + 'quota fails every subsequent run at the upload step. Set `retention-days`\n'
    + `explicitly and keep it at or under ${MAX_RETENTION_DAYS}.\n`
  );
  process.exit(1);
}

// ─── Publishing workflows must be pinned to the org repo ─────────────────────
//
// The mirror copies `main` wholesale, so every workflow file exists in BOTH the
// personal upstream and the DHCW org repo. Anything that publishes outside this
// repository therefore needs a repo guard, or the same release fires twice from
// two places.
//
// For publish-nuget.yml the guard decides more than who runs it: the push
// target is nuget.pkg.github.com/${{ github.repository_owner }}, so an unguarded
// run from the personal upstream publishes to a personal feed nobody reads,
// and reports success. That failure is invisible until a MAUI developer says
// the package never appeared.
//
// Deliberately keyed on the workflow *filename* rather than sniffing for
// publish commands: a new publishing workflow should have to be added here on
// purpose, which is a moment to think about where it runs.
const ORG_REPO = 'DHCW-Digital-Health-and-Care-Wales/single-record-design-system';
const MUST_BE_ORG_ONLY = ['release-packages.yml', 'publish-nuget.yml'];

const unguarded = MUST_BE_ORG_ONLY.filter((name) => {
  if (!files.includes(name)) return false;
  const body = readFileSync(resolve(DIR, name), 'utf8');
  return !body.includes(`github.repository == '${ORG_REPO}'`);
});

if (unguarded.length) {
  console.error(
    `\ncheck:workflows — ${unguarded.length} publishing workflow(s) with no org guard:\n\n  `
    + unguarded.map((n) => `.github/workflows/${n}`).join('\n  ')
    + `\n\nEach needs, on its job:\n\n`
    + `    if: github.repository == '${ORG_REPO}'\n\n`
    + 'Without it the workflow also runs in the personal upstream, which the mirror\n'
    + 'keeps byte-identical — so one release publishes twice, and for NuGet the\n'
    + 'second copy lands in a feed no consumer is configured to read.\n'
  );
  process.exit(1);
}

const count = files.length;
console.log(
  `check:workflows — ${count} workflow${count === 1 ? '' : 's'}, `
  + 'all artifact uploads set retention-days, '
  + `${MUST_BE_ORG_ONLY.length} publishing workflow(s) pinned to the org repo.`
);
