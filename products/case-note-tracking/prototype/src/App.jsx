import React, { useState } from 'react';
import { Navigation } from '@dhcw/sr-react';

import { NAV_SECTIONS, NAV_FOOTER } from './data.js';
import Dashboard from './Dashboard.jsx';
import CaseNotes from './CaseNotes.jsx';

// Text lockup, not the real NHS/GIG asset (trademarked raster, not something
// this prototype's Sandpack embed can fetch) — same placeholder approach as
// packages/web/src/assets/logo.js, kept local so the embed doesn't need a
// bare '@dhcw/sr-web' import the build's Sandpack rewriter doesn't resolve.
const BRAND_LOCKUP = <span className="app__brand">Single Record</span>;

const VIEW_LABEL = {
  dashboard: 'Dashboard',
  'case-notes': 'My Requests',
};

/**
 * Case Note Tracking prototype shell — one persistent Navigation (Type=Linear,
 * matching the sidebar on the dashboard screen, Figma 2:3875) with two views
 * behind it: the dashboard home screen (Dashboard.jsx) and the existing
 * casenote table (CaseNotes.jsx). The design lead wants the dashboard as the
 * product's actual home screen — this is the first pass at that, wired
 * through the same nav rather than as a second disconnected prototype.
 */
export default function App() {
  const [view, setView] = useState('dashboard');
  const [navCollapsed, setNavCollapsed] = useState(false);

  // Rail, not icon-only: the Case Note Tracking adaptation of the nav (Figma
  // 125:5362) ships exactly two states, Expanded and Collapsed (108px rail).
  // It has no 48px icon-only variant, so the prototype must not offer one.
  const toggleNav = () => setNavCollapsed((c) => (c ? false : 'rail'));

  const handleSelect = (label) => {
    if (label === 'Dashboard') setView('dashboard');
    else if (label === 'My Requests' || label === 'Patient Search') setView('case-notes');
    // Other nav items (SendIT, ReceiveIT, TagIT, Settings, Log Out) have no
    // screen in this prototype yet — selecting them is a no-op.
  };

  return (
    <div className="app">
      <Navigation
        sections={NAV_SECTIONS}
        footerItems={NAV_FOOTER}
        type="linear"
        current={VIEW_LABEL[view]}
        collapsed={navCollapsed}
        onCollapseToggle={toggleNav}
        onSelect={handleSelect}
        logo={BRAND_LOCKUP}
      />
      <div className="app__content">
        {view === 'dashboard' ? (
          <Dashboard onNavigate={setView} />
        ) : (
          <CaseNotes />
        )}
      </div>
    </div>
  );
}
