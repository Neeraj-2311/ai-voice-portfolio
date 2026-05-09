'use client';

import { Mic } from 'lucide-react';
import { openContactModal } from '@/lib/contact-modal-event';

/**
 * Phase 2 stub — persistent floating pill, bottom-right, all routes.
 * Spec section 8.
 *
 * Phase 1 click behaviour: opens the Contact Modal as the fallback "until
 * voice tour ships" path. Phase 2 swaps the click handler for a LiveKit
 * voice session (the visual component stays the same — that's the point).
 *
 * The data-voice-action attribute is the hook the Phase 2 voice tools will
 * use to trigger the dock programmatically.
 */
export function VoiceCTADock() {
  return (
    <div className="fixed bottom-4 right-4 z-30 md:bottom-6 md:right-6">
      <button
        type="button"
        onClick={() => openContactModal()}
        data-voice-action="open-voice-tour"
        aria-label="Try the voice portfolio (coming soon — opens contact form for now)"
        className="btn-secondary border-accent text-fg bg-bg hover:bg-elevated group inline-flex items-center gap-2 rounded-full border-2 shadow-lg transition-colors"
      >
        <span
          aria-hidden="true"
          className="bg-accent/15 text-accent inline-flex h-7 w-7 items-center justify-center rounded-full"
        >
          <Mic className="h-4 w-4" />
        </span>
        <span className="text-small font-medium">Try voice portfolio</span>
      </button>
    </div>
  );
}
