import type { HireEngagementType } from '@/types/content';

export const hireSection = {
  eyebrow: 'For founders & companies',
  heading: "Building voice AI, agents, or AI products? Let's talk.",
  sub: "I work with teams that ship. Book a call and we'll figure out fit.",
  primaryCtaLabel: 'Book a 30-min call',
  primaryCtaSubline: "Free, no commitment. We'll figure out scope and fit on the call.",
  quickContact: {
    title: 'Just want the basics?',
    body: 'Skip the calendar. Email me, grab the resume, or reach me on LinkedIn.',
  },
  engagementsHeading: 'What we can talk about',
};

export const hireEngagementTypes: HireEngagementType[] = [
  {
    id: 'project',
    title: 'Project work',
    description:
      'Voice AI builds with LiveKit / Azure AI Foundry. Agentic backends with FastAPI / Next.js. End-to-end delivery with eval harness, observability, and handoff docs.',
  },
  {
    id: 'fractional',
    title: 'Fractional / advisory',
    description:
      'For early-stage AI startups that need senior AI engineering on tap. Weekly cadence with the founding team, architecture and code review, hands-on work on critical paths.',
  },
  {
    id: 'discovery',
    title: 'Discovery first',
    description:
      "Not sure what you need? Book the call anyway. I'll give you an honest read on what should and shouldn't be built.",
  },
];

export const hireTrustLine =
  'Just shipped an enterprise voice AI platform with GDPR compliance and security hardening. Available from 7 May 2026.';
