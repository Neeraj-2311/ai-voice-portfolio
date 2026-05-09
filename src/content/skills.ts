import type { SkillGroup } from '@/types/content';

/**
 * Skill grid grouped by category. Spec section 6.7.
 * Notes are short hover-tooltips ("brief experience note") and are
 * surfaced in the TechBadge component.
 */
export const skillGroups: SkillGroup[] = [
  {
    id: 'languages',
    title: 'Languages',
    skills: [
      { name: 'Python', note: 'Primary backend / agent runtime' },
      { name: 'TypeScript', note: 'Primary frontend + Node services' },
      { name: 'JavaScript' },
      { name: 'C / C++', note: 'Systems coursework + low-level work' },
      { name: 'HTML' },
      { name: 'CSS' },
    ],
  },
  {
    id: 'ai-ml',
    title: 'AI / ML',
    skills: [
      { name: 'LLMs', note: 'Production prompting, eval, and tool use' },
      { name: 'RAG', note: 'Hybrid retrieval and reranking' },
      { name: 'Agentic AI', note: 'Multi-step tool calling and orchestration' },
      { name: 'LiveKit', note: 'Realtime voice infra' },
      { name: 'Azure AI Foundry', note: 'Enterprise model + deployment platform' },
      { name: 'Voice Orchestration', note: 'STT/LLM/TTS turn-taking' },
      { name: 'Prompt Engineering' },
    ],
  },
  {
    id: 'frameworks',
    title: 'Frameworks',
    skills: [
      { name: 'FastAPI', note: 'Primary Python web framework' },
      { name: 'Next.js', note: 'App Router, RSC, server actions' },
      { name: 'Node.js' },
      { name: 'Express' },
      { name: 'React' },
    ],
  },
  {
    id: 'cloud-infra',
    title: 'Cloud / Infra',
    skills: [
      { name: 'Azure' },
      { name: 'AWS' },
      { name: 'Docker' },
      { name: 'GitHub Actions' },
    ],
  },
  {
    id: 'data',
    title: 'Data',
    skills: [
      { name: 'PostgreSQL' },
      { name: 'MongoDB' },
      { name: 'Convex DB', note: 'Reactive backend / DB' },
      { name: 'Firebase' },
    ],
  },
];
