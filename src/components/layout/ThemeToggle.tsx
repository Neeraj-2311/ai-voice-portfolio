'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/theme';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={[
        'btn-icon border-line text-fg hover:border-line-strong hover:text-accent inline-flex items-center justify-center rounded-lg border transition-colors',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {isDark ? (
        <Sun className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Moon className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  );
}
