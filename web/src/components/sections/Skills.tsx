'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { SectionReveal } from '@/components/primitives/SectionReveal';
import { TechBadge } from '@/components/primitives/TechBadge';
import { CursorSpotlight } from '@/components/sections/CursorSpotlight';
import { skillGroups } from '@/content/skills';
import type { SkillGroup } from '@/types/content';

const MOBILE_BADGE_LIMIT = 6;

function SkillGroupRow({ group }: { group: SkillGroup }) {
  const [expanded, setExpanded] = useState(false);
  const overflows = group.skills.length > MOBILE_BADGE_LIMIT;

  return (
    <div
      className="grid gap-2 md:grid-cols-[180px_1fr] md:gap-8"
      data-highlight-id={`skills-${group.id}`}
    >
      <h3 className="text-fg text-small font-medium uppercase tracking-wide">
        {group.title}
      </h3>
      <div>
        <ul className="flex flex-wrap gap-2">
          {group.skills.map((skill, i) => {
            const visibilityCls =
              i < MOBILE_BADGE_LIMIT || expanded ? '' : 'hidden sm:list-item';
            return (
              <li key={skill.name} className={visibilityCls}>
                <TechBadge name={skill.name} note={skill.note} />
              </li>
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
            {expanded
              ? 'Show less'
              : `Show ${group.skills.length - MOBILE_BADGE_LIMIT} more`}
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>
        )}
      </div>
    </div>
  );
}

export function Skills() {
  return (
    <section
      id="skills"
      aria-labelledby="skills-title"
      className="section-y relative isolate overflow-hidden"
    >
      <CursorSpotlight />
      <div className="mx-auto w-full max-w-5xl px-4 md:px-6">
        <SectionReveal>
          <p className="text-accent text-small font-medium uppercase tracking-wide">
            Stack
          </p>
          <h2 id="skills-title" className="mt-3 text-balance">
            Tools I reach for.
          </h2>
          <p className="text-muted mt-4 max-w-2xl text-pretty">
            TypeScript on Node and Next.js for product, Python for AI, RAG, and voice.
            Hover any badge for a quick note on how I&apos;ve used it.
          </p>
        </SectionReveal>

        <div className="mt-10 space-y-6 sm:space-y-8 md:mt-16 md:space-y-10">
          {skillGroups.map((group, index) => (
            <SectionReveal key={group.id} delay={index * 0.04}>
              <SkillGroupRow group={group} />
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
