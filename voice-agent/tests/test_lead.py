"""Lead accumulation and actionability."""

from lead import Lead


def test_update_normalizes_and_skips_empty():
    lead = Lead()
    lead.update(name="  Jane  ", email="", company=None, intent="hire")
    assert lead.name == "Jane"
    assert lead.email is None  # empty string ignored
    assert lead.company is None
    assert lead.intent == "hire"


def test_update_ignores_unknown_fields():
    lead = Lead()
    lead.update(bogus="x", name="Jane")  # type: ignore[arg-type]
    assert lead.name == "Jane"
    assert not hasattr(lead, "bogus")


def test_is_actionable():
    assert Lead().is_actionable() is False
    assert Lead(email="a@b.com").is_actionable() is True
    assert Lead(phone="+91999").is_actionable() is True
    assert Lead(outcome="booked_call").is_actionable() is True
    assert Lead(outcome="callback_requested").is_actionable() is True
    assert Lead(outcome="browsing").is_actionable() is False


def test_as_row_shape():
    row = Lead(name="Jane", email="jane@acme.com", outcome="sent_message").as_row()
    assert row[0] == "Jane"
    assert row[1] == "jane@acme.com"
    assert "sent_message" in row
    assert len(row) == 8
