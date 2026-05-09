import type { Intent } from '@/types/content';

/**
 * Event-bus contract for the Contact Modal. The modal subscribes to
 * `open-contact-modal` events; any CTA in the tree dispatches the event
 * with an optional intent so the modal opens pre-filled. This keeps the
 * Contact button decoupled from the modal implementation — handy because
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
