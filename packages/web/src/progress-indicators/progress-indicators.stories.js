import './progress-indicators.css';
import '../status-indicator/status-indicator.css';
import '../tags/tags.css';
import '@dhcw/sr-tokens/build/css/tokens.css';

/**
 * Progress indicators — DHCW Single Record Design System
 * Figma page 1736:12775. Bar (one task), Stepper (a sequence — horizontal,
 * vertical, compact) and Timeline (what has happened).
 *
 * The Done and Error step markers are the shared Status indicator; its two
 * glyphs are inlined here because a story is plain DOM. The source of truth is
 * packages/react/src/status-indicator/StatusIndicator.jsx.
 */

const SI = {
  done: '<span class="sr-status-indicator sr-status-indicator--success sr-status-indicator--lg"><svg viewBox="0 0 24 24" width="100%" height="100%" focusable="false"><circle cx="12" cy="12" r="10" fill="currentColor"/><path d="M8 12.5l2.6 2.6 5.4-6" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>',
  error: '<span class="sr-status-indicator sr-status-indicator--error sr-status-indicator--lg"><svg viewBox="0 0 24 24" width="100%" height="100%" focusable="false"><circle cx="12" cy="12" r="10" fill="currentColor"/><line x1="12" y1="7" x2="12" y2="13" stroke="#fff" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="16.5" r="1.15" fill="#fff"/></svg></span>',
};
const SPOKEN = { done: 'completed', error: 'has errors', upcoming: 'not started' };

const html = (markup) => {
  const el = document.createElement('div');
  el.style.background = 'var(--sr-color-surface-section-cards)';
  el.style.padding = '24px';
  el.style.maxWidth = '760px';
  el.innerHTML = markup;
  return el;
};

const bar = ({ value = 65, caption = 'Form completion' } = {}) => html(`
<div class="sr-progress" style="--sr-progress-value: ${value}%;">
  <span class="sr-progress__caption" id="sb-bar">${caption}</span>
  <div class="sr-progress__track" role="progressbar" aria-labelledby="sb-bar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${value}"><span class="sr-progress__fill"></span></div>
  <span class="sr-progress__value" aria-hidden="true">${value}%</span>
</div>`);

const segmented = ({ completed = 3, total = 5 } = {}) => html(`
<div class="sr-progress">
  <div class="sr-progress__segments" role="progressbar" aria-label="Referral form" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${completed}" aria-valuetext="${completed} of ${total} sections complete">
    ${Array.from({ length: total }, (_, i) => `<span class="sr-progress__segment${i < completed ? ' sr-progress__segment--done' : i === completed ? ' sr-progress__segment--current' : ''}"></span>`).join('')}
  </div>
  <span class="sr-progress__value" aria-hidden="true">${completed}/${total}</span>
</div>`);

const stepper = (steps, layout = 'horizontal') => html(`
<ol class="sr-stepper${layout === 'horizontal' ? '' : ` sr-stepper--${layout}`}" aria-label="Referral progress">
${steps.map((s, i) => {
    const m = `<span class="sr-stepper__marker" aria-hidden="true">${SI[s.state] ?? (layout === 'compact' ? '' : i + 1)}</span>`;
    const label = `${s.label}${SPOKEN[s.state] ? `<span class="sr-visually-hidden">, ${SPOKEN[s.state]}</span>` : ''}`;
    const hint = s.hint ? `<span class="sr-stepper__hint">${s.hint}</span>` : '';
    const inner = layout === 'vertical'
      ? `<span class="sr-stepper__marker-column">${m}</span><span class="sr-stepper__body"><span class="sr-stepper__label">${label}</span><span class="sr-stepper__description">${s.description ?? ''}</span>${hint}</span>`
      : `${m}<span class="sr-stepper__label">${label}${hint}</span>`;
    return `<li class="sr-stepper__step sr-stepper__step--${s.state}"${s.state === 'current' ? ' aria-current="step"' : ''}>${inner}</li>`;
  }).join('')}
</ol>`);

const FLOW = [
  { label: 'Patient', state: 'done', description: 'Record matched and confirmed' },
  { label: 'Attendance', state: 'error', hint: '2 fields missing', description: 'Arrival and reason' },
  { label: 'Triage', state: 'current', description: 'Initial assessment being recorded' },
  { label: 'Review and submit', state: 'upcoming', description: 'Not started' },
];

export default {
  title: 'Components/Progress indicators',
};

export const ProgressBar = { render: bar, args: { value: 65, caption: 'Form completion' } };
export const Segmented = { render: segmented, args: { completed: 3, total: 5 } };
export const Indeterminate = {
  render: () => html(`
<div class="sr-progress sr-progress--indeterminate" aria-busy="true">
  <span class="sr-progress__caption" id="sb-save">Saving record</span>
  <div class="sr-progress__track" role="progressbar" aria-labelledby="sb-save"><span class="sr-progress__fill"></span></div>
</div>`),
};
export const Stepper = { render: () => stepper(FLOW) };
export const StepperVertical = { render: () => stepper(FLOW, 'vertical') };
export const StepperCompact = {
  render: () => stepper([
    { label: 'Patient', state: 'done' },
    { label: 'Triage', state: 'current' },
    { label: 'Clinical assessment', state: 'upcoming' },
  ], 'compact'),
};
export const Timeline = {
  render: () => html(`
<ol class="sr-timeline" aria-label="Referral history">
  <li class="sr-timeline__item sr-timeline__item--complete">
    <time class="sr-timeline__time" datetime="2024-04-08T15:30">08-Apr-2024
15:30</time>
    <span class="sr-timeline__dot" aria-hidden="true"></span>
    <div class="sr-timeline__body"><p class="sr-timeline__title">Referral sent</p><p class="sr-timeline__description">Sent to cardiology</p><span class="sr-tag sr-tag--status sr-tag--green sr-tag--small"><span>Complete</span></span></div>
  </li>
  <li class="sr-timeline__item sr-timeline__item--current">
    <time class="sr-timeline__time" datetime="2024-04-09T09:10">Now</time>
    <span class="sr-timeline__dot" aria-hidden="true"></span>
    <div class="sr-timeline__body"><p class="sr-timeline__title">Clinical assessment in progress</p><p class="sr-timeline__description">Under review by attending clinician</p><span class="sr-tag sr-tag--status sr-tag--blue sr-tag--small"><span>In progress</span></span></div>
  </li>
  <li class="sr-timeline__item sr-timeline__item--pending">
    <time class="sr-timeline__time" datetime="2024-04-09">—</time>
    <span class="sr-timeline__dot" aria-hidden="true"></span>
    <div class="sr-timeline__body"><p class="sr-timeline__title">Discharge</p><p class="sr-timeline__description">Pending clinical outcome</p></div>
  </li>
</ol>`),
};
