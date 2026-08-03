import React from 'react';
import { Header, Tag, Icon } from '@dhcw/sr-react';

import { STATS, QUICK_ACTIONS, NEEDS_ATTENTION, IN_TRANSIT } from './data.js';

/**
 * Case Note Tracking — home screen dashboard.
 * Figma: U0Ugs6bG1KLzrrWdnxqcZO, node 2:3875 ("Page Template" wrapping the
 * "DASHBOARD COMPONENT" frame, 0:4).
 *
 * There is no coded "Stat Card" or "Dashboard section" component in the DS
 * yet (`components/` has no navigation/dashboard spec either — see
 * decisions/handoff.md). Everything below composes existing @dhcw/sr-react
 * components (Header, Tag, Icon) plus local layout wrapped only in tokens,
 * the same way CaseNotes.jsx composes Table/Select/Input — nothing here
 * restyles a DS component.
 */
export default function Dashboard({ onNavigate }) {
  return (
    <>
      <Header
        variant="desktop-2"
        org=""
        initials="AB"
        onLanguageToggle={() => {}}
        onNotificationClick={() => {}}
        onOrgClick={() => {}}
      />

      <main className="app__main dashboard" id="main">
        <h1 className="dashboard__title">Dashboard</h1>

        <section className="dashboard__stats" aria-label="Summary statistics">
          {STATS.map((s) => (
            <div className={`stat-card stat-card--${s.accent}`} key={s.label}>
              <div className="stat-card__head">
                <p className="stat-card__label">{s.label}</p>
                <Icon name={s.icon} size="sm" color="inherit" className="stat-card__icon" />
              </div>
              <p className="stat-card__value">{s.value}</p>
              <p className={`stat-card__note stat-card__note--${s.noteAccent}`}>{s.note}</p>
            </div>
          ))}
        </section>

        <section className="dashboard__quick-actions" aria-label="Quick actions">
          <p className="dashboard__section-label">Quick actions</p>
          <div className="quick-actions">
            {QUICK_ACTIONS.map((a, i) => (
              <button
                type="button"
                key={a.label}
                className={`quick-action${i === 0 ? ' quick-action--selected' : ''}`}
                onClick={() => a.view && onNavigate && onNavigate(a.view)}
              >
                <Icon name={a.icon} size="sm" color="inherit" />
                <span>
                  <span className="quick-action__label">{a.label}</span>
                  <span className="quick-action__description">{a.description}</span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="dashboard__panels" aria-label="Casenote activity">
          <div className="panel">
            <div className="panel__head">
              <h2 className="panel__title">
                Needs attention
                <Icon name="status/info" size="xs" color="inherit" />
              </h2>
              <a className="panel__view-all" href="#">
                View all <Icon name="nav/forward" size="xs" color="inherit" />
              </a>
            </div>
            <ul className="attention-list">
              {NEEDS_ATTENTION.map((row, i) => (
                <li className={`attention-row attention-row--${row.statusType}`} key={i}>
                  <div className="attention-row__main">
                    <p className="attention-row__volume">{row.volume}</p>
                    <p className="attention-row__patient">
                      {row.patient} | {row.location}
                    </p>
                  </div>
                  <div className="attention-row__meta">
                    <span className="attention-row__weeks">{row.weeks}</span>
                    <Tag type={row.statusType} size="small">{row.status}</Tag>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="panel">
            <div className="panel__head">
              <h2 className="panel__title">
                In transit
                <Icon name="status/info" size="xs" color="inherit" />
              </h2>
              <a className="panel__view-all" href="#">
                View all <Icon name="nav/forward" size="xs" color="inherit" />
              </a>
            </div>
            {IN_TRANSIT.map((group) => (
              <div className="transit-group" key={group.group}>
                <p className="transit-group__label">{group.group}</p>
                <ul className="transit-list">
                  {group.rows.map((row, i) => (
                    <li className="transit-row" key={i}>
                      <p className="transit-row__volume">{row.volume}</p>
                      <p className="transit-row__meta">
                        {row.location} | {row.clinician}
                      </p>
                      <p className="transit-row__time">{row.time}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
