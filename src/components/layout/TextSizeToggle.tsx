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
        'btn-icon border-line text-fg hover:border-line-strong hover:text-accent aria-pressed:border-accent aria-pressed:text-accent inline-flex items-center justify-center rounded-lg border transition-colors',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <ALargeSmall className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}
