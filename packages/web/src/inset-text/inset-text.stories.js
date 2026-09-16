import './inset-text.css';
import '@dhcw/sr-tokens/build/css/tokens.css';

/**
 * Inset text — DHCW Single Record Design System
 *
 * A block of prose held apart from the prose around it.
 *
 *   Inset text is part of the page. A banner is an event.
 *
 * No icon, no heading, no buttons, no status colour — each would make it a
 * notification banner, which already exists. See DDR-032.
 */

const insetText = ({
  text = 'Medication stopped before admission is not shown here. Check the GP record for the full prescribing history.',
  as = 'div',
} = {}) => {
  const el = document.createElement(as);
  el.className = 'sr-inset-text';
  const p = document.createElement('p');
  p.textContent = text;
  el.appendChild(p);
  return el;
};

/** Prose either side, because the indentation is the whole signal. */
const inPage = (block, font = 'var(--sr-type-body-m-font)') => {
  const wrap = document.createElement('div');
  wrap.style.cssText = `max-width:60ch; font:${font};`;
  const before = document.createElement('p');
  before.textContent = 'Medication recorded during this admission is listed below, in the order it was prescribed.';
  before.style.marginTop = '0';
  const after = document.createElement('p');
  after.textContent = 'Doses are as prescribed, not as administered.';
  after.style.marginBottom = '0';
  wrap.append(before, block, after);
  return wrap;
};

export default {
  title: 'Components/Inset text',
  tags: ['autodocs'],
  render: (args) => inPage(insetText(args)),
  argTypes: {
    text: { control: 'text' },
    as: {
      control: 'radio',
      options: ['div', 'aside'],
      description: 'aside only where the content is genuinely tangential — that is what the role tells a screen reader.',
    },
  },
  args: {
    text: 'Medication stopped before admission is not shown here. Check the GP record for the full prescribing history.',
    as: 'div',
  },
};

export const Default = {};

/**
 * Type is inherited, so the same component reads at 16px in a record view and
 * 14px in a dense table area. There is no size modifier.
 */
export const InheritsType = {
  render: () => {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex; flex-direction:column; gap:24px;';
    wrap.appendChild(inPage(insetText({ text: 'In a record view, at 16px body copy.' })));
    wrap.appendChild(inPage(
      insetText({ text: 'In a dense table area, at 14px — the same component.' }),
      'var(--sr-type-body-s-font)',
    ));
    return wrap;
  },
};

/**
 * More than one paragraph is fine; the first child's top margin and the last
 * child's bottom margin are collapsed so the block's own padding sets the
 * space. A heading is not fine — that makes it a section.
 */
export const MultipleParagraphs = {
  render: () => {
    const el = document.createElement('div');
    el.className = 'sr-inset-text';
    el.innerHTML = '<p>Results from before 2019 are held in the legacy system.</p>'
      + '<p>Ask the records team if you need them during an admission.</p>';
    return inPage(el);
  },
};

/**
 * Where the content is genuinely tangential to the text around it. Everywhere
 * else, leave it a div: `aside` is a landmark, and a page of landmarks is a
 * page with none.
 */
export const AsAside = { args: { as: 'aside', text: 'Results from before 2019 are held in the legacy system.' } };
