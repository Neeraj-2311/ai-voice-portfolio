'use client';

import { Calendar, Check, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import type { BookingPayload } from './state';

interface BookingSummaryCardProps {
  payload: BookingPayload;
  onDone: () => void;
}

function formatSlot(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function BookingSummaryCard({ payload, onDone }: BookingSummaryCardProps) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <span
        aria-hidden="true"
        className="bg-success/15 text-success inline-flex h-9 w-9 items-center justify-center rounded-full"
      >
        <Check className="h-4 w-4" />
      </span>
      <div>
        <p className="text-fg font-medium">{payload.eventTitle}</p>
        <p className="text-muted mt-0.5 text-small">{formatSlot(payload.slotIso)}</p>
        {payload.attendeeEmail && (
          <p className="text-subtle mt-0.5 text-[12px]">
            Confirmation sent to {payload.attendeeEmail}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {payload.addToCalendarUrl && (
          <Link
            href={payload.addToCalendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="border-line text-fg hover:border-line-strong hover:text-accent inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-small transition-colors"
          >
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            Add to calendar
          </Link>
        )}
        {payload.calEventLink && (
          <Link
            href={payload.calEventLink}
            target="_blank"
            rel="noopener noreferrer"
            className="border-line text-fg hover:border-line-strong hover:text-accent inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-small transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            View booking
          </Link>
        )}
        <button
          type="button"
          onClick={onDone}
          className="bg-accent text-accent-fg hover:bg-accent-hover inline-flex items-center rounded-full px-3 py-1.5 text-small font-medium transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}
