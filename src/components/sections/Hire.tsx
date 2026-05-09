import { ArrowRight, Check, FileText, Mail, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { LinkedinIcon } from '@/components/primitives/BrandIcon';
import { Button } from '@/components/primitives/Button';
import { Card } from '@/components/primitives/Card';
import { SectionReveal } from '@/components/primitives/SectionReveal';
import { hireEngagements, hireTrustLine } from '@/content/hire';
import { site } from '@/content/site';

export function Hire() {
  return (
    <section id="hire" aria-labelledby="hire-title" className="section-y">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <SectionReveal>
          <p className="text-accent text-small font-medium uppercase tracking-wide">
            For founders &amp; companies
          </p>
          <h2 id="hire-title" className="mt-3 text-balance">
            Building voice AI, agents, or AI products? Let&apos;s talk.
          </h2>
          <p className="text-muted mt-4 max-w-2xl text-pretty">
            I work with teams that ship. Pick the engagement that matches where you are
            and we&apos;ll take it from there.
          </p>
          <p className="text-muted mt-3 inline-flex items-center gap-2 text-small">
            <ShieldCheck className="text-accent h-4 w-4" aria-hidden="true" />
            {hireTrustLine}
          </p>
        </SectionReveal>

        <SectionReveal delay={0.05}>
          <div className="border-line bg-elevated mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5 md:mt-12 md:p-6">
            <div className="min-w-0">
              <p className="text-fg font-medium">Just want the basics?</p>
              <p className="text-muted mt-1 text-small">
                Skip the calendar. Email me, grab the resume, or reach me on LinkedIn.
              </p>
            </div>
            <ul className="flex flex-wrap items-center gap-2">
              <li>
                <Link
                  href={`mailto:${site.email}?subject=Hiring%20enquiry`}
                  className="border-line bg-bg text-fg hover:border-line-strong hover:text-accent inline-flex items-center gap-2 rounded-full border px-3 py-2 text-small font-medium transition-colors"
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  {site.email}
                </Link>
              </li>
              <li>
                <Link
                  href="/resume"
                  data-voice-action="download-resume"
                  className="border-line bg-bg text-fg hover:border-line-strong hover:text-accent inline-flex items-center gap-2 rounded-full border px-3 py-2 text-small font-medium transition-colors"
                >
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  Resume
                </Link>
              </li>
              {site.socials
                .filter((s) => s.icon === 'Linkedin')
                .map((s) => (
                  <li key={s.href}>
                    <Link
                      href={s.href}
                      target="_blank"
                      rel="noreferrer me"
                      className="border-line bg-bg text-fg hover:border-line-strong hover:text-accent inline-flex items-center gap-2 rounded-full border px-3 py-2 text-small font-medium transition-colors"
                    >
                      <LinkedinIcon className="h-4 w-4" aria-hidden="true" />
                      LinkedIn
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        </SectionReveal>

        <p className="text-subtle mt-8 text-small uppercase tracking-wide md:mt-10">
          Or pick an engagement
        </p>

        <div className="mt-4 grid gap-5 md:grid-cols-3">
          {hireEngagements.map((engagement, index) => (
            <SectionReveal key={engagement.id} delay={index * 0.05}>
              <Card
                interactive
                data-highlight-id={`hire-${engagement.id}`}
                className="flex h-full flex-col"
              >
                <h3 className="text-fg">{engagement.title}</h3>
                <p className="text-muted mt-2 text-pretty">{engagement.summary}</p>
                <ul className="mt-5 grow space-y-2">
                  {engagement.bullets.map((bullet, i) => (
                    <li key={i} className="text-muted flex items-start gap-2 text-small">
                      <Check className="text-accent mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Button
                    href={engagement.cta.href}
                    variant={engagement.id === 'discovery' ? 'primary' : 'secondary'}
                    data-voice-action={engagement.cta.voiceAction}
                    trailingIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    {engagement.cta.label}
                  </Button>
                </div>
              </Card>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
