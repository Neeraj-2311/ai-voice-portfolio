import type { SpeakingEvent, SpeakingTopic } from '@/types/content';

/**
 * Speaking section opener. Mirrors mentorshipSection shape so the UI can
 * pull eyebrow / heading / sub / whyMeLine / whatIBring without a new type.
 * Inlined as a const without explicit typing to avoid adding to the
 * content type surface.
 */
export const speakingSection = {
  eyebrow: 'For event organisers',
  heading: 'Talks from an engineer who actually ships voice AI.',
  sub: 'Hackathons, bootcamps, college lectures, industry panels. London-based, happy to travel or join remotely.',
  whyMeLine:
    "Most AI talks are slides about demos. Mine come from a production voice platform: ~1.2s median full-turn latency, multi-tenant isolation under load, GDPR-grade. Audiences leave with what the textbooks miss.",
  whatIBring: [
    'War stories from shipping enterprise voice agents, not recycled tutorials.',
    'Concrete numbers: latency budgets, eval harnesses, tenant isolation tradeoffs.',
    'A working engineer who can answer the hard questions in the Q&A.',
  ],
  /**
   * Stage banner photo. Landscape format, taken from the stage with the
   * audience in view. Drop the file at /public/images/speaking/stage-banner.jpg
   * and the banner renders automatically. Set to null to hide.
   */
  banner: {
    src: '/images/speaking/stage-banner.jpg',
    alt: 'Neeraj on stage facing an audience during a speaking session',
    caption: 'On stage with the audience in view.',
  } as { src: string; alt: string; caption?: string } | null,
  /**
   * Image gallery used as a backdrop collage behind the speaking-page CTA.
   * Drop more files at /public/images/speaking/ and append entries here.
   * With one image, it renders as a full-bleed hero. With 2+, it auto-grids.
   */
  gallery: [
    {
      src: '/images/speaking/img1.png',
      alt: 'Speaking session moment',
      format: 'in-person',
    },
    {
      src: '/images/speaking/img2.png',
      alt: 'Speaking session moment',
      format: 'in-person',
    },
    {
      src: '/images/speaking/img3.png',
      alt: 'Speaking session moment',
      format: 'in-person',
    },
    {
      src: '/images/speaking/img4.jpg',
      alt: 'Speaking session moment',
      format: 'in-person',
    },
  ] as Array<{ src: string; alt: string; caption?: string; format?: 'in-person' | 'virtual' }>,
};

/**
 * Speaking section content per spec 6.9. Topics are badge labels;
 * the rest of the section content (formats accepted, audience descriptions)
 * lives directly in the Speaking section component.
 */
export const speakingTopics: SpeakingTopic[] = [
  { id: 'voice-ai', label: 'Voice AI in production: latency, isolation, the parts demos skip' },
  { id: 'agents', label: 'Agentic systems and the eval problem nobody wants to solve' },
  { id: 'fullstack-ai', label: 'Full-stack AI: shipping LLM products end to end' },
  { id: 'careers', label: 'Breaking into AI as a developer without faking it' },
  { id: 'rag', label: 'RAG architecture in practice, beyond the toy demo' },
  { id: 'open-source-voice', label: 'Open-source voice infrastructure with LiveKit' },
];

export const speakingFormats: { id: string; label: string }[] = [
  { id: 'hackathons', label: 'Hackathons (mentor / judge)' },
  { id: 'bootcamps', label: 'Bootcamp workshops' },
  { id: 'colleges', label: 'College talks & guest lectures' },
  { id: 'panels', label: 'Industry panels' },
  { id: 'workshops', label: 'AI workshops' },
];

/** Past events grid. Placeholders until Neeraj provides the real list. */
export const pastEvents: SpeakingEvent[] = [
  {
    id: 'placeholder-1',
    name: '[TODO: Neeraj] Past event 1',
    organizer: '[TODO: Organizer]',
    date: '[TODO: Date]',
    format: 'in-person',
  },
  {
    id: 'placeholder-2',
    name: '[TODO: Neeraj] Past event 2',
    organizer: '[TODO: Organizer]',
    date: '[TODO: Date]',
    format: 'virtual',
  },
];
