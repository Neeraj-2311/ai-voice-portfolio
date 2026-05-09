import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/primitives/Card';
import { SectionReveal } from '@/components/primitives/SectionReveal';
import { TechBadge } from '@/components/primitives/TechBadge';
import { caseStudies } from '@/content/case-studies';

export function CaseStudies() {
  return (
    <section
      id="case-studies"
      aria-labelledby="case-studies-title"
      className="section-y"
    >
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <SectionReveal>
          <p className="text-accent text-small font-medium uppercase tracking-wide">Proof of work</p>
          <h2 id="case-studies-title" className="mt-3 text-balance">
            Selected projects.
          </h2>
          <p className="text-muted mt-4 max-w-2xl text-pretty">
            A few of the systems I&apos;ve shipped. Detailed write-ups are coming as soon as
            they clear NDA, in the meantime each card links to the long-form study.
          </p>
        </SectionReveal>

        <div className="mt-12 grid gap-5 md:mt-16 md:grid-cols-2 lg:grid-cols-3">
          {caseStudies.map((study, index) => (
            <SectionReveal key={study.slug} delay={index * 0.05}>
              <Link
                href={`/case-studies/${study.slug}`}
                data-highlight-id={`case-${study.slug}`}
                className="group block h-full"
                aria-label={`Read the ${study.title} case study`}
              >
                <Card interactive className="flex h-full flex-col">
                  <div className="bg-bg border-line relative aspect-[16/9] w-full overflow-hidden rounded-lg border">
                    <div className="from-accent/15 via-accent/5 to-bg absolute inset-0 bg-gradient-to-br" />
                    <div className="absolute inset-0 flex items-end justify-between gap-3 p-4">
                      <div>
                        <p className="text-fg text-display-tabular font-semibold leading-none">
                          {study.heroMetric.value}
                        </p>
                        <p className="text-muted mt-1 text-small">{study.heroMetric.label}</p>
                      </div>
                      {study.status === 'placeholder' && (
                        <span className="border-line text-subtle bg-bg/80 rounded-full border px-2 py-0.5 text-[12px]">
                          Write-up coming
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-fg mt-5">{study.title}</h3>
                  <p className="text-muted mt-2 grow text-pretty">{study.summary}</p>

                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {study.tech.map((tech) => (
                      <li key={tech}>
                        <TechBadge name={tech} />
                      </li>
                    ))}
                  </ul>

                  <span className="text-accent group-hover:text-accent-hover mt-5 inline-flex items-center gap-1 text-small font-medium transition-colors">
                    Read case study
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </Card>
              </Link>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
