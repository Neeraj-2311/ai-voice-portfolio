/**
 * CSS-pulsing waveform strip. Each bar at a fixed position scales
 * vertically on a loop; staggered animation delays make a phantom
 * traveling wave without any canvas or per-frame JS. The strip sits in
 * the hero CTA area, centered horizontally and vertically.
 *
 * Heights are deterministic (modulo formula) so SSR matches client.
 * Respects prefers-reduced-motion via the keyframe in globals.css.
 */

const BAR_COUNT = 44;

export function LinearWaveStrip() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center gap-1.5 overflow-hidden"
    >
      {Array.from({ length: BAR_COUNT }).map((_, i) => {
        // Phantom wave: delays form a smooth cycle every 12 bars so eyes
        // perceive a traveling crest, not random pulses.
        const delay = ((i % 12) * 0.13).toFixed(2);
        // Base resting height varies a touch so static frames look organic.
        const baseHeight = 18 + ((i * 7) % 28);
        return (
          <span
            key={i}
            className="bg-accent/55 hero-wave-bar inline-block w-[3px] rounded-full"
            style={{
              height: `${baseHeight}px`,
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}
    </div>
  );
}
