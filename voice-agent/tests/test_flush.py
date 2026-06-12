"""End-of-call session flush: ALWAYS logs the conversation to the Sheet, and
additionally emails Neeraj when the lead is actionable. Skips truly empty calls."""

import types

import agent as agent_mod
from kb import load_kb
from lead import Lead, Userdata


def _item(role: str, text: str):
    return types.SimpleNamespace(role=role, text_content=text)


def _session(lead: Lead, notifier, items=None):
    return types.SimpleNamespace(
        userdata=Userdata(kb=load_kb(), notifier=notifier, lead=lead),
        history=types.SimpleNamespace(items=items or []),
    )


class FakeNotifier:
    def __init__(self):
        self.logged = []
        self.emailed = []

    async def log_session(self, lead, *, summary, transcript, room, when):
        self.logged.append(
            {
                "lead": lead,
                "summary": summary,
                "transcript": transcript,
                "room": room,
                "when": when,
            }
        )
        return True

    async def send_lead(self, lead, *, summary, room):
        self.emailed.append({"lead": lead, "room": room})
        return "email"


async def test_flush_logs_every_conversation_to_sheet():
    # A browser who left no contact info but DID talk still gets a Sheet row,
    # and is NOT emailed (not actionable).
    n = FakeNotifier()
    session = _session(
        Lead(intent="hire"),
        n,
        items=[_item("user", "what have you built?"), _item("assistant", "lots")],
    )
    await agent_mod._flush_session(session, "room-1")
    assert len(n.logged) == 1
    assert n.logged[0]["room"] == "room-1"
    assert "Visitor: what have you built?" in n.logged[0]["transcript"]
    assert "Neeraj: lots" in n.logged[0]["transcript"]
    assert n.emailed == []  # not actionable -> no email
    assert session.userdata.lead_flushed is True


async def test_flush_emails_actionable_and_logs():
    n = FakeNotifier()
    session = _session(
        Lead(name="Jane", email="jane@acme.com", outcome="booked_call"),
        n,
        items=[_item("user", "book me in")],
    )
    await agent_mod._flush_session(session, "room-2")
    assert len(n.logged) == 1  # always logged
    assert len(n.emailed) == 1  # and emailed
    assert n.emailed[0]["lead"].email == "jane@acme.com"


async def test_flush_skips_truly_empty_call():
    n = FakeNotifier()
    session = _session(Lead(), n, items=[])  # no contact, no transcript
    await agent_mod._flush_session(session, "room-3")
    assert n.logged == []
    assert n.emailed == []
    assert session.userdata.lead_flushed is False


async def test_flush_is_idempotent():
    n = FakeNotifier()
    session = _session(
        Lead(email="a@b.com", outcome="booked_call"),
        n,
        items=[_item("user", "hi")],
    )
    await agent_mod._flush_session(session, "r")
    await agent_mod._flush_session(session, "r")
    assert len(n.logged) == 1
    assert len(n.emailed) == 1
