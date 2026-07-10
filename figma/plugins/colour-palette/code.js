// SR Colour Palette Generator
// Generates a documented colour palette frame on the current page.
// Run once via Plugins → Development → Run.

// ─── Token data ────────────────────────────────────────────────────────────────

const PRIMITIVES = [
  {
    group: 'Blue',
    description: 'NHS Wales Blue — primary brand',
    swatches: [
      { name: 'blue-900', hex: '#1E3050' },
      { name: 'blue-800', hex: '#325083', tag: 'Brand primary' },
      { name: 'blue-700', hex: '#3D6199' },
      { name: 'blue-600', hex: '#4C72AE' },
      { name: 'blue-500', hex: '#5C6991' },
      { name: 'blue-400', hex: '#828DAC' },
      { name: 'blue-300', hex: '#AAB1C6' },
      { name: 'blue-200', hex: '#D4D8E2' },
      { name: 'blue-100', hex: '#ECEEF3' },
      { name: 'blue-50',  hex: '#F4F5F8' },
    ],
  },
  {
    group: 'Cyan',
    description: 'DHCW Blue — secondary / accent',
    swatches: [
      { name: 'cyan-900', hex: '#0A6A84' },
      { name: 'cyan-800', hex: '#0D8BAD' },
      { name: 'cyan-700', hex: '#12A3C9', tag: 'Brand secondary' },
      { name: 'cyan-600', hex: '#71ACCD' },
      { name: 'cyan-500', hex: '#8DC0DA' },
      { name: 'cyan-400', hex: '#AFD4E5' },
      { name: 'cyan-300', hex: '#D6EAF2' },
      { name: 'cyan-100', hex: '#EBF5FA' },
      { name: 'cyan-50',  hex: '#F4FAFC' },
    ],
  },
  {
    group: 'Navy',
    description: 'DHCW Navy',
    swatches: [
      { name: 'navy-900', hex: '#1B294A' },
      { name: 'navy-700', hex: '#464C64' },
      { name: 'navy-500', hex: '#707488' },
      { name: 'navy-300', hex: '#9EA1AF' },
      { name: 'navy-100', hex: '#CDCFD6' },
    ],
  },
  {
    group: 'Status',
    description: 'Semantic status colours',
    swatches: [
      { name: 'red-600',    hex: '#D5281B', tag: 'Critical' },
      { name: 'red-100',    hex: '#FCDBD9', tag: 'Critical surface' },
      { name: 'green-600',  hex: '#007F3B', tag: 'Success' },
      { name: 'green-100',  hex: '#D9EFE5', tag: 'Success surface' },
      { name: 'yellow-500', hex: '#F8CA4D', tag: 'Warning' },
      { name: 'yellow-100', hex: '#FDF6DC', tag: 'Warning surface' },
      { name: 'info-blue',  hex: '#005AA8', tag: 'Info' },
      { name: 'info-blue-100', hex: '#D6E8F5', tag: 'Info surface' },
      { name: 'focus-yellow', hex: '#FFEB3B', tag: 'Focus ring' },
    ],
  },
  {
    group: 'Neutral',
    description: 'UI grey palette',
    swatches: [
      { name: 'grey-900', hex: '#212B32', tag: 'Primary text' },
      { name: 'grey-800', hex: '#2C3A44', tag: 'Strong text on tints' },
      { name: 'grey-700', hex: '#3B4E5B', tag: 'Heading on grey' },
      { name: 'grey-600', hex: '#4C6272', tag: 'Secondary text' },
      { name: 'grey-500', hex: '#768692', tag: 'Placeholder / muted' },
      { name: 'grey-400', hex: '#AEB7BD', tag: 'Border / divider' },
      { name: 'grey-300', hex: '#C6CDD1', tag: 'Subtle divider' },
      { name: 'grey-200', hex: '#D8DDE0', tag: 'Border default' },
      { name: 'grey-100', hex: '#F0F4F5', tag: 'Surface default' },
      { name: 'grey-50',  hex: '#F7FAFA', tag: 'Lightest wash' },
      { name: 'white',    hex: '#FFFFFF' },
    ],
  },
];

