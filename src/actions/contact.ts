'use server';

import { contactFormSchema, type ContactFormValues } from '@/lib/intents';
import { site } from '@/content/site';

export type ContactActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Partial<Record<keyof ContactFormValues, string>> };

/**
 * Server Action for the contact form. Re-validates with the same Zod
 * schema the client uses, then dispatches the message via Resend if
 * RESEND_API_KEY is configured. Otherwise logs the submission server-side
 * and returns success — useful for previews and for the period before
 * Neeraj wires up Resend.
 */
export async function submitContactAction(input: unknown): Promise<ContactActionResult> {
  const parsed = contactFormSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof ContactFormValues, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === 'string' && !fieldErrors[key as keyof ContactFormValues]) {
        fieldErrors[key as keyof ContactFormValues] = issue.message;
      }
    }
    return { ok: false, error: 'Please check the highlighted fields.', fieldErrors };
  }

  const data = parsed.data;

  // Honeypot — silently succeed for bots so they don't retry.
  if (data.website && data.website.length > 0) {
    return { ok: true };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.RESEND_FROM;
  const toAddress = process.env.RESEND_TO ?? site.email;

  if (!apiKey || !fromAddress) {
    // Resend not configured yet — log so the developer can verify the form
    // wiring works end-to-end without secrets. Step 12 (integrations) wires
    // Resend properly; until then this branch keeps the UX functional.
    console.info('[contact] Resend not configured — form submission logged:', {
      intent: data.intent,
      name: data.name,
      email: data.email,
      message: `${data.message.slice(0, 80)}${data.message.length > 80 ? '…' : ''}`,
    });
    return { ok: true };
  }

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);
    const subject = `[${data.intent.toUpperCase()}] ${data.name} via ${site.shortName}`;
    const result = await resend.emails.send({
      from: fromAddress,
      to: toAddress,
      replyTo: data.email,
      subject,
      text: formatPlainText(data),
    });
    if (result.error) {
      console.error('[contact] Resend error:', result.error);
      return { ok: false, error: 'Could not send your message. Please try the email link below.' };
    }
    return { ok: true };
  } catch (err) {
    console.error('[contact] unexpected error:', err);
    return { ok: false, error: 'Something went wrong. Please try the email link below.' };
  }
}

function formatPlainText(data: ContactFormValues): string {
  const lines: string[] = [
    `Intent: ${data.intent}`,
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    '',
  ];

  if (data.intent === 'hire') {
    if (data.company) lines.push(`Company: ${data.company}`);
    if (data.projectType) lines.push(`Project type: ${data.projectType}`);
    if (data.timeline) lines.push(`Timeline: ${data.timeline}`);
    if (data.budgetRange) lines.push(`Budget: ${data.budgetRange}`);
  } else if (data.intent === 'mentorship') {
    if (data.helpWith) lines.push(`What they want help with: ${data.helpWith}`);
    if (data.level) lines.push(`Level: ${data.level}`);
    if (data.preferredFormat) lines.push(`Preferred format: ${data.preferredFormat}`);
  } else if (data.intent === 'speaking') {
    if (data.eventName) lines.push(`Event: ${data.eventName}`);
    if (data.organizer) lines.push(`Organizer: ${data.organizer}`);
    if (data.eventDate) lines.push(`Date: ${data.eventDate}`);
    if (data.eventFormat) lines.push(`Format: ${data.eventFormat}`);
    if (data.eventLocation) lines.push(`Location: ${data.eventLocation}`);
    if (data.audienceSize) lines.push(`Audience size: ${data.audienceSize}`);
    if (data.topic) lines.push(`Topic: ${data.topic}`);
  }

  lines.push('', 'Message:', data.message);
  return lines.join('\n');
}
