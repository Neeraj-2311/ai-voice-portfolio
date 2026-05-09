import type { SpeakingEvent, SpeakingTopic } from '@/types/content';

/**
 * Speaking section content per spec 6.9. Topics are badge labels;
 * the rest of the section content (formats accepted, audience descriptions)
 * lives directly in the Speaking section component.
 */
export const speakingTopics: SpeakingTopic[] = [
  { id: 'voice-ai', label: 'Voice AI' },
  { id: 'agents', label: 'Agentic systems' },
  { id: 'fullstack-ai', label: 'Full-stack AI' },
  { id: 'careers', label: 'AI careers' },
  { id: 'rag', label: 'RAG architecture' },
  { id: 'open-source-voice', label: 'Open-source voice infra' },
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
