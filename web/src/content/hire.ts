import type { HireEngagementType } from '@/types/content';

export const hireSection = {
  eyebrow: 'For founders & companies',
  heading: 'Production systems that ship to enterprise, not demos.',
  sub: 'Full-stack engineer for product work, voice AI, and agentic backends. Sub-second stage latency, GDPR-grade tenant isolation, and the engineering to back it all up.',
  primaryCtaLabel: 'Book a 30-min call',
  primaryCtaSubline: "Free, no commitment. We'll figure out scope and fit on the call.",
  quickContact: {
    title: 'Just want the basics?',
    body: 'Skip the calendar. Email me, grab the resume, or reach me on LinkedIn.',
  },
  engagementsHeading: 'How I work with teams',
};

export const hireEngagementTypes: HireEngagementType[] = [
  {
    id: 'project',
    title: 'Voice AI from spec to production',
    description:
      'Take a voice agent from whiteboard to enterprise-ready. LiveKit, Azure AI Foundry, Node.js, FastAPI, Next.js. Sub-second stage latency, tenant isolation, eval harness, observability, handoff docs. Delivered, not demoed.',
  },
  {
    id: 'fractional',
    title: 'Fractional AI engineering lead',
    description:
      'Embedded with your founding team. Architecture calls, code review, hands-on work on the critical path, and team mentoring. For startups that need a senior voice or AI engineer without the full-time hire yet.',
  },
  {
    id: 'discovery',
    title: 'Honest discovery call',
    description:
      "Not sure what you need? Book the call. I'll give you a straight read on what should be built, what shouldn't, and whether I'm the right person to build it.",
  },
];

export const hireTrustLine =
  'Just shipped an enterprise voice AI platform: ~1.2s median full-turn latency, ~10 tenants verified isolated under load, GDPR-grade and security-reviewed. Available now for new work.';
