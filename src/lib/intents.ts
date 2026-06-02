import { z } from 'zod';
import type { Intent } from '@/types/content';

/**
 * Contact form schema. The form is intentionally simple: name, email,
 * intent tag, and message. Hire and mentorship engagements have their own
 * booking CTAs elsewhere on the site, so the form acts as a general
 * inbox rather than an intake form per intent.
 */

export const intentMeta: Record<Intent, { label: string; description: string }> = {
  hire: { label: 'Hire', description: 'For founders and companies hiring' },
  mentorship: { label: 'Mentorship', description: 'For 1:1 sessions and guidance' },
  speaking: {
    label: 'Speaking · event',
    description: 'For event organizers (talks, hackathons, judging)',
  },
  other: { label: 'Other', description: 'Anything else' },
};

export const intents: Intent[] = ['hire', 'mentorship', 'speaking', 'other'];

export const contactFormSchema = z.object({
  intent: z.enum(['hire', 'mentorship', 'speaking', 'other']),
  name: z.string().trim().min(2, 'Please enter your name').max(100),
  email: z.string().trim().email('Please enter a valid email'),
  message: z
    .string()
    .trim()
    .min(10, 'Please share at least a short message')
    .max(2000, 'Please keep this under 2000 characters'),
  /** Honeypot. Must remain empty. */
  website: z.string().max(0).optional(),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export const contactDefaultValues: ContactFormValues = {
  intent: 'hire',
  name: '',
  email: '',
  message: '',
  website: '',
};
