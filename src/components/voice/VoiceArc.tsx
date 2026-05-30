'use client';

import { motion } from 'framer-motion';
import { AlertCircle, Loader2 } from 'lucide-react';
import { AudioVisualizer } from './AudioVisualizer';
import { BookingSummaryCard } from './BookingSummaryCard';
import { CaptionRail } from './CaptionRail';
import { ControlRow } from './ControlRow';
import { FeedbackPrompt, FeedbackThankYou } from './FeedbackPanel';
import { TextFallback } from './TextFallback';
import type {
  BookingPayload,
  FeedbackPayload,
  VoiceState,
} from './state';
import type { VoiceTracks } from './useVoiceSession';

const STATE_LABEL: Partial<Record<VoiceState, string>> = {
  connecting: 'Connecting…',
  'agent-joining': 'Waking up…',
  listening: 'Listening',
  'user-speaking': 'Listening',
  'agent-speaking': 'Speaking',
  thinking: 'Thinking…',
};

interface VoiceArcProps {
  state: VoiceState;
  tracks: VoiceTracks;
  captions: Parameters<typeof CaptionRail>[0]['lines'];
  captionsVisible: boolean;
  micMuted: boolean;
  textMode: boolean;
  errorMessage: string | null;
  bookingPayload: BookingPayload | null;
  feedbackPayload: FeedbackPayload | null;
  onToggleMic: () => void;
  onToggleCaptions: () => void;
  onToggleTextMode: () => void;
  onSendText: (text: string) => void;
  onEnd: () => void;
  onDoneBooking: () => void;
  onCloseThanks: () => void;
}

export function VoiceArc({
  state,
  tracks,
  captions,
  captionsVisible,
  micMuted,
  textMode,
  errorMessage,
  bookingPayload,
  feedbackPayload,
  onToggleMic,
  onToggleCaptions,
  onToggleTextMode,
  onSendText,
  onEnd,
  onDoneBooking,
  onCloseThanks,
}: VoiceArcProps) {
  const isAgentSpeaking = state === 'agent-speaking';
  const isUserSpeaking = state === 'user-speaking';
  const visualizerMode: 'user' | 'agent' | 'idle' = isUserSpeaking
    ? 'user'
    : isAgentSpeaking
      ? 'agent'
      : 'idle';
  const visualizerTrack =
    visualizerMode === 'agent'
      ? tracks.agentTrack
      : visualizerMode === 'user'
        ? tracks.localTrack
        : null;

  const showStatusBadge = STATE_LABEL[state] != null && state !== 'thank-you';

  return (
    <motion.div
      layoutId="voice-cta"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ type: 'spring', stiffness: 280, damping: 32 }}
      role="dialog"
      aria-label="Voice portfolio tour"
      className="fixed bottom-4 left-1/2 z-50 w-[min(720px,calc(100vw-2rem))] -translate-x-1/2 will-change-transform"
    >
      <div
        className={[
          'border-line bg-elevated/95 supports-[backdrop-filter]:bg-elevated/80 supports-[backdrop-filter]:backdrop-blur-md',
          'relative overflow-hidden border shadow-2xl',
          // Curved top edge — large radius on top, smaller on bottom for the "arc" feel.
          'rounded-t-[140px] rounded-b-2xl',
          isAgentSpeaking ? 'ring-accent/40 ring-2' : 'ring-0',
          'transition-shadow duration-300',
        ].join(' ')}
      >
        {/* Top edge accent glow on agent speaking */}
        {isAgentSpeaking && (
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[var(--accent-glow)] to-transparent"
          />
        )}

        <div className="flex flex-col gap-4 px-6 pb-5 pt-10">
          {/* Status badge */}
          {showStatusBadge && (
            <div className="flex items-center justify-center">
              <span
                className={[
                  'inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wide',
                  state === 'connecting' || state === 'agent-joining'
                    ? 'text-muted bg-fg/5'
                    : isAgentSpeaking
                      ? 'text-accent bg-accent/10'
                      : isUserSpeaking
                        ? 'text-fg bg-fg/10'
                        : 'text-subtle bg-fg/5',
                ].join(' ')}
              >
                {(state === 'connecting' || state === 'agent-joining' || state === 'thinking') && (
                  <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                )}
                {!isAgentSpeaking && !isUserSpeaking && (state === 'listening') && (
                  <span aria-hidden="true" className="bg-accent inline-block h-1.5 w-1.5 animate-pulse rounded-full" />
                )}
                {STATE_LABEL[state]}
              </span>
            </div>
          )}

          {/* Body — switches by state */}
          {state === 'booking-confirmed' && bookingPayload ? (
            <BookingSummaryCard payload={bookingPayload} onDone={onDoneBooking} />
          ) : state === 'feedback-prompt' ? (
            <FeedbackPrompt />
          ) : state === 'thank-you' && feedbackPayload ? (
            <FeedbackThankYou payload={feedbackPayload} onClose={onCloseThanks} />
          ) : state === 'error' ? (
            <div className="text-error flex items-center justify-center gap-2 text-small">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              <span>{errorMessage ?? 'Something went wrong.'}</span>
            </div>
          ) : (
            <>
              <div className="h-16">
                <AudioVisualizer track={visualizerTrack} mode={visualizerMode} />
              </div>
              <CaptionRail
                lines={captions}
                visible={captionsVisible}
                disclaimer="Voice is a clone of Neeraj's. Audio is not stored."
              />
            </>
          )}

          {/* Text fallback row */}
          {textMode && state !== 'booking-confirmed' && state !== 'thank-you' && (
            <TextFallback onSubmit={onSendText} disabled={state === 'connecting'} />
          )}

          {/* Controls */}
          {state !== 'thank-you' && (
            <ControlRow
              micMuted={micMuted}
              captionsVisible={captionsVisible}
              textMode={textMode}
              onToggleMic={onToggleMic}
              onToggleCaptions={onToggleCaptions}
              onToggleTextMode={onToggleTextMode}
              onEnd={onEnd}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}
