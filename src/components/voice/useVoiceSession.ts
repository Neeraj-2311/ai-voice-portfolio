'use client';

import {
  ConnectionState,
  Participant,
  ParticipantEvent,
  Room,
  RoomEvent,
  Track,
  type LocalAudioTrack,
  type RemoteAudioTrack,
  type RemoteTrack,
  type TranscriptionSegment,
} from 'livekit-client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  BookingPayload,
  CaptionLine,
  FeedbackPayload,
  VoiceState,
} from './state';

/**
 * Handlers the arc supplies so the hook can react to RPC calls and
 * agent-driven UI events without owning the page state itself.
 */
export interface VoiceSessionHandlers {
  onNavigate: (sectionId: string, highlightId?: string, text?: string) => void;
  onOpenRoute: (path: string, anchor?: string, highlightId?: string, text?: string) => void;
  onOpenContactForm: (intent?: string, prefill?: Record<string, string>) => void;
  onPrefillContactForm: (fields: Record<string, string>) => void;
  onCloseContactForm: () => void;
  onDownloadResume: () => void;
  onToggleCaptions: (on?: boolean) => void;
  onBookingConfirmed: (payload: BookingPayload) => void;
  onOpenBooking: (intent?: string) => void;
  onSubmitFeedback: (payload: FeedbackPayload) => void;
  onVoiceMessageSent: (payload: { intent?: string; email?: string }) => void;
  onCallbackRequested: (payload: { name?: string }) => void;
  onWrapUpWarning: () => void;
  /** The agent's streaming speech transcript; drives transcript-based scroll. */
  onAgentSpeech: (text: string) => void;
  onEndCall: () => void;
}

/**
 * Audio tracks the visualizer attaches its AnalyserNode to. Local mic
 * drives the user-speaking bars, remote agent track drives agent-speaking.
 */
export interface VoiceTracks {
  localTrack: LocalAudioTrack | null;
  agentTrack: RemoteAudioTrack | null;
}

export interface UseVoiceSession {
  state: VoiceState;
  captions: CaptionLine[];
  tracks: VoiceTracks;
  micMuted: boolean;
  start: (textOnly?: boolean) => Promise<void>;
  end: () => Promise<void>;
  setMicMuted: (muted: boolean) => Promise<void>;
  sendText: (text: string) => Promise<void>;
  errorMessage: string | null;
}

/**
 * Identify the agent participant. LiveKit agent workers join with an
 * identity that starts with `agent` by convention, but we fall back to
 * "any non-local participant" so a custom identity still works.
 */
function isAgent(participant: Participant): boolean {
  return (
    participant.identity.toLowerCase().startsWith('agent') ||
    participant.identity.toLowerCase().includes('bot') ||
    !participant.isLocal
  );
}

