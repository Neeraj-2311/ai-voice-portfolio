import type { HireEngagement } from '@/types/content';

/**
 * Three engagement models per spec 6.10. CTA hrefs point at Cal.com event
 * slugs (resolved through site.cal.events) or the Contact Modal.
 */
export const hireEngagements: HireEngagement[] = [
  {
    id: 'discovery',
    title: 'Discovery call',
    summary: 'Free 30-minute call to scope your project and align on fit.',
    description:
      'For founders and teams figuring out whether voice AI, an agent, or a full-stack build is the right next step. We talk through your problem, constraints, and budget. You leave with a clear recommendation, engaging me or not.',
    bullets: [
      'Free, 30 minutes, video call',
      'Scoped problem statement and approach options',
      'Honest read on what should and should not be built',
    ],
    cta: {
      label: 'Book a discovery call',
      href: '#hire',
      voiceAction: 'open-hire-discovery',
    },
  },
  {
    id: 'project',
    title: 'Project-based work',
    summary:
      'Voice AI builds, agent development, and full-stack AI products delivered end-to-end.',
    description:
      'Fixed-scope engagements for production AI work: voice agents with telephony, agentic backends, full-stack web apps with AI features. Includes architecture, implementation, evals, and a clean handoff with documentation.',
    bullets: [
      'Voice agents with LiveKit / Azure AI Foundry',
      'Agentic backends with FastAPI / Next.js',
      'Eval harness, observability, and handoff docs included',
    ],
    cta: {
      label: 'Discuss your project',
      href: '#contact',
      voiceAction: 'open-contact-modal',
    },
  },
  {
    id: 'fractional',
    title: 'Fractional / advisory',
    summary: 'For early-stage AI startups that need senior AI engineering on tap.',
    description:
      'Fractional engagement for AI-first startups: architecture review, senior code review, hiring help, and hands-on contribution to the riskiest parts of the stack. Suited for pre-seed and seed teams.',
    bullets: [
      'Weekly cadence with the founding team',
      'Architecture, code review, and hiring support',
      'Hands-on contributions on critical paths',
    ],
    cta: {
      label: 'Start a conversation',
      href: '#contact',
      voiceAction: 'open-contact-modal',
    },
  },
];

/**
 * Trust line for the hire section header. Spec calls this out explicitly:
 * "Built enterprise platforms with GDPR compliance and security hardening".
 */
export const hireTrustLine =
  'Built enterprise platforms with GDPR compliance and security hardening.';
