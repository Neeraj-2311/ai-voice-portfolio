import type { Metadata } from 'next';
import { ArrowRight, Check, ShieldCheck } from 'lucide-react';
import { CalEmbed } from '@/components/booking/CalEmbed';
import { Button } from '@/components/primitives/Button';
import { Card } from '@/components/primitives/Card';
import { SectionReveal } from '@/components/primitives/SectionReveal';
import { hireEngagements, hireTrustLine } from '@/content/hire';
import { site } from '@/content/site';

export const metadata: Metadata = {
  title: 'Hire',
  description:
    'Engagement models for voice AI, agent development, and full-stack AI builds. Discovery call, project-based work, or fractional advisory.',
  alternates: { canonical: '/hire' },
};

const process = [
  {
    n: '01',
    title: 'Discovery',
    body: 'A 30-minute call to scope your problem, constraints, and budget. Free, no obligation.',
  },
  {
    n: '02',
    title: 'Scoping',
    body: 'Written one-pager with proposed approach, milestones, timeline, and pricing. Iterate until aligned.',
  },
  {
    n: '03',
    title: 'Build',
    body: 'Weekly demos, async updates, evals on real data. You see progress as it happens.',
  },
  {
    n: '04',
    title: 'Handoff',
    body: 'Documentation, runbook, eval harness, and a knowledge transfer call with your team.',
  },
];

const faq = [
  {
    q: 'What are your rates?',
    a: 'Project-based pricing for fixed-scope builds, weekly retainer for fractional / advisory. Discovery call covers what suits your engagement.',
  },
  {
    q: 'Typical timelines?',
    a: 'A focused voice agent can ship a working prototype in 2 to 3 weeks and production-grade in 6 to 10 weeks. Full-stack AI products vary depending on scope.',
  },
  {
    q: 'Do you sign NDAs?',
    a: 'Yes, mutual NDAs are standard. Send your template or use a SaaS one (e.g. Notion / Pipefy NDA). I sign before any sensitive context is shared.',
  },
  {
    q: 'GDPR and data handling?',
    a: 'I have shipped enterprise platforms with GDPR compliance and security hardening (data minimisation, audit logs, encryption-at-rest, restricted PII). Happy to walk through your specific requirements on the discovery call.',
  },
  {
    q: 'Locations and timezones?',
    a: 'Based in London (BST/GMT). Comfortable working with teams in EU, India, and US East. US West works for occasional sprint windows.',
  },
  {
    q: 'Equity / retainer hybrid?',
    a: 'Open to it for early-stage AI startups with a clear thesis. Discuss on the discovery call.',
  },
];

export default function HirePage() {
  const bookingSlug = site.cal.events.find((e) => e.id === 'discovery')?.eventSlug ?? '';
  const calLink = site.cal.username ? `${site.cal.username}/${bookingSlug}` : '[TODO]';

  return (
    <div className="bg-bg">
      <header className="section-y">
        <div className="mx-auto w-full max-w-4xl px-4 md:px-6">
          <SectionReveal>
            <p className="text-accent text-small font-medium uppercase tracking-wide">
              For founders &amp; companies
            </p>
            <h1 className="mt-3 text-balance">
              Building voice AI, agents, or AI products? Let&apos;s talk.
            </h1>
            <p className="text-muted mt-5 max-w-2xl text-pretty text-h3 font-normal">
              I work with teams that ship. Pick the engagement that matches where you are
              and we&apos;ll take it from there.
            </p>
            <p className="text-muted mt-4 inline-flex items-center gap-2 text-small">
              <ShieldCheck className="text-accent h-4 w-4" aria-hidden="true" />
              {hireTrustLine}
            </p>
            <div className="mt-8">
              <Button
                href="#book"
                variant="primary"
                trailingIcon={<ArrowRight className="h-4 w-4" />}
              >
                Book a discovery call
              </Button>
            </div>
          </SectionReveal>
        </div>
      </header>

      <section
        aria-labelledby="engagements-title"
        className="section-y bg-section"
      >
        <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
          <SectionReveal>
            <h2 id="engagements-title">Engagement models.</h2>
          </SectionReveal>
          <div className="mt-10 grid gap-5 md:mt-12 md:grid-cols-3">
            {hireEngagements.map((engagement, index) => (
              <SectionReveal key={engagement.id} delay={index * 0.05}>
                <Card
                  data-highlight-id={`hire-${engagement.id}`}
                  className="flex h-full flex-col"
                >
                  <h3 className="text-fg">{engagement.title}</h3>
                  <p className="text-muted mt-2 text-pretty">{engagement.description}</p>
                  <ul className="mt-5 grow space-y-2">
                    {engagement.bullets.map((b, i) => (
                      <li key={i} className="text-muted flex items-start gap-2 text-small">
                        <Check className="text-accent mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      <section
        aria-labelledby="process-title"
        className="section-y mx-auto w-full max-w-5xl px-4 md:px-6"
      >
        <SectionReveal>
          <h2 id="process-title">How a project runs.</h2>
        </SectionReveal>
        <ol className="mt-10 grid gap-5 md:mt-12 md:grid-cols-2 lg:grid-cols-4">
          {process.map((step, i) => (
            <SectionReveal key={step.n} delay={i * 0.05}>
              <li className="border-line bg-elevated rounded-xl border p-5 md:p-6">
                <span className="text-accent text-small font-mono font-medium">{step.n}</span>
                <h3 className="text-fg mt-2">{step.title}</h3>
                <p className="text-muted mt-2 text-pretty text-small">{step.body}</p>
              </li>
            </SectionReveal>
          ))}
        </ol>
      </section>

      <section
        id="book"
        aria-labelledby="book-title"
        className="section-y bg-section"
      >
        <div className="mx-auto w-full max-w-4xl px-4 md:px-6">
          <SectionReveal>
            <h2 id="book-title" className="text-balance">
              Book a discovery call.
            </h2>
            <p className="text-muted mt-3 max-w-2xl">
              Free, 30 minutes, video call. I&apos;ll come prepared if you share a one-paragraph
              context note when booking.
            </p>
          </SectionReveal>
          <SectionReveal delay={0.1}>
            <div className="mt-8">
              <CalEmbed calLink={calLink} label="Open discovery calendar" />
            </div>
          </SectionReveal>
        </div>
      </section>

      <section aria-labelledby="faq-title" className="section-y">
        <div className="mx-auto w-full max-w-3xl px-4 md:px-6">
          <SectionReveal>
            <h2 id="faq-title">Frequently asked.</h2>
          </SectionReveal>
          <ul className="mt-10 space-y-4 md:mt-12">
            {faq.map((item, i) => (
              <SectionReveal key={i} delay={i * 0.03}>
                <details className="group/faq border-line bg-elevated rounded-xl border p-5 md:p-6">
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
