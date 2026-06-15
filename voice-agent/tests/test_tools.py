"""Root-agent tools, invoked directly (no LLM) so the logic is tested
deterministically: narration validation, silent lead capture, callback, wrap-up,
and the simple one-shot RPCs."""

import datetime
import types
from zoneinfo import ZoneInfo

import pytest

import root_agent
from cal_client import AvailableSlot, BookingResult, SlotUnavailableError
from kb import load_kb
from lead import Userdata
from notify import Notifier

IST = ZoneInfo("Asia/Kolkata")


class FakeCal:
    def __init__(self, *, raise_once=False):
        self.slots = [
            AvailableSlot(datetime.datetime(2026, 6, 13, 11, 0, tzinfo=IST), 30),
            AvailableSlot(datetime.datetime(2026, 6, 15, 14, 30, tzinfo=IST), 30),
        ]
        self.booked = None
        self._raise_once = raise_once

    async def list_slots(self, intent, **kwargs):
        return self.slots

    async def create_booking(self, intent, slot, *, name, email, notes=None, **kwargs):
        if self._raise_once:
            self._raise_once = False
            raise SlotUnavailableError("taken")
        self.booked = {
            "intent": intent,
            "slot": slot,
            "name": name,
            "email": email,
            **kwargs,
        }
        return BookingResult(slot.start_iso, "Project / hire call with Neeraj", email)


@pytest.fixture
def kb():
    return load_kb()


@pytest.fixture
def agent(kb):
    return root_agent.NeerajAgent(kb)


@pytest.fixture
def rpc_calls(monkeypatch):
    calls: list[tuple[str, dict]] = []

    async def fake(method, payload=None):
        calls.append((method, payload or {}))
        return {"ok": True}

    def fake_fire(method, payload=None):
        calls.append((method, payload or {}))

    monkeypatch.setattr(root_agent, "perform_rpc", fake)
    monkeypatch.setattr(root_agent, "fire_rpc", fake_fire)
    monkeypatch.setattr(root_agent, "room_name", lambda: "room-test")
    return calls


def make_ctx(kb, notifier=None, cal=None):
    ud = Userdata(
        kb=kb,
        notifier=notifier or Notifier(api_key=None, from_addr=None, to_addr=None),
        cal=cal,
    )
    return types.SimpleNamespace(userdata=ud), ud


async def test_no_navigate_tool(agent):
    # In-page scroll/highlight is transcript-driven on the frontend, so the agent
    # must NOT expose a navigate_to tool (it would re-introduce tool latency).
    assert not hasattr(agent, "navigate_to")


async def test_open_route_validates(agent, kb, rpc_calls):
    ctx, _ = make_ctx(kb)
    await agent.open_route(ctx, "/case-studies/enterprise-voice-ai")
    assert rpc_calls[-1][0] == "openRoute"
    # Unknown route fires no RPC.
    before = len(rpc_calls)
    await agent.open_route(ctx, "/evil/path")
    assert len(rpc_calls) == before


async def test_update_lead_accumulates(agent, kb):
    ctx, ud = make_ctx(kb)
    await agent.update_lead(
        ctx,
        name="Jane",
        email="jane@acme.com",
        qualification="hot",
        wants="voice agent",
    )
    assert ud.lead.name == "Jane"
    assert ud.lead.qualification == "hot"
    assert ud.lead.wants == "voice agent"


async def test_wrap_up_warning(agent, kb, rpc_calls):
    ctx, ud = make_ctx(kb)
    await agent.wrap_up_warning(ctx)
    assert ud.wrap_up_warned is True
    assert rpc_calls[-1][0] == "wrapUpWarning"


async def test_request_callback_email(agent, kb, rpc_calls):
    seen = {}

    class FakeNotifier:
        async def send_callback(self, **kwargs):
            seen.update(kwargs)
            return "email"

    ctx, ud = make_ctx(kb, notifier=FakeNotifier())
    await agent.request_callback(ctx, "Jane", "+91 98765 43210", "urgent project")
    assert ud.lead.outcome == "callback_requested"
    assert ud.lead.qualification == "hot"
    # Number is normalized to E.164 (spaces stripped, single leading +).
    assert seen["phone"] == "+919876543210"
    assert ud.lead.phone == "+919876543210"
    assert "callbackRequested" in [c[0] for c in rpc_calls]


