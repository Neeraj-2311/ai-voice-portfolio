"""Root agent: the first-person Neeraj that runs the whole tour.

Conversation drivers (narration, lead capture, booking, contact message,
callback, wrap-up) are flat tools backed by transient state in Userdata. Booking
and contact are multi-turn but kept as plain tools (not awaited sub-tasks) so the
flow is robust across turns and fully testable.
"""

from __future__ import annotations

import asyncio
import logging
import re

import numpy as np
from livekit import rtc
from livekit.agents import (
    Agent,
    AudioConfig,
    BuiltinAudioClip,
    RunContext,
    function_tool,
)
from livekit.agents.llm import ChatContext, ChatMessage

from booking import format_slots, speak_when
from cal_client import SlotUnavailableError
from kb import KB, build_system_prompt
from lead import Userdata
from rpc import fire_rpc, perform_rpc, room_name

logger = logging.getLogger("neeraj-agent.root")

_TEXT_CAP = 400

# Conversion nudging: after this many user turns with no outcome yet, start
# steering toward an action (book / message / callback) so the conversation
# does not drift forever on a public site.
_NUDGE_AFTER_TURNS = 3
_CONVERTED = ("booked_call", "sent_message", "callback_requested")


def _conversion_nudge(firm: bool) -> str:
    if firm:
        return (
            "[internal directive, never mention or read aloud] Time to convert. They have explored a "
            "while with no next step. End THIS reply with a concrete offer that fits them, set up a "
            "quick thirty-minute call with Neeraj, take a written message, or a callback, or, if they "
            "are clearly just browsing, warmly start wrapping up. Be specific; do not just offer to "
            "explain more or keep answering open-endedly."
        )
    return (
        "[internal directive, never mention or read aloud] You still do not know what this visitor "
        "wants. End THIS reply by directly asking what they are here to do, hiring, scoping a project, "
        "after mentorship, or just exploring. Do NOT offer to explain more this turn; ask that one "
        "short, warm question instead."
    )


_TYPING = [
    AudioConfig(BuiltinAudioClip.KEYBOARD_TYPING, volume=0.7),
    AudioConfig(BuiltinAudioClip.KEYBOARD_TYPING2, volume=0.6),
]

# OpenAI TTS has no volume control and reads a touch quiet, so we amplify the
# synthesized audio. >1 is louder; clipped to int16 so peaks don't wrap.
_TTS_GAIN = 1.7


def _amplify(frame: rtc.AudioFrame) -> rtc.AudioFrame:
    samples = np.frombuffer(frame.data, dtype=np.int16).astype(np.float32) * _TTS_GAIN
    np.clip(samples, -32768, 32767, out=samples)
    return rtc.AudioFrame(
        data=samples.astype(np.int16).tobytes(),
        sample_rate=frame.sample_rate,
        num_channels=frame.num_channels,
        samples_per_channel=frame.samples_per_channel,
    )


_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _valid_email(email: str | None) -> bool:
    return bool(email and _EMAIL_RE.match(email.strip()))


def _normalize_phone(phone: str | None) -> str | None:
    """E.164-style number with a country code, or None if it looks incomplete.
    A bare local number (<= 10 digits, no leading +) is treated as missing its
    country code, since it isn't callable internationally."""
    cleaned = re.sub(r"[^\d+]", "", phone or "")
    has_plus = cleaned.startswith("+")
    digits = cleaned.lstrip("+")
    if not digits.isdigit() or not (8 <= len(digits) <= 15):
        return None
    if not has_plus and len(digits) <= 10:
        return None
    return "+" + digits


