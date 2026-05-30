'use client';

import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';

interface VoicePillProps {
  onClick: () => void;
  /** Pulse once on first render to draw the eye. */
  initialPulse?: boolean;
}

export function VoicePill({ onClick, initialPulse }: VoicePillProps) {
  return (
    <motion.button
      layoutId="voice-cta"
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 24, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      aria-label="Talk to my portfolio"
      data-voice-action="open-voice-tour"
      className={[
        'group fixed bottom-4 right-4 z-50 inline-flex items-center gap-2',
        'bg-accent text-accent-fg shadow-lg shadow-[var(--accent-glow)]',
        'rounded-full px-4 py-3 md:px-5 md:py-3.5',
        'text-small font-semibold md:text-body',
        'hover:bg-accent-hover hover:shadow-xl hover:shadow-[var(--accent-glow)]',
        'active:scale-[0.97]',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]',
        initialPulse ? 'animate-voice-pill-pulse' : '',
      ].join(' ')}
      style={{ minHeight: '48px' }}
    >
      <span
        aria-hidden="true"
        className="relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/15"
      >
        <Mic className="h-3.5 w-3.5" />
        <span className="bg-accent-fg/40 absolute inset-0 rounded-full opacity-0 group-hover:animate-ping group-hover:opacity-100" />
      </span>
      <span className="hidden sm:inline">Talk to my portfolio</span>
      <span className="inline sm:hidden">Talk</span>
    </motion.button>
  );
}
