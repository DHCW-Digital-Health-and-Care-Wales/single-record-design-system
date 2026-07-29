import React, { forwardRef, useId } from 'react';
import '@dhcw/sr-web/src/patient-banner/patient-banner.css';
import '@dhcw/sr-web/src/button/button.css';
import Icon from '../icon/Icon.jsx';

/**
 * PatientBanner — DHCW Single Record Design System (React)
 *
 * Matched to the Figma Patient Banner set (1711:15585): Type = Fill | Border,
 * State = Expanded | Collapsed.
 *
 * **Safety-critical.** This is how staff know which patient they are looking at,
 * so the name, NHS number and DOB remain visible in both states — collapsing
 * hides secondary detail, never the identifiers. Changes need clinical safety
 * review as well as design sign-off (components/patient-banner/spec.md).
 *
 * Expanded/collapsed is controlled: pass `expanded` and `onToggle`.
 */

function Field({ label, value, onCopy, copyLabel, critical }) {
  if (value == null || value === '') return null;
  return (
    <div
      className={[
        'sr-patient-banner__field',
        critical && 'sr-patient-banner__field--deceased',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <dt>{label}:</dt>
      <dd>
        {value}
        {onCopy && (
          <button
            type="button"
            className="sr-patient-banner__copy"
            aria-label={copyLabel || `Copy ${label}`}
            onClick={() => onCopy(value)}
          >
            <Icon name="action/copy" size="xs" color="inherit" />
          </button>
        )}
      </dd>
    </div>
  );
}

const PatientBanner = forwardRef(function PatientBanner(
  {
    patient = {},
    reactions = [],
    warnings = [],
    type = 'fill',
    expanded = true,
    onToggle,
    onCopy,
    onEditReactions,
    onEditWarnings,
    actions,
    className,
    ...rest
  },
  ref
) {
  const reactId = useId();
  const {
    name,
    flag,
    nhsNumber,
    crn,
    address,
    postcode,
    dob,
    dod,
    sex,
  } = patient;

  const classes = [
    'sr-patient-banner',
    type === 'border' && 'sr-patient-banner--border',
    !expanded && 'sr-patient-banner--collapsed',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const warningCount = typeof warnings === 'number' ? warnings : warnings.length;

  const toggle = onToggle ? (
    <button
      type="button"
      className="sr-patient-banner__toggle"
      aria-expanded={expanded}
      onClick={onToggle}
    >
      <span>{expanded ? 'Hide Details' : 'Show Details'}</span>
      <Icon
        name={expanded ? 'nav/chevron-up' : 'nav/chevron-down'}
        size="xs"
        color="inherit"
      />
    </button>
  ) : null;

  return (
    <section
      ref={ref}
      className={classes}
      aria-label={name ? `Patient: ${name}` : 'Patient banner'}
      {...rest}
    >
      {expanded ? (
        <div className="sr-patient-banner__alerts">
          <div className="sr-patient-banner__alert sr-patient-banner__alert--reactions">
            <div className="sr-patient-banner__alert-head">
              <span id={`${reactId}-reactions`}>Adverse Reactions</span>
              {onEditReactions && (
                <button
                  type="button"
                  className="sr-patient-banner__alert-edit"
                  aria-label="Edit adverse reactions"
                  onClick={onEditReactions}
                >
                  <Icon name="action/edit2" size="xs" color="inherit" />
                </button>
              )}
            </div>
            {reactions.length > 0 ? (
              <ul
                className="sr-patient-banner__alert-list"
                aria-labelledby={`${reactId}-reactions`}
              >
                {reactions.map((r, i) => (
                  <li key={i}>
                    {r.substance}:{' '}
                    <span className="sr-patient-banner__alert-value">{r.reaction}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="sr-patient-banner__alert-text">No known adverse reactions</p>
            )}
          </div>

          <div className="sr-patient-banner__alert sr-patient-banner__alert--warnings">
            <div className="sr-patient-banner__alert-head">
              <span>Warnings</span>
              {onEditWarnings && (
                <button
                  type="button"
                  className="sr-patient-banner__alert-edit"
                  aria-label="Edit warnings"
                  onClick={onEditWarnings}
                >
                  <Icon name="action/edit2" size="xs" color="inherit" />
                </button>
              )}
            </div>
            <p className="sr-patient-banner__alert-text">
              {warningCount > 0 ? `${warningCount} warnings recorded` : 'No warnings recorded'}
            </p>
          </div>
        </div>
      ) : (
        <div className="sr-patient-banner__summary">
          <span className="sr-patient-banner__pill sr-patient-banner__pill--reactions">
            {reactions.length} reactions
          </span>
          <span className="sr-patient-banner__pill sr-patient-banner__pill--warnings">
            {warningCount} warnings
          </span>
        </div>
      )}

      <div className="sr-patient-banner__identity">
        <div className="sr-patient-banner__name-row">
          <h2 className="sr-patient-banner__name">{name}</h2>
          {flag && <span className="sr-patient-banner__flag">{flag}</span>}
          {/* Expanded: the toggle sits at the far right of the name row.
              Collapsed: it follows the demographics, matching the Figma. */}
          {onToggle && expanded && toggle}
        </div>

        <dl className="sr-patient-banner__details">
          {expanded ? (
            <>
              {/* Two independent columns, as designed — not row-paired, so Sex
                  stays at the foot of the right column. */}
              <div className="sr-patient-banner__col">
                <Field label="NHS" value={nhsNumber} onCopy={onCopy} copyLabel="Copy NHS number" />
                <Field label="Address" value={address} />
                <Field label="Postcode" value={postcode} />
              </div>
              <div className="sr-patient-banner__col">
                <Field label="CRN" value={crn} onCopy={onCopy} copyLabel="Copy CRN" />
                <Field label="DOB" value={dob} />
                {dod && <Field label="DOD" value={dod} critical />}
                <Field label="Sex" value={sex} />
              </div>
            </>
          ) : (
            <>
              <Field label="NHS" value={nhsNumber} onCopy={onCopy} copyLabel="Copy NHS number" />
              <Field label="DOB" value={dob} />
            </>
          )}
        </dl>

        {onToggle && !expanded && toggle}
      </div>

      {actions && <div className="sr-patient-banner__actions">{actions}</div>}
    </section>
  );
});

export default PatientBanner;
