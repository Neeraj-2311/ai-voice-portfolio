'use server';

import { contactFormSchema, type ContactFormValues } from '@/lib/intents';
import { site } from '@/content/site';

export type ContactActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Partial<Record<keyof ContactFormValues, string>> };

const INTENT_LABEL: Record<ContactFormValues['intent'], string> = {
  hire: 'Hire enquiry',
  mentorship: 'Mentorship request',
  speaking: 'Speaking enquiry',
  other: 'General message',
};

/**
 * Server Action for the contact form. Re-validates with the same Zod schema
 * the client uses, then dispatches a formatted HTML email via Resend.
 *
 * Required env vars:
 *   RESEND_API_KEY: API key from resend.com
 *   RESEND_FROM:    Verified sender (e.g. "Neeraj's site <hello@hineeraj.com>")
 * Optional:
 *   RESEND_TO:      Override recipient. Defaults to site.email.
 *
 * The email's reply-to is set to the sender's email so hitting Reply lands
 * straight in their inbox.
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

  // Honeypot: silently succeed for bots so they don't retry.
  if (data.website && data.website.length > 0) {
    return { ok: true };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.RESEND_FROM;
  const toAddress = process.env.RESEND_TO ?? site.email;

  const submittedAt = new Date();
  const meta = { submittedAt, siteUrl: site.url };

  if (!apiKey || !fromAddress) {
    console.info('[contact] Resend not configured. Form submission logged:', {
      intent: data.intent,
      name: data.name,
      email: data.email,
      message: `${data.message.slice(0, 80)}${data.message.length > 80 ? '…' : ''}`,
      submittedAt: submittedAt.toISOString(),
    });
    return { ok: true };
  }

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);
    const intentLabel = INTENT_LABEL[data.intent];
    const subject = `[${data.intent.toUpperCase()}] ${data.name} via ${formatHost(site.url)}`;
    const result = await resend.emails.send({
      from: fromAddress,
      to: toAddress,
      replyTo: data.email,
      subject,
      text: formatPlainText(data, meta, intentLabel),
      html: formatHtml(data, meta, intentLabel),
    });
    if (result.error) {
      console.error('[contact] Resend error:', result.error);
      return {
        ok: false,
        error: 'Could not send your message. Please try the email link below.',
      };
    }
    return { ok: true };
  } catch (err) {
    console.error('[contact] unexpected error:', err);
    return { ok: false, error: 'Something went wrong. Please try the email link below.' };
  }
}

interface EmailMeta {
  submittedAt: Date;
  siteUrl: string;
}

function formatHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

function formatDateTime(d: Date): string {
  // Friendly IST format since the operator is in Delhi. Falls back to UTC if Intl is missing.
  try {
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'long',
      timeStyle: 'short',
      timeZone: 'Asia/Kolkata',
    }).format(d) + ' IST';
  } catch {
    return d.toISOString();
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatPlainText(
  data: ContactFormValues,
  meta: EmailMeta,
  intentLabel: string,
): string {
  return [
    `${intentLabel} from ${data.name}`,
    '',
    `Name:    ${data.name}`,
    `Email:   ${data.email}`,
    `Intent:  ${data.intent}`,
    '',
    'Message:',
    data.message,
    '',
    '---',
    `Sent:    ${formatDateTime(meta.submittedAt)}`,
    `Source:  ${meta.siteUrl}`,
    '',
    'Reply directly to this email and the sender will receive your response.',
  ].join('\n');
}

function formatHtml(
  data: ContactFormValues,
  meta: EmailMeta,
  intentLabel: string,
): string {
  const name = escapeHtml(data.name);
  const email = escapeHtml(data.email);
  const intent = escapeHtml(data.intent);
  const message = escapeHtml(data.message).replace(/\n/g, '<br>');
  const sentAt = escapeHtml(formatDateTime(meta.submittedAt));
  const siteUrl = escapeHtml(meta.siteUrl);
  const siteHost = escapeHtml(formatHost(meta.siteUrl));
  const intentLabelSafe = escapeHtml(intentLabel);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${intentLabelSafe} from ${name}</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1a1a1a;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <div style="background:#ffffff;border:1px solid #e5e5e7;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.05);">

      <div style="padding:28px;background:linear-gradient(135deg,#8B5CF6 0%,#7c3aed 100%);">
        <p style="margin:0;color:rgba(255,255,255,0.85);font-size:12px;font-weight:600;letter-spacing:0.6px;text-transform:uppercase;">${intentLabelSafe}</p>
        <h1 style="margin:10px 0 0;color:#ffffff;font-size:24px;font-weight:600;line-height:1.3;">${name} reached out</h1>
      </div>

      <div style="padding:24px 28px 8px;">
        <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:10px 0;color:#71717a;font-size:13px;width:80px;vertical-align:top;">Name</td>
            <td style="padding:10px 0;color:#1a1a1a;font-size:14px;font-weight:500;">${name}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#71717a;font-size:13px;vertical-align:top;border-top:1px solid #f0f0f3;">Email</td>
            <td style="padding:10px 0;color:#1a1a1a;font-size:14px;font-weight:500;border-top:1px solid #f0f0f3;"><a href="mailto:${email}" style="color:#8B5CF6;text-decoration:none;">${email}</a></td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#71717a;font-size:13px;vertical-align:top;border-top:1px solid #f0f0f3;">Intent</td>
            <td style="padding:10px 0;color:#1a1a1a;font-size:14px;font-weight:500;border-top:1px solid #f0f0f3;text-transform:capitalize;">${intent}</td>
          </tr>
        </table>
      </div>

      <div style="padding:8px 28px 28px;">
        <p style="margin:0 0 10px;color:#71717a;font-size:11px;letter-spacing:0.6px;text-transform:uppercase;font-weight:600;">Message</p>
        <div style="padding:18px 20px;background:#faf9fc;border-radius:12px;border-left:3px solid #8B5CF6;color:#1a1a1a;font-size:15px;line-height:1.65;">${message}</div>
      </div>

      <div style="padding:18px 28px 22px;border-top:1px solid #f0f0f3;background:#fafafb;">
        <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:4px 0;color:#71717a;font-size:12px;width:80px;">Sent</td>
            <td style="padding:4px 0;color:#1a1a1a;font-size:12px;font-weight:500;">${sentAt}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#71717a;font-size:12px;">Source</td>
            <td style="padding:4px 0;color:#1a1a1a;font-size:12px;font-weight:500;"><a href="${siteUrl}" style="color:#8B5CF6;text-decoration:none;">${siteHost}</a></td>
          </tr>
        </table>
        <p style="margin:14px 0 0;color:#a1a1aa;font-size:11px;line-height:1.6;">
          Reply directly to this email and ${name} will receive your response at <a href="mailto:${email}" style="color:#a1a1aa;text-decoration:underline;">${email}</a>.
        </p>
      </div>

    </div>
  </div>
</body>
</html>`;
}
