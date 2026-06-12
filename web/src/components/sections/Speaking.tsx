'use client';

import { ArrowRight, Mic } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/primitives/Button';
import { SectionReveal } from '@/components/primitives/SectionReveal';
import { CursorSpotlight } from '@/components/sections/CursorSpotlight';
import { speakingSection } from '@/content/speaking';
import { openContactModal } from '@/lib/contact-modal-event';

export function Speaking() {
  const banner = speakingSection.banner;

  return (
    <section
      id="speaking"
      aria-labelledby="speaking-title"
      className="section-y bg-section relative isolate overflow-hidden"
    >
      <CursorSpotlight />
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <SectionReveal>
          <p className="text-accent text-small font-medium uppercase tracking-wide">
            {speakingSection.eyebrow}
          </p>
          <h2 id="speaking-title" className="mt-3 text-balance">
            {speakingSection.heading}
          </h2>
          <p className="text-muted mt-4 max-w-2xl text-pretty">{speakingSection.sub}</p>
        </SectionReveal>

        {banner && (
          <SectionReveal delay={0.05}>
            <figure className="border-line mt-8 overflow-hidden rounded-2xl border sm:mt-10 md:mt-12">
              <div
                className="relative w-full aspect-[5/3] sm:aspect-[16/9]"
              >
                <Image
                  src={banner.src}
                  alt={banner.alt}
                  fill
                  sizes="(min-width: 1024px) 80vw, 100vw"
                  priority={false}
                  className="object-cover"
                  unoptimized
                />
              </div>
              {banner.caption ? (
                <figcaption className="text-subtle bg-bg border-line border-t px-4 py-3 text-small">
                  {banner.caption}
                </figcaption>
              ) : null}
            </figure>
          </SectionReveal>
        )}

        <SectionReveal delay={0.08}>
          <blockquote className="border-accent mt-8 border-l-2 py-1 pl-4 sm:mt-10 sm:pl-5 md:mt-12">
            <p className="text-fg text-pretty">{speakingSection.whyMeLine}</p>
          </blockquote>
          <ul className="mt-4 grid gap-3 sm:mt-6 sm:gap-6 md:grid-cols-3 md:gap-10">
            {speakingSection.whatIBring.map((line, i) => (
              <li
                key={i}
                className="text-muted flex items-start gap-2.5 text-small"
              >
                <span
                  aria-hidden="true"
                  className="bg-accent mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                />
                <span className="text-pretty">{line}</span>
              </li>
            ))}
          </ul>
        </SectionReveal>

        <SectionReveal delay={0.12}>
          <div className="mt-8 sm:mt-10">
            <Link
              href="/speaking"
              className="text-accent hover:text-accent-hover inline-flex items-center gap-1 text-small font-medium transition-colors"
            >
              See formats, sample topics, abstracts, and past events
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.16}>
          <div className="border-line mt-10 flex flex-col items-start gap-4 rounded-2xl border p-5 sm:mt-12 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:p-6 md:p-8">
            <div>
              <h3 className="text-fg inline-flex items-center gap-2">
                <Mic className="text-accent h-4 w-4" aria-hidden="true" />
                Got an event in mind?
              </h3>
              <p className="text-muted mt-1 text-small sm:text-base">
                Share format, audience, and date. I&apos;ll get back within a few days.
              </p>
            </div>
            <Button
              type="button"
              variant="primary"
              onClick={() => openContactModal({ intent: 'speaking' })}
              data-voice-action="open-event-invite-form"
              trailingIcon={<ArrowRight className="h-4 w-4" />}
              className="w-full sm:w-auto"
            >
              Invite me to your event
            </Button>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
