import { ArrowRight, Check, Sparkles } from 'lucide-react';
import Link from 'next/link';
import type { ServiceItem } from '@/types/content';
import { Button } from '@/components/primitives/Button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/primitives/Card';
import { SectionReveal } from '@/components/primitives/SectionReveal';
import { CursorSpotlight } from '@/components/sections/CursorSpotlight';
import { services } from '@/content/services';
import { getIcon } from '@/lib/icons';

const FEATURE_DELIVERABLES = [
  'POCs first. Prove the approach end to end before committing to the full build.',
  'Scoping: latency budget, success metrics, and constraints written down.',
  'Production runtime: LiveKit, LLM, STT and TTS, telephony, tool use, all wired.',
  'Eval harness and observability shipped before any production traffic.',
  'Handoff with docs and hands-on team enablement so your engineers own it.',
];

function FeatureCard({ service }: { service: ServiceItem }) {
  const Icon = getIcon(service.iconName);
  return (
    <Card
      data-highlight-id={service.id}
      className="bg-elevated relative flex h-full flex-col overflow-hidden p-5 sm:p-7 md:p-9"
    >
      <span
        aria-hidden="true"
        className="bg-accent absolute inset-x-0 top-0 h-[2px]"
      />
      <div
        aria-hidden="true"
        className="bg-accent/[0.06] pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl"
      />

      <div className="relative">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="bg-accent/10 text-accent inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-[11px] font-medium uppercase tracking-wide"
          >
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            Headline service
          </span>
        </div>

        <div className="mt-4 flex items-start gap-3 sm:mt-5 sm:gap-4">
          <span
            aria-hidden="true"
            className="bg-accent/12 text-accent inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl sm:h-14 sm:w-14"
          >
            {Icon ? <Icon className="h-6 w-6 sm:h-7 sm:w-7" /> : null}
          </span>
          <div className="min-w-0">
            <CardTitle className="text-h3 sm:text-h2">{service.title}</CardTitle>
          </div>
        </div>

        <p className="text-muted mt-4 max-w-2xl text-pretty text-body sm:mt-5">{service.summary}</p>

        {service.highlights && service.highlights.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2 sm:mt-5">
            {service.highlights.map((h) => (
              <li
                key={h}
                className="bg-accent/10 text-accent rounded-full px-3 py-1 text-small font-medium"
              >
                {h}
              </li>
            ))}
          </ul>
        )}

        <ul className="mt-4 hidden flex-wrap gap-1.5 sm:mt-5 sm:flex">
          {service.tags.map((tag) => (
            <li
              key={tag}
              className="border-line text-subtle rounded-full border px-2 py-0.5 text-[12px]"
            >
              {tag}
            </li>
          ))}
        </ul>

        <div className="border-line mt-5 border-t pt-4 sm:mt-7 sm:pt-5">
          <p className="text-fg text-small font-medium uppercase tracking-wide">
            From spec to production
          </p>
          <p className="text-muted mt-2 text-small sm:hidden">
            POCs first. Scoping with numbers. Production runtime. Evals before traffic. Team handoff.
          </p>
          <ul className="mt-3 hidden space-y-2 sm:block sm:space-y-2.5">
            {FEATURE_DELIVERABLES.map((item) => (
              <li
                key={item}
                className="text-muted flex items-start gap-2 text-small"
              >
                <Check
                  className="text-accent mt-[3px] h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                <span className="text-pretty">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {service.cta && (
          <div className="mt-5 sm:mt-7">
            <Button
              href={service.cta.href}
              variant="primary"
              className="w-full px-4 py-2 text-small font-medium sm:w-auto"
              trailingIcon={<ArrowRight className="h-4 w-4" />}
            >
              {service.cta.label}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

function SupportingCard({ service }: { service: ServiceItem }) {
  const Icon = getIcon(service.iconName);
  return (
    <Card
      interactive
      data-highlight-id={service.id}
      className="flex h-full flex-col"
    >
      <CardHeader>
        <span
          aria-hidden="true"
          className="bg-accent/10 text-accent inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        >
          {Icon ? <Icon className="h-5 w-5" /> : null}
        </span>
        <CardTitle>{service.title}</CardTitle>
      </CardHeader>
      <CardBody className="grow">{service.summary}</CardBody>
      <ul className="mt-4 flex flex-wrap gap-1.5">
        {service.tags.map((tag) => (
          <li
            key={tag}
            className="border-line text-subtle rounded-full border px-2 py-0.5 text-[12px]"
          >
            {tag}
          </li>
        ))}
      </ul>
      {service.cta && (
        <Link
          href={service.cta.href}
          className="text-accent hover:text-accent-hover mt-5 inline-flex items-center gap-1 text-small font-medium transition-colors"
        >
          {service.cta.label}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      )}
    </Card>
  );
}

export function Services() {
  const featured = services.find((s) => s.featured) ?? services[0];
  const supporting = services.filter((s) => s.id !== featured.id);

  return (
    <section
      id="services"
      aria-labelledby="services-title"
      className="section-y relative isolate overflow-hidden"
    >
      <CursorSpotlight />
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <SectionReveal>
          <p className="text-accent text-small font-medium uppercase tracking-wide">What I do</p>
          <h2 id="services-title" className="mt-3 text-balance">
            Three lanes. Same standard of work.
          </h2>
          <p className="text-muted mt-4 max-w-2xl text-pretty">
            Production voice systems, agentic backends, and the occasional 1:1 session.
            Pick the lane, and I&apos;ll meet you there.
          </p>
        </SectionReveal>

        <div className="mt-12 grid gap-5 md:mt-16 md:grid-cols-2 lg:auto-rows-fr lg:grid-cols-12">
          <SectionReveal
            delay={0}
            className="md:col-span-2 lg:col-span-7 lg:row-span-2"
          >
            <FeatureCard service={featured} />
          </SectionReveal>

          {supporting.map((service, index) => (
            <SectionReveal
              key={service.id}
              delay={0.05 + index * 0.05}
              className="lg:col-span-5"
            >
              <SupportingCard service={service} />
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