async def test_request_callback_rejects_number_without_country_code(
    agent, kb, rpc_calls
):
    sent = {"n": 0}

    class FakeNotifier:
        async def send_callback(self, **kwargs):
            sent["n"] += 1
            return "email"

    ctx, ud = make_ctx(kb, notifier=FakeNotifier())
    # A bare 10-digit local number has no country code -> not callable, rejected.
    result = await agent.request_callback(ctx, "Jane", "9876543210", "call me")
    assert sent["n"] == 0
    assert ud.lead.outcome != "callback_requested"
    assert "callbackRequested" not in [c[0] for c in rpc_calls]
    assert "country code" in result.lower()


async def test_request_callback_degrades_to_form(agent, kb, rpc_calls):
    class FakeNotifier:
        async def send_callback(self, **kwargs):
            return "none"

    ctx, _ = make_ctx(kb, notifier=FakeNotifier())
    await agent.request_callback(ctx, "Jane", "+919876543210", "x")
    assert "openContactForm" in [c[0] for c in rpc_calls]


def test_normalize_phone():
    from root_agent import _normalize_phone

    # Full international numbers normalize to "+<digits>".
    assert _normalize_phone("+91 98765 43210") == "+919876543210"
    assert _normalize_phone("+1 (415) 555-2671") == "+14155552671"
    # Missing country code (bare local number) -> None.
    assert _normalize_phone("9876543210") is None
    assert _normalize_phone("") is None
    assert _normalize_phone(None) is None
    # Too short / too long -> None.
    assert _normalize_phone("+12") is None
    assert _normalize_phone("+1234567890123456") is None


def test_valid_email():
    from root_agent import _valid_email

    assert _valid_email("jane@acme.com") is True
    assert _valid_email("  jane.doe@sub.acme.co.uk  ") is True
    assert _valid_email("jane@acme") is False
    assert _valid_email("jane at acme dot com") is False
    assert _valid_email("") is False
    assert _valid_email(None) is False


async def test_send_contact_requires_valid_email(agent, kb, rpc_calls):
    sent = {"n": 0}

    class FakeNotifier:
        async def send_contact(self, **kwargs):
            sent["n"] += 1
            return True

    ctx, ud = make_ctx(kb, notifier=FakeNotifier())
    result = await agent.send_contact_message(ctx, "Jane", "jane at acme", "Hi", "hire")
    assert sent["n"] == 0  # never sent with a mangled email
    assert ud.lead.outcome != "sent_message"
    assert "voiceMessageSent" not in [c[0] for c in rpc_calls]
    assert "email" in result.lower()


async def test_offer_and_book(agent, kb, rpc_calls):
    cal = FakeCal()
    ctx, ud = make_ctx(kb, cal=cal)
    offer = await agent.offer_booking_times(ctx, "hire")
    assert ud.booking_intent == "hire"
    assert ud.booking_slots, "slots should be stored for booking"
    slot_id = next(iter(ud.booking_slots))
    # The offer hands the LLM the code:time catalog.
    assert slot_id in offer

    await agent.book_slot(ctx, slot_id, "Jane Doe", "jane@acme.com")
    assert cal.booked is not None
    assert cal.booked["email"] == "jane@acme.com"
    assert ud.lead.outcome == "booked_call"
    assert "bookingConfirmed" in [c[0] for c in rpc_calls]


async def test_book_unavailable_relists(agent, kb, rpc_calls):
    cal = FakeCal(raise_once=True)
    ctx, ud = make_ctx(kb, cal=cal)
    await agent.offer_booking_times(ctx, "hire")
    slot_id = next(iter(ud.booking_slots))
    result = await agent.book_slot(ctx, slot_id, "Jane", "jane@acme.com")
    # First attempt hits SlotUnavailable -> re-offers, does not confirm.
    assert cal.booked is None
    assert "bookingConfirmed" not in [c[0] for c in rpc_calls]
    assert "taken" in result.lower()


