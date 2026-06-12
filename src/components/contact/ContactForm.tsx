'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Calendar, CheckCircle2, Loader2, Mail, Send } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useId, useState, useTransition } from 'react';
import { type FieldError, type Path, useForm, useWatch, Controller } from 'react-hook-form';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { submitContactAction } from '@/actions/contact';
import {
  PREFILL_CONTACT_MODAL_EVENT,
  type PrefillContactModalDetail,
} from '@/lib/contact-modal-event';
import { LinkedinIcon, XIcon } from '@/components/primitives/BrandIcon';
import { Button } from '@/components/primitives/Button';
import { site } from '@/content/site';
import { contactDefaultValues, contactFormSchema, type ContactFormValues } from '@/lib/intents';
import { useTheme } from '@/lib/theme';
import type { Intent } from '@/types/content';
import { IntentPicker } from './IntentPicker';

export interface ContactFormProps {
  initialIntent?: Intent;
  prefill?: Partial<Record<keyof ContactFormValues, string>>;
  variant?: 'default' | 'compact';
  onSuccess?: () => void;
  /** Called when the user clicks the "Book a call" pill. The modal uses this
   *  to close itself so the Cal popup can take over the screen. Called after
   *  a short delay so Cal.com captures the click first. */
  onBookCall?: () => void;
}

type Phase = 'idle' | 'launching' | 'success';

