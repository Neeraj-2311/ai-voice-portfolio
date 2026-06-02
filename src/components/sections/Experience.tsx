'use client';

import { ChevronDown, MapPin } from 'lucide-react';
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
} from 'framer-motion';
import { useRef, useState } from 'react';
import type { ExperienceRole } from '@/types/content';
import { SectionReveal } from '@/components/primitives/SectionReveal';
import { TechBadge } from '@/components/primitives/TechBadge';
import { CursorSpotlight } from '@/components/sections/CursorSpotlight';
import { experience } from '@/content/experience';

const MOBILE_BULLET_LIMIT = 2;

function TimelineDot({
  active,
  isMostRecent,
  prefersReducedMotion,
}: {
  active: boolean;
  isMostRecent: boolean;
  prefersReducedMotion: boolean | null;
}) {
  return (
    <span
      aria-hidden="true"
      className="absolute top-6 -left-[22px] z-10 h-3 w-3 md:top-9 md:-left-[42px]"
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
      {!isMostRecent && (
        <span
          aria-hidden="true"
          className="bg-accent ring-section absolute inset-0 rounded-full ring-4 transition-opacity duration-500 ease-out"
          style={{ opacity: active ? 1 : 0 }}
        />
      )}
    </span>
  );
}

function ExperienceItem({
  role,
  isMostRecent,
  prefersReducedMotion,
}: {
  role: ExperienceRole;
  isMostRecent: boolean;
  prefersReducedMotion: boolean | null;
}) {
  const articleRef = useRef<HTMLElement>(null);
  const inView = useInView(articleRef, { amount: 0.15, margin: '0px 0px -20% 0px' });
  const active = isMostRecent || inView;

  return (
    <li id={role.anchor} data-highlight-id={role.id} className="relative">
      <TimelineDot
        active={active}
        isMostRecent={isMostRecent}
        prefersReducedMotion={prefersReducedMotion}
      />

      <article
        ref={articleRef}
        className={[
          'border-line bg-elevated relative rounded-xl border transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-line-strong hover:shadow-md',
          isMostRecent
            ? 'px-4 pb-4 pt-10 sm:px-5 sm:pb-5 sm:pt-12 md:px-7 md:pb-7 md:pt-14'
            : 'p-4 sm:p-5 md:p-7',
        ].join(' ')}
      >
        {isMostRecent && (
          <span
            aria-hidden="true"
            className="bg-accent/12 text-accent absolute left-0 top-0 z-20 inline-flex items-center gap-1 rounded-br-xl rounded-tl-xl px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-[11px] md:px-4 md:py-2 md:text-[12px]"
          >
            <span
              aria-hidden="true"
              className="bg-accent inline-block h-1 w-1 animate-pulse rounded-full sm:h-1.5 sm:w-1.5"
            />
            Most recent
          </span>
        )}
        <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-start md:justify-between md:gap-4">
          <div className="min-w-0">
            <h3 className="text-h3 text-fg font-medium leading-tight">
              <span className="text-accent">{role.company}</span>
            </h3>
            <p className="text-muted mt-1 text-body">{role.title}</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 md:block md:text-right">
            <p className="text-fg text-small font-medium">
              {role.start} <span className="text-subtle">to</span> {role.end}
            </p>
            <p className="text-muted inline-flex items-center gap-1 text-small md:mt-1">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {role.location}
            </p>
          </div>
        </div>

        <RoleBullets
          bullets={role.bullets}
          prefersReducedMotion={prefersReducedMotion}
        />

        {role.tech.length > 0 && (
          <ul className="mt-5 flex flex-wrap gap-2 sm:mt-6">
            {role.tech.slice(0, 4).map((tech) => (
              <li key={tech}>
                <TechBadge name={tech} />
              </li>
            ))}
            {role.tech.slice(4).map((tech) => (
              <li key={tech} className="hidden sm:block">
                <TechBadge name={tech} />
              </li>
            ))}
            {role.tech.length > 4 && (
              <li className="text-subtle inline-flex items-center text-small sm:hidden">
                +{role.tech.length - 4} more
              </li>
            )}
          </ul>
        )}
      </article>
    </li>
  );
}

function RoleBullets({
  bullets,
  prefersReducedMotion,
}: {
  bullets: string[];
  prefersReducedMotion: boolean | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const overflows = bullets.length > MOBILE_BULLET_LIMIT;

  return (
    <>
      <ul className="mt-4 space-y-2 sm:mt-5 sm:space-y-2.5">
        {bullets.map((bullet, i) => {
          const visibilityCls =
            i < MOBILE_BULLET_LIMIT || expanded ? 'flex' : 'hidden sm:flex';
          return (
            <motion.li
              key={i}
              className={`text-muted ${visibilityCls} items-start gap-2 sm:gap-2.5`}
              initial={prefersReducedMotion ? false : { opacity: 0, x: -6 }}
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
              <span className="text-pretty text-small sm:text-base">{bullet}</span>
            </motion.li>
          );
        })}
      </ul>
      {overflows && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="text-accent hover:text-accent-hover mt-3 inline-flex items-center gap-1 text-small font-medium transition-colors sm:hidden"
        >
          {expanded ? 'Show less' : `Read ${bullets.length - MOBILE_BULLET_LIMIT} more`}
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
      )}
    </>
  );
}

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

        <ol ref={olRef} className="relative mt-12 pl-6 md:mt-16 md:pl-12">
          <div
            aria-hidden="true"
            className="bg-line absolute bottom-2 left-2 top-2 w-px md:left-3"
          />
          <motion.div
            aria-hidden="true"
            className="bg-accent absolute bottom-2 left-2 top-2 w-px origin-top md:left-3"
            style={{ scaleY: prefersReducedMotion ? 1 : scrollYProgress }}
          />

          {experience.map((role, index) => (
            <SectionReveal
              key={role.id}
              delay={index * 0.05}
              className="relative mb-8 last:mb-0"
            >
              <ExperienceItem
                role={role}
                isMostRecent={index === 0}
                prefersReducedMotion={prefersReducedMotion}
              />
            </SectionReveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
