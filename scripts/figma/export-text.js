// Run inside Figma through the Figma MCP `use_figma` tool (the content-checker
// agent does this). Exports every visible text layer under ROOT_IDS with a
// guessed role, as JSON for `node scripts/check-content.mjs --figma <file>`.
//
// Set ROOT_IDS to the page, section or frame ids to check before running.
// Roles are guesses from the layer, its text style and the components around
// it; the agent reviews them, and a wrong guess only changes which rules run.
const ROOT_IDS = ['__ROOT_IDS__'];
figma.skipInvisibleInstanceChildren = true;

const styleName = async (n) => {
  if (typeof n.textStyleId !== 'string' || !n.textStyleId) return '';
  try { return (await figma.getStyleByIdAsync(n.textStyleId))?.name || ''; } catch { return ''; }
};
const ancestors = (n) => { const a = []; for (let p = n.parent; p && p.type !== 'PAGE'; p = p.parent) a.push(p); return a; };
const compName = async (inst) => { try { const m = await inst.getMainComponentAsync(); return (m?.parent?.type === 'COMPONENT_SET' ? m.parent.name : m?.name) || inst.name; } catch { return inst.name; } };

async function roleOf(n) {
  const name = n.name.toLowerCase();
  const style = (await styleName(n)).toLowerCase();
  for (const a of ancestors(n)) {
    if (a.type !== 'INSTANCE') continue;
    const c = (await compName(a)).toLowerCase();
    if (/button|cta/.test(c)) return 'button';
    if (/tab/.test(c)) return 'tab';
    if (/link/.test(c)) return 'link';
    if (/input|select|search|checkbox|radio|date/.test(c) && /label|title/.test(name)) return 'label';
    if (/table/.test(c) && /head/.test(name)) return 'column';
  }
  if (/^(label|field label|caption label)$/.test(name)) return 'label';
  if (/^value$|details|identifier/.test(name)) return 'value';
  if (/patient name|^name$/.test(name) && /^[A-Z][A-Z' -]+,/.test(n.characters)) return 'name';
  // A card's "Name" layer that is not a patient name is the card's title.
  if (name === 'name' || /status row|card header/i.test(n.parent?.name || '')) return 'heading';
  if (/heading|title|header/.test(style) || /^(heading|title|section title)/.test(name)) return 'heading';
  return 'body';
}

const out = [];
for (const id of ROOT_IDS) {
  const root = await figma.getNodeByIdAsync(id);
  if (!root) continue;
  if (root.type === 'PAGE') await figma.setCurrentPageAsync(root);
  const texts = root.type === 'TEXT' ? [root] : root.findAll((n) => n.type === 'TEXT' && n.visible);
  for (const t of texts) {
    if (!t.characters.trim()) continue;
    const path = [...ancestors(t).reverse().map((a) => a.name), t.name].slice(-4).join(' / ');
    out.push({ id: t.id, text: t.characters, role: await roleOf(t), path });
  }
}
return out;