const SEMANTIC = [
  {
    group: 'Interactive',
    swatches: [
      { name: 'sr.color.interactive.primary',       hex: '#325083', ref: 'blue-800' },
      { name: 'sr.color.interactive.primary-hover', hex: '#1E3050', ref: 'blue-900' },
      { name: 'sr.color.interactive.secondary',     hex: '#1B294A', ref: 'navy-900' },
      { name: 'sr.color.interactive.link',          hex: '#005AA8', ref: 'info-blue' },
      { name: 'sr.color.interactive.destructive',   hex: '#D5281B', ref: 'red-600' },
    ],
  },
  {
    group: 'Surface',
    swatches: [
      { name: 'sr.color.surface.default', hex: '#F0F4F5', ref: 'grey-100' },
      { name: 'sr.color.surface.card',    hex: '#FFFFFF', ref: 'white' },
      { name: 'sr.color.surface.accent',  hex: '#EBF5FA', ref: 'cyan-100' },
      { name: 'sr.color.surface.subtle',  hex: '#F4F5F8', ref: 'blue-50' },
      { name: 'sr.color.surface.header',  hex: '#1B294A', ref: 'navy-900' },
    ],
  },
  {
    group: 'Text',
    swatches: [
      { name: 'sr.color.text.primary',   hex: '#212B32', ref: 'grey-900' },
      { name: 'sr.color.text.secondary', hex: '#4C6272', ref: 'grey-600' },
      { name: 'sr.color.text.inverse',   hex: '#FFFFFF', ref: 'white' },
    ],
  },
  {
    group: 'Border',
    swatches: [
      { name: 'sr.color.border.default', hex: '#D8DDE0', ref: 'grey-200' },
      { name: 'sr.color.border.strong',  hex: '#4C6272', ref: 'grey-600' },
      { name: 'sr.color.border.focus',   hex: '#FFEB3B', ref: 'focus-yellow' },
    ],
  },
  {
    group: 'Status',
    swatches: [
      { name: 'sr.color.status.critical',         hex: '#D5281B', ref: 'red-600' },
      { name: 'sr.color.status.critical-surface', hex: '#FCDBD9', ref: 'red-100' },
      { name: 'sr.color.status.success',          hex: '#007F3B', ref: 'green-600' },
      { name: 'sr.color.status.success-surface',  hex: '#D9EFE5', ref: 'green-100' },
      { name: 'sr.color.status.warning',          hex: '#F8CA4D', ref: 'yellow-500' },
      { name: 'sr.color.status.warning-surface',  hex: '#FDF6DC', ref: 'yellow-100' },
      { name: 'sr.color.status.info',             hex: '#005AA8', ref: 'info-blue' },
      { name: 'sr.color.status.info-surface',     hex: '#D6E8F5', ref: 'info-blue-100' },
    ],
  },
];

// ─── Layout constants ──────────────────────────────────────────────────────────

const SWATCH_W       = 160;
const SWATCH_H       = 100;
const SWATCH_GAP     = 16;
const GROUP_GAP      = 56;
const SECTION_GAP    = 80;
const LABEL_H        = 52;
const PAGE_PAD       = 64;
const SECTION_TITLE_H = 40;
const GROUP_TITLE_H   = 32;

const BG             = { r: 0.941, g: 0.957, b: 0.961 }; // grey-100 #F0F4F5
const TEXT_DARK      = { r: 0.129, g: 0.169, b: 0.196 }; // grey-900 #212B32
const TEXT_MID       = { r: 0.298, g: 0.384, b: 0.447 }; // grey-600 #4C6272
const BRAND          = { r: 0.196, g: 0.314, b: 0.514 }; // blue-800 #325083

// ─── Helpers ───────────────────────────────────────────────────────────────────

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16) / 255,
    g: parseInt(h.slice(2, 4), 16) / 255,
    b: parseInt(h.slice(4, 6), 16) / 255,
  };
}

