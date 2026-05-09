'use client';

import { Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CalEmbedProps {
  calLink: string;
  label?: string;
  /** When true, the iframe loads only after the user clicks the placeholder.
   *  Keeps Cal's heavy script off the critical path on standalone routes. */
  defer?: boolean;
}

export function CalEmbed({ calLink, label, defer = true }: CalEmbedProps) {
  const [Cal, setCal] = useState<null | typeof import('@calcom/embed-react').default>(null);
  const [activated, setActivated] = useState(!defer);
  const ready = !calLink || calLink.includes('[TODO]');

  useEffect(() => {
    if (!activated || ready) return;
    let cancelled = false;
    void import('@calcom/embed-react').then((mod) => {
      if (!cancelled) setCal(() => mod.default);
    });
    return () => {
      cancelled = true;
    };
  }, [activated, ready]);

  if (ready) {
    return (
      <div className="border-line bg-elevated rounded-2xl border p-6 text-center md:p-10">
        <Calendar className="text-accent mx-auto h-8 w-8" aria-hidden="true" />
        <p className="text-fg mt-3 font-medium">Calendar booking opens soon</p>
        <p className="text-muted mt-1 text-small">
          Cal.com embed will appear here once the slug is wired in env. Until then, use
          the contact form below.
        </p>
      </div>
    );
  }

  if (!activated) {
    return (
      <button
        type="button"
        onClick={() => setActivated(true)}
        className="border-line bg-elevated hover:border-line-strong flex w-full flex-col items-center justify-center rounded-2xl border p-6 transition-colors md:p-10"
      >
        <Calendar className="text-accent h-8 w-8" aria-hidden="true" />
        <span className="text-fg mt-3 font-medium">{label ?? 'Open the calendar'}</span>
        <span className="text-subtle mt-1 text-small">
          Loads on click to keep this page fast.
        </span>
      </button>
    );
  }

  if (!Cal) {
    return (
      <div className="border-line bg-elevated text-muted rounded-2xl border p-6 text-center text-small md:p-10">
        Loading calendar…
      </div>
    );
  }

  return (
    <div className="border-line bg-elevated overflow-hidden rounded-2xl border">
      <Cal calLink={calLink} style={{ width: '100%', minHeight: '600px' }} />
    </div>
  );
}
