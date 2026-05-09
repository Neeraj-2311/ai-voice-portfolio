'use client';

import { useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'neeraj-theme';

/**
 * Inline script body — runs synchronously in <head> before paint, so the
 * correct theme is applied before React hydrates and there is no FOUC.
 *
 * Stays as a string (rather than a real function) because it's injected
 * via dangerouslySetInnerHTML. Keep it dependency-free and ES2017-safe.
 */
export const themeInitScript = `(() => {
  try {
    const stored = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    const theme = stored === 'light' || stored === 'dark'
      ? stored
      : prefersLight ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
  } catch {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.style.colorScheme = 'dark';
  }
})();`;

function readTheme(): Theme {
  const value = document.documentElement.getAttribute('data-theme');
  return value === 'light' ? 'light' : 'dark';
}

function subscribeTheme(callback: () => void): () => void {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
  return () => observer.disconnect();
}

export function useTheme(): {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
} {
  const theme = useSyncExternalStore<Theme>(
    subscribeTheme,
    readTheme,
    () => 'dark', // SSR snapshot — must match the dark default rendered server-side
  );

  const setTheme = (next: Theme) => {
    document.documentElement.setAttribute('data-theme', next);
    document.documentElement.style.colorScheme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage may be unavailable (Safari private mode, etc.). Theme still
      // persists for the current session via the data-theme attribute.
    }
  };

  return {
    theme,
    setTheme,
    toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
  };
}
