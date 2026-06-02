'use client';

import { MapPin } from 'lucide-react';
import { motion, useReducedMotion, useScroll } from 'framer-motion';
import { useRef } from 'react';
import { SectionReveal } from '@/components/primitives/SectionReveal';
import { TechBadge } from '@/components/primitives/TechBadge';
import { CursorSpotlight } from '@/components/sections/CursorSpotlight';
import { experience } from '@/content/experience';

export function Experience() {
  const olRef = useRef<HTMLOListElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: olRef,
    offset: ['start 70%', 'end 70%'],
  });

  return (
    <section
      id="experience"
      aria-labelledby="experience-title"
      className="section-y bg-section relative isolate overflow-hidden"
    >
      <CursorSpotlight />
      <div className="mx-auto w-full max-w-5xl px-4 md:px-6">
        <SectionReveal>
          <p className="text-accent text-small font-medium uppercase tracking-wide">
            Track record
          </p>
          <h2 id="experience-title" className="mt-3 text-balance">
            Where I&apos;ve been shipping.
          </h2>
        </SectionReveal>

        <ol ref={olRef} className="relative mt-12 pl-8 md:mt-16 md:pl-12">
          <div
            aria-hidden="true"
            className="bg-line absolute bottom-2 left-2 top-2 w-px md:left-3"
          />
          <motion.div
            aria-hidden="true"
            className="bg-accent absolute bottom-2 left-2 top-2 w-px origin-top md:left-3"
            style={{ scaleY: prefersReducedMotion ? 1 : scrollYProgress }}
          />

          {experience.map((role, index) => {
            const isMostRecent = index === 0;
            return (
              <SectionReveal
                key={role.id}
                delay={index * 0.05}
                className="relative mb-8 last:mb-0"
              >
                <li id={role.anchor} data-highlight-id={role.id} className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute top-7 -left-[30px] z-10 h-3 w-3 md:top-9 md:-left-[42px]"
                  >
                    {isMostRecent && !prefersReducedMotion && (
                      <span
                        aria-hidden="true"
                        className="bg-accent/40 absolute -inset-1 animate-ping rounded-full"
                      />
                    )}
                    <span
                      aria-hidden="true"
                      className={[
                        'ring-section absolute inset-0 rounded-full ring-4',
                        isMostRecent ? 'bg-accent' : 'bg-line-strong',
                      ].join(' ')}
                    />
                  </span>

                  <article className="border-line bg-elevated rounded-xl border p-5 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-line-strong hover:shadow-md md:p-7">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="text-h3 text-fg font-medium leading-tight">
                          <span className="text-accent">{role.company}</span>
                        </h3>
                        <p className="text-muted mt-1 text-body">{role.title}</p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-fg text-small font-medium">
                          {role.start} <span className="text-subtle">to</span> {role.end}
                        </p>
                        <p className="text-muted mt-1 inline-flex items-center gap-1 text-small">
                          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                          {role.location}
                        </p>
                      </div>
                    </div>

                    {isMostRecent && (
                      <div className="mt-4">
                        <span className="bg-accent/10 text-accent inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-small font-medium">
                          <span
                            aria-hidden="true"
                            className="bg-accent inline-block h-1.5 w-1.5 animate-pulse rounded-full"
                          />
                          Most recent role
                        </span>
                      </div>
                    )}

                    <ul className="mt-5 space-y-2.5">
                      {role.bullets.map((bullet, i) => (
                        <motion.li
                          key={i}
                          className="text-muted flex items-start gap-2.5"
                          initial={
                            prefersReducedMotion ? false : { opacity: 0, x: -6 }
                          }
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true, amount: 0.3 }}
                          transition={{
                            duration: 0.3,
                            delay: prefersReducedMotion ? 0 : i * 0.04,
                            ease: 'easeOut',
                          }}
                        >
                          <span
                            aria-hidden="true"
                            className="bg-accent mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                          />
                          <span className="text-pretty">{bullet}</span>
                        </motion.li>
                      ))}
                    </ul>

                    {role.tech.length > 0 && (
                      <ul className="mt-6 flex flex-wrap gap-2">
                        {role.tech.map((tech) => (
                          <li key={tech}>
                            <TechBadge name={tech} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                </li>
              </SectionReveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
