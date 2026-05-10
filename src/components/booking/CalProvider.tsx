'use client';

import { getCalApi } from '@calcom/embed-react';
import { useEffect } from 'react';
import { useTheme } from '@/lib/theme';

export function CalProvider() {
  const { theme } = useTheme();

  useEffect(() => {
    void (async () => {
      const cal = await getCalApi();
      cal('ui', {
        theme,
        hideEventTypeDetails: false,
        cssVarsPerTheme: {
          light: { 'cal-brand': '#6366F1' },
          dark: { 'cal-brand': '#6366F1' },
        },
      });
    })();
  }, [theme]);

  return null;
}
