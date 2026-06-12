import type { Metadata } from 'next';
import { Check, Sparkles } from 'lucide-react';
import { BookCallButton } from '@/components/booking/BookCallButton';
import { Card } from '@/components/primitives/Card';
import { SectionReveal } from '@/components/primitives/SectionReveal';
import {
  mentorshipSection,
  mentorshipTestimonials,
  mentorshipTopics,
} from '@/content/mentorship';

import { isPlaceholderString as isPlaceholder } from '@/lib/placeholders';

export const metadata: Metadata = {
  title: 'Mentorship',
  description:
    'Free 30-minute mentorship calls for students and early-career devs working on AI. Bring a real problem and we will dig in.',
  alternates: { canonical: '/mentorship' },
};

const faq = [
  {
    q: 'How does booking work?',
    a: 'Pick a slot on the calendar, and you will get an email with the call link and a short prep questionnaire.',
  },
  {
    q: 'What should I prepare?',
    a: 'A short paragraph on your context (what you are building, where you are stuck) and any artefacts (Figma, repo, recording). The prep questionnaire walks you through it.',
  },
  {
    q: 'Is it really free?',
    a: 'Yes. 30-minute calls are unpaid. If you want deeper ongoing work after, we can talk about it on the call.',
  },
  {
    q: 'What languages?',
    a: 'English. Hindi for casual conversation if helpful.',
  },
  {
    q: 'Async follow-up?',
    a: 'I will leave you with a written next-steps list at the end of the call.',
  },
  {
    q: 'Can I bring a teammate?',
    a: 'Yes. Up to two people on the call. Beyond that, message me and we can scope a small workshop instead.',
  },
];

export default function MentorshipPage() {
  const visibleTestimonials = mentorshipTestimonials.filter((t) => !isPlaceholder(t.quote));

  return (
    <div className="bg-bg">
      <header className="section-y bg-section">
        <div className="mx-auto w-full max-w-4xl px-4 md:px-6">
          <SectionReveal>
            <p className="text-accent text-small font-medium uppercase tracking-wide">
              {mentorshipSection.eyebrow}
            </p>
            <h1 className="mt-3 text-balance">{mentorshipSection.heading}</h1>
            <p className="text-muted mt-4 max-w-2xl text-pretty text-h3 font-normal sm:mt-5">
              {mentorshipSection.sub}
            </p>
            <div className="mt-6 flex flex-col items-start gap-3 sm:mt-8">
              <BookCallButton intent="mentor" variant="primary">
                {mentorshipSection.primaryCtaLabel}
              </BookCallButton>
              <p className="text-subtle text-small max-w-2xl text-pretty">
                {mentorshipSection.secondaryLine}
              </p>
            </div>
          </SectionReveal>
        </div>
      </header>

      <section
        aria-labelledby="topics-title"
        className="section-y mx-auto w-full max-w-4xl px-4 md:px-6"
      >
        <SectionReveal>
          <h2 id="topics-title" className="text-balance">
            {mentorshipSection.topicsHeading}.
          </h2>
        </SectionReveal>
        <ul className="mt-8 space-y-3 sm:mt-10 sm:space-y-4 md:mt-12">
          {mentorshipTopics.map((topic, index) => (
            <SectionReveal key={topic.id} delay={index * 0.04}>
              <li
                data-highlight-id={`mentorship-${topic.id}`}
                className="border-line bg-elevated text-fg flex items-start gap-2.5 rounded-xl border p-4 sm:gap-3 sm:p-5 md:p-6"
              >
                <Check
                  className="text-accent mt-1 h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                <span className="text-pretty text-small sm:text-base">{topic.label}</span>
              </li>
            </SectionReveal>
          ))}
        </ul>
      </section>

      {visibleTestimonials.length > 0 && (
        <section
          aria-labelledby="testimonials-title"
          className="section-y bg-section"
        >
          <div className="mx-auto w-full max-w-4xl px-4 md:px-6">
            <SectionReveal>
              <h2 id="testimonials-title">What past mentees say.</h2>
            </SectionReveal>
            <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-5 md:grid-cols-2">
              {visibleTestimonials.map((t) => (
                <SectionReveal key={t.id}>
                  <Card>
                    <Sparkles className="text-accent h-4 w-4" aria-hidden="true" />
                    <p className="text-fg mt-3 text-pretty text-small sm:text-base">{t.quote}</p>
                    <p className="text-muted mt-3 text-small">
                      {t.author}
                      {t.role ? `, ${t.role}` : ''}
                    </p>
                  </Card>
                </SectionReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <section aria-labelledby="faq-title" className="section-y">
        <div className="mx-auto w-full max-w-3xl px-4 md:px-6">
          <SectionReveal>
            <h2 id="faq-title">Frequently asked.</h2>
          </SectionReveal>
          <ul className="mt-8 space-y-3 sm:mt-10 sm:space-y-4 md:mt-12">
            {faq.map((item, i) => (
              <SectionReveal key={i} delay={i * 0.03}>
                <details className="group/faq border-line bg-elevated rounded-xl border p-4 sm:p-5 md:p-6">
                  <summary className="text-fg flex cursor-pointer items-center justify-between gap-3 text-pretty font-medium sm:gap-4">
                    {item.q}
                    <span
                      aria-hidden="true"
                      className="text-muted text-h3 leading-none transition-transform group-open/faq:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="text-muted mt-3 text-pretty text-small sm:text-base">{item.a}</p>
                </details>
              </SectionReveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-y bg-section">
        <div className="mx-auto w-full max-w-3xl px-4 md:px-6 text-center">
          <SectionReveal>
            <h2 className="text-balance">Pick a time.</h2>
            <p className="text-muted mt-3 max-w-2xl mx-auto">
              Calendar opens in your local timezone. Bring a real problem.
            </p>
            <div className="mt-6 inline-flex">
              <BookCallButton intent="mentor" variant="primary">
                {mentorshipSection.primaryCtaLabel}
              </BookCallButton>
            </div>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}
