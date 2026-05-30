'use client';

import { useEffect, useRef } from 'react';

/**
 * Cursor-following radial glow. Drops into any `relative` parent section
 * and adds a soft accent spotlight that fades in while the cursor is
 * inside the section's bounding box.
 *
 * Listeners are attached to the parent element (the section), not the
 * window, so we don't pay for 8 global listeners across the homepage.
 * One RAF tick coalesces style writes per frame.
 *
 * Theme-aware via --accent-glow.
 */

interface CursorSpotlightProps {
  /** Override the radius if the section wants a bigger / smaller glow. */
  radiusPx?: number;
  className?: string;
}

export function CursorSpotlight({
  radiusPx = 320,
  className = '',
}: CursorSpotlightProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const parent = el.parentElement;
    if (!parent) return;

    let raf: number | null = null;
    let visible = false;
    let x = 0;
    let y = 0;

    const apply = () => {
      raf = null;
      if (!visible) {
        el.style.opacity = '0';
        return;
      }
      el.style.setProperty('--spot-x', `${x}px`);
      el.style.setProperty('--spot-y', `${y}px`);
      el.style.opacity = '1';
    };

    const schedule = () => {
      if (raf != null) return;
      raf = requestAnimationFrame(apply);
    };

    const onMove = (e: PointerEvent) => {
      const rect = parent.getBoundingClientRect();
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
      visible =
        x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;
      schedule();
    };

    const onLeave = () => {
      visible = false;
      schedule();
    };

    parent.addEventListener('pointermove', onMove);
    parent.addEventListener('pointerleave', onLeave);

    return () => {
      parent.removeEventListener('pointermove', onMove);
      parent.removeEventListener('pointerleave', onLeave);
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={[
        'pointer-events-none absolute inset-0 -z-10 opacity-0',
        'transition-opacity duration-500',
        className,
      ].join(' ')}
      style={{
        background: `radial-gradient(${radiusPx}px circle at var(--spot-x, 50%) var(--spot-y, 50%), var(--accent-glow), transparent 60%)`,
      }}
    />
  );
}