export function ContactForm({
  initialIntent = 'hire',
  prefill,
  variant = 'default',
  onSuccess,
  onBookCall,
}: ContactFormProps) {
  const [isPending, startTransition] = useTransition();
  const [phase, setPhase] = useState<Phase>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    setValue,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      ...contactDefaultValues,
      ...(prefill as Partial<ContactFormValues>),
      intent: initialIntent,
    },
    mode: 'onBlur',
  });

  const watchedIntent = useWatch({ control, name: 'intent' });
  const intent: Intent = watchedIntent ?? initialIntent ?? 'hire';

  // Live fill from the voice agent: as it collects the message it patches the
  // open form field by field, so the visitor watches it populate in real time.
  useEffect(() => {
    const onPrefill = (event: Event) => {
      const detail = (event as CustomEvent<PrefillContactModalDetail>).detail ?? {};
      const apply = (field: Path<ContactFormValues>, value?: string) => {
        if (typeof value === 'string' && value.length > 0) {
          setValue(field, value, { shouldDirty: true, shouldValidate: false });
        }
      };
      apply('name', detail.name);
      apply('email', detail.email);
      apply('message', detail.message);
      if (detail.intent) apply('intent', detail.intent);
    };
    window.addEventListener(PREFILL_CONTACT_MODAL_EVENT, onPrefill);
    return () => window.removeEventListener(PREFILL_CONTACT_MODAL_EVENT, onPrefill);
  }, [setValue]);

  const onSubmit = handleSubmit((data) => {
    setErrorMessage(null);
    setPhase('launching');
    const payload = { ...data, intent: data.intent ?? 'hire' };
    startTransition(async () => {
      const [result] = await Promise.all([
        submitContactAction(payload),
        // Floor the perceived latency so the loading state is visible even
        // when Resend responds in <100ms; prevents UI flash.
        new Promise((resolve) => setTimeout(resolve, 1600)),
      ]);
      if (result.ok) {
        setPhase('success');
        reset({ ...contactDefaultValues, intent });
        onSuccess?.();
      } else {
        if (result.fieldErrors) {
          for (const [field, message] of Object.entries(result.fieldErrors)) {
            if (message) {
              setError(field as Path<ContactFormValues>, { type: 'server', message });
            }
          }
        }
        setErrorMessage(result.error);
        setPhase('idle');
      }
    });
  });

  return (
    <div className="relative">
      <AnimatePresence mode="wait" initial={false}>
        {phase === 'success' ? (
          <motion.div
            key="success"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.96 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-fg flex flex-col items-center gap-3 py-10 text-center"
          >
            <motion.div
              initial={prefersReducedMotion ? false : { scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { delay: 0.05, type: 'spring', stiffness: 220, damping: 16 }
              }
            >
              <CheckCircle2 className="text-success h-12 w-12" aria-hidden="true" />
            </motion.div>
            <h3 className="text-h3 font-medium">Message sent. Thanks.</h3>
            <p className="text-muted max-w-md text-pretty">
              I&apos;ll reply from {site.email} within a few days.
            </p>
            <Button
              variant="ghost"
              onClick={() => setPhase('idle')}
              className="mt-2 px-3 py-1.5 text-small"
            >
              Send another
            </Button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={onSubmit}
            className="space-y-5"
            aria-busy={isPending}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <fieldset disabled={isPending} className="space-y-5">
              <Controller
                name="intent"
                control={control}
                render={({ field }) => (
                  <IntentPicker
                    value={field.value}
                    onChange={field.onChange}
                    compact={variant === 'compact'}
                  />
                )}
              />

              <input
                type="hidden"
                {...register('website')}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Your name" error={errors.name} required>
                  <input
                    type="text"
                    autoComplete="name"
                    placeholder="Andrej Karpathy"
                    {...register('name')}
                    className={inputClass(!!errors.name)}
                  />
                </Field>
                <Field label="Email" error={errors.email} required>
                  <input
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="andrej@gpu-poor.dev"
                    {...register('email')}
                    className={inputClass(!!errors.email)}
                  />
                </Field>
              </div>

              <Field label="Message" error={errors.message} required>
                <textarea
                  rows={variant === 'compact' ? 4 : 6}
                  placeholder={messagePlaceholder(intent)}
                  {...register('message')}
                  className={inputClass(!!errors.message)}
                />
              </Field>


              {errorMessage && (
                <p
                  role="alert"
                  className="text-error border-error/50 bg-error/10 flex items-start gap-2 rounded-md border px-3 py-2 text-small"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  {errorMessage}
                </p>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isPending}
                  aria-disabled={isPending}
                  leadingIcon={
                    isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Send className="h-4 w-4" aria-hidden="true" />
                    )
                  }
                  className="shrink-0 whitespace-nowrap px-4 py-2 text-small font-medium"
                >
                  {isPending ? 'Sending…' : 'Send message'}
                </Button>
                <p className="text-subtle text-small text-pretty sm:text-right">
                  Usually a reply within a few days. For urgent, email me.
                </p>
              </div>
            </fieldset>

            <DirectAlternatives onBookCall={onBookCall} />
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function DirectAlternatives({ onBookCall }: { onBookCall?: () => void }) {
  const linkedin = site.socials.find((s) => s.icon === 'Linkedin');
  const twitter = site.socials.find((s) => s.icon === 'Twitter');

  return (
    <div className="border-line mt-2 border-t pt-5">
      <p className="text-subtle text-small">Or contact directly</p>
      <ul className="mt-3 flex flex-wrap items-center gap-2">
        <li>
          <BookCallPill onBookCall={onBookCall} />
        </li>
        <li>
          <Link
            href={`mailto:${site.email}`}
            className="border-line text-fg hover:border-line-strong hover:text-accent inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-small transition-colors"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            {site.email}
          </Link>
        </li>
        {linkedin && (
          <li>
            <Link
              href={linkedin.href}
              target="_blank"
              rel="noopener noreferrer me"
              className="border-line text-fg hover:border-line-strong hover:text-accent inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-small transition-colors"
            >
              <LinkedinIcon className="h-4 w-4" aria-hidden="true" />
              LinkedIn
            </Link>
          </li>
        )}
        {twitter && (
          <li>
            <Link
              href={twitter.href}
              target="_blank"
              rel="noopener noreferrer me"
              aria-label="X (Twitter)"
              className="border-line text-fg hover:border-line-strong hover:text-accent inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-small transition-colors"
            >
              <XIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
}

function BookCallPill({ onBookCall }: { onBookCall?: () => void }) {
  const { theme } = useTheme();
  const username = process.env.NEXT_PUBLIC_CAL_USERNAME ?? 'hineeraj';
  return (
    <button
      type="button"
      data-cal-link={`${username}/hire`}
      data-cal-config={JSON.stringify({ theme })}
      data-voice-action="open-hire-discovery"
      onClick={() => {
        if (!onBookCall) return;
        // Defer to a macrotask so Cal.com's global click listener registers
        // first and opens the popup before we close the parent modal.
        window.setTimeout(onBookCall, 0);
      }}
      className="border-accent/40 bg-accent/10 text-accent hover:border-accent hover:bg-accent/15 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-small font-medium transition-colors"
    >
      <Calendar className="h-4 w-4" aria-hidden="true" />
      Book a 30-min call
    </button>
  );
}

function messagePlaceholder(intent: Intent): string {
  switch (intent) {
    case 'hire':
      return "We're Series A. Customers call 8 times a day asking when their order will ship. Help us build a voice agent that actually understands intent.";
    case 'mentorship':
      return "Two years into a frontend role at a fintech. Want to pivot into voice AI by end of year. Where do I even start?";
    case 'speaking':
      return '45-min keynote, Q&A, 400 attendees. Travel and hotel covered, plus a respectable honorarium. Recording goes on YouTube.';
    case 'other':
      return "I'm building a thing. Wanted to say hi.";
  }
}

function inputClass(hasError: boolean) {
  return [
    'input-base bg-bg text-fg placeholder:text-subtle w-full rounded-md border transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2',
    hasError
      ? 'border-error focus-visible:ring-error/20 border-[1.5px]'
      : 'border-line hover:border-line-strong focus-visible:border-accent focus-visible:ring-accent/20',
  ].join(' ');
}

interface FieldProps {
  label: string;
  error?: FieldError;
  required?: boolean;
  children: React.ReactNode;
}

function Field({ label, error, required, children }: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const child = children as React.ReactElement<Record<string, unknown>>;

  const enhanced = {
    ...child,
    props: {
      ...child.props,
      id,
      required: required || undefined,
      'aria-invalid': error ? true : undefined,
      'aria-required': required || undefined,
      'aria-describedby': error ? errorId : undefined,
    },
  } as React.ReactElement;

  return (
    <div>
      <label htmlFor={id} className="text-fg text-small font-medium">
        {label}
        {required && (
          <span className="text-error ml-0.5" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <div className="mt-1.5">{enhanced}</div>
      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-error mt-1.5 flex items-start gap-1.5 text-small"
        >
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{error.message}</span>
        </p>
      )}
    </div>
  );
}
