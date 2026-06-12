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
      { name: 'TypeScript', note: 'Frontend and backend daily' },
      { name: 'JavaScript', note: 'Plain JS when needed' },
      { name: 'Python', note: 'AI, RAG, automation' },
      { name: 'SQL', note: 'Schemas, queries, indexing' },
      { name: 'C / C++', note: 'Systems and low-level work' },
      { name: 'HTML', note: 'Semantic markup, accessibility' },
      { name: 'CSS', note: 'Layout, theming, responsiveness' },
    ],
  },
  {
    id: 'ai-ml',
    title: 'AI / ML',
    skills: [
      { name: 'LLMs', note: 'Prompting, eval, tool use' },
      { name: 'RAG', note: 'Hybrid retrieval, reranking' },
      { name: 'Agentic AI', note: 'Multi-step orchestration' },
      { name: 'Function Calling', note: 'Structured tool use' },
      { name: 'Voice Orchestration', note: 'STT, LLM, TTS, turn-taking' },
      { name: 'LiveKit', note: 'Realtime voice infra' },
      { name: 'Azure AI Foundry', note: 'Enterprise model platform' },
      { name: 'Deepgram', note: 'Realtime STT' },
      { name: 'Cartesia', note: 'Realtime TTS, voice cloning' },
      { name: 'ElevenLabs', note: 'Voice agents, TTS' },
      { name: 'Retell AI', note: 'Voice agents' },
      { name: 'Embeddings', note: 'Semantic search, retrieval' },
      { name: 'Prompt Engineering', note: 'Agent flows, conversation flow' },
    ],
  },
  {
    id: 'frameworks',
    title: 'Frameworks',
    skills: [
      { name: 'Next.js', note: 'App Router, server actions' },
      { name: 'Node.js', note: 'Backend runtime, APIs' },
      { name: 'Express', note: 'API layer, middleware' },
      { name: 'React', note: 'Frontend UI' },
      { name: 'FastAPI', note: 'Python API framework' },
      { name: 'Tailwind CSS', note: 'Utility-first styling' },
      { name: 'Framer Motion', note: 'Animations, transitions, gestures' },
    ],
  },
  {
    id: 'cloud-infra',
    title: 'Cloud / Infra',
    skills: [
      { name: 'Azure', note: 'Multi-tenant deploys' },
      { name: 'AWS', note: 'Self-hosted services' },
      { name: 'Vercel', note: 'Edge deploys, ISR' },
      { name: 'LiveKit Cloud', note: 'Voice agent deploys' },
      { name: 'Docker', note: 'Containerized deploys' },
      { name: 'GitHub Actions', note: 'CI/CD pipelines' },
      { name: 'Linux', note: 'Server admin, shell scripts' },
    ],
  },
  {
    id: 'data',
    title: 'Data',
    skills: [
      { name: 'PostgreSQL', note: 'Relational store' },
      { name: 'pgvector', note: 'Vector store for RAG' },
      { name: 'MongoDB', note: 'Document store' },
      { name: 'Convex DB', note: 'Reactive backend DB' },
      { name: 'Firebase', note: 'Auth, Firestore, Storage' },
    ],
  },
];
