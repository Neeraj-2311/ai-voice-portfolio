import {
  ArrowRight,
  Compass,
  FileText,
  type LucideIcon,
  Mail,
  Rocket,
  ShieldCheck,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { BookCallButton } from '@/components/booking/BookCallButton';
import { LinkedinIcon } from '@/components/primitives/BrandIcon';
import { Card } from '@/components/primitives/Card';
import { SectionReveal } from '@/components/primitives/SectionReveal';
import { CursorSpotlight } from '@/components/sections/CursorSpotlight';
import { hireEngagementTypes, hireSection, hireTrustLine } from '@/content/hire';
import { site } from '@/content/site';

const ENGAGEMENT_ICONS: Record<string, LucideIcon> = {
  project: Rocket,
  fractional: Users,
  discovery: Compass,
};

export function Hire() {
  return (
    <section
      id="hire"
      aria-labelledby="hire-title"
      className="section-y relative isolate overflow-hidden"
    >
      <CursorSpotlight />
      <div className="mx-auto w-full max-w-5xl px-4 md:px-6">
        <SectionReveal>
          <p className="text-accent text-small font-medium uppercase tracking-wide">
            {hireSection.eyebrow}
          </p>
          <h2 id="hire-title" className="mt-3 text-balance">
            {hireSection.heading}
          </h2>
          <p className="text-muted mt-4 max-w-2xl text-pretty">{hireSection.sub}</p>
        </SectionReveal>

        <SectionReveal delay={0.04}>
          <div className="border-accent mt-6 max-w-3xl border-l-2 py-1 pl-4 md:mt-7">
            <p className="text-fg inline-flex items-start gap-2 text-small">
              <ShieldCheck
                className="text-accent mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              <span className="text-pretty">{hireTrustLine}</span>
            </p>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.08}>
          <div className="border-line bg-elevated mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5 md:mt-12 md:p-6">
            <div className="min-w-0">
              <p className="text-fg font-medium">{hireSection.quickContact.title}</p>
              <p className="text-muted mt-1 text-small">{hireSection.quickContact.body}</p>
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

        <SectionReveal delay={0.12}>
          <div className="mt-10 flex flex-col items-start gap-3 md:mt-12">
            <BookCallButton
              intent="hire"
              variant="primary"
              trailingIcon={<ArrowRight className="h-4 w-4" />}
            >
              {hireSection.primaryCtaLabel}
            </BookCallButton>
            <p className="text-subtle text-small">{hireSection.primaryCtaSubline}</p>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.16}>
          <h3 className="text-fg mt-16 text-h3 font-medium md:mt-20">
            {hireSection.engagementsHeading}
          </h3>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {hireEngagementTypes.map((type) => {
              const Icon = ENGAGEMENT_ICONS[type.id] ?? Rocket;
              return (
                <Card
                  key={type.id}
                  data-highlight-id={`hire-${type.id}`}
                  className="flex h-full flex-col"
                >
                  <span
                    aria-hidden="true"
                    className="bg-accent/10 text-accent inline-flex h-9 w-9 items-center justify-center rounded-lg"
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <h4 className="text-fg mt-4 font-medium">{type.title}</h4>
                  <p className="text-muted mt-2 text-pretty text-small">{type.description}</p>
                </Card>
              );
            })}
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
