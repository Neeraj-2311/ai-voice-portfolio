import type { Metadata } from 'next';
import { ArrowRight, Globe, MapPin } from 'lucide-react';
import Image from 'next/image';
import { Card } from '@/components/primitives/Card';
import { SectionReveal } from '@/components/primitives/SectionReveal';
import { OpenContactSpeakingButton } from '@/components/sections/OpenContactSpeakingButton';
import {
  pastEvents,
  speakingFormats,
  speakingSection,
  speakingTopics,
} from '@/content/speaking';

const isPlaceholder = (s: string) => s.includes('[TODO');

export const metadata: Metadata = {
  title: 'Speaking',
  description:
    'Topics, formats, and past events. Invite Neeraj to speak, mentor, or judge at hackathons, bootcamps, college sessions, or workshops.',
  alternates: { canonical: '/speaking' },
};

const sampleAbstracts = [
  {
    title: 'Why voice AI is going to eat phone calls',
    body: 'A 30-minute keynote on what changes when latency drops below a second. Demos, telephony stack, what hard problems remain (turn-taking, barge-in, evals), and a builder-friendly take on what to build next.',
    durations: ['20 min keynote', '45 min talk + Q&A'],
  },
  {
    title: 'Agents that actually ship',
    body: "Common failure modes for agentic systems and the patterns that make them production-grade: tool design, eval harnesses, recovery loops, and observability. Less hand-waving, more hands-on.",
    durations: ['30 min talk', '90 min workshop'],
  },
  {
    title: 'Breaking into AI engineering',
    body: 'For students and early-career devs. The portfolio that gets calls back, the open-source contributions worth your time, and how to ship a small AI side-project that hiring managers will read in full.',
    durations: ['45 min college session', '60 min bootcamp'],
  },
];

const requirements = [
  {
    icon: Globe,
    title: 'Virtual',
    body: 'Zoom / Google Meet / Riverside. I provide my own gear, broadcast-quality audio. UTC-friendly slots ideal.',
  },
  {
    icon: MapPin,
    title: 'In-person',
    body: 'UK, EU, India for 1 to 2 day trips. Travel + hotel covered. Honorarium negotiable for non-profits and student events.',
  },
];

