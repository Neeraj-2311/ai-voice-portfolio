/**
 * Programmatically open the Cal.com booking popup.
 *
 * The Cal embed registers a global click listener on any element carrying
 * `data-cal-link`. Rather than guess at the embed's imperative API, we create a
 * temporary trigger, dispatch a click so the embed opens its modal, then remove
 * it. This reuses exactly the path the visible "Book a call" buttons use.
 *
 * Used only as the booking fallback (the agent normally books server-side via
 * the Cal v2 API). Returns false if it could not even create the trigger, so the
 * caller can fall back further (e.g. open the contact form).
 */

type BookIntent = 'hire' | 'mentor';

export function openCalPopup(intent: BookIntent = 'hire', theme?: 'light' | 'dark'): boolean {
  if (typeof document === 'undefined') return false;
  const username = process.env.NEXT_PUBLIC_CAL_USERNAME ?? 'hineeraj';
  try {
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.setAttribute('data-cal-link', `${username}/${intent}`);
    if (theme) trigger.setAttribute('data-cal-config', JSON.stringify({ theme }));
    trigger.style.position = 'fixed';
    trigger.style.left = '-9999px';
    trigger.style.width = '1px';
    trigger.style.height = '1px';
    trigger.setAttribute('aria-hidden', 'true');
    document.body.appendChild(trigger);
    trigger.click();
    window.setTimeout(() => trigger.remove(), 0);
    return true;
  } catch {
    return false;
  }
}
