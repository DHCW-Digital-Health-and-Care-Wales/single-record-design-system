import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@dhcw/sr-tokens/build/css/tokens.css';
import { logoFullSrc } from '@dhcw/sr-web/src/assets/logo.js';
import Navigation from './Navigation.jsx';

const LOGO_SRC = logoFullSrc;

const SECTIONS = [
  { label: 'Home', items: [{ icon: 'data/table', label: 'Dashboard' }] },
  {
    label: 'Patients',
    items: [
      { icon: 'nav/search', label: 'Patient Search' },
      {
        icon: 'nav/sort',
        label: 'Referrals',
        badge: '20',
        children: [
          { label: 'New referrals', href: '#' },
          { label: 'Pending', href: '#' },
          { label: 'Accepted', href: '#' },
          { label: 'Rejected', href: '#' },
        ],
      },
      {
        icon: 'schedule/appointment',
        label: 'Appointments',
        badge: '20',
        children: [
          { label: 'Upcoming', href: '#' },
          { label: 'Past', href: '#' },
          { label: 'Cancelled', href: '#' },
        ],
      },
      { icon: 'schedule/waiting-list', label: 'Watchlists' },
    ],
  },
  {
    label: 'Clinical',
    items: [
      { icon: 'people/specialist', label: 'Specialists' },
      { icon: 'clinical/lab-result', label: 'Tests' },
    ],
  },
  {
    label: 'Nursing',
    items: [
      { icon: 'people/patient', label: 'Adults' },
      { icon: 'people/contact', label: 'Paediatrics' },
    ],
  },
  {
    label: 'Urgent & Emergency',
    items: [
      { icon: 'location/bed', label: 'Nursing' },
      { icon: 'clinical/cross', label: 'Urgent & Emergency' },
    ],
  },
];

const FOOTER_ITEMS = [
  { icon: 'nav/settings', label: 'Settings' },
  { icon: 'clinical/discharge', label: 'Log Out' },
];

const Demo = ({ initialCollapsed, current }) => {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  return (
    <div style={{ height: 832, display: 'flex' }}>
      <Navigation
        sections={SECTIONS}
        footerItems={FOOTER_ITEMS}
        current={current}
        collapsed={collapsed}
        onCollapseToggle={() => setCollapsed((c) => !c)}
        logo={<img src={LOGO_SRC} alt="DHCW Single Record" style={{ height: 28 }} />}
      />
    </div>
  );
};

const render = (args) => {
  const container = document.createElement('div');
  const root = createRoot(container);
  root.render(<Demo initialCollapsed={args.collapsed} current={args.current} />);
  return container;
};

export default {
  title: 'React/Navigation',
  tags: ['autodocs'],
  render,
  argTypes: {
    collapsed: { control: 'boolean' },
    current: { control: 'text', description: 'Label of the currently active nav item.' },
  },
  args: {
    collapsed: false,
    current: 'Patient Search',
  },
};

export const Expanded = {};
export const Collapsed = { args: { collapsed: true } };
