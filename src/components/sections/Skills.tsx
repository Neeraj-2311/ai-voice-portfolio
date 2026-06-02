import { SectionReveal } from '@/components/primitives/SectionReveal';
import { TechBadge } from '@/components/primitives/TechBadge';
import { CursorSpotlight } from '@/components/sections/CursorSpotlight';
import { skillGroups } from '@/content/skills';

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

        <div className="mt-12 space-y-10 md:mt-16">
          {skillGroups.map((group, index) => (
            <SectionReveal key={group.id} delay={index * 0.04}>
              <div
                className="grid gap-4 md:grid-cols-[180px_1fr] md:gap-8"
                data-highlight-id={`skills-${group.id}`}
              >
                <h3 className="text-fg text-small font-medium uppercase tracking-wide">
                  {group.title}
                </h3>
                <ul className="flex flex-wrap gap-2">
                  {group.skills.map((skill) => (
                    <li key={skill.name}>
                      <TechBadge name={skill.name} note={skill.note} />
                    </li>
                  ))}
                </ul>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