export function useVoiceSession(handlers: VoiceSessionHandlers): UseVoiceSession {
  const roomRef = useRef<Room | null>(null);
  // Captions ordered by arrival (chronological). Each speaker has at most
  // one "active" partial line that gets replaced as the STT streams in;
  // once that segment is marked final, the next chunk starts a new line.
  const captionsRef = useRef<CaptionLine[]>([]);
  const activePartialRef = useRef<{ user: string | null; agent: string | null }>({
    user: null,
    agent: null,
  });
  // Audio elements created by track.attach(). LiveKit needs an explicit element
  // for playback; subscribing alone doesn't pipe audio to the speaker.
  const audioElementsRef = useRef<Map<string, HTMLMediaElement>>(new Map());

  const [state, setState] = useState<VoiceState>('idle');
  const [captions, setCaptions] = useState<CaptionLine[]>([]);
  const [tracks, setTracks] = useState<VoiceTracks>({ localTrack: null, agentTrack: null });
  const [micMuted, setMicMutedState] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlersRef = useRef(handlers);
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  const flushCaptions = useCallback(() => {
    setCaptions(captionsRef.current.slice(-30));
  }, []);

  const upsertCaption = useCallback(
    (segment: TranscriptionSegment, from: 'user' | 'agent') => {
      const text = (segment.text ?? '').trim();
      if (!text) return;

      const lines = captionsRef.current;
      const activeId = activePartialRef.current[from];

      // If there's an active partial line for this speaker, replace it in
      // place. Different STT plugins assign different segment IDs for each
      // interim chunk; key by speaker, not by ID, so the line grows in place
      // instead of fragmenting into "pieces".
      if (activeId) {
        const idx = lines.findIndex((l) => l.id === activeId);
        if (idx >= 0) {
          lines[idx] = {
            id: segment.id,
            from,
            text,
            partial: !segment.final,
          };
          activePartialRef.current[from] = segment.final ? null : segment.id;
          flushCaptions();
          return;
        }
        // Active line was rotated off the tail; fall through and push a new one.
        activePartialRef.current[from] = null;
      }

      lines.push({
        id: segment.id,
        from,
        text,
        partial: !segment.final,
      });
      if (!segment.final) activePartialRef.current[from] = segment.id;
      flushCaptions();
    },
    [flushCaptions],
  );

  const registerRpc = useCallback((room: Room) => {
    const local = room.localParticipant;

    const safeReturn = (ok: boolean, info?: Record<string, unknown>) =>
      JSON.stringify({ ok, ...info });

    // Identifier allowlists. The agent is trusted but the room transport isn't,
    // so we validate any string that flows into navigation or DOM lookup to
    // block javascript:, data:, external URLs, and CSS-selector injection.
    const safeIdRe = /^[a-zA-Z0-9_-]+$/;
    const safePathRe = /^\/[a-zA-Z0-9/_-]*$/;
    const isSafeId = (s: unknown): s is string =>
      typeof s === 'string' && s.length > 0 && s.length <= 128 && safeIdRe.test(s);
    const isSafePath = (s: unknown): s is string =>
      typeof s === 'string' && s.length > 0 && s.length <= 256 && safePathRe.test(s);

    // Free narration text used only to pace the scroll. Never an id and never
    // injected as HTML, so it isn't allowlisted, only length-capped and coerced.
    const asText = (s: unknown): string | undefined =>
      typeof s === 'string' && s.length > 0 ? s.slice(0, 400) : undefined;

    local.registerRpcMethod('navigateTo', async (data) => {
      try {
        const { sectionId, highlightId, text } = JSON.parse(data.payload) as {
          sectionId: unknown;
          highlightId?: unknown;
          text?: unknown;
        };
        if (!isSafeId(sectionId)) return safeReturn(false, { error: 'invalid sectionId' });
        if (highlightId != null && !isSafeId(highlightId)) {
          return safeReturn(false, { error: 'invalid highlightId' });
        }
        handlersRef.current.onNavigate(
          sectionId,
          (highlightId as string | undefined) ?? undefined,
          asText(text),
        );
        return safeReturn(true);
      } catch (e) {
        return safeReturn(false, { error: String(e) });
      }
    });

    local.registerRpcMethod('openRoute', async (data) => {
      try {
        const { path, anchor, highlightId, text } = JSON.parse(data.payload) as {
          path: unknown;
          anchor?: unknown;
          highlightId?: unknown;
          text?: unknown;
        };
        if (!isSafePath(path)) return safeReturn(false, { error: 'invalid path' });
        if (anchor != null && !isSafeId(anchor)) {
          return safeReturn(false, { error: 'invalid anchor' });
        }
        if (highlightId != null && !isSafeId(highlightId)) {
          return safeReturn(false, { error: 'invalid highlightId' });
        }
        handlersRef.current.onOpenRoute(
          path,
          (anchor as string | undefined) ?? undefined,
          (highlightId as string | undefined) ?? undefined,
          asText(text),
        );
        return safeReturn(true);
      } catch (e) {
        return safeReturn(false, { error: String(e) });
      }
    });

    local.registerRpcMethod('openContactForm', async (data) => {
      try {
        const { intent, prefill } = JSON.parse(data.payload || '{}') as {
          intent?: string;
          prefill?: Record<string, string>;
        };
        handlersRef.current.onOpenContactForm(intent, prefill);
        return safeReturn(true);
      } catch (e) {
        return safeReturn(false, { error: String(e) });
      }
    });

    // Live field patches for the open contact form (voice-driven fill).
    local.registerRpcMethod('prefillContactForm', async (data) => {
      try {
        const fields = JSON.parse(data.payload || '{}') as Record<string, unknown>;
        const clean: Record<string, string> = {};
        for (const key of ['intent', 'name', 'email', 'message']) {
          const v = fields[key];
          if (typeof v === 'string') clean[key] = v.slice(0, 2000);
        }
        handlersRef.current.onPrefillContactForm(clean);
        return safeReturn(true);
      } catch (e) {
        return safeReturn(false, { error: String(e) });
      }
    });

    local.registerRpcMethod('closeContactForm', async () => {
      handlersRef.current.onCloseContactForm();
      return safeReturn(true);
    });

    // Open the Cal.com booking popup (booking fallback when the live API path
    // is unavailable).
    local.registerRpcMethod('openBooking', async (data) => {
      try {
        const { intent } = JSON.parse(data.payload || '{}') as { intent?: string };
        handlersRef.current.onOpenBooking(intent);
        return safeReturn(true);
      } catch (e) {
        return safeReturn(false, { error: String(e) });
      }
    });

    local.registerRpcMethod('voiceMessageSent', async (data) => {
      try {
        const { intent, email } = JSON.parse(data.payload || '{}') as {
          intent?: string;
          email?: string;
        };
        handlersRef.current.onVoiceMessageSent({ intent, email });
        return safeReturn(true);
      } catch (e) {
        return safeReturn(false, { error: String(e) });
      }
    });

    local.registerRpcMethod('callbackRequested', async (data) => {
      try {
        const { name } = JSON.parse(data.payload || '{}') as { name?: string };
        handlersRef.current.onCallbackRequested({ name });
        return safeReturn(true);
      } catch (e) {
        return safeReturn(false, { error: String(e) });
      }
    });

    local.registerRpcMethod('wrapUpWarning', async () => {
      handlersRef.current.onWrapUpWarning();
      return safeReturn(true);
    });

    local.registerRpcMethod('downloadResume', async () => {
      handlersRef.current.onDownloadResume();
      return safeReturn(true);
    });

    local.registerRpcMethod('toggleCaptions', async (data) => {
      try {
        const { on } = JSON.parse(data.payload || '{}') as { on?: boolean };
        handlersRef.current.onToggleCaptions(on);
        return safeReturn(true);
      } catch (e) {
        return safeReturn(false, { error: String(e) });
      }
    });

    local.registerRpcMethod('bookingConfirmed', async (data) => {
      try {
        const payload = JSON.parse(data.payload) as BookingPayload;
        handlersRef.current.onBookingConfirmed(payload);
        return safeReturn(true);
      } catch (e) {
        return safeReturn(false, { error: String(e) });
      }
    });

    local.registerRpcMethod('submitFeedback', async (data) => {
      try {
        const payload = JSON.parse(data.payload) as FeedbackPayload;
        handlersRef.current.onSubmitFeedback(payload);
        return safeReturn(true);
      } catch (e) {
        return safeReturn(false, { error: String(e) });
      }
    });

    local.registerRpcMethod('endCall', async () => {
      handlersRef.current.onEndCall();
      return safeReturn(true);
    });
  }, []);

  const teardownAudio = useCallback(() => {
    audioElementsRef.current.forEach((el) => {
      el.pause();
      el.remove();
    });
    audioElementsRef.current.clear();
  }, []);

  const wireRoom = useCallback(
    (room: Room) => {
      room.on(RoomEvent.ConnectionStateChanged, (cs) => {
        if (cs === ConnectionState.Disconnected) {
          // Single point of truth for "session over": clean up tracks
          // and snap back to idle so the arc collapses to the pill.
          teardownAudio();
          setTracks({ localTrack: null, agentTrack: null });
          setMicMutedState(false);
          roomRef.current = null;
          setState('idle');
        }
      });

      room.on(RoomEvent.ParticipantConnected, (p) => {
        if (isAgent(p)) {
          setState((prev) => (prev === 'agent-joining' ? 'listening' : prev));
          p.on(ParticipantEvent.IsSpeakingChanged, (speaking) => {
            setState((prev) => {
              if (speaking) return 'agent-speaking';
              if (prev === 'agent-speaking') return 'listening';
              return prev;
            });
          });
        }
      });

      room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, pub, participant) => {
        if (track.kind === Track.Kind.Audio && isAgent(participant)) {
          // Attach to an audio element so the browser actually plays it.
          // Without this, the track is subscribed but inaudible.
          const el = track.attach();
          el.setAttribute('data-livekit-audio', 'true');
          audioElementsRef.current.set(pub.trackSid, el);
          setTracks((t) => ({ ...t, agentTrack: track as RemoteAudioTrack }));
        }
      });

      room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack, pub) => {
        if (track.kind === Track.Kind.Audio) {
          const el = audioElementsRef.current.get(pub.trackSid);
          if (el) {
            track.detach(el);
            el.remove();
            audioElementsRef.current.delete(pub.trackSid);
          }
          setTracks((t) => (t.agentTrack === track ? { ...t, agentTrack: null } : t));
        }
      });

      room.on(RoomEvent.TranscriptionReceived, (segments, participant) => {
        const from: 'user' | 'agent' =
          participant && isAgent(participant) ? 'agent' : 'user';
        for (const seg of segments) {
          upsertCaption(seg, from);
          // Drive transcript-based scroll/highlight from the agent's speech.
          if (from === 'agent' && seg.text) {
            handlersRef.current.onAgentSpeech(seg.text);
          }
        }
      });

      room.localParticipant.on(ParticipantEvent.IsSpeakingChanged, (speaking) => {
        setState((prev) => {
          if (speaking) return 'user-speaking';
          if (prev === 'user-speaking') return 'listening';
          return prev;
        });
      });
    },
    [upsertCaption],
  );

  const start = useCallback(
    async (textOnly = false) => {
      if (roomRef.current) return;
      setErrorMessage(null);
      setState('connecting');
      captionsRef.current = [];
      activePartialRef.current = { user: null, agent: null };
      setCaptions([]);

      try {
        const res = await fetch('/api/voice/token', { method: 'POST' });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error || `Token request failed (${res.status})`);
        }
        const { token, url } = (await res.json()) as { token: string; url: string };

        const room = new Room({
          adaptiveStream: true,
          dynacast: true,
        });
        roomRef.current = room;
        wireRoom(room);
        registerRpc(room);

        await room.connect(url, token, { autoSubscribe: true });

        if (!textOnly) {
          try {
            await room.localParticipant.setMicrophoneEnabled(true);
            const pub = room.localParticipant.getTrackPublication(Track.Source.Microphone);
            if (pub?.audioTrack) {
              setTracks((t) => ({ ...t, localTrack: pub.audioTrack as LocalAudioTrack }));
            }
          } catch {
            // Mic permission denied or unavailable. Caller falls back to text mode.
            setErrorMessage('Mic unavailable. Switched to text.');
          }
        }

        setState('agent-joining');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Could not start voice tour.';
        setErrorMessage(message);
        setState('error');
        roomRef.current?.disconnect();
        roomRef.current = null;
      }
    },
    [registerRpc, wireRoom],
  );

  const end = useCallback(async () => {
    const room = roomRef.current;
    if (!room) {
      // Already disconnected (e.g. unexpected drop). Snap UI to idle.
      setState('idle');
      return;
    }
    // Snap UI to idle immediately so the arc collapses without waiting
    // for the disconnect round-trip. The ConnectionStateChanged listener
    // does final cleanup once the room actually disconnects.
    teardownAudio();
    setTracks({ localTrack: null, agentTrack: null });
    setMicMutedState(false);
    setState('idle');
    try {
      await room.disconnect();
    } catch {
      // Ignore: state is already idle, listener will tidy what it can.
    }
    roomRef.current = null;
  }, [teardownAudio]);

  const setMicMuted = useCallback(async (muted: boolean) => {
    const room = roomRef.current;
    if (!room) return;
    await room.localParticipant.setMicrophoneEnabled(!muted);
    setMicMutedState(muted);
  }, []);

  const sendText = useCallback(
    async (text: string) => {
      const room = roomRef.current;
      if (!room) {
        console.warn('[voice] sendText skipped: room not connected');
        return;
      }
      // Text streams bypass STT, so we never receive a TranscriptionReceived
      // event for the user's own typed message. Inject it as a final caption
      // line locally so the rail shows what they sent.
      captionsRef.current.push({
        id: `local-text-${Date.now()}`,
        from: 'user',
        text,
        partial: false,
      });
      activePartialRef.current.user = null;
      flushCaptions();
      try {
        // LiveKit Agents listen on the `lk.chat` text-stream topic by default
        // and treat each message as a user turn (interrupts and generates reply).
        await room.localParticipant.sendText(text, { topic: 'lk.chat' });
      } catch (err) {
        console.error('[voice] sendText failed', err);
      }
    },
    [flushCaptions],
  );

  useEffect(() => {
    return () => {
      roomRef.current?.disconnect();
      roomRef.current = null;
    };
  }, []);

  return {
    state,
    captions,
    tracks,
    micMuted,
    start,
    end,
    setMicMuted,
    sendText,
    errorMessage,
  };
}
