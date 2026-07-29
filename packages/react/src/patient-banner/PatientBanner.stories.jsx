import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@dhcw/sr-tokens/build/css/tokens.css';
import PatientBanner from './PatientBanner.jsx';
import Button from '../button/Button.jsx';
import Icon from '../icon/Icon.jsx';

/**
 * Patient banner (Figma 1711:15585). Safety-critical: the name, NHS number and
 * DOB stay visible in both the expanded and collapsed states.
 *
 * Dates use the short form `10 Mar 2026`, the rule for space-constrained UI.
 */
const PATIENT = {
  name: 'JOHN, Elvet George (Mr)',
  flag: 'Deceased',
  nhsNumber: '000 111 2222',
  crn: 'M8046459',
  address: 'Penrhiw, Gwynfe Llangadog, Dyfed, SA19 9PU',
  postcode: 'SA19 9PU',
  dob: '15 Dec 1992 (33y)',
  dod: '23 Jun 2025',
  sex: 'Male',
};

const REACTIONS = [
  { substance: 'Peanut', reaction: 'Anaphylaxis' },
  { substance: 'Benzylpenicilloyl polylysine', reaction: 'Anaphylaxis' },
];

function Demo({ type = 'fill', startExpanded = true, deceased = true, noAlerts = false }) {
  const [expanded, setExpanded] = useState(startExpanded);
  const patient = deceased ? PATIENT : { ...PATIENT, flag: undefined, dod: undefined };

  return (
    <div style={{ padding: 16, background: 'var(--sr-color-surface-background)' }}>
      <PatientBanner
        patient={patient}
        reactions={noAlerts ? [] : REACTIONS}
        warnings={noAlerts ? 0 : 3}
        type={type}
        expanded={expanded}
        onToggle={() => setExpanded((v) => !v)}
        onCopy={(v) => navigator.clipboard && navigator.clipboard.writeText(v)}
        onEditReactions={() => {}}
        onEditWarnings={() => {}}
        actions={
          expanded ? (
            <>
              <Button type="primary" size="small" leadingIcon={<Icon name="action/refresh" size="xs" color="inherit" />}>
                Change Patient
              </Button>
              <Button type="secondary" size="small" leadingIcon={<Icon name="clinical/record" size="xs" color="inherit" />}>
                Open WCP record
              </Button>
              <Button type="secondary" size="small" leadingIcon={<Icon name="action/print" size="xs" color="inherit" />}>
                Print Patient label
              </Button>
            </>
          ) : (
            <>
              <Button type="primary" size="small" aria-label="Change patient">
                <Icon name="action/refresh" size="xs" color="inherit" />
              </Button>
              <Button type="secondary" size="small" aria-label="Open WCP record">
                <Icon name="clinical/record" size="xs" color="inherit" />
              </Button>
              <Button type="secondary" size="small" aria-label="Print patient label">
                <Icon name="action/print" size="xs" color="inherit" />
              </Button>
            </>
          )
        }
      />
    </div>
  );
}

const render = (args) => {
  const container = document.createElement('div');
  createRoot(container).render(<Demo {...args} />);
  return container;
};

export default {
  title: 'React/PatientBanner',
  tags: ['autodocs'],
  render,
  argTypes: {
    type: { control: { type: 'inline-radio' }, options: ['fill', 'border'] },
    startExpanded: { control: 'boolean' },
    deceased: { control: 'boolean' },
    noAlerts: { control: 'boolean' },
  },
};

export const FillExpanded = { args: { type: 'fill', startExpanded: true } };
export const FillCollapsed = { args: { type: 'fill', startExpanded: false } };
export const BorderExpanded = { args: { type: 'border', startExpanded: true } };

/** Living patient with no recorded reactions or warnings — the reassuring case. */
export const NoAlerts = {
  args: { type: 'fill', startExpanded: true, deceased: false, noAlerts: true },
};
