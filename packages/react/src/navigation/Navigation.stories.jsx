import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@dhcw/sr-tokens/build/css/tokens.css';
import Navigation from './Navigation.jsx';

const LOGO_SRC =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="129" height="40" viewBox="0 0 129 40"><rect width="129" height="40" rx="4" fill="%23325083"/><text x="10" y="25" font-family="Roboto, sans-serif" font-size="13" fill="white">DHCW Single Record</text></svg>'
  );

const SECTIONS = [
  { label: 'Home', items: [{ icon: 'data/table', label: 'Dashboard' }] },
  {
    label: 'Patients',
    items: [
      { icon: 'nav/search', label: 'Patient Search' },
      { icon: 'nav/sort', label: 'Referrals', badge: '20', submenu: true },
      { icon: 'schedule/appointment', label: 'Appointments', badge: '20', submenu: true },
      { icon: 'schedule/waiting-list', label: 'Watchlists', submenu: true },
    ],
  },
  {
    label: 'Clinical',
    items: [
      { icon: 'people/specialist', label: 'Specialists', submenu: true },
      { icon: 'clinical/lab-result', label: 'Tests', submenu: true },
    ],
  },
  {
    label: 'Nursing',
    items: [
      { icon: 'people/patient', label: 'Adults', submenu: true },
      { icon: 'people/contact', label: 'Paediatrics', submenu: true },
    ],
  },
  {
    label: 'Urgent & Emergency',
    items: [
      { icon: 'location/bed', label: 'Nursing', submenu: true },
      { icon: 'clinical/cross', label: 'Urgent & Emergency', submenu: true },
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
        logo={<img src={LOGO_SRC} alt="DHCW Single Record" style={{ height: 40 }} />}
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
