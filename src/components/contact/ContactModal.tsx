'use client';

import { X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  OPEN_CONTACT_MODAL_EVENT,
  type OpenContactModalDetail,
} from '@/lib/contact-modal-event';
import type { ContactFormValues } from '@/lib/intents';
import type { Intent } from '@/types/content';
import { ContactForm } from './ContactForm';

/**
 * Contact Modal. Mounted once in the root layout. Subscribes to the
 * `open-contact-modal` custom event so any CTA in the tree (nav button,
 * section CTAs, voice dock fallback) can open it without prop drilling.
 *
 * Built on the native <dialog> element with showModal() — gives us focus
 * trap, top-layer rendering, and Escape-to-close for free. Backdrop click
 * is handled manually because the platform doesn't fire close on backdrop.
 */
export function ContactModal() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [intent, setIntent] = useState<Intent>('hire');
  const [prefill, setPrefill] = useState<Partial<Record<keyof ContactFormValues, string>>>({});

  const close = useCallback(() => {
    const dialog = dialogRef.current;
    if (dialog?.open) dialog.close();
  }, []);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<OpenContactModalDetail>).detail ?? {};
      if (detail.intent) setIntent(detail.intent);
      setPrefill(detail.prefill ?? {});
      const dialog = dialogRef.current;
      if (!dialog) return;
      if (!dialog.open) dialog.showModal();
    };
    window.addEventListener(OPEN_CONTACT_MODAL_EVENT, handler);
    return () => window.removeEventListener(OPEN_CONTACT_MODAL_EVENT, handler);
  }, []);

  // Backdrop click: native <dialog> fires click on the dialog itself when
  // the click hits the backdrop — pointer coords fall outside its bounding
  // box. This is the canonical detection pattern.
  const onDialogClick: React.MouseEventHandler<HTMLDialogElement> = (event) => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const rect = dialog.getBoundingClientRect();
    const inside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;
    if (!inside) close();
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={onDialogClick}
      aria-labelledby="contact-modal-title"
      className="bg-elevated text-fg border-line w-full max-w-2xl rounded-2xl border p-0 shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      <div className="border-line flex items-start justify-between gap-3 border-b px-6 py-5">
        <div>
          <h2 id="contact-modal-title" className="text-h3 text-fg font-medium">
            Get in touch
          </h2>
          <p className="text-muted text-small">Pick the option that fits and I&apos;ll reply soon.</p>
        </div>
        <button
          type="button"
          onClick={close}
          aria-label="Close contact form"
          className="btn-icon border-line text-fg hover:border-line-strong hover:text-accent inline-flex items-center justify-center rounded-lg border transition-colors"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      <div className="max-h-[75vh] overflow-y-auto px-6 py-6">
        <ContactForm
          initialIntent={intent}
          prefill={prefill}
          variant="compact"
          onSuccess={() => {
            // Auto-close after a moment so the success state is visible.
            window.setTimeout(close, 1800);
          }}
        />
      </div>
    </dialog>
  );
}
