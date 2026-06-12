"""Notifier (Resend email) + the always-on Sheet session log, all stubbed (no
real network)."""

from lead import Lead
from notify import SESSION_LOG_HEADER, Notifier
from sheets import SheetsClient


class Rec:
    def __init__(self, status, body=None):
        self.status = status
        self.body = body or {}
        self.calls: list[dict] = []

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
        return (self.status, self.body)


async def test_unconfigured_notifier_returns_none():
    n = Notifier(api_key=None, from_addr=None, to_addr=None)
    assert n.configured() is False
    assert await n.send_lead(Lead(email="a@b.com"), summary="hi", room="r1") == "none"


async def test_send_lead_email_ok():
    t = Rec(200, {"id": "e1"})
    n = Notifier(api_key="k", from_addr="from@x", to_addr="to@x", transport=t)
    res = await n.send_lead(
        Lead(name="Jane", email="jane@acme.com", outcome="booked_call"),
        summary="wants a voice agent",
        room="r1",
    )
    assert res == "email"
    call = t.calls[0]
    assert call["url"].endswith("/emails")
    assert call["headers"]["Authorization"] == "Bearer k"
    assert call["json_body"]["from"] == "from@x"
    assert call["json_body"]["to"] == ["to@x"]
    assert call["json_body"]["reply_to"] == "jane@acme.com"


async def test_send_lead_is_email_only_no_sheet_write():
    # send_lead no longer falls back to the Sheet (the Sheet record is written
    # separately by log_session for EVERY session). On email failure it returns
    # "none" and never touches the sheet transport.
    email_t = Rec(400, {"error": "bad"})
    sheet_t = Rec(200, {})

    async def token():
        return "tok"

    sheets = SheetsClient(
        service_account_email="sa@x",
        private_key="key",
        sheet_id="sid",
        transport=sheet_t,
        token_fn=token,
    )
    n = Notifier(
        api_key="k", from_addr="f", to_addr="t", sheets=sheets, transport=email_t
    )
    res = await n.send_lead(
        Lead(name="Jane", email="jane@acme.com"), summary="s", room="r1"
    )
    assert res == "none"
    assert sheet_t.calls == []  # email-only: the sheet is never appended here


async def _sheets(transport):
    async def token():
        return "tok"

    return SheetsClient(
        service_account_email="sa@x",
        private_key="key",
        sheet_id="sid",
        transport=transport,
        token_fn=token,
    )


async def test_log_session_appends_full_row():
    sheet_t = Rec(200, {})
    n = Notifier(
        api_key=None,
        from_addr=None,
        to_addr=None,
        sheets=await _sheets(sheet_t),
    )
    lead = Lead(
        name="Jane",
        email="jane@acme.com",
        phone="+919876543210",
        company="Acme",
        intent="hire",
        qualification="hot",
        outcome="booked_call",
        wants="voice agent",
    )
    ok = await n.log_session(
        lead,
        summary="wants a voice agent",
        transcript="Visitor: hi\nNeeraj: hey",
        room="room-1",
        when="2026-06-12 18:00 IST",
    )
    assert ok is True
    row = sheet_t.calls[0]["json_body"]["values"][0]
    # Column order matches SESSION_LOG_HEADER: when, *lead.as_row(), summary, room, transcript.
    assert len(row) == len(SESSION_LOG_HEADER)
    assert row[0] == "2026-06-12 18:00 IST"
    assert row[1] == "Jane"
    assert row[2] == "jane@acme.com"
    assert row[3] == "+919876543210"
    assert row[7] == "booked_call"
    assert row[9] == "wants a voice agent"
    assert row[10] == "room-1"
    assert row[11] == "Visitor: hi\nNeeraj: hey"


async def test_log_session_truncates_long_transcript():
    sheet_t = Rec(200, {})
    n = Notifier(
        api_key=None, from_addr=None, to_addr=None, sheets=await _sheets(sheet_t)
    )
    huge = "x" * 60000
    await n.log_session(Lead(name="A"), summary="", transcript=huge, room="r", when="t")
    assert len(sheet_t.calls[0]["json_body"]["values"][0][11]) == 45000


async def test_log_session_without_sheet_returns_false():
    n = Notifier(api_key="k", from_addr="f", to_addr="t")
    ok = await n.log_session(
        Lead(name="A", email="a@b.com"),
        summary="s",
        transcript="t",
        room="r",
        when="w",
    )
    assert ok is False


async def test_send_callback_email():
    t = Rec(200, {"id": "e"})
    n = Notifier(api_key="k", from_addr="f", to_addr="t", transport=t)
    res = await n.send_callback(name="Jane", phone="+91999", reason="urgent", room="r1")
    assert res == "email"
    assert "callback" in t.calls[0]["json_body"]["subject"].lower()


async def test_send_contact_sets_reply_to():
    t = Rec(200, {"id": "e"})
    n = Notifier(api_key="k", from_addr="f", to_addr="t", transport=t)
    ok = await n.send_contact(
        name="Jane", email="jane@acme.com", intent="hire", message="hello there"
    )
    assert ok is True
    assert t.calls[0]["json_body"]["reply_to"] == "jane@acme.com"


def test_sheets_configured():
    assert (
        SheetsClient(service_account_email="", private_key="", sheet_id="").configured()
        is False
    )
    assert (
        SheetsClient(
            service_account_email="a", private_key="b", sheet_id="c"
        ).configured()
        is True
    )


async def test_sheets_append_unconfigured_noop():
    assert (
        await SheetsClient(
            service_account_email="", private_key="", sheet_id=""
        ).append_row(["x"])
        is False
    )
