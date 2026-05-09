import { ArrowRight, MapPin } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import { OpenContactSpeakingButton } from '@/components/sections/OpenContactSpeakingButton';
import { HeroWaveform } from './HeroWaveform';
import { site } from '@/content/site';

export function Hero() {
  return (
    <section
      id="hero"
      aria-label="Introduction"
      className="bg-bg relative isolate flex min-h-[78vh] items-center overflow-hidden md:min-h-[82vh]"
    >
      <HeroWaveform />

      <div className="relative z-20 mx-auto w-full max-w-5xl px-6 text-center">
        <p className="text-muted text-small inline-flex items-center gap-2">
          <span
            aria-hidden="true"
            className="bg-success inline-block h-2 w-2 rounded-full"
          />
          Currently building voice AI at {site.current.company}
          <span aria-hidden="true" className="text-subtle">
            ·
          </span>
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
          {site.location}
        </p>

        <h1 className="text-display mt-6 font-semibold tracking-tight text-balance">
          {site.name}
        </h1>

        <p className="text-fg/90 mt-5 text-pretty text-h3 font-normal mx-auto max-w-3xl">
          Voice AI and full-stack engineer.
          <br className="hidden sm:block" />
          I build agentic systems for enterprise.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button
            href="#hire"
            variant="primary"
            data-voice-action="open-hire-discovery"
            trailingIcon={<ArrowRight className="h-4 w-4" />}
          >
            Hire me
          </Button>
          <Button href="#mentorship" variant="secondary">
            Book mentorship
          </Button>
        </div>

        <p className="text-muted mt-6 text-small">
          Inviting me to speak or mentor at an event?{' '}
          <OpenContactSpeakingButton />
        </p>
      </div>
    </section>
  );
}
