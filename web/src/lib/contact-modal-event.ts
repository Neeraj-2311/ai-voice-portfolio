import type { Intent } from '@/types/content';

/**
 * Event-bus contract for the Contact Modal. The modal subscribes to
 * `open-contact-modal` events; any CTA in the tree dispatches the event
 * with an optional intent so the modal opens pre-filled. This keeps the
 * Contact button decoupled from the modal implementation. Handy because
 * the button lives in the sticky nav (rendered in the root layout) while
 * the modal mounts deeper in the tree.
 */

export const OPEN_CONTACT_MODAL_EVENT = 'open-contact-modal';

export interface OpenContactModalDetail {
  intent?: Intent;
  /** Optional pre-fill values keyed by form field name. */
  prefill?: Record<string, string>;
}

export function openContactModal(detail: OpenContactModalDetail = {}) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<OpenContactModalDetail>(OPEN_CONTACT_MODAL_EVENT, { detail }),
  );
}

/**
 * Live field patches for an already-open modal. The voice agent fires these as
 * it collects a message, so the open form visibly fills in field by field
 * without remounting (which `openContactModal` does via a key bump). The
 * ContactForm subscribes and applies each field with react-hook-form setValue.
 */
export const PREFILL_CONTACT_MODAL_EVENT = 'prefill-contact-modal';

export interface PrefillContactModalDetail {
  intent?: Intent;
  name?: string;
  email?: string;
  message?: string;
}

export function prefillContactModal(detail: PrefillContactModalDetail = {}) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<PrefillContactModalDetail>(PREFILL_CONTACT_MODAL_EVENT, { detail }),
  );
}

/**
 * Programmatically close the modal. The voice agent fires this after it has sent
 * a message on the visitor's behalf, so the open form does not linger on top of
 * the "message sent" confirmation in the voice arc.
 */
export const CLOSE_CONTACT_MODAL_EVENT = 'close-contact-modal';

export function closeContactModal() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(CLOSE_CONTACT_MODAL_EVENT));
}
