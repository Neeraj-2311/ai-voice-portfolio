"""Cal.com API v2 client: list real open slots and create real bookings.

Account `hineeraj` (IST). Verified shapes:
  GET  /v2/slots    (cal-api-version 2024-09-04)
       -> {"status":"success","data": {"YYYY-MM-DD": [{"start": "...+05:30"}, ...]}}
  POST /v2/bookings (cal-api-version 2024-08-13)
       body {"start", "eventTypeId", "attendee": {"name","email","timeZone"}}

Booking and slots take a numeric eventTypeId, not a slug. Pin the two ids via
env (CAL_EVENT_TYPE_HIRE / CAL_EVENT_TYPE_MENTOR).

`transport` is injectable so unit tests stub the network. cal_available() gates
the whole feature: when CAL_API_KEY is unset the booking task degrades to the
Cal popup instead.
"""

from __future__ import annotations

import datetime
import hashlib
import logging
import os
from collections.abc import Awaitable
from dataclasses import dataclass
from typing import Callable
from zoneinfo import ZoneInfo

from net import request_json

logger = logging.getLogger("neeraj-agent.cal")

BASE = "https://api.cal.com/v2"
SLOTS_API_VERSION = "2024-09-04"
BOOKINGS_API_VERSION = "2024-08-13"

# (status, json) tuple, like http.request_json.
Transport = Callable[..., Awaitable[tuple[int, dict]]]

_EVENT_TITLES = {
    "hire": "Project / hire call with Neeraj",
    "mentor": "Career / mentorship call with Neeraj",
}

# Both event types require custom booking fields. We fill them from what the
# agent already captured plus safe defaults, so booking stays a smooth two-step
# (pick a time, give name + email) instead of an interrogation.
_HIRE_SOURCES = {"X (Twitter)", "LinkedIn", "Referral", "Search", "Other"}
_MENTOR_LEVELS = {"Student", "Early Career", "Mid Level / Senior"}
_TBD = "Will share on the call"


def _booking_field_responses(
    intent: str,
    *,
    company: str | None,
    building: str | None,
    source: str | None,
    level: str | None,
    link: str | None,
) -> dict:
    if intent == "mentor":
        return {
            "Your-level": level if level in _MENTOR_LEVELS else "Early Career",
            "What-do-you-want-to-dig-into": building or _TBD,
            "linkedin-or-portfolio": link or "https://hineeraj.com",
        }
    return {
        "company-project": company or _TBD,
        "What-are-you-building": building or _TBD,
        "Where-did-you-find-me": source if source in _HIRE_SOURCES else "Other",
    }


class CalError(Exception):
    """Cal.com returned an error we could not turn into a booking."""


class SlotUnavailableError(CalError):
    """The chosen slot was taken between listing and booking."""


@dataclass(frozen=True)
class AvailableSlot:
    start_time: datetime.datetime  # timezone-aware
    duration_min: int

    @property
    def start_iso(self) -> str:
        return self.start_time.isoformat()

    @property
    def slot_id(self) -> str:
        """Short stable id the LLM references when confirming a slot."""
        return hashlib.blake2s(self.start_iso.encode(), digest_size=4).hexdigest()


@dataclass(frozen=True)
class BookingResult:
    start_iso: str
    event_title: str
    attendee_email: str
    cal_event_link: str | None = None
    add_to_calendar_url: str | None = None


def cal_available() -> bool:
    return bool(os.getenv("CAL_API_KEY"))


def parse_slots(
    data: dict, *, duration_min: int, tz: datetime.tzinfo, limit: int | None = None
) -> list[AvailableSlot]:
    """Flatten Cal's date-keyed slot map into a sorted list of AvailableSlot.

    Defensive: tolerates the documented `{data: {date: [{start}]}}` shape and the
    alternative `{data: {slots: {...}}}` nesting; ignores malformed entries.
    """
    payload = data.get("data", data)
    if (
        isinstance(payload, dict)
        and "slots" in payload
        and isinstance(payload["slots"], dict)
    ):
        payload = payload["slots"]
    slots: list[AvailableSlot] = []
    if isinstance(payload, dict):
        for _date, entries in payload.items():
            if not isinstance(entries, list):
                continue
            for entry in entries:
                start = entry.get("start") if isinstance(entry, dict) else None
                if not start:
                    continue
                try:
                    dt = datetime.datetime.fromisoformat(start)
                except ValueError:
                    logger.warning("cal.slot_parse_skip start=%r", start)
                    continue
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=tz)
                slots.append(
                    AvailableSlot(
                        start_time=dt.astimezone(tz), duration_min=duration_min
                    )
                )
    slots.sort(key=lambda s: s.start_time)
    return slots[:limit] if limit else slots


