import { z } from 'zod';
import type { Intent } from '@/types/content';

export const intentMeta: Record<Intent, { label: string; description: string }> = {
  hire: { label: 'Hire', description: 'For founders and companies hiring' },
  mentorship: { label: 'Mentorship', description: 'For 1:1 sessions and guidance' },
  speaking: {
    label: 'Speaking',
    description: 'For event organizers (talks, hackathons, judging)',
  },
  other: { label: 'Other', description: 'Anything else' },
};

export const intents = Object.keys(intentMeta) as Intent[];

/** Reject header-injection characters in any field that ends up in an email
 *  header or subject line. Resend escapes headers itself, but defense-in-depth
 *  keeps malformed input from reaching that layer at all. */
const noHeaderChars = /^[^\r\n]*$/;

export const contactFormSchema = z.object({
  intent: z.enum(['hire', 'mentorship', 'speaking', 'other']),
  name: z
    .string()
    .trim()
    .min(2, 'Please enter your name')
    .max(100, 'Please keep your name under 100 characters')
    .regex(noHeaderChars, 'Name contains invalid characters'),
  email: z
    .email('Please enter a valid email')
    .max(254, 'Email is too long')
    .regex(noHeaderChars, 'Email contains invalid characters'),
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
