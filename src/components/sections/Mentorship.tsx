import { Clock, GraduationCap, Sparkles } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import { Card } from '@/components/primitives/Card';
import { SectionReveal } from '@/components/primitives/SectionReveal';
import {
  mentorshipCredibility,
  mentorshipSessions,
  mentorshipTestimonials,
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
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <SectionReveal>
          <p className="text-accent text-small font-medium uppercase tracking-wide">
            For students &amp; devs
          </p>
          <h2 id="mentorship-title" className="mt-3 text-balance">
            1:1 mentorship for AI builders and students.
          </h2>
          <p className="text-muted mt-4 max-w-2xl text-pretty">
            Honest, focused sessions. We work through your actual problem with concrete
            artefacts: a roadmap, an architecture review, or a portfolio audit you can
            ship the same week.
          </p>
        </SectionReveal>

        <div className="mt-12 grid gap-5 md:mt-16 md:grid-cols-3">
          {mentorshipSessions.map((session, index) => (
            <SectionReveal key={session.id} delay={index * 0.05}>
              <Card
                interactive
                data-highlight-id={`mentorship-${session.id}`}
                className="flex h-full flex-col"
              >
                <span
                  aria-hidden="true"
                  className="bg-accent/10 text-accent inline-flex h-10 w-10 items-center justify-center rounded-lg"
                >
                  <GraduationCap className="h-5 w-5" />
                </span>
                <h3 className="text-fg mt-4">{session.title}</h3>
                <p className="text-muted mt-2 text-small inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {session.durationMinutes} min
                  <span className="text-subtle">·</span>
                  {session.audience}
                </p>
                <p className="text-muted mt-4 grow text-pretty">{session.summary}</p>

                <div className="border-line mt-5 flex items-center justify-between border-t pt-5">
                  <p className="text-fg font-medium">
                    {session.price ?? (
                      <span className="text-subtle text-small font-normal">Pricing on request</span>
                    )}
                  </p>
                  <Button href="#mentorship-book" variant="secondary">
                    Book now
                  </Button>
                </div>
              </Card>
            </SectionReveal>
          ))}
        </div>

        {visibleTestimonials.length > 0 && (
          <SectionReveal delay={0.1}>
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
          <SectionReveal delay={0.15}>
            <p className="text-muted mt-12 text-small">
              Past work:{' '}
              {visibleCredibility
                .map((c) => `${c.name} (${c.type})`)
                .join(' · ')}
            </p>
          </SectionReveal>
        )}

        <SectionReveal delay={0.2}>
          <div
            id="mentorship-book"
            className="border-line mt-12 flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-6 md:p-8"
          >
            <div>
              <h3 className="text-fg">Ready to book?</h3>
              <p className="text-muted mt-1">Pick a session and grab a slot on my calendar.</p>
            </div>
            <Button
              href="/mentorship"
              variant="primary"
              data-voice-action="open-mentorship-booking"
            >
              See all sessions
            </Button>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
