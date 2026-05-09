const BARS = 48;

export function HeroWaveform() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 hidden items-end justify-center gap-[3px] overflow-hidden md:flex"
    >
      <div className="from-bg via-bg/0 absolute inset-0 z-10 bg-gradient-to-b to-transparent" />
      <div className="via-bg/0 from-bg to-bg absolute inset-0 z-10 bg-gradient-to-r" />
      {Array.from({ length: BARS }).map((_, i) => {
        const delay = (i % 12) * 0.12;
        const baseHeight = 12 + ((i * 7) % 36);
        return (
          <span
            key={i}
            className="bg-accent/25 hero-waveform-bar w-1 rounded-full motion-reduce:animate-none"
            style={{
              height: `${baseHeight}%`,
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}
    </div>
  );
}
