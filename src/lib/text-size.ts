'use client';

import { useSyncExternalStore } from 'react';

export type TextSize = 'default' | 'larger';

export const TEXT_SIZE_STORAGE_KEY = 'neeraj-text-size';

/**
 * Inline script body. Runs synchronously in <body> head before paint, so
 * the saved text-size preference is applied before React hydrates.
 *
 * Stays as a string (rather than a real function) because it's injected
 * via dangerouslySetInnerHTML. Keep it dependency-free and ES2017-safe.
 */
export const textSizeInitScript = `(() => {
  try {
    const stored = localStorage.getItem(${JSON.stringify(TEXT_SIZE_STORAGE_KEY)});
    const size = stored === 'larger' ? 'larger' : 'default';
    document.documentElement.setAttribute('data-text-size', size);
  } catch {
    document.documentElement.setAttribute('data-text-size', 'default');
  }
})();`;

function readTextSize(): TextSize {
  const value = document.documentElement.getAttribute('data-text-size');
  return value === 'larger' ? 'larger' : 'default';
}

function subscribeTextSize(callback: () => void): () => void {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-text-size'],
  });
  return () => observer.disconnect();
}

export function useTextSize(): {
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  toggleTextSize: () => void;
} {
  const textSize = useSyncExternalStore<TextSize>(
    subscribeTextSize,
    readTextSize,
    () => 'default',
  );

  const setTextSize = (next: TextSize) => {
    document.documentElement.setAttribute('data-text-size', next);
    try {
      localStorage.setItem(TEXT_SIZE_STORAGE_KEY, next);
    } catch {
      // Storage may be unavailable (Safari private mode, etc.).
    }
  };

  return {
    textSize,
    setTextSize,
    toggleTextSize: () => setTextSize(textSize === 'default' ? 'larger' : 'default'),
  };
}
