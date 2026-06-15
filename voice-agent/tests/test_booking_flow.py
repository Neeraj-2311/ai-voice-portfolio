"""Behavioral test of the booking flow end to end with a fake Cal client.

Drives the agent with text using a cheap OpenAI model. Skips without OPENAI_API_KEY.
"""

import datetime
import os
from zoneinfo import ZoneInfo

import pytest
from livekit.agents import AgentSession
from livekit.plugins import openai

from cal_client import AvailableSlot, BookingResult
from kb import load_kb
from lead import Userdata
from notify import Notifier

requires_openai = pytest.mark.skipif(
    not os.getenv("OPENAI_API_KEY"),
    reason="needs OPENAI_API_KEY",
)

MODEL = "gpt-5.3-chat-latest"  # the production brain
IST = ZoneInfo("Asia/Kolkata")


class FakeCal:
    """Stands in for CalClient: two fixed slots, records the booking."""

    def __init__(self):
        self.slots = [
            AvailableSlot(datetime.datetime(2026, 6, 13, 11, 0, tzinfo=IST), 30),
            AvailableSlot(datetime.datetime(2026, 6, 15, 14, 30, tzinfo=IST), 30),
        ]
        self.booked: dict | None = None

    async def list_slots(self, intent, **kwargs):
        return self.slots

    async def create_booking(self, intent, slot, *, name, email, notes=None, **kwargs):
        self.booked = {"intent": intent, "slot": slot, "name": name, "email": email}
        return BookingResult(
            start_iso=slot.start_iso,
            event_title="Project / hire call with Neeraj",
            attendee_email=email,
        )


def _make_agent():
    from root_agent import NeerajAgent

    return NeerajAgent(load_kb())


def _fn_names(result) -> list[str]:
    names = []
    for event in result.events:
        item = getattr(event, "item", None)
        name = (
            item.get("name") if isinstance(item, dict) else getattr(item, "name", None)
        )
        if name:
            names.append(name)
    return names


@requires_openai
async def test_booking_lists_and_creates():
    cal = FakeCal()
    userdata = Userdata(
        kb=load_kb(),
        notifier=Notifier(api_key=None, from_addr=None, to_addr=None),
        cal=cal,
    )
    async with AgentSession(llm=openai.LLM(model=MODEL), userdata=userdata) as session:
        await session.start(_make_agent())

        called: list[str] = []
        r = await session.run(
            user_input="I want to hire you for a voice agent project. Please pull up your "
            "open times so I can book a call."
        )
        called += _fn_names(r)
        # The agent may qualify the project first; nudge once if so.
        if "offer_booking_times" not in called:
            r = await session.run(
                user_input="Yes, just show me the available times now."
            )
            called += _fn_names(r)
        assert "offer_booking_times" in called

        # Pick a time and give contact details. Per the prompt the agent reads the
        # email back to confirm before booking, so booking may take one more turn.
        r = await session.run(
            user_input="The first time works. I'm Jane Doe, my email is jane@acme.com."
        )
        called += _fn_names(r)
        if cal.booked is None:
            await session.run(
                user_input="Yes, that's right, jane@acme.com. Go ahead and book it."
            )

    assert cal.booked is not None, "expected a booking to be created"
    assert cal.booked["email"] == "jane@acme.com"
    assert cal.booked["intent"] == "hire"
    assert userdata.lead.outcome == "booked_call"
