/**
 * Keyboard hint chip: "Press / to talk to my portfolio". The actual
 * keydown listener lives in VoiceSystem; this is purely the visible cue.
 */

export function SlashHint() {
  return (
    <span className="text-subtle inline-flex items-center gap-1.5 text-[12px]">
      <span>Press</span>
      <kbd className="border-line bg-elevated text-fg inline-flex h-5 min-w-[20px] items-center justify-center rounded border px-1 font-mono text-[11px] leading-none">
        /
      </kbd>
      <span>to talk to my portfolio</span>
    </span>
  );
}