export default function SpeakingPage() {
  const visiblePast = pastEvents.filter((e) => !isPlaceholder(e.name));
  const banner = speakingSection.banner;
  const gallery = speakingSection.gallery;
  const collageImages = gallery.slice(0, 4);
  const collageCount = collageImages.length;

  const collageGridStyle: React.CSSProperties =
    collageCount >= 4
      ? { gridTemplateColumns: '3fr 2fr 2fr', gridTemplateRows: '1fr 1fr' }
      : collageCount === 3
        ? { gridTemplateColumns: '3fr 2fr', gridTemplateRows: '1fr 1fr' }
        : collageCount === 2
          ? { gridTemplateColumns: '3fr 2fr' }
          : { gridTemplateColumns: '1fr' };

  const collageTileStyle = (i: number): React.CSSProperties | undefined => {
    if (collageCount >= 3 && i === 0) return { gridRow: 'span 2' };
    if (collageCount >= 4 && i === 1) return { gridColumn: 'span 2' };
    return undefined;
  };

  return (
    <div className="bg-bg">
      <header className="section-y bg-section">
        <div className="mx-auto w-full max-w-4xl px-4 md:px-6">
          <SectionReveal>
            <p className="text-accent text-small font-medium uppercase tracking-wide">
              For event organisers
            </p>
            <h1 className="mt-3 text-balance">
              Invite me to speak, mentor, or judge.
            </h1>
            <p className="text-muted mt-5 max-w-2xl text-pretty text-h3 font-normal">
              Hackathons, bootcamps, college sessions, AI workshops, founder panels.
              Production voice and agent experience plus an opinionated take on what
              ships next.
            </p>
            <div className="mt-8 inline-flex">
              <OpenContactSpeakingButton />
            </div>
          </SectionReveal>

          {banner && (
            <SectionReveal delay={0.05}>
              <figure className="border-line mt-10 overflow-hidden rounded-2xl border md:mt-14">
                <div
                  className="relative w-full"
                  style={{ aspectRatio: '3 / 2' }}
                >
                  <Image
                    src={banner.src}
                    alt={banner.alt}
                    fill
                    sizes="(min-width: 1024px) 70vw, 100vw"
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
        </div>
      </header>

      <section
        aria-labelledby="formats-title"
        className="section-y mx-auto w-full max-w-6xl px-4 md:px-6"
      >
        <div className="grid gap-12 md:grid-cols-2">
          <SectionReveal>
            <h2 id="formats-title" className="text-h3">
              Formats I take
            </h2>
            <ul className="mt-5 space-y-2.5">
              {speakingFormats.map((f) => (
                <li key={f.id} className="text-muted inline-flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="bg-accent/40 inline-block h-1.5 w-1.5 rounded-full"
                  />
                  {f.label}
                </li>
              ))}
            </ul>
          </SectionReveal>

          <SectionReveal delay={0.05}>
            <h2 className="text-h3">Topics</h2>
            <ul className="mt-5 flex flex-wrap gap-2">
              {speakingTopics.map((t) => (
                <li
                  key={t.id}
                  className="border-line bg-elevated text-fg rounded-full border px-3 py-1.5 text-small"
                >
                  {t.label}
                </li>
              ))}
            </ul>
          </SectionReveal>
        </div>
      </section>

      <section
        aria-labelledby="abstracts-title"
        className="section-y bg-section"
      >
        <div className="mx-auto w-full max-w-5xl px-4 md:px-6">
          <SectionReveal>
            <h2 id="abstracts-title">Sample talk abstracts.</h2>
            <p className="text-muted mt-3 max-w-2xl">
              Starting points. Happy to tailor to your audience and length.
            </p>
          </SectionReveal>

          <div className="mt-10 grid gap-5 md:mt-12 md:grid-cols-2 lg:grid-cols-3">
            {sampleAbstracts.map((a, i) => (
              <SectionReveal key={i} delay={i * 0.05}>
                <Card className="flex h-full flex-col">
                  <h3 className="text-fg">{a.title}</h3>
                  <p className="text-muted mt-3 grow text-pretty">{a.body}</p>
                  <ul className="mt-5 flex flex-wrap gap-1.5">
                    {a.durations.map((d) => (
                      <li
                        key={d}
                        className="border-line text-subtle rounded-full border px-2 py-0.5 text-[12px]"
                      >
                        {d}
                      </li>
                    ))}
                  </ul>
                </Card>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      <section
        aria-labelledby="requirements-title"
        className="section-y mx-auto w-full max-w-5xl px-4 md:px-6"
      >
        <SectionReveal>
          <h2 id="requirements-title">Logistics.</h2>
        </SectionReveal>
        <div className="mt-10 grid gap-5 md:mt-12 md:grid-cols-2">
          {requirements.map((req, i) => (
            <SectionReveal key={req.title} delay={i * 0.05}>
              <Card>
                <span
                  aria-hidden="true"
                  className="bg-accent/10 text-accent inline-flex h-10 w-10 items-center justify-center rounded-lg"
                >
                  <req.icon className="h-5 w-5" />
                </span>
                <h3 className="text-fg mt-4">{req.title}</h3>
                <p className="text-muted mt-2 text-pretty">{req.body}</p>
              </Card>
            </SectionReveal>
          ))}
        </div>
      </section>

      {visiblePast.length > 0 && (
        <section
          aria-labelledby="past-title"
          className="section-y bg-section"
        >
          <div className="mx-auto w-full max-w-5xl px-4 md:px-6">
            <SectionReveal>
              <h2 id="past-title">Past events.</h2>
            </SectionReveal>
            <ul className="mt-10 grid gap-3 md:mt-12 md:grid-cols-3">
              {visiblePast.map((e) => (
                <li key={e.id}>
                  <Card>
                    <p className="text-fg font-medium">{e.name}</p>
                    <p className="text-muted mt-1 text-small">
                      {e.organizer}
                      {e.date ? ` · ${e.date}` : ''}
                      {e.format ? ` · ${e.format}` : ''}
                    </p>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="section-y relative isolate overflow-hidden bg-black min-h-[460px] md:min-h-[520px]">
        {collageCount > 0 && (
          <div
            aria-hidden="true"
            className="absolute inset-0 grid gap-1"
            style={collageGridStyle}
          >
            {collageImages.map((img, i) => (
              <div
                key={i}
                className="relative h-full w-full overflow-hidden"
                style={collageTileStyle(i)}
              >
                <Image
                  src={img.src}
                  alt=""
                  fill
                  sizes="50vw"
                  className="object-cover"
                  unoptimized
                />
              </div>
            ))}
          </div>
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/65 to-black/85"
        />

        <div className="relative mx-auto w-full max-w-3xl px-4 md:px-6">
          <SectionReveal>
            <div className="rounded-2xl p-6 text-center md:p-10">
              <h2 className="text-balance text-white">Got an event in mind?</h2>
              <p className="mt-3 mx-auto max-w-2xl text-pretty text-white/80">
                Share format, audience, date, and any travel constraints. I&apos;ll get back
                within a few days.
              </p>
              <div className="mt-6 inline-flex">
                <OpenContactSpeakingButton />
              </div>
              <p className="mt-3 inline-flex items-center gap-1 text-small text-white/60">
                Opens the contact form pre-filled with the speaking intent.
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </p>
            </div>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}
