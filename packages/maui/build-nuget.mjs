// Assembles the DHCW.SingleRecord.Maui NuGet project from the generated XAML.
//
// Why this step exists at all: Colors.xaml, Icons.xaml and Styles.xaml are
// plain ResourceDictionaries, which is the right shape for a consumer who
// copies them into an app. A NuGet package cannot ship them that way and stay
// usable — a ResourceDictionary in a *referenced assembly* is merged by CLR
// type, not by file path:
//
//     xmlns:sr="clr-namespace:DHCW.SingleRecord.Maui;assembly=DHCW.SingleRecord.Maui"
//     <sr:SrColors />
//
// which requires each dictionary to carry an x:Class and have code-behind. So
// this script copies the three generated files in, injects the x:Class, and
// writes the matching partial classes. Everything it produces is derived —
// nothing here is hand-maintained, and editing the copies is pointless.
//
// Run after build-icons.mjs and build.mjs, via `npm run build:maui:nuget`.

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync } from 'node:fs';
import { resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(here, '../..');
const OUT = resolve(here, 'nuget');
const NS = 'DHCW.SingleRecord.Maui';

// SrStyles references SrColors keys and gets them by merging SrColors itself
// (see below), so merge order no longer decides whether an app starts.
const DICTS = [
  ['Colors.xaml', 'SrColors', 'Colour and elevation tokens, with dark-mode twins.'],
  ['Icons.xaml', 'SrIcons', 'Icon path geometry, one x:String per icon.'],
  ['Styles.xaml', 'SrStyles', 'Implicit and keyed control styles, and the type scale. Carries SrColors inside it, because a dictionary merged by type cannot see its siblings while it loads.'],
];

mkdirSync(OUT, { recursive: true });

// The package version comes from packages/maui/package.json, and is written
// into the csproj here rather than maintained in both places.
//
// This is not hypothetical tidiness: the npm release workflow hardcoded "0.1.0"
// in the URLs it advertises, the packages moved to 0.1.1, and nothing noticed —
// a release would have published four install URLs that 404. One source, patched
// by the build, is the shape that cannot drift.
const VERSION = JSON.parse(readFileSync(resolve(here, 'package.json'), 'utf8')).version;
const csprojPath = resolve(OUT, 'DHCW.SingleRecord.Maui.csproj');
const csproj = readFileSync(csprojPath, 'utf8');
const versioned = csproj.replace(
  /<Version>[^<]*<\/Version>/,
  `<Version>${VERSION}</Version>`
);
if (!/<Version>/.test(csproj)) {
  throw new Error('csproj has no <Version> element to set');
}
if (versioned !== csproj) writeFileSync(csprojPath, versioned);

for (const [file, cls, summary] of DICTS) {
  const src = readFileSync(resolve(here, file), 'utf8');

  // Inject x:Class on the ResourceDictionary root element.
  //
  // Two traps here, both of which this got wrong first time round:
  //   - `<ResourceDictionary\b` also matches `<ResourceDictionary.MergedDictionaries`,
  //     because \b permits the dot. Hence the (?![.\w]) lookahead.
  //   - Styles.xaml documents the merge order in a header comment containing
  //     that very element, so the first textual match was inside a comment.
  //     Comments are blanked before searching, then the offset is applied to
  //     the real source.
  const masked = src.replace(/<!--[\s\S]*?-->/g, (m) => ' '.repeat(m.length));
  const tag = /<ResourceDictionary(?![.\w])[^>]*>/.exec(masked);
  if (!tag) throw new Error(`${file}: no <ResourceDictionary> root element found`);
  const start = tag.index;
  const end = start + tag[0].length;
  const rootTag = src.slice(start, end);
  if (/x:Class=/.test(rootTag)) throw new Error(`${file}: already carries an x:Class`);
  // SrStyles merges SrColors INSIDE itself. A dictionary merged by type
  // (<sr:SrStyles />) is constructed on its own, before it is attached to the
  // app, so its {StaticResource SrColor…} lookups cannot see a sibling
  // <sr:SrColors /> however the consumer orders them. Every product following
  // the README crashed at launch with "StaticResource not found for key
  // SrColorTextPrimary" (found on BrowserStack, 2026-11-07). Merging it here
  // makes SrStyles self-sufficient; merging SrColors as well stays harmless.
  const selfMerge = cls === 'SrStyles'
    ? `\n    <ResourceDictionary.MergedDictionaries>\n        <local:SrColors />\n    </ResourceDictionary.MergedDictionaries>\n`
    : '';
  const patched = src.slice(0, start)
    + rootTag.replace(/>$/, (cls === 'SrStyles' ? `\n                    xmlns:local="clr-namespace:${NS}"` : '') + `\n                    x:Class="${NS}.${cls}">`)
    + selfMerge
    + src.slice(end);
  if (cls === 'SrStyles' && !/<local:SrColors \/>/.test(patched.replace(/<!--[\s\S]*?-->/g, ''))) {
    throw new Error('SrStyles.xaml: SrColors was not merged into it');
  }

  // Gate rather than trust: re-read the result and confirm x:Class actually
  // landed on the root. The first version of this script silently produced a
  // dictionary with no x:Class, which fails at the consumer's build, not here.
  const check = /<ResourceDictionary(?![.\w])[^>]*?x:Class="([^"]+)"[^>]*>/
    .exec(patched.replace(/<!--[\s\S]*?-->/g, ''));
  if (!check || check[1] !== `${NS}.${cls}`) {
    throw new Error(`${file}: x:Class was not applied to the root element`);
  }

  writeFileSync(resolve(OUT, `${cls}.xaml`), patched);
  writeFileSync(resolve(OUT, `${cls}.xaml.cs`),
`// AUTO-GENERATED by packages/maui/build-nuget.mjs — do not edit by hand.
namespace ${NS};

/// <summary>${summary}</summary>
public partial class ${cls} : ResourceDictionary
{
    public ${cls}() => InitializeComponent();
}
`);
}

