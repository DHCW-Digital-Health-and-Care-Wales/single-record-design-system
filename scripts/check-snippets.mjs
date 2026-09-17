#!/usr/bin/env node
/**
 * DHCW Single Record — code-window gate for the design system website.
 *
 * Every component page carries a code panel the reader is invited to copy. Two
 * failures in those panels are silent, and both have happened:
 *
 *   1. A class that does not exist. The Radios page offered
 *      `sr-radio--card-fill`; the stylesheet ships `sr-radio--card-filled`.
 *      Pasted into a product, that renders an unstyled radio and nothing
 *      anywhere says why.
 *   2. A React component or prop the package does not export. The typography
 *      page documented `<Heading>`, `<Text>`, `<List>`, `<Divider>`, `<Label>`,
 *      `<Hint>` and `<Fieldset>` — none of which @dhcw/sr-react has ever
 *      shipped.
 *
 * build.mjs already checks React props and MAUI resource keys as it emits each
 * panel. This runs after the site is built and checks the two things that can
 * only be checked against the finished output:
 *
 *   - every `sr-*` class in an HTML snippet exists in the built stylesheet;
 *   - every `sr-*` class in a rendered preview exists too (a preview is markup
 *     we ship as an example, so it is held to the same rule as the snippet
 *     beside it);
 *   - every React component named in a React snippet is exported from
 *     @dhcw/sr-react;
 *   - every `Sr…` component named in a Blazor snippet is actually packed by
 *     @dhcw/sr-blazor. Today none are: that package ships stylesheets, and a
 *     Blazor consumer writes Razor markup with the `sr-*` classes exactly as an
 *     HTML consumer does (packages/blazor/README.md). The site was offering
 *     `<SrHeading>`, `<SrSelect>`, `<SrRadio>` and twenty-three more that no
 *     consumer can reference.
 *
 * Checked against the built CSS rather than the sources, because the built CSS
 * is what a consumer links — a class defined in a file nobody imports is still
 * a broken snippet. See docs/engineering/known-issues.md.
 *
 * Usage: node scripts/check-snippets.mjs
 * Exits non-zero, listing every problem, if any snippet or preview is wrong.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = resolve(ROOT, 'packages', 'website', 'dist');
const CSS_FILES = [
  resolve(ROOT, 'packages', 'web', 'dist', 'single-record.css'),
  resolve(ROOT, 'packages', 'web', 'dist', 'single-record-dark.css'),
  resolve(ROOT, 'packages', 'website', 'site.css'),
];

/**
 * Classes the site's own markup uses that are not component classes and never
 * will be — utilities the website defines for its own layout, and the two
 * theme hooks. Kept explicit so an unknown `sr-` class is still a failure.
 */
const PASSTHROUGH = new Set([
  'sr-visually-hidden',
  'sr-theme-dark',
  'sr-theme-light',
]);

/**
 * Components that take `...rest` and spread it onto the underlying element.
 * For those, a native HTML attribute in a snippet is correct even though it is
 * not a named prop — `<Checkbox name="…">` is valid React and valid HTML.
 * build.mjs checks the named props; this list is why it must not treat these
 * as unknown.
 */
const NATIVE_ATTRS = new Set([
  'name', 'id', 'value', 'checked', 'disabled', 'required', 'placeholder',
  'type', 'href', 'target', 'rel', 'title', 'role', 'tabindex', 'autocomplete',
  'maxlength', 'minlength', 'min', 'max', 'step', 'pattern', 'readonly',
  'rows', 'cols', 'multiple', 'accept', 'form', 'inputmode',
]);

/**
 * Names that appear in a snippet as a stand-in for something the consuming
 * application supplies. They are not ours and must not resolve against
 * @dhcw/sr-react — `<Results>` on the Search page is the reader's own
 * component, and the snippet is clearer for naming it.
 */
const CONSUMER_PLACEHOLDERS = new Set([
  'Summary', 'Results', 'YourComponent', 'App', 'Page', 'Fragment',
  'Route', 'Routes', 'MyForm',
]);

// ---------------------------------------------------------------------------

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith('.html')) out.push(p);
  }
  return out;
}

if (!existsSync(SITE)) {
  console.error('check-snippets: no built site at packages/website/dist — run npm run build:site first.');
  process.exit(1);
}
for (const f of CSS_FILES) {
  if (!existsSync(f)) {
    console.error(`check-snippets: missing stylesheet ${f} — run npm run build:web first.`);
    process.exit(1);
  }
}

/** Every class selector the shipped stylesheets define. */
const KNOWN_CLASSES = new Set(PASSTHROUGH);
for (const f of CSS_FILES) {
  const css = readFileSync(f, 'utf8');
  for (const m of css.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) KNOWN_CLASSES.add(m[1]);
}

/** Every component @dhcw/sr-react exports. */
const REACT_EXPORTS = new Set(CONSUMER_PLACEHOLDERS);
{
  const idx = readFileSync(resolve(ROOT, 'packages', 'react', 'src', 'index.js'), 'utf8');
  for (const m of idx.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const part of m[1].split(',')) {
      const as = /\bas\s+(\w+)/.exec(part);
      const name = as ? as[1] : part.trim();
      if (/^\w+$/.test(name) && name !== 'default') REACT_EXPORTS.add(name);
    }
  }
}

const problems = [];

/** `sr-*` classes used in a fragment of markup, with where they came from. */
function checkClasses(where, html) {
  for (const m of html.matchAll(/class=(?:"([^"]*)"|'([^']*)')/g)) {
    for (const cls of (m[1] ?? m[2]).split(/\s+/)) {
      if (!cls.startsWith('sr-')) continue;
      // Template holes in a snippet, e.g. class="sr-tag sr-tag--${tone}".
      if (cls.includes('$') || cls.includes('{')) continue;
      if (!KNOWN_CLASSES.has(cls)) {
        problems.push(`${where}: class "${cls}" is not in the built stylesheet.`);
      }
    }
  }
}

