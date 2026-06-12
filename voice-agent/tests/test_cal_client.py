"""Cal.com v2 client: parsing, headers, booking body, slot-taken, gate."""

import datetime
import json
from pathlib import Path
from zoneinfo import ZoneInfo

import pytest

from cal_client import (
    BOOKINGS_API_VERSION,
    SLOTS_API_VERSION,
    AvailableSlot,
    CalClient,
    SlotUnavailableError,
    cal_available,
    parse_slots,
)

FIX = Path(__file__).parent / "fixtures" / "cal_slots.json"
IST = ZoneInfo("Asia/Kolkata")


class FakeTransport:
    def __init__(self, *responses):
        self.calls: list[dict] = []
        self._responses = list(responses)

    async def __call__(self, method, url, *, headers=None, params=None, json_body=None):
        self.calls.append(
            {
                "method": method,
                "url": url,
                "headers": headers,
                "params": params,
                "json_body": json_body,
            }
        )
        return self._responses[min(len(self.calls) - 1, len(self._responses) - 1)]


def test_parse_slots_fixture():
    data = json.loads(FIX.read_text())
    slots = parse_slots(data, duration_min=30, tz=IST)
    assert slots, "fixture should yield slots"
    assert all(s.start_time.tzinfo is not None for s in slots)
    assert slots == sorted(slots, key=lambda s: s.start_time)
    ids = [s.slot_id for s in slots]
    assert len(ids) == len(set(ids)), "slot ids must be unique"


def test_parse_slots_tolerates_garbage():
    data = {
        "data": {
            "2026-06-13": [
                {"start": "not-a-date"},
                {"nope": 1},
                {"start": "2026-06-13T11:00:00+05:30"},
            ]
        }
    }
    slots = parse_slots(data, duration_min=30, tz=IST)
    assert len(slots) == 1


async def test_list_slots_headers_and_event_id():
    data = json.loads(FIX.read_text())
    t = FakeTransport((200, data))
    c = CalClient(
        "k", tz="Asia/Kolkata", event_type_ids={"hire": 111, "mentor": 222}, transport=t
    )
    slots = await c.list_slots("hire", limit=4)
    assert 0 < len(slots) <= 4
    call = t.calls[0]
    assert call["url"].endswith("/slots")
    assert call["headers"]["cal-api-version"] == SLOTS_API_VERSION
    assert call["headers"]["Authorization"] == "Bearer k"
    assert call["params"]["eventTypeId"] == 111
    assert call["params"]["timeZone"] == "Asia/Kolkata"


async def test_create_booking_body_and_headers():
    t = FakeTransport(
        (
            201,
            {
                "data": {
                    "uid": "abc",
                    "title": "Project / hire call with Neeraj",
                    "meetingUrl": "https://m",
                }
            },
        )
    )
    c = CalClient(
        "k", tz="Asia/Kolkata", event_type_ids={"hire": 111, "mentor": 222}, transport=t
    )
    slot = AvailableSlot(datetime.datetime(2026, 6, 13, 11, 0, tzinfo=IST), 30)
    res = await c.create_booking("hire", slot, name="Jane", email="jane@acme.com")
    call = t.calls[0]
    assert call["url"].endswith("/bookings")
    assert call["headers"]["cal-api-version"] == BOOKINGS_API_VERSION
    body = call["json_body"]
    assert body["eventTypeId"] == 111
    assert body["start"] == slot.start_iso
    assert body["attendee"] == {
        "name": "Jane",
        "email": "jane@acme.com",
        "timeZone": "Asia/Kolkata",
    }
    assert res.attendee_email == "jane@acme.com"
    assert res.cal_event_link == "https://m"


async def test_create_booking_slot_unavailable():
    t = FakeTransport(
        (400, {"error": {"message": "User already has booking at this time"}})
    )
    c = CalClient(
        "k", tz="Asia/Kolkata", event_type_ids={"hire": 111, "mentor": 222}, transport=t
    )
    slot = AvailableSlot(datetime.datetime(2026, 6, 13, 11, 0, tzinfo=IST), 30)
    with pytest.raises(SlotUnavailableError):
        await c.create_booking("hire", slot, name="J", email="j@x.com")


async def test_create_booking_sends_required_custom_fields():
    t = FakeTransport(
        (201, {"data": {"uid": "abc", "title": "Chat", "meetingUrl": "https://m"}})
    )
    c = CalClient(
        "k", tz="Asia/Kolkata", event_type_ids={"hire": 111, "mentor": 222}, transport=t
    )
    slot = AvailableSlot(datetime.datetime(2026, 6, 13, 11, 0, tzinfo=IST), 30)
    await c.create_booking(
        "hire",
        slot,
        name="Jane",
        email="j@x.com",
        company="Acme",
        building="a voice agent",
    )
    fields = t.calls[0]["json_body"]["bookingFieldsResponses"]
    assert fields["company-project"] == "Acme"
    assert fields["What-are-you-building"] == "a voice agent"
    assert fields["Where-did-you-find-me"] == "Other"  # safe default


async def test_mentor_booking_fields_default():
    t = FakeTransport((201, {"data": {"uid": "abc"}}))
    c = CalClient(
        "k", tz="Asia/Kolkata", event_type_ids={"hire": 111, "mentor": 222}, transport=t
    )
    slot = AvailableSlot(datetime.datetime(2026, 6, 13, 11, 0, tzinfo=IST), 30)
    await c.create_booking("mentor", slot, name="Jane", email="j@x.com")
    fields = t.calls[0]["json_body"]["bookingFieldsResponses"]
    assert fields["Your-level"] == "Early Career"
    assert fields["linkedin-or-portfolio"].startswith("http")
    assert fields["What-do-you-want-to-dig-into"]


def test_cal_available(monkeypatch):
    monkeypatch.delenv("CAL_API_KEY", raising=False)
    assert cal_available() is False
    monkeypatch.setenv("CAL_API_KEY", "x")
    assert cal_available() is True


def test_from_env_none_without_key(monkeypatch):
    monkeypatch.delenv("CAL_API_KEY", raising=False)
    assert CalClient.from_env() is None
