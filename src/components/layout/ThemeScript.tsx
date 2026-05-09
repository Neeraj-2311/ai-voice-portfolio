import { themeInitScript } from '@/lib/theme';

/**
 * Renders the theme-init script inline in <head> so it runs before paint.
 * Server Component — emits the script tag exactly once per request.
 */
export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />;
}
