import { TextSizeToggle } from '@/components/layout/TextSizeToggle';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

export default function Home() {
  return (
    <main className="bg-bg text-fg flex min-h-dvh flex-col items-center justify-center">
      <div className="absolute top-6 right-6 flex gap-2">
        <ThemeToggle />
        <TextSizeToggle />
      </div>
      <div className="section-y mx-auto w-full max-w-5xl px-6 text-center">
        <p className="text-muted text-small">Neeraj — portfolio scaffolding</p>
        <h1 className="text-display mt-4 font-semibold text-balance">
          Voice AI &amp; full-stack engineer
        </h1>
        <p className="text-muted mt-6 text-pretty">
          Building agentic systems for enterprise. Site under construction.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            className="btn-primary bg-accent text-accent-fg hover:bg-accent-hover inline-flex items-center justify-center rounded-lg transition-colors"
          >
            Primary CTA preview
          </button>
          <button
            type="button"
            className="btn-secondary border-line text-fg hover:border-line-strong inline-flex items-center justify-center rounded-lg border transition-colors"
          >
            Secondary CTA preview
          </button>
        </div>
      </div>
    </main>
  );
}
