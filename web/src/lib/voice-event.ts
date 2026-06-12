/**
 * Event bus to open / close the voice arc from anywhere in the tree.
 * The Hero CTA, the corner Pill, and the 8-second tooltip all dispatch
 * `open-voice-arc`; the arc subscribes once at the layout level.
 */

export const OPEN_VOICE_ARC_EVENT = 'open-voice-arc';
export const CLOSE_VOICE_ARC_EVENT = 'close-voice-arc';

export function openVoiceArc(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(OPEN_VOICE_ARC_EVENT));
}

export function closeVoiceArc(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(CLOSE_VOICE_ARC_EVENT));
}
