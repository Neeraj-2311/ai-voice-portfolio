import type { MentorshipSession, Testimonial } from '@/types/content';

/**
 * Three concrete session offerings per spec 6.8. Pricing is `null`
 * until Neeraj sets it. UI shows a "Pricing on request" treatment.
 */
export const mentorshipSessions: MentorshipSession[] = [
  {
    id: 'roadmap',
    title: 'AI career roadmap',
    durationMinutes: 30,
    price: null, // [TODO: Neeraj] suggested ₹1,500 / $20
    audience: 'Students breaking into AI',
    summary:
      'Pick a clear next 6 to 12 months: what to build, what to learn, what to ignore. Tailored to your stage, not a generic checklist.',
    description:
      'A focused 30-minute session for students or early-career devs deciding how to break into AI. We walk through your background, your time budget, and the kinds of roles you want, then leave with a concrete roadmap of projects, learning resources, and skills to prioritise.',
    calEventSlug: '[TODO]-ai-career-roadmap',
  },
  {
    id: 'voice-architecture',
    title: 'Voice agent architecture review',
    durationMinutes: 60,
    price: null, // [TODO: Neeraj] suggested ₹6,000 / $75
    audience: 'Devs shipping voice agents',
    summary:
      'I review your voice-agent stack end to end: latency, turn-taking, observability, eval harness, and what to harden before scale. You leave with a written list of fixes ranked by impact.',
    description:
      'Bring an architecture diagram, a recording, or a live demo. We work through STT/LLM/TTS choices, turn detection, barge-in, telephony, observability, and evaluation. You leave with a prioritised punch-list for your next sprint.',
    calEventSlug: '[TODO]-voice-agent-review',
  },
  {
    id: 'portfolio',
    title: 'Portfolio & resume review',
    durationMinutes: 60,
    price: null, // [TODO: Neeraj] suggested ₹3,000 / $40
    audience: 'Early-career devs',
    summary:
      'Honest review of your portfolio site, GitHub, and resume, with concrete edits, not generic advice. We rewrite at least three things live.',
    description:
      'Send your portfolio URL, GitHub, and resume in advance. In the session we go line-by-line: what to keep, what to cut, what story to tell, and which projects to write up. Async follow-up notes after.',
    calEventSlug: '[TODO]-portfolio-review',
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
