import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@dhcw/sr-tokens/build/css/tokens.css';
import Modal from './Modal.jsx';
import Button from '../button/Button.jsx';

/**
 * Base Modal (Figma 3807:36855). Per DDR-008 the Confirmation and Result
 * dialogs are composed patterns built on this, not separate components — the
 * Confirmation and Destructive stories below show that composition.
 *
 * Footer actions follow DDR-018: right-grouped, primary last, cancel as an
 * equal-weight button to its left.
 */
function Demo({ size = 'medium', title = 'Modal Title', body, footer, openLabel = 'Open modal' }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ padding: 24 }}>
      <Button type="primary" onClick={() => setOpen(true)}>
        {openLabel}
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        size={size}
        footer={footer ? footer(() => setOpen(false)) : undefined}
      >
        {body || <p>Modal content goes here.</p>}
      </Modal>
    </div>
  );
}

const render = (args) => {
  const container = document.createElement('div');
  createRoot(container).render(<Demo {...args} />);
  return container;
};

export default {
  title: 'React/Modal',
  tags: ['autodocs'],
  render,
  argTypes: {
    size: { control: { type: 'inline-radio' }, options: ['small', 'medium', 'large'] },
    title: { control: 'text' },
  },
};

export const Default = {
  args: {
    size: 'medium',
    title: 'Modal Title',
    footer: (close) => (
      <>
        <Button type="secondary" onClick={close}>Secondary CTA</Button>
        <Button type="primary" onClick={close}>Primary CTA</Button>
      </>
    ),
  },
};

export const Small = { args: { ...Default.args, size: 'small' } };
export const Large = { args: { ...Default.args, size: 'large' } };

/** Confirmation — a composed pattern on the base modal (DDR-008). */
export const Confirmation = {
  args: {
    size: 'small',
    title: 'Send 3 case notes?',
    openLabel: 'Send batch',
    body: (
      <p>
        Three case notes will be sent to Howarth, AJ at A&amp;E Department GGH.
        You can track them from My Requests.
      </p>
    ),
    footer: (close) => (
      <>
        <Button type="secondary" onClick={close}>Cancel</Button>
        <Button type="primary" onClick={close}>Send notes</Button>
      </>
    ),
  },
};

/** Destructive confirmation — the action, not "OK", names the outcome. */
export const Destructive = {
  args: {
    size: 'small',
    title: 'Remove case note from batch?',
    openLabel: 'Remove note',
    body: <p>General notes vol 2 will be removed from batch 210-792749. This cannot be undone.</p>,
    footer: (close) => (
      <>
        <Button type="secondary" onClick={close}>Cancel</Button>
        <Button type="destructive" onClick={close}>Remove note</Button>
      </>
    ),
  },
};

/** Long content — the body scrolls while the header and footer stay put. */
export const ScrollingBody = {
  args: {
    size: 'medium',
    title: 'Batch summary',
    body: (
      <div>
        {Array.from({ length: 24 }, (_, i) => (
          <p key={i}>General notes vol {i + 1} — Registered by Gadgil, AA(Mr)</p>
        ))}
      </div>
    ),
    footer: (close) => (
      <>
        <Button type="secondary" onClick={close}>Print labels</Button>
        <Button type="primary" onClick={close}>Approve summary list</Button>
      </>
    ),
  },
};
