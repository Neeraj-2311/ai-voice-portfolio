import { Check, Sparkles } from 'lucide-react';
import { BookCallButton } from '@/components/booking/BookCallButton';
import { Card } from '@/components/primitives/Card';
import { SectionReveal } from '@/components/primitives/SectionReveal';
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
      className="section-y bg-section"
    >
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

        <SectionReveal delay={0.05}>
          <div className="mt-10 md:mt-12">
            <p className="text-fg text-small font-medium uppercase tracking-wide">
              {mentorshipSection.topicsHeading}
            </p>
            <ul className="mt-4 space-y-2.5">
              {mentorshipTopics.map((topic) => (
                <li
                  key={topic.id}
                  data-highlight-id={`mentorship-${topic.id}`}
                  className="text-muted flex items-start gap-3"
                >
                  <Check
                    className="text-accent mt-1 h-4 w-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="text-pretty">{topic.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <div className="mt-10 flex flex-col items-start gap-3 md:mt-12">
            <BookCallButton intent="mentor" variant="primary">
              {mentorshipSection.primaryCtaLabel}
            </BookCallButton>
            <p className="text-subtle text-small max-w-2xl text-pretty">
              {mentorshipSection.secondaryLine}
            </p>
          </div>
        </SectionReveal>

        {visibleTestimonials.length > 0 && (
          <SectionReveal delay={0.15}>
            <div className="mt-16 grid gap-5 md:grid-cols-2">
              {visibleTestimonials.map((t) => (
                <Card key={t.id}>
                  <Sparkles className="text-accent h-4 w-4" aria-hidden="true" />
                  <p className="text-fg mt-3 text-pretty">{t.quote}</p>
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
            <p className="text-muted mt-12 text-small">
              Past work:{' '}
              {visibleCredibility.map((c) => `${c.name} (${c.type})`).join(' · ')}
            </p>
          </SectionReveal>
        )}
      </div>
    </section>
  );
}
