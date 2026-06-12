/**
 * Narration-paced scrolling for the voice tour.
 *
 * When the agent narrates a block it passes the sentence it is about to speak.
 * We estimate that sentence's spoken duration and ease the page to the target
 * over roughly that long (capped so it stays snappy), landing the block just
 * below the sticky nav. Respects prefers-reduced-motion.
 */

const WORDS_PER_MINUTE = 165;
const MIN_MS = 450;
const MAX_MS = 1500;
// Sticky nav is 64px; scroll-padding-top is 5rem. Land targets just below it.
const TOP_OFFSET = 88;

let rafId: number | null = null;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  );
}

/** Rough spoken duration for a sentence, used to pace the scroll. */
export function estimateSpeechMs(text?: string): number {
  const words = (text ?? '').trim().split(/\s+/).filter(Boolean).length;
  if (!words) return 700;
  return Math.min(MAX_MS, Math.max(MIN_MS, Math.round((words / WORDS_PER_MINUTE) * 60_000)));
}

export function cancelVoiceScroll(): void {
  if (rafId != null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function scrollToY(targetY: number, durationMs: number): void {
  cancelVoiceScroll();
  const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const endY = Math.min(Math.max(0, Math.round(targetY)), maxY);
  const startY = window.scrollY;
  const distance = endY - startY;
  // Already essentially there: don't kick off a scroll that would just jitter.
  if (Math.abs(distance) < 24) return;

  if (prefersReducedMotion() || durationMs <= 0) {
    window.scrollTo(0, endY);
    return;
  }

  const startTime = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - startTime) / durationMs);
    window.scrollTo(0, startY + distance * easeInOutCubic(t));
    if (t < 1) {
      rafId = requestAnimationFrame(step);
    } else {
      rafId = null;
    }
  };
  rafId = requestAnimationFrame(step);
}

/**
 * Ease an element to just below the sticky nav, paced to `text`. If the element
 * is already comfortably in view it is left alone (avoids re-scroll jitter when
 * the agent says several sentences about the same block).
 */
export function scrollElementIntoViewPaced(el: Element, text?: string): void {
  const rect = el.getBoundingClientRect();
  // Comfortable band: top is below the nav and the element is mostly on screen.
  const alreadyVisible =
    rect.top >= TOP_OFFSET - 8 &&
    rect.top <= window.innerHeight * 0.5 &&
    rect.bottom > TOP_OFFSET;
  if (alreadyVisible) return;
  const targetY = window.scrollY + rect.top - TOP_OFFSET;
  scrollToY(targetY, estimateSpeechMs(text));
}
