'use client';

import {
  Captions,
  CaptionsOff,
  Keyboard,
  Mic,
  MicOff,
  PhoneOff,
} from 'lucide-react';
import type { ReactNode } from 'react';

interface ControlButtonProps {
  label: string;
  onClick: () => void;
  icon: ReactNode;
  variant?: 'default' | 'danger';
  active?: boolean;
}

function ControlButton({
  label,
  onClick,
  icon,
  variant = 'default',
  active = false,
}: ControlButtonProps) {
  const tone =
    variant === 'danger'
      ? 'text-error border-error/40 hover:bg-error/10'
      : active
        ? 'text-accent border-accent/40 bg-accent/10'
        : 'text-fg border-line hover:border-line-strong hover:bg-fg/5';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={[
        'inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
        tone,
      ].join(' ')}
    >
      {icon}
    </button>
  );
}

interface ControlRowProps {
  micMuted: boolean;
  captionsVisible: boolean;
  textMode: boolean;
  onToggleMic: () => void;
  onToggleCaptions: () => void;
  onToggleTextMode: () => void;
  onEnd: () => void;
}

export function ControlRow({
  micMuted,
  captionsVisible,
  textMode,
  onToggleMic,
  onToggleCaptions,
  onToggleTextMode,
  onEnd,
}: ControlRowProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {!textMode && (
        <ControlButton
          label={micMuted ? 'Unmute mic' : 'Mute mic'}
          onClick={onToggleMic}
          icon={micMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          active={!micMuted}
        />
      )}
      <ControlButton
        label={captionsVisible ? 'Hide captions' : 'Show captions'}
        onClick={onToggleCaptions}
        icon={
          captionsVisible ? (
            <Captions className="h-4 w-4" />
          ) : (
            <CaptionsOff className="h-4 w-4" />
          )
        }
        active={captionsVisible}
      />
      <ControlButton
        label={textMode ? 'Use voice' : 'Type instead'}
        onClick={onToggleTextMode}
        icon={<Keyboard className="h-4 w-4" />}
        active={textMode}
      />
      <ControlButton
        label="End call"
        onClick={onEnd}
        icon={<PhoneOff className="h-4 w-4" />}
        variant="danger"
      />
    </div>
  );
}
