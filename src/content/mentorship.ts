import type { MentorshipTopic, Testimonial } from '@/types/content';

export const mentorshipSection = {
  eyebrow: 'For students & devs',
  heading: 'Want a second pair of eyes on your AI work?',
  sub: 'Free 30-minute calls. Bring a real problem and we will dig in.',
  whyMeLine:
    "I ship voice agents enterprises pay for. That means I can tell you which parts of the AI stack actually matter in production, and which tutorials are wasting your weekends.",
  topicsHeading: 'What we can dig into',
  primaryCtaLabel: 'Book a 30-min call',
  secondaryLine:
    'Not paid. Just a call. If you want deeper ongoing work after, we can talk about it on the call.',
};

export const mentorshipTopics: MentorshipTopic[] = [
  {
    id: 'roadmap',
    label: 'AI career roadmap: what to build, what to skip, what hiring managers actually look for.',
  },
  {
    id: 'voice-architecture',
    label: 'Voice agent architecture: latency budgets, eval harnesses, observability, multi-tenant scale.',
  },
  {
    id: 'portfolio',
    label: 'Portfolio and resume teardown: concrete edits, line by line.',
  },
  {
    id: 'open',
    label: "Whatever you're stuck on. Bring the actual problem.",
  },
];

/**
 * Social proof for the mentorship section. Placeholders until Neeraj
 * collects real testimonials. The UI hides the row entirely if the
 * array is empty after filtering placeholders.
 */
export const mentorshipTestimonials: Testimonial[] = [
  {
    id: 'placeholder-1',
    quote: '[TODO: Neeraj] Real testimonial from a past mentee.',
    author: '[TODO: Name]',
    role: '[TODO: Role / Company]',
    source: 'mentorship',
  },
  {
    id: 'placeholder-2',
    quote: '[TODO: Neeraj] Second testimonial.',
    author: '[TODO: Name]',
    role: '[TODO: Role / Company]',
    source: 'mentorship',
  },
];

/** Past hackathon / bootcamp / college credibility list. Placeholder. */
export const mentorshipCredibility: { id: string; name: string; type: string }[] = [
  { id: 'placeholder-1', name: '[TODO: Neeraj]', type: 'Hackathon mentor' },
  { id: 'placeholder-2', name: '[TODO: Neeraj]', type: 'Bootcamp speaker' },
  { id: 'placeholder-3', name: '[TODO: Neeraj]', type: 'College talk' },
];