class CalClient:
    def __init__(
        self,
        api_key: str,
        *,
        tz: str = "Asia/Kolkata",
        event_type_ids: dict[str, int],
        duration_min: int = 30,
        transport: Transport | None = None,
    ) -> None:
        self._api_key = api_key
        self._tzname = tz
        self._tz = ZoneInfo(tz)
        self._event_type_ids = event_type_ids
        self._duration_min = duration_min
        self._transport = transport or request_json

    @classmethod
    def from_env(cls, *, transport: Transport | None = None) -> CalClient | None:
        key = os.getenv("CAL_API_KEY")
        if not key:
            return None
        try:
            ids = {
                "hire": int(os.environ["CAL_EVENT_TYPE_HIRE"]),
                "mentor": int(os.environ["CAL_EVENT_TYPE_MENTOR"]),
            }
        except (KeyError, ValueError):
            logger.error("cal.from_env missing/invalid CAL_EVENT_TYPE_HIRE/MENTOR")
            return None
        return cls(
            key,
            tz=os.getenv("CAL_TIMEZONE", "Asia/Kolkata"),
            event_type_ids=ids,
            transport=transport,
        )

    def _event_type_id(self, intent: str) -> int:
        try:
            return self._event_type_ids[intent]
        except KeyError as e:
            raise CalError(f"unknown booking intent: {intent!r}") from e

    def _headers(self, api_version: str) -> dict:
        return {
            "Authorization": f"Bearer {self._api_key}",
            "cal-api-version": api_version,
            "Content-Type": "application/json",
        }

    async def list_slots(
        self, intent: str, *, days: int = 7, limit: int = 6
    ) -> list[AvailableSlot]:
        event_id = self._event_type_id(intent)
        now = datetime.datetime.now(self._tz)
        start = now.date().isoformat()
        end = (now + datetime.timedelta(days=days)).date().isoformat()
        status, data = await self._transport(
            "GET",
            f"{BASE}/slots",
            headers=self._headers(SLOTS_API_VERSION),
            params={
                "eventTypeId": event_id,
                "start": start,
                "end": end,
                "timeZone": self._tzname,
            },
        )
        if status >= 400:
            raise CalError(f"slots request failed status={status} body={data}")
        return parse_slots(
            data, duration_min=self._duration_min, tz=self._tz, limit=limit
        )

    async def create_booking(
        self,
        intent: str,
        slot: AvailableSlot,
        *,
        name: str,
        email: str,
        notes: str | None = None,
        company: str | None = None,
        building: str | None = None,
        source: str | None = None,
        level: str | None = None,
        link: str | None = None,
    ) -> BookingResult:
        event_id = self._event_type_id(intent)
        body: dict = {
            "start": slot.start_iso,
            "eventTypeId": event_id,
            "attendee": {"name": name, "email": email, "timeZone": self._tzname},
            # Both event types require custom fields; fill them so the booking
            # is accepted without making the visitor answer a form by voice.
            "bookingFieldsResponses": _booking_field_responses(
                intent,
                company=company,
                building=building or notes,
                source=source,
                level=level,
                link=link,
            ),
        }
        if notes:
            body["metadata"] = {"notes": notes[:500]}
        status, data = await self._transport(
            "POST",
            f"{BASE}/bookings",
            headers=self._headers(BOOKINGS_API_VERSION),
            json_body=body,
        )
        if status >= 400:
            message = str(data).lower()
            if any(
                m in message
                for m in (
                    "already has booking",
                    "no longer available",
                    "not available",
                    "no_available_users",
                    "host either has",
                )
            ):
                raise SlotUnavailableError(f"slot taken: {data}")
            raise CalError(f"booking failed status={status} body={data}")

        booking = data.get("data", data) if isinstance(data, dict) else {}
        return BookingResult(
            start_iso=slot.start_iso,
            event_title=booking.get("title")
            or _EVENT_TITLES.get(intent, "Call with Neeraj"),
            attendee_email=email,
            cal_event_link=booking.get("meetingUrl") or booking.get("location"),
            add_to_calendar_url=None,
        )
