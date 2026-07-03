# Components

Individual UI components that form the building blocks of product interfaces.

Each component lives in its own folder: `/components/{component-name}/`.

---

## Component Catalogue

### Form controls
| Component | Status | Notes |
|---|---|---|
| `text-input` | Planned | Single-line text entry |
| `textarea` | Planned | Multi-line text entry |
| `select` | Planned | Dropdown selection |
| `radio` | Planned | Single choice from a group |
| `checkbox` | Planned | Multiple selection |
| `date-input` | Planned | Structured date entry (day/month/year) |
| `autocomplete` | Planned | Searchable select — clinical code lookup |
| `file-upload` | Planned | Attachment input |

### Actions
| Component | Status | Notes |
|---|---|---|
| `button` | Planned | Primary, secondary, warning, destructive variants |
| `link` | Planned | Inline and standalone |
| `icon-button` | Planned | Icon-only action with required accessible name |

### Feedback and status
| Component | Status | Notes |
|---|---|---|
| `alert-banner` | Planned | Page-level status messages |
| `inline-error` | Planned | Field-level validation message |
| `notification` | Planned | Toast / system notification |
| `badge` | Planned | Status indicator — count, state label |
| `tag` | Planned | Categorical label |

### Navigation
| Component | Status | Notes |
|---|---|---|
| `top-navigation` | Planned | Global application header |
| `side-navigation` | Planned | Section/module navigation |
| `breadcrumb` | Planned | Hierarchical location indicator |
| `tabs` | Planned | In-page section switching |
| `pagination` | Planned | List/table pagination |
| `skip-link` | Planned | Accessibility — keyboard shortcut to main content |

### Layout and containers
| Component | Status | Notes |
|---|---|---|
| `card` | Planned | Contained content grouping |
| `panel` | Planned | Section within a page |
| `modal` | Planned | Blocking overlay dialog |
| `drawer` | Planned | Sliding side panel |
| `accordion` | Planned | Collapsible content sections |
| `divider` | Planned | Visual section separator |

### Data display
| Component | Status | Notes |
|---|---|---|
| `table` | In development | Data table with row actions ([spec](table/spec.md)). Sorting/filtering/pagination planned. |
| `summary-list` | Planned | Key-value record display (GDS pattern) |
| `data-card` | Planned | Single record summary — patient-facing |
| `timeline` | Planned | Chronological event display |
| `empty-state` | Planned | Zero-data state with guidance |

### Clinical-specific
| Component | Status | Notes |
|---|---|---|
| `patient-banner` | Planned | Persistent patient identity strip |
| `allergy-flag` | Planned | High-visibility allergy indicator |
| `clinical-alert` | Planned | High-priority clinical notification |

---

## Component Status Definitions

| Status | Meaning |
|---|---|
| Planned | Identified need; not yet in design |
| In design | Active work in Figma |
| In review | Design complete; awaiting design/accessibility sign-off |
| Approved | Design approved; ready for engineering handoff |
| In development | Being built in code |
| Live | Available in codebase |
| Deprecated | Being phased out; do not use for new work |

---

## Adding a New Component

1. Confirm there is no existing component that meets the need
2. Create a DDR if the component involves a non-trivial design decision
3. Create `/components/{component-name}/spec.md` using the template at `/docs/templates/component-spec-template.md`
4. Design in Figma before writing the spec
5. Update the catalogue above
