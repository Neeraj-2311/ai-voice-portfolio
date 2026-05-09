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
  return (
    <span
      title={note ?? name}
      className={[
        'border-line bg-elevated text-fg inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-small transition-colors',
        'hover:border-line-strong hover:text-accent',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span
        aria-hidden="true"
        className="bg-accent/15 text-accent inline-flex h-5 w-5 items-center justify-center rounded font-mono text-[10px] font-medium"
      >
        {logo ?? initials(name)}
      </span>
      <span className="font-medium">{name}</span>
    </span>
  );
}
