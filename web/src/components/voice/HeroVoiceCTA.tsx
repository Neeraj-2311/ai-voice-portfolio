'use client';

import { Mic } from 'lucide-react';
import { openVoiceArc } from '@/lib/voice-event';
import { warmVoiceAgent } from '@/lib/voice-warmup';

export function HeroVoiceCTA() {
  return (
    <button
      type="button"
      onClick={openVoiceArc}
      // Wake the worker the moment they reach for the button (throttled).
      onPointerEnter={warmVoiceAgent}
      onFocus={warmVoiceAgent}
      onTouchStart={warmVoiceAgent}
      data-voice-action="open-voice-tour"
      className={[
        'group inline-flex items-center justify-center gap-2 rounded-lg',
        'bg-accent text-accent-fg px-4 py-2.5 text-small font-semibold md:text-body',
        'hover:bg-accent-hover active:scale-[0.98]',
        'shadow-md shadow-[var(--accent-glow)] hover:shadow-lg hover:shadow-[var(--accent-glow)]',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]',
        'animate-voice-cta-pulse-once',
      ].join(' ')}
      style={{ minHeight: '48px' }}
    >
      <span className="relative inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
        <Mic className="h-3 w-3" aria-hidden="true" />
      </span>
      Talk to my portfolio
    </button>
  );
}
