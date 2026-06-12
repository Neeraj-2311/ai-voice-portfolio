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

// Social proof for the mentorship section. Empty by design until real
// testimonials are collected. The UI hides the row entirely while empty.
export const mentorshipTestimonials: Testimonial[] = [];

// Past hackathon / bootcamp / college credibility list. Empty until populated;
// the section hides the line while empty.
export const mentorshipCredibility: { id: string; name: string; type: string }[] = [];
