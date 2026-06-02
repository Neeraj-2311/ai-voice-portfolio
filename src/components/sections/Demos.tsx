'use client';

import { Mic } from 'lucide-react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/primitives/Card';
import { SectionReveal } from '@/components/primitives/SectionReveal';
import { CursorSpotlight } from '@/components/sections/CursorSpotlight';
import { HeroVoiceCTA } from '@/components/voice/HeroVoiceCTA';

const CAPABILITIES = [
  'Navigates the site',
  'Opens case studies',
  'Books a call',
  'Downloads the resume',
  'Answers questions live',
];

export function Demos() {
  const cardRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const isInView = useInView(cardRef, { once: true, amount: 0.3 });
  const [shimmerKey, setShimmerKey] = useState(0);

  useEffect(() => {
    if (isInView && !prefersReducedMotion) {
      setShimmerKey((k) => k + 1);
    }
  }, [isInView, prefersReducedMotion]);

  const triggerShimmer = () => {
    if (!prefersReducedMotion) setShimmerKey((k) => k + 1);
  };

  return (
    <section
      id="demos"
      aria-labelledby="demos-title"
      className="section-y bg-section relative isolate overflow-hidden"
    >
      <CursorSpotlight />
      <div className="mx-auto w-full max-w-5xl px-4 md:px-6">
        <SectionReveal>
          <p className="text-accent text-small font-medium uppercase tracking-wide">
            Live experience
          </p>
          <h2 id="demos-title" className="mt-3 text-balance">
            Talk to my portfolio.
          </h2>
          <p className="text-muted mt-4 max-w-2xl text-pretty">
            A real voice agent walks you through this site, opens case studies on your
            command, books slots over a call, and answers questions about my work in
            real time. Click below to start.
          </p>
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <div
            ref={cardRef}
            onMouseEnter={triggerShimmer}
            className="mt-12 md:mt-16"
          >
            <Card className="relative overflow-hidden p-0">
              {shimmerKey > 0 && !prefersReducedMotion && (
                <motion.span
                  key={shimmerKey}
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-0 z-20 w-1/3"
                  style={{
                    background:
                      'linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.14) 50%, transparent 100%)',
                    transform: 'skewX(-12deg)',
                  }}
                  initial={{ x: '-120%' }}
                  animate={{ x: '420%' }}
                  transition={{ duration: 1.6, ease: 'easeOut' }}
                />
              )}

              <div className="bg-bg border-line border-b p-6 md:p-8">
                <div className="flex flex-wrap items-start gap-4">
                  <span
                    aria-hidden="true"
                    className="bg-accent/10 text-accent inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                  >
                    <Mic className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-fg">Voice tour</h3>
                      <span className="bg-accent/10 text-accent inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-small font-medium">
                        <span
                          aria-hidden="true"
                          className="bg-accent inline-block h-1.5 w-1.5 animate-pulse rounded-full"
                        />
                        Live
                      </span>
                    </div>
                    <p className="text-muted mt-2 text-pretty">
                      LiveKit realtime agent with sub-second per-stage latency, an
                      English turn detector, and function tools wired into the site.
                      Same stack featured in the enterprise voice AI case study.
                    </p>
                    <ul className="mt-4 flex flex-wrap gap-1.5">
                      {CAPABILITIES.map((c) => (
                        <li
                          key={c}
                          className="border-line text-subtle rounded-full border px-2.5 py-1 text-[12px]"
                        >
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-bg flex flex-col items-center gap-3 p-6 md:p-8">
                <HeroVoiceCTA />
                <p className="text-subtle text-small inline-flex items-center gap-1.5">
                  or press
                  <kbd className="border-line bg-elevated text-fg inline-flex items-center justify-center rounded border px-1.5 py-0.5 font-mono text-[11px] font-medium leading-none">
                    /
                  </kbd>
                  from anywhere
                </p>
              </div>
            </Card>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
