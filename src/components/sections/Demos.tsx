import { Mic, Sparkles } from 'lucide-react';
import { Card } from '@/components/primitives/Card';
import { SectionReveal } from '@/components/primitives/SectionReveal';
import { CursorSpotlight } from '@/components/sections/CursorSpotlight';

export function Demos() {
  return (
    <section
      id="demos"
      aria-labelledby="demos-title"
      className="section-y bg-section relative isolate overflow-hidden"
    >
      <CursorSpotlight />
      <div className="mx-auto w-full max-w-5xl px-4 md:px-6">
        <SectionReveal>
          <p className="text-accent text-small font-medium uppercase tracking-wide">Live experience</p>
          <h2 id="demos-title" className="mt-3 text-balance">
            Talk to the portfolio.
          </h2>
          <p className="text-muted mt-4 max-w-2xl text-pretty">
            A real voice agent that walks you through this site, answers questions about my
            work, and books slots over a phone call. Coming soon.
          </p>
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <Card className="mt-12 overflow-hidden p-0 md:mt-16">
            <div className="bg-bg border-line grid gap-6 border-b p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
              <div className="flex items-start gap-4">
                <span
                  aria-hidden="true"
                  className="bg-accent/10 text-accent inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                >
                  <Mic className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="text-fg">Voice tour</h3>
                  <p className="text-muted mt-1">
                    LiveKit-based real-time agent with sub-second latency. Ask anything about
                    my work, the case studies, or my mentorship sessions. Phase 2 ships when
                    the call quality clears my bar.
                  </p>
                </div>
              </div>
              <span className="border-line bg-bg text-subtle inline-flex items-center gap-1.5 self-start rounded-full border px-3 py-1 text-small md:self-center">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Coming soon
              </span>
            </div>

            <div className="from-accent/10 via-accent/5 to-bg relative h-48 w-full overflow-hidden bg-gradient-to-br md:h-64">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 flex items-center justify-center gap-1"
              >
                {Array.from({ length: 32 }).map((_, i) => {
                  const baseHeight = 8 + ((i * 13) % 50);
                  return (
                    <span
                      key={i}
                      className="bg-accent/40 hero-waveform-bar w-1 rounded-full motion-reduce:animate-none"
                      style={{
                        height: `${baseHeight}%`,
                        animationDelay: `${(i % 8) * 0.1}s`,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </Card>
        </SectionReveal>
      </div>
    </section>
  );
}
