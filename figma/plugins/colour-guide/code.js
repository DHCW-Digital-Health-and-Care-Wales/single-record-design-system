// ─────────────────────────────────────────────────────────────────────────────
// SR Colour Guide Builder — Figma Plugin
// Recreates figma/colour-guide/colour-guide.html as a Figma design frame
// on the "🌈 Colours" page (node 12:3270).
//
// HOW TO INSTALL:
//   1. In Figma desktop: Plugins → Development → Import plugin from manifest
//   2. Point to this file's parent folder (colour-guide/manifest.json)
//   3. Run: Plugins → Development → SR Colour Guide Builder
// ─────────────────────────────────────────────────────────────────────────────

const TARGET_PAGE_ID = '12:3270';
const CANVAS_W       = 1440;
const PAD            = 64;
const CONTENT_W      = CANVAS_W - PAD * 2;  // 1312

// ── Colour data (mirrors colour-guide.html exactly) ───────────────────────────

const PRIMITIVE_GROUPS = [
  {
    label: 'Blue', desc: 'NHS Wales Blue — primary brand',
    swatches: [
      { scale: '900', hex: '#1E3050', text: '#FFFFFF', tag: '' },
      { scale: '800', hex: '#325083', text: '#FFFFFF', tag: 'Brand primary' },
      { scale: '700', hex: '#3D6199', text: '#FFFFFF', tag: '' },
      { scale: '600', hex: '#4C72AE', text: '#FFFFFF', tag: '' },
      { scale: '500', hex: '#5C6991', text: '#FFFFFF', tag: '' },
      { scale: '400', hex: '#828DAC', text: '#212B32', tag: '' },
      { scale: '300', hex: '#AAB1C6', text: '#212B32', tag: '' },
      { scale: '200', hex: '#D4D8E2', text: '#212B32', tag: '' },
      { scale: '100', hex: '#ECEEF3', text: '#212B32', tag: '' },
      { scale: '50',  hex: '#F4F5F8', text: '#212B32', tag: '' },
    ],
  },
  {
    label: 'Cyan', desc: 'DHCW Blue — secondary / accent',
    swatches: [
      { scale: '900', hex: '#0A6A84', text: '#FFFFFF', tag: '' },
      { scale: '800', hex: '#0D8BAD', text: '#212B32', tag: '' },
      { scale: '700', hex: '#12A3C9', text: '#212B32', tag: 'Brand secondary' },
      { scale: '600', hex: '#71ACCD', text: '#212B32', tag: '' },
      { scale: '500', hex: '#8DC0DA', text: '#212B32', tag: '' },
      { scale: '400', hex: '#AFD4E5', text: '#212B32', tag: '' },
      { scale: '300', hex: '#D6EAF2', text: '#212B32', tag: '' },
      { scale: '100', hex: '#EBF5FA', text: '#212B32', tag: '' },
      { scale: '50',  hex: '#F4FAFC', text: '#212B32', tag: '' },
    ],
  },
  {
    label: 'Navy', desc: 'DHCW Navy',
    swatches: [
      { scale: '900', hex: '#1B294A', text: '#FFFFFF', tag: '' },
      { scale: '700', hex: '#464C64', text: '#FFFFFF', tag: '' },
      { scale: '500', hex: '#707488', text: '#FFFFFF', tag: '' },
      { scale: '300', hex: '#9EA1AF', text: '#212B32', tag: '' },
      { scale: '100', hex: '#CDCFD6', text: '#212B32', tag: '' },
    ],
  },
  {
    label: 'Status', desc: 'Clinical and UI status colours',
    swatches: [
      { scale: 'red-600',       hex: '#D5281B', text: '#FFFFFF', tag: 'Critical' },
      { scale: 'red-100',       hex: '#FCDBD9', text: '#212B32', tag: 'Critical surface' },
      { scale: 'green-600',     hex: '#007F3B', text: '#FFFFFF', tag: 'Success' },
      { scale: 'green-100',     hex: '#D9EFE5', text: '#212B32', tag: 'Success surface' },
      { scale: 'yellow-500',    hex: '#F8CA4D', text: '#212B32', tag: 'Warning' },
      { scale: 'yellow-100',    hex: '#FDF6DC', text: '#212B32', tag: 'Warning surface' },
      { scale: 'info-blue',     hex: '#005AA8', text: '#FFFFFF', tag: 'Info' },
      { scale: 'info-blue-100', hex: '#D6E8F5', text: '#212B32', tag: 'Info surface' },
      { scale: 'focus',         hex: '#FFEB3B', text: '#212B32', tag: 'Focus ring' },
    ],
  },
  {
    label: 'Neutral', desc: 'UI grey palette',
    swatches: [
      { scale: '900',   hex: '#212B32', text: '#FFFFFF', tag: 'Primary text' },
      { scale: '600',   hex: '#4C6272', text: '#FFFFFF', tag: 'Secondary text' },
      { scale: '200',   hex: '#D8DDE0', text: '#212B32', tag: 'Border' },
      { scale: '100',   hex: '#F0F4F5', text: '#212B32', tag: 'Surface' },
      { scale: 'white', hex: '#FFFFFF', text: '#212B32', tag: '',  stroke: '#D8DDE0' },
    ],
  },
];