async def test_book_slot_requires_name_and_email(agent, kb, rpc_calls):
    cal = FakeCal()
    ctx, ud = make_ctx(kb, cal=cal)
    await agent.offer_booking_times(ctx, "hire")
    slot_id = next(iter(ud.booking_slots))
    # Empty contact info must NOT reach Cal (which 400s); ask for it instead.
    result = await agent.book_slot(ctx, slot_id, "", "")
    assert cal.booked is None
    assert "bookingConfirmed" not in [c[0] for c in rpc_calls]
    assert "name" in result.lower() or "email" in result.lower()


async def test_book_slot_falls_back_to_captured_lead(agent, kb, rpc_calls):
    cal = FakeCal()
    ctx, ud = make_ctx(kb, cal=cal)
    ud.lead.update(name="Jane Doe", email="jane@acme.com")
    await agent.offer_booking_times(ctx, "hire")
    slot_id = next(iter(ud.booking_slots))
    # Empty args, but name/email were captured earlier -> use them and book.
    await agent.book_slot(ctx, slot_id, "", "")
    assert cal.booked is not None
    assert cal.booked["email"] == "jane@acme.com"


def test_tts_amplify_boosts_and_clips():
    import numpy as np
    from livekit import rtc

    from root_agent import _TTS_GAIN, _amplify

    s = np.array([0, 100, -100, 25000, -25000], dtype=np.int16)
    frame = rtc.AudioFrame(
        data=s.tobytes(), sample_rate=24000, num_channels=1, samples_per_channel=len(s)
    )
    out = np.frombuffer(_amplify(frame).data, dtype=np.int16)
    assert out[1] == int(100 * _TTS_GAIN)  # boosted
    assert out[3] == 32767  # 25000 * 1.7 clipped to int16 max
    assert out[4] == -32768  # clipped to int16 min


async def test_offer_degrades_without_cal(agent, kb, rpc_calls):
    ctx, _ = make_ctx(kb, cal=None)
    await agent.offer_booking_times(ctx, "mentor")
    assert "openBooking" in [c[0] for c in rpc_calls]


async def test_send_contact_message(agent, kb, rpc_calls):
    class FakeNotifier:
        def __init__(self):
            self.sent = None

        async def send_contact(self, *, name, email, intent, message):
            self.sent = {
                "name": name,
                "email": email,
                "intent": intent,
                "message": message,
            }
            return True

    notifier = FakeNotifier()
    ctx, ud = make_ctx(kb, notifier=notifier)
    await agent.prefill_contact(ctx, name="Jane", email="jane@acme.com")
    assert "prefillContactForm" in [c[0] for c in rpc_calls]
    await agent.send_contact_message(
        ctx, "Jane", "jane@acme.com", "Hello there", "hire"
    )
    assert notifier.sent["email"] == "jane@acme.com"
    assert ud.lead.outcome == "sent_message"
    assert "voiceMessageSent" in [c[0] for c in rpc_calls]


async def test_send_contact_degrades_on_failure(agent, kb, rpc_calls):
    class FakeNotifier:
        async def send_contact(self, **kwargs):
            return False

    ctx, _ = make_ctx(kb, notifier=FakeNotifier())
    await agent.send_contact_message(ctx, "Jane", "jane@acme.com", "Hi", "other")
    methods = [c[0] for c in rpc_calls]
    assert "openContactForm" in methods  # falls back to leaving the form open


async def test_simple_rpc_tools(agent, kb, rpc_calls):
    ctx, _ = make_ctx(kb)
    await agent.end_call(ctx)
    assert rpc_calls[-1][0] == "endCall"
    await agent.download_resume(ctx)
    assert rpc_calls[-1][0] == "downloadResume"
    await agent.toggle_captions(ctx, on=False)
    assert rpc_calls[-1] == ("toggleCaptions", {"on": False})
    await agent.submit_feedback(ctx, "great", "loved it")
    assert rpc_calls[-1][0] == "submitFeedback"
    await agent.submit_feedback(ctx, "weird-rating")
    assert rpc_calls[-1][1]["rating"] == "okay"  # normalized
