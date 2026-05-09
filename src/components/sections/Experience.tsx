import { Briefcase, MapPin } from 'lucide-react';
import { SectionReveal } from '@/components/primitives/SectionReveal';
import { TechBadge } from '@/components/primitives/TechBadge';
import { experience } from '@/content/experience';

export function Experience() {
  return (
    <section
      id="experience"
      aria-labelledby="experience-title"
      className="section-y bg-section"
    >
      <div className="mx-auto w-full max-w-5xl px-4 md:px-6">
        <SectionReveal>
          <p className="text-accent text-small font-medium uppercase tracking-wide">Track record</p>
          <h2 id="experience-title" className="mt-3 text-balance">
            Where I&apos;ve been shipping.
          </h2>
        </SectionReveal>

        <ol className="mt-12 md:mt-16">
          {experience.map((role, index) => (
            <SectionReveal key={role.id} delay={index * 0.05}>
              <li
                id={role.anchor}
                data-highlight-id={role.id}
                className="border-line relative grid gap-6 border-l-2 pb-20 pl-6 pt-2 first:pt-0 last:pb-2 md:grid-cols-[200px_1fr] md:gap-10 md:pb-28 md:pl-10"
              >
                <span
                  aria-hidden="true"
                  className="bg-accent absolute -left-[7px] top-2 h-3 w-3 rounded-full ring-4 ring-bg"
                />

                <div>
                  <p className="text-fg text-small font-medium">
                    {role.start} {' '}
                    <span className="text-subtle">to</span> {role.end}
                  </p>
                  <p className="text-muted mt-1 inline-flex items-center gap-1 text-small">
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    {role.location}
                  </p>
                </div>

                <div>
                  <h3 className="text-fg inline-flex items-center gap-2">
                    <Briefcase className="text-muted h-4 w-4" aria-hidden="true" />
                    {role.title}
                    <span className="text-muted font-normal">at</span>
                    <span className="text-accent">{role.company}</span>
                  </h3>

                  <ul className="text-muted mt-4 list-disc space-y-2 pl-5">
                    {role.bullets.map((bullet, i) => (
                      <li key={i}>{bullet}</li>
                    ))}
                  </ul>

                  {role.tech.length > 0 && (
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {role.tech.map((tech) => (
                        <li key={tech}>
                          <TechBadge name={tech} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            </SectionReveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
