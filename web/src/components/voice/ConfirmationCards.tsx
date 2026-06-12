'use client';

import { Check, PhoneCall, Send } from 'lucide-react';
import type { CallbackPayload, MessageSentPayload } from './state';

interface MessageSentCardProps {
  payload: MessageSentPayload;
  onDone: () => void;
}

export function MessageSentCard({ payload, onDone }: MessageSentCardProps) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <span
        aria-hidden="true"
        className="bg-success/15 text-success inline-flex h-9 w-9 items-center justify-center rounded-full"
      >
        <Send className="h-4 w-4" />
      </span>
      <div>
        <p className="text-fg font-medium">Message sent to Neeraj</p>
        <p className="text-muted mt-0.5 text-small">
          {payload.email ? `He'll reply to ${payload.email}.` : "He'll get back to you soon."}
        </p>
      </div>
      <button
        type="button"
        onClick={onDone}
        className="bg-accent text-accent-fg hover:bg-accent-hover inline-flex items-center rounded-full px-3 py-1.5 text-small font-medium transition-colors"
      >
        Done
      </button>
    </div>
  );
}

interface CallbackCardProps {
  payload: CallbackPayload;
  onDone: () => void;
}

export function CallbackCard({ payload, onDone }: CallbackCardProps) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <span
        aria-hidden="true"
        className="bg-accent/15 text-accent inline-flex h-9 w-9 items-center justify-center rounded-full"
      >
        <PhoneCall className="h-4 w-4" />
      </span>
      <div>
        <p className="text-fg font-medium">Neeraj has been pinged</p>
        <p className="text-muted mt-0.5 text-small">
          {payload.name ? `He'll call you back shortly, ${payload.name}.` : "He'll call you back shortly."}
        </p>
      </div>
      <button
        type="button"
        onClick={onDone}
        className="border-line text-fg hover:border-line-strong hover:text-accent inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-small transition-colors"
      >
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
        Got it
      </button>
    </div>
  );
}
