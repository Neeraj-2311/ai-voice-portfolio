import type { CaseStudy } from '@/types/content';

export const caseStudies: CaseStudy[] = [
  {
    slug: 'talk-to-my-portfolio',
    title: 'Talk to my portfolio',
    summary:
      'A voice agent that drives this site over RPC: ask it to open a case study, book a call, or download the resume, and watch the page respond.',
    cover: '/images/case-studies/talk-to-my-portfolio.svg',
    coverAlt: 'Talk to my portfolio case study cover',
    heroMetric: { value: 'Live', label: 'on this site' },
    tech: ['LiveKit', 'Python', 'Next.js', 'RPC', 'Voice AI'],
    status: 'published',
  },
  {
    slug: 'enterprise-voice-ai',
    title: 'Enterprise voice AI platform',
    summary:
      'Shipped a multi-tenant voice agent platform to enterprise production, with 1.2s median full-turn latency and GDPR-grade isolation across tenants.',
    cover: '/images/case-studies/enterprise-voice-ai.svg',
    coverAlt: 'Enterprise voice AI case study cover',
    heroMetric: { value: '1.2s', label: 'median full-turn latency' },
    tech: ['TypeScript', 'Node.js', 'Express', 'Next.js', 'LiveKit', 'Azure AI Foundry', 'Python'],
    status: 'published',
  },
  {
    slug: 'goreach',
    title: 'GoReach',
    summary:
      'A LinkedIn outreach product that writes in the user\'s own voice via per-user RAG. Live since April 2026 with 102 beta users and a 2.3x quality gap between voice-setup-complete and skipped.',
    cover: '/images/case-studies/goreach.svg',
    coverAlt: 'GoReach case study cover',
    heroMetric: { value: '2.3x', label: 'lift with voice setup' },
    tech: ['TypeScript', 'Next.js', 'Node.js', 'Python', 'FastAPI', 'RAG', 'AWS'],
    status: 'published',
  },
  {
    slug: 'sheets-voice-automation',
    title: 'Sheets-to-call automation pipeline',
    summary:
      'A Google Sheet automation that turns rows into parallel voice calls and writes structured outcomes back. Built at Mindcraft Labs to absorb a support team\'s manual dialling work without making them leave their workbook.',
    cover: '/images/case-studies/sheets-voice-automation.svg',
    coverAlt: 'Sheets-to-call automation case study cover',
    heroMetric: { value: '1 support role', label: 'absorbed into automation' },
    tech: ['Python', 'Google Sheets API', 'Webhooks', 'ElevenLabs', 'Workflow Automation'],
    status: 'published',
  },
];
