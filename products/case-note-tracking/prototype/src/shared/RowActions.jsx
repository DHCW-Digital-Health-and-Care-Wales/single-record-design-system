import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Modal, Button, Select, Input, Checkbox, Icon, RadioGroup, Radio, Tag } from '@dhcw/sr-react';
import { SITES, SEND_RECIPIENTS, NOTE_TAGS } from '../data.js';

/**
 * Row-level action menu (Figma 47:4041), shared by the casenote table and My
 * Requests. There is no Menu/Dropdown component in the design system yet —
 * DESIGN-SYSTEM.md names this gap explicitly rather than inventing one
 * silently. This is a local, minimal stand-in built from tokens only, scoped
 * to this prototype until a real component exists.
 *
 * The table wrapper (`.sr-table-wrap`) sets `overflow-x: auto` for small
 * viewports, which per the CSS overflow spec forces `overflow-y` to `auto`
 * too (a "visible" axis can't survive next to a non-visible one) — so an
 * absolutely-positioned menu inside it got clipped at the table's bottom
 * edge instead of resting on top of the page. Portaling the menu to
 * `document.body` and positioning it from the trigger's own bounding rect
 * sidesteps that entirely.
 */
export function RowActionMenu({ row, onAction }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onOutside = (e) => {
      if (
        btnRef.current && !btnRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    // A popover pinned by viewport coordinates goes stale the moment the
    // page scrolls or resizes — closing it is simpler and safer than
    // re-tracking position on every scroll tick.
    const onReflow = () => setOpen(false);
    document.addEventListener('click', onOutside, true);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onReflow, true);
    window.addEventListener('resize', onReflow);
    return () => {
      document.removeEventListener('click', onOutside, true);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onReflow, true);
      window.removeEventListener('resize', onReflow);
    };
  }, [open]);

  const items = [
    { key: 'send', label: 'Send case note' },
    { key: 'receive', label: 'Receive case note' },
    { key: 'tag', label: 'Tag case note' },
    { key: 'merge', label: 'Merge case note' },
    { key: 'deactivate', label: 'Deactivate case note', destructive: true },
    { key: 'delete', label: 'Delete case note', destructive: true },
  ];
  // ~40px per row (line-height-20 + space-2 padding + border) — a real
  // measurement would need a render before we know it fits, which flickers.
  const estimatedHeight = items.length * 40;

  const toggle = () => {
    if (open) {
      setOpen(false);
      return;
    }
    const rect = btnRef.current.getBoundingClientRect();
    const right = window.innerWidth - rect.right;
    const spaceBelow = window.innerHeight - rect.bottom;
    // Flip above the trigger when there isn't room below — a fixed-position
    // menu computed once at open time can otherwise land past the bottom of
    // the viewport with no way to scroll back to it.
    const openUpward = spaceBelow < estimatedHeight + 8 && rect.top > estimatedHeight;
    setCoords(
      openUpward
        ? { bottom: window.innerHeight - rect.top + 4, right }
        : { top: rect.bottom + 4, right }
    );
    setOpen(true);
  };

  return (
    <div className="row-menu">
      <button
        ref={btnRef}
        type="button"
        className="sr-table__action"
        aria-label={`Actions for ${row.volume} at ${row.location}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggle}
      >
        <Icon name="nav/menu2" size="sm" color="inherit" />
      </button>
      {open && coords &&
        createPortal(
          <ul
            ref={menuRef}
            className="row-menu__list"
            role="menu"
            style={{ top: coords.top, bottom: coords.bottom, right: coords.right }}
          >
            {items.map((item) => (
              <li key={item.key} role="none">
                <button
                  type="button"
                  role="menuitem"
                  className={`row-menu__item${item.destructive ? ' row-menu__item--destructive' : ''}`}
                  onClick={() => {
                    setOpen(false);
                    onAction(item.key, row);
                  }}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>,
          document.body
        )}
    </div>
  );
}

/**
 * "+ Add additional information" (Figma 399:9108/399:9110), used identically
 * in the Create / Send / Receive / Tag modals. Starts as a link; clicking it
 * swaps in a labelled textarea with a delete control that reverts back to
 * the link, discarding whatever was entered.
 */
export function AdditionalInfoField() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  if (!open) {
    return (
      <button
        type="button"
        className="link-action modal-add-field"
        onClick={() => setOpen(true)}
      >
        + Add additional information
      </button>
    );
  }

  return (
    <div className="modal-additional-info">
      <div className="modal-additional-info__header">
        <span className="modal-additional-info__label">Additional Info</span>
        <button
          type="button"
          className="modal-additional-info__delete"
          aria-label="Remove additional information"
          onClick={() => {
            setOpen(false);
            setValue('');
          }}
        >
          <Icon name="action/delete" size="sm" color="inherit" />
        </button>
      </div>
      <Input
        type="textarea"
        label="Additional Info"
        hideLabel
        placeholder="Enter value"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}

/**
 * Shared body for the three row-level workflow modals (Send/Receive/Tag —
 * Figma 26:3509, 160:7684, 308:26049). All three share the same Record
 * Details banner plus a date/time-and-sites form; only the title, primary
 * button label and the middle field (Sent date/time for Receive, a
 * required-by checkbox and date/time for Tag) differ.
 */
export function NoteActionModal({ kind, row, onClose }) {
  const open = Boolean(row);
  const [requiredBy, setRequiredBy] = useState(true);

  // Prior tags on this volume, and which one (if any) the user chose to reuse.
  // `choice` also drives which step is showing: null means the chooser is still
  // up, so the form below has not been reached yet.
  const tags = (kind === 'send' && row && NOTE_TAGS[row.id]) || [];
  const [choice, setChoice] = useState(null);
  const [selectedTagId, setSelectedTagId] = useState(tags[0]?.id || 'blank');

  // Reset when the modal is opened on a different row — the component stays
  // mounted between openings, so without this the previous row's choice (and
  // its prefill) would carry over onto someone else's casenote.
  useEffect(() => {
    setChoice(null);
    setSelectedTagId(tags[0]?.id || 'blank');
    setRequiredBy(true);
  }, [row?.id, kind]);

  const config = {
    send: { title: 'Send Notes', primary: 'Send note' },
    receive: { title: 'Receive Notes', primary: 'Receive note' },
    tag: { title: 'Tag Notes', primary: 'Tag note' },
  }[kind];

  // Step 1 of Send, and only where the volume has been tagged before. A volume
  // with no tags has nothing to offer, so it opens straight on the form rather
  // than on a chooser with one option.
  if (open && tags.length > 0 && choice === null) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        title={config.title}
        size="medium"
        footer={
          <>
            <Button
              type="primary"
              onClick={() => setChoice(
                selectedTagId === 'blank'
                  ? { prefill: null }
                  : tags.find((t) => t.id === selectedTagId)
              )}
            >
              Continue
            </Button>
            <Button type="secondary" onClick={onClose}>Cancel</Button>
          </>
        }
      >
        <p className="tag-choice__intro">
          The following tags have been made for this casenote volume. Select one to
          reuse, or start blank.
        </p>
        <RadioGroup
          legend="Reuse a previous tag"
          hideLegend
          name="tag-choice"
          value={selectedTagId}
          onChange={setSelectedTagId}
        >
          {tags.map((t) => (
            <div
              key={t.id}
              className={`tag-choice${selectedTagId === t.id ? ' tag-choice--selected' : ''}`}
            >
              <Radio
                name="tag-choice"
                value={t.id}
                checked={selectedTagId === t.id}
                onChange={() => setSelectedTagId(t.id)}
                label={
                  <span className="tag-choice__body">
                    <span className="tag-choice__head">
                      <span className="tag-choice__title">
                        {t.department ? `(${t.department}) — ` : ''}{t.location}
                      </span>
                      {t.mostRecent && <Tag type="blue" size="small">Most recent</Tag>}
                    </span>
                    <span className="tag-choice__meta">
                      Tagged {t.taggedOn} by {t.taggedBy}
                    </span>
                  </span>
                }
              />
            </div>
          ))}
          <p className="tag-choice__or"><span>OR</span></p>
          <div className={`tag-choice${selectedTagId === 'blank' ? ' tag-choice--selected' : ''}`}>
            <Radio
              name="tag-choice"
              value="blank"
              checked={selectedTagId === 'blank'}
              onChange={() => setSelectedTagId('blank')}
              label={
                <span className="tag-choice__body">
                  <span className="tag-choice__title tag-choice__title--strong">
                    Start a new send with blank fields
                  </span>
                  <span className="tag-choice__meta">
                    Enter tracking details manually — nothing is pre-filled
                  </span>
                </span>
              }
            />
          </div>
        </RadioGroup>
      </Modal>
    );
  }

  const prefill = choice?.prefill || null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={config?.title}
      size="medium"
      footer={
        <>
          {tags.length > 0 && (
            <Button type="ghost" onClick={() => setChoice(null)}>Back to tags</Button>
          )}
          <Button type="secondary" onClick={onClose}>Cancel</Button>
          <Button type="primary" onClick={onClose}>{config?.primary}</Button>
        </>
      }
    >
      {row && (
        <>
          <div className="modal-banner">
            <p className="modal-banner__title">
              <Icon name="status/info" size="sm" color="inherit" />
              Record Details
            </p>
            <div className="modal-banner__grid">
              <div className="modal-banner__field">
                <dt>Location</dt>
                <dd>{row.location}</dd>
              </div>
              <div className="modal-banner__field">
                <dt>Type/Volume</dt>
                <dd>{row.volume}</dd>
              </div>
              {kind === 'receive' && (
                <>
                  <div className="modal-banner__field">
                    <dt>Sent Date</dt>
                    <dd>{row.moved.split(' ').slice(0, 3).join(' ')}</dd>
                  </div>
                  <div className="modal-banner__field">
                    <dt>Sent Time</dt>
                    <dd>{row.moved.split(' ').slice(-1)[0]}</dd>
                  </div>
                </>
              )}
            </div>
          </div>

          {prefill && (
            <p className="modal-prefill-note">
              <Icon name="status/info" size="sm" color="inherit" />
              Pre-filled from the tag made on {choice.taggedOn} by {choice.taggedBy}. Change anything
              that no longer applies before sending.
            </p>
          )}

          {kind === 'tag' && (
            <Checkbox
              label="Notes required by"
              checked={requiredBy}
              onChange={() => setRequiredBy((v) => !v)}
            />
          )}

          <div className="modal-form-row">
            <Input
              type="calendar"
              label={kind === 'tag' ? 'Required by date' : `${config.title.split(' ')[0]} date`}
              required
            />
            <Input
              type="time"
              label={kind === 'tag' ? 'Required by time' : `${config.title.split(' ')[0]} time`}
              required
            />
          </div>
          {/* `key` remounts the fields when a different tag is chosen: these are
              uncontrolled inputs, so a changed defaultValue alone would not
              move them, and the form would silently show the previous tag's
              values under the new tag's heading. */}
          <Select
            key={`with-${choice?.id || 'blank'}`}
            label="I am working with" options={SITES}
            defaultValue={prefill?.workingWith || 'all'} required
          />
          <Select
            key={`loc-${choice?.id || 'blank'}`}
            label="Location" options={SITES}
            defaultValue={prefill?.location || 'all'} required
          />
          <Select
            key={`hold-${choice?.id || 'blank'}`}
            label="Holder" options={SEND_RECIPIENTS}
            defaultValue={prefill?.holder || SEND_RECIPIENTS[0].value} required
          />
          <Input
            key={`clinic-${choice?.id || 'blank'}`}
            type="calendar" label="Clinic/TCI date"
            defaultValue={prefill ? new Date(prefill.clinicDate) : null} required
          />

          <AdditionalInfoField />
        </>
      )}
    </Modal>
  );
}

/**
 * Destructive confirmation dialog (design system 2612:3325), not yet added to
 * the DS website. Used by Deactivate/Delete row actions — both are
 * irreversible-in-spirit, so neither should fire straight from the kebab menu
 * without a second, named confirmation.
 */
export function ConfirmModal({ open, title, body, confirmLabel, onConfirm, onClose }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <span className="confirm-modal__title">
          <span className="confirm-modal__icon">
            <Icon name="status/warning" size="sm" color="inherit" />
          </span>
          {title}
        </span>
      }
      size="small"
      footer={
        <>
          <Button type="secondary" onClick={onClose}>Cancel</Button>
          <Button type="destructive" onClick={onConfirm}>{confirmLabel}</Button>
        </>
      }
    >
      <p>{body}</p>
    </Modal>
  );
}