const SEMANTIC_GROUPS = [
  {
    label: 'Interactive',
    rows: [
      { token: 'sr.color.interactive.primary',       hex: '#325083', text: '#FFFFFF', alias: 'blue-800',      usage: 'Primary buttons, active navigation' },
      { token: 'sr.color.interactive.primary-hover', hex: '#1E3050', text: '#FFFFFF', alias: 'blue-900',      usage: 'Hover state on primary elements' },
      { token: 'sr.color.interactive.secondary',     hex: '#1B294A', text: '#FFFFFF', alias: 'navy-900',      usage: 'Secondary interactive elements' },
      { token: 'sr.color.interactive.link',          hex: '#005AA8', text: '#FFFFFF', alias: 'info-blue',     usage: 'Inline hyperlinks' },
      { token: 'sr.color.interactive.destructive',   hex: '#D5281B', text: '#FFFFFF', alias: 'red-600',       usage: 'Destructive actions, delete buttons' },
    ],
  },
  {
    label: 'Surface',
    rows: [
      { token: 'sr.color.surface.default',  hex: '#F0F4F5', text: '#212B32', alias: 'grey-100',  usage: 'Default page background' },
      { token: 'sr.color.surface.card',     hex: '#FFFFFF', text: '#212B32', alias: 'white',     usage: 'Cards, panels, modals',         stroke: '#D8DDE0' },
      { token: 'sr.color.surface.accent',   hex: '#EBF5FA', text: '#212B32', alias: 'cyan-100',  usage: 'Accent / highlight backgrounds' },
      { token: 'sr.color.surface.subtle',   hex: '#F4F5F8', text: '#212B32', alias: 'blue-50',   usage: 'Subtle section backgrounds' },
      { token: 'sr.color.surface.header',   hex: '#1B294A', text: '#FFFFFF', alias: 'navy-900',  usage: 'Header bars, navigation' },
    ],
  },
  {
    label: 'Text',
    rows: [
      { token: 'sr.color.text.primary',   hex: '#212B32', text: '#FFFFFF', alias: 'grey-900', usage: 'Body text, headings' },
      { token: 'sr.color.text.secondary', hex: '#4C6272', text: '#FFFFFF', alias: 'grey-600', usage: 'Supporting text, captions, labels' },
      { token: 'sr.color.text.inverse',   hex: '#FFFFFF', text: '#212B32', alias: 'white',    usage: 'Text on dark backgrounds', stroke: '#D8DDE0' },
    ],
  },
  {
    label: 'Border',
    rows: [
      { token: 'sr.color.border.default', hex: '#D8DDE0', text: '#212B32', alias: 'grey-200',     usage: 'Default input and card borders' },
      { token: 'sr.color.border.strong',  hex: '#4C6272', text: '#FFFFFF', alias: 'grey-600',     usage: 'Dividers, strong section edges' },
      { token: 'sr.color.border.focus',   hex: '#FFEB3B', text: '#212B32', alias: 'focus-yellow', usage: 'Focus ring on all interactive elements' },
    ],
  },
  {
    label: 'Status',
    rows: [
      { token: 'sr.color.status.critical',         hex: '#D5281B', text: '#FFFFFF', alias: 'red-600',       usage: 'Critical alerts, errors, invalid fields' },
      { token: 'sr.color.status.critical-surface', hex: '#FCDBD9', text: '#212B32', alias: 'red-100',       usage: 'Critical alert background' },
      { token: 'sr.color.status.success',          hex: '#007F3B', text: '#FFFFFF', alias: 'green-600',     usage: 'Success confirmation, completed states' },
      { token: 'sr.color.status.success-surface',  hex: '#D9EFE5', text: '#212B32', alias: 'green-100',     usage: 'Success background' },
      { token: 'sr.color.status.warning',          hex: '#F8CA4D', text: '#212B32', alias: 'yellow-500',    usage: 'Warnings, attention required' },
      { token: 'sr.color.status.warning-surface',  hex: '#FDF6DC', text: '#212B32', alias: 'yellow-100',    usage: 'Warning background' },
      { token: 'sr.color.status.info',             hex: '#005AA8', text: '#FFFFFF', alias: 'info-blue',     usage: 'Informational messages, in-progress' },
      { token: 'sr.color.status.info-surface',     hex: '#D6E8F5', text: '#212B32', alias: 'info-blue-100', usage: 'Info background' },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function toRgb(hexStr) {
  const h = hexStr.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16) / 255,
    g: parseInt(h.slice(2, 4), 16) / 255,
    b: parseInt(h.slice(4, 6), 16) / 255,
  };
}

function solidFill(hexStr) {
  return [{ type: 'SOLID', color: toRgb(hexStr) }];
}

function solidStroke(hexStr, weight = 1) {
  return {
    strokes: [{ type: 'SOLID', color: toRgb(hexStr) }],
    strokeWeight: weight,
    strokeAlign: 'INSIDE',
  };
}

function applyStroke(node, hexStr, weight = 1) {
  node.strokes     = [{ type: 'SOLID', color: toRgb(hexStr) }];
  node.strokeWeight = weight;
  node.strokeAlign  = 'INSIDE';
}

// Create a rectangle and append to parent
function addRect(parent, x, y, w, h, fillHex, opts = {}) {
  const r = figma.createRectangle();
  r.x = x; r.y = y;
  r.resize(w, h);
  r.fills = fillHex ? solidFill(fillHex) : [];
  if (opts.radius)  r.cornerRadius = opts.radius;
  if (opts.name)    r.name = opts.name;
  if (opts.stroke)  applyStroke(r, opts.stroke, opts.strokeWeight || 1);
  if (opts.opacity !== undefined) r.opacity = opts.opacity;
  parent.appendChild(r);
  return r;
}

// Create a frame and append to parent
function addFrame(parent, x, y, w, h, fillHex, opts = {}) {
  const f = figma.createFrame();
  f.x = x; f.y = y;
  f.resize(w, h);
  f.fills = fillHex ? solidFill(fillHex) : [];
  f.clipsContent = opts.clip !== false;
  if (opts.radius) f.cornerRadius = opts.radius;
  if (opts.name)   f.name = opts.name;
  if (opts.stroke) applyStroke(f, opts.stroke, opts.strokeWeight || 1);
  parent.appendChild(f);
  return f;
}

// Create a text node and append to parent
function addText(parent, x, y, content, opts = {}) {
  const t = figma.createText();
  t.fontName = { family: 'Inter', style: opts.weight || 'Regular' };
  t.fontSize  = opts.size || 14;
  t.fills     = solidFill(opts.color || '#212B32');

  if (opts.letterSpacing !== undefined) {
    t.letterSpacing = { value: opts.letterSpacing, unit: 'PERCENT' };
  }
  if (opts.lineHeight !== undefined) {
    t.lineHeight = { value: opts.lineHeight, unit: 'PIXELS' };
  }

  // Set characters after font/size to avoid font-not-loaded errors
  t.characters = String(content);

  // Fixed-width wrapping
  if (opts.width) {
    t.textAutoResize = 'HEIGHT';
    t.resize(opts.width, t.height);
  }
  if (opts.align) t.textAlignHorizontal = opts.align;
  if (opts.name)  t.name = opts.name;
  if (opts.opacity !== undefined) t.opacity = opts.opacity;

  t.x = x; t.y = y;
  parent.appendChild(t);
  return t;
}

// Horizontal rule
function addRule(parent, x, y, w, color = '#D8DDE0') {
  return addRect(parent, x, y, w, 1, color);
}

// ── Section builders ──────────────────────────────────────────────────────────

function buildHeader(container, y) {
  const H = 56;
  const hf = addFrame(container, 0, y, CANVAS_W, H, '#1B294A', { name: 'Header', clip: true });

  // Badge
  const badge = addFrame(hf, PAD, 14, 30, 28, '#12A3C9', { name: 'Badge', radius: 4, clip: true });
  addText(badge, 5, 7, 'SR', { weight: 'Bold', size: 11, color: '#FFFFFF' });

  // Site name
  addText(hf, PAD + 38, 17, 'Single Record Design System', {
    weight: 'Regular', size: 14, color: '#FFFFFF', opacity: 0.85,
  });

  return y + H;
}

function buildHero(container, y) {
  // Render into a scratch frame to measure, then resize
  const hf = addFrame(container, 0, y, CANVAS_W, 10, '#FFFFFF', { name: 'Hero', clip: false });
  let hy = 56;

  // Eyebrow
  addText(hf, PAD, hy, 'FOUNDATIONS', {
    weight: 'Medium', size: 11, color: '#325083', letterSpacing: 12,
  });
  hy += 26;

  // Title
  const title = addText(hf, PAD, hy, 'Colour Tokens', {
    weight: 'ExtraBold', size: 52, color: '#212B32', letterSpacing: -2,
  });
  hy += title.height + 16;

  // Subtitle
  const sub = addText(hf, PAD, hy,
    'A three-tier token architecture: primitives hold raw values, semantic tokens assign meaning.\nComponents reference semantic tokens only.',
    { weight: 'Regular', size: 16, color: '#4C6272', lineHeight: 26, width: 600 },
  );
  hy += sub.height + 28;

  // Nav pills (simplified as a single text row)
  addText(hf, PAD, hy, 'Tier 1', { weight: 'Bold', size: 11, color: '#4C6272', letterSpacing: 10 });
  addText(hf, PAD + 48, hy + 1, 'Blue · Cyan · Navy · Status · Neutral', { weight: 'Medium', size: 13, color: '#325083' });
  hy += 28;
  addText(hf, PAD, hy, 'Tier 2', { weight: 'Bold', size: 11, color: '#4C6272', letterSpacing: 10 });
  addText(hf, PAD + 48, hy + 1, 'Interactive · Surface · Text · Border · Status', { weight: 'Medium', size: 13, color: '#325083' });
  hy += 24 + 40;

  // Bottom border
  addRule(hf, 0, hy, CANVAS_W);
  hy += 1;

  hf.resize(CANVAS_W, hy);
  return y + hy;
}

// Swatch card: 108 × (80 + 48) = 108 × 128
const SW_W  = 108;
const SW_BH = 80;   // colour block height
const SW_MH = 48;   // meta area height
const SW_H  = SW_BH + SW_MH;
const SW_GAP = 8;

function buildSwatchRow(container, y, swatches) {
  let sx = PAD;
  for (const s of swatches) {
    // Outer card frame (clips to border-radius)
    const card = addFrame(container, sx, y, SW_W, SW_H, null, { name: s.scale, radius: 8, clip: true });
    card.fills = [];

    // Colour block
    const block = addRect(card, 0, 0, SW_W, SW_BH, s.hex);
    if (s.stroke) applyStroke(block, s.stroke);

    // Tag label inside block
    if (s.tag) {
      addText(card, 8, SW_BH - 18, s.tag, {
        weight: 'SemiBold', size: 9, color: s.text, letterSpacing: 6,
      });
    }

    // Meta background
    addRect(card, 0, SW_BH, SW_W, SW_MH, '#FFFFFF', { stroke: '#D8DDE0' });

    // Scale + hex labels
    addText(card, 8, SW_BH + 6,  s.scale, { weight: 'SemiBold', size: 11, color: '#212B32' });
    addText(card, 8, SW_BH + 24, s.hex,   { weight: 'Regular',  size: 10, color: '#4C6272' });

    sx += SW_W + SW_GAP;
  }
  return y + SW_H + 40;
}

function buildPrimitiveSection(container, y) {
  // Tier label row
  addText(container, PAD, y, 'TIER 1', { weight: 'Bold', size: 11, color: '#4C6272', letterSpacing: 12 });
  y += 22;
  addText(container, PAD, y, 'Primitive Colours', { weight: 'Bold', size: 28, color: '#212B32' });
  y += 40;
  addText(container, PAD, y,
    'Raw palette values. Never reference these directly in components — use semantic tokens.',
    { weight: 'Regular', size: 14, color: '#4C6272', width: CONTENT_W },
  );
  y += 24;
  addRule(container, PAD, y, CONTENT_W);
  y += 1 + 32;

  for (const group of PRIMITIVE_GROUPS) {
    // Group header
    addText(container, PAD, y, group.label, { weight: 'SemiBold', size: 16, color: '#212B32' });
    addText(container, PAD + 80, y + 2, group.desc, { weight: 'Regular', size: 13, color: '#4C6272' });
    y += 32;

    y = buildSwatchRow(container, y, group.swatches);
  }

  return y;
}

// ── Semantic token table ──────────────────────────────────────────────────────
// Column layout (within PAD margins, total CONTENT_W = 1312):
//   token   : 440px
//   colour  : 160px
//   alias   : 140px
//   usage   : rest (~572px)

const COL_TOKEN  = 440;
const COL_COLOUR = 160;
const COL_ALIAS  = 140;
const COL_USAGE  = CONTENT_W - COL_TOKEN - COL_COLOUR - COL_ALIAS;

const CX_TOKEN  = PAD;
const CX_COLOUR = PAD + COL_TOKEN;
const CX_ALIAS  = PAD + COL_TOKEN + COL_COLOUR;
const CX_USAGE  = PAD + COL_TOKEN + COL_COLOUR + COL_ALIAS;

const ROW_H = 56;

function buildSemanticTable(container, y, group) {
  // Group label + rule
  addText(container, PAD, y, group.label, { weight: 'SemiBold', size: 16, color: '#212B32' });
  addRule(container, PAD + group.label.length * 10 + 12, y + 10, CONTENT_W - group.label.length * 10 - 12);
  y += 32;

  // Column headers
  const headers = [
    [CX_TOKEN,  'TOKEN'],
    [CX_COLOUR, 'COLOUR'],
    [CX_ALIAS,  'ALIAS'],
    [CX_USAGE,  'USAGE'],
  ];
  for (const [cx, label] of headers) {
    addText(container, cx, y, label, { weight: 'Bold', size: 11, color: '#4C6272', letterSpacing: 8 });
  }
  y += 22;
  addRule(container, PAD, y, CONTENT_W, '#4C6272');
  y += 2;

  for (const row of group.rows) {
    const midY = y + (ROW_H - 32) / 2;

    // Token pill
    const pill = addFrame(container, CX_TOKEN, midY, COL_TOKEN - 16, 28, '#F4F5F8', { radius: 4, clip: true });
    addText(pill, 8, 6, row.token, { weight: 'Regular', size: 11, color: '#1B294A' });

    // Colour swatch
    const sw = addFrame(container, CX_COLOUR, midY, COL_COLOUR - 20, 32, row.hex, { radius: 6, clip: true });
    if (row.stroke) applyStroke(sw, row.stroke);
    addText(sw, 8, 8, row.hex, { weight: 'Medium', size: 11, color: row.text });

    // Alias badge
    const ab = addFrame(container, CX_ALIAS, midY, COL_ALIAS - 16, 28, '#F0F4F5', { radius: 4, clip: true });
    addText(ab, 8, 6, row.alias, { weight: 'Regular', size: 11, color: '#4C6272' });

    // Usage
    addText(container, CX_USAGE, y + 16, row.usage, {
      weight: 'Regular', size: 13, color: '#4C6272', width: COL_USAGE - 16,
    });

    y += ROW_H;
    addRule(container, PAD, y, CONTENT_W);
    y += 1;
  }

  return y + 40;
}

function buildSemanticSection(container, y) {
  addRule(container, PAD, y, CONTENT_W);
  y += 1 + 48;

  addText(container, PAD, y, 'TIER 2', { weight: 'Bold', size: 11, color: '#4C6272', letterSpacing: 12 });
  y += 22;
  addText(container, PAD, y, 'Semantic Tokens  —  sr.*', { weight: 'Bold', size: 28, color: '#212B32' });
  y += 40;
  addText(container, PAD, y,
    'All semantic tokens alias a primitive. Components and patterns use these exclusively.',
    { weight: 'Regular', size: 14, color: '#4C6272', width: CONTENT_W },
  );
  y += 24;
  addRule(container, PAD, y, CONTENT_W);
  y += 1 + 32;

  for (const group of SEMANTIC_GROUPS) {
    y = buildSemanticTable(container, y, group);
  }

  return y;
}

function buildFooter(container, y) {
  addRule(container, 0, y, CANVAS_W);
  y += 1;
  const ff = addFrame(container, 0, y, CANVAS_W, 56, '#FFFFFF', { name: 'Footer', clip: true });
  addText(ff, PAD, 18, 'Single Record Design System — DHCW', {
    weight: 'Regular', size: 12, color: '#4C6272',
  });
  addText(ff, CANVAS_W - PAD - 540, 18,
    'Generated from foundations/tokens/primitives/color.json + foundations/tokens/semantic/color.json',
    { weight: 'Regular', size: 12, color: '#4C6272', width: 540 },
  );
  return y + 56;
}

// ── Main ──────────────────────────────────────────────────────────────────────

(async () => {
  // Load all font weights needed
  const weights = ['Regular', 'Medium', 'SemiBold', 'Bold', 'ExtraBold'];
  await Promise.all(weights.map(style => figma.loadFontAsync({ family: 'Inter', style })));

  // Locate target page
  const targetPage = figma.root.children.find(p => p.id === TARGET_PAGE_ID)
    || figma.currentPage;
  figma.currentPage = targetPage;

  // Remove any previous colour-guide frames on this page
  const existing = targetPage.children.filter(n => n.name === '🌈 Colour Guide');
  for (const n of existing) n.remove();

  // Root container frame — height will be set after all content is laid out
  const container = addFrame(targetPage, 0, 0, CANVAS_W, 100, '#FFFFFF', {
    name: '🌈 Colour Guide', clip: false,
  });

  let y = 0;
  y = buildHeader(container, y);
  y = buildHero(container, y);
  y = buildPrimitiveSection(container, y);
  y = buildSemanticSection(container, y);
  y = buildFooter(container, y);

  // Resize container to final height
  container.resize(CANVAS_W, y);

  // Pan viewport to the new frame
  figma.viewport.scrollAndZoomIntoView([container]);

  figma.closePlugin('✅ Colour guide created on 🌈 Colours page');
})().catch(err => {
  figma.notify('❌ ' + err.message, { error: true, timeout: 6000 });
  figma.closePlugin();
});
