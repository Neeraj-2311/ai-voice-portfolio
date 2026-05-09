import type { CaseStudy } from '@/types/content';

/**
 * Case study metadata. Long-form bodies live in MDX at
 * src/content/case-studies/<slug>.mdx and are loaded by the dynamic route.
 *
 * Status field gates UI:
 *   - "published"   -> renders normally
 *   - "draft"       -> hidden from public listing, accessible by direct URL
 *   - "placeholder" -> shown with a "case study coming soon" treatment
 */
export const caseStudies: CaseStudy[] = [
  {
    slug: 'enterprise-voice-ai',
    title: 'Enterprise voice AI at IntellifyAI',
    summary:
      'Real-time voice agents handling enterprise customer workflows with sub-second latency and full observability.',
    cover: '/images/case-studies/enterprise-voice-ai.svg',
    coverAlt: 'Enterprise voice AI case study cover',
    heroMetric: { value: '< 1s', label: 'response latency' },
    tech: ['LiveKit', 'Azure AI Foundry', 'TypeScript', 'Python'],
    status: 'placeholder',
    publishedAt: '[TODO: Neeraj]',
  },
  {
    slug: 'goreach',
    title: 'GoReach',
    summary:
      'Full-stack product that turns research and outreach into a single agent-driven workflow.',
    cover: '/images/case-studies/goreach.svg',
    coverAlt: 'GoReach case study cover',
    heroMetric: { value: '[TODO]', label: 'metric to highlight' },
    tech: ['Next.js', 'Node.js', 'MongoDB', 'LLMs'],
    status: 'placeholder',
    publishedAt: '[TODO: Neeraj]',
  },
  {
    slug: 'third-project',
    title: '[TODO: Neeraj] Third case study',
    summary:
      'Third case study placeholder — Neeraj will replace this with a real project once chosen.',
    cover: '/images/case-studies/third-project.svg',
    coverAlt: 'Third case study cover placeholder',
    heroMetric: { value: '[TODO]', label: '[TODO]' },
    tech: ['[TODO]'],
    status: 'placeholder',
  },
];
