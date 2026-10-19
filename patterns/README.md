# Patterns

Patterns are composed UI solutions built from components. They solve recurring design problems consistently across products.

A pattern is not a component — it describes how components work together to solve a specific user need.

---

## Pattern Catalogue

### Forms
| Pattern | Status | Notes |
|---|---|---|
| `form-layout` | Planned | Single-column form structure, label positioning |
| `form-validation` | Planned | Error summary + inline error handling |
| `form-actions` | Planned | Button placement, save/cancel, progressive disclosure |
| `required-fields` | Planned | Marking required fields — asterisk convention + accessible text |
| `conditional-reveal` | Planned | Show/hide fields based on a prior answer |
| `autocomplete-clinical-codes` | Planned | SNOMED CT / ICD-10 lookup pattern |
| `date-of-birth-entry` | Planned | Structured DOB input with validation |
| `address-entry` | Planned | Manual address + postcode lookup |

### Data tables
| Pattern | Status | Notes |
|---|---|---|
| `table-basic` | Planned | Static, readable data table |
| `table-sortable` | Planned | Column sorting |
| `table-filterable` | Planned | Column filtering and search |
| `table-with-row-actions` | Planned | Inline actions per row |
| `table-pagination` | Planned | Page-based navigation for large datasets |
| `table-bulk-actions` | Planned | Multi-select + bulk operations |

### Records and summaries
| Pattern | Status | Notes |
|---|---|---|
| `record-summary` | Planned | Clinical record summary view |
| `record-detail` | Planned | Full record view with sections |
| `timeline-view` | Planned | Chronological clinical history |
| `summary-card` | Planned | Key data in a scannable card format |

### Navigation and workflow
| Pattern | Status | Notes |
|---|---|---|
| `step-by-step` | Planned | Multi-step task / wizard |
| `task-list` | Planned | GDS task list — incomplete multi-part journeys |
| `patient-search` | In review | `patient-search/guidelines.md`: quick, advanced, wristband scan, confirm the patient |
| `search-and-filter` | Planned | Record list sort and filter (mobile: one bottom sheet) |
| `contextual-navigation` | Planned | In-record section navigation |

### Dialogs and confirmations
| Pattern | Status | Notes |
|---|---|---|
| `dialogs` | In review | `dialogs/guidelines.md`: confirmation (incl. unsaved changes, session expiring, high stakes) and result dialogs |

### Feedback and status
| Pattern | Status | Notes |
|---|---|---|
| `page-error` | Planned | Full-page error state (500, 404, access denied) |
| `empty-state` | Planned | No data — with guidance on next action |
| `loading-state` | Planned | Skeleton screens and spinners — when to use each |
| `success-confirmation` | Planned | Post-action confirmation page |

---

## Adding a New Pattern

1. Confirm the problem cannot be solved with an existing pattern or component combination
2. Create a DDR if the pattern involves a non-trivial interaction decision
3. Create `/patterns/{category}/{pattern-name}.md` using the template at `/docs/templates/pattern-template.md`
4. Reference the components used
5. Update the catalogue above
