import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { CaseStudyCover } from '@/components/sections/CaseStudyCover';
import { CursorSpotlight } from '@/components/sections/CursorSpotlight';
import { SectionReveal } from '@/components/primitives/SectionReveal';
import { TechBadge } from '@/components/primitives/TechBadge';
import { caseStudies } from '@/content/case-studies';

export function CaseStudies() {
  return (
    <section
      id="case-studies"
      aria-labelledby="case-studies-title"
      className="section-y relative isolate overflow-hidden"
    >
      <CursorSpotlight />
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <SectionReveal>
          <p className="text-accent text-small font-medium uppercase tracking-wide">
            Proof of work
          </p>
          <h2 id="case-studies-title" className="mt-3 text-balance">
            Selected projects.
          </h2>
          <p className="text-muted mt-4 max-w-2xl text-pretty">
            A few of the systems I&apos;ve shipped. Detailed write-ups are coming as soon as
            they clear NDA. In the meantime each card links to the long-form study.
          </p>
        </SectionReveal>

        <div className="mt-12 grid gap-5 md:mt-16 md:grid-cols-2 lg:grid-cols-3">
          {caseStudies.map((study, index) => {
            const isFeatured = index === 0;
            return (
              <SectionReveal key={study.slug} delay={index * 0.05}>
                <Link
                  href={`/case-studies/${study.slug}`}
                  data-highlight-id={`case-${study.slug}`}
                  aria-label={`Read the ${study.title} case study`}
                  className={[
                    'group relative flex h-full flex-col overflow-hidden rounded-2xl border',
                    'border-line bg-elevated',
                    'transition-all duration-300 ease-out',
                    'hover:border-line-strong hover:-translate-y-0.5',
                    'hover:shadow-lg hover:shadow-[var(--accent-glow)]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]',
                  ].join(' ')}
                >
                  {isFeatured && (
                    <span
                      aria-hidden="true"
                      className="bg-accent text-accent-fg absolute left-0 top-0 z-20 inline-flex items-center gap-1 rounded-br-xl rounded-tl-2xl px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide shadow-md"
                    >
                      <Sparkles className="h-3 w-3" aria-hidden="true" />
                      Featured
                    </span>
                  )}

                  <div className="bg-bg border-line relative aspect-[2/1] w-full overflow-hidden border-b sm:aspect-[16/9]">
                    <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.04]">
                      <CaseStudyCover slug={study.slug} />
                    </div>
                    <div className="from-bg/0 to-bg/40 absolute inset-0 bg-gradient-to-b" />

                    {study.status === 'placeholder' && (
                      <span className="border-line text-subtle bg-bg/85 absolute right-3 top-3 rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide backdrop-blur-sm">
                        Write-up coming
                      </span>
                    )}
                  </div>

                  <div className="flex grow flex-col p-4 sm:p-5 md:p-6">
                    {study.heroMetric.value.includes('[TODO]') ? (
                      <h3 className="text-fg text-h3 font-medium">{study.title}</h3>
                    ) : (
                      <>
                        <div className="flex items-baseline justify-between gap-3">
                          <h3 className="text-fg text-h3 font-medium">{study.title}</h3>
                          <span className="text-accent text-h3 font-semibold leading-none tabular-nums">
                            {study.heroMetric.value}
                          </span>
                        </div>
                        <p className="text-subtle mt-0.5 text-right text-[12px]">
                          {study.heroMetric.label}
                        </p>
                      </>
                    )}

                    <p className="text-muted mt-3 grow text-pretty text-small sm:mt-4 sm:text-base">{study.summary}</p>

                    <ul className="mt-4 flex flex-wrap gap-1.5 sm:mt-5">
                      {study.tech.slice(0, 4).map((tech) => (
                        <li key={tech}>
                          <TechBadge name={tech} />
                        </li>
                      ))}
                      {study.tech.slice(4).map((tech) => (
                        <li key={tech} className="hidden sm:block">
                          <TechBadge name={tech} />
                        </li>
                      ))}
                      {study.tech.length > 4 && (
                        <li className="text-subtle inline-flex items-center text-small sm:hidden">
                          +{study.tech.length - 4} more
                        </li>
                      )}
                    </ul>

                    <span className="text-accent group-hover:text-accent-hover mt-4 inline-flex items-center gap-1 text-small font-medium transition-colors sm:mt-5">
                      Read case study
                      <ArrowRight
                        className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                </Link>
              </SectionReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
