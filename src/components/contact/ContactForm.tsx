'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Calendar, CheckCircle2, Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import { useId, useState, useTransition } from 'react';
import { type FieldError, type Path, useForm, useWatch } from 'react-hook-form';
import { submitContactAction } from '@/actions/contact';
import { GithubIcon, LinkedinIcon } from '@/components/primitives/BrandIcon';
import { Button } from '@/components/primitives/Button';
import { site } from '@/content/site';
import { contactDefaultValues, contactFormSchema, type ContactFormValues } from '@/lib/intents';
import type { Intent } from '@/types/content';
import { IntentPicker } from './IntentPicker';

export interface ContactFormProps {
  /** Initial intent (e.g. when CTA is "Invite me to your event"). */
  initialIntent?: Intent;
  /** Optional pre-fill of any string field. */
  prefill?: Partial<Record<keyof ContactFormValues, string>>;
  /** Density variant — modal uses compact, inline section uses default. */
  variant?: 'default' | 'compact';
  /** Called after a successful submission so the modal can close. */
  onSuccess?: () => void;
}

export function ContactForm({
  initialIntent = 'hire',
  prefill,
  variant = 'default',
  onSuccess,
}: ContactFormProps) {
  const [isPending, startTransition] = useTransition();
  const [submitStatus, setSubmitStatus] = useState<
    { type: 'idle' } | { type: 'error'; message: string } | { type: 'success' }
  >({ type: 'idle' });

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    setError,
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

  // useWatch subscribes via context — safer for React 19 concurrent features
  // than calling form.watch() during render (the latter triggers the
  // react-hooks/incompatible-library warning).
  const intent = useWatch({ control, name: 'intent' });

  const onSubmit = handleSubmit((data) => {
    setSubmitStatus({ type: 'idle' });
    startTransition(async () => {
      const result = await submitContactAction(data);
      if (result.ok) {
        setSubmitStatus({ type: 'success' });
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
        setSubmitStatus({ type: 'error', message: result.error });
      }
    });
  });

  if (submitStatus.type === 'success') {
    return (
      <div className="text-fg flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle2 className="text-success h-10 w-10" aria-hidden="true" />
        <h3 className="text-h3 font-medium">Thanks — your message is on the way</h3>
        <p className="text-muted">I&apos;ll reply from {site.email} within a few days.</p>
        <Button
          variant="ghost"
          onClick={() => setSubmitStatus({ type: 'idle' })}
          className="mt-2"
        >
          Send another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5" aria-busy={isPending}>
      <IntentPicker
        value={intent}
        onChange={(next) => setValue('intent', next, { shouldValidate: false })}
        compact={variant === 'compact'}
      />

      {/* Honeypot — visually hidden, never tab-stop. */}
      <div aria-hidden="true" className="sr-only">
        <label>
          Leave this field empty
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...register('website')}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" error={errors.name} required>
          <input
            type="text"
            autoComplete="name"
            {...register('name')}
            className={inputClass(!!errors.name)}
          />
        </Field>
        <Field label="Email" error={errors.email} required>
          <input
            type="email"
            autoComplete="email"
            inputMode="email"
            {...register('email')}
            className={inputClass(!!errors.email)}
          />
        </Field>
      </div>

      {intent === 'hire' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company" error={errors.company} required>
            <input
              type="text"
              autoComplete="organization"
              {...register('company')}
              className={inputClass(!!errors.company)}
            />
          </Field>
          <Field label="Project type" error={errors.projectType} required>
            <input
              type="text"
              placeholder="Voice agent / AI build / Full-stack"
              {...register('projectType')}
              className={inputClass(!!errors.projectType)}
            />
          </Field>
          <Field label="Timeline" error={errors.timeline}>
            <input
              type="text"
              placeholder="ASAP / 1–2 months / Q2"
              {...register('timeline')}
              className={inputClass(!!errors.timeline)}
            />
          </Field>
          <Field label="Budget range" error={errors.budgetRange}>
            <input
              type="text"
              placeholder="Optional"
              {...register('budgetRange')}
              className={inputClass(!!errors.budgetRange)}
            />
          </Field>
        </div>
      )}

      {intent === 'mentorship' && (
        <div className="grid gap-4">
          <Field label="What you want help with" error={errors.helpWith} required>
            <textarea
              rows={3}
              {...register('helpWith')}
              className={inputClass(!!errors.helpWith)}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Your level" error={errors.level}>
              <input
                type="text"
                placeholder="Student / 1 yr / 3+ yrs"
                {...register('level')}
                className={inputClass(!!errors.level)}
              />
            </Field>
            <Field label="Preferred format" error={errors.preferredFormat}>
              <input
                type="text"
                placeholder="30 min / 60 min / Text follow-up"
                {...register('preferredFormat')}
                className={inputClass(!!errors.preferredFormat)}
              />
            </Field>
          </div>
        </div>
      )}

      {intent === 'speaking' && (
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Event name" error={errors.eventName} required>
              <input
                type="text"
                {...register('eventName')}
                className={inputClass(!!errors.eventName)}
              />
            </Field>
            <Field label="Organizing institution" error={errors.organizer} required>
              <input
                type="text"
                {...register('organizer')}
                className={inputClass(!!errors.organizer)}
              />
            </Field>
            <Field label="Event date" error={errors.eventDate} required>
              <input
                type="text"
                placeholder="DD MMM YYYY"
                {...register('eventDate')}
                className={inputClass(!!errors.eventDate)}
              />
            </Field>
            <Field label="Format" error={errors.eventFormat} required>
              <select
                {...register('eventFormat')}
                className={inputClass(!!errors.eventFormat)}
                defaultValue=""
              >
                <option value="" disabled>
                  Select…
                </option>
                <option value="virtual">Virtual</option>
                <option value="in-person">In person</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </Field>
            <Field label="Location" error={errors.eventLocation}>
              <input
                type="text"
                placeholder="City, country (or 'Online')"
                {...register('eventLocation')}
                className={inputClass(!!errors.eventLocation)}
              />
            </Field>
            <Field label="Expected audience size" error={errors.audienceSize}>
              <input
                type="text"
                placeholder="50 / 100 / 500+"
                {...register('audienceSize')}
                className={inputClass(!!errors.audienceSize)}
              />
            </Field>
          </div>
          <Field label="Topic of interest" error={errors.topic}>
            <input
              type="text"
              placeholder="Voice AI / RAG / AI careers"
              {...register('topic')}
              className={inputClass(!!errors.topic)}
            />
          </Field>
        </div>
      )}

      <Field
        label={
          intent === 'speaking' ? 'More about the event' : 'Message'
        }
        error={errors.message}
        required
      >
        <textarea
          rows={variant === 'compact' ? 4 : 5}
          {...register('message')}
          className={inputClass(!!errors.message)}
        />
      </Field>

      {submitStatus.type === 'error' && (
        <p
          role="alert"
          className="text-error border-error/50 bg-error/10 flex items-start gap-2 rounded-md border px-3 py-2 text-small"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {submitStatus.message}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button type="submit" variant="primary" disabled={isPending} aria-disabled={isPending}>
          {isPending ? 'Sending…' : 'Send message'}
        </Button>
        <p className="text-subtle text-small">
          I usually reply within a few days. For something urgent, email me directly.
        </p>
      </div>

      <DirectAlternatives />
    </form>
  );
}

function DirectAlternatives() {
  const linkedin = site.socials.find((s) => s.icon === 'Linkedin');
  const github = site.socials.find((s) => s.icon === 'Github');

  return (
    <div className="border-line mt-2 border-t pt-5">
      <p className="text-subtle text-small">Or contact directly</p>
      <ul className="mt-3 flex flex-wrap items-center gap-2">
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
              rel="noreferrer"
              className="border-line text-fg hover:border-line-strong hover:text-accent inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-small transition-colors"
            >
              <LinkedinIcon className="h-4 w-4" aria-hidden="true" />
              LinkedIn
            </Link>
          </li>
        )}
        {github && (
          <li>
            <Link
              href={github.href}
              target="_blank"
              rel="noreferrer"
              className="border-line text-fg hover:border-line-strong hover:text-accent inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-small transition-colors"
            >
              <GithubIcon className="h-4 w-4" aria-hidden="true" />
              GitHub
            </Link>
          </li>
        )}
        {site.phone && (
          <li className="md:hidden">
            <Link
              href={`tel:${site.phone}`}
              className="border-line text-fg hover:border-line-strong hover:text-accent inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-small transition-colors"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              Call
            </Link>
          </li>
        )}
        <li>
          <Link
            href="#hire"
            className="border-line text-fg hover:border-line-strong hover:text-accent inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-small transition-colors"
          >
            <Calendar className="h-4 w-4" aria-hidden="true" />
            Book a call
          </Link>
        </li>
      </ul>
    </div>
  );
}

/* -------------------------------------------------------------------------
   Helpers
   ----------------------------------------------------------------------- */

function inputClass(hasError: boolean) {
  return [
    'input-base bg-bg text-fg placeholder:text-subtle border w-full rounded-md transition-colors',
    'focus-visible:border-accent',
    hasError
      ? 'border-error focus-visible:border-error border-[1.5px]'
      : 'border-line hover:border-line-strong',
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

  // Inject id + aria-describedby + aria-invalid + aria-required onto the
  // single child input/textarea/select. Saves ~3 lines per field.
  const enhanced = {
    ...child,
    props: {
      ...child.props,
      id,
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

