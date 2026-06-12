'use client';

import { ALargeSmall } from 'lucide-react';
import { useTextSize } from '@/lib/text-size';

export function TextSizeToggle({ className }: { className?: string }) {
  const { textSize, toggleTextSize } = useTextSize();
  const isLarger = textSize === 'larger';
  const label = isLarger ? 'Switch to default text size' : 'Switch to larger text';

  return (
    <button
      type="button"
      onClick={toggleTextSize}
      aria-label={label}
      aria-pressed={isLarger}
      title={label}
      className={[
        'btn-icon text-muted hover:text-fg hover:bg-fg/10 aria-pressed:bg-fg/10 aria-pressed:text-accent inline-flex items-center justify-center rounded-lg transition-colors',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <ALargeSmall className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
