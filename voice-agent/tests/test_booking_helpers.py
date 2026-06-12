"""Pure helpers in the booking task: voice-friendly slot formatting."""

import datetime
from zoneinfo import ZoneInfo

from booking import format_slots, speak_when
from cal_client import AvailableSlot

IST = ZoneInfo("Asia/Kolkata")


def test_speak_when_morning():
    dt = datetime.datetime(2026, 6, 13, 11, 0, tzinfo=IST)
    spoken = speak_when(dt)
    assert "Saturday" in spoken
    assert "11" in spoken
    assert "AM" in spoken
    assert ":00" not in spoken  # on-the-hour reads cleanly


def test_speak_when_afternoon_with_minutes():
    dt = datetime.datetime(2026, 6, 15, 14, 30, tzinfo=IST)
    spoken = speak_when(dt)
    assert "2" in spoken
    assert "30" in spoken
    assert "PM" in spoken


def test_format_slots_includes_ids():
    slots = [
        AvailableSlot(datetime.datetime(2026, 6, 13, 11, 0, tzinfo=IST), 30),
        AvailableSlot(datetime.datetime(2026, 6, 15, 14, 30, tzinfo=IST), 30),
    ]
    out = format_slots(slots)
    for s in slots:
        assert s.slot_id in out
