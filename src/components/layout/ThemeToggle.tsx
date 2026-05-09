'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/theme';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={[
        'border-line text-fg hover:border-line-strong hover:text-accent inline-flex h-9 w-9 items-center justify-center rounded-md border transition-colors',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {isDark ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
    </button>
  );
}
