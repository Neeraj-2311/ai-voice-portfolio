import type { CaseStudy } from '@/types/content';

export const caseStudies: CaseStudy[] = [
  {
    slug: 'enterprise-voice-ai',
    title: 'Enterprise voice AI platform',
    summary:
      'Real-time multi-tenant voice agent platform handling enterprise customer workflows with sub-second latency, full observability, and GDPR-grade isolation.',
    cover: '/images/case-studies/enterprise-voice-ai.svg',
    coverAlt: 'Enterprise voice AI case study cover',
    heroMetric: { value: '< 1s', label: 'response latency' },
    tech: ['LiveKit', 'Azure AI Foundry', 'TypeScript', 'Python', 'FastAPI'],
    status: 'published',
  },
  {
    slug: 'goreach',
    title: 'GoReach',
    summary:
      'AI platform that turns research and outreach into a single agent-driven workflow. Generates LinkedIn content tailored to your voice from your own writing samples.',
    cover: '/images/case-studies/goreach.svg',
    coverAlt: 'GoReach case study cover',
    heroMetric: { value: '[TODO]', label: 'metric to highlight' },
    tech: ['Next.js', 'FastAPI', 'LLMs', 'RAG', 'AWS', 'GitHub Actions'],
    status: 'placeholder',
  },
  {
    slug: 'sheets-voice-automation',
    title: 'Sheets-to-call automation pipeline',
    summary:
      'Google Sheets-driven automation that auto-dials a list of contacts, hands the call to a voice agent, captures structured outcomes, and writes results back to the sheet.',
    cover: '/images/case-studies/sheets-voice-automation.svg',
    coverAlt: 'Sheets-to-call automation case study cover',
    heroMetric: { value: '[TODO]', label: 'metric to highlight' },
    tech: ['Google Sheets API', 'Voice AI', 'Telephony', 'Python', 'Workflow Automation'],
    status: 'placeholder',
  },
];
