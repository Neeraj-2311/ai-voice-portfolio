'use client';

import { AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  closeContactModal,
  openContactModal,
  prefillContactModal,
} from '@/lib/contact-modal-event';
import { openCalPopup } from '@/lib/cal-popup';
import { useTheme } from '@/lib/theme';
import {
  cancelVoiceScroll,
  scrollElementIntoViewPaced,
} from '@/lib/voice-scroll';
import { caseStudyHomeCompany, matchNavTarget } from '@/lib/voice-nav-index';
import {
  CLOSE_VOICE_ARC_EVENT,
  OPEN_VOICE_ARC_EVENT,
} from '@/lib/voice-event';
import type {
  BookingPayload,
  CallbackPayload,
  FeedbackPayload,
  MessageSentPayload,
} from './state';
import { useVoiceSession } from './useVoiceSession';
import { VoiceArc } from './VoiceArc';
import { VoicePill } from './VoicePill';

const HIGHLIGHT_DATA_ATTR = 'data-voice-highlight-active';

interface PendingScroll {
  path: string;
  anchor?: string;
  highlightId?: string;
  text?: string;
}

export function VoiceSystem() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();

  const [bookingPayload, setBookingPayload] = useState<BookingPayload | null>(null);
  const [messageSentPayload, setMessageSentPayload] = useState<MessageSentPayload | null>(null);
  const [callbackPayload, setCallbackPayload] = useState<CallbackPayload | null>(null);
  const [feedbackPayload, setFeedbackPayload] = useState<FeedbackPayload | null>(null);
  const [captionsVisible, setCaptionsVisible] = useState(true);
  const [textMode, setTextMode] = useState(false);
  const [wrappingUp, setWrappingUp] = useState(false);
  const [initialPulse, setInitialPulse] = useState(true);

  const pendingScrollRef = useRef<PendingScroll | null>(null);
  // The element currently lit as "the agent is narrating this". Persists until
  // the agent moves to a different block or the call ends.
  const activeHighlightRef = useRef<Element | null>(null);
  // Last transcript-driven nav target + when, to avoid re-scroll thrash.
  const lastNavKeyRef = useRef<string | null>(null);
  const lastNavAtRef = useRef<number>(0);
  // When the agent deliberately opens a page (open_route), pause transcript-nav
  // briefly so it doesn't bounce back to the homepage while the page loads.
  const navSuppressedUntilRef = useRef<number>(0);
  // End-of-call handler is wired after the hook is constructed; use a ref so
  // the RPC method registered at room-connect time can call into the latest closure.
  const endRef = useRef<() => void>(() => {});

  const clearHighlight = useCallback(() => {
    if (activeHighlightRef.current) {
      activeHighlightRef.current.removeAttribute(HIGHLIGHT_DATA_ATTR);
      activeHighlightRef.current = null;
    }
  }, []);

  const setActiveHighlight = useCallback(
    (el: Element | null) => {
      if (activeHighlightRef.current === el) return;
      clearHighlight();
      if (el) {
        el.setAttribute(HIGHLIGHT_DATA_ATTR, 'true');
        activeHighlightRef.current = el;
      }
    },
    [clearHighlight],
  );

  // Slow-scroll to the block paced to the sentence the agent is speaking, and
  // keep that block lit. Only block-level ids get the spotlight; a bare section
  // navigation just scrolls and clears the previous spotlight.
  const scrollAndHighlight = useCallback(
    (anchor: string, highlightId?: string, text?: string) => {
      const section = document.getElementById(anchor);
      const sub = highlightId
        ? document.querySelector(`[data-highlight-id="${highlightId}"]`)
        : null;
      const scrollEl = sub ?? section;
      if (scrollEl) scrollElementIntoViewPaced(scrollEl, text);
      setActiveHighlight(sub);
    },
    [setActiveHighlight],
  );

  const onNavigate = useCallback(
    (sectionId: string, highlightId?: string, text?: string) => {
      if (pathname !== '/') {
        pendingScrollRef.current = { path: '/', anchor: sectionId, highlightId, text };
        router.push('/');
        return;
      }
      scrollAndHighlight(sectionId, highlightId, text);
    },
    [router, pathname, scrollAndHighlight],
  );

  const onOpenRoute = useCallback(
    (path: string, anchor?: string, highlightId?: string, text?: string) => {
      // The agent is deliberately opening a page; don't let transcript-nav fight it.
      navSuppressedUntilRef.current = Date.now() + 6000;
      if (path === pathname) {
        if (anchor) scrollAndHighlight(anchor, highlightId, text);
        return;
      }
      pendingScrollRef.current = { path, anchor, highlightId, text };
      router.push(path);
    },
    [router, pathname, scrollAndHighlight],
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

  const onPrefillContactForm = useCallback((fields: Record<string, string>) => {
    prefillContactModal(fields);
  }, []);

  const onCloseContactForm = useCallback(() => {
    closeContactModal();
  }, []);

  const onDownloadResume = useCallback(() => {
    window.open('/resume', '_blank', 'noopener');
  }, []);

  const onToggleCaptions = useCallback((on?: boolean) => {
    setCaptionsVisible((prev) => (typeof on === 'boolean' ? on : !prev));
  }, []);

  const onBookingConfirmed = useCallback((payload: BookingPayload) => {
    setBookingPayload(payload);
  }, []);

  const onOpenBooking = useCallback(
    (intent?: string) => {
      const norm = intent === 'mentor' ? 'mentor' : 'hire';
      const ok = openCalPopup(norm, theme === 'light' ? 'light' : 'dark');
      if (!ok) {
        openContactModal({ intent: norm === 'mentor' ? 'mentorship' : 'hire' });
      }
    },
    [theme],
  );

  const onVoiceMessageSent = useCallback((payload: MessageSentPayload) => {
    // Close the open contact form first: it's a top-layer dialog that would
    // otherwise cover the "message sent" card in the arc and linger on screen.
    closeContactModal();
    setMessageSentPayload(payload);
  }, []);

  const onCallbackRequested = useCallback((payload: CallbackPayload) => {
    setCallbackPayload(payload);
  }, []);

  const onWrapUpWarning = useCallback(() => {
    setWrappingUp(true);
  }, []);

  // Follow the agent's voice: as its transcript streams, go to + spotlight the
  // block it is currently talking about. No tool call, so speech never waits.
  // Works across pages: onNavigate routes back to the homepage if needed, so a
  // new topic is always brought into view even from a case-study page.
  const onAgentSpeech = useCallback(
    (text: string) => {
      if (text.length < 3) return;
      const now = Date.now();
      if (now < navSuppressedUntilRef.current) return; // just opened a page
      // On a case-study page, don't let a generic topic word (voice AI, agentic)
      // bounce the reader back home; only a clearly named block/section does.
      const onCaseStudy = pathname.match(/^\/case-studies\/(.+)$/);
      const target = matchNavTarget(text, !onCaseStudy);
      if (!target) return;
      if (onCaseStudy) {
        const slug = onCaseStudy[1];
        // Already on this card, or it just named the company the work was done
        // at (on-topic) -> stay; don't bounce to the homepage / experience.
        if (target.highlightId === `case-${slug}`) return;
        if (
          target.sectionId === 'experience' &&
          target.highlightId === caseStudyHomeCompany[slug]
        ) {
          return;
        }
      }
      const key = `${target.sectionId}:${target.highlightId ?? ''}`;
      if (key === lastNavKeyRef.current) return;
      if (now - lastNavAtRef.current < 800) return; // debounce thrash
      lastNavKeyRef.current = key;
      lastNavAtRef.current = now;
      onNavigate(target.sectionId, target.highlightId, text);
    },
    [onNavigate, pathname],
  );

  const onSubmitFeedback = useCallback((payload: FeedbackPayload) => {
    setFeedbackPayload(payload);
  }, []);

  const session = useVoiceSession({
    onNavigate,
    onOpenRoute,
    onOpenContactForm,
    onPrefillContactForm,
    onCloseContactForm,
    onDownloadResume,
    onToggleCaptions,
    onBookingConfirmed,
    onOpenBooking,
    onSubmitFeedback,
    onVoiceMessageSent,
    onCallbackRequested,
    onWrapUpWarning,
    onAgentSpeech,
    onEndCall: () => endRef.current(),
  });

  // Keep endRef pointed at the latest end function so the RPC method
  // registered at room-connect time always invokes the current closure.
  useEffect(() => {
    endRef.current = () => {
      void session.end();
      clearHighlight();
      cancelVoiceScroll();
      lastNavKeyRef.current = null;
      setBookingPayload(null);
      setMessageSentPayload(null);
      setCallbackPayload(null);
      setFeedbackPayload(null);
      setWrappingUp(false);
    };
  }, [session, clearHighlight]);

  // Auto-collapse the thank-you panel after a read window, then end the call.
  useEffect(() => {
    if (!feedbackPayload) return;
    const t = window.setTimeout(() => {
      endRef.current();
    }, 6000);
    return () => window.clearTimeout(t);
  }, [feedbackPayload]);

  // The message-sent and callback cards are mid-conversation confirmations:
  // show them briefly, then return to the live conversation (do not end).
  useEffect(() => {
    if (!messageSentPayload) return;
    const t = window.setTimeout(() => setMessageSentPayload(null), 5000);
    return () => window.clearTimeout(t);
  }, [messageSentPayload]);

  useEffect(() => {
    if (!callbackPayload) return;
    const t = window.setTimeout(() => setCallbackPayload(null), 5000);
    return () => window.clearTimeout(t);
  }, [callbackPayload]);

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
      if (pending.anchor) scrollAndHighlight(pending.anchor, pending.highlightId, pending.text);
    }, 220);
    return () => window.clearTimeout(t);
  }, [pathname, scrollAndHighlight]);

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
      : callbackPayload != null
        ? 'callback-requested'
        : messageSentPayload != null
          ? 'message-sent'
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
          wrappingUp={wrappingUp}
          errorMessage={session.errorMessage}
          bookingPayload={bookingPayload}
          messageSentPayload={messageSentPayload}
          callbackPayload={callbackPayload}
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
          onDoneMessageSent={() => setMessageSentPayload(null)}
          onDoneCallback={() => setCallbackPayload(null)}
          onCloseThanks={() => endRef.current()}
        />
      )}
    </AnimatePresence>
  );
}
