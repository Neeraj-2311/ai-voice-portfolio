import { z } from 'zod';
import type { Intent } from '@/types/content';

/**
 * Single source of truth for the contact form's intent-routed shape.
 * Both the inline #contact section and the Contact Modal consume this
 * schema so the field set / validation can never drift.
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

/**
 * Schema is a flat shape with optional fields, then a superRefine that
 * enforces required fields per selected intent. Flat keeps RHF + register()
 * ergonomic; the refine layer covers the dynamic-required rules.
 */
export const contactFormSchema = z
  .object({
    intent: z.enum(['hire', 'mentorship', 'speaking', 'other']),
    name: z.string().trim().min(2, 'Please enter your name').max(100),
    email: z.string().trim().email('Please enter a valid email'),

    // shared
    message: z
      .string()
      .trim()
      .min(10, 'Please share at least a short message')
      .max(2000, 'Please keep this under 2000 characters'),

    // hire
    company: z.string().trim().max(120).optional(),
    projectType: z.string().trim().max(120).optional(),
    timeline: z.string().trim().max(80).optional(),
    budgetRange: z.string().trim().max(80).optional(),

    // mentorship
    helpWith: z.string().trim().max(400).optional(),
    level: z.string().trim().max(60).optional(),
    preferredFormat: z.string().trim().max(60).optional(),

    // speaking
    eventName: z.string().trim().max(160).optional(),
    organizer: z.string().trim().max(160).optional(),
    eventDate: z.string().trim().max(80).optional(),
    eventFormat: z.enum(['virtual', 'in-person', 'hybrid']).optional(),
    eventLocation: z.string().trim().max(160).optional(),
    audienceSize: z.string().trim().max(60).optional(),
    topic: z.string().trim().max(200).optional(),

    // anti-spam
    website: z.string().max(0).optional(), // honeypot — must be empty
  })
  .superRefine((data, ctx) => {
    const required = (field: keyof typeof data, label: string) => {
      const value = data[field];
      if (typeof value !== 'string' || value.trim().length === 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: [field], message: `${label} is required` });
      }
    };

    if (data.intent === 'hire') {
      required('company', 'Company');
      required('projectType', 'Project type');
    }
    if (data.intent === 'mentorship') {
      required('helpWith', 'What you want help with');
    }
    if (data.intent === 'speaking') {
      required('eventName', 'Event name');
      required('organizer', 'Organizing institution');
      required('eventDate', 'Event date');
      if (!data.eventFormat) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['eventFormat'],
          message: 'Format is required',
        });
      }
    }
  });

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export const contactDefaultValues: ContactFormValues = {
  intent: 'hire',
  name: '',
  email: '',
  message: '',
  company: '',
  projectType: '',
  timeline: '',
  budgetRange: '',
  helpWith: '',
  level: '',
  preferredFormat: '',
  eventName: '',
  organizer: '',
  eventDate: '',
  eventFormat: undefined,
  eventLocation: '',
  audienceSize: '',
  topic: '',
  website: '',
};
