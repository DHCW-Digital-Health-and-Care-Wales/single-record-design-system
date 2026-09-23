import './error-summary.css';
import '../input/input.css';
import '@dhcw/sr-tokens/build/css/tokens.css';

/**
 * Error summary — DHCW Single Record Design System
 *
 * The behaviour is the pattern: it takes focus when it appears, each item is a
 * real link into the field it names, and the wording matches the inline message
 * exactly. The box on its own does nothing.
 */

const ERRORS = [
  { id: 'nhs-number', message: "Enter the patient's NHS number" },
  { id: 'dob', message: 'Date of birth must be a real date' },
];

function summary(errors = ERRORS, { focus = false } = {}) {
  const box = document.createElement('div');
  box.className = 'sr-error-summary';
  box.setAttribute('role', 'alert');
  box.tabIndex = -1;
  box.innerHTML = `
    <div class="sr-error-summary__header">
      <span class="sr-error-summary__icon" aria-hidden="true"></span>
      <h2 class="sr-error-summary__title">There is a problem</h2>
    </div>
    <ul class="sr-error-summary__body">
      ${errors.map((e) => `<li class="sr-error-summary__item">
        <a class="sr-error-summary__link" href="#${e.id}">${e.message}</a>
      </li>`).join('')}
    </ul>`;
  if (focus) requestAnimationFrame(() => box.focus());
  return box;
}

function field(id, label, message) {
  const wrap = document.createElement('div');
  wrap.className = 'sr-input sr-input--error';
  wrap.style.marginBottom = '24px';
  wrap.innerHTML = `
    <label class="sr-input__label" for="${id}">${label}</label>
    <div class="sr-input__field"><input id="${id}" aria-invalid="true" aria-describedby="${id}-error"></div>
    <span class="sr-input__error" id="${id}-error">${message}</span>`;
  return wrap;
}

export default { title: 'Patterns/Error summary' };

export const Default = () => summary();

/** The summary and the inline messages always appear together, worded identically. */
export const WithTheForm = () => {
  const form = document.createElement('div');
  form.style.maxWidth = '52ch';
  form.appendChild(summary());
  ERRORS.forEach((e) => form.appendChild(field(e.id, e.id === 'dob' ? 'Date of birth' : 'NHS number', e.message)));
  return form;
};

/** One error is still a summary on a long form — but not on a two-field one. */
export const SingleError = () => summary([ERRORS[0]]);

/** Focused on appearance, which is what makes it work. */
export const TakesFocus = () => summary(ERRORS, { focus: true });
