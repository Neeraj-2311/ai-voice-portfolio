export default function Home() {
  return (
    <main className="bg-bg text-fg flex min-h-dvh flex-col items-center justify-center">
      <div className="section-y mx-auto w-full max-w-2xl px-6 text-center">
        <p className="text-muted text-sm">Neeraj — portfolio scaffolding</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
          Voice AI &amp; full-stack engineer
        </h1>
        <p className="text-muted mt-6 text-base md:text-lg">
          Building agentic systems for enterprise. Site under construction.
        </p>
        <div className="mt-10 flex justify-center gap-3">
          <span className="bg-accent text-accent-fg rounded-md px-4 py-2 text-sm font-medium">
            Primary CTA preview
          </span>
          <span className="border-line text-fg rounded-md border px-4 py-2 text-sm font-medium">
            Secondary CTA preview
          </span>
        </div>
      </div>
    </main>
  );
}
