import type { MetadataRoute } from 'next';
import { caseStudies } from '@/content/case-studies';
import { site } from '@/content/site';

// Stable per-route timestamps. Bump these when the page content meaningfully
// changes. Re-stamping `new Date()` on every build trains crawlers to ignore
// the lastmod signal entirely.
const STATIC_LAST_MODIFIED: Record<string, Date> = {
  '/': new Date('2026-06-02'),
  '/hire': new Date('2026-06-02'),
  '/mentorship': new Date('2026-05-15'),
  '/speaking': new Date('2026-06-02'),
  '/privacy': new Date('2026-05-09'),
};

const CASE_STUDIES_LAST_MODIFIED = new Date('2026-06-02');

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url.replace(/\/$/, '');

  const staticRoutes = [
    { path: '/', priority: 1, changeFrequency: 'weekly' as const },
    { path: '/hire', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/mentorship', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/speaking', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
  ];

  return [
    ...staticRoutes.map((r) => ({
      url: `${base}${r.path}`,
      lastModified: STATIC_LAST_MODIFIED[r.path] ?? CASE_STUDIES_LAST_MODIFIED,
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    })),
    ...caseStudies
      .filter((s) => s.status !== 'draft')
      .map((s) => ({
        url: `${base}/case-studies/${s.slug}`,
        lastModified: CASE_STUDIES_LAST_MODIFIED,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      })),
  ];
}
