"""In-session lead state + the session Userdata container.

The agent accumulates a Lead as the conversation reveals it (via the update_lead
tool and the booking / contact / callback flows), and flushes it once at the end
of the call through the Notifier.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from livekit.agents import BackgroundAudioPlayer

    from cal_client import CalClient
    from kb import KB
    from notify import Notifier

# Allowed enums, kept loose (LLM-supplied) but normalized on write.
INTENTS = {"hire", "mentor", "mentorship", "speaking", "other"}
QUALIFICATIONS = {"hot", "warm", "cold"}
OUTCOMES = {
    "booked_call",
    "sent_message",
    "callback_requested",
    "browsing",
    "none",
}


@dataclass
class Lead:
    name: str | None = None
    email: str | None = None
    company: str | None = None
    phone: str | None = None
    intent: str | None = None
    wants: str | None = None
    qualification: str | None = None
    outcome: str | None = None

    def update(self, **fields: str | None) -> None:
        for key, value in fields.items():
            if value is None or not hasattr(self, key):
                continue
            cleaned = value.strip()
            if not cleaned:
                continue
            setattr(self, key, cleaned)

    def is_actionable(self) -> bool:
        """Worth telling Neeraj about: real contact info, or a concrete outcome."""
        has_contact = bool(self.email or self.phone)
        has_outcome = self.outcome in {
            "booked_call",
            "sent_message",
            "callback_requested",
        }
        return has_contact or has_outcome

    def as_row(self) -> list[str]:
        """Flat lead columns for the Google Sheet session-log row."""
        return [
            self.name or "",
            self.email or "",
            self.phone or "",
            self.company or "",
            self.intent or "",
            self.qualification or "",
            self.outcome or "",
            self.wants or "",
        ]


@dataclass
class Userdata:
    kb: KB
    notifier: Notifier
    cal: CalClient | None = None
    lead: Lead = field(default_factory=Lead)
    # Transient booking state: the open slots last offered, keyed by their code,
    # plus the intent being booked. Set by offer_booking_times, read by book_slot.
    booking_intent: str | None = None
    booking_slots: dict = field(default_factory=dict)
    # Conversation-management counters / flags.
    wrap_up_warned: bool = False
    unproductive_turns: int = 0
    lead_flushed: bool = False
    # LiveKit background-audio player, for the typing sound during form fill.
    background: BackgroundAudioPlayer | None = None