class NeerajAgent(Agent):
    def __init__(self, kb: KB) -> None:
        self._kb = kb
        self._user_turns = 0
        self._typing_handle = None
        # No llm here: the agent and its tasks inherit the session-level LLM
        # wired in agent.py, so a single model serves the whole conversation.
        super().__init__(instructions=build_system_prompt(kb))

    async def tts_node(self, text, model_settings):
        """Boost the synthesized voice volume (OpenAI TTS has no volume param)."""
        async for frame in Agent.default.tts_node(self, text, model_settings):
            yield _amplify(frame)

    def _play_typing(self, ud: Userdata) -> None:
        """Play the LiveKit typing clip while the contact form fills, so the gap
        before the next words isn't dead air. Best-effort; never blocks."""
        bg = ud.background
        if bg is None:
            return
        try:
            if self._typing_handle is not None:
                self._typing_handle.stop()
            self._typing_handle = bg.play(_TYPING)
        except Exception:
            logger.debug("typing_sound_skipped")

    async def on_user_turn_completed(
        self, turn_ctx: ChatContext, new_message: ChatMessage
    ) -> None:
        """Just-in-time conversion nudge. Injects ephemeral guidance for this
        reply only when the chat has run a few turns without an outcome. Additive
        and isolated: it never blocks or alters the user's message or the tools."""
        await super().on_user_turn_completed(turn_ctx, new_message)
        self._user_turns += 1
        ud = getattr(getattr(self, "session", None), "userdata", None)
        if not isinstance(ud, Userdata) or ud.lead.outcome in _CONVERTED:
            return
        # Nudge on turns 3, 5, 7, ... (every other turn past the threshold).
        if self._user_turns < _NUDGE_AFTER_TURNS or self._user_turns % 2 == 0:
            return
        # Turn 3: ask their intent. Turn 5+: make a concrete offer (or wrap up).
        turn_ctx.add_message(
            role="system",
            content=_conversion_nudge(firm=self._user_turns >= _NUDGE_AFTER_TURNS + 2),
        )

    # --- Navigation --------------------------------------------------------------
    # In-page scroll + highlight is driven on the FRONTEND from the agent's own
    # speech transcript (zero latency, no tool, never blocks talking). The agent
    # only has open_route, for explicitly opening a different PAGE.

    @function_tool()
    async def open_route(
        self,
        context: RunContext,
        path: str,
        anchor: str | None = None,
        highlight_id: str | None = None,
        text: str | None = None,
    ) -> str:
        """Soft-navigate to a different page (e.g. a case study) as you talk about it.

        Args:
            path: route path, e.g. "/case-studies/enterprise-voice-ai".
            anchor: optional section id to scroll to after the page mounts.
            highlight_id: optional block to spotlight.
            text: the sentence you are about to say, for slow-scroll pacing.
        """
        kb: KB = context.userdata.kb
        if not kb.validate_route(path):
            return "unknown route, pick one from the list"
        hid = highlight_id if kb.validate_highlight_id(highlight_id) else None
        fire_rpc(
            "openRoute",
            {
                "path": path,
                "anchor": anchor,
                "highlightId": hid,
                "text": (text or "")[:_TEXT_CAP],
            },
        )
        return "shown"

    # --- Silent lead capture ---------------------------------------------------

    @function_tool()
    async def update_lead(
        self,
        context: RunContext,
        name: str | None = None,
        email: str | None = None,
        company: str | None = None,
        phone: str | None = None,
        intent: str | None = None,
        wants: str | None = None,
        qualification: str | None = None,
    ) -> str:
        """Silently record what you have learned about the visitor. Has no visible effect;
        never ask for details just to fill these in.

        Args:
            name: their name.
            email: their email.
            company: their company or team.
            phone: their phone number.
            intent: hire, mentor, speaking, or other.
            wants: a short note on what they are after.
            qualification: how serious they seem: hot, warm, or cold.
        """
        context.userdata.lead.update(
            name=name,
            email=email,
            company=company,
            phone=phone,
            intent=intent,
            wants=wants,
            qualification=qualification,
        )
        return "noted"

    # --- Booking (real Cal.com) ------------------------------------------------

    @function_tool()
    async def offer_booking_times(self, context: RunContext, intent: str) -> str:
        """Fetch Neeraj's real open times and offer them. Use for genuine hire interest
        (intent "hire") or a mentorship request (intent "mentor"). After they pick one and
        give their name and email, call book_slot.

        Args:
            intent: "hire" for project / hiring interest, "mentor" for a mentorship call.
        """
        ud: Userdata = context.userdata
        norm = "mentor" if intent in ("mentor", "mentorship") else "hire"
        ud.booking_intent = norm
        if ud.cal is None:
            await perform_rpc("openBooking", {"intent": norm})
            return "The live calendar is unavailable; tell them you've opened the booking calendar on screen."
        try:
            slots = await ud.cal.list_slots(norm)
        except Exception:
            logger.exception("booking.list_slots_failed intent=%s", norm)
            await perform_rpc("openBooking", {"intent": norm})
            return "Could not reach the calendar; tell them you've opened it on screen to pick a time."
        if not slots:
            await perform_rpc("openBooking", {"intent": norm})
            return "No open times came back; tell them you've opened the calendar on screen."
        ud.booking_slots = {s.slot_id: s for s in slots}
        return (
            "Offer the first two or three of these times naturally and ask which works. Never say the "
            "codes aloud. When they pick one and give name + email, call book_slot with that code. "
            "Times (code: time) -> " + format_slots(slots)
        )

    @function_tool()
    async def book_slot(
        self,
        context: RunContext,
        slot_id: str,
        name: str,
        email: str,
        note: str | None = None,
    ) -> str:
        """Create the booking after the visitor picks a listed time AND has given their name and
        email. Do NOT call this with empty name or email, ask for whatever is missing first.

        Args:
            slot_id: the code of the time they chose (from offer_booking_times).
            name: their full name (required, never empty).
            email: their confirmed email (required, never empty).
            note: optional one line on what they want to build or discuss, if it came up.
        """
        ud: Userdata = context.userdata
        slot = ud.booking_slots.get(slot_id)
        intent = ud.booking_intent or "hire"
        if slot is None or ud.cal is None:
            return "I lost track of that time. Call offer_booking_times and re-offer the times."
        # Fall back to anything already captured, then require a real name + email
        # so we never send Cal an empty attendee (it rejects with a 400).
        name = (name or "").strip() or (ud.lead.name or "").strip()
        email = (email or "").strip() or (ud.lead.email or "").strip()
        if not name:
            return (
                "You don't have their name yet. Ask for it, then call book_slot again."
            )
        if not _valid_email(email):
            return (
                "You don't have a valid email yet. Ask for it, read it back to confirm, then call "
                "book_slot again with the same time."
            )
        building = note or ud.lead.wants
        try:
            result = await ud.cal.create_booking(
                intent,
                slot,
                name=name,
                email=email,
                notes=building or "Booked via voice tour",
                company=ud.lead.company,
                building=building,
            )
        except SlotUnavailableError:
            try:
                slots = await ud.cal.list_slots(intent)
                ud.booking_slots = {s.slot_id: s for s in slots}
                return (
                    "That time was just taken. Apologize briefly and offer these instead (never say "
                    "codes): " + format_slots(slots)
                )
            except Exception:
                await perform_rpc("openBooking", {"intent": intent})
                return "That slot was taken and the calendar is now unreachable; tell them you've opened it on screen."
        except Exception:
            logger.exception("booking.create_failed intent=%s", intent)
            await perform_rpc("openBooking", {"intent": intent})
            return "Could not complete the booking; tell them you've opened the calendar on screen."

        await perform_rpc(
            "bookingConfirmed",
            {
                "slotIso": result.start_iso,
                "eventTitle": result.event_title,
                "attendeeEmail": result.attendee_email,
                "calEventLink": result.cal_event_link,
                "addToCalendarUrl": result.add_to_calendar_url,
            },
        )
        ud.lead.update(intent=intent, outcome="booked_call", email=email, name=name)
        return (
            f"Booked {result.event_title} for {name} on {speak_when(slot.start_time)}. Warmly confirm "
            f"it is set and that a calendar invite is on the way to {email}."
        )

    # --- Contact message (voice-driven form fill + send) -----------------------

    @function_tool()
    async def prefill_contact(
        self,
        context: RunContext,
        name: str | None = None,
        email: str | None = None,
        message: str | None = None,
        intent: str | None = None,
    ) -> str:
        """While taking a written message, fill the on-screen contact form live as you learn each
        field. Call open_contact_form once first so the form is open, then call this as you go.

        Args:
            name: their name.
            email: their email.
            message: the message so far.
            intent: hire, mentorship, speaking, or other.
        """
        ud: Userdata = context.userdata
        norm = intent if intent in ("hire", "mentorship", "speaking", "other") else None
        ud.lead.update(name=name, email=email, intent=norm)
        self._play_typing(ud)
        await perform_rpc(
            "prefillContactForm",
            {
                "name": name or "",
                "email": email or "",
                "message": message or "",
                "intent": norm or "other",
            },
        )
        return "filled"

    @function_tool()
    async def send_contact_message(
        self,
        context: RunContext,
        name: str,
        email: str,
        message: str,
        intent: str = "other",
    ) -> str:
        """Send the visitor's written message to Neeraj. Call only after they confirm it.

        Args:
            name: their full name.
            email: their confirmed email.
            message: the message to send.
            intent: hire, mentorship, speaking, or other.
        """
        ud: Userdata = context.userdata
        email = (email or "").strip() or (ud.lead.email or "").strip()
        if not _valid_email(email):
            return (
                "You don't have a valid email yet. Ask for it, read it back to confirm, then call "
                "send_contact_message again."
            )
        norm = (
            intent if intent in ("hire", "mentorship", "speaking", "other") else "other"
        )
        ok = await ud.notifier.send_contact(
            name=name, email=email, intent=norm, message=message
        )
        if ok:
            ud.lead.update(name=name, email=email, intent=norm, outcome="sent_message")
            await perform_rpc("voiceMessageSent", {"intent": norm, "email": email})
            return "Tell them warmly that the message is on its way to Neeraj."
        await perform_rpc("openContactForm", {"intent": norm})
        await perform_rpc(
            "prefillContactForm",
            {"name": name, "email": email, "message": message, "intent": norm},
        )
        return "The send did not go through; tell them the form is filled on screen and they can hit send."

    @function_tool()
    async def request_callback(
        self, context: RunContext, name: str, phone: str, reason: str
    ) -> str:
        """For a hot lead who wants to talk to Neeraj right now: capture their number and ping him.

        Args:
            name: the visitor's name.
            phone: their full phone number WITH country code (e.g. +91...), confirmed digit by digit.
            reason: one line on what they want to talk about.
        """
        ud: Userdata = context.userdata
        normalized = _normalize_phone(phone)
        if normalized is None:
            return (
                "That number looks incomplete. Ask for the full number WITH the country code (for "
                "India that's plus nine one), read it back digit by digit to confirm, then call "
                "request_callback again."
            )
        ud.lead.update(
            name=name,
            phone=normalized,
            outcome="callback_requested",
            qualification="hot",
        )
        channel = await ud.notifier.send_callback(
            name=name, phone=normalized, reason=reason, room=room_name()
        )
        await perform_rpc("callbackRequested", {"name": name})
        if channel == "none":
            await perform_rpc("openContactForm", {"intent": "hire"})
            return (
                "Could not reach Neeraj's inbox, so tell them you have opened the contact form for "
                "their details instead."
            )
        return "Tell them warmly that Neeraj has been pinged and will call them back shortly."

    # --- Conversation management ----------------------------------------------

    @function_tool()
    async def wrap_up_warning(self, context: RunContext) -> str:
        """Call ONCE when the conversation is clearly going nowhere, as you give a single polite
        heads-up that you'll wrap up unless there's something specific you can help with."""
        context.userdata.wrap_up_warned = True
        await perform_rpc("wrapUpWarning", {})
        return "warned"

    @function_tool()
    async def end_call(
        self,
        context: RunContext,
        farewell: str = "Thanks so much for stopping by. Take care, and talk soon.",
    ) -> str:
        """End the call. Pass a short, warm goodbye line to say first.

        Speaks the farewell to the very end, THEN tears the call down, so the goodbye is never cut
        off. Prefer ending via the feedback step; use this for an abrupt leave or a time-waster.

        Args:
            farewell: the goodbye line to say before hanging up.
        """
        try:
            handle = context.session.say(farewell, allow_interruptions=False)
            await handle.wait_for_playout()
        except Exception:
            logger.warning("end_call.say_failed")
        # wait_for_playout returns when the agent has SENT the audio, but the
        # browser still has ~1s buffered. Hold before tearing down so the last
        # word is never clipped.
        await asyncio.sleep(1.5)
        await perform_rpc("endCall", {})
        return "ended"

    # --- Simple one-shot tools -------------------------------------------------

    @function_tool()
    async def open_contact_form(
        self, context: RunContext, intent: str | None = None
    ) -> str:
        """Open the written contact form on screen.

        Args:
            intent: hire, mentorship, speaking, or other.
        """
        fire_rpc("openContactForm", {"intent": intent})
        return "opened"

    @function_tool()
    async def close_contact_form(self, context: RunContext) -> str:
        """Close / dismiss the on-screen contact form when the visitor asks to close or hide it.
        This only closes the form; it does NOT end the call."""
        fire_rpc("closeContactForm", {})
        return "closed"

    @function_tool()
    async def download_resume(self, context: RunContext) -> str:
        """Open Neeraj's resume PDF in a new tab for the visitor."""
        await perform_rpc("downloadResume", {})
        return "opened"

    @function_tool()
    async def submit_feedback(
        self, context: RunContext, rating: str, quote: str | None = None
    ) -> str:
        """Record the visitor's reaction to the tour.

        Args:
            rating: one of "great", "good", "okay", "bad".
            quote: optional verbatim of what they said.
        """
        rating = rating if rating in ("great", "good", "okay", "bad") else "okay"
        await perform_rpc("submitFeedback", {"rating": rating, "quote": quote})
        return "captured"

    @function_tool()
    async def toggle_captions(self, context: RunContext, on: bool | None = None) -> str:
        """Show or hide the on-screen captions.

        Args:
            on: true to show, false to hide, omit to toggle.
        """
        await perform_rpc("toggleCaptions", {"on": on})
        return "toggled"
