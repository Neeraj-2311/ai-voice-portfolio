'use client';

import { ArrowRight } from 'lucide-react';
import { openContactModal } from '@/lib/contact-modal-event';

export function OpenContactSpeakingButton() {
  return (
    <button
      type="button"
      onClick={() => openContactModal({ intent: 'speaking' })}
      data-voice-action="open-event-invite-form"
      className="text-accent hover:text-accent-hover inline-flex items-center gap-1 font-medium transition-colors"
    >
      Get in touch
      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
    </button>
  );
}
