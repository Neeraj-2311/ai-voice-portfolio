import type { ExperienceRole } from '@/types/content';

export const experience: ExperienceRole[] = [
  {
    id: 'intellifyai',
    anchor: 'exp-intellifyai',
    company: 'IntellifyAI',
    title: 'Full Stack Engineer (Contract)',
    start: 'Sep 2025',
    end: 'May 2026',
    location: 'London, UK · Remote',
    bullets: [
      'Architected and led the backend of an enterprise voice AI platform from zero, defining system design with the founder around multi-tenancy, GDPR compliance, and security hardening.',
      'Built the voice agent runtime in Python on LiveKit, integrating Azure AI Foundry, RAG retrieval, CRM, and telephony into one orchestration layer with sub-second response latency.',
      'Designed the agentic decision and tool-use layer that lets a single agent route across customer workflows without losing context across turns.',
      'Engineered automated cloud deployment in Python via dynamic script generation, streamlining CI/CD across Azure environments for multiple enterprise tenants.',
      'Led a small team of senior engineers and shipped the platform to production for global enterprise clients before contract end.',
    ],
    tech: ['LiveKit', 'Azure AI Foundry', 'TypeScript', 'Python', 'FastAPI', 'Next.js', 'Docker'],
  },
  {
    id: 'mindcraft',
    anchor: 'exp-mindcraft',
    company: 'Mindcraft Labs',
    title: 'Fullstack AI Developer',
    start: 'Feb 2025',
    end: 'Sep 2025',
    location: 'Gurgaon, India · Remote',
    bullets: [
      'Built and shipped real-time conversational AI agents with multi-step workflows, contributing across the full product lifecycle from concept to live deployment.',
      'Developed backend automation integrating Google Workspace (Gmail, Sheets) for user onboarding, with secure third-party API handoffs.',
      'Owned full-stack feature delivery on Next.js, Node.js, and Firebase, from data model to UI to monitoring.',
      '[TODO: Neeraj] One bullet on a specific product or measurable outcome (e.g. "shipped X feature that increased Y by Z" or "built core flow used by N customers").',
    ],
    tech: ['Next.js', 'Node.js', 'TypeScript', 'Firebase', 'LLMs', 'RAG', 'APIs'],
  },
  {
    id: 'menrva',
    anchor: 'exp-menrva',
    company: 'Menrva Technologies',
    title: 'Front-end Developer Intern',
    start: 'Oct 2023',
    end: 'Jan 2025',
    location: 'Bangalore, India · Remote',
    bullets: [
      'Delivered agile React development for product interfaces, integrating AI services via APIs with full user-management flows.',
      'Owned UI feature delivery from Figma to production, including responsive layouts and accessibility.',
      'Collaborated directly with the founder and leadership on front-end strategy, contributing to project delivery and product decisions.',
      'Awarded Best Intern of the Quarter (Oct–Dec 2023).',
    ],
    tech: ['React', 'TypeScript', 'CSS', 'Firebase'],
  },
];
