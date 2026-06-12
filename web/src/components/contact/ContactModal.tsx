'use client';

import { X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CLOSE_CONTACT_MODAL_EVENT,
  OPEN_CONTACT_MODAL_EVENT,
  type OpenContactModalDetail,
} from '@/lib/contact-modal-event';
import type { ContactFormValues } from '@/lib/intents';
import type { Intent } from '@/types/content';
import { ContactForm } from './ContactForm';

export function ContactModal() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [intent, setIntent] = useState<Intent>('hire');
  const [prefill, setPrefill] = useState<Partial<Record<keyof ContactFormValues, string>>>({});
  const [openCount, setOpenCount] = useState(0);

  const close = useCallback(() => {
    const dialog = dialogRef.current;
    if (dialog?.open) dialog.close();
  }, []);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<OpenContactModalDetail>).detail ?? {};
      setIntent(detail.intent ?? 'hire');
      setPrefill(detail.prefill ?? {});
      setOpenCount((n) => n + 1);
      const dialog = dialogRef.current;
      if (!dialog) return;
      if (!dialog.open) dialog.showModal();
    };
    window.addEventListener(OPEN_CONTACT_MODAL_EVENT, handler);
    window.addEventListener(CLOSE_CONTACT_MODAL_EVENT, close);
    return () => {
      window.removeEventListener(OPEN_CONTACT_MODAL_EVENT, handler);
      window.removeEventListener(CLOSE_CONTACT_MODAL_EVENT, close);
    };
  }, [close]);

  // Backdrop click only. Ignore bubbled clicks from descendants. A click
  // on a child sets target = child; a click on the ::backdrop sets target
  // = the dialog itself.
  const onDialogClick: React.MouseEventHandler<HTMLDialogElement> = (event) => {
    if (event.target !== event.currentTarget) return;
    close();
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={onDialogClick}
      aria-labelledby="contact-modal-title"
      className="bg-elevated text-fg border-line fixed inset-0 m-auto h-fit w-[calc(100%-2rem)] max-w-2xl rounded-2xl border p-0 shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
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
          className="btn-icon text-muted hover:text-fg hover:bg-fg/10 inline-flex items-center justify-center rounded-lg transition-colors"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <div className="max-h-[75vh] overflow-y-auto px-6 py-6">
        <ContactForm
          key={openCount}
          initialIntent={intent}
          prefill={prefill}
          variant="compact"
          onSuccess={() => {
            window.setTimeout(close, 6000);
          }}
          onBookCall={close}
        />
      </div>
    </dialog>
  );
}
