'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Cursor-tracking spotlight over a static dot grid. Static layout, motion
 * is purely cursor-driven so the hero feels "alive" without competing
 * with the headline or the voice arc.
 *
 *   layer 1: dot grid via CSS radial-gradient pattern (theme-aware)
 *   layer 2: radial accent glow that follows the cursor, masked soft
 *   layer 3: dampened when the voice arc opens so the arc carries focus
 */

const SPOTLIGHT_RADIUS_PX = 360;

export function AmbientVisualizer() {
  const rootRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const [arcOpen, setArcOpen] = useState(false);

  // Detect voice arc presence via MutationObserver so the visualizer
  // dampens without polling.
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const present = document.querySelector(
        '[role="dialog"][aria-label="Voice portfolio tour"]',
      );
      setArcOpen(present != null);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  // Cursor tracking. Throttled to one RAF tick so we never write style
  // outside of a frame.
  useEffect(() => {
    const root = rootRef.current;
    const spotlight = spotlightRef.current;
    if (!root || !spotlight) return;

    let pendingX = -1;
    let pendingY = -1;
    let visible = false;

    const apply = () => {
      rafRef.current = null;
      if (!visible) {
        spotlight.style.opacity = '0';
        return;
      }
      spotlight.style.setProperty('--spot-x', `${pendingX}px`);
      spotlight.style.setProperty('--spot-y', `${pendingY}px`);
      spotlight.style.opacity = arcOpen ? '0.25' : '1';
    };

    const schedule = () => {
      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(apply);
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      pendingX = e.clientX - rect.left;
      pendingY = e.clientY - rect.top;
      visible =
        pendingX >= 0 &&
        pendingX <= rect.width &&
        pendingY >= 0 &&
        pendingY <= rect.height;
      schedule();
    };

    const onPointerLeave = () => {
      visible = false;
      schedule();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [arcOpen]);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Static dot grid. Mask-image fades it out near the edges so the
          grid feels recessed and never reaches the section bounds hard. */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, var(--text-tertiary) 1px, transparent 0)',
          backgroundSize: '28px 28px',
          maskImage:
            'radial-gradient(ellipse at center, black 0%, black 50%, transparent 90%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at center, black 0%, black 50%, transparent 90%)',
        }}
      />

      {/* Cursor spotlight. Opacity is driven from JS; position via CSS vars. */}
      <div
        ref={spotlightRef}
        className="absolute inset-0 opacity-0 transition-opacity duration-500"
        style={{
          background: `radial-gradient(${SPOTLIGHT_RADIUS_PX}px circle at var(--spot-x, 50%) var(--spot-y, 50%), var(--accent-glow), transparent 60%)`,
        }}
      />

      {/* Page-edge fade so the layers dissolve into the section bounds. */}
      <div className="from-bg via-bg/0 to-bg absolute inset-0 bg-gradient-to-b" />
    </div>
  );
}
