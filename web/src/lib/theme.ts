'use client';

import { useSyncExternalStore } from 'react';
import { THEME_STORAGE_KEY } from './storage-keys';

export type Theme = 'light' | 'dark';

export { THEME_STORAGE_KEY };

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
    () => 'dark', // SSR snapshot must match the dark default rendered server-side.
  );

  const setTheme = (next: Theme) => {
    document.documentElement.setAttribute('data-theme', next);
    document.documentElement.style.colorScheme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage may be unavailable. Cookie below is the authoritative store.
    }
    // Cookie is the source of truth on the next request: the server reads
    // it in the root layout to render <html data-theme=...> directly,
    // eliminating any flash of the wrong theme.
    document.cookie = `${THEME_STORAGE_KEY}=${next}; path=/; max-age=31536000; samesite=lax`;
  };

  return {
    theme,
    setTheme,
    toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
  };
}
