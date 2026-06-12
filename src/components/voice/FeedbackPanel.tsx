'use client';

import type { FeedbackPayload, FeedbackRating } from './state';

const EMOJI: Record<FeedbackRating, string> = {
  great: '🤩',
  good: '😊',
  okay: '🙂',
  bad: '😕',
};

const HEADLINE: Record<FeedbackRating, string> = {
  great: 'Thanks. Really glad you liked it.',
  good: 'Thanks for the kind words.',
  okay: 'Appreciate the honest read.',
  bad: 'Thanks. I will keep tuning this.',
};

interface FeedbackThankYouProps {
  payload: FeedbackPayload;
  onClose: () => void;
}

export function FeedbackThankYou({ payload, onClose }: FeedbackThankYouProps) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <span className="text-4xl leading-none" aria-hidden="true">
        {EMOJI[payload.rating]}
      </span>
      <p className="text-fg font-medium">{HEADLINE[payload.rating]}</p>
      {payload.quote && (
        <p className="text-muted max-w-sm text-pretty text-small italic">
          “{payload.quote}”
        </p>
      )}
      <button
        type="button"
        onClick={onClose}
        className="text-subtle hover:text-fg mt-1 text-[12px] underline-offset-2 transition-colors hover:underline"
      >
        Close
      </button>
    </div>
  );
}

interface FeedbackPromptProps {
  question?: string;
}

export function FeedbackPrompt({ question }: FeedbackPromptProps) {
  return (
    <p className="text-fg text-center text-small">
      {question ?? 'How was the tour?'}
    </p>
  );
}
