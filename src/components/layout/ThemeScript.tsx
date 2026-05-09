import { themeInitScript } from '@/lib/theme';
import { textSizeInitScript } from '@/lib/text-size';

/**
 * Renders the inline pre-hydration script that resolves both the theme
 * (light/dark) and text-size (default/larger) preferences from localStorage
 * before React hydrates. Server Component, emits one <script> tag per
 * request, no round trip.
 */
export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `${themeInitScript}\n${textSizeInitScript}`,
      }}
    />
  );
}
