import type { ReactNode } from 'react';

export interface TechBadgeProps {
  name: string;
  logo?: ReactNode;
  note?: string;
  className?: string;
}

function initials(name: string) {
  const stripped = name.replace(/[^a-zA-Z0-9]/g, '');
  return (stripped.slice(0, 2) || '??').toUpperCase();
}

export function TechBadge({ name, logo, note, className }: TechBadgeProps) {
  const tooltipId = note ? `tt-${name.replace(/\s+/g, '-').toLowerCase()}` : undefined;

  return (
    <span
      className={[
        'group/badge relative inline-block focus-within:z-30 hover:z-30',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span
        tabIndex={note ? 0 : undefined}
        aria-describedby={tooltipId}
        className="border-line bg-elevated text-fg hover:border-line-strong hover:text-accent inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-small transition-colors"
      >
        <span
          aria-hidden="true"
          className="bg-accent/15 text-accent inline-flex h-5 w-5 items-center justify-center rounded font-mono text-[10px] font-medium"
        >
          {logo ?? initials(name)}
        </span>
        <span className="font-medium">{name}</span>
      </span>
      {note ? (
        <span
          id={tooltipId}
          role="tooltip"
          className="bg-bg text-fg border-line pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md border px-2.5 py-1.5 text-small shadow-md group-focus-within/badge:block group-hover/badge:block"
        >
          {note}
        </span>
      ) : null}
    </span>
  );
}
