import type { ServiceItem } from '@/types/content';

export const services: ServiceItem[] = [
  {
    id: 'services-voice',
    anchor: 'services',
    iconName: 'AudioLines',
    title: 'Voice AI engineering',
    summary:
      'Production voice agents at 1.2s full-turn latency. Real-time orchestration, telephony, barge-in, multi-tenant isolation, and observability, built for systems that actually answer the phone.',
    description:
      'I build production voice agents end-to-end: real-time STT/LLM/TTS pipelines, turn detection, barge-in, telephony integration, and observability. Stack centres on LiveKit and Azure AI Foundry, with custom orchestration for sub-second latency at scale.',
    tags: ['LiveKit', 'Azure AI Foundry', 'Realtime', 'Telephony'],
    cta: { label: 'Hire me for voice work', href: '/hire#voice' },
    featured: true,
    highlights: ['1.2s full-turn latency', 'GDPR-grade isolation', 'Multi-tenant under load'],
  },
  {
    id: 'services-agents',
    anchor: 'services',
    iconName: 'Workflow',
    title: 'AI agents & full-stack',
    summary:
      'Tool-using agents and RAG pipelines shipped as real products. Eval harnesses, hybrid retrieval, and the full-stack to ship them. TypeScript and Next.js up top, Node.js or Express on the API, Python for the AI/RAG layer.',
    description:
      'Agent design, tool-use orchestration, RAG pipelines with hybrid retrieval, evaluation harnesses, and the full-stack to ship them. TypeScript across frontend and Node.js/Express services, with Python pulled in for the AI, RAG, and automation layers.',
    tags: ['Agents', 'RAG', 'TypeScript', 'Next.js', 'Node.js', 'Express', 'Python'],
    cta: { label: 'Learn more', href: '/hire' },
  },
  {
    id: 'services-mentorship',
    anchor: 'services',
    iconName: 'GraduationCap',
    title: 'Mentorship & sessions',
    summary:
      '1:1 sessions for AI builders, hackathon mentoring, college talks, and workshops. Honest, focused, no generic advice.',
    description:
      'Career coaching for students breaking into AI, architecture reviews for engineers building voice agents, and event sessions for colleges, bootcamps, and hackathons.',
    tags: ['1:1 sessions', 'Hackathons', 'Workshops', 'Talks'],
    cta: { label: 'See sessions', href: '/mentorship' },
  },
];
