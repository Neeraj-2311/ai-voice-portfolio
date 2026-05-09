/**
 * Tech / skill badge — logo or initial + name + optional hover tooltip.
 *
 * Design notes:
 *   - Uses the native `title` attribute for the tooltip. It's accessible
 *     (screen readers announce it, mouse users see it, no extra JS), and
 *     matches the spec's brief "tooltip with brief experience note".
 *   - For the visual mark we render a 2-letter monospace initial in an
 *     accent-tinted square. Spec calls for "recognizable logo badges
 *     (Lucide where available, simple-icons for tech logos)" — initials
 *     ship cleanly today and we can drop in real logo SVGs later by
 *     extending the optional `logo` slot without touching consumers.
 */

import type { ReactNode } from 'react';

export interface TechBadgeProps {
  name: string;
  /** Optional logo node (SVG component). Falls back to two-letter initials. */
  logo?: ReactNode;
  /** Optional brief experience note rendered as a native tooltip. */
  note?: string;
  className?: string;
}

function initials(name: string) {
  // Trim leading/trailing whitespace, take first 2 alphanumeric letters.
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
