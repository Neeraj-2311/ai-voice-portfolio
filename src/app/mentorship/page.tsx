import type { Metadata } from 'next';
import { Clock, GraduationCap, Sparkles } from 'lucide-react';
import { CalEmbed } from '@/components/booking/CalEmbed';
import { Card } from '@/components/primitives/Card';
import { SectionReveal } from '@/components/primitives/SectionReveal';
import { mentorshipSessions, mentorshipTestimonials } from '@/content/mentorship';
import { site } from '@/content/site';

const isPlaceholder = (s: string) => s.includes('[TODO');

export const metadata: Metadata = {
  title: 'Mentorship sessions',
  description:
    'Book a 1:1 session with Neeraj. Career roadmaps for students, voice agent architecture reviews, and portfolio audits for early-career devs.',
  alternates: { canonical: '/mentorship' },
};

const faq = [
  {
    q: 'How does booking work?',
    a: 'Pick a session below, choose a slot, and you will get an email with the call link and a short prep questionnaire. Slots usually open 1 to 2 weeks ahead.',
  },
  {
    q: 'What should I prepare?',
    a: 'A short paragraph on your context (what you are building, where you are stuck) and any artefacts (Figma, repo, recording). The prep questionnaire walks you through it.',
  },
  {
    q: 'Refund policy?',
    a: 'If we agree the session was not the right fit within 24 hours, full refund, no questions. After that, refunds are handled on a case by case basis.',
  },
  {
    q: 'What languages?',
    a: 'English. Hindi for casual conversation if helpful.',
  },
  {
    q: 'Async follow-up?',
    a: 'Most 60-minute sessions include a short follow-up note within a week. 30-minute roadmap calls leave you with a written next-steps list at the end of the call.',
  },
  {
    q: 'Can I bring a teammate?',
    a: 'Yes. Up to two people on the call. Beyond that, we can run a small workshop instead, message me to scope it.',
  },
];

export default function MentorshipPage() {
  const visibleTestimonials = mentorshipTestimonials.filter((t) => !isPlaceholder(t.quote));
  const bookingSlug = site.cal.events.find((e) => e.id === 'mentorship-roadmap')?.eventSlug ?? '';
  const calLink = site.cal.username ? `${site.cal.username}/${bookingSlug}` : '[TODO]';

  return (
    <div className="bg-bg">
      <header className="section-y bg-section">
        <div className="mx-auto w-full max-w-4xl px-4 md:px-6">
          <SectionReveal>
            <p className="text-accent text-small font-medium uppercase tracking-wide">
              For students &amp; devs
            </p>
            <h1 className="mt-3 text-balance">
              1:1 mentorship for AI builders, students, and early-career devs.
            </h1>
            <p className="text-muted mt-5 max-w-2xl text-pretty text-h3 font-normal">
              Honest, specific sessions. We work through your actual problem and you leave
              with concrete next steps you can act on the same week.
            </p>
          </SectionReveal>
        </div>
      </header>

      <section
        aria-labelledby="sessions-title"
        className="section-y mx-auto w-full max-w-5xl px-4 md:px-6"
      >
        <SectionReveal>
          <h2 id="sessions-title" className="text-balance">
            Sessions on offer
          </h2>
        </SectionReveal>

        <div className="mt-10 space-y-5 md:mt-12">
          {mentorshipSessions.map((session, index) => (
            <SectionReveal key={session.id} delay={index * 0.05}>
              <Card
                interactive
                data-highlight-id={`mentorship-${session.id}`}
                className="grid gap-6 md:grid-cols-[auto_1fr_auto] md:items-start"
              >
                <span
                  aria-hidden="true"
                  className="bg-accent/10 text-accent inline-flex h-12 w-12 items-center justify-center rounded-xl"
                >
                  <GraduationCap className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="text-fg">{session.title}</h3>
                  <p className="text-muted mt-1 inline-flex items-center gap-1.5 text-small">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    {session.durationMinutes} min
                    <span className="text-subtle">·</span>
                    {session.audience}
                  </p>
                  <p className="text-muted mt-3 text-pretty">{session.description}</p>
                </div>
                <div className="text-fg text-h3 font-medium md:text-right">
                  {session.price ?? (
                    <span className="text-subtle text-small font-normal">Pricing on request</span>
                  )}
                </div>
              </Card>
            </SectionReveal>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="book-title"
        className="section-y bg-section mx-auto w-full"
      >
        <div className="mx-auto w-full max-w-4xl px-4 md:px-6">
          <SectionReveal>
            <h2 id="book-title" className="text-balance">
              Book a slot.
            </h2>
            <p className="text-muted mt-3 max-w-2xl">
              Calendar shows available slots in your local timezone. After booking, you get
              the prep questionnaire by email.
            </p>
          </SectionReveal>
          <SectionReveal delay={0.1}>
            <div className="mt-8">
              <CalEmbed calLink={calLink} label="Open booking calendar" />
            </div>
          </SectionReveal>
        </div>
      </section>

      {visibleTestimonials.length > 0 && (
        <section
          aria-labelledby="testimonials-title"
          className="section-y mx-auto w-full max-w-4xl px-4 md:px-6"
        >
          <SectionReveal>
            <h2 id="testimonials-title">What past mentees say.</h2>
          </SectionReveal>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {visibleTestimonials.map((t) => (
              <SectionReveal key={t.id}>
                <Card>
                  <Sparkles className="text-accent h-4 w-4" aria-hidden="true" />
                  <p className="text-fg mt-3 text-pretty">{t.quote}</p>
                  <p className="text-muted mt-3 text-small">
                    {t.author}
                    {t.role ? `, ${t.role}` : ''}
                  </p>
                </Card>
              </SectionReveal>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="faq-title" className="section-y bg-section">
        <div className="mx-auto w-full max-w-3xl px-4 md:px-6">
          <SectionReveal>
            <h2 id="faq-title">Frequently asked.</h2>
          </SectionReveal>
          <ul className="mt-10 space-y-4 md:mt-12">
            {faq.map((item, i) => (
              <SectionReveal key={i} delay={i * 0.03}>
                <details className="group/faq border-line bg-bg rounded-xl border p-5 md:p-6">
                  <summary className="text-fg flex cursor-pointer items-center justify-between gap-4 text-pretty font-medium">
                    {item.q}
                    <span
                      aria-hidden="true"
                      className="text-muted text-h3 leading-none transition-transform group-open/faq:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="text-muted mt-3 text-pretty">{item.a}</p>
                </details>
              </SectionReveal>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
