import type { MetadataRoute } from 'next';
import { caseStudies } from '@/content/case-studies';
import { site } from '@/content/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
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
      lastModified: now,
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    })),
    ...caseStudies
      .filter((s) => s.status !== 'draft')
      .map((s) => ({
        url: `${base}/case-studies/${s.slug}`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      })),
  ];
}
