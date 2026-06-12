'use client';

import { type ReactNode, useEffect, useRef } from 'react';
import type { CaptionLine } from './state';

/**
 * Render the agent's light markdown inline: **bold** / __bold__ as bold,
 * *italic* as italic, `code` as plain text. The model sometimes emphasizes a
 * word with asterisks even though it's voice; show it nicely instead of raw
 * asterisks. Unclosed markers (mid-stream) just render as-is until they close.
 */
function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|__([^_]+)__|\*([^*\s][^*]*)\*|`([^`]+)`/g;
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[1] !== undefined || m[2] !== undefined) {
      nodes.push(<strong key={key++}>{m[1] ?? m[2]}</strong>);
    } else if (m[3] !== undefined) {
      nodes.push(<em key={key++}>{m[3]}</em>);
    } else if (m[4] !== undefined) {
      nodes.push(m[4]);
    }
    last = re.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

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
                {renderInline(line.text)}
              </p>
            );
          })
        )}
      </div>
    </div>
  );
}
