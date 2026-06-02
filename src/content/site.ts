import type { SiteConfig } from '@/types/content';

const siteEmail = process.env.NEXT_PUBLIC_SITE_EMAIL ?? 'neeraj.aideveloper@gmail.com';

export const site: SiteConfig = {
  name: 'Neeraj',
  shortName: 'Neeraj',
  tagline: 'Full-stack AI engineer. Production systems that ship, not demos.',
  description:
    'Full-stack AI engineer. I build production voice agents, agentic backends, and the full-stack systems behind them. Sub-second latency, GDPR-grade isolation, and the engineering to back it up. Available for hire, mentorship, and speaking. Remote or hybrid worldwide.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  email: siteEmail,
  location: 'Delhi, India · Remote / hybrid worldwide',
  availability: 'Open to full-time, fractional, and contract · remote or hybrid worldwide',
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
