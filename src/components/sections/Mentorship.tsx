import { Check, Sparkles } from 'lucide-react';
import { BookCallButton } from '@/components/booking/BookCallButton';
import { Card } from '@/components/primitives/Card';
import { SectionReveal } from '@/components/primitives/SectionReveal';
import { CursorSpotlight } from '@/components/sections/CursorSpotlight';
import {
  mentorshipCredibility,
  mentorshipSection,
  mentorshipTestimonials,
  mentorshipTopics,
} from '@/content/mentorship';

const isPlaceholder = (s: string) => s.includes('[TODO');

export function Mentorship() {
  const visibleTestimonials = mentorshipTestimonials.filter((t) => !isPlaceholder(t.quote));
  const visibleCredibility = mentorshipCredibility.filter((c) => !isPlaceholder(c.name));

  return (
    <section
      id="mentorship"
      aria-labelledby="mentorship-title"
      className="section-y bg-section relative isolate overflow-hidden"
    >
      <CursorSpotlight />
      <div className="mx-auto w-full max-w-5xl px-4 md:px-6">
        <SectionReveal>
          <p className="text-accent text-small font-medium uppercase tracking-wide">
            {mentorshipSection.eyebrow}
          </p>
          <h2 id="mentorship-title" className="mt-3 text-balance">
            {mentorshipSection.heading}
          </h2>
          <p className="text-muted mt-4 max-w-2xl text-pretty">{mentorshipSection.sub}</p>
        </SectionReveal>

        <SectionReveal delay={0.04}>
          <blockquote className="border-accent mt-6 max-w-2xl border-l-2 py-1 pl-4 sm:mt-8 sm:pl-5 md:mt-10">
            <p className="text-fg text-pretty">{mentorshipSection.whyMeLine}</p>
          </blockquote>
        </SectionReveal>

        <SectionReveal delay={0.08}>
          <div className="mt-8 sm:mt-10 md:mt-12">
            <p className="text-fg text-small font-medium uppercase tracking-wide">
              {mentorshipSection.topicsHeading}
            </p>
            <ul className="mt-3 space-y-2 sm:mt-4 sm:space-y-2.5">
              {mentorshipTopics.map((topic) => (
                <li
                  key={topic.id}
                  data-highlight-id={`mentorship-${topic.id}`}
                  className="text-muted flex items-start gap-2.5 sm:gap-3"
                >
                  <Check
                    className="text-accent mt-1 h-4 w-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="text-pretty text-small sm:text-base">{topic.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.12}>
          <div className="mt-8 flex flex-col items-start gap-3 sm:mt-10 md:mt-12">
            <div className="inline-flex items-center gap-2 sm:gap-3">
              <BookCallButton intent="mentor" variant="primary">
                {mentorshipSection.primaryCtaLabel}
              </BookCallButton>
              <span className="bg-accent/10 text-accent inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-small font-medium sm:px-3 sm:py-1.5">
                <span
                  aria-hidden="true"
                  className="bg-accent inline-block h-1.5 w-1.5 rounded-full"
                />
                Free
              </span>
            </div>
            <p className="text-subtle text-small max-w-2xl text-pretty">
              {mentorshipSection.secondaryLine}
            </p>
          </div>
        </SectionReveal>

        {visibleTestimonials.length > 0 && (
          <SectionReveal delay={0.16}>
            <div className="mt-10 grid gap-4 sm:mt-12 sm:gap-5 md:mt-16 md:grid-cols-2">
              {visibleTestimonials.map((t) => (
                <Card key={t.id}>
                  <Sparkles className="text-accent h-4 w-4" aria-hidden="true" />
                  <p className="text-fg mt-3 text-pretty text-small sm:text-base">{t.quote}</p>
                  <p className="text-muted mt-3 text-small">
                    {t.author}
                    {t.role ? `, ${t.role}` : ''}
                  </p>
                </Card>
              ))}
            </div>
          </SectionReveal>
        )}

        {visibleCredibility.length > 0 && (
          <SectionReveal delay={0.2}>
            <div className="text-muted mt-10 text-small sm:mt-12">
              <span className="text-fg font-medium">Past work:</span>
              <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 sm:mt-1 sm:inline-flex sm:pl-1">
                {visibleCredibility.map((c, i) => (
                  <li key={c.name} className="flex items-center gap-3">
                    <span>
                      {c.name} <span className="text-subtle">({c.type})</span>
                    </span>
                    {i < visibleCredibility.length - 1 && (
                      <span aria-hidden="true" className="text-subtle hidden sm:inline">
                        ·
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </SectionReveal>
        )}
      </div>
    </section>
  );
}
