import type { SiteConfig } from '@/types/content';

const siteEmail = process.env.NEXT_PUBLIC_SITE_EMAIL ?? 'hello@example.com';

export const site: SiteConfig = {
  name: 'Neeraj',
  shortName: 'Neeraj',
  tagline: 'Voice AI & full-stack engineer building agentic systems for enterprise.',
  description:
    'Voice AI and full-stack engineer. I build production voice agents, agentic systems, and full-stack AI products. Available for hire, mentorship, and speaking.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  email: siteEmail,
  location: 'London, UK',
  availability: 'Open to full-time, fractional, and contract',
  mostRecentLine: 'Most recently shipped a production voice AI platform at IntellifyAI · London.',
  current: {
    role: 'Full Stack Engineer (Contract)',
    company: 'IntellifyAI',
  },
  socials: [
    { label: 'GitHub', href: 'https://github.com/Neeraj-2311', icon: 'Github' },
    {
      label: 'LinkedIn',
      href: 'https://linkedin.com/in/neeraj', // [TODO: Neeraj] update
      icon: 'Linkedin',
    },
    {
      label: 'X',
      href: 'https://x.com/neeraj', // [TODO: Neeraj] update
      icon: 'Twitter',
    },
    { label: 'Email', href: `mailto:${siteEmail}`, icon: 'Mail' },
  ],
  cal: {
    username: process.env.NEXT_PUBLIC_CAL_USERNAME ?? null,
  },
};
