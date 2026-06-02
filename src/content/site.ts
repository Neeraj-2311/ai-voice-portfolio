import type { SiteConfig } from '@/types/content';

const siteEmail = process.env.NEXT_PUBLIC_SITE_EMAIL ?? 'neeraj.aideveloper@gmail.com';

export const site: SiteConfig = {
  name: 'Neeraj',
  shortName: 'Neeraj',
  tagline: 'Voice agents that ship to enterprise, not just demos.',
  description:
    'Voice AI engineer in London. Production agents with sub-second latency, GDPR-grade tenant isolation, and the full-stack to back them up. Available for hire, mentorship, and speaking.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  email: siteEmail,
  location: 'London, UK',
  availability: 'Open to full-time, fractional, and contract',
  mostRecentLine: 'Shipped an enterprise voice AI platform at IntellifyAI, 1.2s median full-turn latency, multi-tenant on LiveKit and Azure AI Foundry.',
  current: {
    role: 'Full Stack Engineer (Contract)',
    company: 'IntellifyAI',
  },
  socials: [
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/neeraj-ai-guy/',
      icon: 'Linkedin',
    },
    {
      label: 'X',
      href: 'https://x.com/NeerajGoesAi',
      icon: 'Twitter',
    },
    { label: 'Email', href: `mailto:${siteEmail}`, icon: 'Mail' },
  ],
  cal: {
    username: process.env.NEXT_PUBLIC_CAL_USERNAME ?? "hineeraj",
  },
};
