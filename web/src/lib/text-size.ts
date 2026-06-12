'use client';

import { useSyncExternalStore } from 'react';
import { TEXT_SIZE_STORAGE_KEY } from './storage-keys';

export type TextSize = 'default' | 'larger';

export { TEXT_SIZE_STORAGE_KEY };

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
      // Storage may be unavailable. Cookie below is the authoritative store.
    }
    document.cookie = `${TEXT_SIZE_STORAGE_KEY}=${next}; path=/; max-age=31536000; samesite=lax`;
  };

  return {
    textSize,
    setTextSize,
    toggleTextSize: () => setTextSize(textSize === 'default' ? 'larger' : 'default'),
  };
}
