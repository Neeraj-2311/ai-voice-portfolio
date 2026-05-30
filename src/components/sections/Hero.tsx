import { ArrowRight } from 'lucide-react';
import { BookCallButton } from '@/components/booking/BookCallButton';
import { OpenContactSpeakingButton } from '@/components/sections/OpenContactSpeakingButton';
import { HeroVoiceCTA } from '@/components/voice/HeroVoiceCTA';
import { AmbientVisualizer } from './AmbientVisualizer';
import { LinearWaveStrip } from './LinearWaveStrip';
import { SlashHint } from './SlashHint';
import { site } from '@/content/site';

export function Hero() {
  return (
    <section
      id="hero"
      aria-label="Introduction"
      className="bg-bg relative isolate flex min-h-[88vh] items-center overflow-hidden"
    >
      <AmbientVisualizer />

      <div className="relative z-20 mx-auto w-full max-w-5xl px-6 text-center">
        <span className="border-accent/30 bg-accent/10 text-fg inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-small">
          <span
            aria-hidden="true"
            className="bg-success inline-block h-2 w-2 animate-pulse rounded-full"
          />
          {site.availability}
        </span>

        <h1
          className="mt-7 font-semibold tracking-[-0.04em] text-balance text-[64px] leading-[0.98] sm:text-[80px] md:text-[112px]"
        >
          {site.name}
        </h1>

        <p className="text-fg/90 mx-auto mt-6 max-w-3xl text-pretty text-h2 font-normal leading-tight">
          <GradientWord>Voice AI</GradientWord> and full-stack engineer
          <span className="text-muted"> · </span>
          building <GradientWord>agentic systems</GradientWord> for enterprise.
        </p>

        <p className="text-muted mx-auto mt-5 max-w-2xl text-pretty text-small">
          {site.mostRecentLine}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <BookCallButton
            intent="hire"
            variant="primary"
            trailingIcon={<ArrowRight className="h-4 w-4" />}
          >
            Hire me
          </BookCallButton>
          <BookCallButton intent="mentor" variant="secondary">
            Book mentorship
          </BookCallButton>
          <HeroVoiceCTA />
        </div>

        <div className="mt-5 hidden justify-center md:flex">
          <SlashHint />
        </div>

        {/* Pulsing waveform strip sits in the CTA area as a calm accent
            between the slash hint and the speaking line. */}
        <div className="relative mx-auto mt-8 h-16 w-full">
          <LinearWaveStrip />
        </div>

        <p className="text-muted mt-4 text-small">
          Inviting me to speak or mentor at an event?{' '}
          <OpenContactSpeakingButton />
        </p>
      </div>
    </section>
  );
}

function GradientWord({ children }: { children: React.ReactNode }) {
  return (
    <span className="from-fg via-fg to-accent bg-gradient-to-br bg-clip-text font-medium text-transparent">
      {children}
    </span>
  );
}
