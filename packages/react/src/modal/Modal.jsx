import React, { forwardRef, useCallback, useEffect, useId, useRef } from 'react';
import '@dhcw/sr-web/src/modal/modal.css';
import Icon from '../icon/Icon.jsx';

/**
 * Modal — DHCW Single Record Design System (React)
 *
 * Base modal dialog, matched to the Figma Modal set (3807:36855). Per DDR-008
 * this is the single base component; Confirmation and Result are composed
 * patterns built on top of it, not separate components.
 *
 * Built on the native <dialog> element via showModal(), so focus containment,
 * Escape-to-dismiss, top-layer rendering, the backdrop, and focus restoration
 * are the platform's job rather than ours. This wrapper adds only the three
 * things <dialog> does not do:
 *   1. background scroll lock while open
 *   2. optional dismissal by clicking the backdrop
 *   3. routing every close path through a single onClose callback
 *
 * Accessibility: the dialog is labelled by its own title via aria-labelledby.
 * Pass `title` for the standard header, or `hideTitle` with an `aria-label` if a
 * design genuinely has no visible heading — a modal must always have a name.
 */
const Modal = forwardRef(function Modal(
  {
    open = false,
    onClose,
    title,
    size = 'medium',
    children,
    footer,
    showClose = true,
    closeLabel = 'Close',
    dismissOnBackdropClick = true,
    className,
    ...rest
  },
  ref
) {
  const reactId = useId();
  const titleId = `sr-modal-title-${reactId}`;
  const innerRef = useRef(null);

  const setRefs = (node) => {
    innerRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  const requestClose = useCallback(() => {
    if (onClose) onClose();
  }, [onClose]);

  // Drive the real dialog from the `open` prop.
  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
  }, [open]);

  // Native <dialog> does not lock background scrolling.
  useEffect(() => {
    if (!open) return undefined;
    document.body.classList.add('sr-modal-open');
    return () => document.body.classList.remove('sr-modal-open');
  }, [open]);

  // Escape fires the dialog's `cancel` event. Route it through onClose so the
  // caller's state stays in step with the DOM, and prevent the default close
  // so `open` remains the single source of truth.
  useEffect(() => {
    const el = innerRef.current;
    if (!el) return undefined;
    const onCancel = (e) => {
      e.preventDefault();
      requestClose();
    };
    el.addEventListener('cancel', onCancel);
    return () => el.removeEventListener('cancel', onCancel);
  }, [requestClose]);

  // A click on the dialog element itself (not its contents) is a backdrop click:
  // the backdrop is painted by the dialog, so it reports the dialog as target.
  const onDialogClick = (e) => {
    if (!dismissOnBackdropClick) return;
    if (e.target === innerRef.current) requestClose();
  };

  const classes = ['sr-modal', size && `sr-modal--${size}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <dialog
      ref={setRefs}
      className={classes}
      aria-labelledby={title ? titleId : undefined}
      onClick={onDialogClick}
      {...rest}
    >
      {(title || showClose) && (
        <div className="sr-modal__header">
          {title ? (
            <h2 className="sr-modal__title" id={titleId}>
              {title}
            </h2>
          ) : (
            <span />
          )}
          {showClose && (
            <button
              type="button"
              className="sr-modal__close"
              aria-label={closeLabel}
              onClick={requestClose}
            >
              <Icon name="nav/close" size="xs" color="inherit" />
            </button>
          )}
        </div>
      )}

      <div className="sr-modal__body">{children}</div>

      {footer && <div className="sr-modal__footer">{footer}</div>}
    </dialog>
  );
});

export default Modal;
