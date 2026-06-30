import './footer.css';
import '../button/button.css';
import '@dhcw/sr-tokens/build/css/tokens.css';

/**
 * Footer — DHCW Single Record Design System
 * Figma: Footer Nav (665:16525), Type=Desktop
 */

const buildButton = (label, type) => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `sr-button sr-button--${type} sr-button--small`;
  const text = document.createElement('span');
  text.textContent = label;
  btn.appendChild(text);
  return btn;
};

const render = ({ version }) => {
  const footer = document.createElement('footer');
  footer.className = 'sr-footer';

  const versionEl = document.createElement('span');
  versionEl.className = 'sr-footer__version';
  versionEl.textContent = version;
  footer.appendChild(versionEl);

  const actions = document.createElement('div');
  actions.className = 'sr-footer__actions';
  actions.appendChild(buildButton('Save changes', 'secondary'));
  actions.appendChild(buildButton('Mark as complete', 'primary'));
  footer.appendChild(actions);

  return footer;
};

export default {
  title: 'Components/Footer',
  tags: ['autodocs'],
  render,
  argTypes: {
    version: { control: 'text' },
  },
  args: {
    version: 'v 0.1.0.1112',
  },
};

export const Default = {};