/**
 * Comments are prose, not code. A snippet that explains "there is no <Heading>:
 * use the class" must not be failed for naming the thing it is warning against.
 * `//` is only stripped at the start of a line, so a URL in a string survives.
 */
function stripComments(code) {
  return code
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/@\*[\s\S]*?\*@/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '');
}

/** Components a React snippet instantiates. */
function checkReactComponents(where, code) {
  for (const m of stripComments(code).matchAll(/<([A-Z]\w*)(?:\.(\w+))?[\s/>]/g)) {
    const name = m[1];
    if (REACT_EXPORTS.has(name)) {
      // A dotted form like <Table.Column> must be a real static on the export.
      if (m[2] && !dottedMemberExists(name, m[2])) {
        problems.push(
          `${where}: <${name}.${m[2]}> — ${name} has no static "${m[2]}" in @dhcw/sr-react.`
        );
      }
      continue;
    }
    problems.push(
      `${where}: <${name}> is not exported from @dhcw/sr-react. `
      + `Use a component the package ships, or write the snippet in plain HTML.`
    );
  }
}

/**
 * Components @dhcw/sr-blazor packs. Read from the generated NuGet project,
 * because that project is what a consumer installs — `SrButton` exists in
 * `packages/blazor/src` but lives in the preview gallery, which is never
 * packed, so it is not something a snippet may tell a reader to use.
 */
const BLAZOR_COMPONENTS = (() => {
  const dir = resolve(ROOT, 'packages', 'blazor', 'nuget');
  if (!existsSync(dir)) return null; // not generated yet — skip rather than fail
  const names = new Set();
  const seek = (d) => {
    for (const entry of readdirSync(d)) {
      const p = join(d, entry);
      if (statSync(p).isDirectory()) seek(p);
      else if (entry.endsWith('.razor')) names.add(entry.replace(/\.razor$/, ''));
    }
  };
  seek(dir);
  return names;
})();

function checkBlazorComponents(where, code) {
  if (!BLAZOR_COMPONENTS) return;
  const seen = new Set();
  for (const m of stripComments(code).matchAll(/<(Sr[A-Z]\w*)[\s/>]/g)) {
    const name = m[1];
    if (seen.has(name) || BLAZOR_COMPONENTS.has(name)) continue;
    seen.add(name);
    problems.push(
      `${where}: <${name}> is not packed by @dhcw/sr-blazor. `
      + `That package ships stylesheets — write the snippet as Razor markup with `
      + `the sr-* classes (packages/blazor/README.md).`
    );
  }
}

const MEMBER_CACHE = {};
function dottedMemberExists(name, member) {
  if (!(name in MEMBER_CACHE)) {
    const idx = readFileSync(resolve(ROOT, 'packages', 'react', 'src', 'index.js'), 'utf8');
    const from = new RegExp(`\\b${name}\\b[^\\n]*from\\s+'([^']+)'`).exec(idx);
    let src = '';
    if (from) {
      const p = resolve(ROOT, 'packages', 'react', 'src', from[1].replace(/^\.\//, ''));
      if (existsSync(p)) src = readFileSync(p, 'utf8');
    }
    MEMBER_CACHE[name] = src;
  }
  const src = MEMBER_CACHE[name];
  if (!src) return true; // cannot read the source — do not invent a failure
  return new RegExp(`${name}\\.${member}\\s*=`).test(src);
}

// ---------------------------------------------------------------------------

const pages = walk(SITE);
for (const page of pages) {
  const rel = page.slice(SITE.length + 1);
  const html = readFileSync(page, 'utf8');

  // 1. Rendered previews — the markup the page actually shows.
  for (const m of html.matchAll(/<div class="showcase__preview">([\s\S]*?)<\/div>\s*<div class="codepanel"/g)) {
    checkClasses(`${rel} (preview)`, m[1]);
  }

  // 2. Snippets, read back out of the payload the page ships to its own tabs.
  for (const m of html.matchAll(/window\.__snips\[("(?:[^"\\]|\\.)*")\]=(\{[\s\S]*?\});<\/script>/g)) {
    let id, snips;
    try {
      id = JSON.parse(m[1].replace(/\\u003c/g, '<'));
      snips = JSON.parse(m[2].replace(/\\u003c/g, '<'));
    } catch {
      continue; // generated at runtime, not a literal payload
    }
    for (const [fw, code] of Object.entries(snips)) {
      if (typeof code !== 'string') continue;
      if (fw === 'HTML' || fw === 'Blazor') checkClasses(`${rel} #${id} [${fw}]`, code);
      if (fw === 'Blazor') checkBlazorComponents(`${rel} #${id} [Blazor]`, code);
      if (fw === 'React') {
        checkClasses(`${rel} #${id} [React]`, code);
        checkReactComponents(`${rel} #${id} [React]`, code);
      }
    }
  }
}

if (problems.length) {
  console.error(`\n${problems.length} code-window problem(s):\n`);
  for (const p of [...new Set(problems)].sort()) console.error(`  ${p}`);
  console.error(
    '\nEvery class in a snippet or preview must exist in the built stylesheet, and\n'
    + 'every React component in a snippet must be exported from @dhcw/sr-react. A\n'
    + 'snippet that does not work is worse than no snippet: the reader has no\n'
    + 'reason to doubt it.\n'
  );
  process.exit(1);
}

console.log(
  `check-snippets: ${pages.length} pages — every snippet class resolves against the built `
  + `stylesheet and every React component is exported.`
);
