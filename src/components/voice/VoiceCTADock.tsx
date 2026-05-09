'use client';

import { Mic } from 'lucide-react';
import { openContactModal } from '@/lib/contact-modal-event';

// Phase 2 stub: same visual, click handler swaps to LiveKit when voice ships.
export function VoiceCTADock() {
  return (
    <div className="fixed bottom-4 right-4 z-30 md:bottom-6 md:right-6">
      <button
        type="button"
        onClick={() => openContactModal()}
        data-voice-action="open-voice-tour"
        aria-label="Try the voice portfolio. Coming soon. Opens the contact form for now."
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
