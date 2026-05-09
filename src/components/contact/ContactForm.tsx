'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Calendar, CheckCircle2, Loader2, Mail, Phone } from 'lucide-react';
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
  initialIntent?: Intent;
  prefill?: Partial<Record<keyof ContactFormValues, string>>;
  variant?: 'default' | 'compact';
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
    getValues,
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

  const intent = useWatch({ control, name: 'intent' });

  const handleIntentChange = (next: Intent) => {
    const { name, email, message } = getValues();
    reset({ ...contactDefaultValues, intent: next, name, email, message });
  };

  const onSubmit = handleSubmit((data) => {
    setSubmitStatus({ type: 'idle' });
    startTransition(async () => {
      // Hold the spinner for ~1.5s so the loading state is perceivable
      // even when the action returns instantly (no Resend configured).
      const [result] = await Promise.all([
        submitContactAction(data),
        new Promise((resolve) => setTimeout(resolve, 1500)),
      ]);
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
        <h3 className="text-h3 font-medium">Thanks. Your message is on the way.</h3>
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
    <form onSubmit={onSubmit} className="space-y-5" aria-busy={isPending}>
      <fieldset disabled={isPending} className="space-y-5">
      <IntentPicker
        value={intent}
        onChange={handleIntentChange}
        compact={variant === 'compact'}
      />

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

      {intent === 'hire' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company" error={errors.company} required>
            <input
              type="text"
              autoComplete="organization"
              placeholder="Stealth AI startup (or OpenAI, if you're hiring)"
              {...register('company')}
              className={inputClass(!!errors.company)}
            />
          </Field>
          <Field label="Project type" error={errors.projectType} required>
            <input
              type="text"
              placeholder="Replace our IVR with a voice agent"
              {...register('projectType')}
              className={inputClass(!!errors.projectType)}
            />
          </Field>
          <Field label="Timeline" error={errors.timeline}>
            <input
              type="text"
              placeholder="Yesterday, ideally"
              {...register('timeline')}
              className={inputClass(!!errors.timeline)}
            />
          </Field>
          <Field label="Budget range" error={errors.budgetRange}>
            <input
              type="text"
              placeholder="$50k–$150k, or open if you ship"
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
              placeholder="Break into AI eng without a CS degree. Or: ship my first voice agent without crying."
              {...register('helpWith')}
              className={inputClass(!!errors.helpWith)}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Your level" error={errors.level}>
              <input
                type="text"
                placeholder="Self-taught, 2 yrs shipping LLM apps"
                {...register('level')}
                className={inputClass(!!errors.level)}
              />
            </Field>
            <Field label="Preferred format" error={errors.preferredFormat}>
              <input
                type="text"
                placeholder="60-min architecture deep dive"
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
                placeholder="AI Engineer Summit 2026"
                {...register('eventName')}
                className={inputClass(!!errors.eventName)}
              />
            </Field>
            <Field label="Organizing institution" error={errors.organizer} required>
              <input
                type="text"
                autoComplete="organization"
                placeholder="Y Combinator / IIT Delhi"
                {...register('organizer')}
                className={inputClass(!!errors.organizer)}
              />
            </Field>
            <Field label="Event date" error={errors.eventDate} required>
              <input
                type="date"
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
                placeholder="Mission Bay, SF (or Online)"
                {...register('eventLocation')}
                className={inputClass(!!errors.eventLocation)}
              />
            </Field>
            <Field label="Expected audience size" error={errors.audienceSize}>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Sold out, 400 builders"
                {...register('audienceSize')}
                className={inputClass(!!errors.audienceSize)}
              />
            </Field>
          </div>
          <Field label="Topic of interest" error={errors.topic}>
            <input
              type="text"
              placeholder="Why voice AI is going to eat phone calls"
              {...register('topic')}
              className={inputClass(!!errors.topic)}
            />
          </Field>
        </div>
      )}

      <Field
        label={intent === 'speaking' ? 'More about the event' : 'Message'}
        error={errors.message}
        required
      >
        <textarea
          rows={variant === 'compact' ? 4 : 5}
          placeholder={messagePlaceholder(intent)}
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
        <Button
          type="submit"
          variant="primary"
          disabled={isPending}
          aria-disabled={isPending}
          leadingIcon={
            isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : null
          }
        >
          {isPending ? 'Sending…' : 'Send message'}
        </Button>
        <p className="text-subtle text-small">
          I usually reply within a few days. For something urgent, email me directly.
        </p>
      </div>
      </fieldset>

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
    'input-base bg-bg text-fg placeholder:text-subtle w-full rounded-md border transition-colors',
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