// The {sr:Icon …} markup extension, the only supported way to put an icon on a
// Path (a StaticResource string is silently not drawn). Hand-written once in
// packages/maui/ and copied in, like the dictionaries.
writeFileSync(resolve(OUT, 'IconExtension.cs'),
  '// AUTO-COPIED from packages/maui/IconExtension.cs by build-nuget.mjs — edit that file.\n'
  + readFileSync(resolve(here, 'IconExtension.cs'), 'utf8'));

// Brand marks, wired up as MauiImage by buildTransitive/*.targets. MAUI asset
// names must be lowercase alphanumeric, so the hyphenated filenames are
// flattened here rather than left to fail at the consumer's build.
//
// "symbol" and "logo" must survive that flattening. An earlier version stripped
// both, which mapped wcp-symbol-blue and wcp-logo-blue onto the same name and
// silently overwrote three of the eleven marks — a consumer would have got the
// lockup where it asked for the icon. Hence the explicit sym/logo prefixes and
// the collision check below.
const BRAND_SRC = resolve(ROOT, 'figma/assets');
const BRAND_OUT = resolve(OUT, 'brand');
mkdirSync(BRAND_OUT, { recursive: true });
const brand = readdirSync(BRAND_SRC).filter((f) => f.endsWith('.svg'));
const taken = new Map();
for (const f of brand) {
  const stem = basename(f, '.svg');
  const kind = stem.includes('-symbol') ? 'sym' : 'logo';
  const flat = 'sr' + kind
    + stem.replace(/-symbol|-logo/g, '').replace(/[^a-z0-9]/gi, '').toLowerCase() + '.svg';
  if (taken.has(flat)) {
    throw new Error(
      `brand asset name collision: "${f}" and "${taken.get(flat)}" both flatten to `
      + `"${flat}". Rename one, or extend the flattening rule.`
    );
  }
  taken.set(flat, f);
  copyFileSync(resolve(BRAND_SRC, f), resolve(BRAND_OUT, flat));
}

const iconCount = (readFileSync(resolve(here, 'Icons.xaml'), 'utf8').match(/<x:String /g) || []).length;
console.log(
  `@dhcw/sr-maui: NuGet project assembled — v${VERSION}, ${DICTS.length} dictionaries `
  + `(${iconCount} icons), ${brand.length} brand marks.`
);
