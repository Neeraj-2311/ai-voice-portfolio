import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/primitives/Card';
import { SectionReveal } from '@/components/primitives/SectionReveal';
import { services } from '@/content/services';
import { getIcon } from '@/lib/icons';

export function Services() {
  return (
    <section id="services" aria-labelledby="services-title" className="section-y">
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

        <div className="mt-12 grid gap-5 md:mt-16 md:grid-cols-3">
          {services.map((service, index) => {
            const Icon = getIcon(service.iconName);
            return (
              <SectionReveal key={service.id} delay={index * 0.05}>
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
              </SectionReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
