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
      'Built an outreach agent that writes LinkedIn posts in the user\'s own voice, now serving 102+ users with continuous LLM eval feedback loops.',
    cover: '/images/case-studies/goreach.svg',
    coverAlt: 'GoReach case study cover',
    heroMetric: { value: '300+ posts', label: 'generated to date' },
    tech: ['TypeScript', 'Next.js', 'Node.js', 'Python', 'RAG', 'AWS'],
    status: 'placeholder',
  },
  {
    slug: 'sheets-voice-automation',
    title: 'Sheets-to-call automation pipeline',
    summary:
      'Wired a Google Sheet to a telephony voice agent: a Python worker dials each row, hands the call off, captures structured fields, and writes results back.',
    cover: '/images/case-studies/sheets-voice-automation.svg',
    coverAlt: 'Sheets-to-call automation case study cover',
    heroMetric: { value: '100+ calls', label: 'per bulk campaign' },
    tech: ['Google Sheets API', 'Voice AI', 'Telephony', 'Python', 'Workflow Automation'],
    status: 'placeholder',
  },
];