function luminance({ r, g, b }) {
  const sRGB = [r, g, b].map(c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}

function contrastRatio(fg, bg) {
  const l1 = luminance(fg), l2 = luminance(bg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function textOnBackground(hex) {
  const bg = hexToRgb(hex);
  const white = { r: 1, g: 1, b: 1 };
  const dark  = { r: 0.129, g: 0.169, b: 0.196 }; // grey-900
  return contrastRatio(white, bg) >= contrastRatio(dark, bg) ? white : dark;
}

function createText(content, fontSize, color, x, y, w, h) {
  const t = figma.createText();
  t.x = x; t.y = y;
  t.resize(w, h);
  t.characters = content;
  t.fontSize = fontSize;
  t.fills = [{ type: 'SOLID', color }];
  t.textAlignVertical = 'CENTER';
  return t;
}

async function loadFonts() {
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
  await figma.loadFontAsync({ family: 'Inter', style: 'SemiBold' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
}

// ─── Swatch builder ────────────────────────────────────────────────────────────

function buildSwatch(swatch, x, y, showRef = false) {
  const frame = figma.createFrame();
  frame.x = x; frame.y = y;
  frame.resize(SWATCH_W, SWATCH_H + LABEL_H);
  frame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  frame.cornerRadius = 8;
  frame.clipsContent = true;

  // Colour block
  const block = figma.createRectangle();
  block.x = 0; block.y = 0;
  block.resize(SWATCH_W, SWATCH_H);
  const rgb = hexToRgb(swatch.hex);
  block.fills = [{ type: 'SOLID', color: rgb }];

  // Tag badge (optional)
  if (swatch.tag) {
    const badgeFg = textOnBackground(swatch.hex);
    const badge = figma.createText();
    badge.x = 8; badge.y = SWATCH_H - 24;
    badge.resize(SWATCH_W - 16, 20);
    badge.characters = swatch.tag;
    badge.fontSize = 10;
    badge.fontName = { family: 'Inter', style: 'Medium' };
    badge.fills = [{ type: 'SOLID', color: badgeFg, opacity: 0.75 }];
    frame.appendChild(badge);
  }

  // Label area
  const labelBg = figma.createRectangle();
  labelBg.x = 0; labelBg.y = SWATCH_H;
  labelBg.resize(SWATCH_W, LABEL_H);
  labelBg.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];

  const nameText = figma.createText();
  nameText.x = 10; nameText.y = SWATCH_H + 6;
  nameText.resize(SWATCH_W - 12, 18);
  nameText.characters = swatch.name;
  nameText.fontSize = 11;
  nameText.fontName = { family: 'Inter', style: 'Medium' };
  nameText.fills = [{ type: 'SOLID', color: TEXT_DARK }];

  const hexText = figma.createText();
  hexText.x = 10; hexText.y = SWATCH_H + 24;
  hexText.resize(SWATCH_W - 12, 14);
  hexText.characters = swatch.hex.toUpperCase();
  hexText.fontSize = 10;
  hexText.fills = [{ type: 'SOLID', color: TEXT_MID }];

  if (showRef && swatch.ref) {
    const refText = figma.createText();
    refText.x = 10; refText.y = SWATCH_H + 38;
    refText.resize(SWATCH_W - 12, 12);
    refText.characters = `→ ${swatch.ref}`;
    refText.fontSize = 9;
    refText.fills = [{ type: 'SOLID', color: TEXT_MID, opacity: 0.65 }];
    frame.appendChild(refText);
  }

  frame.appendChild(block);
  frame.appendChild(labelBg);
  frame.appendChild(nameText);
  frame.appendChild(hexText);

  return frame;
}

// ─── Group builder ─────────────────────────────────────────────────────────────

function buildGroup(groupData, startX, startY, showRef = false) {
  const swatches = groupData.swatches;
  const totalW = swatches.length * (SWATCH_W + SWATCH_GAP) - SWATCH_GAP;
  const totalH = GROUP_TITLE_H + 8 + SWATCH_H + LABEL_H;

  const group = figma.createFrame();
  group.x = startX; group.y = startY;
  group.resize(totalW, totalH);
  group.fills = [];
  group.name = groupData.group;

  // Group title
  const title = figma.createText();
  title.x = 0; title.y = 0;
  title.resize(totalW, GROUP_TITLE_H);
  title.characters = groupData.group;
  title.fontSize = 14;
  title.fontName = { family: 'Inter', style: 'SemiBold' };
  title.fills = [{ type: 'SOLID', color: TEXT_DARK }];
  title.textAlignVertical = 'CENTER';

  if (groupData.description) {
    title.resize(totalW, GROUP_TITLE_H - 4);
    const desc = figma.createText();
    desc.x = 0; desc.y = GROUP_TITLE_H - 4;
    desc.resize(totalW, 16);
    desc.characters = groupData.description;
    desc.fontSize = 11;
    desc.fills = [{ type: 'SOLID', color: TEXT_MID }];
    group.appendChild(desc);
  }

  group.appendChild(title);

  swatches.forEach((swatch, i) => {
    const sx = i * (SWATCH_W + SWATCH_GAP);
    const sy = GROUP_TITLE_H + 8;
    const sw = buildSwatch(swatch, sx, sy, showRef);
    group.appendChild(sw);
  });

  return group;
}

// ─── Section builder ───────────────────────────────────────────────────────────

function buildSection(label, groups, startX, startY, showRef = false) {
  const nodes = [];
  let y = startY;

  // Section heading
  const heading = figma.createText();
  heading.x = startX; heading.y = y;
  heading.resize(1600, SECTION_TITLE_H);
  heading.characters = label;
  heading.fontSize = 22;
  heading.fontName = { family: 'Inter', style: 'Bold' };
  heading.fills = [{ type: 'SOLID', color: BRAND }];
  heading.textAlignVertical = 'CENTER';
  nodes.push(heading);
  y += SECTION_TITLE_H + 24;

  // Divider
  const divider = figma.createRectangle();
  divider.x = startX; divider.y = y;
  divider.resize(1600, 2);
  divider.fills = [{ type: 'SOLID', color: hexToRgb('#325083'), opacity: 0.15 }];
  nodes.push(divider);
  y += 2 + 32;

  groups.forEach(groupData => {
    const g = buildGroup(groupData, startX, y, showRef);
    nodes.push(g);
    y += g.height + GROUP_GAP;
  });

  return { nodes, bottomY: y };
}

// ─── Main ───────────────────────────────────────────────────────────────────────

(async () => {
  await loadFonts();

  const page = figma.currentPage;

  // Remove any existing SR Colour Palette frame
  const existing = page.children.find(n => n.name === 'SR Colour Palette');
  if (existing) existing.remove();

  // Outer wrapper frame
  let y = PAGE_PAD;

  // Page title
  const titleFrame = figma.createFrame();
  titleFrame.x = PAGE_PAD; titleFrame.y = y;
  titleFrame.resize(1600, 100);
  titleFrame.fills = [{ type: 'SOLID', color: BRAND }];
  titleFrame.cornerRadius = 12;

  const titleText = createText(
    'Single Record Design System — Colour Palette',
    28, { r: 1, g: 1, b: 1 },
    40, 0, 1520, 100
  );
  titleText.fontName = { family: 'Inter', style: 'Bold' };

  const subtitleText = createText(
    'Tier 1: Primitives  ·  Tier 2: Semantic (sr.*)',
    14, { r: 1, g: 1, b: 1, opacity: 0.7 },
    40, 62, 1520, 28
  );
  subtitleText.y = 62;

  titleFrame.appendChild(titleText);
  titleFrame.appendChild(subtitleText);
  page.appendChild(titleFrame);

  y += 100 + SECTION_GAP;

  // Tier 1 — Primitives
  const { nodes: primNodes, bottomY: primBottom } = buildSection(
    'Tier 1 — Primitive Colours',
    PRIMITIVES,
    PAGE_PAD,
    y,
    false
  );
  primNodes.forEach(n => page.appendChild(n));
  y = primBottom + SECTION_GAP;

  // Tier 2 — Semantic
  const { nodes: semNodes, bottomY: semBottom } = buildSection(
    'Tier 2 — Semantic Tokens (sr.*)',
    SEMANTIC,
    PAGE_PAD,
    y,
    true
  );
  semNodes.forEach(n => page.appendChild(n));
  y = semBottom + PAGE_PAD;

  // Scroll to the content
  figma.viewport.scrollAndZoomIntoView([titleFrame]);

  figma.closePlugin('SR Colour Palette generated.');
})();
