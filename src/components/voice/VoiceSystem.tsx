'use client';

import { AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { openContactModal } from '@/lib/contact-modal-event';
import {
  CLOSE_VOICE_ARC_EVENT,
  OPEN_VOICE_ARC_EVENT,
} from '@/lib/voice-event';
import type { BookingPayload, FeedbackPayload } from './state';
import { useVoiceSession } from './useVoiceSession';
import { VoiceArc } from './VoiceArc';
import { VoicePill } from './VoicePill';

const HIGHLIGHT_DATA_ATTR = 'data-voice-highlight-active';
const HIGHLIGHT_DURATION_MS = 1500;

interface PendingScroll {
  path: string;
  anchor?: string;
  highlightId?: string;
}

function highlight(el: Element) {
  el.setAttribute(HIGHLIGHT_DATA_ATTR, 'true');
  window.setTimeout(() => el.removeAttribute(HIGHLIGHT_DATA_ATTR), HIGHLIGHT_DURATION_MS);
}

function scrollAndHighlight(anchor: string, highlightId?: string) {
  const target = document.getElementById(anchor);
  if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (highlightId) {
    const sub = document.querySelector(`[data-highlight-id="${highlightId}"]`);
    if (sub) {
      sub.scrollIntoView({ behavior: 'smooth', block: 'center' });
      highlight(sub);
    }
  } else if (target) {
    highlight(target);
  }
}

export function VoiceSystem() {
  const router = useRouter();
  const pathname = usePathname();

  const [bookingPayload, setBookingPayload] = useState<BookingPayload | null>(null);
  const [feedbackPayload, setFeedbackPayload] = useState<FeedbackPayload | null>(null);
  const [captionsVisible, setCaptionsVisible] = useState(true);
  const [textMode, setTextMode] = useState(false);
  const [initialPulse, setInitialPulse] = useState(true);

  const pendingScrollRef = useRef<PendingScroll | null>(null);
  // End-of-call handler is wired after the hook is constructed; use a ref so
  // the RPC method registered at room-connect time can call into the latest closure.
  const endRef = useRef<() => void>(() => {});

  const onNavigate = useCallback(
    (sectionId: string, highlightId?: string) => {
      if (pathname !== '/') {
        pendingScrollRef.current = { path: '/', anchor: sectionId, highlightId };
        router.push('/');
        return;
      }
      scrollAndHighlight(sectionId, highlightId);
    },
    [router, pathname],
  );

  const onOpenRoute = useCallback(
    (path: string, anchor?: string, highlightId?: string) => {
      if (path === pathname) {
        if (anchor) scrollAndHighlight(anchor, highlightId);
        return;
      }
      pendingScrollRef.current = { path, anchor, highlightId };
      router.push(path);
    },
    [router, pathname],
  );

  const onOpenContactForm = useCallback(
    (intent?: string, prefill?: Record<string, string>) => {
      openContactModal({
        intent: (intent as 'hire' | 'mentorship' | 'speaking' | 'other') ?? undefined,
        prefill,
      });
    },
    [],
  );

  const onDownloadResume = useCallback(() => {
    window.open('/resume', '_blank', 'noopener');
  }, []);

  const onToggleCaptions = useCallback((on?: boolean) => {
    setCaptionsVisible((prev) => (typeof on === 'boolean' ? on : !prev));
  }, []);

  const onBookingConfirmed = useCallback((payload: BookingPayload) => {
    setBookingPayload(payload);
  }, []);

  const onSubmitFeedback = useCallback((payload: FeedbackPayload) => {
    setFeedbackPayload(payload);
  }, []);

  const session = useVoiceSession({
    onNavigate,
    onOpenRoute,
    onOpenContactForm,
    onDownloadResume,
    onToggleCaptions,
    onBookingConfirmed,
    onSubmitFeedback,
    onEndCall: () => endRef.current(),
  });

  // Keep endRef pointed at the latest end function so the RPC method
  // registered at room-connect time always invokes the current closure.
  useEffect(() => {
    endRef.current = () => {
      void session.end();
      setBookingPayload(null);
      setFeedbackPayload(null);
    };
  }, [session]);

  // Auto-collapse the thank-you panel after a read window.
  useEffect(() => {
    if (!feedbackPayload) return;
    const t = window.setTimeout(() => {
      endRef.current();
    }, 6000);
    return () => window.clearTimeout(t);
    // endRef is stable; feedbackPayload toggle drives this.
  }, [feedbackPayload]);

  // Open / close event subscriptions.
  useEffect(() => {
    const open = () => {
      void session.start(textMode);
      setInitialPulse(false);
    };
    const close = () => {
      endRef.current();
    };
    window.addEventListener(OPEN_VOICE_ARC_EVENT, open);
    window.addEventListener(CLOSE_VOICE_ARC_EVENT, close);
    return () => {
      window.removeEventListener(OPEN_VOICE_ARC_EVENT, open);
      window.removeEventListener(CLOSE_VOICE_ARC_EVENT, close);
    };
  }, [session, textMode]);

  // Drain any pending scroll after a route mount.
  useEffect(() => {
    const pending = pendingScrollRef.current;
    if (!pending || pending.path !== pathname) return;
    pendingScrollRef.current = null;
    const t = window.setTimeout(() => {
      if (pending.anchor) scrollAndHighlight(pending.anchor, pending.highlightId);
    }, 200);
    return () => window.clearTimeout(t);
  }, [pathname]);

  // Drop the initial-pulse class after the animation has played once.
  useEffect(() => {
    if (!initialPulse) return;
    const t = window.setTimeout(() => setInitialPulse(false), 2400);
    return () => window.clearTimeout(t);
  }, [initialPulse]);

  // Global "press / to talk" shortcut. Ignore the key while a field is
  // focused or any modifier is held, so we don't break form typing or
  // browser search.
  const sessionStateRef = useRef(session.state);
  useEffect(() => {
    sessionStateRef.current = session.state;
  }, [session.state]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target?.matches('input, textarea, select, [contenteditable="true"]')
      ) {
        return;
      }
      if (sessionStateRef.current !== 'idle') return;
      e.preventDefault();
      void session.start(textMode);
      setInitialPulse(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [session, textMode]);

  const uiState =
    feedbackPayload != null
      ? 'thank-you'
      : bookingPayload != null
        ? 'booking-confirmed'
        : session.state;

  const isArcOpen = uiState !== 'idle';

  return (
    <AnimatePresence mode="wait">
      {!isArcOpen ? (
        <VoicePill
          key="pill"
          onClick={() => {
            void session.start(textMode);
            setInitialPulse(false);
          }}
          initialPulse={initialPulse}
        />
      ) : (
        <VoiceArc
          key="arc"
          state={uiState}
          tracks={session.tracks}
          captions={session.captions}
          captionsVisible={captionsVisible}
          micMuted={session.micMuted}
          textMode={textMode}
          errorMessage={session.errorMessage}
          bookingPayload={bookingPayload}
          feedbackPayload={feedbackPayload}
          onToggleMic={() => void session.setMicMuted(!session.micMuted)}
          onToggleCaptions={() => setCaptionsVisible((v) => !v)}
          onToggleTextMode={() => {
            setTextMode((v) => {
              const next = !v;
              // When entering text mode, mute the mic so the agent isn't
              // listening to ambient audio while the user types.
              void session.setMicMuted(next);
              return next;
            });
          }}
          onSendText={(text) => void session.sendText(text)}
          onEnd={() => endRef.current()}
          onDoneBooking={() => setBookingPayload(null)}
          onCloseThanks={() => endRef.current()}
        />
      )}
    </AnimatePresence>
  );
}
