'use client';

import { useEffect, useRef } from 'react';
import type { LocalAudioTrack, RemoteAudioTrack } from 'livekit-client';

type AnyAudioTrack = LocalAudioTrack | RemoteAudioTrack | null;

interface AudioVisualizerProps {
  /** The track driving the bars. When null, bars render an idle low-amplitude shimmer. */
  track: AnyAudioTrack;
  /** Tints bars: user (muted) vs agent (accent) vs idle (subtle). */
  mode: 'user' | 'agent' | 'idle';
  bars?: number;
  className?: string;
}

const DEFAULT_BARS = 28;
const MIN_BAR_HEIGHT = 0.18;

export function AudioVisualizer({
  track,
  mode,
  bars = DEFAULT_BARS,
  className,
}: AudioVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const barRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const dataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);

  // Initialize / reinitialize when track changes.
  useEffect(() => {
    let cancelled = false;

    const teardown = () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      sourceRef.current?.disconnect();
      sourceRef.current = null;
      analyserRef.current?.disconnect();
      analyserRef.current = null;
      audioCtxRef.current?.close().catch(() => {});
      audioCtxRef.current = null;
      dataRef.current = null;
    };

    if (!track || !track.mediaStreamTrack) {
      teardown();
      // Idle shimmer loop.
      const loop = () => {
        if (cancelled) return;
        const now = performance.now() / 700;
        barRefs.current.forEach((el, i) => {
          if (!el) return;
          const v = MIN_BAR_HEIGHT + 0.06 * (0.5 + 0.5 * Math.sin(now + i * 0.42));
          el.style.transform = `scaleY(${v})`;
        });
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
      return () => {
        cancelled = true;
        teardown();
      };
    }

    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.78;
    const stream = new MediaStream([track.mediaStreamTrack]);
    const source = ctx.createMediaStreamSource(stream);
    source.connect(analyser);
    audioCtxRef.current = ctx;
    analyserRef.current = analyser;
    sourceRef.current = source;
    dataRef.current = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));

    const loop = () => {
      if (cancelled || !analyserRef.current || !dataRef.current) return;
      analyserRef.current.getByteFrequencyData(dataRef.current);
      const data = dataRef.current;
      const step = Math.max(1, Math.floor(data.length / bars));
      for (let i = 0; i < bars; i++) {
        const el = barRefs.current[i];
        if (!el) continue;
        // Sample a small window so adjacent bars aren't identical.
        let sum = 0;
        for (let j = 0; j < step; j++) sum += data[i * step + j] ?? 0;
        const avg = sum / step / 255;
        const scaled = MIN_BAR_HEIGHT + Math.pow(avg, 0.8) * (1 - MIN_BAR_HEIGHT);
        el.style.transform = `scaleY(${scaled.toFixed(3)})`;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelled = true;
      teardown();
    };
  }, [track, bars]);

  const tint =
    mode === 'agent'
      ? 'bg-accent'
      : mode === 'user'
        ? 'bg-fg'
        : 'bg-fg/30';

  return (
    <div
      ref={containerRef}
      className={[
        'flex h-full w-full items-center justify-center gap-[3px]',
        className ?? '',
      ].join(' ')}
      aria-hidden="true"
    >
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          ref={(el) => {
            barRefs.current[i] = el;
          }}
          className={[
            'inline-block h-full w-[3px] origin-center rounded-full transition-colors',
            tint,
          ].join(' ')}
          style={{ transform: `scaleY(${MIN_BAR_HEIGHT})` }}
        />
      ))}
    </div>
  );
}
