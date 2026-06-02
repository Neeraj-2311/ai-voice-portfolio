'use client';

import { useEffect, useRef } from 'react';
import type { CaptionLine } from './state';

interface CaptionRailProps {
  lines: CaptionLine[];
  visible: boolean;
  /** Compact persistent disclaimer rendered at the top of the rail. */
  disclaimer?: string;
}

export function CaptionRail({ lines, visible, disclaimer }: CaptionRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [lines]);

  if (!visible) return null;

  const recent = lines.slice(-4);

  return (
    <div className="flex flex-col gap-1.5">
      {disclaimer && (
        <p className="text-subtle text-center text-[11px] leading-tight">{disclaimer}</p>
      )}
      <div
        ref={scrollRef}
        aria-live="polite"
        aria-atomic="false"
        className="flex max-h-[56px] flex-col gap-1 overflow-y-auto px-1 sm:max-h-[88px]"
      >
        {recent.length === 0 ? (
          <p className="text-subtle text-center text-small italic">Listening…</p>
        ) : (
          recent.map((line) => {
            const isAgent = line.from === 'agent';
            return (
              <p
                key={line.id}
                className={[
                  'text-small leading-snug text-pretty',
                  isAgent ? 'text-fg text-left' : 'text-muted text-right',
                  line.partial ? 'opacity-70' : 'opacity-100',
                ].join(' ')}
              >
                <span
                  className={[
                    'mr-1.5 text-[11px] font-medium uppercase tracking-wide',
                    isAgent ? 'text-accent' : 'text-subtle',
                  ].join(' ')}
                >
                  {isAgent ? 'Neeraj' : 'You'}
                </span>
                {line.text}
              </p>
            );
          })
        )}
      </div>
    </div>
  );
}
