"""Voice-friendly formatting for Cal.com slots, used by the root agent's
booking tools (offer_booking_times / book_slot)."""

from __future__ import annotations

import datetime

from cal_client import AvailableSlot


def _strip_zero(n: int) -> str:
    return str(int(n))


def speak_when(dt: datetime.datetime) -> str:
    """Voice-friendly time, e.g. 'Saturday June 13 at 11 AM'."""
    hour12 = dt.hour % 12 or 12
    minute = "" if dt.minute == 0 else f" {dt.minute:02d}"
    ampm = "AM" if dt.hour < 12 else "PM"
    return f"{dt.strftime('%A %B')} {_strip_zero(int(dt.strftime('%d')))} at {hour12}{minute} {ampm}"


def format_slots(slots: list[AvailableSlot]) -> str:
    """A 'code: time' catalog the LLM maps the visitor's choice onto."""
    return "; ".join(f"{s.slot_id}: {speak_when(s.start_time)}" for s in slots)
