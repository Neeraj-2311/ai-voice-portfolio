import type { ExperienceRole } from '@/types/content';

/**
 * Three roles per spec 6.4. Bullet points are placeholders pending
 * resume content from Neeraj — current bullets summarise widely-known
 * scope from the spec but should be replaced with concrete impact
 * statements before launch.
 */
export const experience: ExperienceRole[] = [
  {
    id: 'intellifyai',
    anchor: 'exp-intellifyai',
    company: 'IntellifyAI',
    title: 'Full Stack Engineer',
    start: 'Sep 2025',
    end: 'Present',
    location: 'London, UK',
    bullets: [
      'Build production voice AI agents with LiveKit and Azure AI Foundry, targeting sub-second response latency for enterprise voice workflows.',
      'Own the agent orchestration layer: turn detection, barge-in handling, tool calling, and post-call analytics.',
      'Ship full-stack features across the customer dashboard (Next.js) and the agent runtime (FastAPI / Python).',
      '[TODO: Neeraj] Concrete impact bullet — e.g. metric, named project, or scale.',
    ],
    tech: ['LiveKit', 'Azure AI Foundry', 'TypeScript', 'Python', 'FastAPI', 'Next.js'],
    keyAchievement: '[TODO: Neeraj] Headline achievement at IntellifyAI',
  },
  {
    id: 'mindcraft',
    anchor: 'exp-mindcraft',
    company: 'Mindcraft Labs',
    title: 'Fullstack AI Developer',
    start: 'Feb 2025',
    end: 'Sep 2025',
    location: 'Gurgaon, India',
    bullets: [
      'Built agentic AI products on top of LLM toolchains, including RAG pipelines and prompt-orchestration layers.',
      'Shipped full-stack features (Next.js, Node.js, MongoDB) with an emphasis on developer ergonomics.',
      '[TODO: Neeraj] Specific product, feature, or outcome bullet.',
      '[TODO: Neeraj] Tech-leadership or architecture bullet.',
    ],
    tech: ['Next.js', 'Node.js', 'MongoDB', 'LLMs', 'RAG'],
    keyAchievement: '[TODO: Neeraj] Headline achievement at Mindcraft Labs',
  },
  {
    id: 'menrva',
    anchor: 'exp-menrva',
    company: 'Menrva Technologies',
    title: 'Front-end Developer Intern',
    start: 'Oct 2023',
    end: 'Jan 2025',
    location: 'Bangalore, India',
    bullets: [
      'Built and maintained customer-facing web applications using React, TypeScript, and modern CSS.',
      'Owned UI feature delivery from Figma to production, including responsive design and accessibility.',
      '[TODO: Neeraj] Specific shipped feature or measurable improvement.',
    ],
    tech: ['React', 'TypeScript', 'CSS', 'Firebase'],
    keyAchievement: '[TODO: Neeraj] Headline achievement at Menrva',
  },
];
